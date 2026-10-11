import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ArrowUpRight, Map as MapIcon, List, PanelsLeftBottom, Search, X, SlidersHorizontal, ArrowRight, Volume2, Plug, MessageCircle, Info, GitCompareArrows, Leaf } from 'lucide-react'
import { dataset, spaces } from './data'
import { emptyFilters, filterCount, filterSpaces } from './filter'
import CampusMap from './CampusMap'
import FiltersPanel from './Filters'
import SpaceCard from './SpaceCard'
import Detail from './Detail'

import Compare from './Compare'
import type { Filters, Space } from './types'
import type { FocusRequest } from './CampusMap'

type View = 'split' | 'map' | 'list'
function readHash() { return window.location.hash.slice(1) || '/' }

export default function App() {
  const [route,setRoute] = useState(readHash)
  const [filters,setFilters] = useState<Filters>(emptyFilters)
  const [view,setView] = useState<View>('split')
  const [mobileFilters,setMobileFilters] = useState(false)
  const [selected,setSelected] = useState<string|null>(null)
  const [focus,setFocus] = useState<FocusRequest|null>(null)
  const [compared,setCompared] = useState<string[]>([])
  const [compareOpen,setCompareOpen] = useState(false)
  const [toast,setToast] = useState('')
  const [sort,setSort] = useState('source')
  const result = useMemo(()=>{
    const list=filterSpaces(spaces,filters)
    return sort==='seats' ? [...list].sort((a,b)=>b.seats.minimum-a.seats.minimum) : sort==='quiet' ? [...list].sort((a,b)=>['高','中','低'].indexOf(a.quietness.level)-['高','中','低'].indexOf(b.quietness.level)) : list
  },[filters,sort])
  const activeFilters=filterCount(filters)
  const buildingCount=new Set(result.flatMap(s=>s.location.coordinates ? [s.location.coordinates.buildingUid] : [])).size
  const detailSpace=route.startsWith('/space/') ? spaces.find(s=>s.id===route.split('/')[2]) : undefined

  useEffect(()=>{
    const listener=()=>{ setRoute(readHash()); window.scrollTo({top:0}); }
    window.addEventListener('hashchange',listener)
    return ()=>window.removeEventListener('hashchange',listener)
  },[])
  useEffect(()=>{
    document.title=detailSpace ? `${detailSpace.title}｜臺大自習空間探索` : '臺大自習空間探索'
    if(route!=='/') document.getElementById('main-content')?.focus({preventScroll:true})
  },[route,detailSpace])
  useEffect(()=>{ if(selected && !result.some(s=>s.id===selected))setSelected(null) },[result,selected])
  useEffect(()=>{ if(!toast)return; const t=setTimeout(()=>setToast(''),3500); return ()=>clearTimeout(t) },[toast])
  useEffect(()=>{ if(compareOpen && !compared.length)setCompareOpen(false) },[compared,compareOpen])

  function reset() { setFilters({...emptyFilters}); setSelected(null) }
  function focusSpace(s:Space) {
    if(!s.location.coordinates) {setToast('此空間位置尚待確認，請使用原始官方地圖連結。');return}
    if(route!=='/') {reset();window.location.hash='/'}
    setView('split');setSelected(s.id);setFocus({id:s.id,serial:Date.now()})
    setTimeout(()=>document.querySelector('.explorer')?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }
  function toggleCompare(id:string) {
    if(compared.includes(id))setCompared(compared.filter(x=>x!==id))
    else if(compared.length<3)setCompared([...compared,id])
    else setToast('最多比較 3 個空間，請先移除其中一個。')
  }

  return <>
    <a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus();document.getElementById('main-content')?.scrollIntoView()}}>跳至主要內容</a>
    <header className="site-header"><div className="header-inner"><a className="brand" href="#/" aria-label="臺大自習空間探索首頁"><span className="brand-icon"><BookOpen size={22}/></span><span>臺大自習空間探索<small>國立臺灣大學 · 校園讀書指南</small></span></a><nav aria-label="主要導覽"><a href="#/" className={route==='/'?'nav-active':''}><MapIcon size={16}/>探索空間</a><a href="https://map.ntu.edu.tw/" target="_blank" rel="noopener noreferrer" className="official-nav">官方校園地圖<ArrowUpRight size={15}/></a></nav></div></header>
    {detailSpace ? <Detail key={detailSpace.id} space={detailSpace} onFocus={focusSpace} compared={compared} onCompare={toggleCompare}/> : route!=='/' ? <main id="main-content" className="not-found" tabIndex={-1}><h1>找不到這筆空間紀錄</h1><a href="#/" className="button primary">返回探索首頁</a></main> : <main id="main-content" tabIndex={-1}>
      <section className="hero"><div className="hero-inner"><div className="hero-copy"><div className="eyebrow"><Leaf size={14}/>在校園裡，找到你的專注角落</div><h1>臺大自習空間<span>探索</span></h1><p>安靜讀書、帶上電腦，或與同學一起討論。<br className="desktop-break"/>從真實空間紀錄出發，找到適合今天的讀書方式。</p><div className="quick-filters" aria-label="快速篩選"><span>我想要</span><button aria-pressed={filters.quietness==='高'} onClick={()=>setFilters({...filters,quietness:filters.quietness==='高'?'':'高'})}><Volume2 size={14}/>安靜讀書</button><button aria-pressed={filters.outlets==='available'} onClick={()=>setFilters({...filters,outlets:filters.outlets==='available'?'':'available'})}><Plug size={14}/>帶電腦去</button><button aria-pressed={filters.discussion==='allowed'} onClick={()=>setFilters({...filters,discussion:filters.discussion==='allowed'?'':'allowed'})}><MessageCircle size={14}/>找人討論</button></div></div><div className="hero-aside"><div className="campus-symbol" aria-hidden="true"><svg viewBox="0 0 200 100"><path d="M5 90h190M35 85V47h130v38M28 47l72-32 72 32M60 85V57m20 28V57m40 28V57m20 28V57M94 85V62h12v23"/><path d="M12 87V55m0 4c-8-8-8-15-8-15 8 0 10 10 10 10m-2 1c3-12 10-14 10-14 4 5-3 14-10 14M188 87V55m0 4c8-8 8-15 8-15-8 0-10 10-10 10m2 1c-3-12-10-14-10-14-4 5 3 14 10 14"/></svg></div><div className="hero-stats"><div><strong>{spaces.length}</strong><span>處自習空間</span></div><div><strong>{new Set(spaces.flatMap(s=>s.location.coordinates?[s.location.coordinates.buildingUid]:[])).size}</strong><span>棟校園建築</span></div><div><strong>{spaces.reduce((n,s)=>n+s.photos.length,0)}</strong><span>張實際照片</span></div></div></div></div></section>
      <div className="workspace-shell">
        <div className="search-toolbar"><label className="search-box"><Search size={21}/><span className="sr-only">搜尋自習空間</span><input aria-label="搜尋自習空間" type="search" value={filters.query} onChange={e=>setFilters({...filters,query:e.target.value})} placeholder="搜尋空間、建築物、樓層或說明…"/>{filters.query && <button type="button" onClick={()=>setFilters({...filters,query:''})} aria-label="清除搜尋"><X size={17}/></button>}</label><button className="mobile-filter-toggle" aria-expanded={mobileFilters} aria-controls="filters-panel" onClick={()=>setMobileFilters(!mobileFilters)}><SlidersHorizontal size={17}/>篩選{activeFilters>0 && <span className="count-badge">{activeFilters}</span>}</button><div className="view-switch" aria-label="地圖與列表切換"><button aria-label="地圖與列表" aria-pressed={view==='split'} onClick={()=>setView('split')}><PanelsLeftBottom size={16}/><span>總覽</span></button><button aria-label="地圖模式" aria-pressed={view==='map'} onClick={()=>setView('map')}><MapIcon size={16}/><span>地圖</span></button><button aria-label="列表模式" aria-pressed={view==='list'} onClick={()=>setView('list')}><List size={16}/><span>列表</span></button></div></div>
        <div className="results-toolbar"><p aria-live="polite" data-testid="results-count">找到 <strong>{result.length}</strong> 個自習空間 <span>／共 {spaces.length} 筆紀錄</span></p><div><span className="map-results-count">{buildingCount} 個建築標記</span>{(activeFilters>0 || filters.query) && <button className="reset-link" onClick={reset}>清除全部篩選<X size={13}/></button>}</div></div>
        <div className={`explorer view-${view}`}>
          <FiltersPanel value={filters} onChange={setFilters} onReset={reset} mobileOpen={mobileFilters}/>
          <div className="map-column"><CampusMap spaces={result} selected={selected} focus={focus} onSelect={id=>setSelected(id)}/><p className="map-caption"><Info size={13}/>圖釘表示建築位置；同棟空間請點擊數字查看。</p></div>
          <section className="results-panel" aria-label="自習空間列表"><div className="list-header"><h2>探索空間<span>{result.length}</span></h2><label><span className="sr-only">排列方式</span><select aria-label="排列方式" value={sort} onChange={e=>setSort(e.target.value)}><option value="source">依原始紀錄</option><option value="seats">席位由多到少</option><option value="quiet">安靜程度優先</option></select></label></div><div className="space-list">{result.length ? result.map(s=><SpaceCard key={s.id} space={s} selected={selected===s.id} compared={compared.includes(s.id)} onFocus={focusSpace} onCompare={toggleCompare}/>):<div className="empty-results"><Search size={33}/><h3>暫時沒有符合的空間</h3><p>試著減少條件，或搜尋不同的建築物與樓層。</p><button className="button primary" onClick={reset}>清除全部篩選<ArrowRight size={16}/></button></div>}</div></section>
        </div>
        <div className="data-notice"><Info size={17}/><p>這是一份校園空間紀錄，席位數包含估算值，<strong>並非即時空位</strong>。設備與使用規範依 PDF 記載，請留意現場公告。</p></div>
      </div>
    </main>}
    <footer className="site-footer"><div><BookOpen size={17}/><span>臺大自習空間探索</span><span className="footer-subtitle">圖書資訊學 Metadata Schema 專題</span></div></footer>
    {compared.length>0 && <div className="compare-tray"><GitCompareArrows size={18}/><span>已選 <strong>{compared.length}</strong> / 3 個空間</span><button className="button primary" onClick={()=>setCompareOpen(true)}>開始比較<ArrowRight size={15}/></button><button className="icon-button" onClick={()=>setCompared([])} aria-label="清除比較"><X size={17}/></button></div>}
    {compareOpen && <Compare spaces={compared.map(id=>spaces.find(s=>s.id===id)!)} onClose={()=>setCompareOpen(false)} onRemove={toggleCompare}/>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </>
}
