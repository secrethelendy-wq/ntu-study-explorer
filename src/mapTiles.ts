import type { TileLayerOptions } from 'leaflet'

export const osmTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const osmTileOptions: TileLayerOptions = {
  maxZoom: 19,
  referrerPolicy: 'strict-origin-when-cross-origin',
  updateWhenIdle: true,
  updateWhenZooming: false,
  keepBuffer: 2,
  detectRetina: false,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> 貢獻者',
}

// Local files cannot supply an HTTP Referer. Never request public OSM tiles
// from file:// or another opaque origin; the map needs an HTTP(S) server.
export const canRequestTiles = (protocol: string) => protocol === 'http:' || protocol === 'https:'
