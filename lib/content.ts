/**
 * Shared, presentation-free site content.
 * Used by both the rendered pages and the JSON-LD structured data, so the
 * two can never drift apart.
 */

export interface ServiceItem {
  /** Stable id – also keys the icon map on the homepage. */
  slug: string;
  title: string;
  text: string;
  points: string[];
}

export const SERVICES: ServiceItem[] = [
  {
    slug: "pflegegeld-einstufung",
    title: "Pflegegeld-Einstufung & Gutachten",
    text: "Damit der tatsächliche Pflegebedarf auch anerkannt wird.",
    points: [
      "Unabhängige Ersteinstufung bei Ihnen zu Hause",
      "Erst- und Erhöhungsanträge fachlich vorbereitet",
      "Begleitung bei Begutachtungsterminen von PVA, ÖGK & Co.",
    ],
  },
  {
    slug: "case-management",
    title: "Privates Case & Care Management",
    text: "Die passende Versorgung planen, organisieren und koordinieren.",
    points: [
      "Häusliches Pflege-Audit mit klarem Ergebnis",
      "Individueller Versorgungsplan für Ihre Situation",
      "Vermittlung mobiler Dienste und 24-Stunden-Betreuung",
    ],
  },
  {
    slug: "wohnraumberatung",
    title: "Wohnraum- & Barrierefreiheitsberatung",
    text: "Sicher zu Hause wohnen bleiben – so lange wie möglich.",
    points: [
      "Analyse von Sturzquellen in der Wohnung",
      "Pflegefachliche Umbau-Gutachten",
      "Unterlagen für Förderansuchen, z. B. Sozialministeriumservice",
    ],
  },
  {
    slug: "angehoerigen-coaching",
    title: "Angehörigen-Coaching",
    text: "Pflegende Angehörige stärken und entlasten.",
    points: [
      "Praxisschulung direkt am Krankenbett",
      "Rückenschonende Mobilisation & Kinästhetik",
      "Entlastungsgespräche zur Burnout-Prophylaxe",
    ],
  },
  {
    slug: "qualitaetssicherung",
    title: "Qualitätssicherung",
    text: "Gewissheit, dass die Betreuung wirklich passt.",
    points: [
      "Zertifizierte Qualitätsvisiten",
      "Pflege-Zustandskontrollen bei 24-Stunden-Betreuungen",
      "Für Familien ebenso wie für Agenturen",
    ],
  },
];

export interface StepItem {
  title: string;
  text: string;
}

export const STEPS: StepItem[] = [
  {
    title: "Erstgespräch",
    text: "Wir besprechen Ihre Situation, Ihre Fragen und Ihre Ziele – telefonisch, online oder direkt bei Ihnen zu Hause in Wien.",
  },
  {
    title: "Fachliche Einschätzung",
    text: "Als DGKP mit Begutachter-Ausbildung beurteile ich den Pflegebedarf realistisch, unabhängig und nachvollziehbar – wie bei einer offiziellen Einstufung.",
  },
  {
    title: "Konkreter Plan",
    text: "Sie erhalten klare Empfehlungen und konkrete nächste Schritte – vom Pflegegeld-Antrag bis zur Organisation der Versorgung.",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQ answers cover common long-tail searches around Pflegegeld and care in
 * Vienna. Content is kept factually general (no invented prices or figures)
 * and mirrors the visible FAQ section 1:1 for valid FAQPage structured data.
 */
export const FAQS: FaqItem[] = [
  {
    question: "Was kostet eine Pflegeberatung in Wien?",
    answer:
      "Die Kosten richten sich nach Umfang und Art der Leistung – etwa Erstgespräch, Hausbesuch oder Gutachten. Sie erhalten vorab immer ein transparentes, unverbindliches Angebot, damit Sie genau wissen, womit Sie rechnen. Als Kleinunternehmer verrechne ich ohne Umsatzsteuer.",
  },
  {
    question: "Wer hat in Österreich Anspruch auf Pflegegeld?",
    answer:
      "Anspruch auf Pflegegeld besteht, wenn ein ständiger Betreuungs- und Hilfsbedarf von mehr als 65 Stunden pro Monat vorliegt und dieser voraussichtlich mindestens sechs Monate andauert. Je nach Ausmaß des Pflegebedarfs wird eine von sieben Pflegegeldstufen zuerkannt. Im Erstgespräch schätze ich Ihren individuellen Bedarf realistisch ein.",
  },
  {
    question: "Wie läuft die Pflegegeld-Einstufung ab?",
    answer:
      "Nach dem Antrag beim zuständigen Entscheidungsträger (z. B. PVA) erfolgt ein Begutachtungstermin, bei dem der Pflegebedarf in Stunden pro Monat eingeschätzt wird. Ich bereite Sie auf diesen Termin vor, dokumentiere den tatsächlichen Aufwand und begleite Sie auf Wunsch persönlich, damit nichts übersehen wird.",
  },
  {
    question:
      "Was bringt eine unabhängige Einschätzung vor dem offiziellen Begutachtungstermin?",
    answer:
      "Eine unabhängige Ersteinschätzung zeigt Ihnen realistisch, welche Pflegegeldstufe zu erwarten ist, und deckt auf, was bei der Begutachtung oft übersehen wird – etwa nächtlicher Betreuungsbedarf oder erschwerende Umstände. So gehen Sie gut vorbereitet und mit den richtigen Unterlagen in den Termin.",
  },
  {
    question: "Was kann ich tun, wenn das Pflegegeld zu niedrig eingestuft wurde?",
    answer:
      "Sie können einen Erhöhungsantrag stellen oder gegen den Bescheid vorgehen. Ich prüfe Ihre Einstufung fachlich, dokumentiere den tatsächlichen Pflegebedarf nachvollziehbar und unterstütze Sie bei den nächsten Schritten.",
  },
  {
    question: "Bieten Sie Hausbesuche in Wien an?",
    answer:
      "Ja. Ich berate Sie gerne direkt bei Ihnen zu Hause – in allen Wiener Bezirken und der näheren Umgebung. Gerade bei Einstufungen und Wohnraumberatungen ist der Blick vor Ort besonders wertvoll.",
  },
  {
    question: "Worin unterscheiden sich Pflegeberatung und Case Management?",
    answer:
      "Die Pflegeberatung beantwortet konkrete Fragen und unterstützt punktuell, etwa bei einer Einstufung. Beim Case & Care Management übernehme ich darüber hinaus die laufende Planung und Koordination der gesamten Versorgung – von mobilen Diensten bis zur 24-Stunden-Betreuung.",
  },
  {
    question: "Wie schnell bekomme ich einen Beratungstermin?",
    answer:
      "Freie Termine können Sie jederzeit online buchen und sehen sofort, wann ich verfügbar bin. In dringenden Fällen kontaktieren Sie mich am besten direkt – wir finden gemeinsam eine rasche Lösung.",
  },
];
