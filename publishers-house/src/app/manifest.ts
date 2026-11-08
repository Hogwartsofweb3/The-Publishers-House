import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Publishers House",
    short_name: "TPH Portal",
    description: "The Publishers House official portal for members, rosters, check-in, events, and pastoral care.",
    start_url: "/portal",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0E1556",
    theme_color: "#151A54",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
