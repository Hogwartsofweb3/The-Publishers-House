import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getArticles, type Article } from "@/lib/firebase";
import ArticlesClient from "./ArticlesClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Articles & Essays | The Publishers House",
  description:
    "Written teachings, apologetics, and reflections on the Christian faith and life. All articles edited and vetted by The Publishers House Editorial Unit.",
  openGraph: {
    title: "Articles & Essays | The Publishers House",
    description:
      "Written teachings, apologetics, and reflections on faith and life — edited and vetted by The Publishers House.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Articles – The Publishers House" }],
  },
};

const S = {
  Navy: "#151A54",
  Paper100: "#F4F6FB",
  White: "#FFFFFF",
  Slate500: "#747CA1",
  Slate600: "#4A62A0",
  DisplayXL: { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "clamp(36px, 5vw, 72px)", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  DisplayM: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "30px", lineHeight: "1.14em", letterSpacing: "-0.015em", textTransform: "uppercase" as const },
  ReadLede: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
  ReadBody: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "17px", lineHeight: "1.68em" },
  UIEyebrow: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
};

export default async function ArticlesPage() {
  let articles: Article[] = [];
  try {
    articles = await getArticles(100);
  } catch (e) {
    console.error("Failed to fetch articles:", e);
  }

  return (
    <div style={{ backgroundColor: S.Paper100, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section
          className="tph-hero articles-hero"
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/articles-hero.jpg')", backgroundSize: "cover", backgroundPosition: "center top", zIndex: 0 }} />
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(21,26,84,0.85)", zIndex: 1 }} />
          <div style={{ position: "relative", zIndex: 2, maxWidth: "1440px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "18px" }}>
            <h1 style={{ ...S.DisplayXL, color: "#FFFFFF", margin: 0 }}>Articles and essays</h1>
            <p style={{ ...S.ReadLede, color: "rgba(255,255,255,0.85)", maxWidth: "720px", margin: 0 }}>
              Written teachings, apologetics, and reflections on the Christian faith and life. All articles edited and vetted by The Publishers House Editorial Unit.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="tph-section" style={{ backgroundColor: S.Paper100, display: "flex", flexDirection: "column", padding: "40px 24px 96px" }}>
          {articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ ...S.UIEyebrow, color: S.Slate500, marginBottom: "16px" }}>Coming Soon</div>
              <h2 style={{ ...S.DisplayM, color: S.Navy, margin: "0 0 12px" }}>Articles Loading</h2>
              <p style={{ ...S.ReadBody, color: S.Slate600, margin: 0 }}>Articles are being published through the CMS. Check back soon.</p>
            </div>
          ) : (
            <ArticlesClient initialArticles={articles} />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
