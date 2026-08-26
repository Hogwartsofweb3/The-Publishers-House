import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Firebase Storage
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        // YouTube thumbnails (for sermon cards)
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default nextConfig;
