import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thepublishershouse.org"),
  title: {
    default: "The Publishers House | Company of the Great",
    template: "%s | The Publishers House",
  },
  description:
    "The Publishers House — an apostolic ministry in Jos raising believers whose lives become living publications of Christ. Led by Dr. Joshua Agunbiade.",
  keywords: ["The Publishers House", "Company of the Great", "church", "worship", "sermons", "community", "faith", "Dr. Joshua Agunbiade", "Jos"],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://thepublishershouse.org",
    siteName: "The Publishers House",
    title: "The Publishers House | Company of the Great",
    description:
      "Company of the Great — an apostolic ministry in Jos, raising believers whose lives become living publications of Christ.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Publishers House — Company of the Great",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Publishers House | Company of the Great",
    description:
      "Company of the Great — an apostolic ministry in Jos, raising believers whose lives become living publications of Christ.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icon-48x48.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {/* Preload critical LCP Hero image for instant discovery by browser HTML parser */}
        <link rel="preload" as="image" href="/images/hero-v2.webp" type="image/webp" fetchPriority="high" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        {/* Google Fonts direct load - delivers full Poppins, Montserrat & Playfair Display typography suite */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
