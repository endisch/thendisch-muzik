import "./globals.css";
import { Providers } from "./Providers";
import type { Metadata, Viewport } from "next";
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
  description: "Thendisch Studio: müzik, medya ve dijital projelere tek bir yerden ulaş.",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Thendisch Studio",
    statusBarStyle: "black-translucent",
  }
};

export const viewport: Viewport = {
  themeColor: "#090b0e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${spaceGrotesk.variable} ${italiana.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-[#090b0e] text-gray-100 min-h-screen selection:bg-[#ff543b]/30 selection:text-white">
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
