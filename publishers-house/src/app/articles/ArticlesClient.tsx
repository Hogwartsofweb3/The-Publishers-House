"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/firebase";
import { getAuthorAvatar } from "@/lib/authorAvatars";

const Navy = "#151A54";
const Blue500 = "#2090FF";
const Blue700 = "#0140C1";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const Paper100 = "#F4F6FB";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const White = "#FFFFFF";

const T = {
  eyebrow: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  label: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  button: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  readBody: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "15px", lineHeight: "1.6em" },
};

function DesiringGodArticleCard({ article }: { article: Article }) {
  const dateLabel = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()
    : "";

  const avatar = getAuthorAvatar(article.author || "");
  const hasAudio = Boolean(article.audioUrl || true); // Audio stream is supported for all articles

  return (
    <article
      style={{
        backgroundColor: White,
        borderRadius: "8px",
        border: `1px solid ${Paper200}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxShadow: "0 2px 8px rgba(21, 26, 84, 0.04)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(21, 26, 84, 0.09)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(21, 26, 84, 0.04)";
      }}
    >
      {/* ── CARD THUMBNAIL (Matching DesiringGod.org) ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 10",
          backgroundColor: Navy,
          overflow: "hidden",
        }}
      >
        {article.coverImageUrl ? (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.3s ease",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: Navy,
              color: "rgba(255,255,255,0.4)",
              fontFamily: "var(--font-poppins)",
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            The Publishers House
          </div>
        )}

        {/* Top-left Pill Badge (with speaker icon if audio enabled) */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "rgba(11, 14, 20, 0.85)",
            backdropFilter: "blur(4px)",
            color: White,
            padding: "4px 8px",
            borderRadius: "3px",
            fontFamily: "var(--font-poppins)",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          {hasAudio && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07l-1.41-1.41a3 3 0 0 0 0-4.24l1.41-1.42z" />
            </svg>
          )}
          <span>Article</span>
        </div>
      </div>

      {/* ── CARD CONTENT ── */}
      <div
        style={{
          padding: "20px 20px 18px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 700,
            fontSize: "17px",
            lineHeight: "1.3em",
            color: Navy,
            margin: "0 0 8px 0",
            letterSpacing: "-0.01em",
          }}
        >
          {article.title}
        </h3>

        {/* Date */}
        {dateLabel && (
          <div
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: Slate500,
              marginBottom: "10px",
            }}
          >
            {dateLabel}
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <p
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "13.5px",
              lineHeight: "1.55em",
              color: Slate600,
              margin: "0 0 16px 0",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.excerpt}
          </p>
        )}

        {/* ── AUTHOR FOOTER AT BOTTOM ── */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            paddingTop: "12px",
            borderTop: `1px solid ${Paper200}`,
          }}
        >
          {avatar.type === "image" ? (
            <img
              src={avatar.src}
              alt={article.author}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #151A54, #2090FF)",
                color: White,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {avatar.initials}
            </div>
          )}

          <span
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "12px",
              color: Navy,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {article.author}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function ArticlesClient({ initialArticles }: { initialArticles: Article[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [authorFilter, setAuthorFilter] = useState("All");

  // Extract unique filter options
  const uniqueCategories = Array.from(
    new Set(initialArticles.flatMap((a) => a.categories || []))
  ).filter((c) => c && c !== "Uncategorized");

  const uniqueAuthors = Array.from(
    new Set(initialArticles.map((a) => a.author))
  ).filter(Boolean);

  const uniqueYears = Array.from(
    new Set(
      initialArticles
        .map((a) => (a.publishedAt ? new Date(a.publishedAt).getFullYear().toString() : null))
        .filter(Boolean)
    )
  ).sort((a, b) => (b! > a! ? 1 : -1));

  // Filter logic
  const filtered = initialArticles.filter((article) => {
    // Search
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = article.title.toLowerCase().includes(q);
      const matchExcerpt = (article.excerpt || "").toLowerCase().includes(q);
      const matchAuthor = (article.author || "").toLowerCase().includes(q);
      const matchBody = (article.body || "").toLowerCase().includes(q);
      if (!matchTitle && !matchExcerpt && !matchAuthor && !matchBody) return false;
    }

    // Category
    if (categoryFilter !== "All") {
      if (!article.categories?.includes(categoryFilter)) return false;
    }

    // Year
    if (yearFilter !== "All") {
      const yr = article.publishedAt ? new Date(article.publishedAt).getFullYear().toString() : "";
      if (yr !== yearFilter) return false;
    }

    // Author
    if (authorFilter !== "All") {
      if (article.author !== authorFilter) return false;
    }

    return true;
  });

  // Sort logic
  filtered.sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
    }
    if (sort === "oldest") {
      return new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime();
    }
    if (sort === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const clearAllFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setYearFilter("All");
    setAuthorFilter("All");
  };

  return (
    <div style={{ maxWidth: "1380px", margin: "0 auto", width: "100%", display: "flex", gap: "40px", alignItems: "flex-start" }}>
      {/* ── SIDEBAR FILTERS (Matching Screenshot 2 Sermons Layout) ── */}
      <aside
        style={{
          flex: "0 0 260px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          position: "sticky",
          top: "100px",
        }}
      >
        {/* Search */}
        <div>
          <h3 style={{ ...T.label, color: Navy, marginBottom: "16px", borderBottom: `1px solid ${Paper300}`, paddingBottom: "8px" }}>
            Search
          </h3>
          <input
            type="text"
            placeholder="Search library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${Paper300}`,
              borderRadius: "4px",
              fontFamily: "var(--font-poppins)",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Year */}
        <div>
          <h3 style={{ ...T.label, color: Navy, marginBottom: "16px", borderBottom: `1px solid ${Paper300}`, paddingBottom: "8px" }}>
            Year
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer" }}>
              <input type="radio" name="year" checked={yearFilter === "All"} onChange={() => setYearFilter("All")} />
              All
            </label>
            {uniqueYears.map((yr) => (
              <label key={yr} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer" }}>
                <input type="radio" name="year" checked={yearFilter === yr} onChange={() => setYearFilter(yr!)} />
                {yr}
              </label>
            ))}
          </div>
        </div>

        {/* Author */}
        <div>
          <h3 style={{ ...T.label, color: Navy, marginBottom: "16px", borderBottom: `1px solid ${Paper300}`, paddingBottom: "8px" }}>
            Author
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer" }}>
              <input type="radio" name="author" checked={authorFilter === "All"} onChange={() => setAuthorFilter("All")} />
              All Authors
            </label>
            {uniqueAuthors.map((au) => (
              <label key={au} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer" }}>
                <input type="radio" name="author" checked={authorFilter === au} onChange={() => setAuthorFilter(au!)} />
                {au}
              </label>
            ))}
          </div>
        </div>

        {/* Topic / Category */}
        <div>
          <h3 style={{ ...T.label, color: Navy, marginBottom: "16px", borderBottom: `1px solid ${Paper300}`, paddingBottom: "8px" }}>
            Topic / Category
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer" }}>
              <input type="radio" name="category" checked={categoryFilter === "All"} onChange={() => setCategoryFilter("All")} />
              All Topics
            </label>
            {uniqueCategories.map((cat) => (
              <label key={cat} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer" }}>
                <input type="radio" name="category" checked={categoryFilter === cat} onChange={() => setCategoryFilter(cat)} />
                {cat}
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* ── MAIN RESULTS AREA ── */}
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        {/* Top Bar: Results Count & Sort Dropdown */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: `1px solid ${Paper300}`,
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ ...T.eyebrow, color: Slate500 }}>
            Showing {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ ...T.label, color: Navy }}>Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: "6px 12px",
                border: `1px solid ${Paper300}`,
                borderRadius: "4px",
                fontFamily: "var(--font-poppins)",
                fontSize: "12px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📖</div>
            <h2 style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "20px", color: Navy, margin: "0 0 8px" }}>
              No articles found
            </h2>
            <p style={{ ...T.readBody, color: Slate600, margin: "0 0 16px 0" }}>
              Try adjusting your search keywords or active filters.
            </p>
            <button
              onClick={clearAllFilters}
              style={{
                ...T.button,
                padding: "10px 20px",
                backgroundColor: Blue700,
                color: White,
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="tph-grid-3" style={{ marginBottom: "64px" }}>
            {filtered.map((article) => (
              <Link
                key={article.id || article.slug}
                href={`/articles/${article.slug}`}
                style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}
              >
                <DesiringGodArticleCard article={article} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
