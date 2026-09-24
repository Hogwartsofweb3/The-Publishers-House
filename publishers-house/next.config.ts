import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
