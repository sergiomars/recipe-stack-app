 "use client";
import { createClient } from "@/lib/supabase";
export default function AddToStack({recipeId}:{recipeId:string}) {
  async function add() {
    const supabase=createClient();
    const {data:stack}=await supabase.from("recipe_stack").select("position").order("position",{ascending:false}).limit(1);
    const position=(stack?.[0]?.position ?? 0)+1;
    await supabase.from("recipe_stack").insert({recipe_id:recipeId,position});
    alert("Zum Stack hinzugefügt.");
  }
  return <button className="btn" onClick={add}>+ Stack</button>;
}
