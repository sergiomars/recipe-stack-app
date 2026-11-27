"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { relationArray } from "@/lib/relations";

type AdminUser = {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  isSuspended: boolean;
  isAdmin: boolean;
};
type Recipe = {
  id: string;
  title: string;
  description: string | null;
  categories: { category: { id: string; name: string } | { id: string; name: string }[] | null }[];
  ingredients: { id: number; name: string; amount: string | null; unit: string | null }[];
  steps: { id: number; step_number: number; description: string }[];
};
type RecipeCategory = { id: string; name: string };

async function getError(response: Response) {
  const body = await response.json().catch(() => ({}));
  return body.error ?? body.message ?? "Unbekannter Fehler.";
}

export default function AdminDashboard({ adminEmail }: { adminEmail: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [ingredientText, setIngredientText] = useState("");
  const [stepText, setStepText] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadData() {
    const [userResponse, recipeResponse, categoryResponse] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/admin/recipes"),
      fetch("/api/admin/categories"),
    ]);
    if (!userResponse.ok) { setNotice(await getError(userResponse)); return; }
    if (!recipeResponse.ok) { setNotice(await getError(recipeResponse)); return; }
    if (!categoryResponse.ok) { setNotice(await getError(categoryResponse)); return; }
    const userBody = await userResponse.json();
    const recipeBody = await recipeResponse.json();
    const categoryBody = await categoryResponse.json();
    setUsers(userBody.users);
    setRecipes(recipeBody.recipes);
    setCategories(categoryBody.categories);
    setNotice("");
  }

  useEffect(() => { loadData(); }, []);

  async function inviteUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    const response = await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: inviteEmail }),
    });
    if (!response.ok) setNotice(await getError(response));
    else { const body = await response.json(); setNotice(body.message); setInviteEmail(""); await loadData(); }
    setBusy(false);
  }

  async function userAction(user: AdminUser, action: "ban" | "unban" | "delete") {
    if (action === "delete" && !window.confirm(`Benutzer ${user.email ?? user.id} endgültig löschen? Seine Einkaufsliste und sein Stack werden ebenfalls gelöscht.`)) return;
    setBusy(true); setNotice("");
    const response = action === "delete"
      ? await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, { method: "DELETE" })
      : await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, action }) });
    if (!response.ok) setNotice(await getError(response));
    else { const body = await response.json(); setNotice(body.message); await loadData(); }
    setBusy(false);
  }

  function startEditing(recipe: Recipe) {
    setEditing(recipe);
    setIngredientText(recipe.ingredients.map(item => [item.amount, item.unit, item.name].filter(Boolean).join(" ")).join("\n"));
    setStepText(recipe.steps.sort((a, b) => a.step_number - b.step_number).map(step => step.description).join("\n"));
    setSelectedCategoryIds(recipe.categories.flatMap(link => relationArray(link.category).map(category => category.id)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    const response = await fetch("/api/admin/categories", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCategory }),
    });
    if (!response.ok) setNotice(await getError(response));
    else { setNewCategory(""); setNotice("Kategorie erstellt."); await loadData(); }
    setBusy(false);
  }

  async function deleteCategory(category: RecipeCategory) {
    if (!window.confirm(`Kategorie „${category.name}“ löschen? Sie wird auch aus allen Rezepten entfernt.`)) return;
    setBusy(true); setNotice("");
    const response = await fetch(`/api/admin/categories?id=${encodeURIComponent(category.id)}`, { method: "DELETE" });
    if (!response.ok) setNotice(await getError(response));
    else { setNotice("Kategorie gelöscht."); setEditing(null); await loadData(); }
    setBusy(false);
  }

  async function saveRecipe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const formData = new FormData(event.currentTarget);
    const ingredients = ingredientText.split("\n").map(line => line.trim()).filter(Boolean).map(line => {
      const match = line.match(/^(\d+(?:[.,]\d+)?)(?:\s+(\S+))?\s+(.+)$/);
      return match
        ? { amount: match[1], unit: match[2] ?? "", name: match[3] }
        : { amount: "", unit: "", name: line };
    });
    const steps = stepText.split("\n").map(line => line.trim()).filter(Boolean);
    setBusy(true); setNotice("");
    const response = await fetch(`/api/admin/recipes/${editing.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: formData.get("title"), description: formData.get("description"), ingredients, steps, categoryIds: selectedCategoryIds }),
    });
    if (!response.ok) setNotice(await getError(response));
    else { setNotice("Rezept gespeichert."); setEditing(null); await loadData(); }
    setBusy(false);
  }

  async function deleteRecipe(recipe: Recipe) {
    if (!window.confirm(`Rezept „${recipe.title}“ endgültig löschen?`)) return;
    setBusy(true); setNotice("");
    const response = await fetch(`/api/admin/recipes/${recipe.id}`, { method: "DELETE" });
    if (!response.ok) setNotice(await getError(response));
    else { setNotice("Rezept gelöscht."); if (editing?.id === recipe.id) setEditing(null); await loadData(); }
    setBusy(false);
  }

  async function logout() {
    await createClient().auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div><span className="badge">Administration</span><h1>Adminbereich</h1><p className="muted">Angemeldet als {adminEmail}</p></div>
        <button className="btn secondary" onClick={logout}>Abmelden</button>
      </div>
      {notice && <p className="card" role="status">{notice}</p>}

      <section className="card">
        <h2>Benutzer</h2>
        <form className="row" onSubmit={inviteUser}>
          <input type="email" required placeholder="E-Mail für Einladung" value={inviteEmail} onChange={event => setInviteEmail(event.target.value)} />
          <button className="btn" disabled={busy}>{busy ? "Bitte warten…" : "Einladung senden"}</button>
        </form>
        <p className="muted">Neue Benutzer erhalten eine E-Mail, über die sie ihr Konto einrichten.</p>
        <ul className="list">{users.map(user => {
          const isBanned = user.isSuspended;
          return <li key={user.id}>
            <div><strong>{user.email ?? "Ohne E-Mail"}</strong>{user.isAdmin && <span className="badge">Admin</span>}<br/><small className="muted">Erstellt: {new Date(user.createdAt).toLocaleDateString("de-CH")}{user.lastSignInAt ? ` · Zuletzt aktiv: ${new Date(user.lastSignInAt).toLocaleDateString("de-CH")}` : " · Noch nie angemeldet"}{isBanned ? " · Gesperrt" : ""}</small></div>
            {!user.isAdmin && <div className="row">
              <button className="btn secondary" disabled={busy} onClick={() => userAction(user, isBanned ? "unban" : "ban")}>{isBanned ? "Entsperren" : "Sperren"}</button>
              <button className="btn danger" disabled={busy} onClick={() => userAction(user, "delete")}>Löschen</button>
            </div>}
          </li>;
        })}</ul>
      </section>

      <div className="space" />
      <section className="card">
        <h2>Rezepte</h2>
        <h3>Kategorien verwalten</h3>
        <form className="row" onSubmit={addCategory}>
          <input required maxLength={50} placeholder="Neue Kategorie" value={newCategory} onChange={event => setNewCategory(event.target.value)} />
          <button className="btn" disabled={busy}>{busy ? "Bitte warten…" : "Kategorie erstellen"}</button>
        </form>
        <ul className="list">{categories.map(category=><li key={category.id}><span>{category.name}</span><button className="btn danger" disabled={busy} onClick={()=>deleteCategory(category)}>Löschen</button></li>)}</ul>
        <div className="space" />
        {editing && <form key={editing.id} className="form" onSubmit={saveRecipe}>
          <h3>Rezept bearbeiten</h3>
          <label htmlFor="title">Titel</label><input id="title" name="title" required defaultValue={editing.title}/>
          <label>Kategorien (maximal 3)</label>
          <div className="category-options">{categories.map(category=><label className="category-option" key={category.id}><input type="checkbox" checked={selectedCategoryIds.includes(category.id)} disabled={!selectedCategoryIds.includes(category.id)&&selectedCategoryIds.length>=3} onChange={event=>setSelectedCategoryIds(current=>event.target.checked?[...current,category.id]:current.filter(id=>id!==category.id))}/>{category.name}</label>)}</div>
          <label htmlFor="description">Beschreibung</label><textarea id="description" name="description" defaultValue={editing.description ?? ""}/>
          <label htmlFor="ingredients">Zutaten</label><textarea id="ingredients" rows={7} value={ingredientText} onChange={event => setIngredientText(event.target.value)}/>
          <label htmlFor="steps">Zubereitung</label><textarea id="steps" rows={7} value={stepText} onChange={event => setStepText(event.target.value)}/>
          <div className="row"><button className="btn" disabled={busy}>{busy ? "Speichere…" : "Änderungen speichern"}</button><button type="button" className="btn secondary" onClick={() => setEditing(null)}>Abbrechen</button></div>
        </form>}
        <ul className="list">{recipes.map(recipe => <li key={recipe.id}>
          <div><strong>{recipe.title}</strong><br/><small className="muted">{recipe.categories.flatMap(link=>relationArray(link.category).map(category=>category.name)).join(" · ") || "Ohne Kategorie"}</small></div>
          <div className="row"><button className="btn secondary" disabled={busy} onClick={() => startEditing(recipe)}>Bearbeiten</button><button className="btn danger" disabled={busy} onClick={() => deleteRecipe(recipe)}>Löschen</button></div>
        </li>)}</ul>
      </section>
    </main>
  );
}
