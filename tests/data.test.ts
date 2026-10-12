import { describe, expect, it } from 'vitest'
import { dataset, spaces } from '../src/data'
import sourceRecords from '../docs/source/records-24.json'

describe('原始 PDF 轉換完整性與資料品質',()=>{
  it('來源頁數與照片數吻合，記錄者姓名完整保留',()=>{
    expect(dataset.source.pageCount).toBe(24)
    expect(spaces.reduce((n,s)=>n+s.photos.length,0)).toBe(18)
    expect(spaces.slice(0,5).every(s=>s.recorder==='陳子罃')).toBe(true)
    expect(spaces.slice(5,10).every(s=>s.recorder==='郭亮纖')).toBe(true)
    expect(spaces.slice(10).every(s=>s.recorder==='許凱琳')).toBe(true)
  })
  it('每筆原始 13 欄位均存在，原始說明留白也保留',()=>{
    for(const s of spaces){expect(Object.keys(s.raw)).toHaveLength(13);expect(s.raw['名稱']).toBe(s.name);expect(s.raw['記錄者']).toBe(s.recorder)}
    expect(spaces[1].raw['說明']).toBe('')
  })
  it('新版管理學院二號館四張照片同在第 14 頁，不誤配給沃斯空間',()=>{
    expect(spaces[6].photos.map(p=>p.sourcePage)).toEqual([14,14,14,14])
    expect(spaces[7].photos.map(p=>p.sourcePage)).toEqual([15])
  })
  it('原始錯誤地圖網址保留，獨立定位來源不是原始視圖中心',()=>{
    expect(spaces[3].location.officialMapUrl).toBe(spaces[0].location.officialMapUrl)
    expect(spaces[3].location.originalMapKey).toBe(3)
    expect(spaces[3].location.coordinates?.verifiedMapKey).toBe(1864)
    expect(spaces[3].location.coordinates).toEqual(spaces[2].location.coordinates)
    expect(new Set(spaces.map(s=>s.location.coordinates?.buildingUid)).size).toBe(13)
  })
  it('未提供數量與獨立燈具保留未知值，確知無插座為 none',()=>{
    expect(spaces[13].outlets.knownSeats).toBeNull()
    expect(spaces[14].lighting.independentLighting).toBeNull()
    expect(spaces[9].outlets.coverage).toBe('none')
    expect(spaces[9].outlets.knownSeats).toBe(0)
    expect(spaces[11].lighting.independentSeats).toBe(8)
  })
  it('外借超連結文字與 PDF 目標的日期字元差異分別保留',()=>{
    const link=spaces[7].externalLinks[0]
    expect(link.displayText).toContain('2026–10–02')
    expect(link.url).toContain('2026-10-02')
    expect(link.source).toBe('PDF /Annots /A /URI')
  })
  it('沒有虛構開放時間、調查日期或即時空位',()=>{
    expect(dataset.source.surveyDate).toBeNull()
    for(const s of spaces){expect(s).not.toHaveProperty('openingHours');expect(s).not.toHaveProperty('availableSeats')}
    expect(spaces[8].seats.minimum).toBe(25)
    expect(spaces[9].seats.minimum).toBe(182)
  })
  it('十五筆 ID 穩定，原始欄位逐一吻合獨立擷取的新版 PDF',()=>{
    const normalize=(s:string)=>s.normalize('NFKC').replace(/\s+/g,'')
    expect(spaces.map(s=>s.id)).toEqual(sourceRecords.map(r=>r.id))
    for(const [index,s] of spaces.entries()) {
      const record=sourceRecords[index]
      expect(s.source.pages).toEqual([record.page])
      for(const [field,value] of Object.entries(record.raw)) expect(normalize(s.raw[field]),`${s.id} ${field}`).toBe(normalize(value))
    }
  })
  it('新版移除普通、博雅插座席位數，保留位置且不從總席位推估',()=>{
    for(const index of [1,4]) {
      expect(spaces[index].outlets.coverage).toBe('partial')
      expect(spaces[index].outlets.knownSeats).toBeNull()
      expect(spaces[index].outlets.knownSeatRange).toBeNull()
      expect(spaces[index].outlets.estimated).toBe(false)
    }
    expect(spaces[1].outlets.location).toContain('連接通道')
    expect(spaces[4].outlets.location).toBe('窗邊座位')
    expect(spaces[1].lighting.indoorFixtures).toBe(false)
    expect(spaces[1].lighting.indoorAdequacy).toBe('none')
    expect(spaces[2].quietness.discussion).toBe('allowed')
    expect(spaces[2].quietness.discussionOriginal).toBe('開放正常討論')
    expect(spaces[2].quietness.note).toBe('未禁止討論，但現場很安靜')
  })
})
