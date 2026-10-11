import { useEffect, useRef } from 'react'
import { X, ArrowUpRight } from 'lucide-react'
import { asset } from './data'
import { discussionLabels, lightLabels, outletLabels, seatsLabel } from './filter'
import type { Space } from './types'

export default function Compare({ spaces, onClose, onRemove }: { spaces: Space[]; onClose: ()=>void; onRemove: (id:string)=>void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(()=>{const d=dialog.current!; d.showModal(); return ()=>d.close()},[])
  const rows: [string,(s:Space)=>string][] = [
    ['紀錄席位',s=>seatsLabel(s.seats)],['安靜程度',s=>s.quietness.level],['插座',s=>outletLabels[s.outlets.coverage]+(s.outlets.knownSeats!==null ? `（${s.outlets.estimated?'約':''}${s.outlets.knownSeats}席）`: '')],['空間開放程度',s=>s.openness],['學生證',s=>s.studentCardRequired?'需要學生證':'不需要學生證'],['空調',s=>s.climate.airConditioning?'有空調':'無空調'],['風扇',s=>s.climate.fan?'有風扇':'無風扇'],['飲食',s=>s.foodAllowed?'可以飲食':'禁止飲食'],['室內照明',s=>lightLabels[s.lighting.indoorAdequacy]],['自然光影響',s=>s.lighting.naturalLightAffected?'受自然光影響':'不受自然光影響'],['獨立照明',s=>s.lighting.independentLighting ? s.lighting.independentScope??'有' : '未記載'],['討論規範',s=>`${discussionLabels[s.quietness.discussion]}；${s.quietness.discussionOriginal}`],['進入與特殊規定',s=>[s.location.entranceNote,s.climate.note,s.description].filter(Boolean).join('；') || '原始紀錄未提供其他說明'],
  ]
  return <dialog ref={dialog} className="compare-dialog" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}} aria-labelledby="compare-heading"><div className="dialog-header"><div><div className="eyebrow">並排看，更容易選擇</div><h2 id="compare-heading">比較自習空間</h2></div><button className="icon-button" onClick={onClose} aria-label="關閉比較"><X size={22}/></button></div>{spaces.length ? <div className="comparison-scroll"><table><thead><tr><th scope="col">條件</th>{spaces.map(s=><th scope="col" key={s.id}><img src={asset(s.photos[0].src)} alt={s.photos[0].alt}/><a href={`#/space/${s.id}`} onClick={onClose}>{s.name.replaceAll('–',' · ')}<ArrowUpRight size={14}/></a><button className="reset-link" onClick={()=>onRemove(s.id)}>移除</button></th>)}</tr></thead><tbody>{rows.map(([label,get])=><tr key={label}><th scope="row">{label}</th>{spaces.map(s=><td key={s.id}>{get(s)}</td>)}</tr>)}</tbody></table></div>:<p>請先從空間卡片加入比較。</p>}<p className="comparison-footnote">估算席位保留「約」；未記載資料不視為「無」。最多比較 3 個空間。</p></dialog>
}
