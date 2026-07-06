import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.description,
  keywords: SITE.keywords,
  alternates: {
    // TODO: adjust once the final domain is registered
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "de_AT",
    url: SITE.url,
    siteName: SITE.shortName,
    title: SITE.name,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/** JSON-LD structured data for a local professional service. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  telephone: SITE.phone,
  email: SITE.email,
  founder: {
    "@type": "Person",
    name: SITE.owner,
    jobTitle: "Diplomierter Gesundheits- und Krankenpfleger (DGKP)",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    postalCode: SITE.address.zip,
    addressLocality: SITE.address.city,
    addressCountry: SITE.address.country,
  },
  areaServed: {
    "@type": "City",
    name: "Wien",
  },
  knowsAbout: [
    "Pflegegeld-Einstufung",
    "Pflegegutachten",
    "Case Management",
    "Care Management",
    "24-Stunden-Betreuung",
    "Barrierefreiheitsberatung",
    "Angehörigen-Coaching",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de-AT">
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) inject
          attributes into <body> before React hydrates. Only attribute
          mismatches on this element are suppressed – children are unaffected. */}
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a href="#main" className="skip-link">
          Zum Inhalt springen
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
