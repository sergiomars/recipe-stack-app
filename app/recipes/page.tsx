import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default async function RecipesPage() {
  const supabase = createClient();
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id,title,description,category")
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
      <div className="grid">
        {(recipes ?? []).map((r) => (
          <Link className="card" href={`/recipes/${r.id}`} key={r.id}>
            {r.category && <span className="badge">{r.category}</span>}
            <h3>{r.title}</h3>
            <p className="muted">{r.description || "Keine Beschreibung."}</p>
          </Link>
        ))}
      </div>
      {(!recipes || recipes.length === 0) && (
        <div className="card">
          Noch keine Rezepte. <Link href="/recipes/new"><u>Erstes Rezept anlegen</u></Link>
        </div>
      )}
    </main>
  );
}
