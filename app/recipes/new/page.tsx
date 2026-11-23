 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function NewRecipe() {
  const router = useRouter();
  const supabase = createClient();
  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");
  const [category,setCategory] = useState("");
  const [ingredients,setIngredients] = useState("200 g Pasta\n2 Eier\n50 g Parmesan");
  const [steps,setSteps] = useState("Pasta kochen.\nEier und Parmesan verrühren.\nAlles mischen.");
  const [busy,setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const { data: recipe, error } = await supabase
      .from("recipes")
      .insert({title, description, category})
      .select("id").single();
    if (error || !recipe) { alert(error?.message ?? "Fehler"); setBusy(false); return; }

    const ingredientRows = ingredients.split("\n").filter(Boolean).map(line => {
      const m = line.match(/^\\s*([0-9.,]+)?\\s*(\\S+)?\\s+(.+)$/);
      return { recipe_id: recipe.id, amount: m?.[1] ?? null, unit: m?.[2] ?? null, name: m?.[3] ?? line };
    });
    const stepRows = steps.split("\n").filter(Boolean).map((description,i) => ({recipe_id:recipe.id, step_number:i+1, description}));
    await supabase.from("recipe_ingredients").insert(ingredientRows);
    await supabase.from("recipe_steps").insert(stepRows);
    router.push(`/recipes/${recipe.id}`);
  }

  return <main className="container">
    <h1>Neues Rezept</h1>
    <form className="form" onSubmit={save}>
      <label>Titel</label><input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="z.B. Spaghetti Carbonara"/>
      <label>Beschreibung</label><textarea value={description} onChange={e=>setDescription(e.target.value)} />
      <label>Kategorie</label><input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Pasta, Vegi, Schnell..."/>
      <label>Zutaten</label><textarea rows={7} value={ingredients} onChange={e=>setIngredients(e.target.value)} />
      <p className="muted">Eine Zutat pro Zeile, z.B. <code>200 g Pasta</code>.</p>
      <label>Zubereitung</label><textarea rows={7} value={steps} onChange={e=>setSteps(e.target.value)} />
      <div className="space" />
      <button className="btn" disabled={busy}>{busy ? "Speichere..." : "Rezept speichern"}</button>
    </form>
  </main>;
}
