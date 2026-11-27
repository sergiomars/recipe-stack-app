import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export type AdminContext = {
  user: User | null;
  isAdmin: boolean;
  service: SupabaseClient;
};

export async function getAdminContext(): Promise<AdminContext> {
  const cookieStore = await cookies();
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: cookiesToSet => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Session refresh cookies are written by proxy.ts.
        }
      },
    } }
  );
  const { data: { user } } = await authClient.auth.getUser();
  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  if (!user) return { user: null, isAdmin: false, service };
  const { data: admin } = await service.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  return { user, isAdmin: Boolean(admin), service };
}
