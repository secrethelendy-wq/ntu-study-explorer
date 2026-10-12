import { describe, expect, it } from 'vitest'
import { spaces } from '../src/data'
import { emptyFilters, filterSpaces, seatsLabel, filtersDiffer, filterCount } from '../src/filter'

const find = (override: Partial<typeof emptyFilters>) => filterSpaces(spaces,{...emptyFilters,...override}).map(s=>s.id)
describe('依 PDF 事實進行複合檢索',()=>{
  it('保留全部 15 筆，沒有把總席位當成即時座位',()=>expect(find({})).toHaveLength(15))
  it('安靜且全部座位可用插座，只符合總圖與綜合教學館一樓',()=>expect(find({quietness:'高',outlets:'all'})).toEqual(['s01','s03']))
  it('空調與風扇是獨立篩選，兩者皆有僅沃斯空間',()=>expect(find({airConditioning:'yes',fan:'yes'})).toEqual(['s08']))
  it('無空調但有風扇僅綜合教學館 4~6F',()=>expect(find({airConditioning:'no',fan:'yes'})).toEqual(['s04']))
  it('無風扇可與禁止飲食、免學生證條件組合',()=>expect(find({fan:'no',food:'no',studentCard:'no'})).toEqual(['s12']))
  it('自然光與獨立照明以 AND 組合',()=>expect(find({naturalLight:true,independentLight:true})).toEqual(['s14']))
  it('新版明確無燈具的普通教學館納入無室內照明',()=>{
    expect(find({indoorLight:'none'})).toEqual(['s02','s11'])
    expect(find({indoorLight:'sufficient'})).not.toContain('s02')
    expect(find({indoorLight:'unknown'})).toEqual([])
  })
  it('最低 100 席以較低範圍值比較，總圖約 96–106 席不符合',()=>expect(find({minSeats:100})).toEqual(['s05','s10','s14']))
  it('估算值與分區合計保留標記',()=>{
    expect(seatsLabel(spaces[0].seats)).toBe('約 96–106 席')
    expect(seatsLabel(spaces[1].seats)).toBe('約 38 席')
    expect(spaces[3].seats.areas).toHaveLength(3)
  })
  it('多個關鍵字同時符合並可搜尋進入方式',()=>{
    expect(find({query:'綜合 1F 學習'})).toEqual(['s03'])
    expect(find({query:'抵押'})).toEqual(['s09'])
    expect(find({query:'包包',quietness:'高',studentCard:'no'})).toEqual(['s12'])
    expect(find({query:'綜合 5樓'})).toEqual(['s04'])
    expect(find({query:'化學 2F'})).toEqual(['s09'])
  })
  it('未明確禁止與不開放討論區分',()=>{
    expect(find({discussion:'not-prohibited'})).toEqual([])
    expect(find({discussion:'prohibited'})).toEqual(['s09','s10','s12'])
    expect(find({discussion:'allowed',quietness:'高'})).toEqual(['s01','s03','s07','s08','s14'])
  })
  it('所有空間型態可與其他條件組合',()=>expect(find({openness:'半室內',outlets:'none'})).toEqual(['s11']))
  it('沒有符合條件時傳回空集合',()=>expect(find({query:'不存在的空間',minSeats:999})).toEqual([]))
  it('帶電腦去包含全部與部分可用插座，排除無插座',()=>{
    const ids=find({outlets:'available'})
    expect(ids).toHaveLength(13)
    expect(ids).toEqual(spaces.filter(s=>s.outlets.coverage==='all'||s.outlets.coverage==='partial').map(s=>s.id))
    expect(ids).not.toContain('s10')
    expect(ids).not.toContain('s11')
  })
  it('草稿差異及條件數排除即時搜尋，只計真正篩選條件',()=>{
    expect(filtersDiffer(emptyFilters,{...emptyFilters,query:'總圖'})).toBe(false)
    expect(filtersDiffer(emptyFilters,{...emptyFilters,fan:'yes'})).toBe(true)
    expect(filterCount({...emptyFilters,query:'總圖',fan:'yes',minSeats:5})).toBe(2)
    expect(filtersDiffer({...emptyFilters,fan:'yes'},{...emptyFilters,fan:'yes'})).toBe(false)
  })
})
