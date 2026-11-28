"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function AuthNav() {
  const [email, setEmail] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoaded(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
      setLoaded(true);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (!loaded) return null;

  return email ? (
    <>
      <Link href="/shopping">Einkauf</Link>
      <Link href="/stack">Vorrat</Link>
      <button className="nav-auth" onClick={logout}>Abmelden ({email})</button>
    </>
  ) : <Link href="/login">Anmelden</Link>;
}
