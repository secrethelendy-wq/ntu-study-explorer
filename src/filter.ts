import type { Filters, SeatArea, Space } from './types'

export const emptyFilters: Filters = { query: '', quietness: '', outlets: '', openness: '', studentCard: '', airConditioning: '', fan: '', food: '', indoorLight: '', naturalLight: false, independentLight: false, discussion: '', minSeats: 0 }
const normalize = (s: string) => s.toLocaleLowerCase().replace(/[–—~～－]/g, '-').replace(/\s+/g, ' ').trim()
const boolMatches = (filter: string, value: boolean) => !filter || (filter === 'yes' ? value : !value)

function floorTerms(floor: string) {
  const match = floor.match(/^(\d+(?:\.\d+)?)(?:[~–-](\d+))?F$/)
  if (!match) return floor
  const start = Number(match[1]), end = Number(match[2] || match[1])
  const chinese = ['', '一', '二', '三', '四', '五', '六']
  const values: string[] = []
  for (let n = start; n <= end; n++) values.push(`${n}F`, `${n}樓`, chinese[n] ? `${chinese[n]}樓` : '')
  return values.join(' ')
}

export function filterSpaces(data: Space[], filters: Filters): Space[] {
  const tokens = normalize(filters.query).split(' ').filter(Boolean)
  return data.filter(s => {
    const haystack = normalize([s.name, s.building, s.floor, floorTerms(s.floor), s.title, s.description, s.location.entranceNote, ...Object.values(s.raw)].join(' '))
    return tokens.every(token => haystack.includes(token))
      && (!filters.quietness || s.quietness.level === filters.quietness)
      && (!filters.outlets || s.outlets.coverage === filters.outlets)
      && (!filters.openness || s.openness === filters.openness)
      && boolMatches(filters.studentCard, s.studentCardRequired)
      && boolMatches(filters.airConditioning, s.climate.airConditioning)
      && boolMatches(filters.fan, s.climate.fan)
      && boolMatches(filters.food, s.foodAllowed)
      && (!filters.indoorLight || s.lighting.indoorAdequacy === filters.indoorLight)
      && (!filters.naturalLight || s.lighting.naturalLightAffected)
      && (!filters.independentLight || s.lighting.independentLighting === true)
      && (!filters.discussion || s.quietness.discussion === filters.discussion)
      && s.seats.minimum >= filters.minSeats
  })
}
export const filterCount = (f: Filters) => Object.entries(f).filter(([key, value]) => key !== 'query' && value !== '' && value !== false && value !== 0).length
export function seatsLabel(s: Space['seats'] | SeatArea) {
  return `${s.estimated ? '約 ' : ''}${s.minimum === s.maximum ? s.minimum : `${s.minimum}–${s.maximum}`} 席`
}
export const outletLabels = { all: '全部座位可使用', partial: '部分座位可使用', none: '無插座' }
export const discussionLabels = { allowed: '允許討論', 'not-prohibited': '未明確禁止討論', prohibited: '不開放討論' }
export const lightLabels = { sufficient: '室內照明充足', insufficient: '室內照明不充足', none: '無室內照明', unknown: '照明資料待確認' }
export function relatedSpaces(space: Space, data: Space[]) {
  return data.filter(s => s.id !== space.id).map(s => ({ space: s, score: (s.building === space.building ? 20 : 0) + (s.quietness.level === space.quietness.level ? 3 : 0) + (s.outlets.coverage === space.outlets.coverage ? 2 : 0) + (s.climate.airConditioning === space.climate.airConditioning ? 1 : 0) })).sort((a,b) => b.score - a.score).slice(0,3)
}
