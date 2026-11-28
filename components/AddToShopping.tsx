 "use client";
import { createClient } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
import { addShoppingItems } from "@/lib/shopping-items";
export default function AddToShopping({recipeId}:{recipeId:string}) {
  async function add() {
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href="/login";return;}
    const {data:items,error:loadError}=await supabase.from("recipe_ingredients").select("name,amount,unit").eq("recipe_id",recipeId);
    if(loadError){showToast(loadError.message,"error");return;}
    if(!items?.length){showToast("Für dieses Rezept sind keine Zutaten hinterlegt.","info");return;}
    try {
      const result=await addShoppingItems(items.map(i=>({name:i.name,amount:i.amount,unit:i.unit,source_recipe_id:recipeId})));
      showToast(result.merged ? `Zutaten ergänzt; ${result.merged} doppelte Einträge zusammengeführt.` : "Zutaten zur Einkaufsliste hinzugefügt.");
    } catch(error) {
      showToast(error instanceof Error ? error.message : "Zutaten konnten nicht hinzugefügt werden.","error");
    }
  }
  return <button className="btn secondary" onClick={add}>+ Einkauf</button>;
}
