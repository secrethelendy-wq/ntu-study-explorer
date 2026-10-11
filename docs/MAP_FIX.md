# 互動地圖 403 修復

修復日期：2026-10-11。

## 實際原因與證據

先前預覽用 `file:///.../dist/preview.html`，這種本機來源不會提供有效 HTTP Referer。瀏覽器 Network 的一筆原始請求為：

```
https://tile.openstreetmap.org/16/54893/28061.png
Referer: （缺少）
回應狀態：200，Content-Type: image/png
x-blocked: No referer sent. Access denied. See https://operations.osmfoundation.org/policies/tiles/
```

顯示的「403 Access blocked」是服務回傳的封鎖圖片；HTTP 狀態可能仍是 200。因此只檢查圖片 onload、naturalWidth 或 HTTP 200，不能證明底圖正常。這也是上一版測試漏掉錯誤的原因。

圖磚 HTTPS 網址與 attribution 原本正確；問題在預覽來源。診斷時也發現 Playwright routing 會停用瀏覽器快取，送出 no-cache。這屬於測試工具副作用，不是網站程式主動設定的標頭；現在功能回歸已使用本地測試圖磚，公共 OSM 僅做有限的一般視窗實測。

## 修復

- `src/mapTiles.ts` 集中標準 HTTPS 圖磚網址、來源政策與 attribution。保留 OSM，沒有假造 User-Agent、Referer、代理或鏡像。
- `index.html`、`vite.config.ts`、`scripts/preview-server.mjs` 明確使用 strict-origin-when-cross-origin。瀏覽器發送真實網站 origin 作為 Referer，User-Agent 維持一般瀏覽器值。
- 不對外部圖磚設定 no-cache、不添加隨機 query、不下載離線圖磚，沿用瀏覽器對 OSM Cache-Control／ETag 的處理。只在拖曳與縮放完成後更新所需圖磚，保留已載入的少量周邊快取。
- `CampusMap.tsx` 在 file:// 等無法提供 HTTP 來源的模式完全不建立公共 tileLayer，保留標記、資料搜尋與資訊卡片，提供 HTTP 預覽說明。
- `啟動網站.cmd` 與 `npm run preview` 啟動本機正式版本靜態伺服器，預設 http://127.0.0.1:4173/ 。這個伺服器只提供網站檔案，不代理 OSM 圖磚。
- 回歸測試隔離公共圖磚；直接開檔模式驗證 OSM 請求數為 0。正式網站沒有測試替代圖磚。

## 實測結果

一般視窗 Chrome 從真實 HTTP 伺服器載入正式建置，沒有 routing 或 HTTP 標頭覆寫：

- 本機首頁 HTTP 200，Referrer-Policy 正確。
- 首次視圖請求 16 張圖磚；包括一次放大／縮小，共記錄 44 筆圖磚請求（瀏覽器請求記錄不等於重新下載次數）。沒有 x-blocked 或 HTTP 4xx。
- 所有圖磚請求 Referer 為 `http://127.0.0.1:4173/`，沒有預設 no-cache／Pragma 標頭。
- OSM 回應提供 max-age 與 stale 快取指示；瀏覽器正常處理。回到原縮放級別會重用已載入／快取資源，不透過快取破壞參數重抓。
- 13 個建築標記、15 張空間卡片、同棟 popup、縮放 16→17→16，以及搜尋「綜合」同步減為兩張卡片／一個標記，皆正常。
- JavaScript 錯誤 0。細節見 `map-network-after.json`；原始封鎖證據摘要見 `map-network-before.json`。

執行沙盒的不同命令／視窗可能無法共用 loopback。本次瀏覽器與真實伺服器在同一執行階段完成 HTTP 實測；使用者應在自己的 Windows 直接雙擊啟動腳本，使本機其他瀏覽器視窗可連線。

自習空間 JSON 的 SHA-256 修復前後一致。沒有更動任何空間、照片、設備、座位、座標或記錄者，也沒有重新設計介面。

另以同一持續性瀏覽器快取進行兩次正常瀏覽：首次 16 張全部完整繪製，第二次 16 張命中快取。詳見 `map-cache-check.json`。

## 服務與政策

保留 OSM 官方標準圖磚，不需要 API Key 或本專案的訂閱費。它適合目前有限使用的課程網站，需遵守政策且沒有 SLA。若未來需求超過公共服務可承受範圍，再選擇已確認授權／額度的供應商或自行託管。

來源：[OSMF Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)、[MDN Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy)。
