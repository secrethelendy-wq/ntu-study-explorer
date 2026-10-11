import fs from 'node:fs'
import path from 'node:path'

// Keep the local metadata preview, but map tiles require an HTTP(S) origin.
// CampusMap guards file:// so opening this file cannot send anonymous OSM traffic.
const root=path.resolve('dist')
let html=fs.readFileSync(path.join(root,'index.html'),'utf8')
const base=html.match(/<meta name="app-base" content="([^"]+)"/)[1]
function builtAsset(url) {
  const pathname=decodeURIComponent(new URL(url,'https://preview.invalid').pathname)
  if(!pathname.startsWith(base))throw new Error(`Asset is outside the configured base: ${url}`)
  const file=path.resolve(root,pathname.slice(base.length))
  if(!file.startsWith(root+path.sep))throw new Error(`Asset is outside dist: ${url}`)
  return file
}
html=html.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g,(_,src)=>{
  const js=fs.readFileSync(builtAsset(src),'utf8').replaceAll('</script','<\\/script')
  return `<script type="module">${js}</script>`
})
html=html.replace(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/g,(_,href)=>{
  const css=fs.readFileSync(builtAsset(href),'utf8').replaceAll(base,'./')
  return `<style>${css}</style>`
})
html=html.replace(`href="${base}favicon.svg"`,'href="./favicon.svg"')
fs.writeFileSync(path.join(root,'preview.html'),html)
console.log('已產生 dist/preview.html；互動底圖請透過「啟動網站.cmd」的 HTTP 預覽使用。')
