import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getArticles, type Article } from "@/lib/firebase";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Articles | The Publishers House",
  description: "Written teachings, apologetics, and reflections from The Publishers House.",
};

// Shared style constants
const S = {
  Navy: "#151A54",
  Slate600: "#4A62A0",
  Blue500: "#2090FF",
  Blue700: "#0140C1",
  Blue300: "#6496EF",
  Paper100: "#F4F6FB",
  Paper200: "#E8ECF7",
  Paper300: "#D3DAEC",
  Paper400: "#C0C9E0",
  Slate500: "#747CA1",
  Slate400: "#99AFC6",
  White: "#FFFFFF",
  DisplayXL: { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "72px", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  DisplayM: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "30px", lineHeight: "1.14em", letterSpacing: "-0.015em", textTransform: "uppercase" as const },
  DisplayS: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "21px", lineHeight: "1.2em", letterSpacing: "-0.01em" },
  ReadLede: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
  ReadBody: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "17px", lineHeight: "1.68em" },
  ReadSmall: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
  UIEyebrow: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  UILabel: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  UIScripture: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  UIColophon: { fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  Button: { height: "48px", padding: "0 26px", borderRadius: "2px", display: "inline-flex", alignItems: "center", justifyContent: "center" },
};

function ArticleCard({ article }: { article: Article }) {
  const dateLabel = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase()
    : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {article.categories?.[0] && (
        <div style={{ ...S.UIEyebrow, color: S.Blue500 }}>{article.categories[0]}</div>
      )}
      <h3 style={{ ...S.DisplayS, color: S.Navy, margin: 0 }}>{article.title}</h3>
      <p style={{ ...S.ReadSmall, color: S.Slate600, margin: 0 }}>{article.excerpt}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" }}>
        <span style={{ ...S.UIColophon, color: S.Navy }}>{article.author}</span>
        {dateLabel && (
          <>
            <span style={{ ...S.UIColophon, color: S.Paper400 }}>·</span>
            <span style={{ ...S.UIColophon, color: S.Slate500 }}>{dateLabel}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default async function ArticlesPage() {
  let articles: Article[] = [];
  try {
    articles = await getArticles(24);
  } catch (e) {
    console.error("Failed to fetch articles:", e);
  }

  return (
    <div style={{ backgroundColor: S.Paper100, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section style={{ padding: "88px 100px", backgroundColor: S.Paper200, display: "flex", flexDirection: "column", gap: "16px" }}>

          <h1 style={{ ...S.DisplayXL, color: S.Navy }}>Articles and essays</h1>
          <p style={{ ...S.ReadLede, color: S.Slate600, maxWidth: "720px" }}>
            Written teachings, apologetics, and reflections on the Christian faith and life.
          </p>
        </section>

        {/* Content */}
        <section style={{ padding: "72px 100px 96px", backgroundColor: S.White, display: "flex", flexDirection: "column", gap: "48px" }}>

          {articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ ...S.UIEyebrow, color: S.Slate500, marginBottom: "16px" }}>Coming Soon</div>
              <h2 style={{ ...S.DisplayM, color: S.Navy, margin: "0 0 12px" }}>Articles Loading</h2>
              <p style={{ ...S.ReadBody, color: S.Slate600, margin: 0 }}>Articles are being published through the CMS. Check back soon.</p>
            </div>
          ) : (
            <>
              {/* Top Bar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", gap: "32px", borderBottom: `1px solid ${S.Paper300}` }}>
                  <div style={{ ...S.UILabel, color: S.Navy, paddingBottom: "12px", borderBottom: `2px solid ${S.Navy}` }}>All ({articles.length})</div>
                  {["Theology", "Apologetics", "Christian Living"].map(cat => (
                    <div key={cat} style={{ ...S.UILabel, color: S.Slate500, paddingBottom: "12px" }}>{cat}</div>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "64px 32px" }}>
                {articles.map(article => (
                  <Link key={article.id} href={`/articles/${article.slug}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
                    <ArticleCard article={article} />
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

