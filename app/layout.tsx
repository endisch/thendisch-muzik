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
  title: "Thendisch Acoustics",
  description: "Lüks, kalite ve kesintisiz müzik deneyimi. Canlı VIP Lounge sohbeti.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-[#0B0C10] text-gray-100 min-h-screen selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
