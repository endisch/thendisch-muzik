import "./globals.css";
import { Providers } from "./Providers";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thendisch Müzik — Ortak Ritmi Hisset",
  description: "Dinleyicilerin yönettiği 7/24 canlı ortak radyo deneyimi. Şarkını yükle, oylamaya katıl, radyoyu sen yönet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-black text-gray-100 min-h-screen selection:bg-emerald-500/30">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
