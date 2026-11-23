 "use client";
import { useEffect,useState } from "react";
import { createClient } from "@/lib/supabase";
type Item={id:number,name:string,amount:string|null,unit:string|null,checked:boolean};
export default function Shopping(){
 const [items,setItems]=useState<Item[]>([]); const [name,setName]=useState("");
 const supabase=createClient();
 async function load(){const {data}=await supabase.from("shopping_items").select("*").order("created_at");setItems(data??[]);}
 useEffect(()=>{load()},[]);
 async function add(){if(!name.trim())return; await supabase.from("shopping_items").insert({name:name.trim()});setName("");load();}
 async function toggle(i:Item){await supabase.from("shopping_items").update({checked:!i.checked}).eq("id",i.id);load();}
 async function remove(id:number){await supabase.from("shopping_items").delete().eq("id",id);load();}
 return <main className="container"><h1>Einkauf</h1><p className="muted">Zutaten aus Rezepten oder manuell.</p>
 <div className="row"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Manuell hinzufügen..." onKeyDown={e=>e.key==="Enter"&&add()}/><button className="btn" onClick={add}>+ Hinzufügen</button></div>
 <div className="space"/><div className="card"><ul className="list">{items.map(i=><li key={i.id}><label style={{margin:0,fontWeight:400}}><input type="checkbox" checked={i.checked} onChange={()=>toggle(i)} style={{width:"auto",marginRight:8}}/>{i.amount} {i.unit} {i.name}</label><button className="btn danger" onClick={()=>remove(i.id)}>×</button></li>)}</ul></div>
 </main>;
}
