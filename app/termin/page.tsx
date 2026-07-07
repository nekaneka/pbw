import type { Metadata } from "next";
import TerminClient from "@/components/TerminClient";

const title = "Termin buchen – Pflegeberatung Wien";
const description =
  "Buchen Sie online einen Termin für Pflegeberatung in Wien: Pflegegeld-Einstufung, Gutachten, Case Management, Wohnraumberatung oder Angehörigen-Coaching. Freie Termine sofort sichtbar.";

export const metadata: Metadata = {
  title: "Termin buchen",
  description,
  alternates: {
    canonical: "/termin",
  },
  openGraph: {
    type: "website",
    locale: "de_AT",
    url: "/termin",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function TerminPage() {
  return <TerminClient />;
}
