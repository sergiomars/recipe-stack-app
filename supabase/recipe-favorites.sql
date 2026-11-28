-- Per-user recipe favorites. Recipes themselves remain shared and public.
create table if not exists public.recipe_favorites (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

alter table public.recipe_favorites enable row level security;
grant select, insert, delete on public.recipe_favorites to authenticated;

drop policy if exists "users read own recipe favorites" on public.recipe_favorites;
drop policy if exists "users add own recipe favorites" on public.recipe_favorites;
drop policy if exists "users remove own recipe favorites" on public.recipe_favorites;

create policy "users read own recipe favorites" on public.recipe_favorites
  for select to authenticated using (user_id = (select auth.uid()));
create policy "users add own recipe favorites" on public.recipe_favorites
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "users remove own recipe favorites" on public.recipe_favorites
  for delete to authenticated using (user_id = (select auth.uid()));
