import type { ReactNode } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";
import { SITE } from "@/lib/site";
import { SERVICES, STEPS, FAQS } from "@/lib/content";
import { faqGraph } from "@/lib/jsonld";

const TRUST_SIGNALS = [
  {
    term: "DGKP",
    detail: "Diplomierter Gesundheits- und Krankenpfleger, gehobener Dienst",
  },
  {
    term: "13 Jahre Berufserfahrung",
    detail: "Klinische Praxis in der Gesundheits- und Krankenpflege",
  },
  {
    term: "Pflegegeldbegutachter",
    detail: "Zertifizierte Zusatzausbildung für Einstufung & Gutachten",
  },
  {
    term: "Vor Ort in Wien",
    detail: "Hausbesuche in allen Bezirken – Termine nach Vereinbarung",
  },
];

/* Small custom stroke icons in the brand palette – keyed by service slug. */
const ICONS: Record<string, ReactNode> = {
  "pflegegeld-einstufung": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M10 12l1.5 1.5L14.5 10" />
      <path d="M10 17h5" />
    </svg>
  ),
  "case-management": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <path d="M8.5 19H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
    </svg>
  ),
  "wohnraumberatung": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  ),
  "angehoerigen-coaching": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8.5" cy="8" r="3" />
      <circle cx="16.5" cy="9.5" r="2.4" />
      <path d="M3.5 20c0-3 2.2-5 5-5s5 2 5 5" />
      <path d="M14.5 15.6c2.7 0 5 1.8 5 4.4" />
    </svg>
  ),
  "qualitaetssicherung": (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  ),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqGraph()) }}
      />

      {/* ---------------- Hero ---------------- */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container hero__grid">
          <div>
            <span className="eyebrow">Unabhängige Pflegeberatung in Wien</span>
            <h1 id="hero-heading">
              Pflegeberatung Wien – Gutachten &amp; Case Management
            </h1>
            <p className="hero__subtitle">
              Ihr unabhängiger Experte für Pflegegeld, Einstufungen und
              Pflegeorganisation im Raum Wien – persönlich, vor Ort und auf
              Augenhöhe.
            </p>
            <div className="hero__actions">
              <Link href="/termin" className="btn btn--primary">
                Jetzt Termin buchen
              </Link>
              <a href="#leistungen" className="btn btn--secondary">
                Leistungen ansehen
              </a>
            </div>
            <ul className="trust-grid" aria-label="Qualifikationen">
              {TRUST_SIGNALS.map((t) => (
                <li key={t.term}>
                  <strong>{t.term}</strong>
                  <span>{t.detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hero__image">
            <img
              src="/illustration-beratung.svg"
              alt=""
              width={720}
              height={520}
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ---------------- Über mich ---------------- */}
      <section id="ueber-mich" className="section" aria-labelledby="about-heading">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Über mich</span>
            <h2 id="about-heading">Pflegefachliche Expertise, der Sie vertrauen können</h2>
            <div className="about-grid">
              <div>
                <p>
                  Mein Name ist <strong>{SITE.owner}</strong>. Als diplomierter
                  Gesundheits- und Krankenpfleger (DGKP) mit{" "}
                  <strong>13 Jahren Berufserfahrung im gehobenen Dienst</strong> und
                  einer{" "}
                  <strong>Zusatzausbildung zum Pflegegeldbegutachter</strong> unterstütze
                  ich Sie und Ihre Angehörigen bei allen Fragen rund um Pflegegeld,
                  Einstufungen und die Organisation der Pflege zu Hause.
                </p>
                <p>
                  Ich arbeite <strong>unabhängig</strong> – mein einziges Interesse ist,
                  dass Sie die Unterstützung erhalten, die Ihnen zusteht. Mit Empathie
                  und fachlicher Präzision schätze ich den tatsächlichen Pflegebedarf
                  realistisch ein und begleite Sie durch Anträge, Begutachtungen und
                  Entscheidungen.
                </p>
                <p>
                  Angehörige stehen bei mir im Mittelpunkt: Sie erhalten verständliche
                  Antworten, eine ehrliche Einschätzung und{" "}
                  <strong>konkrete nächste Schritte</strong> – keine leeren Versprechen.
                </p>
              </div>
              <div>
                <figure className="about-figure">
                  <img
                    src="/illustration-pflegegeld.svg"
                    alt="Illustration eines Pflegegeld-Antrags mit Checkliste, Beratungsmappe und Prüfsiegel"
                    width={480}
                    height={420}
                    loading="lazy"
                  />
                </figure>
                <ul className="about-values" aria-label="Meine Grundsätze">
                  <li>Unabhängigkeit</li>
                  <li>Empathie</li>
                  <li>Fachliche Präzision</li>
                  <li>Unterstützung für Angehörige</li>
                  <li>Realistische Einschätzung des Pflegebedarfs</li>
                  <li>Konkrete nächste Schritte</li>
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Leistungen ---------------- */}
      <section
        id="leistungen"
        className="section section--sage"
        aria-labelledby="services-heading"
      >
        <div className="container">
          <Reveal>
            <span className="eyebrow">Leistungsportfolio</span>
            <h2 id="services-heading">Meine Leistungen für Sie</h2>
            <p className="section-intro">
              Von der Pflegegeld-Einstufung bis zur Qualitätssicherung – professionelle
              Unterstützung in allen Phasen der Pflege, in ganz Wien.
            </p>
          </Reveal>
          <div className="card-grid">
            {SERVICES.map((s) => (
              <Reveal key={s.title}>
                <article className="card">
                  <span className="card__icon">{ICONS[s.slug]}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <ul className="card__list">
                    {s.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Ablauf ---------------- */}
      <section id="ablauf" className="section" aria-labelledby="steps-heading">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Ablauf</span>
            <h2 id="steps-heading">So einfach funktioniert es</h2>
          </Reveal>
          <ol className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <Reveal>
                  <div className="step">
                    <span className="step__number" aria-hidden="true">
                      {i + 1}
                    </span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="section section--petrol" aria-labelledby="cta-heading">
        <div className="container" style={{ textAlign: "center" }}>
          <Reveal>
            <h2 id="cta-heading">Bereit für den ersten Schritt?</h2>
            <p className="section-intro" style={{ marginInline: "auto" }}>
              Buchen Sie jetzt Ihren Beratungstermin – unkompliziert und verbindlich.
            </p>
            <Link href="/termin" className="btn btn--primary">
              Jetzt Termin buchen
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="section section--sage" aria-labelledby="faq-heading">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Häufige Fragen</span>
            <h2 id="faq-heading">Antworten rund um Pflegegeld &amp; Pflegeberatung</h2>
            <p className="section-intro">
              Die wichtigsten Fragen zu Pflegegeld, Einstufung und Beratung in Wien –
              kurz und verständlich beantwortet.
            </p>
          </Reveal>
          <div className="faq-list">
            {FAQS.map((faq) => (
              <Reveal key={faq.question}>
                <details className="faq-item">
                  <summary>
                    <span>{faq.question}</span>
                    <span className="faq-item__marker" aria-hidden="true" />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Kontakt ---------------- */}
      <section id="kontakt" className="section" aria-labelledby="contact-heading">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Kontakt</span>
            <h2 id="contact-heading">So erreichen Sie mich</h2>
          </Reveal>
          <div className="contact-grid">
            <Reveal>
              <div className="contact-details">
                <p>
                  <strong>{SITE.owner}</strong>
                  {SITE.name}
                </p>
                <p>
                  <strong>Adresse</strong>
                  {SITE.address.street}
                  <br />
                  {SITE.address.zip} {SITE.address.city}
                </p>
                <p>
                  <strong>Telefon</strong>
                  {SITE.phone}
                </p>
                <p>
                  <strong>E-Mail</strong>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </p>
              </div>
            </Reveal>
            <Reveal>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
