import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p>
          <strong>{SITE.name}</strong>
        </p>
        <p>
          {SITE.owner} · {SITE.address.street}, {SITE.address.zip} {SITE.address.city}
        </p>
        <p>
          Telefon: {SITE.phone} · E-Mail:{" "}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
        <p>
          <Link href="/impressum">Impressum</Link> ·{" "}
          <Link href="/datenschutz">Datenschutz</Link> ·{" "}
          <Link href="/termin">Termin buchen</Link> ·{" "}
          <Link href="/admin">Adminbereich</Link>
        </p>
        <div className="footer-legal">
          <p>Kleinunternehmer gemäß § 6 Abs. 1 Z 27 UStG – umsatzsteuerbefreit.</p>
          <p>
            Hinweis: Impressum und Datenschutzerklärung müssen vor Veröffentlichung
            rechtlich geprüft werden.
          </p>
        </div>
      </div>
    </footer>
  );
}
