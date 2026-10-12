import { SlidersHorizontal, RotateCcw, ChevronDown, Check } from 'lucide-react'
import { filterCount } from './filter'
import type { Filters as FilterValues } from './types'

export default function Filters({ value, onChange, onReset, onConfirm, appliedCount, pending, mobileOpen }: { value: FilterValues; onChange: (value: FilterValues) => void; onReset: () => void; onConfirm: () => void; appliedCount: number; pending: boolean; mobileOpen: boolean }) {
  const set = <K extends keyof FilterValues>(key: K, v: FilterValues[K]) => onChange({ ...value, [key]: v })
  const select = (key: keyof FilterValues, label: string, options: [string,string][]) => <label className="filter-field" key={key}><span>{label}</span><div className="select-wrap"><select value={String(value[key])} onChange={e => set(key, e.target.value as never)} aria-label={label}><option value="">不限</option>{options.map(([v,text]) => <option key={v} value={v}>{text}</option>)}</select><ChevronDown size={14}/></div></label>
  return <aside className={`filters-panel ${mobileOpen ? 'mobile-open' : ''}`} aria-label="Metadata 條件篩選" id="filters-panel">
    <div className="filter-title"><div><SlidersHorizontal size={18}/><h2>條件篩選</h2>{filterCount(value)>0 && <span className="count-badge">{filterCount(value)}</span>}</div><button className="reset-link" onClick={onReset} title="清除全部篩選"><RotateCcw size={13}/>清除</button></div>
    <p className="filter-caption">選好條件後，按「確定」套用</p>
    <div className="filter-scroll">
      <fieldset className="quiet-filter"><legend>安靜程度</legend><div className="quiet-options">{(['','高','中','低'] as const).map(q => <button key={q} type="button" aria-pressed={value.quietness===q} className={value.quietness===q ? 'selected' : ''} onClick={() => set('quietness', q)}>{q || '不限'}</button>)}</div></fieldset>
      {select('outlets','插座',[['available','有插座（全部或部分座位）'],['all','全部座位可使用'],['partial','部分座位可使用'],['none','無插座']])}
      {select('openness','空間開放程度',[['室內獨立空間','室內獨立空間'],['室內開放空間','室內開放空間'],['半室內','半室內']])}
      {select('studentCard','學生證要求',[['yes','需要學生證'],['no','不需要學生證']])}
      <div className="filter-divider"/>
      <h3 className="filter-group-label">設備與使用規範</h3>
      <div className="climate-filters">
        {select('airConditioning','空調',[['yes','有空調'],['no','無空調']])}
        {select('fan','風扇',[['yes','有風扇'],['no','無風扇']])}
      </div>
      {select('food','飲食規範',[['yes','可以飲食'],['no','禁止飲食']])}
      {select('discussion','討論規範',[['allowed','允許討論'],['not-prohibited','未明確禁止討論'],['prohibited','不開放討論']])}
      <div className="filter-divider"/>
      <h3 className="filter-group-label">光線與席位</h3>
      {select('indoorLight','室內照明',[['sufficient','室內照明充足'],['insufficient','室內照明不充足'],['none','無室內照明'],['unknown','照明資料待確認']])}
      <label className="check-field"><input type="checkbox" checked={value.naturalLight} onChange={e => set('naturalLight',e.target.checked)}/><span>受自然光影響</span></label>
      <label className="check-field"><input type="checkbox" checked={value.independentLight} onChange={e => set('independentLight',e.target.checked)}/><span>設有獨立照明設備</span></label>
      <label className="filter-field min-seats"><span>最低紀錄席位數</span><div className="number-wrap"><input type="number" min="0" max="1000" step="1" value={value.minSeats || ''} placeholder="不限" aria-label="最低紀錄席位數" onChange={e => set('minSeats',Math.max(0,Math.floor(Number(e.target.value)||0)))}/><span>席以上</span></div></label>
      <p className="filter-footnote">各條件以 AND 組合。估算範圍以較低值篩選；未提供或矛盾資料不視為「無」。</p>
    </div>
    <div className="filter-actions">
      <p className="filter-status" role="status">已套用 {appliedCount} 項條件{pending ? `；已選 ${filterCount(value)} 項，尚未套用` : ''}</p>
      <button className="button primary confirm-filters" onClick={onConfirm}><Check size={16}/>確定</button>
      <button className="clear-all" onClick={onReset}><RotateCcw size={15}/>清除全部篩選</button>
    </div>
  </aside>
}
