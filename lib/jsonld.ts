/**
 * Structured data (schema.org JSON-LD) builders.
 *
 * The site-wide graph describes the business, the provider (Person) and the
 * website as linked entities. The FAQ graph is emitted only on the page that
 * renders the visible FAQ. All content is sourced from lib/site + lib/content
 * so the markup never contradicts the page.
 */
import { SITE } from "./site";
import { SERVICES, FAQS, type FaqItem } from "./content";

const ID_BUSINESS = `${SITE.url}/#business`;
const ID_PERSON = `${SITE.url}/#person`;
const ID_WEBSITE = `${SITE.url}/#website`;
const OG_IMAGE = `${SITE.url}/opengraph-image`;

/** Site-wide entity graph: business + provider + website. */
export function organizationGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["ProfessionalService", "LocalBusiness"],
        "@id": ID_BUSINESS,
        name: SITE.name,
        alternateName: SITE.shortName,
        description: SITE.description,
        url: SITE.url,
        telephone: SITE.phone,
        email: SITE.email,
        image: OG_IMAGE,
        logo: `${SITE.url}/icon`,
        priceRange: "€€",
        currenciesAccepted: "EUR",
        address: {
          "@type": "PostalAddress",
          streetAddress: SITE.address.street,
          postalCode: SITE.address.zip,
          addressLocality: SITE.address.city,
          addressRegion: SITE.address.region,
          addressCountry: SITE.address.country,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: SITE.geo.latitude,
          longitude: SITE.geo.longitude,
        },
        areaServed: SITE.areasServed.map((name) => ({ "@type": "Place", name })),
        founder: { "@id": ID_PERSON },
        employee: { "@id": ID_PERSON },
        knowsAbout: [
          "Pflegegeld",
          "Pflegegeld-Einstufung",
          "Pflegegutachten",
          "Case Management",
          "Care Management",
          "24-Stunden-Betreuung",
          "Barrierefreiheitsberatung",
          "Angehörigen-Coaching",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Leistungen der Pflegeberatung",
          itemListElement: SERVICES.map((s) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: s.title,
              description: s.text,
              areaServed: { "@type": "City", name: "Wien" },
              provider: { "@id": ID_BUSINESS },
            },
          })),
        },
        ...(SITE.sameAs.length > 0 ? { sameAs: SITE.sameAs } : {}),
      },
      {
        "@type": "Person",
        "@id": ID_PERSON,
        name: SITE.owner,
        jobTitle: SITE.ownerJobTitle,
        worksFor: { "@id": ID_BUSINESS },
        description:
          "Diplomierter Gesundheits- und Krankenpfleger mit 13 Jahren Berufserfahrung und Zusatzausbildung zum Pflegegeldbegutachter.",
        knowsAbout: ["Pflegegeld", "Pflegegutachten", "Case Management", "Pflegeorganisation"],
        hasCredential: [
          {
            "@type": "EducationalOccupationalCredential",
            credentialCategory: "Diplom",
            name: "Diplomierter Gesundheits- und Krankenpfleger (DGKP)",
          },
          {
            "@type": "EducationalOccupationalCredential",
            credentialCategory: "Zusatzausbildung",
            name: "Pflegegeldbegutachter",
          },
        ],
        ...(SITE.sameAs.length > 0 ? { sameAs: SITE.sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": ID_WEBSITE,
        url: SITE.url,
        name: SITE.name,
        inLanguage: "de-AT",
        publisher: { "@id": ID_BUSINESS },
      },
    ],
  };
}

/** FAQPage – emit on the page that shows the matching visible FAQ. */
export function faqGraph(faqs: FaqItem[] = FAQS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
