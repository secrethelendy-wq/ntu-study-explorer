import { describe, expect, it } from 'vitest'
import { canRequestTiles, osmTileOptions, osmTileUrl } from '../src/mapTiles'

describe('OSM 圖磚來源與政策', () => {
  it('只在能提供 HTTP Referer 的網頁來源請求圖磚', () => {
    expect(canRequestTiles('http:')).toBe(true)
    expect(canRequestTiles('https:')).toBe(true)
    expect(canRequestTiles('file:')).toBe(false)
    expect(canRequestTiles('about:')).toBe(false)
  })
  it('使用官方 HTTPS 路徑、來源識別與明確 attribution', () => {
    expect(osmTileUrl).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
    expect(osmTileOptions.referrerPolicy).toBe('strict-origin-when-cross-origin')
    expect(osmTileOptions.attribution).toContain('https://www.openstreetmap.org/copyright')
    expect(osmTileOptions.updateWhenIdle).toBe(true)
    expect(osmTileOptions.updateWhenZooming).toBe(false)
    expect(osmTileOptions.detectRetina).toBe(false)
  })
})
