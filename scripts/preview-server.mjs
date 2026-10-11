import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' }

export async function startPreviewServer(port = 4173) {
  const html = await fs.readFile(path.join(directory, 'index.html'), 'utf8')
  const base = html.match(/<meta name="app-base" content="([^"]+)"/)?.[1] || '/'
  const server = http.createServer(async (request, response) => {
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return
    }
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname)
      if (base !== '/' && (pathname === '/' || pathname === base.slice(0, -1))) {
        response.writeHead(302, { Location: base }); response.end(); return
      }
      if (!pathname.startsWith(base)) { response.writeHead(404); response.end(); return }
      const relativePath = pathname.slice(base.length) || 'index.html'
      const file = path.resolve(directory, relativePath)
      if (!file.startsWith(directory + path.sep)) { response.writeHead(403); response.end(); return }
      const stat = await fs.stat(file)
      if (!stat.isFile()) { response.writeHead(404); response.end(); return }
      const etag = `W/"${stat.size}-${stat.mtimeMs}"`
      response.setHeader('ETag', etag)
      response.setHeader('Last-Modified', stat.mtime.toUTCString())
      response.setHeader('Cache-Control', relativePath.startsWith('assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=60, must-revalidate')
      if (request.headers['if-none-match'] === etag || (!request.headers['if-none-match'] && request.headers['if-modified-since'] && Date.parse(request.headers['if-modified-since']) >= Math.floor(stat.mtimeMs / 1000) * 1000)) {
        response.writeHead(304); response.end(); return
      }
      response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream')
      response.setHeader('Content-Length', stat.size)
      response.writeHead(200)
      response.end(request.method === 'HEAD' ? undefined : await fs.readFile(file))
    } catch (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 400)
      response.end('找不到檔案或網址格式錯誤。')
    }
  })
  server.siteBase = base
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', resolve)
  })
  return server
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  startPreviewServer(Number(process.env.PORT) || 4173).then(server => {
    console.log(`臺大自習空間探索：http://127.0.0.1:${server.address().port}${server.siteBase}`)
    console.log('請使用上述 HTTP 網址，避免直接開啟 file://。按 Ctrl+C 停止。')
  }).catch(error => {
    console.error(error.code === 'EADDRINUSE' ? `${Number(process.env.PORT) || 4173} 埠已被使用，請先關閉舊的預覽伺服器，或透過 PORT 環境變數指定其他埠。` : error.message)
    process.exitCode = 1
  })
}
