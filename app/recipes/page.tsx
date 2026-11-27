import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { relationArray } from "@/lib/relations";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const supabase = createServerClient();
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id,title,description,categories:recipe_category_links(category:recipe_categories(name))")
    .order("created_at", { ascending: false });

  return (
    <main className="container">
      <div className="row" style={{justifyContent:"space-between"}}>
        <div>
          <h1>Rezepte</h1>
          <p className="muted">Deine Rezept-Sammlung.</p>
        </div>
        <Link className="btn" href="/recipes/new">+ Rezept</Link>
      </div>
      <div className="space" />
      {error && (
        <div className="card" role="alert">
          Rezepte konnten nicht geladen werden: {error.message}
        </div>
      )}
      <div className="grid">
        {(recipes ?? []).map((r) => (
          <Link className="card" href={`/recipes/${r.id}`} key={r.id}>
            {r.categories?.flatMap((link, index) => relationArray(link.category).map((category, categoryIndex) => <span className="badge" key={`${r.id}-${index}-${categoryIndex}`}>{category.name}</span>))}
            <h3>{r.title}</h3>
            <p className="muted">{r.description || "Keine Beschreibung."}</p>
          </Link>
        ))}
      </div>
      {!error && (!recipes || recipes.length === 0) && (
        <div className="card">
          Noch keine Rezepte. <Link href="/recipes/new"><u>Erstes Rezept anlegen</u></Link>
        </div>
      )}
    </main>
  );
}
