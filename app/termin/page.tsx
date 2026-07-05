import type { Metadata } from "next";
import TerminClient from "@/components/TerminClient";

export const metadata: Metadata = {
  title: "Termin buchen",
  description:
    "Buchen Sie online einen Termin für Pflegeberatung in Wien: Pflegegeld-Einstufung, Case Management, Wohnraumberatung oder Angehörigen-Coaching.",
  alternates: {
    canonical: "/termin",
  },
};

export default function TerminPage() {
  return <TerminClient />;
}
