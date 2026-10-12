import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  serverExternalPackages: ["firebase-admin"],
  async redirects() {
    return [
      // Redirect bare domain → www so Google always indexes www version
      {
        source: "/:path*",
        has: [{ type: "host", value: "thepublishershouse.org" }],
        destination: "https://www.thepublishershouse.org/:path*",
        permanent: true,
      },
    ];
  },
  experimental: {
    optimizeCss: true,
  },
  turbopack: {
    resolveAlias: {
      "@farcaster/mini-app-solana": "./src/lib/empty.js",
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@farcaster/mini-app-solana": false,
    };
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
