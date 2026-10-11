import { MapPin, Plug, Snowflake, IdCard, Utensils, ArrowUpRight, Check, Plus } from 'lucide-react'
import { asset } from './data'
import { outletLabels, seatsLabel } from './filter'
import type { Space } from './types'

export default function SpaceCard({ space: s, selected, compared, onFocus, onCompare }: { space: Space; selected?: boolean; compared?: boolean; onFocus: (s: Space) => void; onCompare: (id: string) => void }) {
  return <article className={`space-card ${selected ? 'is-selected' : ''}`} data-space-id={s.id} tabIndex={0} aria-label={`${s.name}，按 Enter 在地圖定位`} onKeyDown={e => { if(e.key==='Enter' && e.target===e.currentTarget) onFocus(s) }} onClick={e => { if (!(e.target as HTMLElement).closest('a,button,input')) onFocus(s) }}>
    <a href={`#/space/${s.id}`} className="card-photo-link" aria-label={`查看 ${s.name}`}><img className="card-photo" src={asset(s.photos[0].src)} alt={s.photos[0].alt} loading="lazy"/><span className={`quiet-badge quiet-${s.quietness.level}`}>安靜程度 · {s.quietness.level}</span>{s.photos.length>1 && <span className="photo-count">{s.photos.length} 張照片</span>}</a>
    <div className="card-body">
      <div className="card-location"><MapPin size={13}/><span>{s.building} · {s.floor}</span></div>
      <h3><a href={`#/space/${s.id}`}>{s.name.replaceAll('–',' · ')}<ArrowUpRight size={15}/></a></h3>
      <div className="seat-summary"><strong>{seatsLabel(s.seats)}</strong><span>紀錄席位</span></div>
      <div className="card-facts">
        <span><Plug size={14}/>{outletLabels[s.outlets.coverage]}</span>
        <span><Snowflake size={14}/>{s.climate.airConditioning ? '有空調' : '無空調'}{s.climate.fan ? ' · 有風扇' : ''}</span>
        <span><IdCard size={14}/>{s.studentCardRequired ? '需要學生證' : '不需要學生證'}</span>
        <span><Utensils size={14}/>{s.foodAllowed ? '可以飲食' : '禁止飲食'}</span>
      </div>
      {s.climate.note && <p className="card-note">{s.climate.note}</p>}
      {s.id==='s08' && <p className="card-note">遇場地外借時不開放，請查看入口公告。</p>}
      {s.id==='s09' && <p className="card-note">入館須抵押學生證、換取鑰匙並寄放包包。</p>}
      {s.issueIds.includes('lighting-conflict') && <p className="card-note">室內照明資料待確認</p>}
      <div className="card-actions"><button className="locate-button" onClick={() => onFocus(s)} disabled={!s.location.coordinates}><MapPin size={14}/>{s.location.coordinates ? '在地圖定位' : '位置待確認'}</button><button className={`compare-button ${compared ? 'compared' : ''}`} aria-pressed={!!compared} aria-label={`${compared ? '取消比較' : '加入比較'} ${s.name}`} onClick={() => onCompare(s.id)}>{compared ? <Check size={14}/> : <Plus size={14}/>}比較</button></div>
    </div>
  </article>
}
