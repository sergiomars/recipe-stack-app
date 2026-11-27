import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin-auth";

export async function requireAdminApi() {
  const context = await getAdminContext();
  if (!context.user) {
    return { context: null, response: NextResponse.json({ error: "Anmeldung erforderlich." }, { status: 401 }) };
  }
  if (!context.isAdmin) {
    return { context: null, response: NextResponse.json({ error: "Admin-Rechte erforderlich." }, { status: 403 }) };
  }
  return { context, response: null };
}
