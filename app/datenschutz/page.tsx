import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: { index: false },
};

/**
 * Structured Datenschutzerklärung draft covering the actual data flows of
 * this website (booking, contact form, hosting, database, e-mail, admin
 * session cookie). Must be legally reviewed before publication – open
 * items are marked as TODO.
 */
export default function DatenschutzPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: "44rem" }}>
        <h1>Datenschutzerklärung</h1>
        <p className="admin-note" role="note">
          Entwurf – diese Datenschutzerklärung beschreibt die tatsächliche
          Datenverarbeitung der Website, muss aber vor Veröffentlichung rechtlich
          geprüft werden (DSGVO, DSG).
        </p>

        <h2>Verantwortlicher</h2>
        <p>
          {SITE.owner}, {SITE.address.street}, {SITE.address.zip} {SITE.address.city},
          Österreich
          <br />
          E-Mail: <a href={`mailto:${SITE.email}`}>{SITE.email}</a> · Telefon: {SITE.phone}
        </p>

        <h2>Verarbeitete Daten</h2>
        <p>
          Diese Website verwendet keine Analyse- oder Marketing-Tools und setzt keine
          Tracking-Cookies. Personenbezogene Daten werden nur verarbeitet, wenn Sie sie
          uns aktiv übermitteln – bei einer Terminbuchung oder über das Kontaktformular.
        </p>

        <h2>Terminbuchung</h2>
        <p>
          Bei einer Terminbuchung verarbeiten wir Name, E-Mail-Adresse, Telefonnummer,
          Ihr Anliegen und eine optionale Nachricht. Diese Daten dienen ausschließlich
          der Terminverwaltung, der Terminbestätigung per E-Mail und der Vorbereitung
          der Beratung. Die Bestätigungs-E-Mail enthält einen persönlichen
          Stornierungslink; bei einer Stornierung bleibt der Termin mit Ihren Daten zur
          Nachvollziehbarkeit im internen Terminverwaltungssystem gespeichert.
        </p>

        <h2>Kontaktformular</h2>
        <p>
          Bei Anfragen über das Kontaktformular verarbeiten wir Name, E-Mail-Adresse,
          optional Telefonnummer und Ihre Nachricht zur Beantwortung der Anfrage.
        </p>

        <h2>Hosting (Vercel)</h2>
        <p>
          Die Website wird bei Vercel Inc. (USA) gehostet. Beim Aufruf der Website
          verarbeitet Vercel technisch notwendige Daten (z. B. IP-Adresse) in
          Server-Logs.
          {/* TODO: Vercel-DPA prüfen, Angaben zu Drittlandübermittlung (EU-US Data
              Privacy Framework / SCCs) ergänzen. */}
        </p>

        <h2>Datenbank (Supabase)</h2>
        <p>
          Termin- und Buchungsdaten werden in einer Postgres-Datenbank bei Supabase
          gespeichert.
          {/* TODO: Gewählte Supabase-Region (idealerweise EU, z. B. Frankfurt) und
              DPA-Details ergänzen. */}
        </p>

        <h2>E-Mail-Versand (Resend)</h2>
        <p>
          Termin- und Stornierungsbestätigungen sowie Kontaktanfragen werden über den
          Dienst Resend versendet. Dabei werden Ihre E-Mail-Adresse und die
          Nachrichteninhalte an Resend übermittelt.
          {/* TODO: Resend-DPA und Drittlandübermittlung prüfen und ergänzen. */}
        </p>

        <h2>Cookies &amp; Admin-Sitzung</h2>
        <p>
          Für Besucherinnen und Besucher werden keine Cookies gesetzt. Nur im internen,
          passwortgeschützten Adminbereich wird ein technisch notwendiges
          Sitzungs-Cookie („pbw_admin_session“, HttpOnly, max. 7 Tage) verwendet, das
          ausschließlich der Anmeldung des Betreibers dient.
        </p>

        <h2>Speicherdauer</h2>
        <p>
          {/* TODO: konkrete Fristen festlegen, z. B. Buchungsdaten X Monate nach dem
              Termin, Kontaktanfragen nach Erledigung. */}
          Personenbezogene Daten werden nur so lange gespeichert, wie es für die
          Terminabwicklung bzw. Beantwortung Ihrer Anfrage erforderlich ist. Konkrete
          Löschfristen werden vor Veröffentlichung ergänzt.
        </p>

        <h2>Rechtsgrundlagen</h2>
        <p>
          Die Verarbeitung erfolgt zur Durchführung vorvertraglicher Maßnahmen und zur
          Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO – Terminbuchung) sowie auf
          Grundlage unseres berechtigten Interesses an der Beantwortung von Anfragen
          und dem sicheren Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO).
        </p>

        <h2>Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
          Verarbeitung, Datenübertragbarkeit und Widerspruch. Wenden Sie sich dazu an{" "}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Außerdem können Sie sich
          bei der österreichischen Datenschutzbehörde (dsb.gv.at) beschweren.
        </p>
      </div>
    </section>
  );
}
