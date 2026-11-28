import { createSupabaseServerClient } from "@/lib/supabase-server";
import AddToShopping from "@/components/AddToShopping";
import AddToStack from "@/components/AddToStack";
import FavoriteButton from "@/components/FavoriteButton";
import { relationArray } from "@/lib/relations";

export default async function RecipePage({params}:{params:Promise<{id:string}>}) {
  const {id} = await params;
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  const {data:recipe}=await supabase.from("recipes").select("*").eq("id",id).single();
  if(!recipe) return <main className="container"><h1>Nicht gefunden</h1></main>;
  const {data:favorite}=user ? await supabase.from("recipe_favorites").select("recipe_id").eq("recipe_id",id).maybeSingle() : {data:null};
  const {data:categoryLinks}=await supabase.from("recipe_category_links").select("category:recipe_categories(name)").eq("recipe_id",id);
  const {data:ingredients}=await supabase.from("recipe_ingredients").select("*").eq("recipe_id",id).order("id");
  const {data:steps}=await supabase.from("recipe_steps").select("*").eq("recipe_id",id).order("step_number");
  const categories=(categoryLinks??[]).flatMap(link=>relationArray(link.category));

  return <main className="container">
    {categories.length ? categories.map((category,index)=><span className="badge" key={index}>{category.name}</span>) : <span className="badge">{recipe.category || "Rezept"}</span>}
    <h1>{recipe.title}</h1><p className="muted">{recipe.description}</p>
    <div className="row"><AddToShopping recipeId={id}/><AddToStack recipeId={id}/>{user&&<FavoriteButton recipeId={id} initialFavorite={Boolean(favorite)}/>}</div>
    <div className="space"/>
    <div className="grid">
      <section className="card"><h2>Zutaten</h2><ul className="list">{(ingredients??[]).map(i=><li key={i.id}><span>{i.amount} {i.unit} {i.name}</span></li>)}</ul></section>
      <section className="card"><h2>Zubereitung</h2><ol>{(steps??[]).map(s=><li key={s.id} style={{marginBottom:12}}>{s.description}</li>)}</ol></section>
    </div>
  </main>;
}
