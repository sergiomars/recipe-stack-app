import Link from "next/link";

function ModuleIcon({ children }: { children: React.ReactNode }) {
  return <span className="module-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg></span>;
}

export default function Home() {
  return (
    <main className="home-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot"/> DEIN ZUHAUSE, GUT ORGANISIERT</span>
          <h1>Der Alltag läuft.<br/><span>Daheim auch.</span></h1>
          <p>Rezepte, Einkauf und Vorrat an einem Ort. Und wenn dein Zuhause wächst, wächst Daheim mit: Termine und weitere Bereiche können jederzeit dazukommen.</p>
          <div className="hero-actions">
            <Link className="btn" href="/recipes">Rezepte entdecken <span aria-hidden="true">→</span></Link>
            <Link className="btn secondary" href="/login">Anmelden</Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orbit"/>
          <img className="hero-mark" src="/icon.svg" alt="" />
          <div className="planner-card">
            <div className="planner-top"><span>Dein Zuhause</span><span className="planner-date">ALLES IM BLICK</span></div>
            <div className="planner-line active"><span className="planner-check">✓</span> Wochenmenü planen</div>
            <div className="planner-line"><span className="planner-check">✓</span> Einkauf vorbereiten</div>
            <div className="planner-line"><span className="planner-check">✓</span> Vorrat im Griff</div>
            <div className="planner-pill">Ein guter Plan fühlt sich leicht an.</div>
          </div>
        </div>
      </section>

      <section className="module-section">
        <div className="section-heading">
          <div><h2>Dein Haushalt, an einem Ort.</h2><p>Alles für den Alltag. Übersichtlich und miteinander verbunden.</p></div>
        </div>
        <div className="module-grid">
          <Link className="module-card" href="/recipes">
            <ModuleIcon><path d="M5 4.75h10.5A3.5 3.5 0 0 1 19 8.25v11H8.5A3.5 3.5 0 0 1 5 15.75v-11Z"/><path d="M5 15.5A3.5 3.5 0 0 1 8.5 12H19M9 8h6"/></ModuleIcon>
            <h3>Rezepte</h3><p>Lieblingsgerichte sammeln und Neues entdecken.</p>
          </Link>
          <Link className="module-card" href="/shopping">
            <ModuleIcon><path d="M4 8h16l-1.4 10H5.4L4 8Z"/><path d="M8 8 12 3l4 5M9 12v3m6-3v3"/></ModuleIcon>
            <h3>Einkauf</h3><p>Zutaten aus Rezepten und eigene Besorgungen.</p>
          </Link>
          <Link className="module-card" href="/stack">
            <ModuleIcon><path d="m4 8 8-4 8 4-8 4-8-4Z"/><path d="m4 12 8 4 8-4M4 16l8 4 8-4"/></ModuleIcon>
            <h3>Vorrat</h3><p>Rezepte vormerken, die du zuhause kochen möchtest.</p>
          </Link>
          <div className="module-card is-upcoming">
            <ModuleIcon><rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M8 3.5v4m8-4v4M4 10h16m-11 4h2m3 0h2m-7 3h2"/></ModuleIcon>
            <h3>Termine</h3><p>Familienkalender und wichtige Termine im Überblick.</p><span className="coming-soon">Kommt später</span>
          </div>
        </div>
      </section>
    </main>
  );
}
