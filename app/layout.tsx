import "./globals.css";
import Link from "next/link";
import AuthNav from "@/components/AuthNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <nav className="nav">
          <Link className="brand" href="/">Recipe Stack</Link>
          <div className="navlinks">
            <Link href="/recipes">Rezepte</Link>
            <AuthNav />
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
