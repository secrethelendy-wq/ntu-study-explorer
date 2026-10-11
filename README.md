# 臺大自習空間探索

以《資組一 metadata 作業 (3).pdf》19 頁中全部 15 筆真實紀錄建立的 React 網站。支援校園互動地圖、關鍵字搜尋、AND 條件篩選、卡片定位、完整 Metadata 詳細頁、原始照片展示、空間比較與資料品質清單。

## GitHub Pages 發布

儲存庫名稱請使用 `ntu-study-explorer`。已設定 `/ntu-study-explorer/` 子路徑，並附 `.github/workflows/deploy.yml`；提交到 `main` 後會由 GitHub Actions 安裝依賴、驗證資料、測試、建置並部署 `dist`。先在儲存庫的 **Settings → Pages → Source** 選擇 **GitHub Actions**。不需手動建立 gh-pages 分支或上傳 dist。

完整的純網頁上傳及點擊步驟見 [GitHub Pages 部署說明](docs/DEPLOYMENT.md)。不需要 API Key 或自行新增部署密鑰。

## 立即預覽

雙擊專案根目錄的 `啟動網站.cmd`，保持伺服器視窗開啟，再用瀏覽器開啟 http://127.0.0.1:4173/ntu-study-explorer/ 。也可以在專案資料夾執行 `npm run preview`。這個正式版本預覽只需要 Node.js 與已建置的 dist，不需要後端、登入或 API Key。

不要直接用 file:// 預覽底圖：本機檔案無法提供 HTTP Referer，會遭 OSM 封鎖。`dist/preview.html` 保留資料檢視功能，但會阻止不合規的圖磚請求，並提示使用 HTTP 預覽。

## 啟動

需要 Node.js 20.19+ 或 22.12+，建議使用 Node.js 24 LTS。首次啟動需要網路下載套件；底圖需要連線至 OpenStreetMap。

```powershell
cd "C:\Users\helen\Documents\Codex\2026-10-11\ui-ux-pdf-metadata-3-pdf\outputs\ntu-study-explorer"
npm ci
npm run dev
```

在瀏覽器開啟終端機顯示的網址，預設為 http://127.0.0.1:5173/ntu-study-explorer/ 。本次工作環境已安裝依賴；原專案資料夾可直接執行 `npm run dev`。ZIP 不包含 node_modules，解壓後先執行 `npm ci`。

## 建置與驗證

```powershell
npm run validate:data
npm test
npm run build
npm run preview
```

`dist/` 是可部署到一般靜態主機的正式版本。標準 index.html 請透過 HTTP 伺服器開啟；另附的 preview.html 僅供直接開檔檢視資料，互動底圖必須使用 HTTP(S) 網址。採用 hash 路由，詳細頁重新整理不需要伺服器 rewrite。`vite.config.ts` 的 base 為 `/ntu-study-explorer/`，對應 GitHub Pages 專案網址。

```powershell
npm run test:e2e
```

瀏覽器測試預設使用電腦已安裝的 Google Chrome，涵蓋 1440px 桌面、768px 平板與 390px 手機。若沒有 Chrome，可安裝 Chromium 後執行：

```powershell
npx playwright install chromium
$env:PLAYWRIGHT_CHANNEL = "chromium"
npm run test:e2e
```

測試設定會啟動 Vite，若 5173 埠已有本專案伺服器則重用。請避免在該埠執行其他服務。詳細實測結果見 `docs/TEST_REPORT.md`。

## 資料與檔案位置

| 檔案 | 內容 |
| --- | --- |
| `src/data/spaces.json` | 全部 Metadata、13 個原始元件、估算與未知值、照片來源、定位依據與待確認項目 |
| `public/images/` | 18 張直接自 PDF 抽出的原始 JPEG，保留原始位元組 |
| `src/types.ts` | TypeScript 資料結構與篩選型別 |
| `docs/PENDING.md` | 完整待確認事項清單 |
| `docs/DATA_MODEL.md` | 欄位語意、更新規則與新增空間步驟 |
| `docs/COORDINATES.md` | 官方座標查證、轉換公式與建築名稱對照 |
| `docs/source/source.pdf` | 原始 19 頁 PDF |
| `docs/source/pdf-text.txt` | 逐頁抽出的原始文字 |
| `docs/source/tables.json` | 原始表格及跨頁欄位，供核對轉換 |
| `docs/source/pdf-links.json` | PDF 原始超連結註記，包括文字與連結目標不同的日期 |
| `docs/source/buildings.geojson` | 官方 WFS 的 13 棟建築輪廓與識別資訊快照 |
| `scripts/extract-pdf.py` | 可重跑的原始 PDF 文字、表格、照片及超連結擷取工具 |

