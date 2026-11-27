import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET() {
  const { context, response } = await requireAdminApi();
  if (!context) return response;
  const { data, error } = await context.service.from("recipe_categories").select("id,name").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data });
}

export async function POST(request: NextRequest) {
  const { context, response } = await requireAdminApi();
  if (!context) return response;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 50) return NextResponse.json({ error: "Der Kategoriename muss 1 bis 50 Zeichen lang sein." }, { status: 400 });
  const { data, error } = await context.service.from("recipe_categories").insert({ name }).select("id,name").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ category: data });
}

export async function DELETE(request: NextRequest) {
  const { context, response } = await requireAdminApi();
  if (!context) return response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Kategorien-ID fehlt." }, { status: 400 });
  const { error } = await context.service.from("recipe_categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath("/recipes");
  revalidatePath("/stack");
  return NextResponse.json({ message: "Kategorie gelöscht." });
}
