const { chromium }=require('playwright')
const {pathToFileURL}=require('node:url')
const path=require('node:path')
const assert=require('node:assert/strict')
;(async()=>{
  const browser=await chromium.launch({channel:'chrome'})
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true})
  await page.goto(pathToFileURL(path.resolve('dist/preview.html')).href)
  await page.waitForSelector('.leaflet-marker-icon')
  await page.getByRole('button',{name:'地圖模式',exact:true}).click()
  const map=page.getByTestId('campus-map')
  await map.scrollIntoViewIfNeeded()
  const box=await map.boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2
  const initial=Number(await map.getAttribute('data-zoom'))
  const cdp=await page.context().newCDPSession(page)
  const points=(radius)=>[{x:x-radius,y,id:0},{x:x+radius,y,id:1}]
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(30)})
  for(const radius of [40,50,65,80]){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(radius)})
    await page.waitForTimeout(50)
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  await page.waitForTimeout(600)
  const zoom=Number(await map.getAttribute('data-zoom'))
  assert.ok(zoom>initial,`pinch ${initial} -> ${zoom}`)
  const before=await map.getAttribute('data-center')
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-85,y:y+45,id:0}]})
  for(const delta of [15,30,50]){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-85+delta,y:y+45-delta,id:0}]})
    await page.waitForTimeout(60)
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  await page.waitForTimeout(700)
  assert.notEqual(await map.getAttribute('data-center'),before)
  console.log(JSON.stringify({mobileTouchPinch:true,zoomBefore:initial,zoomAfter:zoom,mobileTouchDrag:true}))
  await browser.close()
})().catch(e=>{console.error(e);process.exit(1)})
