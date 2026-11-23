import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <nav className="nav">
          <Link className="brand" href="/">Recipe Stack</Link>
          <div className="navlinks">
            <Link href="/recipes">Rezepte</Link>
            <Link href="/shopping">Einkauf</Link>
            <Link href="/stack">Stack</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
