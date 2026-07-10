# 日本旅遊記帳 App — Supabase 雲端同步版

1. 在 Supabase 建立新 project。
2. 到 SQL Editor 貼上 `schema.sql` 並執行。
3. 到 Project Settings / API 取得 Project URL 與 anon key 或 publishable key。
4. 不要使用 service_role key。
5. 將本資料夾上傳到 GitHub Pages。
6. 第一次開啟 App 時貼上 Project URL 與 key，按「儲存設定」。

安全提醒：目前政策允許 anon 讀取與新增，適合私人、不敏感資料。若公開網站網址，其他人可能寫入資料。更安全的做法是加入 Supabase Auth，再將 RLS 政策改成只允許登入者使用自己的資料。
