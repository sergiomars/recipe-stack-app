"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function NewRecipe() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [ingredients, setIngredients] = useState("200 g Pasta\n2 Eier\n50 g Parmesan");
  const [steps, setSteps] = useState("Pasta kochen.\nEier und Parmesan verrühren.\nAlles mischen.");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setError("Bitte gib einen Titel ein.");
      return;
    }

    setBusy(true);
    setError("");

    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        title: normalizedTitle,
        description: description.trim() || null,
        category: category.trim() || null,
      })
      .select("id")
      .single();

    if (recipeError || !recipe) {
      setError(recipeError?.message ?? "Rezept konnte nicht gespeichert werden.");
      setBusy(false);
      return;
    }

    const ingredientRows = ingredients
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const m = line.match(/^\s*([0-9.,]+)?\s*(\S+)?\s+(.+)$/);
        return {
          recipe_id: recipe.id,
          amount: m?.[1] ?? null,
          unit: m?.[2] ?? null,
          name: m?.[3]?.trim() || line,
        };
      });

    const stepRows = steps
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((description, i) => ({
        recipe_id: recipe.id,
        step_number: i + 1,
        description,
      }));

    if (ingredientRows.length) {
      const { error: ingredientError } = await supabase
        .from("recipe_ingredients")
        .insert(ingredientRows);

      if (ingredientError) {
        await supabase.from("recipes").delete().eq("id", recipe.id);
        setError(`Rezept konnte nicht vollständig gespeichert werden: ${ingredientError.message}`);
        setBusy(false);
        return;
      }
    }

    if (stepRows.length) {
      const { error: stepError } = await supabase
        .from("recipe_steps")
        .insert(stepRows);

      if (stepError) {
        await supabase.from("recipes").delete().eq("id", recipe.id);
        setError(`Rezept konnte nicht vollständig gespeichert werden: ${stepError.message}`);
        setBusy(false);
        return;
      }
    }

    router.push(`/recipes/${recipe.id}`);
    router.refresh();
  }

  return (
    <main className="container">
      <h1>Neues Rezept</h1>
      <form className="form" onSubmit={save}>
        <label>Titel</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z.B. Spaghetti Carbonara"
        />
        <label>Beschreibung</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        <label>Kategorie</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Pasta, Vegi, Schnell..."
        />
        <label>Zutaten</label>
        <textarea
          rows={7}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <p className="muted">Eine Zutat pro Zeile, z.B. <code>200 g Pasta</code>.</p>
        <label>Zubereitung</label>
        <textarea rows={7} value={steps} onChange={(e) => setSteps(e.target.value)} />
        {error && <p className="muted" role="alert">{error}</p>}
        <div className="space" />
        <button className="btn" disabled={busy}>
          {busy ? "Speichere..." : "Rezept speichern"}
        </button>
      </form>
    </main>
  );
}
