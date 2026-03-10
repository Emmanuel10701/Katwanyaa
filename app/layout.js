import localFont from "next/font/local";
import "./globals.css";
import ClientLayoutWrapper from "./-app";
import { SessionProvider } from "./session/sessiowrapper";

/* -------------------------------------------------------------------------- */
/* FONTS                                    */
/* -------------------------------------------------------------------------- */
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

/* -------------------------------------------------------------------------- */
/* VIEWPORT                                  */
/* -------------------------------------------------------------------------- */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ea580c", // Matches your orange-600 brand color
};

/* -------------------------------------------------------------------------- */
/* METADATA                                  */
/* -------------------------------------------------------------------------- */
export const metadata = {
  metadataBase: new URL("https://katwanyaa.vercel.app"),

  title: {
    default: "A.I.C Katwanyaa Senior School",
    template: "%s | Katwanyaa Senior School",
  },

  description:
    "The official website of A.I.C Katwanyaa Senior School in Matungulu, Machakos County. Dedicated to academic excellence, Christian values, and holistic student development in Kenya.",
  
  keywords: [
    "Katwanyaa Senior High School",
    "Katwanyaa Secondary School",
    "AIC Katwanyaa",
    "katwanyaa school",
    "Katwanyaa Senior School",
    "katz school",
    "katz",
    "A.I.C Katwanyaa",
    "AIC Katwanyaa Senior High",
    "Katz senior high school",
    "Katwanyaa Senior School Matungulu",
    "Machakos County Schools",
    "Best secondary schools in Machakos",
    "Public schools in Kenya",
    "Katwanyaa school results",
    "Katwanyaa school admissions",
    "Katwanyaa school events",
    "Katwanyaa school news",
    "Katwanyaa school contact",
    "Katwanyaa school location",
    "Katwanyaa school map",
    "Katwanyaa school history",
    "Katwanyaa school achievements",
    "Katwanyaa school curriculum",
    "Katwanyaa school fees",
    "Katwanyaa school uniform",
    "Katwanyaa school alumni",    
    
  ],

  authors: [{ name: "A.I.C Katwanyaa Senior School" }],
  
  alternates: {
    canonical: "/",
  },

  /* Open Graph (Social Media Sharing) */
  openGraph: {
    title: "A.I.C Katwanyaa School",
    description: "Official school website.",
    url: "https://katwanyaa.vercel.app",
    siteName: "Katwanyaa Senior School",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "/katz.jpeg",
        width: 1200,
        height: 630,
        alt: "A.I.C Katwanyaa Senior School",
      },
    ],
  },

  /* Twitter Card */
  twitter: {
    card: "summary_large_image",
    title: "A.I.C Katwanyaa Senior School",
    description: "Empowering students through education and faith in Machakos County.",
    images: ["/katz.jpeg"],
  },

  /* Search Engine Bot Instructions */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/katz.jpeg",
    apple: "/katz.jpeg",
  },

  verification: {
    google: "googlef8123d1ff1ecb88f",
  },
};

/* -------------------------------------------------------------------------- */
/* ROOT LAYOUT                                 */
/* -------------------------------------------------------------------------- */
export default function RootLayout({ children }) {
  // Structured Data (JSON-LD) for Local Business/School SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "School",
    "name": "A.I.C Katwanyaa Senior School",
    "alternateName": "Katwanyaa Senior School",
    "url": "https://katwanyaa.vercel.app",
    "logo": "https://katwanyaa.vercel.app/katz.jpeg",
    "image": "https://katwanyaa.vercel.app/katz.jpeg",
    "description": "A premier public secondary school in Matungulu, Machakos County, Kenya.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Matungulu",
      "addressRegion": "Machakos County",
      "addressCountry": "KE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-1.2825", // Optional: replace with your actual GPS coordinates
      "longitude": "37.2618"
    },
    "hasMap": "https://www.google.com/maps?q=Katwanyaa+Secondary+School", 
    "telephone": "+254-000-000000", // Update with official school phone
    "priceRange": "N/A"
  };

  return (
    <html lang="en">
      <head>
        {/* Injecting Structured Data into the Head */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-orange-50 via-white to-amber-50 text-gray-900`}
      >
        <SessionProvider>
          <ClientLayoutWrapper>
            {/* Semantic <main> tag should wrap content in page.jsx files for SEO */}
            {children}
          </ClientLayoutWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}