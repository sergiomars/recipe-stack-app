 "use client";
import { createClient } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
export default function AddToShopping({recipeId}:{recipeId:string}) {
  async function add() {
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href="/login";return;}
    const {data:items,error:loadError}=await supabase.from("recipe_ingredients").select("name,amount,unit").eq("recipe_id",recipeId);
    if(loadError){showToast(loadError.message,"error");return;}
    if(!items?.length){showToast("Für dieses Rezept sind keine Zutaten hinterlegt.","info");return;}
    const {error}=await supabase.from("shopping_items").insert(items.map(i=>({name:i.name,amount:i.amount,unit:i.unit,source_recipe_id:recipeId})));
    if(error){showToast(error.message,"error");return;}
    showToast("Zutaten zur Einkaufsliste hinzugefügt.");
  }
  return <button className="btn secondary" onClick={add}>+ Einkauf</button>;
}
