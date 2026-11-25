-- Personalize shopping lists and recipe stacks while keeping recipes public.
-- Existing rows stay in place with user_id = NULL and are private after these policies.

alter table public.recipe_stack
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.recipe_stack
  alter column user_id set default auth.uid();

alter table public.shopping_items
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.shopping_items
  alter column user_id set default auth.uid();

drop policy if exists "public all stack" on public.recipe_stack;
drop policy if exists "public all shopping" on public.shopping_items;
drop policy if exists "users read own stack" on public.recipe_stack;
drop policy if exists "users add to own stack" on public.recipe_stack;
drop policy if exists "users update own stack" on public.recipe_stack;
drop policy if exists "users remove from own stack" on public.recipe_stack;
drop policy if exists "users read own shopping items" on public.shopping_items;
drop policy if exists "users add own shopping items" on public.shopping_items;
drop policy if exists "users update own shopping items" on public.shopping_items;
drop policy if exists "users remove own shopping items" on public.shopping_items;

create policy "users read own stack" on public.recipe_stack
  for select to authenticated using (user_id = (select auth.uid()));
create policy "users add to own stack" on public.recipe_stack
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "users update own stack" on public.recipe_stack
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "users remove from own stack" on public.recipe_stack
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "users read own shopping items" on public.shopping_items
  for select to authenticated using (user_id = (select auth.uid()));
create policy "users add own shopping items" on public.shopping_items
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "users update own shopping items" on public.shopping_items
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "users remove own shopping items" on public.shopping_items
  for delete to authenticated using (user_id = (select auth.uid()));
