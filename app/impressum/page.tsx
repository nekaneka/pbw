import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false },
};

export default function ImpressumPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: "44rem" }}>
        <h1>Impressum</h1>
        <p className="admin-note" role="note">
          Wichtiger Hinweis: Dieses Impressum ist ein Platzhalter und muss vor
          Veröffentlichung der Website rechtlich geprüft und vervollständigt werden
          (§ 5 ECG, § 14 UGB, § 25 MedienG).
        </p>
        <p>
          <strong>{SITE.name}</strong>
          <br />
          {SITE.owner}
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
        <p>Kleinunternehmer gemäß § 6 Abs. 1 Z 27 UStG – umsatzsteuerbefreit.</p>
        <p>
          Berufsbezeichnung: Diplomierter Gesundheits- und Krankenpfleger (DGKP)
          <br />
          {/* TODO: Gewerbeberechtigung / Kammerzugehörigkeit / Aufsichtsbehörde ergänzen */}
        </p>
      </div>
    </section>
  );
}
