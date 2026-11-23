 "use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
type Item={id:number,position:number,recipe:{id:string,title:string,category:string|null}};
export default function Stack(){
 const [items,setItems]=useState<Item[]>([]); const supabase=createClient();
 async function load(){const {data}=await supabase.from("recipe_stack").select("id,position,recipe:recipes(id,title,category)").order("position");setItems((data as unknown as Item[])??[]);}
 useEffect(()=>{load()},[]);
 async function remove(id:number){await supabase.from("recipe_stack").delete().eq("id",id);load();}
 return <main className="container"><h1>Dein Rezept-Stack</h1><p className="muted">Keine festen Wochentage – einfach die nächsten Gerichte in Reihenfolge.</p>
 <div className="space"/><div className="grid">{items.map((i,n)=><div className="card" key={i.id}><span className="badge">#{n+1}</span><h3><Link href={`/recipes/${i.recipe.id}`}>{i.recipe.title}</Link></h3><p className="muted">{i.recipe.category}</p><button className="btn secondary" onClick={()=>remove(i.id)}>Aus Stack entfernen</button></div>)}</div>
 {!items.length&&<div className="card">Dein Stack ist leer. Öffne ein Rezept und füge es hinzu.</div>}
 </main>;
}
