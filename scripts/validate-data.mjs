import fs from 'node:fs'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const d=JSON.parse(fs.readFileSync(path.join(root,'src/data/spaces.json'),'utf8'))
const fields=['名稱','席位','插座','安靜程度','空間開放程度','是否需要學生證','空調','飲食','光線相關','地點','說明','記錄者','照片']
const sourceRecords=JSON.parse(fs.readFileSync(path.join(root,'docs/source/records-24.json'),'utf8'))
const pdfLinks=JSON.parse(fs.readFileSync(path.join(root,'docs/source/pdf-links.json'),'utf8'))
const provenance=JSON.parse(fs.readFileSync(path.join(root,'docs/source/update-provenance.json'),'utf8'))
const normalize=value=>value.normalize('NFKC').replace(/\s+/g,'')
assert.equal(d.source.pageCount,24)
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'docs/source/source.pdf'))).digest('hex'),provenance.pdfSha256)
assert.equal(d.spaces.length,d.source.recordCount)
assert.equal(d.spaces.reduce((n,s)=>n+s.photos.length,0),d.source.photoCount)
assert.equal(new Set(d.spaces.map(s=>s.id)).size,d.spaces.length)
const snapshot=JSON.parse(fs.readFileSync(path.join(root,'docs/source/buildings.geojson'),'utf8'))
for(const s of d.spaces){
  const source=sourceRecords.find(record=>record.id===s.id)
  assert.ok(source,`${s.id} 必須有新版 PDF 原文對照`)
  assert.deepEqual(s.source.pages,[source.page])
  assert.equal(Object.keys(s.raw).length,13,`${s.id} 原始元件數`)
  for(const key of fields)assert.equal(typeof s.raw[key],'string',`${s.id} 缺少 ${key}`)
  for(const key of fields)assert.equal(normalize(s.raw[key]),normalize(source.raw[key]),`${s.id} ${key} 必須吻合新版 PDF`)
  assert.equal(s.seats.minimum,s.seats.areas.reduce((n,a)=>n+a.minimum,0))
  assert.equal(s.seats.maximum,s.seats.areas.reduce((n,a)=>n+a.maximum,0))
  assert.equal(s.seats.estimated,s.seats.areas.some(a=>a.estimated))
  assert.ok(['all','partial','none'].includes(s.outlets.coverage))
  assert.ok(['高','中','低'].includes(s.quietness.level))
  assert.ok(s.photos.length>0)
  assert.ok(s.source.pages.every(p=>Number.isInteger(p)&&p>=1&&p<=d.source.pageCount))
  const url=new URL(s.location.officialMapUrl)
  assert.equal(url.hostname,'map.ntu.edu.tw')
  assert.ok(pdfLinks.some(link=>link.page===source.page&&link.uri===s.location.officialMapUrl),`${s.id} 完整官方網址必须吻合該頁 PDF 超連結註記`)
  assert.ok(!/\s/.test(s.location.officialMapUrl))
  assert.equal(s.location.originalMapKey,Number(Buffer.from(url.searchParams.get('apKey'),'base64').toString()))
  const c=s.location.coordinates
  if(c){
    assert.equal(c.crs,'EPSG:4326')
    assert.ok(c.latitude>24.9&&c.latitude<25.1&&c.longitude>121.4&&c.longitude<121.7)
    const f=snapshot.features.find(f=>f.id===c.featureId)
    assert.ok(f,`${s.id} 必須有官方座標來源快照`)
    assert.equal(c.buildingUid,f.properties.uid)
    assert.equal(c.verifiedMapKey,f.properties.ap_key)
    assert.equal(c.officialName,f.properties.name)
  }
  for(const p of s.photos){
    const file=path.resolve(root,'public',p.src)
    assert.ok(file.startsWith(path.join(root,'public')+path.sep))
    const hash=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
    assert.equal(hash,p.sha256,`${s.id} 照片必須保留 PDF 原始位元組`)
    assert.ok(s.source.pages.includes(p.sourcePage))
  }
  for(const id of s.issueIds)assert.ok(d.qualityIssues.some(i=>i.id===id))
}
console.log(`資料驗證通過：${d.spaces.length} 筆、${d.source.photoCount} 張原始照片、${new Set(d.spaces.flatMap(s=>s.location.coordinates?[s.location.coordinates.buildingUid]:[])).size} 棟官方定位建築。`)
