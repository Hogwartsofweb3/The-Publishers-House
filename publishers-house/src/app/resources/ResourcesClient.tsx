"use client";

import { useState } from "react";
import type { Sermon } from "@/lib/firebase";
import SermonCard from "@/components/SermonCard";

const Navy    = "#151A54";
const Blue500 = "#2090FF";
const Blue700 = "#0140C1";
const Blue300 = "#6496EF";
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
  const [activeTab, setActiveTab] = useState("SERMONS");
  const [activePill, setActivePill] = useState("ALL SPEAKERS");
  const [search, setSearch] = useState("");

  const tabs = ["SERMONS", "TEACHING SERIES", "STUDY GUIDES", "CONFERENCE SESSIONS"];
  const pills = ["ALL SPEAKERS", "FOUNDATIONS", "FESTIVAL OF LIGHT", "MERISMOS", "ABUJA", "2026"];
  const pagination = ["PREVIOUS", "1", "2", "3", "4", "NEXT"];

  return (
    <section className="tph-section" style={{ backgroundColor: Paper100, padding: "64px 24px 96px" }}>
      <div className="tph-inner" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Search Bar */}
        <div style={{ marginBottom: "24px" }}>
          <input 
            type="text" 
            placeholder="Search by title, series, speaker or Scripture, for example Hebrews 4" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "20px 24px",
              border: `1px solid ${Paper300}`,
              borderRadius: "2px",
              fontFamily: "var(--font-playfair)",
              fontSize: "18px",
              color: Navy,
              backgroundColor: White,
              outline: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
            }}
          />
        </div>

        {/* Tabs Row */}
        <div style={{ 
          display: "flex", 
          gap: "32px", 
          paddingBottom: "16px", 
          borderBottom: `1px solid ${Paper300}`, 
          marginBottom: "24px",
          overflowX: "auto",
          whiteSpace: "nowrap"
        }}>
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...T.label,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: activeTab === tab ? Navy : Slate500,
                fontWeight: activeTab === tab ? 700 : 600,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Pills Row */}
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          marginBottom: "48px",
          flexWrap: "wrap"
        }}>
          {pills.map(pill => (
            <button
              key={pill}
              onClick={() => setActivePill(pill)}
              style={{
                ...T.eyebrow,
                padding: "8px 20px",
                borderRadius: "32px",
                border: `1px solid ${activePill === pill ? Navy : Paper300}`,
                backgroundColor: activePill === pill ? Navy : White,
                color: activePill === pill ? White : Slate600,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Sermons Grid */}
        {initialSermons.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ ...T.eyebrow, color: Slate500, marginBottom: "16px" }}>Coming Soon</div>
            <h2 style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "26px", color: Navy, margin: "0 0 12px", textTransform: "uppercase" }}>Teachings Loading</h2>
            <p style={{ ...T.readBody, color: Slate600 }}>Sermons are being published through the CMS. Check back soon.</p>
          </div>
        ) : (
          <div className="tph-grid-3" style={{ marginBottom: "64px" }}>
            {initialSermons.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {pagination.map((p, i) => (
              <button 
                key={i}
                style={{
                  ...T.button,
                  height: "40px",
                  padding: p === "PREVIOUS" || p === "NEXT" ? "0 20px" : "0 16px",
                  backgroundColor: p === "1" ? Navy : White,
                  color: p === "1" ? White : Navy,
                  border: `1px solid ${p === "1" ? Navy : Paper300}`,
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <p style={{ ...T.readBody, color: Slate500, margin: 0, fontSize: "14px", textAlign: "center" }}>
            Numbered pages, not infinite scroll, so a position is shareable and the footer stays reachable. Twelve per page.
          </p>
        </div>

      </div>
    </section>
  );
}
