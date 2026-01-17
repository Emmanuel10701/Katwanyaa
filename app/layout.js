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

export const metadata = {
  title: "Katwanyaa High School | AIC Katwanyaa | Education is Light in Matungulu",
  description:
    "Official website for A.I.C Katwanyaa High School, a premier public county school in Kambusu, Matungulu, Machakos County. Founded in 1976, we offer a holistic Competency-Based Education (CBE) with STEM, Social Sciences, and Arts & Sports pathways, and a dedicated technology center through our Angaza Center partnership[citation:2][citation:4].",
  icons: {
    icon: [
      { url: "/katz.png", type: "image/png", sizes: "32x32" },
      { url: "/katz.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/katz.png",
  },
  keywords: [
    "Katwanyaa High School",
    "AIC Katwanyaa",
    "High School Matungulu",
    "Machakos County Schools",
    "Katz high ",
    "STEM Education Kenya",
  ],
  authors: [{ name: "A.I.C Katwanyaa High School" }],
  openGraph: {
    title: "A.I.C Katwanyaa High School | Matungulu, Machakos",
    description: "A premier public county mixed day/boarding school in Kambusu, Matungulu, offering holistic CBE education and a technology center[citation:2][citation:4][citation:8].",
    type: "website",
    locale: "en_KE",
    siteName: "A.I.C Katwanyaa High School",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ea580c" />
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