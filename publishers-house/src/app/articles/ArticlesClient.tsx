"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Article } from "@/lib/firebase";
import { getAuthorAvatar } from "@/lib/authorAvatars";

const Navy    = "#151A54";
const Blue500  = "#2090FF";
const Blue700  = "#0140C1";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const Paper100 = "#F4F6FB";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const White   = "#FFFFFF";

const T = {
  eyebrow: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  label:   { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  button:  { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "12px", lineHeight: "1em",   letterSpacing: "0.14em", textTransform: "uppercase" as const },
  readBody:{ fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "15px", lineHeight: "1.6em" },
};

/* ─── Article Card ─── */
function DesiringGodArticleCard({ article }: { article: Article }) {
  const dateLabel = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()
    : "";
  const avatar = getAuthorAvatar(article.author || "");

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
        boxShadow: "0 2px 8px rgba(21,26,84,0.04)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(21,26,84,0.09)"; }}
      onMouseOut={e  => { e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = "0 2px 8px rgba(21,26,84,0.04)"; }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 10", backgroundColor: Navy, overflow: "hidden" }}>
        {article.coverImageUrl ? (
          <img src={article.coverImageUrl} alt={article.title} loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s ease" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: Navy, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-poppins)", fontSize: "12px",
            letterSpacing: "0.1em", textTransform: "uppercase" }}>
            The Publishers House
          </div>
        )}
        {/* Badge */}
        <div style={{
          position: "absolute", top: "10px", left: "10px",
          backgroundColor: "rgba(11,14,20,0.85)", backdropFilter: "blur(4px)",
          color: White, padding: "4px 8px", borderRadius: "3px",
          fontFamily: "var(--font-poppins)", fontSize: "9px", fontWeight: 700,
          letterSpacing: "0.14em", textTransform: "uppercase",
          display: "inline-flex", alignItems: "center", gap: "5px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07l-1.41-1.41a3 3 0 0 0 0-4.24l1.41-1.42z" />
          </svg>
          <span>Article</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 20px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "17px", lineHeight: "1.3em",
          color: Navy, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
          {article.title}
        </h3>
        {dateLabel && (
          <div style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: Slate500, marginBottom: "10px" }}>
            {dateLabel}
          </div>
        )}
        {article.excerpt && (
          <p style={{ fontFamily: "var(--font-playfair)", fontSize: "13.5px", lineHeight: "1.55em",
            color: Slate600, margin: "0 0 16px", display: "-webkit-box",
            WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {article.excerpt}
          </p>
        )}
        {/* Author row */}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "10px",
          paddingTop: "12px", borderTop: `1px solid ${Paper200}` }}>
          {avatar.type === "image" ? (
            <img src={avatar.src} alt={article.author}
              style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: "28px", height: "28px", borderRadius: "50%",
              background: "linear-gradient(135deg,#151A54,#2090FF)", color: White,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>
              {avatar.initials}
            </div>
          )}
          <span style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "12px", color: Navy,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {article.author}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ─── Filter panel (shared by sidebar and mobile drawer) ─── */
