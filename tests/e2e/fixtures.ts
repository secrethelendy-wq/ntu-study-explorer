import { test as base, expect } from '@playwright/test'
import { createRequire } from 'node:module'
import path from 'node:path'

const require=createRequire(import.meta.url)
const serveLocalBuild=require('../../scripts/local-files-route.cjs')
export const test=base.extend({page:async({page},use)=>{
  // Functional regression tests use a local test tile, never OSM's live service.
  // Headless pan/zoom scans and routing's disabled cache must not hit public tiles.
  await page.route('https://tile.openstreetmap.org/**',route=>route.fulfill({
    contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e9eee3"/></svg>',
  }))
  if(process.env.PLAYWRIGHT_LOCAL_FILES==='1')await serveLocalBuild(page,path.resolve('dist'))
  await use(page)
}})
export { expect }
