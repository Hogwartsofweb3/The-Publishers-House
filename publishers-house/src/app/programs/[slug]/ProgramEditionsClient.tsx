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

// Historical data for each flagship program
const MOCK_EDITIONS: Record<string, Edition[]> = {
  "festival-of-light": [
    {
      year: 2024,
      theme: "A City Set on a Hill",
      speakers: ["Dr. Joshua Agunbiade", "Pastor Damilare Ayodele"],
      location: "Jos, Plateau State",
      photos: ["/images/fol-gallery-1.png", "/images/fol-gallery-2.png"],
      sermons: [
        { id: "fol24-1", title: "The Shining Light of Zion", speaker: "Dr. Joshua Agunbiade", duration: "1h 50m" },
        { id: "fol24-2", title: "Arise, Shine for Thy Light Is Come", speaker: "Pastor Damilare Ayodele", duration: "1h 35m" },
      ],
    },
    {
      year: 2023,
      theme: "The Sent Ones",
      speakers: ["Dr. Joshua Agunbiade", "Apostle Arome Osayi"],
      location: "Jos, Plateau State",
      photos: ["/images/fol-gallery-2.png", "/images/fol-gallery-3.png"],
      sermons: [
        { id: "fol23-1", title: "Let There Be Light", speaker: "Dr. Joshua Agunbiade", duration: "1h 45m" },
        { id: "fol23-2", title: "The Apostolic Order", speaker: "Apostle Arome Osayi", duration: "2h 15m" },
      ],
    },
    {
      year: 2022,
      theme: "Illuminated",
      speakers: ["Dr. Joshua Agunbiade", "Pastor Damilare Ayodele"],
      location: "Jos, Plateau State",
      photos: ["/images/fol-gallery-3.png"],
      sermons: [
        { id: "fol22-1", title: "The Lamp and the Light", speaker: "Dr. Joshua Agunbiade", duration: "1h 30m" },
      ],
    },
    {
      year: 2021,
      theme: "The Light Has Come",
      speakers: ["Dr. Joshua Agunbiade"],
      location: "Jos, Plateau State",
      photos: ["/images/fol-gallery-1.png"],
      sermons: [
        { id: "fol21-1", title: "In Him Was Life, and the Life Was the Light of Men", speaker: "Dr. Joshua Agunbiade", duration: "1h 40m" },
      ],
    },
  ],
  "merismos": [
    {
      year: 2024,
      theme: "Rightly Dividing the Word of Truth",
      speakers: ["Dr. Joshua Agunbiade", "Pastor Boniface Onah"],
      location: "Jos, Plateau State",
      photos: ["/images/fol-gallery-1.png"],
      sermons: [
        { id: "mer24-1", title: "Piercing Even to the Dividing Asunder", speaker: "Dr. Joshua Agunbiade", duration: "2h 05m" },
        { id: "mer24-2", title: "Discerning Spirit and Soul", speaker: "Pastor Boniface Onah", duration: "1h 40m" },
      ],
    },
    {
      year: 2023,
      theme: "The Quick and Powerful Word",
      speakers: ["Dr. Joshua Agunbiade"],
      location: "Jos, Plateau State",
      photos: ["/images/fol-gallery-2.png"],
      sermons: [
        { id: "mer23-1", title: "The Sword of the Spirit", speaker: "Dr. Joshua Agunbiade", duration: "1h 55m" },
      ],
    },
    {
      year: 2022,
      theme: "Discerning the Intentions of the Heart",
      speakers: ["Dr. Joshua Agunbiade", "Pastor Damilare Ayodele"],
      location: "Jos, Plateau State",
      photos: ["/images/fol-gallery-3.png"],
      sermons: [
        { id: "mer22-1", title: "The Incorruptible Seed of the Word", speaker: "Dr. Joshua Agunbiade", duration: "1h 35m" },
      ],
    },
  ],
  "jesus-convention": [
    {
      year: 2024,
      theme: "The Risen Christ and His Eternal Dominion",
      speakers: ["Dr. Joshua Agunbiade", "Pastor Ngbede Odeh"],
      location: "Jos, Plateau State",
      photos: ["/images/fol-gallery-1.png"],
      sermons: [
        { id: "jc24-1", title: "That I May Know Him", speaker: "Dr. Joshua Agunbiade", duration: "2h 10m" },
        { id: "jc24-2", title: "The Power of His Resurrection", speaker: "Pastor Ngbede Odeh", duration: "1h 45m" },
      ],
    },
    {
      year: 2023,
      theme: "Beholding the Lamb of God",
      speakers: ["Dr. Joshua Agunbiade"],
      location: "Jos, Plateau State",
      photos: ["/images/fol-gallery-2.png"],
      sermons: [
        { id: "jc23-1", title: "The Finished Work on Calvary", speaker: "Dr. Joshua Agunbiade", duration: "1h 50m" },
      ],
    },
    {
      year: 2022,
      theme: "The Mystery of Godliness",
      speakers: ["Dr. Joshua Agunbiade", "Pastor Theophilus Makinde"],
      location: "Jos, Plateau State",
      photos: ["/images/fol-gallery-3.png"],
      sermons: [
        { id: "jc22-1", title: "God Was Manifest in the Flesh", speaker: "Dr. Joshua Agunbiade", duration: "1h 30m" },
      ],
    },
  ],
  "the-forge": [
    {
      year: 2024,
      theme: "The Altar of Prayer and Corporate Travail",
      speakers: ["Dr. Joshua Agunbiade", "Pastor Theophilus Makinde"],
      location: "The House of Bread, Jos",
      photos: ["/images/fol-gallery-2.png"],
      sermons: [
        { id: "fg24-1", title: "Is Not My Word Like As A Fire?", speaker: "Dr. Joshua Agunbiade", duration: "2h 30m" },
        { id: "fg24-2", title: "Travail and the Birth of Movements", speaker: "Pastor Theophilus Makinde", duration: "2h 00m" },
      ],
    },
    {
      year: 2023,
      theme: "Men of Fire and Devotion",
      speakers: ["Dr. Joshua Agunbiade"],
      location: "The House of Bread, Jos",
      photos: ["/images/fol-gallery-3.png"],
      sermons: [
        { id: "fg23-1", title: "Building Altars of Prevailing Prayer", speaker: "Dr. Joshua Agunbiade", duration: "2h 15m" },
      ],
    },
  ],
  "abuja-apostolic-camp": [
    {
      year: 2024,
      theme: "Awakening the Capital",
      speakers: ["Dr. Joshua Agunbiade", "Pastor Boniface Onah"],
      location: "Abuja, FCT",
      photos: ["/images/fol-gallery-1.png"],
      sermons: [
        { id: "aac24-1", title: "The Apostolic Mandate for the Marketplace", speaker: "Dr. Joshua Agunbiade", duration: "1h 55m" },
        { id: "aac24-2", title: "Spiritual Alignment and Kingdom Impact", speaker: "Pastor Boniface Onah", duration: "1h 40m" },
      ],
    },
    {
      year: 2023,
      theme: "A Foundation for the Sent",
      speakers: ["Dr. Joshua Agunbiade"],
      location: "Abuja, FCT",
      photos: ["/images/fol-gallery-2.png"],
      sermons: [
        { id: "aac23-1", title: "Publishers in the Nations", speaker: "Dr. Joshua Agunbiade", duration: "1h 45m" },
      ],
    },
  ],
  "sunday-midweek": [
    {
      year: 2024,
      theme: "Corporate Worship, Expository Doctrine & Fellowship",
      speakers: ["Dr. Joshua Agunbiade", "Associate Pastors"],
      location: "The House of Bread, Jos",
      photos: ["/images/fol-gallery-1.png"],
      sermons: [
        { id: "sm24-1", title: "The Apostolic Doctrine & The Apostles' Fellowship", speaker: "Dr. Joshua Agunbiade", duration: "1h 40m" },
        { id: "sm24-2", title: "Midweek Corporate Prayer and Supplication", speaker: "Pastor Damilare Ayodele", duration: "1h 25m" },
      ],
    },
    {
      year: 2023,
      theme: "Steadfast in the Word",
      speakers: ["Dr. Joshua Agunbiade"],
      location: "The House of Bread, Jos",
      photos: ["/images/fol-gallery-2.png"],
      sermons: [
        { id: "sm23-1", title: "Growing in the Accurate Knowledge of Christ", speaker: "Dr. Joshua Agunbiade", duration: "1h 35m" },
      ],
    },
  ],
};

