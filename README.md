# Pflegeberatung Wien – Gutachten & Case Management

Ruhige, barrierearme Website mit Online-Terminbuchung und Stornierung für eine unabhängige Pflegeberatung in Wien.

**Stack:** Next.js (App Router) · TypeScript · Clean CSS · Supabase (Postgres) · Resend · Vercel

## Features

- **Startseite** mit eigenständiger visueller Identität für österreichische Pflegeberatung:
  tiefes Petrol, warmes Papierweiß, gedecktes Salbeigrün und ein zurückhaltender Goldakzent,
  Serifen-Überschriften, strukturierte Vertrauenssignale (DGKP, 13 Jahre Berufserfahrung,
  Pflegegeldbegutachter-Ausbildung, Vor-Ort in Wien), konkrete Leistungskarten mit
  Checklisten und eigene Illustrationen (Beratungsgespräch mit Stephansdom-Silhouette,
  Pflegegeld-Antrag mit Checkliste und Prüfsiegel)
- **Terminbuchung** (`/termin`):
  - Kund:innen sehen **nur offene, zukünftige Termine** – gebuchte und stornierte Termine,
    Kundendaten und Stornierungs-Tokens tauchen öffentlich nie auf
  - Buchung mit Name, E-Mail, Telefon, Anliegen und Nachricht
  - **Serverseitige Validierung**: ein Termin kann nur gebucht werden, wenn er noch `open`
    ist (bei Supabase als atomarer Conditional-Update → keine Doppelbuchung möglich)
- **Stornierung ohne Kundenkonto** (`/termin/stornieren?token=…`):
  - Bei jeder Buchung wird ein kryptografisch zufälliger, nicht erratbarer Token erzeugt
    (`randomBytes(32)`, 64 Hex-Zeichen)
  - Der Token steht ausschließlich im Stornierungslink der Bestätigungs-E-Mail
  - Storniert werden können nur **gebuchte, zukünftige** Termine; die Antwort enthält keine
    Kundendaten, Fehlermeldungen verraten nicht, ob ein Token existiert
  - Stornierte Termine bleiben mit Kundendaten in der Admin-Historie erhalten
- **Adminbereich** (`/admin`, **passwortgeschützt**):
  - Login mit Passwort (`ADMIN_PASSWORD` in `.env.local`), Session als HttpOnly-Cookie
  - Verfügbarkeiten anlegen; **überschneidende Zeitfenster werden abgelehnt**
    (App-Logik + DB-Constraint)
  - Offene Termine: **Löschen** · Gebuchte zukünftige Termine: **Stornieren**
    (kein Hard-Delete, Kundendaten bleiben erhalten) · Stornierte Termine: Historie, optional löschbar
  - Alle Admin-API-Routen sind serverseitig geschützt (401 ohne gültige Session)
- **E-Mails** via Resend: Buchungs- und Stornierungsbestätigung an Kund:in (inkl.
  Stornierungslink) + Benachrichtigung an den Anbieter. Ohne API-Key werden Mails in die
  Konsole geloggt und an `./.data/emails.log` angehängt
- **Missbrauchsschutz**: einfacher In-Memory-Rate-Limiter pro IP für Buchung, Stornierung,
  Kontaktformular und Login ([`lib/rate-limit.ts`](lib/rate-limit.ts)). Für echten
  Produktionsbetrieb die Zähler in Vercel KV / Upstash Redis auslagern – nur diese eine
  Datei muss dafür geändert werden
- **SEO** (umfassend optimiert):
  - Verlinkte JSON-LD-Entitäten (`@graph`): `LocalBusiness`/`ProfessionalService` mit
    Adresse, Geo-Koordinaten, Einzugsgebiet, Leistungskatalog und Öffnungszeiten,
    dazu `Person` (DGKP mit Qualifikationen) und `WebSite`
  - `FAQPage`-Structured-Data mit sichtbarem FAQ-Bereich (deckt Long-Tail-Suchen zu
    Pflegegeld, Einstufung, Kosten etc. ab)
  - Dynamisch generiertes Open-Graph-Bild (`/opengraph-image`, echtes PNG), Favicon
    (`/icon`), Apple-Touch-Icon und Web-App-Manifest
  - Vollständige Metadaten: Title-Template, Description, Open Graph, Twitter Cards,
    Canonical pro Seite, `googleBot`-Direktiven (max-image-preview, max-snippet)
  - `robots.txt`, `sitemap.xml` (mit `lastModified`); Storno- und Adminseiten sind `noindex`
  - Optionale Search-Console-Verifizierung über `GOOGLE_SITE_VERIFICATION`
  - Zentrale Inhalte (Leistungen, FAQ) in [`lib/content.ts`](lib/content.ts): Seite und
    Structured Data teilen eine Quelle und können nicht auseinanderdriften
