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

// CRITICAL: Your target keywords - These are what people search for
const PRIMARY_KEYWORDS = "Katwanyaa High School, Katz High School, Matungulu Schools, Machakos Secondary Schools";
const SECONDARY_KEYWORDS = "KCSE Results 2024, School Admissions, Form 1 Selection, Boarding Schools Machakos";

// Your school info - Google LOVES local business info
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
    coordinates: "-1.2156, 37.1328"
  },
  contact: {
    phone: "+254-728-123-456",
    email: "info@katwanyaa.sc.ke",
    openingHours: "Mo-Fr 08:00-17:00, Sa 09:00-13:00"
  },
  foundingDate: "1976",
  motto: "Education is Light",
  accreditation: "Ministry of Education Kenya, TSC Certified",
  kcsePerformance: "Consistently ranked among top schools in Machakos County"
};

export const metadata = {
  // CRITICAL: Title with PRIMARY keyword FIRST
  title: `${SCHOOL_INFO.name} | ${SCHOOL_INFO.alternateName} | Premier Secondary School in Matungulu Machakos`,
  
  // CRITICAL: Description with keywords and value proposition
  description: `${SCHOOL_INFO.description} Admissions open for Form 1 2025. Check KCSE results, school fees structure, facilities, and academic programs. ${PRIMARY_KEYWORDS}.`,
  
  // CRITICAL: Keywords that people ACTUALLY search for
  keywords: [
    // PRIMARY - Most searched
    "Katwanyaa High School",
    "Katz High School",
    "Katwanyaa Secondary School",
    "Matungulu High Schools",
    "Machakos County Schools",
    
    // Academic searches
    "KCSE Results 2024 Katwanyaa",
    "Katwanyaa School Fees 2024",
    "Form 1 Admission Katwanyaa",
    "KCSE Performance Machakos",
    
    // Location-based searches
    "Schools in Matungulu",
    "Secondary Schools Machakos",
    "Boarding Schools near Machakos",
    "Day Schools Matungulu",
    
    // Program searches
    "STEM Schools Kenya",
    "Schools with Computer Labs",
    "Schools with Sports Facilities",
    
    // Alternative name searches
    "Katz Machakos",
    "AIC Katwanyaa",
    "Katwanyaa Kambusu",
    
    // General education searches
    "Best Schools in Machakos",
    "Public Secondary Schools Kenya",
    "Quality Education Kenya",
    "Academic Excellence Machakos"
  ],
  
  authors: [{ name: SCHOOL_INFO.name }],
  creator: SCHOOL_INFO.name,
  publisher: SCHOOL_INFO.name,
  
  // CRITICAL: Tell Google to index EVERYTHING
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // CRITICAL: Open Graph for social media shares (Facebook, WhatsApp, etc.)
  openGraph: {
    title: `${SCHOOL_INFO.name} | ${SCHOOL_INFO.alternateName}`,
    description: `${SCHOOL_INFO.description} Visit our website for admissions, fees, and academic programs.`,
    url: 'https://katwanyaa.vercel.app',
    siteName: SCHOOL_INFO.name,
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: 'https://katwanyaa.vercel.app/katz.png',
        width: 1200,
        height: 630,
        alt: `${SCHOOL_INFO.name} Logo`,
      },
    ],
  },
  
  // CRITICAL: Twitter Card for Twitter shares
  twitter: {
    card: 'summary_large_image',
    title: `${SCHOOL_INFO.name} | ${SCHOOL_INFO.alternateName}`,
    description: `${SCHOOL_INFO.description}`,
    images: ['https://katwanyaa.vercel.app/katz.png'],
    creator: '@katwanyaa_high',
    site: '@katwanyaa_high',
  },
  
  // CRITICAL: Canonical URL - Tell Google THIS is the main version
  alternates: {
    canonical: 'https://katwanyaa.vercel.app',
  },
  
  // CRITICAL: Category helps Google understand your site type
  category: 'Education',
  
  // CRITICAL: Tell Next.js the base URL for all metadata
  metadataBase: new URL('https://katwanyaa.vercel.app'),
  
  // CRITICAL: Additional meta for search engines
  other: {
    'ahrefs-site-verification': 'your_ahrefs_code_here',
    'msvalidate.01': 'your_bing_code_here',
  }
};

