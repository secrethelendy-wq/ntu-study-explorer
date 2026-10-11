import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { LocateFixed, MapPin, RefreshCw } from 'lucide-react'
import { asset } from './data'
import { outletLabels, seatsLabel } from './filter'
import type { Space } from './types'
import { canRequestTiles, osmTileOptions, osmTileUrl } from './mapTiles'

export interface FocusRequest { id: string; serial: number }
export function groupSpaces(data: Space[]) {
  const groups = new Map<string, Space[]>()
  for (const s of data) {
    if (!s.location.coordinates) continue
    const key = s.location.coordinates.buildingUid
    groups.set(key, [...(groups.get(key) ?? []), s])
  }
  return groups
}

export default function CampusMap({ spaces, selected, focus, onSelect }: { spaces: Space[]; selected: string | null; focus: FocusRequest | null; onSelect: (id: string) => void }) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const markers = useRef(new Map<string, L.Marker>())
  const layer = useRef<L.LayerGroup | null>(null)
  const onSelectRef = useRef(onSelect)
  const tiles = useRef<L.TileLayer | null>(null)
  const [tileError, setTileError] = useState(false)
  const httpOrigin = canRequestTiles(window.location.protocol)
  onSelectRef.current = onSelect

  useEffect(() => {
    if (!container.current) return
    const m = L.map(container.current, { center: [25.0173, 121.5399], zoom: 16, minZoom: 13, maxZoom: 19, zoomControl: false, scrollWheelZoom: true })
    map.current = m
    const writeState = () => {
      m.getContainer().dataset.zoom = String(m.getZoom())
      m.getContainer().dataset.center = `${m.getCenter().lat},${m.getCenter().lng}`
    }
    writeState()
    m.on('moveend zoomend', writeState)
    L.control.zoom({ position: 'bottomright' }).addTo(m)
    if (httpOrigin) {
      const t = L.tileLayer(osmTileUrl, osmTileOptions).addTo(m)
      tiles.current = t
      let failures = 0
      t.on('tileerror', () => { failures++; if (failures >= 3) setTileError(true) })
      t.on('tileload', () => { failures = 0; setTileError(false) })
    }
    layer.current = L.layerGroup().addTo(m)
    const observer = new ResizeObserver(() => { m.invalidateSize({ pan: false }) })
    observer.observe(container.current)
    return () => { observer.disconnect(); m.remove(); map.current = null; layer.current = null }
  }, [])

  useEffect(() => {
    if (!map.current || !layer.current) return
    layer.current.clearLayers()
    markers.current.clear()
    for (const group of groupSpaces(spaces).values()) {
      const first = group[0]
      const c = first.location.coordinates!
      const active = group.some(s => s.id === selected)
      const level = group.length > 1 ? 'group' : first.quietness.level === '高' ? 'high' : first.quietness.level === '中' ? 'medium' : 'low'
      const icon = L.divIcon({ className: 'study-marker-container', html: `<span class="study-marker ${level} ${active ? 'active' : ''}">${group.length > 1 ? group.length : '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5c3-1 5 0 8 2 3-2 5-3 8-2v14c-3-1-5 0-8 2-3-2-5-3-8-2z"/><path d="M12 7v14"/></svg>'}</span>`, iconSize: [38,44], iconAnchor: [19,40], popupAnchor: [0,-38] })
      const marker = L.marker([c.latitude,c.longitude], { icon, keyboard: true, title: group.length > 1 ? `${first.building}，${group.length} 個自習空間` : first.name, alt: first.building })
      const popup = document.createElement('div')
      popup.className = 'map-popup'
      const h = document.createElement('p'); h.className = 'popup-building'; h.textContent = group.length > 1 ? `${first.building} · ${group.length} 個空間` : '自習空間'; popup.append(h)
      for (const s of group) {
        const item = document.createElement('div'); item.className = 'popup-space'
        const img = document.createElement('img'); img.src = asset(s.photos[0].src); img.alt = s.photos[0].alt; img.loading = 'lazy'; item.append(img)
        const heading = document.createElement('a'); heading.href = `#/space/${s.id}`; heading.className = 'popup-name'; heading.textContent = s.name; item.append(heading)
        const info = document.createElement('p'); info.textContent = `${seatsLabel(s.seats)} · 安靜程度${s.quietness.level}`; item.append(info)
        const equipment = document.createElement('p'); equipment.textContent = `${outletLabels[s.outlets.coverage]} · ${s.climate.airConditioning ? '有空調' : '無空調'}${s.climate.fan ? ' · 有風扇' : ''}`; item.append(equipment)
        const link = document.createElement('a'); link.href = `#/space/${s.id}`; link.className = 'popup-detail'; link.textContent = '查看完整資訊 →'; item.append(link)
        const official = document.createElement('a'); official.href = s.location.officialMapUrl; official.target = '_blank'; official.rel = 'noopener noreferrer'; official.className = 'popup-official'; official.textContent = '在臺大官方校園地圖查看 ↗'; item.append(official)
        popup.append(item)
      }
      marker.bindPopup(popup, { maxWidth: 285, minWidth: 230, maxHeight: 390, autoPanPaddingTopLeft: [20,65] })
      marker.on('click', () => onSelectRef.current(first.id))
      marker.addTo(layer.current)
      for (const s of group) markers.current.set(s.id, marker)
    }
  }, [spaces])

  useEffect(() => {
    const selectedBuilding = spaces.find(s => s.id === selected)?.location.coordinates?.buildingUid
    for (const [id, marker] of markers.current) {
      const building = spaces.find(s => s.id === id)?.location.coordinates?.buildingUid
      marker.getElement()?.querySelector('.study-marker')?.classList.toggle('active', !!selectedBuilding && building === selectedBuilding)
    }
  }, [selected, spaces])

  useEffect(() => {
    if (!focus || !map.current) return
    const marker = markers.current.get(focus.id)
    if (marker) {
      map.current.flyTo(marker.getLatLng(), 18, { duration: 0.65, animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches })
      marker.openPopup()
    }
  }, [focus, spaces])

  function reset() {
    const m = map.current
    if (!m) return
    const points = spaces.flatMap(s => s.location.coordinates ? [[s.location.coordinates.latitude, s.location.coordinates.longitude] as [number,number]] : [])
    if (points.length) m.fitBounds(L.latLngBounds(points), { padding: [65,65], maxZoom: 17 })
    else m.setView([25.0173,121.5399],16)
  }

  return <section className="campus-map" aria-label="臺大校園互動地圖">
    <div ref={container} className="leaflet-host" data-testid="campus-map" aria-label="拖曳探索校園，使用加減按鈕縮放，按 Enter 開啟地圖標記" />
    <div className="map-heading"><MapPin size={17}/><span>臺大校總區</span><span className="map-heading-note">建築物定位</span></div>
    <button className="map-reset" onClick={reset} title="顯示所有符合條件的空間"><LocateFixed size={18}/>顯示結果範圍</button>
    <div className="map-legend" aria-label="地圖圖釘說明"><span><i className="legend-dot high"/>高</span><span><i className="legend-dot medium"/>中</span><span><i className="legend-dot low"/>低</span><span className="legend-group">數字 = 同棟空間</span></div>
    {!httpOrigin && <div className="map-error" role="status">直接開啟本機檔案無法提供地圖來源識別。請先雙擊專案的「啟動網站.cmd」，再<a href="http://127.0.0.1:4173/">開啟 HTTP 預覽 ↗</a>。</div>}
    {tileError && <div className="map-error" role="status">底圖暫時無法載入，圖釘與列表仍可使用。<button onClick={() => { setTileError(false); tiles.current?.redraw() }}><RefreshCw size={14}/>重新載入</button></div>}
    {!spaces.length && <div className="map-empty">沒有符合條件的空間，試著減少篩選條件。</div>}
  </section>
}
