import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Lunomi POS Pintar",
  description: "Sistem POS & Manajemen Bisnis Terintegrasi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.className} ${jetbrainsMono.variable}`}>
      <body className="h-screen overflow-hidden" style={{ background: '#F8FAFC', color: '#0F172A' }}>
        {children}
      </body>
    </html>
  );
}