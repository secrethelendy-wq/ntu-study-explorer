# GitHub Pages 發布說明

專案根目錄是 `outputs/ntu-study-explorer`，也就是同時包含 `package.json`、`src`、`public` 和 `.github` 的資料夾。這些內容必須位於 GitHub 儲存庫根目錄，不要再包在 `outputs` 或另一層 `ntu-study-explorer` 資料夾內。

## 全程使用 GitHub 網頁

1. 登入 [GitHub 的建立儲存庫頁面](https://github.com/new)。Repository name 填入 **ntu-study-explorer**，選擇 **Public**，勾選 **Add a README file**，再點 **Create repository**。若已建立儲存庫，直接使用它；若還是空的，先按 **creating a new file** 新增 README.md，提交到 main。
2. 在儲存庫點 **Settings → Pages**。找到 **Build and deployment → Source**，選擇 **GitHub Actions**。不用另選 Static HTML 範本，部署流程已備妥。
3. 將提供的 **ntu-study-explorer-github-upload.zip** 按右鍵選 **全部解壓縮**。打開能直接看見 package.json 的資料夾。這份上傳包包含完整原始碼、15 筆 JSON 紀錄、18 張原始照片、PDF 查證資料及部署流程，已排除 node_modules、dist 和測試暫存檔。
4. 回到 GitHub 儲存庫的 **Code → Add file → Upload files**。在檔案總管選取解壓縮資料夾「裡面的全部檔案與子資料夾」，拖曳到上傳區。請拖曳解壓後的內容，不要上傳 ZIP 檔，也不要拖曳最外層資料夾。上傳清單應能看見根目錄的 package.json，以及 **.github/workflows/deploy.yml**。
5. Commit message 填入 **Prepare NTU study explorer for GitHub Pages**，選擇提交到 **main**，點 **Commit changes**。已有的 README.md 會更新成這份專案說明。
6. 點 **Actions → Deploy to GitHub Pages**，查看此次執行。**build** 和 **deploy** 都出現綠色勾勾後，回到 **Settings → Pages → Visit site** 開啟網站。
7. 正式網址為 `https://你的GitHub帳號.github.io/ntu-study-explorer/`。網址中的帳號使用建立儲存庫時的 Owner。之後在 main 修改檔案並提交，會自動重新發布。

GitHub 網頁每次可上傳最多 100 個檔案，每個檔案最多 25 MiB。此上傳包已依這些限制檢查；在 Chrome 或 Edge 拖曳資料夾可保留目錄結構。參考 [GitHub 官方上傳說明](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)。

若上傳清單漏掉 .github 資料夾，先完成其他檔案提交，再點 **Add file → Create new file**，檔名輸入 `.github/workflows/deploy.yml`，將本機同名檔案的全文貼入並提交。檔案內容可用記事本開啟；不需命令提示字元。

## 部署流程已設定的內容

- `vite.config.ts` 的 base 為 `/ntu-study-explorer/`。正式 HTML、JavaScript、CSS、favicon 與照片都使用這個子路徑。
- `src/data/spaces.json` 透過 import 隨 JavaScript 一起建置，網站不會從網域根目錄錯誤 fetch JSON。照片原有 `images/…` 路徑由 `import.meta.env.BASE_URL` 加上子路徑，原始 JSON 未修改。
- 既有 hash 路由保留，詳細頁網址如 `/ntu-study-explorer/#/space/s07`，重新整理不依賴伺服器 rewrite。
- `.github/workflows/deploy.yml` 在 main 提交或手動執行時，以 Node.js 24 執行 npm ci、資料驗證、22 個單元測試、npm run build，最後將 dist 上傳並部署到 github-pages 環境。
- 使用 GitHub 官方 Actions，版本固定到已核對的 commit SHA；部署權限限於 Pages 與 OIDC，使用 GitHub 自動提供的 GITHUB_TOKEN，不需要另設 PAT、API Key 或 Secrets。
- Leaflet 維持 OSM 標準 HTTPS 圖磚網址及可見 attribution。HTML 的 strict-origin-when-cross-origin Referrer Policy 讓 Pages 網站提供真實來源，快取由一般瀏覽器及圖磚服務控制。沒有代理、預抓圖磚或停用快取。
- Public 儲存庫可使用 GitHub Free 的 Pages；OSM 標準圖磚沒有本專案的 API 訂閱費或金鑰需求。[GitHub Pages 官方部署文件](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Vite 官方 Pages 說明](https://vite.dev/guide/static-deploy#github-pages)、[OSM 圖磚政策](https://operations.osmfoundation.org/policies/tiles/)。

## 第一次執行若出現紅色失敗

先確認 **Settings → Pages → Source = GitHub Actions**。設定後點 **Actions → Deploy to GitHub Pages → Run workflow**，Branch 選 main，再點綠色 **Run workflow**。若看不到這個流程，確認儲存庫確實含 `.github/workflows/deploy.yml`，且檔案不在另一層資料夾內。

若 GitHub 組織限制 Actions，需在該組織允許 GitHub 官方 Actions；若 github-pages 環境要求人工審核，進入該次執行按 **Review deployments** 完成審核。一般個人 Public 儲存庫無需額外設定。

## 本機預覽與資料維護

雙擊專案的 `啟動網站.cmd`，使用 `http://127.0.0.1:4173/ntu-study-explorer/` 預覽。原本的根網址會轉到正確子路徑。`dist/preview.html` 仍可直接開啟查看 Metadata 及照片；依 OSM 政策，直接開檔不載入外部底圖。

新增或修改資料仍依 README.md、DATA_MODEL.md 的原有步驟，在 src/data/spaces.json 保留原始元件與來源；照片放 public/images。提交到 main 後，Actions 自動重新建置。不要把 node_modules、dist 或整個 ZIP 上傳到儲存庫。

本次只能完成部署準備與相同子路徑的本機實測。實際 GitHub Actions 執行與公開 HTTPS 網址，須在上述檔案上傳並啟用 Pages 後才會產生。
