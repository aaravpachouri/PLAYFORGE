-- The 7-Day Level Up uses the same Supabase Auth identity as PLAYFORGE.
-- Its completion records remain separate from public.player_data.
create table if not exists public.challenge_day_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  day_index smallint not null check (day_index >= 0 and day_index <= 6),
  completed_at timestamptz not null default now(),
  primary key (user_id, day_index)
);

alter table public.challenge_day_completions enable row level security;

drop policy if exists "Players can read their own challenge days" on public.challenge_day_completions;
create policy "Players can read their own challenge days"
  on public.challenge_day_completions for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Players can add their own challenge days" on public.challenge_day_completions;
create policy "Players can add their own challenge days"
  on public.challenge_day_completions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Players can remove their own challenge days" on public.challenge_day_completions;
create policy "Players can remove their own challenge days"
  on public.challenge_day_completions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.challenge_day_completions from anon;
grant select, insert, delete on public.challenge_day_completions to authenticated;
