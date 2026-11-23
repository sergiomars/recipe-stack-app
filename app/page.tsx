import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <span className="badge">Persönliche Küchen-App</span>
        <h1>Rezepte, Einkauf &amp; dein Rezept-Stack.</h1>
        <p className="muted">
          Rezepte sammeln, Zutaten auf die Einkaufsliste setzen und einen Stack
          mit Gerichten für die nächsten Tage vorbereiten.
        </p>
        <div className="space" />
        <div className="row">
          <Link className="btn" href="/recipes">Rezepte ansehen</Link>
          <Link className="btn secondary" href="/stack">Zum Stack</Link>
        </div>
      </section>
    </main>
  );
}