- **Barrierefreiheit**: semantisches HTML, große Schrift, starker Kontrast, Skip-Link,
  sichtbare Fokus-Zustände, beschriftete Formulare, zugängliches mobiles Menü,
  `prefers-reduced-motion` wird respektiert

## Schnellstart (lokal, ohne externe Dienste)

```bash
npm install
npm run dev
```

→ http://localhost:3000

Ohne weitere Konfiguration nutzt die App einen **lokalen JSON-Dateispeicher**
(`./.data/appointments.json`) und loggt E-Mails in Konsole + `./.data/emails.log`.
So kann der komplette Ablauf sofort getestet werden:

1. `/admin` öffnen → mit dem Passwort aus `.env.local` anmelden (`ADMIN_PASSWORD`, bitte ändern!) → Verfügbarkeit anlegen
2. `/termin` öffnen → Termin auswählen, Formular ausfüllen, buchen
3. Der Termin verschwindet aus der Kundenliste und erscheint unter `/admin` als **Gebucht**
4. Den Stornierungslink aus `./.data/emails.log` öffnen → Termin stornieren → Status **Storniert**

### Smoke-Test

Bei laufendem Server (`npm run dev` oder `npm start`):

```bash
node test-flow.mjs <ADMIN_PASSWORD>
```

Prüft den gesamten Lebenszyklus: Auth-Sperren, Slot-Anlage, Überlappungsschutz,
öffentliche Liste ohne Kundendaten/Token, Buchung, Token-Erzeugung, Stornierungslink in
der geloggten E-Mail, Doppelbuchung, Stornierung per Token (einmalig), ungültige Tokens,
Admin-Stornierung, Löschschutz für gebuchte Termine.

## Produktiv-Setup

### 1. Supabase (Datenbank)

