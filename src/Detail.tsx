import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, MapPin, Users, Plug, Volume2, Snowflake, IdCard, Utensils, Sun, MessageCircle, DoorOpen, BookOpen, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { asset, dataset, spaces } from './data'
import { lightLabels, outletLabels, relatedSpaces, seatsLabel } from './filter'
import SpaceCard from './SpaceCard'
import type { Space } from './types'

export default function Detail({ space: s, onFocus, compared, onCompare }: { space: Space; onFocus: (s: Space) => void; compared: string[]; onCompare: (id: string) => void }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const photo = s.photos[photoIndex] ?? s.photos[0]
  const issues = dataset.qualityIssues.filter(i => s.issueIds.includes(i.id))
  const location = s.location.coordinates
  const fields = [
    { name: '席位', icon: Users, value: seatsLabel(s.seats), detail: s.seats.areas.map(a=>`${a.label}：${seatsLabel(a)}`).join('；') },
    { name: '插座', icon: Plug, value: outletLabels[s.outlets.coverage], detail: `${s.outlets.knownSeats !== null ? `${s.outlets.estimated ? '約 ' : ''}${s.outlets.knownSeats} 席可使用${s.outlets.location ? '；' : ''}` : ''}${s.outlets.location ?? ''}` || s.raw['插座'] },
    { name: '安靜程度', icon: Volume2, value: s.quietness.level, detail: `可能聲音：${s.quietness.noiseSources.join('、')}${s.quietness.note ? `。${s.quietness.note}` : ''}` },
    { name: '討論規範', icon: MessageCircle, value: s.quietness.discussionOriginal, detail: s.quietness.note ?? '依原始紀錄，請尊重現場使用者。' },
    { name: '空間開放程度', icon: DoorOpen, value: s.openness, detail: s.raw['空間開放程度'] },
    { name: '學生證要求', icon: IdCard, value: s.studentCardRequired ? '需要學生證' : '不需要學生證', detail: s.id==='s09' ? '需抵押學生證並換取置物櫃鑰匙。' : s.id==='s01' ? '進入館內需刷學生證入閘門。' : '依原始紀錄' },
    { name: '空調與風扇', icon: Snowflake, value: `${s.climate.airConditioning ? '有空調' : '無空調'} · ${s.climate.fan ? '有風扇' : '無風扇'}`, detail: s.climate.note ?? '設備狀況依紀錄，並非即時運轉狀態。' },
    { name: '飲食', icon: Utensils, value: s.foodAllowed ? '可以飲食' : '禁止飲食', detail: s.raw['飲食'] },
    { name: '光線相關', icon: Sun, value: lightLabels[s.lighting.indoorAdequacy], detail: `${s.raw['光線相關']}${s.lighting.independentLighting === null ? '；獨立照明未記載。' : ''}` },
  ]
  return <main className="detail-page" id="main-content" tabIndex={-1}>
    <div className="detail-topline"><a className="back-link" href="#/"><ArrowLeft size={16}/>返回探索</a><span>紀錄 {s.id.slice(1)} / {spaces.length} · PDF 第 {s.source.pages.join('、')} 頁</span></div>
    <div className="detail-heading"><div className="eyebrow">找到一個適合你的讀書角落</div><h1>{s.name.replaceAll('–',' · ')}</h1><p><MapPin size={16}/>{s.building} · {s.floor}</p><div className="detail-links"><a className="button primary" href={s.location.officialMapUrl} target="_blank" rel="noopener noreferrer">在臺大官方校園地圖查看<ArrowUpRight size={16}/></a><button className="button secondary" onClick={()=>onFocus(s)}><MapPin size={16}/>在探索地圖定位</button></div>{s.issueIds.includes('wrong-map-key') && <p className="inline-warning"><AlertCircle size={16}/>原始地圖網址指向總圖書館，已列為待確認。<a href={`https://map.ntu.edu.tw/index.html?layer=build&uid=${location?.buildingUid}`} target="_blank" rel="noopener noreferrer">查看已核對的建築位置 ↗</a></p>}</div>
    <div className="detail-hero">
      <div className="gallery"><div className="gallery-main"><img src={asset(photo.src)} alt={photo.alt}/>{s.photos.length>1 && <><button className="gallery-prev" aria-label="上一張照片" onClick={()=>setPhotoIndex((photoIndex+s.photos.length-1)%s.photos.length)}><ChevronLeft size={20}/></button><button className="gallery-next" aria-label="下一張照片" onClick={()=>setPhotoIndex((photoIndex+1)%s.photos.length)}><ChevronRight size={20}/></button></>}</div><div className="gallery-caption"><span>PDF 原始照片 · 第 {photo.sourcePage} 頁</span><span>{photoIndex+1} / {s.photos.length}</span></div>{s.photos.length>1 && <div className="gallery-thumbnails">{s.photos.map((p,i)=><button key={p.src} aria-label={`查看照片 ${i+1}`} aria-pressed={photoIndex===i} onClick={()=>setPhotoIndex(i)}><img src={asset(p.src)} alt={p.alt}/></button>)}</div>}</div>
      <aside className="detail-summary"><BookOpen size={25}/><h2>使用前，先知道</h2><div className="detail-big-seats">{seatsLabel(s.seats)}</div><p className="muted">紀錄總席位 · {s.seats.estimated ? '包含估算值' : '依 PDF 記載'}<br/>此數值不代表目前空位。</p><div className="summary-line"><span>安靜程度</span><span className={`quiet-badge static quiet-${s.quietness.level}`}>{s.quietness.level}</span></div><div className="summary-line"><span>飲食規範</span><strong>{s.foodAllowed ? '可以飲食' : '禁止飲食'}</strong></div><div className="summary-line"><span>學生證</span><strong>{s.studentCardRequired ? '需要' : '不需要'}</strong></div>{s.location.entranceNote && <div className="entrance-highlight"><DoorOpen size={18}/><div><strong>進入方式</strong><p>{s.location.entranceNote}</p></div></div>}{s.climate.note && <div className="entrance-highlight"><AlertCircle size={18}/><p>{s.climate.note}</p></div>}{s.id==='s08' && <div className="entrance-highlight"><AlertCircle size={18}/><p>遇場地外借時不開放。請查看當天入口公告；「週一不開放外借」不等於自習開放時間。</p></div>}</aside>
    </div>
    <section className="metadata-section"><div className="section-heading"><div><div className="eyebrow">環境與使用條件</div><h2>空間 Metadata</h2></div><span>依原始紀錄完整呈現</span></div><dl className="metadata-grid">{fields.map(f=><div className="metadata-cell" key={f.name}><dt><f.icon size={18}/>{f.name}</dt><dd><strong>{f.value}</strong><p>{f.detail}</p></dd></div>)}</dl></section>
    <section className="notes-section"><h2>進入方式與其他說明</h2>{s.location.entranceNote && <p className="source-text">{s.location.entranceNote}</p>}<p className="source-text">{s.description || '原始紀錄未提供其他說明。'}</p>{s.id==='s08' && <p><a href={s.externalLinks[0]?.url} target="_blank" rel="noopener noreferrer">原始場地租借狀況查詢連結 ↗</a><span className="muted">（PDF 原始超連結；顯示文字與日期格式有差異，且只查詢固定日期）</span></p>}<div className="recorder-line">記錄者：<strong>{s.recorder}</strong><span>·</span>資料來源：課程 PDF，非即時場地系統</div></section>
    {issues.length>0 && <section className="detail-issues"><h2><AlertCircle size={19}/>這筆資料的待確認事項</h2>{issues.map(i=><div key={i.id}><strong>{i.category}｜{i.description}</strong><p>{i.resolution}</p></div>)}</section>}
    <details className="raw-metadata"><summary>查看原始 13 個 Metadata 元件</summary><p className="muted">保留 PDF 用字、換行與空白欄位；照片在上方逐張呈現。</p><dl>{Object.entries(s.raw).map(([k,v])=><div key={k}><dt>{k}</dt><dd className="source-text">{v || '（原始欄位留白）'}</dd></div>)}</dl><p className="coordinate-note">地圖定位來源：<a href={dataset.source.coordinateSource} target="_blank" rel="noopener noreferrer">臺大官方 WFS 建築圖資（EPSG:4326） ↗</a>；{location?.method}。定位為建築物層級，請依進入說明尋找樓層與入口。</p></details>
    <section className="related-section"><div className="section-heading"><div><div className="eyebrow">繼續探索校園</div><h2>同棟或條件相似的空間</h2></div></div><div className="related-grid">{relatedSpaces(s,spaces).map(({space})=><SpaceCard key={space.id} space={space} onFocus={onFocus} compared={compared.includes(space.id)} onCompare={onCompare}/>)}</div></section>
  </main>
}
