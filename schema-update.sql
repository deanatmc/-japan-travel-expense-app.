alter table public.expenses
add column if not exists twd numeric;

alter table public.expenses enable row level security;

drop policy if exists "anon can read expenses" on public.expenses;
drop policy if exists "anon can insert expenses" on public.expenses;

create policy "anon can read expenses"
on public.expenses for select
to anon using (true);

create policy "anon can insert expenses"
on public.expenses for insert
to anon with check (true);
