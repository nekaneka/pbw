import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: { index: false },
};

export default function DatenschutzPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: "44rem" }}>
        <h1>Datenschutzerklärung</h1>
        <p className="admin-note" role="note">
          Wichtiger Hinweis: Diese Datenschutzerklärung ist ein Platzhalter und muss
          vor Veröffentlichung der Website rechtlich geprüft und an die tatsächliche
          Datenverarbeitung angepasst werden (DSGVO, DSG).
        </p>
        <h2>Verantwortlicher</h2>
        <p>
          {SITE.owner}, {SITE.address.street}, {SITE.address.zip} {SITE.address.city}
          <br />
          E-Mail: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
        <h2>Verarbeitete Daten</h2>
        <p>
          Bei einer Terminbuchung oder Kontaktanfrage verarbeiten wir die von Ihnen
          angegebenen Daten (Name, E-Mail-Adresse, Telefonnummer, Anliegen, Nachricht)
          ausschließlich zur Terminverwaltung und Beantwortung Ihrer Anfrage.
        </p>
        <h2>Speicherdauer, Auftragsverarbeiter, Ihre Rechte</h2>
        <p>
          {/* TODO: Hosting (Vercel), Datenbank (Supabase), E-Mail-Versand (Resend),
              Speicherdauern, Rechtsgrundlagen und Betroffenenrechte ergänzen. */}
          Details zu Speicherdauer, eingesetzten Dienstleistern (Hosting, Datenbank,
          E-Mail-Versand) und Ihren Rechten nach der DSGVO werden vor Veröffentlichung
          ergänzt.
        </p>
      </div>
    </section>
  );
}