function FilterPanel({
  search, setSearch,
  yearFilter, setYearFilter, uniqueYears,
  authorFilter, setAuthorFilter, uniqueAuthors,
  categoryFilter, setCategoryFilter, uniqueCategories,
  onClose,
}: {
  search: string; setSearch: (v: string) => void;
  yearFilter: string; setYearFilter: (v: string) => void; uniqueYears: (string | null)[];
  authorFilter: string; setAuthorFilter: (v: string) => void; uniqueAuthors: (string | undefined)[];
  categoryFilter: string; setCategoryFilter: (v: string) => void; uniqueCategories: string[];
  onClose?: () => void;
}) {
  const labelStyle = { ...T.label, color: Navy, marginBottom: "16px", borderBottom: `1px solid ${Paper300}`, paddingBottom: "8px", display: "block" } as React.CSSProperties;
  const radioRow  = { display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer" } as React.CSSProperties;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Search */}
      <div>
        <label style={labelStyle}>Search</label>
        <input type="text" placeholder="Search library..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", border: `1px solid ${Paper300}`, borderRadius: "4px",
            fontFamily: "var(--font-poppins)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
      </div>
      {/* Year */}
      <div>
        <label style={labelStyle}>Year</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={radioRow}><input type="radio" name="year" checked={yearFilter === "All"} onChange={() => setYearFilter("All")} /> All</label>
          {uniqueYears.map(yr => (
            <label key={yr} style={radioRow}><input type="radio" name="year" checked={yearFilter === yr} onChange={() => setYearFilter(yr!)} /> {yr}</label>
          ))}
        </div>
      </div>
      {/* Author */}
      <div>
        <label style={labelStyle}>Author</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={radioRow}><input type="radio" name="author" checked={authorFilter === "All"} onChange={() => setAuthorFilter("All")} /> All Authors</label>
          {uniqueAuthors.map(au => (
            <label key={au} style={radioRow}><input type="radio" name="author" checked={authorFilter === au} onChange={() => setAuthorFilter(au!)} /> {au}</label>
          ))}
        </div>
      </div>
      {/* Category */}
      <div>
        <label style={labelStyle}>Topic / Category</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={radioRow}><input type="radio" name="category" checked={categoryFilter === "All"} onChange={() => setCategoryFilter("All")} /> All Topics</label>
          {uniqueCategories.map(cat => (
            <label key={cat} style={radioRow}><input type="radio" name="category" checked={categoryFilter === cat} onChange={() => setCategoryFilter(cat)} /> {cat}</label>
          ))}
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} style={{ ...T.button, padding: "12px 24px",
          backgroundColor: Blue700, color: White, border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "8px" }}>
          View Results
        </button>
      )}
    </div>
  );
}

