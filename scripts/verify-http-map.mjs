import {createRequire} from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import {startPreviewServer} from './preview-server.mjs'
const require=createRequire(import.meta.url)
const {chromium,expect}=require('@playwright/test')
const server=await startPreviewServer(4174)
const context=await chromium.launchPersistentContext(path.resolve('work/map-qa-profile'),{channel:'chrome',headless:false,viewport:{width:1440,height:1000}})
const url=`http://127.0.0.1:4174${server.siteBase}`
const visits=[]
try{
  for(let visit=0;visit<2;visit++){
    const page=await context.newPage()
    const cdp=await context.newCDPSession(page)
    await cdp.send('Network.enable')
    const records=new Map(),cacheIds=new Set()
    cdp.on('Network.requestWillBeSent',e=>{
      if(e.request.url.startsWith('https://tile.openstreetmap.org/'))records.set(e.requestId,{url:e.request.url,referer:e.request.headers.Referer||null})
    })
    cdp.on('Network.requestServedFromCache',e=>cacheIds.add(e.requestId))
    cdp.on('Network.responseReceived',e=>{
      const r=records.get(e.requestId);if(!r)return
      const h=Object.fromEntries(Object.entries(e.response.headers).map(([k,v])=>[k.toLowerCase(),v]))
      Object.assign(r,{status:e.response.status,xBlocked:h['x-blocked']||null,fromDiskCache:e.response.fromDiskCache,cacheControl:h['cache-control']||null})
    })
    await page.goto(url,{waitUntil:'networkidle'})
    await page.bringToFront()
    await expect.poll(()=>page.locator('.leaflet-tile').evaluateAll(imgs=>imgs.length>0&&imgs.every(img=>img.complete&&img.naturalWidth>0&&Number(getComputedStyle(img).opacity)>=.99)),{timeout:20000}).toBe(true)
    await expect(page.locator('.map-error')).toHaveCount(0)
    const tiles=[...records].map(([id,t])=>({...t,servedFromCache:cacheIds.has(id)||!!t.fromDiskCache}))
    expect(tiles.every(t=>t.status===200&&!t.xBlocked&&t.referer===url)).toBe(true)
    if(visit===0)await page.screenshot({path:'work/map-preview.png',fullPage:true,animations:'disabled'})
    const result={visit:visit+1,tiles:tiles.length,cacheHits:tiles.filter(t=>t.servedFromCache).length,allImagesFullyPainted:true,blocked:tiles.filter(t=>t.xBlocked||t.status>=400).length}
    visits.push(result);console.log(JSON.stringify(result))
    await page.close()
  }
  expect(visits[1].cacheHits).toBeGreaterThan(0)
  fs.writeFileSync('work/map-cache-check.json',JSON.stringify({pageUrl:url,headed:true,persistentBrowserCache:true,noRouting:true,visits},null,2))
}finally{await context.close();server.close()}
