import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir:'./tests/e2e',
  fullyParallel:false,
  workers:1,
  timeout:35000,
  reporter:[['list'],['json',{outputFile:'test-results/results.json'}]],
  use:{
    baseURL:'http://127.0.0.1:5173/ntu-study-explorer/',
    browserName:'chromium',
    channel:process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    screenshot:'only-on-failure',
    trace:'retain-on-failure',
    launchOptions:{args:['--disable-dev-shm-usage']},
  },
  projects:[
    {name:'desktop',use:{viewport:{width:1440,height:1000}}},
    {name:'tablet',use:{viewport:{width:768,height:1024},hasTouch:true}},
    {name:'mobile',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
  ],
  webServer:process.env.PLAYWRIGHT_LOCAL_FILES==='1' ? undefined : {command:'npm run dev -- --port 5173',url:'http://127.0.0.1:5173/ntu-study-explorer/',reuseExistingServer:true,timeout:60000},
})
