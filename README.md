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

## Administration

1. Sicherstellen, dass `supabase/schema.sql` und `supabase/user-data-auth.sql` bereits ausgeführt wurden.
2. `supabase/admin-auth.sql` im Supabase SQL Editor ausführen.
3. `supabase/recipe-categories.sql` ausführen, um den Kategorienkatalog anzulegen und vorhandene Kategorien zu übernehmen.
4. Ein normales Konto über `/login` erstellen.
5. Die auskommentierte `insert`-Anweisung am Ende des SQL-Skripts mit der Admin-E-Mail anpassen und ausführen.
6. `SUPABASE_SERVICE_ROLE_KEY` als geheime Umgebungsvariable lokal und in Vercel setzen. Niemals mit `NEXT_PUBLIC_` veröffentlichen.
7. Über `/admin/login` anmelden. Dort lassen sich Nutzer einladen, sperren, entsperren und löschen sowie Kategorien und Rezepte verwalten.

## Hinweis

Das mitgelieferte Schema ist bewusst ein schneller Prototyp und erlaubt öffentlichen
Zugriff. Für eine private App sollten `user_id`-Spalten und echte RLS-Policies
ergänzt werden.
