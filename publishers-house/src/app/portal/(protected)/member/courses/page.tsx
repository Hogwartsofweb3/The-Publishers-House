"use client";

import Link from "next/link";
import { TRACK_DETAILS } from "@/lib/cmsDefaults";

export default function MemberGrowthTrackPage() {
  const tracks = Object.entries(TRACK_DETAILS);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
          Discipleship &amp; Equipping · Psalm 68:11
        </div>
        <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 32px)", color: "#141C6E", margin: 0 }}>
          Growth Track &amp; Biblical Curriculum
        </h1>
        <p style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontStyle: "italic", fontSize: "14.5px", color: "#4A5490", marginTop: "6px" }}>
          Structured doctrinal courses designed to root believers in sound biblical theology, prayer, and kingdom impact.
        </p>
      </div>

      {/* Pillars Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        {[
          { step: "01", title: "Sound Doctrine", desc: "Understanding the core tenets of the Christian faith and biblical truth." },
          { step: "02", title: "Prayer & Intercession", desc: "Cultivating a deep secret place and prevailing intercessory grace." },
          { step: "03", title: "Living Publications", desc: "Reflecting the life of Christ through personal integrity and character." },
          { step: "04", title: "Ministry Service", desc: "Deploying spiritual gifts in ministry units to build up the church." },
        ].map((p) => (
          <div
            key={p.step}
            style={{
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#2090FF", marginBottom: "6px" }}>
              STAGE {p.step}
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#141C6E", marginBottom: "6px" }}>
              {p.title}
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", lineHeight: "1.55em" }}>
              {p.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Available Curriculum Tracks */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 700, color: "#141C6E", margin: 0 }}>
              Curriculum Modules &amp; Study Tracks
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0" }}>
              Each course contains structured video lectures, audio recordings, and downloadable PDF notes.
            </p>
          </div>
          <span style={{ fontSize: "12px", color: "#2090FF", fontWeight: 700 }}>
            {tracks.length} Tracks Active
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {tracks.map(([slug, track], idx) => (
            <div
              key={slug}
              style={{
                borderRadius: "10px",
                border: "1px solid #E4ECF9",
                backgroundColor: "#F8FAFD",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#0140C1", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Module {idx + 1}
                  </span>
                  <span style={{ fontSize: "11px", color: "#747CA1", fontWeight: 600 }}>
                    {track.materials.length} Lessons
                  </span>
                </div>
                <h3 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "16px", fontWeight: 700, color: "#141C6E", margin: "0 0 6px" }}>
                  {track.title}
                </h3>
                <p style={{ fontSize: "12px", color: "#4A5490", margin: "0 0 10px", lineHeight: "1.5em" }}>
                  {track.lede}
                </p>
                <div style={{ fontSize: "11px", color: "#2090FF", fontWeight: 600 }}>
                  {track.scripture}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", borderTop: "1px solid #E8EDFB", paddingTop: "14px" }}>
                <Link
                  href={`/resources/${slug}`}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "9px 14px",
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Start Course →
                </Link>
                <Link
                  href={`/resources/${slug}#curriculum`}
                  style={{
                    padding: "9px 14px",
                    backgroundColor: "#FFFFFF",
                    color: "#141C6E",
                    border: "1px solid #D5DCF2",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Materials
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
