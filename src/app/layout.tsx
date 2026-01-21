import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bus Display - Horaires en temps réel",
  description: "Application d'affichage des horaires de bus en temps réel pour les arrêts suisses. Données fournies par transport.opendata.ch.",
  keywords: ["bus", "horaires", "transport", "suisse", "temps réel", "CFF", "TPG", "TL"],
  authors: [{ name: "Bus Display" }],

  // PWA Manifest
  manifest: "/manifest.json",

  // Apple Touch Icons
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bus Display",
  },

  // Icons
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152" },
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
  },

  // Open Graph
  openGraph: {
    title: "Bus Display",
    description: "Horaires de bus en temps réel",
    type: "website",
    siteName: "Bus Display",
  },

  // Autres métadonnées
  applicationName: "Bus Display",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Bus Display" />

        {/* Splash screens for iOS */}
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-900 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
