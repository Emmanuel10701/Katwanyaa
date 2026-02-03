import localFont from "next/font/local";
import "./globals.css";
import ClientLayoutWrapper from "./-app";
import { SessionProvider } from "./session/sessiowrapper";

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

/* ✅ Viewport */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ea580c",
};

/* ✅ Metadata */
export const metadata = {
  metadataBase: new URL("https://katwanyaa.vercel.app"),

  title: {
    default: "Katwanyaa High School | Matungulu",
    template: "%s | Katwanyaa High School",
  },

  description:
    "Official website for Katwanyaa High School in Matungulu, Machakos County. A premier public school committed to academic excellence and holistic development.",

  keywords: [
    "Katwanyaa High School",
    "Matungulu school",
    "Machakos County school",
    "Best high school in Machakos",
    "Public high school Kenya",
    "KCSE performance Machakos",
  ],

  authors: [{ name: "Katwanyaa High School" }],

  alternates: {
    canonical: "/",
  },

  /* ✅ Open Graph (WhatsApp / Facebook) */
  openGraph: {
    title: "Katwanyaa High School | Matungulu, Machakos",
    description: "Building future leaders through excellence and faith.",
    url: "https://katwanyaa.vercel.app",
    siteName: "Katwanyaa High School",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "/katz.png", // 🔑 relative path + metadataBase = safest
        width: 1200,
        height: 630,
        alt: "Katwanyaa High School",
      },
    ],
  },

  /* ✅ Twitter */
  twitter: {
    card: "summary_large_image",
    title: "Katwanyaa High School",
    description: "Premier public education in Matungulu, Machakos County.",
    images: ["/katz.png"],
  },

  /* ✅ Robots */
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

  /* ✅ Icons (fallback image for WhatsApp) */
  icons: {
    icon: "/katz.png",
    apple: "/katz.png",
  },

  verification: {
    google: "googlef8123d1ff1ecb88f",
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
