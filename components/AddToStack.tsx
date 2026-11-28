 "use client";
import { createClient } from "@/lib/supabase";
import { showToast } from "@/lib/toast";
export default function AddToStack({recipeId}:{recipeId:string}) {
  async function add() {
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href="/login";return;}
    const {data:existing,error:lookupError}=await supabase.from("recipe_stack").select("id").eq("recipe_id",recipeId).maybeSingle();
    if(lookupError){showToast(lookupError.message,"error");return;}
    if(existing){showToast("Dieses Rezept ist bereits in deinem Vorrat.","info");return;}
    const {data:stack}=await supabase.from("recipe_stack").select("position").order("position",{ascending:false}).limit(1);
    const position=(stack?.[0]?.position ?? 0)+1;
    const {error}=await supabase.from("recipe_stack").insert({recipe_id:recipeId,position});
    if(error){showToast(error.message,"error");return;}
    showToast("Rezept zum Vorrat hinzugefügt.");
  }
  return <button className="btn" onClick={add}>+ Zum Vorrat</button>;
}
