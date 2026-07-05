/**
 * Central site configuration.
 * TODO before go-live: replace phone, e-mail and domain placeholders.
 */
export const SITE = {
  name: "Pflegeberatung Wien – Gutachten & Case Management",
  shortName: "Pflegeberatung Wien",
  description:
    "Unabhängige Pflegeberatung in Wien: Pflegegeld-Einstufung, Gutachten, Case & Care Management, Wohnraumberatung und Angehörigen-Coaching. DGKP mit 13 Jahren Berufserfahrung.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.pflegeberatung-wien.at",
  owner: "Anes Mehremic",
  address: {
    street: "Maria Tusch Straße 9/3/101",
    zip: "1220",
    city: "Wien",
    country: "AT",
  },
  phone: "+43 XXX XXX XXXX", // TODO: replace placeholder
  email: "kontakt@pflegeberatung-wien.at", // TODO: replace placeholder
  keywords: [
    "Pflegeberatung Wien",
    "Pflegegeld Wien",
    "Pflegegeld Einstufung",
    "Pflegegeld Gutachten",
    "Case Management Wien",
    "Care Management Wien",
    "DGKP Pflegeberatung",
    "24-Stunden-Betreuung Beratung",
    "Pflegegutachten Wien",
    "Angehörigen Coaching Pflege",
  ],
};
