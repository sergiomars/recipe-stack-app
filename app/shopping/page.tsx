 "use client";
import { useEffect,useState } from "react";
import { createClient } from "@/lib/supabase";
import AuthGate from "@/components/AuthGate";
import { showToast } from "@/lib/toast";
type Item={id:number,name:string,amount:string|null,unit:string|null,checked:boolean};
export default function Shopping(){
 const [items,setItems]=useState<Item[]>([]); const [name,setName]=useState("");
 const [clearing,setClearing]=useState(false);
 const supabase=createClient();
 async function load(){const {data,error}=await supabase.from("shopping_items").select("*").order("created_at");if(error){showToast(error.message,"error");return;}setItems(data??[]);}
 useEffect(()=>{load()},[]);
 async function add(){if(!name.trim())return;const {error}=await supabase.from("shopping_items").insert({name:name.trim()});if(error){showToast(error.message,"error");return;}setName("");showToast("Eintrag zur Einkaufsliste hinzugefügt.");load();}
 async function toggle(i:Item){const {error}=await supabase.from("shopping_items").update({checked:!i.checked}).eq("id",i.id);if(error){showToast(error.message,"error");return;}showToast(i.checked?"Eintrag wieder offen.":"Eintrag abgehakt.","info");load();}
 async function remove(id:number){const {error}=await supabase.from("shopping_items").delete().eq("id",id);if(error){showToast(error.message,"error");return;}showToast("Eintrag aus der Einkaufsliste entfernt.","info");load();}
 async function clearList(){if(!items.length||clearing)return;setClearing(true);const {error}=await supabase.from("shopping_items").delete().not("id","is",null);if(error){showToast(error.message,"error");}else{setItems([]);showToast("Einkaufsliste geleert.","info");}setClearing(false);}
 return <AuthGate><main className="container"><div className="row" style={{justifyContent:"space-between"}}><div><h1>Einkaufsliste</h1><p className="muted">Zutaten aus Rezepten oder manuell ergänzte Besorgungen.</p></div><button className="btn secondary" onClick={clearList} disabled={!items.length||clearing}>{clearing?"Wird geleert…":"Einkaufsliste leeren"}</button></div>
 <div className="row"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Manuell hinzufügen..." onKeyDown={e=>e.key==="Enter"&&add()}/><button className="btn" onClick={add}>+ Hinzufügen</button></div>
 <div className="space"/><div className="card"><ul className="list">{items.map(i=><li key={i.id}><label style={{margin:0,fontWeight:400,textDecoration:i.checked?"line-through":undefined,opacity:i.checked ? 0.55 : 1}}><input type="checkbox" checked={i.checked} onChange={()=>toggle(i)} style={{width:"auto",marginRight:8}}/>{[i.amount,i.unit,i.name].filter(Boolean).join(" ")}</label><button className="btn danger" onClick={()=>remove(i.id)} aria-label={`${i.name} löschen`}>×</button></li>)}</ul>{!items.length&&<p className="muted">Die Einkaufsliste ist leer. Füge Einträge manuell hinzu oder übernimm Zutaten aus deinem Vorrat.</p>}</div>
 </main></AuthGate>;
}
