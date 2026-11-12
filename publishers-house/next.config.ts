import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  // Externalize all firebase-admin subpath packages so they never get
  // bundled into the client/edge bundle (prevents "Can't resolve 'tls'" etc.)
  serverExternalPackages: [
    "firebase-admin",
    "firebase-admin/app",
    "firebase-admin/auth",
    "firebase-admin/firestore",
    "firebase-admin/storage",
    "@google-cloud/firestore",
    "@google-cloud/storage",
    "google-auth-library",
    "googleapis-common",
    "gaxios",
    "https-proxy-agent",
    "agent-base",
    "web-push",
  ],
  async redirects() {
    return [
      // Redirect bare domain → www so Google always indexes www version
      {
        source: "/:path*",
        has: [{ type: "host", value: "thepublishershouse.org" }],
        destination: "https://www.thepublishershouse.org/:path*",
        permanent: true,
      },
      // Redirect /events to /schedule for backward compatibility & SEO
      {
        source: "/events",
        destination: "/schedule",
        permanent: true,
      },
      {
        source: "/events/:id",
        destination: "/schedule/:id",
        permanent: true,
      },
    ];
  },
  experimental: {
    // Tree-shake heavy firebase & resend sub-packages — avoids full barrel import
    optimizePackageImports: [
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
      "firebase/storage",
      "firebase/analytics",
      "resend",
    ],
  },
  async headers() {
    return [
      {
        // Security + HSTS headers for all portal routes
        source: "/portal/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com https://www.youtube.com https://s.ytimg.com",
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebasestorage.googleapis.com https://*.youtube.com https://*.googlevideo.com",
              "img-src 'self' data: https://*.googleapis.com https://*.googleusercontent.com https://img.youtube.com https://i.ytimg.com https://i.postimg.cc https://i.scdn.co https://*.spotifycdn.com blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "media-src 'self' https://*.googleapis.com https://*.firebasestorage.googleapis.com blob: data:",
              "frame-src 'self' https://*.firebaseapp.com https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com https://open.spotify.com",
            ].join("; "),
          },
          {
            // allow-popups required for Firebase Google Sign-In popup flow
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      {
        // No caching for portal API routes — always fresh data
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      "@farcaster/mini-app-solana": "./src/lib/empty.js",
      "@solana-program/system": "./src/lib/empty.js",
      "@solana-program/token": "./src/lib/empty.js",
      "@solana-program/memo": "./src/lib/empty.js",
      "@solana/kit": "./src/lib/empty.js",
      "@solana/web3.js": "./src/lib/empty.js",
    },
  },
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@farcaster/mini-app-solana": false,
      "@solana-program/system": false,
      "@solana-program/token": false,
      "@solana-program/memo": false,
      "@solana/kit": false,
      "@solana/web3.js": false,
      // web-push is a real installed server package — do NOT alias to false
      // It is listed in serverExternalPackages so webpack never tries to bundle it client-side
    };
    // On the client bundle, stub out Node.js built-ins that firebase-admin
    // and its deps (gaxios, https-proxy-agent) try to require.
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        tls: false,
        net: false,
        fs: false,
        dns: false,
        child_process: false,
        http2: false,
      };
    }

    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [420, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      // Postimg (free image host)
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "postimg.cc" },
      // Imgur
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "imgur.com" },
      // Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com" },
      // WordPress / general CDN
      { protocol: "https", hostname: "**.wordpress.com" },
      { protocol: "https", hostname: "**.wp.com" },
      // Any https image (broad fallback for CMS flexibility)
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
