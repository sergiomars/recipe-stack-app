 "use client";
import { createClient } from "@/lib/supabase";
export default function AddToShopping({recipeId}:{recipeId:string}) {
  async function add() {
    const supabase=createClient();
    const {data:items}=await supabase.from("recipe_ingredients").select("name,amount,unit").eq("recipe_id",recipeId);
    if(!items?.length) return;
    await supabase.from("shopping_items").insert(items.map(i=>({name:i.name,amount:i.amount,unit:i.unit,source_recipe_id:recipeId})));
    alert("Zutaten zur Einkaufsliste hinzugefügt.");
  }
  return <button className="btn secondary" onClick={add}>+ Einkauf</button>;
}
