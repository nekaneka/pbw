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
  ownerJobTitle: "Diplomierter Gesundheits- und Krankenpfleger (DGKP)",
  address: {
    street: "Maria Tusch Straße 9/3/101",
    zip: "1220",
    city: "Wien",
    region: "Wien",
    country: "AT",
  },
  /**
   * Approximate coordinates for 1220 Wien (Donaustadt).
   * TODO before go-live: replace with the exact coordinates of the address
   * (e.g. from Google Maps → right-click → coordinates). Google mainly uses
   * the Google Business Profile pin for the map, so this is a secondary signal.
   */
  geo: { latitude: 48.2389, longitude: 16.4517 },
  phone: "+43 XXX XXX XXXX", // TODO: replace placeholder
  email: "kontakt@pflegeberatung-wien.at", // TODO: replace placeholder
  /** Serviced areas – strengthens local relevance in structured data. */
  areasServed: [
    "Wien",
    "Donaustadt",
    "Floridsdorf",
    "Leopoldstadt",
    "Landstraße",
    "Brigittenau",
    "Wien Umgebung",
  ],
  /** Public social/profile URLs. Add real ones as they go live (SEO `sameAs`). */
  sameAs: [] as string[],
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
