import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET() {
  const { context, response } = await requireAdminApi();
  if (!context) return response;

  const [{ data, error }, { data: admins }, { data: suspended }] = await Promise.all([
    context.service.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    context.service.from("admin_users").select("user_id"),
    context.service.from("suspended_users").select("user_id"),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const adminIds = new Set((admins ?? []).map(row => row.user_id));
  const suspendedIds = new Set((suspended ?? []).map(row => row.user_id));
  return NextResponse.json({ users: data.users.map(user => ({
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at,
    isSuspended: suspendedIds.has(user.id),
    isAdmin: adminIds.has(user.id),
  })) });
}

export async function POST(request: NextRequest) {
  const { context, response } = await requireAdminApi();
  if (!context) return response;
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Bitte eine gültige E-Mail-Adresse eingeben." }, { status: 400 });

  const { error } = await context.service.auth.admin.inviteUserByEmail(email, {
    redirectTo: new URL("/login", request.url).toString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: `Einladung an ${email} wurde versendet.` });
}

export async function PATCH(request: NextRequest) {
  const { context, response } = await requireAdminApi();
  if (!context) return response;
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const action = body?.action;
  if (!id || (action !== "ban" && action !== "unban")) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  if (id === context.user.id) return NextResponse.json({ error: "Das eigene Administratorkonto kann hier nicht gesperrt werden." }, { status: 400 });

  const { data: adminTarget } = await context.service.from("admin_users").select("user_id").eq("user_id", id).maybeSingle();
  if (adminTarget) return NextResponse.json({ error: "Administratorkonten können hier nicht geändert werden." }, { status: 400 });
  if (action === "ban") {
    const { error: suspendError } = await context.service.from("suspended_users").upsert({ user_id: id });
    if (suspendError) return NextResponse.json({ error: suspendError.message }, { status: 400 });
    const { error } = await context.service.auth.admin.updateUserById(id, { ban_duration: "876000h" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    const { error } = await context.service.auth.admin.updateUserById(id, { ban_duration: "none" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const { error: unsuspendError } = await context.service.from("suspended_users").delete().eq("user_id", id);
    if (unsuspendError) return NextResponse.json({ error: unsuspendError.message }, { status: 400 });
  }
  return NextResponse.json({ message: action === "ban" ? "Konto gesperrt." : "Kontosperre aufgehoben." });
}

export async function DELETE(request: NextRequest) {
  const { context, response } = await requireAdminApi();
  if (!context) return response;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Benutzer-ID fehlt." }, { status: 400 });
  if (id === context.user.id) return NextResponse.json({ error: "Das eigene Administratorkonto kann nicht gelöscht werden." }, { status: 400 });

  const { data: adminTarget } = await context.service.from("admin_users").select("user_id").eq("user_id", id).maybeSingle();
  if (adminTarget) return NextResponse.json({ error: "Administratorkonten können hier nicht gelöscht werden." }, { status: 400 });
  const { error } = await context.service.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Benutzer gelöscht." });
}