/* ─── Main component ─── */
export default function ArticlesClient({ initialArticles }: { initialArticles: Article[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [authorFilter, setAuthorFilter] = useState("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const uniqueCategories = Array.from(new Set(initialArticles.flatMap(a => a.categories || []))).filter(c => c && c !== "Uncategorized");
  const uniqueAuthors    = Array.from(new Set(initialArticles.map(a => a.author))).filter(Boolean);
  const uniqueYears      = Array.from(new Set(initialArticles.map(a => a.publishedAt ? new Date(a.publishedAt).getFullYear().toString() : null).filter(Boolean))).sort((a, b) => (b! > a! ? 1 : -1));

  const filtered = initialArticles.filter(article => {
    if (search) {
      const q = search.toLowerCase();
      if (!article.title.toLowerCase().includes(q) &&
          !(article.excerpt || "").toLowerCase().includes(q) &&
          !(article.author  || "").toLowerCase().includes(q) &&
          !(article.body    || "").toLowerCase().includes(q)) return false;
    }
    if (categoryFilter !== "All" && !article.categories?.includes(categoryFilter)) return false;
    if (yearFilter !== "All") {
      const yr = article.publishedAt ? new Date(article.publishedAt).getFullYear().toString() : "";
      if (yr !== yearFilter) return false;
    }
    if (authorFilter !== "All" && article.author !== authorFilter) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sort === "newest") return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
    if (sort === "oldest") return new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime();
    if (sort === "title")  return a.title.localeCompare(b.title);
    return 0;
  });

  const clearAll = () => { setSearch(""); setCategoryFilter("All"); setYearFilter("All"); setAuthorFilter("All"); };

  const activeFilterCount = [
    search !== "",
    categoryFilter !== "All",
    yearFilter !== "All",
    authorFilter !== "All",
  ].filter(Boolean).length;

  const filterPanelProps = { search, setSearch, yearFilter, setYearFilter, uniqueYears, authorFilter, setAuthorFilter, uniqueAuthors, categoryFilter, setCategoryFilter, uniqueCategories };

  return (
    <div style={{ maxWidth: "1380px", margin: "0 auto", width: "100%" }}>

      {/* ══════════ MOBILE FILTER BAR (hidden on desktop via CSS class) ══════════ */}
      <div className="tph-mobile-filter-bar" style={{
        flexDirection: "column", gap: "12px", marginBottom: "20px",
      }}>
        {/* Search */}
        <input type="text" placeholder="Search library…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "11px 14px", border: `1px solid ${Paper300}`, borderRadius: "6px",
            fontFamily: "var(--font-poppins)", fontSize: "14px", outline: "none" }} />

        {/* Filters + Sort buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowMobileFilters(true)}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "10px 16px", border: `1.5px solid ${activeFilterCount > 0 ? Blue700 : Paper300}`,
              borderRadius: "6px", backgroundColor: activeFilterCount > 0 ? "#EBF2FF" : White,
              color: activeFilterCount > 0 ? Blue700 : Navy,
              fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
          <div style={{ flex: 1, position: "relative" }}>
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${Paper300}`, borderRadius: "6px",
                fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "13px",
                outline: "none", cursor: "pointer", backgroundColor: White, color: Navy, appearance: "none" }}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A–Z)</option>
            </select>
            <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: Navy }}>▾</div>
          </div>
        </div>

        {/* Results count */}
        <div style={{ ...T.eyebrow, color: Slate500 }}>
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
          {activeFilterCount > 0 && (
            <button onClick={clearAll} style={{ marginLeft: "12px", fontFamily: "var(--font-poppins)", fontSize: "11px",
              color: Blue700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ══════════ DESKTOP LAYOUT (sidebar + grid) ══════════ */}
      <div className="tph-content-with-sidebar" style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>

        {/* Sidebar — hidden on mobile via CSS class */}
        <aside className="tph-sidebar" style={{ flex: "0 0 260px", flexDirection: "column", gap: "32px", position: "sticky", top: "100px" }}>
          <FilterPanel {...filterPanelProps} />
        </aside>

        {/* Results area */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          {/* Desktop top bar */}
          <div className="tph-sidebar" style={{
            justifyContent: "space-between", alignItems: "center",
            marginBottom: "24px", paddingBottom: "16px",
            borderBottom: `1px solid ${Paper300}`, flexWrap: "wrap", gap: "16px",
          }}>
            <div style={{ ...T.eyebrow, color: Slate500 }}>
              Showing {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ ...T.label, color: Navy }}>Sort by:</span>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ padding: "6px 12px", border: `1px solid ${Paper300}`, borderRadius: "4px",
                  fontFamily: "var(--font-poppins)", fontSize: "12px", outline: "none", cursor: "pointer" }}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📖</div>
              <h2 style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "20px", color: Navy, margin: "0 0 8px" }}>No articles found</h2>
              <p style={{ ...T.readBody, color: Slate600, margin: "0 0 16px" }}>Try adjusting your search keywords or active filters.</p>
              <button onClick={clearAll} style={{ ...T.button, padding: "10px 20px",
                backgroundColor: Blue700, color: White, border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="tph-grid-3" style={{ marginBottom: "64px" }}>
              {filtered.map(article => (
                <Link key={article.id || article.slug} href={`/articles/${article.slug}`}
                  style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
                  <DesiringGodArticleCard article={article} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════ MOBILE FILTER DRAWER (slide-over panel) ══════════ */}
      {showMobileFilters && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          display: "flex", alignItems: "flex-end",
        }}>
          {/* Backdrop */}
          <div onClick={() => setShowMobileFilters(false)}
            style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)" }} />
          {/* Drawer */}
          <div style={{
            position: "relative", zIndex: 1, width: "100%",
            backgroundColor: White, borderRadius: "16px 16px 0 0",
            padding: "24px 20px 40px",
            maxHeight: "85vh", overflowY: "auto",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.16)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <span style={{ ...T.label, color: Navy, fontSize: "14px" }}>Filters</span>
              <button onClick={() => setShowMobileFilters(false)}
                style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: Slate500, lineHeight: 1 }}>
                ✕
              </button>
            </div>
            <FilterPanel {...filterPanelProps} onClose={() => setShowMobileFilters(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
