import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { context, response } = await requireAdminApi();
  if (!context) return response;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  if (!title || !Array.isArray(body?.ingredients) || !Array.isArray(body?.steps)) {
    return NextResponse.json({ error: "Titel, Zutaten und Zubereitung sind erforderlich." }, { status: 400 });
  }
  const ingredients = body.ingredients.filter((item: unknown) => item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string" && (item as { name: string }).name.trim());
  const steps = body.steps.filter((step: unknown) => typeof step === "string" && step.trim());

  const normalizedIngredients = ingredients.map((item: { name: string; amount?: string; unit?: string }) => ({
    name: item.name.trim(), amount: item.amount?.trim() || "", unit: item.unit?.trim() || "",
  }));
  const normalizedSteps = steps.map((description: string) => description.trim());
  const { error } = await context.service.rpc("admin_update_recipe", {
    p_recipe_id: id,
    p_title: title,
    p_description: description || null,
    p_category: category || null,
    p_ingredients: normalizedIngredients,
    p_steps: normalizedSteps,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Rezept gespeichert." });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { context, response } = await requireAdminApi();
  if (!context) return response;
  const { id } = await params;
  const { error } = await context.service.from("recipes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Rezept gelöscht." });
}
