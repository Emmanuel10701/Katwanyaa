import localFont from "next/font/local";
import "./globals.css";
import ClientLayoutWrapper from "./-app";
import { SessionProvider } from './session/sessionwrapper'; 

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
  title: "Nyaribu Secondary School | Soaring for Excellence",
  description:
    "Official website for Nyaribu Secondary School. Guided by our motto 'Soaring for Excellence,' we provide quality education, academic programs, and holistic development for our students.",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png", sizes: "32x32" },
      { url: "/logo.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <SessionProvider> {/* 👈 Wrap with custom provider */}
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}