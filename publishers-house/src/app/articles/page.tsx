import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Shared style constants
const S = {
  // Colors
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
  
  // Typography
  DisplayXL: { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "72px", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  DisplayL: { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "48px", lineHeight: "1.04em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  DisplayM: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "30px", lineHeight: "1.14em", letterSpacing: "-0.015em", textTransform: "uppercase" as const },
  DisplayS: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "21px", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  Epigraph: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontStyle: "italic", fontSize: "30px", lineHeight: "1.3em" },
  ReadLede: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
  ReadBody: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "17px", lineHeight: "1.68em" },
  ReadSmall: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
  UIEyebrow: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  UILabel: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  UIScripture: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  UIButton: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  UIColophon: { fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  UIData: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "14px", lineHeight: "1.5em", letterSpacing: "0.02em" },

  // Layout
  SectionPad: "96px 100px",
  Button: { height: "48px", padding: "0 26px", borderRadius: "2px", display: "inline-flex", alignItems: "center", justifyContent: "center" },
};

function ArticleCard({ title, desc, tag, author, date, readTime }: { title: string, desc: string, tag: string, author: string, date: string, readTime: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ ...S.UIEyebrow, color: S.Blue500 }}>{tag}</div>
      <h3 style={{ ...S.DisplayS, color: S.Navy, textTransform: "none" as const }}>{title}</h3>
      <p style={{ ...S.ReadSmall, color: S.Slate600 }}>{desc}</p>
      
      {/* Colophon */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" }}>
        <span style={{ ...S.UIColophon, color: S.Navy }}>{author}</span>
        <span style={{ ...S.UIColophon, color: S.Paper400 }}>·</span>
        <span style={{ ...S.UIColophon, color: S.Slate500 }}>{date}</span>
        <span style={{ ...S.UIColophon, color: S.Paper400 }}>·</span>
        <span style={{ ...S.UIColophon, color: S.Slate500 }}>{readTime}</span>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <div style={{ backgroundColor: S.Paper100, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section
          style={{
            padding: "88px 100px",
            backgroundColor: S.Paper200,
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <div style={{ ...S.UIScripture, color: S.Blue500 }}>1 Timothy 4:13</div>
          <h1 style={{ ...S.DisplayXL, color: S.Navy }}>Articles and essays</h1>
          <p style={{ ...S.ReadLede, color: S.Slate600, maxWidth: "720px" }}>
            Written teachings, apologetics, and reflections on the Christian faith and life.
          </p>
        </section>

        {/* Content */}
        <section
          style={{
            padding: "72px 100px 96px",
            backgroundColor: S.White,
            display: "flex",
            flexDirection: "column",
            gap: "48px"
          }}
        >
          {/* Top Bar: Search and Tabs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ position: "relative", maxWidth: "400px" }}>
              <input 
                type="text" 
                placeholder="Search, for example Apologetics"
                style={{
                  width: "100%",
                  padding: "16px",
                  paddingLeft: "48px",
                  border: `1px solid ${S.Paper300}`,
                  borderRadius: "2px",
                  ...S.ReadBody,
                  color: S.Navy,
                  backgroundColor: S.Paper100,
                  outline: "none"
                }}
              />
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
            </div>
            
            <div style={{ display: "flex", gap: "32px", borderBottom: `1px solid ${S.Paper300}` }}>
              <div style={{ ...S.UILabel, color: S.Navy, paddingBottom: "12px", borderBottom: `2px solid ${S.Navy}` }}>All</div>
              <div style={{ ...S.UILabel, color: S.Slate500, paddingBottom: "12px" }}>Theology</div>
              <div style={{ ...S.UILabel, color: S.Slate500, paddingBottom: "12px" }}>Apologetics</div>
              <div style={{ ...S.UILabel, color: S.Slate500, paddingBottom: "12px" }}>Christian Living</div>
            </div>
          </div>

          {/* Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "64px 32px"
            }}
          >
            <ArticleCard 
              tag="Apologetics"
              title="Apologetics goes wrong when it becomes a contest."
              desc="On winning an argument versus helping a person."
              author="Dr. Joshua Agunbiade"
              date="12 AUG 2026"
              readTime="5 MIN READ"
            />
            <ArticleCard 
              tag="Theology"
              title="The necessity of accurate doctrine in modern times."
              desc="Why holding onto the truth of the scriptures is more important than ever."
              author="Pastor Damilare"
              date="03 AUG 2026"
              readTime="8 MIN READ"
            />
            <ArticleCard 
              tag="Christian Living"
              title="Building a daily altar of prayer."
              desc="Practical steps to maintaining spiritual intensity throughout the week."
              author="Dr. Joshua Agunbiade"
              date="24 JUL 2026"
              readTime="4 MIN READ"
            />
            <ArticleCard 
              tag="Theology"
              title="Understanding the apostolic mandate."
              desc="Every believer carries a commission to publish the Word, in speech and in life."
              author="Dr. Joshua Agunbiade"
              date="15 JUL 2026"
              readTime="12 MIN READ"
            />
            <ArticleCard 
              tag="Apologetics"
              title="Defending the faith in the workplace."
              desc="How to represent Christ accurately and effectively to your colleagues."
              author="Pastor Damilare"
              date="01 JUL 2026"
              readTime="6 MIN READ"
            />
            <ArticleCard 
              tag="Christian Living"
              title="The role of community in spiritual growth."
              desc="Why we cannot walk the Christian journey in isolation."
              author="Dr. Joshua Agunbiade"
              date="18 JUN 2026"
              readTime="7 MIN READ"
            />
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "32px" }}>
            <button style={{ ...S.UILabel, color: S.Slate500, padding: "8px 16px", backgroundColor: "transparent", border: "none" }}>Prev</button>
            <button style={{ ...S.UILabel, color: S.Navy, padding: "8px 12px", border: `1px solid ${S.Paper300}`, borderRadius: "2px", backgroundColor: S.White }}>1</button>
            <button style={{ ...S.UILabel, color: S.Slate500, padding: "8px 12px", backgroundColor: "transparent", border: "none" }}>2</button>
            <button style={{ ...S.UILabel, color: S.Slate500, padding: "8px 12px", backgroundColor: "transparent", border: "none" }}>3</button>
            <button style={{ ...S.UILabel, color: S.Slate500, padding: "8px 16px", backgroundColor: "transparent", border: "none" }}>Next</button>
          </div>
          <div style={{ textAlign: "center", ...S.ReadSmall, color: S.Slate500, marginTop: "16px" }}>
            Numbered pages, not infinite scroll, so a position is shareable and the footer stays reachable. Twelve per page.
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
