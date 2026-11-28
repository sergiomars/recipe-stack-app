 "use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import AuthGate from "@/components/AuthGate";
import { relationArray } from "@/lib/relations";
type Item={id:number,position:number,recipe:{id:string,title:string,categories:{category:{name:string}|{name:string}[]|null}[]}};
export default function Stack(){
 const [items,setItems]=useState<Item[]>([]);
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 const supabase=createClient();
 async function load(){
  const {data,error}=await supabase.from("recipe_stack").select("id,position,recipe:recipes(id,title,categories:recipe_category_links(category:recipe_categories(name)))").order("position");
  if(error){setMessage(`Vorrat konnte nicht geladen werden: ${error.message}`);return;}
  setItems((data as unknown as Item[])??[]);
 }
 useEffect(()=>{load()},[]);
 async function remove(id:number){
  const {error}=await supabase.from("recipe_stack").delete().eq("id",id);
  if(error){setMessage(`Rezept konnte nicht entfernt werden: ${error.message}`);return;}
  setMessage("");
  await load();
 }
 async function addStackToShopping(){
  if(!items.length){setMessage("Füge zuerst Rezepte zu deinem Vorrat hinzu.");return;}
  setBusy(true);setMessage("");
  const recipeIds=items.map(item=>item.recipe.id);
  const {data:ingredients,error:ingredientsError}=await supabase.from("recipe_ingredients").select("recipe_id,name,amount,unit").in("recipe_id",recipeIds);
  if(ingredientsError){setMessage(`Zutaten konnten nicht geladen werden: ${ingredientsError.message}`);setBusy(false);return;}
  if(!ingredients?.length){setMessage("Für die Rezepte in deinem Vorrat sind keine Zutaten hinterlegt.");setBusy(false);return;}
  const {error}=await supabase.from("shopping_items").insert(ingredients.map(ingredient=>({
   name:ingredient.name,amount:ingredient.amount,unit:ingredient.unit,source_recipe_id:ingredient.recipe_id
  })));
  setMessage(error?`Zutaten konnten nicht hinzugefügt werden: ${error.message}`:`${ingredients.length} Zutaten zur Einkaufsliste hinzugefügt.`);
  setBusy(false);
 }
 return <AuthGate><main className="container"><h1>Dein Vorrat</h1><p className="muted">Rezepte, die du zuhause kochen möchtest – in deiner eigenen Reihenfolge.</p>
 <div className="row"><button className="btn" onClick={addStackToShopping} disabled={busy||!items.length}>{busy?"Wird hinzugefügt…":"Alle Zutaten zum Einkauf hinzufügen"}</button><Link className="btn secondary" href="/shopping">Einkaufsliste öffnen</Link></div>
 {message&&<p role="status" className="muted">{message}</p>}
 <div className="space"/><div className="grid">{items.map((i,n)=><div className="card" key={i.id}><span className="badge">#{n+1}</span><h3><Link href={`/recipes/${i.recipe.id}`}>{i.recipe.title}</Link></h3><p className="muted">{i.recipe.categories.flatMap(link=>relationArray(link.category).map(category=>category.name)).join(" · ")}</p><button className="btn secondary" onClick={()=>remove(i.id)}>Aus Vorrat entfernen</button></div>)}</div>
 {!items.length&&<div className="card">Dein Vorrat ist noch leer. Öffne ein Rezept und füge es hinzu.</div>}
 </main></AuthGate>;
}