export default function ProgramEditionsClient({ programSlug, programName }: { programSlug: string, programName: string }) {
  const [activeYear, setActiveYear] = useState<number | null>(null);

  // Fallback to empty array if no mock data
  const editions = MOCK_EDITIONS[programSlug] || [
    {
      year: new Date().getFullYear(),
      theme: "The Apostolic Mandate",
      speakers: ["Dr. Joshua Agunbiade"],
      location: "Jos, Nigeria",
      photos: [],
      sermons: [
        { id: "demo-1", title: "Foundations of Truth", speaker: "Dr. Joshua Agunbiade", duration: "1h 10m" },
        { id: "demo-2", title: "The Sent Ones", speaker: "Dr. Joshua Agunbiade", duration: "1h 25m" }
      ]
    }
  ];

  if (activeYear === null && editions.length > 0) {
    setActiveYear(editions[0].year);
  }

  const activeEdition = editions.find(e => e.year === activeYear) || editions[0];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", maxWidth: "1200px", margin: "0 auto", minHeight: "600px", padding: "40px 24px" }}>
      
      {/* Sidebar: Year Navigation */}
      <div style={{ width: "220px", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.1)", paddingRight: "24px", minWidth: "160px" }}>
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
                background: activeYear === ed.year ? "rgba(32, 144, 255, 0.15)" : "transparent",
                border: activeYear === ed.year ? "1px solid rgba(32, 144, 255, 0.3)" : "1px solid transparent",
                borderRadius: "8px",
                color: activeYear === ed.year ? "#2090FF" : "#F8FAFC",
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
      <div style={{ flex: 1, minWidth: "280px" }}>
        {activeEdition && (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            
            {/* Edition Header */}
            <div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ padding: "4px 12px", background: "#2090FF", color: "#fff", borderRadius: "100px", fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: 700 }}>
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
