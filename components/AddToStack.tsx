 "use client";
import { createClient } from "@/lib/supabase";
export default function AddToStack({recipeId}:{recipeId:string}) {
  async function add() {
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href="/login";return;}
    const {data:existing,error:lookupError}=await supabase.from("recipe_stack").select("id").eq("recipe_id",recipeId).maybeSingle();
    if(lookupError){alert(lookupError.message);return;}
    if(existing){alert("Dieses Rezept ist bereits in deinem Stack.");return;}
    const {data:stack}=await supabase.from("recipe_stack").select("position").order("position",{ascending:false}).limit(1);
    const position=(stack?.[0]?.position ?? 0)+1;
    const {error}=await supabase.from("recipe_stack").insert({recipe_id:recipeId,position});
    if(error){alert(error.message);return;}
    alert("Zum Stack hinzugefügt.");
  }
  return <button className="btn" onClick={add}>+ Stack</button>;
}
