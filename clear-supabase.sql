-- 安全清除 public.expenses：先備份，再清空
begin;

create table if not exists public.expenses_backup (
  backup_id bigint generated always as identity primary key,
  backed_up_at timestamptz not null default now(),
  expense jsonb not null
);

insert into public.expenses_backup (expense)
select to_jsonb(e)
from public.expenses e;

truncate table public.expenses restart identity;

commit;

-- 確認已清空
select count(*) as expenses_remaining from public.expenses;

-- 確認備份筆數
select count(*) as backup_rows from public.expenses_backup;