## 新增或修改空間

1. 在 `src/data/spaces.json` 的 `spaces` 中新增一筆或修改既有紀錄。可複製相近紀錄作結構範本，但必須填入經來源核對的內容與唯一 `id`，不能複製其他空間的設備或照片。
2. `raw` 必須保留 13 個原始欄位。描述留白用空字串，未知的可選欄位用 `null`。原始文字與正規化欄位同步更新；附註、進入方式與記錄者不得省略。
3. 每個樓層／區域建立獨立 `seats.areas`；填寫數字範圍及 `estimated`。更新合計 `minimum`、`maximum` 及估算標記。最低席位篩選使用合計較低值，仍屬紀錄席位，並非即時空位。
4. 將該空間的原始照片放入 `public/images/`，更新 `photos` 的路徑、替代文字、PDF 頁碼及 SHA-256。可用 PowerShell `Get-FileHash -Algorithm SHA256 "照片路徑"` 取得雜湊值，存入 JSON 時轉為小寫。
5. 地圖座標必須有可核對來源。將官方建築輪廓快照加入 `docs/source/buildings.geojson`，填入 WGS84 座標與官方 uid。無法確認時把 `location.coordinates` 設為 `null`，保留 `officialMapUrl` 並新增待確認事項；該筆仍出現在列表，地圖不生成圖釘。
6. 同棟使用相同 `buildingUid`，網站自動將空間合併到同一標記清單，不需要人為偏移座標。
7. 新增或修正 `qualityIssues`，在紀錄的 `issueIds` 列出相關項目。若取得確證，保留原文及確認依據再更新正規化值。
8. 更新 `source.recordCount`、`photoCount` 及頁數等來源資訊。重新執行資料驗證、單元測試、建置與瀏覽器測試。既有測試是本 PDF 的事實檢查；替換／擴充資料集時應同步調整預期紀錄數。

資料使用 JSON import，開發模式儲存後會由 Vite 更新；正式版本需重新 `npm run build`。

## 功能與資料規則

- 搜尋名稱、建築、樓層、說明與原始文字；多個以空格分隔的關鍵字亦採 AND。
- 安靜程度、插座、空間型態、學生證、飲食、討論、室內照明與最低席位可以組合。
- 空調與風扇分開；自然光與獨立照明也可各自篩選。
- 普通教學館照明原文互相矛盾，標示待確認，不歸入有／無或充足度。
- 「未禁止討論，但現場很安靜」與「不開放討論」分開，詳細頁保留原句。
- 列表卡片的「在地圖定位」移動並放大地圖；名稱與照片可進入詳細頁。
- 同棟標記展開所有符合篩選的空間，顯示照片、席位、安靜與設備，以及詳細頁及官方地圖連結。
- 比較最多 3 個空間；使用原生 dialog 支援焦點限制、Escape 關閉與手機橫向表格捲動。
- 包包寄放、抵押學生證、場地外借等規則均完整呈現。沒有新增 PDF 未記載的開放時間或設備。
- 網站沒有後端、資料庫或登入，搜尋與比較在瀏覽器內執行。
- 底圖若連線失敗，顯示重新載入按鈕；檢索、圖釘、照片與詳情仍可使用。

## 技術

React 19、TypeScript、Vite 7、Tailwind CSS 4、Leaflet 1.9.4、OpenStreetMap，圖示使用 Lucide。套件版本由 `package-lock.json` 鎖定；圖片不使用其他建築照片或生成圖片。

## 測試與圖磚政策

功能回歸測試使用測試用 SVG 圖磚，避免自動化縮放、掃描或 Playwright routing 的停用快取機制打到 OSM 公共服務。測試圖磚僅存在 tests/e2e/fixtures.ts，不會進入正式網站。真正的底圖另外以一般視窗 Chrome、真實 HTTP 本機伺服器及被動 Network 記錄驗證，不攔截圖磚、不改 User-Agent、不偽造 Referer。

受限沙盒可以用 `PLAYWRIGHT_LOCAL_FILES=1` 提供 dist 資源做功能回歸；這不是實際 HTTP 底圖驗證。2026-10-11 的修復原因、請求與快取證據見 `docs/MAP_FIX.md`、`docs/map-network-after.json`。

```powershell
$env:PLAYWRIGHT_LOCAL_FILES = "1"
npm run test:e2e
```

OSM 標準圖磚不需要 API Key 或本專案的 API 訂閱費，但必須遵守其使用政策且沒有服務可用性保證。此課程網站維持原服務，未改用其他供應商。若日後改用有商業額度的供應商，需先核對它的授權、金鑰、費用與 attribution，並調整 src/mapTiles.ts；不可只替換成未確認的鏡像網址。
