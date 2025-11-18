"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Footer from "./components/Foooter/page"; 
import ModernNavbar from "./components/Navbar/page";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isMainDashboard = pathname === "/MainDashboard";

  return (
    <>
      {!isMainDashboard && <ModernNavbar />}

      {!isMainDashboard && (
        <header className="absolute top-0 left-0 z-50 p-6">
          <Image
            src="/logo.jpg"
            alt="Katwanyaa High School Logo"
            width={50}
            height={50}
            className="drop-shadow-lg rounded-full"
            priority
          />
        </header>
      )}

      <main className="min-h-screen">{children}</main>

      {!isMainDashboard && <Footer />}
    </>
  );
}