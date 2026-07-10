# 日本旅遊記帳 App — Excel 匯入版

## 新增功能
- 匯入 `.xlsx`、`.xls`、`.xlsb`、`.csv`
- Excel 欄位：
  日期｜Day｜店家｜類別｜商品名稱｜數量｜日幣｜台幣｜付款方式｜備註｜建立時間
- 自動檢查欄位
- 預覽前 10 筆
- 顯示錯誤列
- 批次寫入 Supabase
- 可下載 Excel 範本

## 升級資料表
先在 Supabase SQL Editor 執行 `schema-update.sql`，新增 `twd` 欄位。

## 部署
將本資料夾全部檔案覆蓋到 GitHub repository 根目錄，等待 GitHub Pages 重新部署。
