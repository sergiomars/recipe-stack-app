import { createClient } from "@/lib/supabase";

export type ShoppingEntry = {
  name: string;
  amount?: string | number | null;
  unit?: string | null;
  source_recipe_id?: string | null;
};

type ExistingItem = {
  id: number;
  name: string;
  amount: string | null;
  unit: string | null;
  checked: boolean;
  source_recipe_id: string | null;
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase("de-CH");
}

function itemKey(name: string, unit: string | null) {
  return `${normalize(name)}\u0000${normalize(unit)}`;
}

function combineAmounts(left: string | null, right: string | null) {
  const a = left?.trim() ?? "";
  const b = right?.trim() ?? "";
  if (!a) return b || null;
  if (!b) return a;
  const numeric = /^\d+(?:[.,]\d+)?$/;
  if (numeric.test(a) && numeric.test(b)) {
    const sum = Number(a.replace(",", ".")) + Number(b.replace(",", "."));
    return Number(sum.toFixed(3)).toString();
  }
  return `${a} + ${b}`;
}

export async function addShoppingItems(entries: ShoppingEntry[]) {
  const groups = new Map<string, ShoppingEntry>();
  let merged = 0;
  for (const entry of entries) {
    const name = entry.name.trim();
    if (!name) continue;
    const unit = entry.unit?.trim() || null;
    const normalized = { ...entry, name, unit, amount: entry.amount == null ? null : String(entry.amount).trim() || null };
    const key = itemKey(name, unit);
    const existing = groups.get(key);
    if (existing) {
      merged++;
      existing.amount = combineAmounts(existing.amount == null ? null : String(existing.amount), normalized.amount == null ? null : String(normalized.amount));
      existing.source_recipe_id ??= normalized.source_recipe_id;
    } else {
      groups.set(key, normalized);
    }
  }

  if (!groups.size) return { added: 0, merged: 0 };
  const supabase = createClient();
  const { data: current, error: readError } = await supabase
    .from("shopping_items")
    .select("id,name,amount,unit,checked,source_recipe_id");
  if (readError) throw new Error(readError.message);

  const existingByKey = new Map<string, ExistingItem[]>();
  for (const item of current ?? []) {
    const key = itemKey(item.name, item.unit);
    existingByKey.set(key, [...(existingByKey.get(key) ?? []), item]);
  }

  const inserts: ShoppingEntry[] = [];
  for (const [key, incoming] of groups) {
    const matches = existingByKey.get(key) ?? [];
    if (!matches.length) {
      inserts.push(incoming);
      continue;
    }

    merged++;
    const [keeper, ...duplicates] = matches;
    let amount: string | null = keeper.amount;
    for (const duplicate of duplicates) amount = combineAmounts(amount, duplicate.amount);
    amount = combineAmounts(amount, incoming.amount == null ? null : String(incoming.amount));
    const { error: updateError } = await supabase.from("shopping_items").update({
      amount,
      checked: false,
      source_recipe_id: keeper.source_recipe_id ?? incoming.source_recipe_id ?? null,
    }).eq("id", keeper.id);
    if (updateError) throw new Error(updateError.message);

    if (duplicates.length) {
      const { error: deleteError } = await supabase.from("shopping_items").delete().in("id", duplicates.map(item => item.id));
      if (deleteError) throw new Error(deleteError.message);
    }
  }

  if (inserts.length) {
    const { error: insertError } = await supabase.from("shopping_items").insert(inserts);
    if (insertError) throw new Error(insertError.message);
  }
  return { added: inserts.length, merged };
}
