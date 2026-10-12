import { ChevronDown, BookOpen } from 'lucide-react'

const criteria = [
  ['空間位置', '位於建築物內的自習空間，包含室內獨立空間、室內開放空間及半室內空間。'],
  ['地點範圍', '位於臺大校總區內，包含圖書館、教學大樓、學院公共區域及其他校園空間。'],
  ['桌椅設施', '須設有適合閱讀、書寫或使用筆記型電腦的桌椅，不包含僅設有沙發座位的區域。'],
  ['空間用途', '以自習為主要用途，排除學生餐廳、食堂、課室等主要供其他目的使用的場所。'],
  ['容納人數', '至少可同時容納五人自習。'],
  ['開放對象', '對全校師生開放，不限特定系所或學院。'],
  ['進入方式', '可直接進入或刷學生證進入，無須事先預約或申請使用權限。'],
]

export default function InclusionCriteria() {
  return <details className="inclusion-criteria">
    <summary><span><BookOpen size={16}/>空間篩選標準</span><ChevronDown size={16}/></summary>
    <div className="criteria-content"><ol>{criteria.map(([name, description])=><li key={name}><strong>{name}：</strong>{description}</li>)}</ol>
      <p>以上七項條件須同時符合，方納入本網站的自習空間紀錄。</p>
    </div>
  </details>
}
