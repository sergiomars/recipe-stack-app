import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET() {
  const { context, response } = await requireAdminApi();
  if (!context) return response;
  const { data, error } = await context.service
    .from("recipes")
    .select("id,title,description,category,created_at,ingredients:recipe_ingredients(id,name,amount,unit),steps:recipe_steps(id,step_number,description)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recipes: data });
}
