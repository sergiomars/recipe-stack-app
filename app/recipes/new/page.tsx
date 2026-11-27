 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function NewRecipe() {
  const router = useRouter();
  const supabase = createClient();
  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");
  const [categories,setCategories] = useState<{id:string;name:string}[]>([]);
  const [categoryIds,setCategoryIds] = useState<string[]>([]);
  const [ingredients,setIngredients] = useState("200 g Pasta\n2 Eier\n50 g Parmesan");
  const [steps,setSteps] = useState("Pasta kochen.\nEier und Parmesan verrühren.\nAlles mischen.");
  const [busy,setBusy] = useState(false);

  useEffect(() => {
    supabase.from("recipe_categories").select("id,name").order("name").then(({data,error}) => {
      if(error) alert(`Kategorien konnten nicht geladen werden: ${error.message}`);
      else setCategories(data ?? []);
    });
  }, [supabase]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const { data: recipe, error } = await supabase
      .from("recipes")
      .insert({title, description, category:null})
      .select("id").single();
    if (error || !recipe) { alert(error?.message ?? "Fehler"); setBusy(false); return; }

    if (categoryIds.length) {
      const {error:categoryError}=await supabase.from("recipe_category_links").insert(categoryIds.map(category_id=>({recipe_id:recipe.id,category_id})));
      if(categoryError){alert(`Rezept erstellt, Kategorien konnten nicht gespeichert werden: ${categoryError.message}`);setBusy(false);return;}
    }

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
      <label>Kategorien (maximal 3)</label>
      {categories.length ? <div className="category-options">{categories.map(category=><label className="category-option" key={category.id}><input type="checkbox" checked={categoryIds.includes(category.id)} disabled={!categoryIds.includes(category.id)&&categoryIds.length>=3} onChange={event=>setCategoryIds(current=>event.target.checked?[...current,category.id]:current.filter(id=>id!==category.id))}/>{category.name}</label>)}</div> : <p className="muted">Noch keine Kategorien. Ein Admin kann sie im Adminbereich anlegen.</p>}
      <label>Zutaten</label><textarea rows={7} value={ingredients} onChange={e=>setIngredients(e.target.value)} />
      <p className="muted">Eine Zutat pro Zeile, z.B. <code>200 g Pasta</code>.</p>
      <label>Zubereitung</label><textarea rows={7} value={steps} onChange={e=>setSteps(e.target.value)} />
      <div className="space" />
      <button className="btn" disabled={busy}>{busy ? "Speichere..." : "Rezept speichern"}</button>
    </form>
  </main>;
}
