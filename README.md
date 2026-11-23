# Recipe Stack

Eine kleine Next.js + Supabase App mit:
- Rezepten
- Einkaufsliste (aus Rezepten oder manuell)
- Rezept-Stack statt Wochenplan

## Lokal

1. `npm install`
2. `.env.local.example` nach `.env.local` kopieren
3. Supabase URL + Anon Key eintragen
4. `supabase/schema.sql` im Supabase SQL Editor ausführen
5. `npm run dev`

## Deployment

GitHub Repository erstellen, pushen und in Vercel importieren. Danach die beiden
Supabase Environment Variables in Vercel hinterlegen.

## Hinweis

Das mitgelieferte Schema ist bewusst ein schneller Prototyp und erlaubt öffentlichen
Zugriff. Für eine private App sollten `user_id`-Spalten und echte RLS-Policies
ergänzt werden.