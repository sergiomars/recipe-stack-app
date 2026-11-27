-- Server-only allow-list for administrators. Never expose this table to app clients.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from public, anon, authenticated;
grant all on public.admin_users to service_role;

create table if not exists public.suspended_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  suspended_at timestamptz not null default now()
);
alter table public.suspended_users enable row level security;
revoke all on public.suspended_users from public, anon, authenticated;
grant all on public.suspended_users to service_role;

create or replace function public.is_current_user_suspended()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.suspended_users where user_id = auth.uid()
  );
$$;
revoke all on function public.is_current_user_suspended() from public, anon;
grant execute on function public.is_current_user_suspended() to authenticated, service_role;

-- Apply suspension checks even to existing user-data RLS policies.
drop policy if exists "users read own stack" on public.recipe_stack;
drop policy if exists "users add to own stack" on public.recipe_stack;
drop policy if exists "users update own stack" on public.recipe_stack;
drop policy if exists "users remove from own stack" on public.recipe_stack;
create policy "users read own stack" on public.recipe_stack
  for select to authenticated using (user_id = (select auth.uid()) and not public.is_current_user_suspended());
create policy "users add to own stack" on public.recipe_stack
  for insert to authenticated with check (user_id = (select auth.uid()) and not public.is_current_user_suspended());
create policy "users update own stack" on public.recipe_stack
  for update to authenticated using (user_id = (select auth.uid()) and not public.is_current_user_suspended())
  with check (user_id = (select auth.uid()) and not public.is_current_user_suspended());
create policy "users remove from own stack" on public.recipe_stack
  for delete to authenticated using (user_id = (select auth.uid()) and not public.is_current_user_suspended());

drop policy if exists "users read own shopping items" on public.shopping_items;
drop policy if exists "users add own shopping items" on public.shopping_items;
drop policy if exists "users update own shopping items" on public.shopping_items;
drop policy if exists "users remove own shopping items" on public.shopping_items;
create policy "users read own shopping items" on public.shopping_items
  for select to authenticated using (user_id = (select auth.uid()) and not public.is_current_user_suspended());
create policy "users add own shopping items" on public.shopping_items
  for insert to authenticated with check (user_id = (select auth.uid()) and not public.is_current_user_suspended());
create policy "users update own shopping items" on public.shopping_items
  for update to authenticated using (user_id = (select auth.uid()) and not public.is_current_user_suspended())
  with check (user_id = (select auth.uid()) and not public.is_current_user_suspended());
create policy "users remove own shopping items" on public.shopping_items
  for delete to authenticated using (user_id = (select auth.uid()) and not public.is_current_user_suspended());

create or replace function public.admin_update_recipe(
  p_recipe_id uuid,
  p_title text,
  p_description text,
  p_category text,
  p_ingredients jsonb,
  p_steps jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.recipes
  set title = p_title, description = p_description, category = p_category
  where id = p_recipe_id;
  if not found then
    raise exception 'Recipe not found';
  end if;

  delete from public.recipe_ingredients where recipe_id = p_recipe_id;
  insert into public.recipe_ingredients (recipe_id, amount, unit, name)
  select p_recipe_id, nullif(item->>'amount', ''), nullif(item->>'unit', ''), item->>'name'
  from jsonb_array_elements(p_ingredients) as ingredients(item);

  delete from public.recipe_steps where recipe_id = p_recipe_id;
  insert into public.recipe_steps (recipe_id, step_number, description)
  select p_recipe_id, entry.ordinality::integer, entry.description
  from jsonb_array_elements_text(p_steps) with ordinality as entry(description, ordinality);
end;
$$;

revoke all on function public.admin_update_recipe(uuid, text, text, text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.admin_update_recipe(uuid, text, text, text, jsonb, jsonb) to service_role;

-- First create your account through /login, then add it as an admin here:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'your-admin@example.com';
