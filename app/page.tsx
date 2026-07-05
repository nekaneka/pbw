import Link from "next/link";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";
import { SITE } from "@/lib/site";

const TRUST_BADGES = [
  "DGKP",
  "13 Jahre Berufserfahrung",
  "Vor-Ort-Beratung in Wien",
  "Unabhängige Einschätzung",
  "Zusatzausbildung zum Pflegegeldbegutachter",
];

const SERVICES = [
  {
    icon: "📋",
    title: "Pflegegeld-Einstufung & Gutachten",
    text: "Unabhängige Ersteinstufung vor Ort, Unterstützung bei Erst- und Erhöhungsanträgen sowie fachliche Begleitung bei offiziellen Begutachtungsterminen (z. B. PVA, ÖGK).",
  },
  {
    icon: "🧭",
    title: "Privates Case & Care Management",
    text: "Häusliche Pflege-Audits, Erstellung individueller Versorgungspläne sowie Organisation und Vermittlung von mobilen Diensten oder 24-Stunden-Betreuungen.",
  },
  {
    icon: "🏠",
    title: "Wohnraum- & Barrierefreiheitsberatung",
    text: "Analyse von Sturzquellen zu Hause und Erstellung von pflegefachlichen Umbau-Gutachten für Förderansuchen (z. B. Sozialministeriumservice).",
  },
  {
    icon: "🤝",
    title: "Angehörigen-Coaching",
    text: "Praxisnahe Schulungen direkt am Krankenbett – z. B. rückenschonende Mobilisation und Kinästhetik – sowie Entlastungsgespräche zur Burnout-Prophylaxe.",
  },
  {
    icon: "✅",
    title: "Qualitätssicherung",
    text: "Zertifizierte Qualitätsvisiten und Pflege-Zustandskontrollen bei bestehenden 24-Stunden-Betreuungen für Familien und Agenturen.",
  },
];

const STEPS = [
  {
    title: "Erstgespräch",
    text: "Wir besprechen Ihre Situation, Ihre Fragen und Ihre Ziele – telefonisch, online oder direkt bei Ihnen zu Hause.",
  },
  {
    title: "Fachliche Einschätzung",
    text: "Als DGKP mit Gutachter-Ausbildung beurteile ich den Pflegebedarf realistisch, unabhängig und nachvollziehbar.",
  },
  {
    title: "Konkreter Plan",
    text: "Sie erhalten klare Empfehlungen und konkrete nächste Schritte – von Anträgen bis zur Organisation der Versorgung.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container hero__grid">
          <div>
            <h1 id="hero-heading">
              Pflegeberatung Wien – Gutachten &amp; Case Management
            </h1>
            <p className="hero__subtitle">
              Ihr unabhängiger Experte für Pflegegeld, Einstufungen und
              Pflegeorganisation im Raum Wien.
            </p>
            <div className="hero__actions">
              <Link href="/termin" className="btn btn--primary">
                Jetzt Termin buchen
              </Link>
              <a href="#leistungen" className="btn btn--secondary">
                Leistungen ansehen
              </a>
            </div>
            <ul className="trust-list" aria-label="Qualifikationen und Vorteile">
              {TRUST_BADGES.map((badge) => (
                <li key={badge}>{badge}</li>
              ))}
            </ul>
          </div>
          <div className="hero__image">
            <img
              src="/hero-illustration.svg"
              alt=""
              width={700}
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
                  {/* TODO: replace with a real portrait photo before go-live */}
                  <img
                    src="/portrait-placeholder.svg"
                    alt="Porträt von Anes Mehremic (Platzhalterbild)"
                    width={480}
                    height={480}
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
        className="section section--grey"
        aria-labelledby="services-heading"
      >
        <div className="container">
          <Reveal>
            <span className="eyebrow">Leistungsportfolio</span>
            <h2 id="services-heading">Meine Leistungen für Sie</h2>
            <p className="section-intro">
              Von der Pflegegeld-Einstufung bis zur Qualitätssicherung – professionelle
              Unterstützung in allen Phasen der Pflege.
            </p>
          </Reveal>
          <div className="card-grid">
            {SERVICES.map((s) => (
              <Reveal key={s.title}>
                <article className="card">
                  <span className="card__icon" aria-hidden="true">
                    {s.icon}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
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
          <ol className="steps" style={{ listStyle: "none", padding: 0, margin: 0 }}>
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
      <section className="section section--teal" aria-labelledby="cta-heading">
        <div className="container" style={{ textAlign: "center" }}>
          <Reveal>
            <h2 id="cta-heading">Bereit für den ersten Schritt?</h2>
            <p className="section-intro" style={{ marginInline: "auto" }}>
              Buchen Sie jetzt Ihren Termin – unkompliziert und verbindlich.
            </p>
            <Link href="/termin" className="btn btn--primary">
              Jetzt Termin buchen
            </Link>
          </Reveal>
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
