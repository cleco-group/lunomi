import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lunomi POS Pintar",
  description: "Sistem POS & Manajemen Bisnis Terintegrasi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.className}>
      <body className="h-screen overflow-hidden" style={{ background: '#F8FAFC', color: '#0F172A' }}>
        {children}
      </body>
    </html>
  );
}