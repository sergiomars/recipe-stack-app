-- Shared category catalog and up to three categories per recipe.
create table if not exists public.recipe_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.recipe_category_links (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  category_id uuid not null references public.recipe_categories(id) on delete cascade,
  primary key (recipe_id, category_id)
);

alter table public.recipe_categories enable row level security;
alter table public.recipe_category_links enable row level security;
grant select on public.recipe_categories to anon, authenticated, service_role;
grant select, insert on public.recipe_category_links to anon, authenticated;
grant all on public.recipe_categories, public.recipe_category_links to service_role;

drop policy if exists "public read recipe categories" on public.recipe_categories;
create policy "public read recipe categories" on public.recipe_categories
  for select to anon, authenticated using (true);
drop policy if exists "public read recipe category links" on public.recipe_category_links;
create policy "public read recipe category links" on public.recipe_category_links
  for select to anon, authenticated using (true);
drop policy if exists "public add recipe category links" on public.recipe_category_links;
create policy "public add recipe category links" on public.recipe_category_links
  for insert to anon, authenticated with check (true);

-- Migrate the existing free-text category values into the shared catalog.
insert into public.recipe_categories (name)
select distinct btrim(value)
from public.recipes
cross join lateral regexp_split_to_table(coalesce(category, ''), ',') as old_category(value)
where btrim(value) <> ''
on conflict (name) do nothing;

insert into public.recipe_category_links (recipe_id, category_id)
select recipes.id, categories.id
from public.recipes
cross join lateral regexp_split_to_table(coalesce(recipes.category, ''), ',') with ordinality as old_category(name, position)
join public.recipe_categories as categories on categories.name = btrim(old_category.name)
where old_category.position <= 3 and btrim(old_category.name) <> ''
on conflict do nothing;

update public.recipes set category = null where category is not null;

create or replace function public.enforce_recipe_category_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.recipe_id::text, 0));
  select count(*) into existing_count
  from public.recipe_category_links
  where recipe_id = new.recipe_id;
  if existing_count >= 3 then
    raise exception 'A recipe can have at most 3 categories';
  end if;
  return new;
end;
$$;

drop trigger if exists recipe_category_limit on public.recipe_category_links;
create trigger recipe_category_limit
before insert on public.recipe_category_links
for each row execute function public.enforce_recipe_category_limit();

drop function if exists public.admin_update_recipe(uuid, text, text, text, jsonb, jsonb);
create or replace function public.admin_update_recipe(
  p_recipe_id uuid,
  p_title text,
  p_description text,
  p_ingredients jsonb,
  p_steps jsonb,
  p_category_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(cardinality(p_category_ids), 0) > 3 then
    raise exception 'A recipe can have at most 3 categories';
  end if;
  update public.recipes
  set title = p_title, description = p_description, category = null
  where id = p_recipe_id;
  if not found then
    raise exception 'Recipe not found';
  end if;

  delete from public.recipe_category_links where recipe_id = p_recipe_id;
  insert into public.recipe_category_links (recipe_id, category_id)
  select p_recipe_id, selected.category_id from unnest(p_category_ids) as selected(category_id);

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

revoke all on function public.admin_update_recipe(uuid, text, text, jsonb, jsonb, uuid[]) from public, anon, authenticated;
grant execute on function public.admin_update_recipe(uuid, text, text, jsonb, jsonb, uuid[]) to service_role;
