import "./globals.css";
import { Providers } from "./Providers";

export const metadata = {
  title: "Thendisch Müzik Platformu",
  description: "7/24 Canlı, Ortak Radyo Deneyimi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
