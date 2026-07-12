# 日本旅遊記帳 App v5

## 這一版新增
- 刪除按鈕預設完全隱藏
- 必須按「🔒 開啟刪除模式」並確認，刪除按鈕才會顯示
- 60 秒後自動關閉刪除模式
- 「清除全部明細」也只有在刪除模式中才會顯示
- 保留 Excel 匯入、日期序號轉換、單筆新增、匯出 Excel

## 部署
1. 在 Supabase SQL Editor 執行 `schema-update.sql`
2. 把資料夾全部檔案上傳到 GitHub Repository 根目錄
3. 需要清空舊資料時，執行 `clear-supabase.sql`
4. 再匯入 `Japan_Travel_All_Expenses_Actual_Dates.xlsx`

## 注意
目前 anon policy 允許讀寫與刪除；GitHub Pages 若公開，正式長期使用建議加入 Supabase Auth。
