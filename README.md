# Pflegeberatung Wien – Gutachten & Case Management

Moderne, barrierearme Website mit Online-Terminbuchung für eine Pflegeberatung in Wien.

**Stack:** Next.js (App Router) · TypeScript · Clean CSS · Supabase (Postgres) · Resend · Vercel

## Features

- **Startseite** mit Hero, Vertrauens-Badges, Über mich, Leistungsportfolio (5 Karten), 3-Schritte-Ablauf und Kontaktformular
- **Terminbuchung** (`/termin`):
  - Kund:innen sehen **nur offene, zukünftige Termine** (keine Kundendaten, kein gebuchter Termin)
  - Buchung mit Name, E-Mail, Telefon, Anliegen und Nachricht
  - **Serverseitige Validierung**: ein Termin kann nur gebucht werden, wenn er noch `open` ist (bei Supabase als atomarer Conditional-Update → keine Doppelbuchung möglich)
  - Gebuchte Termine verschwinden sofort aus der öffentlichen Liste
- **Adminbereich** (auf `/termin`, wird später mit Login geschützt):
  - Verfügbarkeiten anlegen (Datum, Beginn, Ende, Terminart, Ort)
  - **Überschneidende Zeitfenster werden abgelehnt** (App-Logik + DB-Constraint)
  - Alle Termine inkl. Status und Kundendaten einsehen, Termine löschen
- **E-Mails** via Resend: Bestätigung an Kund:in + Benachrichtigung an Anbieter (ohne API-Key werden Mails nur in die Server-Konsole geloggt)
- **SEO**: Metadaten, Open Graph, Twitter Cards, Canonical, JSON-LD (`ProfessionalService`), `robots.txt`, `sitemap.xml`
- **Barrierefreiheit**: semantisches HTML, große Schrift, starker Kontrast, Skip-Link, sichtbare Fokus-Zustände, beschriftete Formulare, zugängliches mobiles Menü, `prefers-reduced-motion` wird respektiert

## Schnellstart (lokal, ohne externe Dienste)

```bash
npm install
npm run dev
```

→ http://localhost:3000

Ohne Konfiguration nutzt die App einen **lokalen JSON-Dateispeicher** (`./.data/appointments.json`) und loggt E-Mails in die Konsole. So kann der komplette Buchungsablauf sofort getestet werden:

1. `/termin` öffnen → im Adminbereich (unten) eine Verfügbarkeit anlegen
2. Oben im Kundenbereich erscheint der Termin → auswählen, Formular ausfüllen, buchen
3. Der Termin verschwindet aus der Kundenliste und erscheint im Adminbereich als **Gebucht** inkl. Kundendaten

### Buchungslogik testen (Smoke-Test)

Bei laufendem Server (`npm run dev` oder `npm start`):

```bash
node test-flow.mjs
```

Prüft automatisch: Slot anlegen, Überlappung abgelehnt, ungültige Zeiten abgelehnt, öffentliche Liste ohne Kundendaten, Buchung, Doppelbuchung abgelehnt, Admin-Sicht, Löschen.

## Produktiv-Setup

### 1. Supabase (Datenbank)

1. Projekt auf [supabase.com](https://supabase.com) anlegen
2. Inhalt von [`supabase/schema.sql`](supabase/schema.sql) im SQL-Editor ausführen
   (legt die Tabelle `appointments` an, inkl. Überlappungs-Constraint und RLS)
3. In `.env.local` eintragen:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
   ⚠️ Der Service-Role-Key wird **nur serverseitig** verwendet und darf nie im Client landen.

Sobald beide Variablen gesetzt sind, verwendet die App automatisch Supabase statt der lokalen JSON-Datei.

### 2. Resend (E-Mails)

1. API-Key auf [resend.com](https://resend.com) erstellen, Domain verifizieren
2. In `.env.local` eintragen:
   ```
   RESEND_API_KEY=re_...
   EMAIL_FROM="Pflegeberatung Wien <termine@ihre-domain.at>"
   PROVIDER_EMAIL=ihre-adresse@ihre-domain.at
   ```

### 3. Vercel (Hosting)

1. Repository zu GitHub pushen
2. Projekt auf [vercel.com](https://vercel.com) importieren (Framework: Next.js, keine Sonderkonfiguration nötig)
3. Alle Umgebungsvariablen aus `.env.example` im Vercel-Dashboard setzen
4. ⚠️ In Produktion **muss Supabase konfiguriert sein** – der JSON-Dateispeicher funktioniert auf Vercel nicht dauerhaft (serverless Dateisystem ist flüchtig)

## Platzhalter vor Go-live ersetzen

| Platzhalter | Wo |
| --- | --- |
| Domain (`https://www.pflegeberatung-wien.at`) | `NEXT_PUBLIC_SITE_URL` in `.env.local` / Vercel |
| Telefonnummer (`+43 XXX XXX XXXX`) | [`lib/site.ts`](lib/site.ts) |
| E-Mail (`kontakt@pflegeberatung-wien.at`) | [`lib/site.ts`](lib/site.ts) + `PROVIDER_EMAIL` |
| Resend API-Key | `.env.local` / Vercel |
| Supabase URL/Key | `.env.local` / Vercel |

## Offene Punkte (bewusst für später)

- **Admin-Login**: Der Adminbereich auf `/termin` ist derzeit ungeschützt und muss vor Go-live mit Supabase Auth abgesichert werden (API-Routen `POST /api/appointments`, `DELETE /api/appointments/:id` und `GET /api/appointments?scope=all` prüfen dann die Session).
- **Impressum & Datenschutz**: Die Seiten `/impressum` und `/datenschutz` sind Platzhalter und **müssen vor Veröffentlichung rechtlich geprüft werden**.
- Open-Graph-Bild (`og-image`) ergänzen, sobald Logo/Branding vorhanden ist.

## Projektstruktur

```
app/
  page.tsx              Startseite
  termin/page.tsx       Terminbuchung (Kunden + Admin)
  impressum/  datenschutz/   Rechtliche Platzhalterseiten
  api/appointments/     GET (open/all), POST (Slot anlegen)
    [id]/               DELETE (Slot löschen)
    [id]/book/          POST (Buchung mit Serverprüfung)
  api/contact/          POST (Kontaktformular)
  robots.ts sitemap.ts  SEO
components/             Header, Footer, Reveal, ContactForm, TerminClient
lib/
  site.ts               Zentrale Stammdaten & Platzhalter
  types.ts              Datenmodell (appointments)
  store.ts              Datenzugriff: FileStore (dev) / SupabaseStore (prod)
  email.ts              Resend-Integration
supabase/schema.sql     Datenbankschema inkl. Constraints & RLS
```

---

Kleinunternehmer gemäß § 6 Abs. 1 Z 27 UStG – umsatzsteuerbefreit.
