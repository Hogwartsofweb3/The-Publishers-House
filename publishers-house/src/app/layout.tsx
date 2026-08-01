import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://thepublishershouse.org"),
  title: {
    default: "The Publishers House | A Church Family",
    template: "%s | The Publishers House",
  },
  description:
    "The Publishers House is a vibrant, Spirit-filled church community. Join us for worship, growth, and community.",
  keywords: ["The Publishers House", "church", "worship", "sermons", "community", "faith"],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://thepublishershouse.org",
    siteName: "The Publishers House",
    title: "The Publishers House | A Church Family",
    description:
      "The Publishers House is a vibrant, Spirit-filled church community. Join us for worship, growth, and community.",
    images: [
      {
        url: "/og-image.jpg", // replace with actual OG image once AVO delivers assets
        width: 1200,
        height: 630,
        alt: "The Publishers House Church",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Publishers House | A Church Family",
    description:
      "A vibrant, Spirit-filled church community.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
