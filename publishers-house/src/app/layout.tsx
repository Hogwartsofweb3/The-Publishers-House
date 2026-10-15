import type { Metadata } from "next";
import { Poppins, Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

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
};

import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${montserrat.variable} ${playfair.variable}`}>
      <head>
        {/* Preconnect to Google Fonts and Firebase CDN to reduce DNS lookup latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
