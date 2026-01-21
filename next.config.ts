import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // Mode standalone pour Docker
  output: "standalone",

  // Désactive le header "X-Powered-By"
  poweredByHeader: false,

  // Compression
  compress: true,

  // Configuration Turbopack vide pour éviter le conflit avec PWA/webpack
  turbopack: {},

  // Configuration des images
  images: {
    // Domaines autorisés pour les images externes
    remotePatterns: [],
    // Formats modernes
    formats: ["image/avif", "image/webp"],
  },

  // Headers de sécurité
  async headers() {
    // CORS: Origines autorisées
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || [];
    const corsHeaders = allowedOrigins.length > 0 ? [
      {
        key: "Access-Control-Allow-Origin",
        value: allowedOrigins.join(','),
      },
      {
        key: "Access-Control-Allow-Methods",
        value: "GET, POST, PUT, DELETE, OPTIONS",
      },
      {
        key: "Access-Control-Allow-Headers",
        value: "Content-Type, Authorization, X-API-Key",
      },
      {
        key: "Access-Control-Max-Age",
        value: "86400",
      },
    ] : [];

    return [
      {
        source: "/api/:path*",
        headers: [
          ...corsHeaders,
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // Cache long pour les assets statiques
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Redirections
  async redirects() {
    return [];
  },

  // Configuration expérimentale
  experimental: {
    // Optimisation du bundle
    optimizePackageImports: ["@/components", "@/hooks", "@/lib"],
  },
};

// Configuration PWA
const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      // Cache API stationboard
      urlPattern: /^https?:\/\/.*\/api\/stationboard/,
      handler: "NetworkFirst",
      options: {
        cacheName: "stationboard-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60, // 1 minute
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      // Cache API locations (plus long)
      urlPattern: /^https?:\/\/.*\/api\/locations/,
      handler: "CacheFirst",
      options: {
        cacheName: "locations-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 3600, // 1 heure
        },
      },
    },
    {
      // Cache API available-lines et directions
      urlPattern: /^https?:\/\/.*\/api\/(available-lines|directions)/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "lines-directions-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 43200, // 12 heures
        },
      },
    },
    {
      // Cache des assets statiques
      urlPattern: /^https?:\/\/.*\/_next\/static\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 86400 * 30, // 30 jours
        },
      },
    },
    {
      // Cache des images
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400 * 30, // 30 jours
        },
      },
    },
    {
      // Cache des fonts
      urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "fonts-cache",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 86400 * 365, // 1 an
        },
      },
    },
  ],
});

export default withPWAConfig(nextConfig);