export default function RootLayout({ children }) {
  // CRITICAL: Structured Data that Google LOVES
  const structuredData = [
    // 1. ORGANIZATION Schema (Most Important for Google)
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "@id": "https://katwanyaa.vercel.app/#organization",
      "name": SCHOOL_INFO.name,
      "alternateName": SCHOOL_INFO.alternateName,
      "url": "https://katwanyaa.vercel.app",
      "logo": "https://katwanyaa.vercel.app/katz.png",
      "image": "https://katwanyaa.vercel.app/katz.png",
      "description": SCHOOL_INFO.description,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": SCHOOL_INFO.address.street,
        "addressLocality": SCHOOL_INFO.address.locality,
        "addressRegion": SCHOOL_INFO.address.region,
        "addressCountry": SCHOOL_INFO.address.country,
        "postalCode": SCHOOL_INFO.address.postalCode
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": SCHOOL_INFO.address.coordinates.split(',')[0],
        "longitude": SCHOOL_INFO.address.coordinates.split(',')[1]
      },
      "telephone": SCHOOL_INFO.contact.phone,
      "email": SCHOOL_INFO.contact.email,
      "openingHours": SCHOOL_INFO.contact.openingHours,
      "foundingDate": SCHOOL_INFO.foundingDate,
      "foundingLocation": SCHOOL_INFO.address.locality,
      "slogan": SCHOOL_INFO.motto,
      "knowsAbout": ["KCSE Education", "STEM Programs", "Secondary Education", "Academic Excellence"],
      "sameAs": [
        "https://www.facebook.com/katwanyaahighschool",
        "https://twitter.com/katwanyaahigh",
        "https://www.instagram.com/katwanyaahigh",
        "https://www.youtube.com/@katwanyaahighschool"
      ]
    },
    
    // 2. LOCAL BUSINESS Schema (For Google Maps/Local Search)
    {
      "@context": "https://schema.org",
      "@type": "HighSchool",
      "@id": "https://katwanyaa.vercel.app/#school",
      "name": SCHOOL_INFO.name,
      "description": SCHOOL_INFO.description,
      "url": "https://katwanyaa.vercel.app",
      "telephone": SCHOOL_INFO.contact.phone,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": SCHOOL_INFO.address.street,
        "addressLocality": SCHOOL_INFO.address.locality,
        "addressRegion": SCHOOL_INFO.address.region,
        "addressCountry": SCHOOL_INFO.address.country
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": SCHOOL_INFO.address.coordinates.split(',')[0],
        "longitude": SCHOOL_INFO.address.coordinates.split(',')[1]
      },
      "openingHours": SCHOOL_INFO.contact.openingHours,
      "priceRange": "$$",
      "curriculum": "Kenya Certificate of Secondary Education (KCSE)",
      "sports": ["Football", "Basketball", "Athletics", "Volleyball"],
      "facilities": ["Science Laboratories", "Computer Lab", "Library", "Sports Field"],
      "awards": SCHOOL_INFO.kcsePerformance
    },
    
    // 3. WEBSITE Schema (For site search)
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://katwanyaa.vercel.app/#website",
      "url": "https://katwanyaa.vercel.app",
      "name": SCHOOL_INFO.name,
      "description": SCHOOL_INFO.description,
      "potentialAction": [{
        "@type": "SearchAction",
        "target": "https://katwanyaa.vercel.app/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }],
      "inLanguage": "en-KE"
    },
    
    // 4. BREADCRUMB Schema (For navigation)
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://katwanyaa.vercel.app"
      }, {
        "@type": "ListItem",
        "position": 2,
        "name": "About Katwanyaa High School",
        "item": "https://katwanyaa.vercel.app/pages/AboutUs"
      }, {
        "@type": "ListItem",
        "position": 3,
        "name": "Admissions 2025",
        "item": "https://katwanyaa.vercel.app/pages/admissions"
      }]
    }
  ];

  return (
    <html lang="en" prefix="og: https://ogp.me/ns#">
      <head>
        {/* CRITICAL: Character Encoding */}
        <meta charSet="UTF-8" />
        
        {/* CRITICAL: Viewport for Mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        
        {/* CRITICAL: Theme Color */}
        <meta name="theme-color" content="#ea580c" />
        
        {/* CRITICAL: Robots - TELL GOOGLE TO INDEX US */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* CRITICAL: Googlebot */}
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* CRITICAL: Bingbot */}
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* CRITICAL: Canonical URL */}
        <link rel="canonical" href="https://katwanyaa.vercel.app" />
        
        {/* CRITICAL: GEO Location Tags (Google Local Search) */}
        <meta name="geo.region" content="KE-MKA" />
        <meta name="geo.placename" content="Matungulu, Machakos County" />
        <meta name="geo.position" content={SCHOOL_INFO.address.coordinates} />
        <meta name="ICBM" content={SCHOOL_INFO.address.coordinates} />
        
        {/* CRITICAL: Language */}
        <meta name="language" content="English" />
        <meta httpEquiv="content-language" content="en-KE" />
        
        {/* CRITICAL: Author */}
        <meta name="author" content={SCHOOL_INFO.name} />
        
        {/* CRITICAL: Copyright */}
        <meta name="copyright" content={`Copyright © 1976-2024 ${SCHOOL_INFO.name}. All rights reserved.`} />
        
        {/* CRITICAL: Distribution */}
        <meta name="distribution" content="Global" />
        
        {/* CRITICAL: Rating */}
        <meta name="rating" content="General" />
        
        {/* CRITICAL: Revisit */}
        <meta name="revisit-after" content="7 days" />
        
        {/* CRITICAL: Structured Data for Google */}
        {structuredData.map((data, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
        
        {/* CRITICAL: Open Graph Tags (Facebook, WhatsApp, etc.) */}
        <meta property="og:site_name" content={SCHOOL_INFO.name} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_KE" />
        <meta property="og:country-name" content="Kenya" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${SCHOOL_INFO.name} Logo`} />
        <meta property="og:image:type" content="image/png" />
        
        {/* CRITICAL: Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@katwanyaa_high" />
        <meta name="twitter:creator" content="@katwanyaa_high" />
        <meta name="twitter:image:alt" content={`${SCHOOL_INFO.name} Logo`} />
        
        {/* CRITICAL: Facebook App ID (if you have) */}
        {/* <meta property="fb:app_id" content="your_facebook_app_id" /> */}
        
        {/* CRITICAL: Favicon */}
        <link rel="icon" href="/katz.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/katz.png" />
        
        {/* CRITICAL: Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* CRITICAL: DNS Prefetch */}
        <link rel="dns-prefetch" href="//katwanyaa.vercel.app" />
        
        {/* CRITICAL: Mobile Web App Capable */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={SCHOOL_INFO.name} />
        
        {/* CRITICAL: Format Detection */}
        <meta name="format-detection" content="telephone=no" />
        
        {/* CRITICAL: MS Tags */}
        <meta name="msapplication-TileColor" content="#ea580c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-orange-50 via-white to-amber-50 text-gray-900`}
      >
        <SessionProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </SessionProvider>
        
        {/* CRITICAL: Hidden Structured Data in Body (Extra SEO Boost) */}
        <div itemScope itemType="https://schema.org/EducationalOrganization" style={{display: 'none'}}>
          <span itemProp="name">{SCHOOL_INFO.name}</span>
          <span itemProp="alternateName">{SCHOOL_INFO.alternateName}</span>
          <span itemProp="description">{SCHOOL_INFO.description}</span>
          <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
            <span itemProp="streetAddress">{SCHOOL_INFO.address.street}</span>
            <span itemProp="addressLocality">{SCHOOL_INFO.address.locality}</span>
            <span itemProp="addressRegion">{SCHOOL_INFO.address.region}</span>
            <span itemProp="addressCountry">{SCHOOL_INFO.address.country}</span>
          </div>
          <span itemProp="telephone">{SCHOOL_INFO.contact.phone}</span>
          <span itemProp="email">{SCHOOL_INFO.contact.email}</span>
        </div>
      </body>
    </html>
  );
}