export type Coverage = 'all' | 'partial' | 'none'
export type Quiet = '高' | '中' | '低'
export type Discussion = 'allowed' | 'not-prohibited' | 'prohibited'
export type Lighting = 'sufficient' | 'insufficient' | 'none' | 'unknown'
export type SeatArea = { label: string; minimum: number; maximum: number; estimated: boolean }
export interface Space {
  id: string
  name: string
  title: string
  building: string
  floor: string
  source: { pages: number[]; fieldPages: Record<string, number[]> }
  raw: Record<string, string>
  seats: { areas: SeatArea[]; minimum: number; maximum: number; estimated: boolean; basis: string }
  outlets: { coverage: Coverage; knownSeats: number | null; estimated: boolean; location: string | null; knownSeatsBasis: string; knownSeatRange: { minimum: number; maximum: number; estimated: boolean; basis: string } | null }
  quietness: { level: Quiet; noiseSources: string[]; discussion: Discussion; discussionOriginal: string; note: string | null }
  openness: string
  studentCardRequired: boolean
  climate: { airConditioning: boolean; fan: boolean; note: string | null }
  foodAllowed: boolean
  lighting: { indoorFixtures: boolean | null; indoorAdequacy: Lighting; naturalLightAffected: boolean; independentLighting: boolean | null; independentSeats: number | null; independentScope: string | null }
  location: {
    officialMapUrl: string; originalMapKey: number
    originalViewCenter: { crs: string; x: number; y: number; wgs84: number[] }
    coordinates: { latitude: number; longitude: number; crs: string; status: string; precision: string; method: string; featureId: string; buildingUid: string; officialName: string; verifiedMapKey: number } | null
    entranceNote: string | null
  }
  description: string
  externalLinks: { label: string; displayText: string; url: string; sourcePage: number; source: string }[]
  recorder: string
  photos: { src: string; alt: string; sourcePage: number; sourceImage: number; sha256: string }[]
  issueIds: string[]
}
export interface QualityIssue { id: string; spaceIds: string[]; category: string; description: string; original: string; resolution: string; status: string }
export interface Dataset { schemaVersion: string; title: string; source: { filename: string; pageCount: number; recordCount: number; photoCount: number; surveyDate: null; conversionDate: string; coordinateSource: string; coordinateAccessDate: string }; qualityIssues: QualityIssue[]; spaces: Space[] }
export interface Filters {
  query: string
  quietness: '' | Quiet
  outlets: '' | Coverage
  openness: string
  studentCard: '' | 'yes' | 'no'
  airConditioning: '' | 'yes' | 'no'
  fan: '' | 'yes' | 'no'
  food: '' | 'yes' | 'no'
  indoorLight: '' | Lighting
  naturalLight: boolean
  independentLight: boolean
  discussion: '' | Discussion
  minSeats: number
}
