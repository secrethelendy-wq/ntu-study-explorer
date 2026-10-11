// Browser QA fallback for environments that block loopback sockets.
// Only the production build under dist/ is served; application code is unchanged.
const fs = require('node:fs/promises')
const path = require('node:path')
module.exports = async function serveLocalBuild(page, root, origin = 'http://127.0.0.1:5173') {
  const directory = path.resolve(root)
  const html = await fs.readFile(path.join(directory, 'index.html'), 'utf8')
  const base = html.match(/<meta name="app-base" content="([^"]+)"/)?.[1] || '/'
  const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml' }
  await page.route(`${origin}/**`, async route => {
    const pathname = decodeURIComponent(new URL(route.request().url()).pathname)
    if (!pathname.startsWith(base)) return route.fulfill({status:404,body:'Outside application base'})
    const file = path.resolve(directory, pathname.slice(base.length) || 'index.html')
    if (!file.startsWith(directory + path.sep)) return route.fulfill({status:403,body:'Forbidden'})
    try {
      const body = await fs.readFile(file)
      await route.fulfill({status:200,contentType:types[path.extname(file)] || 'application/octet-stream',body})
    } catch { await route.fulfill({status:404,body:'Not found'}) }
  })
}
