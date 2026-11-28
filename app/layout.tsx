import "./globals.css";
import Link from "next/link";
import AuthNav from "@/components/AuthNav";
import ToastProvider from "@/components/ToastProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Daheim – Haushalt im Blick", template: "%s | Daheim" },
  description: "Rezepte, Einkauf und Vorrat für einen gut organisierten Alltag zuhause.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <ToastProvider>
          <nav className="nav" aria-label="Hauptnavigation">
            <Link className="brand" href="/" aria-label="Daheim – zur Startseite">
              <img src="/daheim-logo.svg" alt="Daheim – Haushalt im Blick" width="192" height="48" />
            </Link>
            <div className="navlinks">
              <Link href="/recipes">Rezepte</Link>
              <AuthNav />
            </div>
          </nav>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
