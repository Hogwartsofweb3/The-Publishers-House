import { Poppins, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const soulmaze = localFont({
  src: [
    {
      path: "../../public/fonts/made-soulmaze.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/made-soulmaze-italic.otf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-soulmaze",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
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
  metadataBase: new URL("https://thepublishershouse.org"),
  title: {
    default: "The Publishers House | Company of the Great",
    template: "%s | The Publishers House",
  },
  description:
    "The Publishers House — Company of the Great. An apostolic and scriptural ministry in Jos, raising believers whose lives become living publications of Christ.",
  keywords: ["The Publishers House", "Company of the Great", "church", "worship", "sermons", "community", "faith", "Dr. Joshua Agunbiade", "Jos"],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://thepublishershouse.org",
    siteName: "The Publishers House",
    title: "The Publishers House | Company of the Great",
    description:
      "Company of the Great — an apostolic and scriptural ministry in Jos, raising believers whose lives become living publications of Christ.",
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
      "Company of the Great — an apostolic and scriptural ministry in Jos, raising believers whose lives become living publications of Christ.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import Providers from "@/components/Providers";

import type { Metadata } from "next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable} ${soulmaze.variable}`}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
