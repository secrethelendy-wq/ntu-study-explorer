# GitHub Pages 部署準備驗證

查核日期：2026-10-11。儲存庫名稱 ntu-study-explorer；Vite base /ntu-study-explorer/。

## 建置與部署流程

- 原專案執行 npm run build 成功，包含 TypeScript、Vite 正式建置與本機 preview.html 產生。
- 另外複製原始碼到隔離 work/pages-ci，執行 npm ci 安裝 124 個套件，再執行 npm run build 成功。兩次產生的 index.html、資產檔名一致。
- package-lock.json 包含 Ubuntu 所需的 Linux Rollup 與 Tailwind 原生選用依賴。此環境實際建置為 Windows；GitHub Ubuntu runner 尚未執行。
- GitHub Actions YAML 已由 js-yaml 解析，並核對 main / workflow_dispatch 觸發、build → deploy 依賴、dist artifact、Pages / OIDC 權限、官方 Actions 的固定 commit SHA。
- 本機 npm run preview 使用的 HTTP 伺服器已驗證根網址轉址、子路徑首頁、JavaScript / CSS / favicon MIME、照片、Referrer Policy，以及 ETag 的 304 快取回應。

## 資料與瀏覽器

- 資料驗證通過：15 筆紀錄、18 張 PDF 原始照片、13 棟官方定位建築。
- 22 個單元測試通過。
- 桌面、平板、手機共 21 個瀏覽器案例均已驗證。初次有 20 個通過，手機的全照片／同棟群集案例在並行建置時達到 35 秒上限；單獨重跑於 23.2 秒內通過。沒有因此調整網站、資料或提高測試逾時上限。
- 功能回歸使用 dist 的 /ntu-study-explorer/ 路徑，測試圖磚僅在測試內替換，避免自動化掃描公共 OSM。涵蓋搜尋、AND 篩選、空調與風扇、群集、照片、詳細頁、原始 13 元件、比較、鍵盤、手機與直接開檔相容性。
- 真正的 OSM 另用可見 Chrome 視窗、真實 HTTP 伺服器、同樣子路徑及被動 Network 記錄驗證。沒有 routing、偽造 Referer、改 User-Agent 或停用快取；44 個圖磚請求事件均無 x-blocked 或 4xx 回應。
- 實際首頁 HTTP 200，15 個卡片、13 個標記、全部 18 張照片正確服務；縮放 16 → 17 → 16、點擊同棟標記、關鍵字搜尋與空調篩選均通過。JavaScript 錯誤與非預期請求失敗皆為 0。
- Metadata JSON 與全部照片的 SHA-256 在修改前後一致，dist 及上傳包也保留原始照片位元組。App、Filters、SpaceCard、Detail、Compare 及網站樣式未修改。

詳細機器紀錄：pages-deployment-check.json、pages-browser-check.json。

## 已修改的部署相關檔案

| 檔案 | 用途 |
| --- | --- |
| vite.config.ts | 設定 GitHub Pages base |
| .github/workflows/deploy.yml | 乾淨安裝、驗證、測試、建置及 Pages 部署 |
| index.html | 宣告建置 base，favicon 套用同一子路徑 |
| src/data.ts | HTTP 使用 BASE_URL，直接開檔保留相對照片路徑 |
| scripts/build-preview.mjs | 從部署子路徑讀取建置資產，保留直接開檔功能 |
| scripts/preview-server.mjs | 本機 HTTP 預覽支援相同子路徑與根網址轉址 |
| scripts/verify-http-map.mjs | 測試使用伺服器宣告的 base |
| scripts/local-files-route.cjs、playwright.config.ts、tests/e2e/explorer.spec.ts | 瀏覽器回歸測試配合子路徑 |
| README.md、docs/DEPLOYMENT.md | 更新啟動網址及純網頁發布步驟 |

尚未取得可用的 GitHub 帳號連線，沒有推送或執行遠端 Actions。公開 GitHub Pages 網址尚未產生。請依 DEPLOYMENT.md 上傳檔案並在 Settings → Pages 選 GitHub Actions，才能完成正式發布。
