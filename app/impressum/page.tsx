import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false },
};

/**
 * Structured Impressum draft. All content must be legally reviewed and
 * completed before publication (§ 5 ECG, § 14 UGB, § 25 MedienG) –
 * the open items are marked as TODO below.
 */
export default function ImpressumPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: "44rem" }}>
        <h1>Impressum</h1>
        <p className="admin-note" role="note">
          Entwurf – dieses Impressum muss vor Veröffentlichung der Website rechtlich
          geprüft und vervollständigt werden (§ 5 ECG, § 14 UGB, § 25 MedienG).
        </p>

        <h2>Medieninhaber &amp; Diensteanbieter</h2>
        <p>
          {SITE.owner}
          <br />
          {SITE.name}
          <br />
          {SITE.address.street}
          <br />
          {SITE.address.zip} {SITE.address.city}, Österreich
        </p>
        <p>
          Telefon: {SITE.phone}
          <br />
          E-Mail: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>

        <h2>Unternehmensgegenstand</h2>
        <p>
          Unabhängige Pflegeberatung: Pflegegeld-Einstufungen und Gutachten, Case &amp;
          Care Management, Wohnraum- und Barrierefreiheitsberatung,
          Angehörigen-Coaching, Qualitätssicherung.
        </p>

        <h2>Berufliche Angaben</h2>
        <p>
          Berufsbezeichnung: Diplomierter Gesundheits- und Krankenpfleger (DGKP),
          verliehen in Österreich.
          {/* TODO: Gewerbeberechtigung bzw. freiberufliche Tätigkeit nach GuKG klären,
              zuständige Behörde/Registrierung (Gesundheitsberuferegister) ergänzen. */}
        </p>

        <h2>Umsatzsteuer</h2>
        <p>Kleinunternehmer gemäß § 6 Abs. 1 Z 27 UStG – umsatzsteuerbefreit.</p>

        <h2>Streitbeilegung</h2>
        <p>
          {/* TODO: Hinweis auf Online-Streitbeilegungsplattform der EU (Art. 14 ODR-VO)
              und Verbraucherschlichtung prüfen und ergänzen. */}
          Angaben zur Verbraucherstreitbeilegung werden vor Veröffentlichung ergänzt.
        </p>
      </div>
    </section>
  );
}
