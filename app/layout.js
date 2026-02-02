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
  description: "Katwanyaa High School (Katz) is a  public county school in Matungulu, Machakos County offering quality KCSE education with STEM programs, modern facilities, and comprehensive extracurricular activities.",
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
  metadataBase: new URL('https://katwanyaa.vercel.app'), 
  
  title: {
    default: "Katwanyaa High School | Matungulu",
    template: "%s | Katwanyaa High School"
  },
  description: "Official website for Katwanyaa High School in Matungulu, Machakos County. A premier public school committed to academic excellence and holistic development.",
  
  keywords: [
    "Katwanyaa High School",
    "Matungulu school",
    "Machakos County school",
    "Best high school in Machakos",
    "Katwanyaa Matungulu",
    "Public high school Kenya",
    "KCSE performance Machakos"
  ],
  
  authors: [{ name: "Katwanyaa High School" }],
  
  // Canonical URL ensures Google knows this is the "real" version of the site
  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: "Katwanyaa High School | Matungulu, Machakos",
    description: "Building future leaders through excellence and faith.",
    url: 'https://katwanyaa.vercel.app',
    siteName: "Katwanyaa High School",
    locale: "en_KE",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Katwanyaa High School",
    description: "Premier public education in Matungulu, Machakos County.",
  },

  // Search Engine Bot instructions
  robots: {
    index: true,
    follow: true,
  },
  
  icons: {
    icon: "/ll.png",
    apple: "/ll.png",
  },
  verification: {
    google: "googlef8123d1ff1ecb88f", // Paste ONLY the code here
  },
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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