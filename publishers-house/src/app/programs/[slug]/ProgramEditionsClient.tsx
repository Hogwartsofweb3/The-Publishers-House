"use client";

import { useState } from "react";
import Link from "next/link";

interface Edition {
  year: number;
  theme: string;
  speakers: string[];
  location: string;
  photos: string[];
  sermons: {
    id: string;
    title: string;
    speaker: string;
    duration: string;
  }[];
}

// Mock historical data (since we don't have this in CMS yet)
const MOCK_EDITIONS: Record<string, Edition[]> = {
  "festival-of-light": [
    {
      year: 2023,
      theme: "The City Set on a Hill",
      speakers: ["Rev. Joshua Agunbiade", "Apostle Arome Osayi"],
      location: "Jos, Plateau State",
      photos: ["/images/fol-gallery-1.png", "/images/fol-gallery-2.png"],
      sermons: [
        { id: "fol23-1", title: "Let There Be Light", speaker: "Rev. Joshua Agunbiade", duration: "1h 45m" },
        { id: "fol23-2", title: "The Apostolic Order", speaker: "Apostle Arome Osayi", duration: "2h 15m" }
      ]
    },
    {
      year: 2022,
      theme: "Illuminated",
      speakers: ["Rev. Joshua Agunbiade", "Pst. Damilare"],
      location: "Jos, Plateau State",
      photos: ["/images/fol-gallery-3.png"],
      sermons: [
        { id: "fol22-1", title: "The Lamp and the Light", speaker: "Rev. Joshua Agunbiade", duration: "1h 30m" }
      ]
    }
  ]
};

export default function ProgramEditionsClient({ programSlug, programName }: { programSlug: string, programName: string }) {
  const [activeYear, setActiveYear] = useState<number | null>(null);

  // Fallback to empty array if no mock data
  const editions = MOCK_EDITIONS[programSlug] || [
    {
      year: new Date().getFullYear(),
      theme: "The Apostolic Mandate",
      speakers: ["Rev. Joshua Agunbiade"],
      location: "Jos, Nigeria",
      photos: [],
      sermons: [
        { id: "demo-1", title: "Foundations", speaker: "Rev. Joshua Agunbiade", duration: "1h 10m" },
        { id: "demo-2", title: "The Sent Ones", speaker: "Rev. Joshua Agunbiade", duration: "1h 25m" }
      ]
    }
  ];

  if (activeYear === null && editions.length > 0) {
    setActiveYear(editions[0].year);
  }

  const activeEdition = editions.find(e => e.year === activeYear) || editions[0];

  return (
    <div style={{ display: "flex", maxWidth: "1200px", margin: "0 auto", minHeight: "600px", padding: "40px 24px" }}>
      
      {/* Sidebar: Year Navigation */}
      <div style={{ width: "220px", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.1)", paddingRight: "24px" }}>
        <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "14px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px" }}>
          Timeline
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {editions.map(ed => (
            <button
              key={ed.year}
              onClick={() => setActiveYear(ed.year)}
              style={{
                textAlign: "left",
                padding: "12px 16px",
                background: activeYear === ed.year ? "rgba(217, 119, 6, 0.15)" : "transparent",
                border: activeYear === ed.year ? "1px solid rgba(217, 119, 6, 0.3)" : "1px solid transparent",
                borderRadius: "8px",
                color: activeYear === ed.year ? "#D97706" : "#F8FAFC",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "18px",
                fontWeight: activeYear === ed.year ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {ed.year} Edition
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, paddingLeft: "40px" }}>
        {activeEdition && (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            
            {/* Edition Header */}
            <div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ padding: "4px 12px", background: "#D97706", color: "#fff", borderRadius: "100px", fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: 700 }}>
                  {activeEdition.year}
                </span>
                <span style={{ color: "#94A3B8", fontFamily: "'Poppins', sans-serif", fontSize: "14px" }}>
                  📍 {activeEdition.location}
                </span>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "42px", color: "#F8FAFC", margin: "0 0 16px" }}>
                Theme: "{activeEdition.theme}"
              </h2>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {activeEdition.speakers.map(speaker => (
                  <span key={speaker} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: "20px", color: "#E2E8F0", fontFamily: "'Poppins', sans-serif", fontSize: "13px" }}>
                    🎙 {speaker}
                  </span>
                ))}
              </div>
            </div>

            {/* Sermons List */}
            <div>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "18px", color: "#F8FAFC", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px" }}>
                Sermons from {activeEdition.year}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {activeEdition.sermons.map(sermon => (
                  <div key={sermon.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px", borderRadius: "12px" }}>
                    <div>
                      <h4 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "16px", fontWeight: 600, color: "#F8FAFC", margin: "0 0 6px" }}>
                        {sermon.title}
                      </h4>
                      <div style={{ display: "flex", gap: "12px", color: "#94A3B8", fontFamily: "'Poppins', sans-serif", fontSize: "12px" }}>
                        <span>👤 {sermon.speaker}</span>
                        <span>⏱ {sermon.duration}</span>
                      </div>
                    </div>
                    <Link href={`/resources?search=${encodeURIComponent(sermon.title)}`}>
                      <button style={{ background: "#2090FF", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "8px", fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                        Listen Now
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Photos (if any) */}
            {activeEdition.photos.length > 0 && (
              <div>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "18px", color: "#F8FAFC", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px" }}>
                  Gallery
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                  {activeEdition.photos.map((photo, i) => (
                    <div key={i} style={{ height: "180px", borderRadius: "12px", overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
                      <img src={photo} alt="Gallery" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
