"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthForm({ adminMode = false }: { adminMode?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        setBusy(false);
        return;
      }
      router.replace(adminMode ? "/admin" : "/stack");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else if (data.session) {
      router.replace(adminMode ? "/admin" : "/stack");
      router.refresh();
      return;
    } else {
      setMessage("Konto angelegt. Bitte bestätige deine E-Mail-Adresse und melde dich danach an.");
    }
    setBusy(false);
  }

  return (
    <main className="container">
      <section className="card form">
        <h1>{adminMode ? "Admin-Anmeldung" : mode === "login" ? "Anmelden" : "Konto erstellen"}</h1>
        <p className="muted">{adminMode ? "Melde dich mit einem freigeschalteten Administratorkonto an." : "Dein Rezept-Stack und deine Einkaufsliste sind nur für dich sichtbar."}</p>
        <form onSubmit={submit}>
          <label htmlFor="email">E-Mail</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
          <label htmlFor="password">Passwort</label>
          <input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={event => setPassword(event.target.value)} />
          <div className="space" />
          <button className="btn" type="submit" disabled={busy}>{busy ? "Bitte warten…" : mode === "login" ? "Anmelden" : "Registrieren"}</button>
        </form>
        {message && <p role="status" className="muted">{message}</p>}
        {!adminMode && <p>
          {mode === "login" ? "Noch kein Konto? " : "Schon registriert? "}
          <button className="text-button" type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
            {mode === "login" ? "Jetzt registrieren" : "Zum Login"}
          </button>
        </p>}
      </section>
    </main>
  );
}
