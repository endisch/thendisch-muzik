import "./globals.css";
import { Providers } from "./Providers";
import type { Metadata } from "next";
import { Italiana, JetBrains_Mono, Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-italiana",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thendisch Studio",
  description: "Lüks, kalite ve kesintisiz müzik deneyimi. Canlı VIP Lounge sohbeti.",
  manifest: "/manifest.json",
  themeColor: "#080808",
  appleWebApp: {
    title: "Thendisch Studio",
    statusBarStyle: "black-translucent",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${spaceGrotesk.variable} ${italiana.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-[#080808] text-gray-100 min-h-screen selection:bg-[#c8323d]/30 selection:text-[#ff777e]">
        <Providers>
          {children}
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
