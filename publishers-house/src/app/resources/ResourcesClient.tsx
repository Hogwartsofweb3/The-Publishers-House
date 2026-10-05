"use client";

import { useState } from "react";
import Link from "next/link";
import type { Sermon } from "@/lib/firebase";
import SermonCard from "@/components/SermonCard";

const Navy    = "#151A54";
const Blue500 = "#2090FF";
const Blue700 = "#0140C1";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const Paper100 = "#F4F6FB";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const White   = "#FFFFFF";

const T = {
  eyebrow:   { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  label:     { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  button:    { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  readBody:  { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "15px", lineHeight: "1.6em" },
};

export default function ResourcesClient({ initialSermons }: { initialSermons: Sermon[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  
  // Filters
  const [yearFilter, setYearFilter] = useState("All");
  const [speakerFilter, setSpeakerFilter] = useState("All");
  const [seriesFilter, setSeriesFilter] = useState("All");

  const uniqueSpeakers = Array.from(new Set(initialSermons.map(s => s.speaker))).filter(Boolean);
  const uniqueSeries = Array.from(new Set(initialSermons.map(s => s.series))).filter(Boolean);

  // Apply filters and search
  const filtered = initialSermons.filter(s => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.speaker.toLowerCase().includes(search.toLowerCase())) return false;
    if (speakerFilter !== "All" && s.speaker !== speakerFilter) return false;
    if (seriesFilter !== "All" && s.series !== seriesFilter) return false;
    if (yearFilter !== "All") {
      const sermonYear = s.date ? new Date(s.date).getFullYear().toString() : null;
      if (sermonYear !== yearFilter) return false;
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sort === "newest") return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    if (sort === "oldest") return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
    if (sort === "title") return a.title.localeCompare(b.title);
    return 0; // popularity/related not fully mocked yet
  });

  return (
    <section style={{ backgroundColor: Paper100, padding: "40px 24px 96px" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", gap: "40px", alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* SIDEBAR FILTERS */}
        <div style={{ flex: "0 0 260px", display: "flex", flexDirection: "column", gap: "32px", position: "sticky", top: "100px" }}>
          
          <div>
            <h3 style={{ ...T.label, color: Navy, marginBottom: "16px", borderBottom: `1px solid ${Paper300}`, paddingBottom: "8px" }}>Search</h3>
            <input 
              type="text" 
              placeholder="Search library..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: `1px solid ${Paper300}`, borderRadius: "4px", fontFamily: "var(--font-poppins)", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <h3 style={{ ...T.label, color: Navy, marginBottom: "16px", borderBottom: `1px solid ${Paper300}`, paddingBottom: "8px" }}>Year</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {["All", "2024", "2023", "2022", "2021"].map(y => (
                <label key={y} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer" }}>
                  <input type="radio" name="year" checked={yearFilter === y} onChange={() => setYearFilter(y)} />
                  {y}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ ...T.label, color: Navy, marginBottom: "16px", borderBottom: `1px solid ${Paper300}`, paddingBottom: "8px" }}>Preacher</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer" }}>
                <input type="radio" name="speaker" checked={speakerFilter === "All"} onChange={() => setSpeakerFilter("All")} />
                All Preachers
              </label>
              {uniqueSpeakers.map(sp => (
                <label key={sp} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer" }}>
                  <input type="radio" name="speaker" checked={speakerFilter === sp} onChange={() => setSpeakerFilter(sp)} />
                  {sp}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ ...T.label, color: Navy, marginBottom: "16px", borderBottom: `1px solid ${Paper300}`, paddingBottom: "8px" }}>Series / Conference</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer" }}>
                <input type="radio" name="series" checked={seriesFilter === "All"} onChange={() => setSeriesFilter("All")} />
                All Series
              </label>
              {uniqueSeries.map(s => (
                <label key={s} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, cursor: "pointer" }}>
                  <input type="radio" name="series" checked={seriesFilter === s} onChange={() => setSeriesFilter(s)} />
                  {s}
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* MAIN RESULTS AREA */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          
          {/* Top Bar: Results & Sort */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: `1px solid ${Paper300}`, flexWrap: "wrap", gap: "16px" }}>
            <div style={{ ...T.eyebrow, color: Slate500 }}>
              Showing {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ ...T.label, color: Navy }}>Sort by:</span>
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                style={{ padding: "6px 12px", border: `1px solid ${Paper300}`, borderRadius: "4px", fontFamily: "var(--font-poppins)", fontSize: "12px", outline: "none", cursor: "pointer" }}
              >
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
              <button onClick={() => { setSearch(""); setYearFilter("All"); setSpeakerFilter("All"); setSeriesFilter("All"); }} style={{ ...T.button, padding: "10px 20px", backgroundColor: Blue700, color: White, border: "none", borderRadius: "4px", marginTop: "16px", cursor: "pointer" }}>Clear Filters</button>
            </div>
          ) : (
            <div className="tph-grid-3" style={{ marginBottom: "64px" }}>
              {filtered.map((sermon) => (
                <Link href={`/resources/${sermon.id}`} key={sermon.id} style={{ textDecoration: 'none' }}>
                  <SermonCard sermon={sermon} />
                </Link>
              ))}
            </div>
          )}
          
        </div>

      </div>
    </section>
  );
}
