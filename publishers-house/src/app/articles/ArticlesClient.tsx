"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/firebase";

const S = {
  Navy: "#151A54",
  Slate600: "#4A62A0",
  Blue500: "#2090FF",
  Blue700: "#0140C1",
  Paper200: "#E8ECF7",
  Paper300: "#D3DAEC",
  Paper400: "#C0C9E0",
  Slate500: "#747CA1",
  White: "#FFFFFF",
  DisplayS: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "21px", lineHeight: "1.2em", letterSpacing: "-0.01em" },
  ReadSmall: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
  UIEyebrow: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  UILabel: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  UIColophon: { fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
};

function ArticleCard({ article }: { article: Article }) {
  const dateLabel = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase()
    : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%" }}>
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

export default function ArticlesClient({ initialArticles }: { initialArticles: Article[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Extract unique categories from articles
  const categories = ["All"];
  initialArticles.forEach(article => {
    if (article.categories && article.categories.length > 0) {
      article.categories.forEach(cat => {
        if (!categories.includes(cat)) {
          categories.push(cat);
        }
      });
    }
  });

  const filteredArticles = activeCategory === "All" 
    ? initialArticles 
    : initialArticles.filter(article => article.categories?.includes(activeCategory));

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "48px" }}>
        <div style={{ display: "flex", gap: "32px", borderBottom: `1px solid ${S.Paper300}`, overflowX: "auto" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                ...S.UILabel,
                background: "none",
                border: "none",
                padding: "0 0 12px 0",
                color: activeCategory === cat ? S.Navy : S.Slate500,
                borderBottom: activeCategory === cat ? `2px solid ${S.Navy}` : `2px solid transparent`,
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {cat === "All" ? `All (${initialArticles.length})` : cat}
            </button>
          ))}
        </div>
      </div>
      
      {filteredArticles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ ...S.ReadSmall, color: S.Slate500 }}>No articles found for this category.</p>
        </div>
      ) : (
        <div className="tph-grid-3">
          {filteredArticles.map(article => (
            <Link key={article.id} href={`/articles/${article.slug}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
              <ArticleCard article={article} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
