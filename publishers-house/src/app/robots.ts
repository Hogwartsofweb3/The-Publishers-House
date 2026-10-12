import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cms/", "/portal/", "/api/"],
      },
    ],
    sitemap: "https://www.thepublishershouse.org/sitemap.xml",
    host: "https://www.thepublishershouse.org",
  };
}
