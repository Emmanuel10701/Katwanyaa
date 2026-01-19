import localFont from "next/font/local";
import "./globals.css";
import ClientLayoutWrapper from "./-app";
import { SessionProvider } from './session/sessiowrapper';

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

// 1. Separate Viewport export (Matching Mary Immaculate pattern)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ea580c', // Orange color from your theme
}

// School information constants
const SCHOOL_INFO = {
  name: "Katwanyaa High School",
  alternateName: "Katz High School",
  description: "Katwanyaa High School (Katz) is a top-performing public county school in Matungulu, Machakos County offering quality KCSE education with STEM programs, modern facilities, and comprehensive extracurricular activities.",
  address: {
    street: "Kambusu",
    locality: "Matungulu",
    region: "Machakos County",
    country: "Kenya",
    postalCode: "90100",
  },
  motto: "Education is Light",
};

// 2. Optimized Metadata - Cleaner version following Mary Immaculate pattern
export const metadata = {
  // IMPORTANT: Set this to your production domain
  metadataBase: new URL('https://katwanyaa.vercel.app'),
  
  title: {
    default: "Katwanyaa High School | Katz High School | Matungulu Machakos",
    template: "%s | Katwanyaa High School"
  },
  
  description: "Official website for Katwanyaa High School (Katz) in Matungulu, Machakos County. A premier public county school committed to academic excellence, STEM education, and holistic development.",
  
  keywords: [
    // Primary search terms
    "Katwanyaa High School",
    "Katz High School",
    "Matungulu schools",
    "Machakos secondary schools",
    "Katwanyaa Secondary School",
    
    // Academic focus
    "KCSE Results 2024",
    "School admissions Matungulu",
    "Form 1 selection Machakos",
    "Boarding schools Machakos",
    
    // Location-based
    "Schools in Matungulu",
    "Machakos county schools",
    "Public schools Machakos",
    "Kambusu school",
    
    // Programs and facilities
    "STEM schools Kenya",
    "Schools with computer labs",
    "Sports facilities schools"
  ],
  
  authors: [{ name: "Katwanyaa High School" }],
  
  // Canonical URL
  alternates: {
    canonical: '/',
  },

  // Open Graph for social sharing
  openGraph: {
    title: "Katwanyaa High School | Katz High School | Matungulu",
    description: "Premier secondary education in Matungulu, Machakos County",
    url: 'https://katwanyaa.vercel.app',
    siteName: "Katwanyaa High School",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: '/katz.png',
        width: 1200,
        height: 630,
        alt: 'Katwanyaa High School Logo',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Katwanyaa High School",
    description: "Quality education in Matungulu, Machakos County",
    images: ['/katz.png'],
  },

  // Search Engine instructions
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Icons
  icons: {
    icon: "/katz.png",
    apple: "/katz.png",
  },
  
  // Verification codes (add yours here)
  verification: {
    google: "google8c80f424765b151e", // Add your code here
  },
};

// Structured Data Schema for SEO
function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": SCHOOL_INFO.name,
    "alternateName": SCHOOL_INFO.alternateName,
    "url": "https://katwanyaa.vercel.app",
    "logo": "https://katwanyaa.vercel.app/katz.png",
    "description": SCHOOL_INFO.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SCHOOL_INFO.address.street,
      "addressLocality": SCHOOL_INFO.address.locality,
      "addressRegion": SCHOOL_INFO.address.region,
      "addressCountry": SCHOOL_INFO.address.country,
      "postalCode": SCHOOL_INFO.address.postalCode
    },
    "slogan": SCHOOL_INFO.motto,
    "sameAs": [
      "https://www.facebook.com/katwanyaahighschool",
      "https://twitter.com/katwanyaahigh",
      "https://www.instagram.com/katwanyaahigh",
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Next.js automatically adds metadata to <head> */}
      <head>
        {/* Structured Data for Rich Results */}
        <StructuredData />
        
        {/* Additional meta tags */}
        <meta name="geo.region" content="KE-MKA" />
        <meta name="geo.placename" content="Matungulu, Machakos County" />
        <meta name="geo.position" content="-1.2156, 37.1328" />
        <meta name="ICBM" content="-1.2156, 37.1328" />
      </head>
      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-orange-50 via-white to-amber-50 text-gray-900`}
      >
        <SessionProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}