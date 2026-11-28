import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { relationArray } from "@/lib/relations";
import FavoriteButton from "@/components/FavoriteButton";
import AddToStack from "@/components/AddToStack";

export const dynamic = "force-dynamic";

function RecipeCard({ recipe, favorite, canFavorite }: { recipe: any; favorite: boolean; canFavorite: boolean }) {
  return <article className="card recipe-card">
    <div className="recipe-card-top">
      <div>{recipe.categories?.flatMap((link: any, index: number) => relationArray(link.category).map((category: any, categoryIndex: number) => <span className="badge" key={`${recipe.id}-${index}-${categoryIndex}`}>{category.name}</span>))}</div>
      {canFavorite && <FavoriteButton recipeId={recipe.id} initialFavorite={favorite} />}
    </div>
    <Link href={`/recipes/${recipe.id}`} className="recipe-card-link">
      <h3>{recipe.title}</h3>
      <p className="muted">{recipe.description || "Keine Beschreibung."}</p>
    </Link>
    <div className="recipe-card-actions"><AddToStack recipeId={recipe.id} /></div>
  </article>;
}

export default async function RecipesPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: recipes, error }, { data: { user } }] = await Promise.all([
    supabase.from("recipes")
      .select("id,title,description,categories:recipe_category_links(category:recipe_categories(name))")
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  let favoriteIds = new Set<string>();
  let favoritesError = "";
  if (user) {
    const { data: favorites, error: favoriteError } = await supabase.from("recipe_favorites").select("recipe_id");
    if (favoriteError) favoritesError = favoriteError.message;
    else favoriteIds = new Set((favorites ?? []).map(favorite => favorite.recipe_id));
  }

  const favoriteRecipes = (recipes ?? []).filter(recipe => favoriteIds.has(recipe.id));
  const otherRecipes = (recipes ?? []).filter(recipe => !favoriteIds.has(recipe.id));

  return (
    <main className="container">
      <div className="row" style={{justifyContent:"space-between"}}>
        <div><h1>Rezepte</h1><p className="muted">Deine Rezeptsammlung für jeden Tag.</p></div>
        <Link className="btn" href="/recipes/new">+ Rezept</Link>
      </div>
      <div className="space" />
      {error && <div className="card" role="alert">Rezepte konnten nicht geladen werden: {error.message}</div>}
      {user && <section className="recipe-section">
        <div className="section-heading"><div><h2>Deine Favoriten</h2><p>Deine gespeicherten Lieblingsrezepte.</p></div></div>
        {favoritesError && <div className="card" role="alert">Favoriten konnten nicht geladen werden: {favoritesError}</div>}
        {favoriteRecipes.length ? <div className="grid">{favoriteRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} favorite canFavorite />)}</div> : <div className="card muted">Noch keine Favoriten. Tippe bei einem Rezept auf ☆, um es hier zu speichern.</div>}
      </section>}
      <section className="recipe-section">
        {user && <div className="section-heading"><div><h2>Alle Rezepte</h2><p>Stöbere in deiner Rezeptsammlung.</p></div></div>}
        <div className="grid">{otherRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} favorite={false} canFavorite={Boolean(user)} />)}</div>
      </section>
      {!error && !recipes?.length && <div className="card">Noch keine Rezepte. <Link href="/recipes/new"><u>Erstes Rezept anlegen</u></Link></div>}
    </main>
  );
}