1. Projekt auf [supabase.com](https://supabase.com) anlegen (Region idealerweise EU/Frankfurt)
2. Inhalt von [`supabase/schema.sql`](supabase/schema.sql) im SQL-Editor ausführen
   (Tabelle `appointments` inkl. Überlappungs-Constraint, Stornierungs-Spalten und RLS)
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
2. Projekt auf [vercel.com](https://vercel.com) importieren (Framework: Next.js)
3. Alle Umgebungsvariablen aus `.env.example` im Vercel-Dashboard setzen
4. ⚠️ In Produktion **muss Supabase konfiguriert sein** – der JSON-Dateispeicher
   funktioniert auf Vercel nicht dauerhaft (serverless Dateisystem ist flüchtig)
5. Hinweis: Der In-Memory-Rate-Limiter zählt auf Vercel pro Instanz. Für strikte Limits
   die Zähler in Vercel KV / Upstash Redis verlagern (nur `lib/rate-limit.ts` anpassen)

## Platzhalter vor Go-live ersetzen

Alle Stammdaten liegen zentral in [`lib/site.ts`](lib/site.ts) und speisen Footer,
Kontaktbereich, Metadaten, JSON-LD, Sitemap und Robots.

| Platzhalter | Wo |
| --- | --- |
| Domain (`https://www.pflegeberatung-wien.at`) | `NEXT_PUBLIC_SITE_URL` in `.env.local` / Vercel |
| Telefonnummer (`+43 XXX XXX XXXX`) | [`lib/site.ts`](lib/site.ts) |
| E-Mail (`kontakt@pflegeberatung-wien.at`) | [`lib/site.ts`](lib/site.ts) + `PROVIDER_EMAIL` |
| Resend API-Key | `.env.local` / Vercel |
| Supabase URL/Key | `.env.local` / Vercel |
| Admin-Passwort (`ADMIN_PASSWORD`) | `.env.local` / Vercel – **unbedingt sicheres Passwort wählen** |

## Supabase Free-Tier: Keep-alive gegen Auto-Pause

Supabase pausiert Free-Tier-Projekte nach **7 Tagen ohne einen einzigen API-Request**.
Deshalb ruft ein Vercel-Cron-Job (kostenlos im Hobby-Plan, siehe [`vercel.json`](vercel.json))
täglich `GET /api/cron/keepalive` auf – eine minimale Datenbank-Abfrage, die das Projekt
dauerhaft aktiv hält. Ein Pro-Upgrade ist dafür nicht nötig.

- Optional `CRON_SECRET` in Vercel setzen (z. B. `openssl rand -hex 16`) – Vercel Cron
  sendet den Wert automatisch als Bearer-Token, alle anderen Aufrufer erhalten 401.
- Nach dem Go-live hält meist schon der echte Besucherverkehr das Projekt aktiv;
  der Cron ist die Absicherung für ruhige Wochen.

## Offene Punkte (bewusst für später)

- **Supabase Auth statt Passwort-Login**: Der Adminbereich ist mit einem Passwort
  (`ADMIN_PASSWORD`) und HttpOnly-Session-Cookie geschützt. Für mehrere Admins später auf
  Supabase Auth umstellen – alle API-Routen prüfen zentral über `isAdminRequest()` in
  [`lib/auth.ts`](lib/auth.ts), nur diese Funktion muss ersetzt werden.
- **Impressum & Datenschutz**: Die Seiten `/impressum` und `/datenschutz` sind strukturierte
  Entwürfe mit markierten TODO-Stellen und **müssen vor Veröffentlichung rechtlich geprüft
  werden**.
- **Wichtigster SEO-Schritt nach dem Go-live**: ein **Google-Unternehmensprofil**
  (Google Business Profile) anlegen und verifizieren – das ist für lokale Suchen
  („Pflegeberatung Wien") der größte Hebel und speist die Karten-/Local-Pack-Anzeige.
  Danach Search Console verifizieren (`GOOGLE_SITE_VERIFICATION`) und die `sitemap.xml`
  einreichen.
- Exakte Geo-Koordinaten der Adresse in [`lib/site.ts`](lib/site.ts) hinterlegen
  (aktuell Näherungswert für 1220 Wien) und reale Social-Profile in `sameAs` ergänzen.

Die Illustrationen (`public/illustration-beratung.svg`, `public/illustration-pflegegeld.svg`)
sind eigens für die Seite gestaltete Motive im Markenstil (Beratungsgespräch, Pflegegeld-
Unterlagen) – sie sind bewusst Teil der visuellen Identität und keine Platzhalter. Echte
Fotos können später zusätzlich eingebunden werden, sind aber nicht erforderlich.

## Projektstruktur

```
app/
  page.tsx              Startseite
  termin/page.tsx       Terminbuchung (Kundenbereich)
  termin/stornieren/    Stornierung per E-Mail-Link (noindex)
  admin/page.tsx        Adminbereich mit Login
  impressum/  datenschutz/   Strukturierte Rechtsseiten-Entwürfe
  api/appointments/     GET (open öffentlich / all nur Admin), POST (Slot anlegen, nur Admin)
    [id]/               DELETE (nur offene/stornierte), PATCH (Admin-Stornierung)
    [id]/book/          POST (Buchung mit Serverprüfung, öffentlich, rate-limited)
    cancel/             POST (Stornierung per Token, öffentlich, rate-limited)
  api/admin/            login/ logout/ (Session-Cookie, Login rate-limited)
  api/contact/          POST (Kontaktformular, rate-limited)
  robots.ts sitemap.ts  SEO
components/             Header, Footer, Reveal, ContactForm, TerminClient, AdminClient, StornoClient
lib/
  site.ts               Zentrale Stammdaten & Go-live-Platzhalter
  types.ts              Datenmodell (appointments inkl. cancel_token/cancelled_at)
  store.ts              Datenzugriff: FileStore (dev) / SupabaseStore (prod)
  auth.ts               Admin-Login (Passwort + HttpOnly-Session-Cookie)
  rate-limit.ts         In-Memory-Rate-Limiter (Produktion: KV/Redis)
  format.ts             Datums-/Zeitformatierung (Europe/Vienna)
  email.ts              Resend-Integration (Buchung + Stornierung)
public/                 Eigene SVG-Illustrationen im Markenstil
supabase/schema.sql     Datenbankschema inkl. Constraints & RLS
```

---

Kleinunternehmer gemäß § 6 Abs. 1 Z 27 UStG – umsatzsteuerbefreit.
