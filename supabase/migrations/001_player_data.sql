-- PLAYFORGE per-account cloud save.
-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.player_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint player_data_size_limit check (pg_column_size(data) <= 1048576)
);

alter table public.player_data enable row level security;

drop policy if exists "Players can read their own save" on public.player_data;
create policy "Players can read their own save"
  on public.player_data for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Players can create their own save" on public.player_data;
create policy "Players can create their own save"
  on public.player_data for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Players can update their own save" on public.player_data;
create policy "Players can update their own save"
  on public.player_data for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on public.player_data from anon;
grant select, insert, update on public.player_data to authenticated;
