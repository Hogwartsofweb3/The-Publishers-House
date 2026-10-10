"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { Sermon } from "@/lib/firebase";
import SermonCard from "@/components/SermonCard";

/** Extract a YouTube thumbnail from any YouTube URL format, or return "" */
function getYouTubeThumbnail(videoUrl?: string): string {
  if (!videoUrl) return "";
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = videoUrl.match(p);
    if (m) return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
  }
  return "";
}

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

/* ─── Mobile horizontal sermon card (Gospel-in-Life style) ─── */
function SermonMobileCard({ sermon }: { sermon: Sermon }) {
  const dateLabel = sermon.date
    ? new Date(sermon.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()
    : "";
  const thumb = getYouTubeThumbnail(sermon.videoUrl);

  return (
    <Link href={`/sermons/${sermon.id}`} className="sermon-mobile-card">
      {/* Thumbnail */}
      {thumb ? (
        <img src={thumb} alt={sermon.title} className="sermon-mobile-card-thumb" />
      ) : (
        <div className="sermon-mobile-card-thumb" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.3)", fontSize: "11px", fontFamily: "var(--font-poppins)",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" opacity={0.4}>
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
          </svg>
        </div>
      )}

      {/* Text */}
      <div className="sermon-mobile-card-body">
        <div style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "9px",
          letterSpacing: "0.18em", textTransform: "uppercase", color: Blue500, marginBottom: "4px" }}>
          Sermon
        </div>
        <div style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "13px",
          lineHeight: "1.3em", color: Navy, marginBottom: "5px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {sermon.title}
        </div>
        {sermon.speaker && (
          <div style={{ fontFamily: "var(--font-poppins)", fontSize: "11px", color: Slate500 }}>
            {sermon.speaker}
            {dateLabel && <span style={{ marginLeft: "6px", opacity: 0.7 }}>· {dateLabel}</span>}
          </div>
        )}
        {sermon.series && (
          <div style={{ fontFamily: "var(--font-poppins)", fontSize: "10px", color: Slate500,
            marginTop: "3px", fontStyle: "italic" }}>
            {sermon.series}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ─── Original Sidebar filter panel (USED FOR MOBILE DRAWER ONLY) ─── */
function SermonsFilterPanel({
  search, setSearch,
  yearFilter, setYearFilter,
  speakerFilter, setSpeakerFilter, uniqueSpeakers,
  seriesFilter, setSeriesFilter, uniqueSeries,
  onClose,
}: {
  search: string; setSearch: (v: string) => void;
  yearFilter: string; setYearFilter: (v: string) => void;
  speakerFilter: string; setSpeakerFilter: (v: string) => void; uniqueSpeakers: string[];
  seriesFilter: string; setSeriesFilter: (v: string) => void; uniqueSeries: string[];
  onClose?: () => void;
}) {
  const labelStyle = { ...T.label, color: Navy, marginBottom: "16px", borderBottom: `1px solid ${Paper300}`, paddingBottom: "8px", display: "block" } as React.CSSProperties;
  const radioRow = { display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer" } as React.CSSProperties;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Search */}
      <div>
        <label style={labelStyle}>Search</label>
        <input type="text" placeholder="Search sermons…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", border: `1px solid ${Paper300}`, borderRadius: "4px",
            fontFamily: "var(--font-poppins)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* Year */}
      <div>
        <label style={labelStyle}>Year</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {["All", "2026", "2025", "2024", "2023", "2022", "2021"].map(y => (
            <label key={y} style={radioRow}>
              <input type="radio" name="year" checked={yearFilter === y} onChange={() => setYearFilter(y)} /> {y === "All" ? "All Years" : y}
            </label>
          ))}
        </div>
      </div>

      {/* Preacher */}
      <div>
        <label style={labelStyle}>Preacher</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={radioRow}><input type="radio" name="speaker" checked={speakerFilter === "All"} onChange={() => setSpeakerFilter("All")} /> All Preachers</label>
          {uniqueSpeakers.map(sp => (
            <label key={sp} style={radioRow}><input type="radio" name="speaker" checked={speakerFilter === sp} onChange={() => setSpeakerFilter(sp)} /> {sp}</label>
          ))}
        </div>
      </div>

      {/* Series */}
      <div>
        <label style={labelStyle}>Series / Conference</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={radioRow}><input type="radio" name="series" checked={seriesFilter === "All"} onChange={() => setSeriesFilter("All")} /> All Series</label>
          {uniqueSeries.map(s => (
            <label key={s} style={radioRow}><input type="radio" name="series" checked={seriesFilter === s} onChange={() => setSeriesFilter(s)} /> {s}</label>
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

/* ─── NEW Desktop filter panel (WITH SCROLLABLE AREAS) ─── */
function DesktopFilterPanel({
  search, setSearch,
  yearFilter, setYearFilter,
  speakerFilter, setSpeakerFilter,
  seriesFilter, setSeriesFilter,
  initialSermons,
}: {
  search: string; setSearch: (v: string) => void;
  yearFilter: string; setYearFilter: (v: string) => void;
  speakerFilter: string; setSpeakerFilter: (v: string) => void;
  seriesFilter: string; setSeriesFilter: (v: string) => void;
  initialSermons: Sermon[];
}) {
  const labelStyle = { ...T.label, color: Navy, marginBottom: "16px", borderBottom: `1px solid ${Paper300}`, paddingBottom: "8px", display: "block" } as React.CSSProperties;
  const radioRow = { display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer", padding: "4px 0" } as React.CSSProperties;

  // Speaker counts and filtering
  const speakerCounts = initialSermons.reduce((acc, s) => {
    if (s.speaker) acc[s.speaker] = (acc[s.speaker] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const uniqueSpeakers = Object.keys(speakerCounts).sort((a,b) => a.localeCompare(b));

  const [speakerSearch, setSpeakerSearch] = useState("");
  const filteredSpeakers = uniqueSpeakers.filter(s => s.toLowerCase().includes(speakerSearch.toLowerCase()));

  // Series counts and filtering
  const seriesCounts = initialSermons.reduce((acc, s) => {
    if (s.series) acc[s.series] = (acc[s.series] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const uniqueSeries = Object.keys(seriesCounts).sort((a,b) => a.localeCompare(b));

  const [seriesSearch, setSeriesSearch] = useState("");
  const filteredSeries = uniqueSeries.filter(s => s.toLowerCase().includes(seriesSearch.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Search */}
      <div>
        <label style={labelStyle}>Search</label>
        <input type="text" placeholder="Search sermons…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", border: `1px solid ${Paper300}`, borderRadius: "4px",
            fontFamily: "var(--font-poppins)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* Year */}
      <div>
        <label style={labelStyle}>Year</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {["All", "2026", "2025", "2024", "2023", "2022", "2021"].map(y => (
            <label key={y} style={radioRow}>
              <input type="radio" name="d-year" checked={yearFilter === y} onChange={() => setYearFilter(y)} /> {y === "All" ? "All Years" : y}
            </label>
          ))}
        </div>
      </div>

      {/* Preacher */}
      <div>
        <label style={labelStyle}>Speakers</label>
        <input type="text" placeholder="Search Speakers..." value={speakerSearch} onChange={e => setSpeakerSearch(e.target.value)}
          style={{ width: "100%", padding: "8px 10px", marginBottom: "12px", border: `1px solid ${Paper300}`, borderRadius: "4px",
            fontFamily: "var(--font-poppins)", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
        <div className="filter-scroll-box" style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "220px", overflowY: "auto", paddingRight: "8px" }}>
          <label style={radioRow}><input type="radio" name="d-speaker" checked={speakerFilter === "All"} onChange={() => setSpeakerFilter("All")} /> All Preachers</label>
          {filteredSpeakers.map(sp => (
            <label key={sp} style={radioRow}><input type="radio" name="d-speaker" checked={speakerFilter === sp} onChange={() => setSpeakerFilter(sp)} /> {sp} ({speakerCounts[sp]})</label>
          ))}
        </div>
      </div>

      {/* Series */}
      <div>
        <label style={labelStyle}>Series / Conference</label>
        <input type="text" placeholder="Search Series..." value={seriesSearch} onChange={e => setSeriesSearch(e.target.value)}
          style={{ width: "100%", padding: "8px 10px", marginBottom: "12px", border: `1px solid ${Paper300}`, borderRadius: "4px",
            fontFamily: "var(--font-poppins)", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
        <div className="filter-scroll-box" style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "220px", overflowY: "auto", paddingRight: "8px" }}>
          <label style={radioRow}><input type="radio" name="d-series" checked={seriesFilter === "All"} onChange={() => setSeriesFilter("All")} /> All Series</label>
          {filteredSeries.map(s => (
            <label key={s} style={radioRow}><input type="radio" name="d-series" checked={seriesFilter === s} onChange={() => setSeriesFilter(s)} /> {s} ({seriesCounts[s]})</label>
          ))}
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 24;

/* ─── Main component ─── */
export default function SermonsClient({ initialSermons }: { initialSermons: Sermon[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("oldest");
  const [yearFilter, setYearFilter] = useState("All");
  const [speakerFilter, setSpeakerFilter] = useState("All");
  const [seriesFilter, setSeriesFilter] = useState("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const gridTopRef = useRef<HTMLDivElement>(null);
  const mobileTopRef = useRef<HTMLDivElement>(null);

  const uniqueSpeakers = Array.from(new Set(initialSermons.map(s => s.speaker))).filter(Boolean) as string[];
  const uniqueSeries   = Array.from(new Set(initialSermons.map(s => s.series))).filter(Boolean) as string[];

  const filtered = initialSermons.filter(s => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.speaker.toLowerCase().includes(search.toLowerCase())) return false;
    if (speakerFilter !== "All" && s.speaker !== speakerFilter) return false;
    if (seriesFilter  !== "All" && s.series  !== seriesFilter)  return false;
    if (yearFilter !== "All") {
      const yr = s.date ? new Date(s.date).getFullYear().toString() : null;
      if (yr !== yearFilter) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (sort === "newest") return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    if (sort === "oldest") return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
    if (sort === "title")  return a.title.localeCompare(b.title);
    return 0;
  });

  const handleSearch = (v: string) => { setSearch(v); setCurrentPage(1); };
  const handleYearFilter = (v: string) => { setYearFilter(v); setCurrentPage(1); };
  const handleSpeakerFilter = (v: string) => { setSpeakerFilter(v); setCurrentPage(1); };
  const handleSeriesFilter = (v: string) => { setSeriesFilter(v); setCurrentPage(1); };

  const clearAll = () => { handleSearch(""); handleYearFilter("All"); handleSpeakerFilter("All"); handleSeriesFilter("All"); };

  const activeFilterCount = [
    search !== "",
    yearFilter !== "All",
    speakerFilter !== "All",
    seriesFilter !== "All",
  ].filter(Boolean).length;

  const filterPanelProps = { 
    search, setSearch: handleSearch, 
    yearFilter, setYearFilter: handleYearFilter, 
    speakerFilter, setSpeakerFilter: handleSpeakerFilter, uniqueSpeakers, 
    seriesFilter, setSeriesFilter: handleSeriesFilter, uniqueSeries 
  };
  
  const desktopFilterPanelProps = {
    search, setSearch: handleSearch,
    yearFilter, setYearFilter: handleYearFilter,
    speakerFilter, setSpeakerFilter: handleSpeakerFilter,
    seriesFilter, setSeriesFilter: handleSeriesFilter,
    initialSermons
  };

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const paginatedSermons = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const onPageChange = (page: number, isMobile: boolean) => {
    setCurrentPage(page);
    if (isMobile && mobileTopRef.current) {
       mobileTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (!isMobile && gridTopRef.current) {
       gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  function renderPagination(isMobile: boolean) {
    if (totalPages <= 1) return null;
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "48px", marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px" }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => onPageChange(currentPage - 1, isMobile)}
            style={{ ...T.button, padding: "8px 12px", border: "none", background: "none", color: currentPage === 1 ? Paper300 : Navy, cursor: currentPage === 1 ? "default" : "pointer" }}
          >&lt; Previous</button>

          {pages.map((p, i) => (
            typeof p === 'number' ? (
              <button 
                key={i}
                onClick={() => onPageChange(p, isMobile)}
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  backgroundColor: p === currentPage ? Blue700 : "transparent",
                  color: p === currentPage ? White : Slate600,
                  border: "none",
                  fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "13px",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >{p}</button>
            ) : (
              <div key={i} style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", color: Slate600 }}>...</div>
            )
          ))}

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => onPageChange(currentPage + 1, isMobile)}
            style={{ ...T.button, padding: "8px 12px", border: "none", background: "none", color: currentPage === totalPages ? Paper300 : Navy, cursor: currentPage === totalPages ? "default" : "pointer" }}
          >Next &gt;</button>
        </div>
        <div style={{ ...T.eyebrow, color: Slate500, marginTop: "16px" }}>
          Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems} results
        </div>
      </div>
    );
  }

  return (
    <section style={{ backgroundColor: Paper100, padding: "40px 24px 96px" }}>
      <style>{`
        .filter-scroll-box::-webkit-scrollbar { width: 5px; }
        .filter-scroll-box::-webkit-scrollbar-track { background: #F4F6FB; border-radius: 3px; }
        .filter-scroll-box::-webkit-scrollbar-thumb { background: #D3DAEC; border-radius: 3px; }
        .filter-scroll-box::-webkit-scrollbar-thumb:hover { background: #747CA1; }
      `}</style>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>

        {/* ══════════ MOBILE FILTER BAR ══════════ */}
        <div className="tph-mobile-filter-bar" style={{ flexDirection: "column", gap: "12px", marginBottom: "20px" }} ref={mobileTopRef}>
          {/* Search */}
          <input type="text" placeholder="Search sermons…" value={search} onChange={e => handleSearch(e.target.value)}
            style={{ width: "100%", padding: "11px 14px", border: `1px solid ${Paper300}`, borderRadius: "6px",
              fontFamily: "var(--font-poppins)", fontSize: "14px", outline: "none" }} />

          {/* Filters + Sort */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowMobileFilters(true)} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "10px 16px", border: `1.5px solid ${activeFilterCount > 0 ? Blue700 : Paper300}`,
              borderRadius: "6px", backgroundColor: activeFilterCount > 0 ? "#EBF2FF" : White,
              color: activeFilterCount > 0 ? Blue700 : Navy,
              fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "13px", cursor: "pointer",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
            <div style={{ flex: 1, position: "relative" }}>
              <select value={sort} onChange={e => { setSort(e.target.value); setCurrentPage(1); }}
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

          {/* Mobile sermon list */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
              <h2 style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "18px", color: Navy, margin: "0 0 8px" }}>No sermons found</h2>
              <button onClick={clearAll} style={{ ...T.button, padding: "10px 20px",
                backgroundColor: Blue700, color: White, border: "none", borderRadius: "4px", marginTop: "12px", cursor: "pointer" }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="sermon-mobile-list" style={{ marginTop: "4px" }}>
              {paginatedSermons.map(sermon => (
                <SermonMobileCard key={sermon.id} sermon={sermon} />
              ))}
            </div>
          )}
          {filtered.length > 0 && renderPagination(true)}
        </div>

        {/* ══════════ DESKTOP LAYOUT (sidebar + grid) ══════════ */}
        <div className="tph-content-with-sidebar tph-sidebar" style={{
          display: "flex", gap: "40px", alignItems: "flex-start", flexWrap: "wrap",
        }}>
          {/* Sidebar */}
          <div style={{ flex: "0 0 260px", display: "flex", flexDirection: "column", gap: "32px", position: "sticky", top: "100px" }}>
            <DesktopFilterPanel {...desktopFilterPanelProps} />
          </div>

          {/* Results */}
          <div style={{ flex: "1 1 0", minWidth: 0 }} ref={gridTopRef}>
            {/* Top bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "24px", paddingBottom: "16px", borderBottom: `1px solid ${Paper300}`, flexWrap: "wrap", gap: "16px" }}>
              <div style={{ ...T.eyebrow, color: Slate500 }}>
                Showing {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ ...T.label, color: Navy }}>Sort by:</span>
                <select value={sort} onChange={e => { setSort(e.target.value); setCurrentPage(1); }}
                  style={{ padding: "6px 12px", border: `1px solid ${Paper300}`, borderRadius: "4px",
                    fontFamily: "var(--font-poppins)", fontSize: "12px", outline: "none", cursor: "pointer" }}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popularity">Most Popular</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
                <h2 style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "20px", color: Navy, margin: "0 0 8px" }}>No sermons found</h2>
                <p style={{ ...T.readBody, color: Slate600 }}>Try adjusting your search or filters.</p>
                <button onClick={clearAll} style={{ ...T.button, padding: "10px 20px",
                  backgroundColor: Blue700, color: White, border: "none", borderRadius: "4px", marginTop: "16px", cursor: "pointer" }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="tph-grid-3" style={{ marginBottom: "64px" }}>
                {paginatedSermons.map(sermon => (
                  <SermonCard key={sermon.id} sermon={sermon} />
                ))}
              </div>
            )}
            
            {filtered.length > 0 && renderPagination(false)}
          </div>
        </div>

        {/* ══════════ MOBILE FILTER DRAWER ══════════ */}
        {showMobileFilters && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-end" }}>
            <div onClick={() => setShowMobileFilters(false)}
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)" }} />
            <div style={{
              position: "relative", zIndex: 1, width: "100%",
              backgroundColor: White, borderRadius: "16px 16px 0 0",
              padding: "24px 20px 40px", maxHeight: "85vh", overflowY: "auto",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.16)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <span style={{ ...T.label, color: Navy, fontSize: "14px" }}>Filters</span>
                <button onClick={() => setShowMobileFilters(false)}
                  style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: Slate500, lineHeight: 1 }}>
                  ✕
                </button>
              </div>
              <SermonsFilterPanel {...filterPanelProps} onClose={() => setShowMobileFilters(false)} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
