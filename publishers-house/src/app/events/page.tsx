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

function EventRow({ day, month, title, desc, time, location, city, buttonLabel, isPrimary }: { day: string, month: string, title: string, desc: string, time: string, location: string, city: string, buttonLabel: string, isPrimary?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr auto",
        gap: "40px",
        alignItems: "center",
        padding: "40px 0",
        borderBottom: `1px solid ${S.Paper300}`
      }}
    >
      {/* Date mark */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ ...S.DisplayM, color: S.Blue500 }}>{day}</div>
        <div style={{ ...S.UIEyebrow, color: S.Slate500 }}>{month}</div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h3 style={{ ...S.DisplayS, color: S.Navy }}>{title}</h3>
        <p style={{ ...S.ReadSmall, color: S.Slate600, maxWidth: "600px" }}>{desc}</p>
        
        {/* Colophon */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          <span style={{ ...S.UIColophon, color: S.Slate600 }}>{time}</span>
          <span style={{ ...S.UIColophon, color: S.Paper400 }}>·</span>
          <span style={{ ...S.UIColophon, color: S.Slate600 }}>{location}</span>
          <span style={{ ...S.UIColophon, color: S.Paper400 }}>·</span>
          <span style={{ ...S.UIColophon, color: S.Slate600 }}>{city}</span>
        </div>
      </div>

      {/* Button */}
      <button
        style={{
          ...S.Button,
          ...S.UIButton,
          backgroundColor: isPrimary ? S.Blue700 : "transparent",
          color: isPrimary ? S.White : S.Navy,
          border: isPrimary ? "none" : `1px solid ${S.Paper300}`,
          cursor: "pointer"
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export default function EventsPage() {
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
          <div style={{ ...S.UIScripture, color: S.Blue500 }}>Acts 2:42</div>
          <h1 style={{ ...S.DisplayXL, color: S.Navy }}>Events and gatherings</h1>
          <p style={{ ...S.ReadLede, color: S.Slate600, maxWidth: "720px" }}>
            Every gathering in Jos and Abuja, with the weekly services and the flagship programmes in one list.
          </p>
        </section>

        {/* List */}
        <section
          style={{
            padding: "72px 100px 96px",
            backgroundColor: S.White,
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}
        >
          {/* Filters */}
          <div style={{ display: "flex", gap: "12px", borderBottom: `1px solid ${S.Paper200}`, paddingBottom: "16px" }}>
            <button style={{ ...S.UILabel, color: S.White, backgroundColor: S.Navy, padding: "8px 16px", borderRadius: "32px", border: "none" }}>All</button>
            <button style={{ ...S.UILabel, color: S.Slate600, backgroundColor: "transparent", padding: "8px 16px", borderRadius: "32px", border: "none" }}>Jos</button>
            <button style={{ ...S.UILabel, color: S.Slate600, backgroundColor: "transparent", padding: "8px 16px", borderRadius: "32px", border: "none" }}>Abuja</button>
            <button style={{ ...S.UILabel, color: S.Slate600, backgroundColor: "transparent", padding: "8px 16px", borderRadius: "32px", border: "none" }}>Online</button>
            <button style={{ ...S.UILabel, color: S.Slate600, backgroundColor: "transparent", padding: "8px 16px", borderRadius: "32px", border: "none" }}>Flagship</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <EventRow
              day="THU"
              month="WEEKLY"
              title="Midweek service"
              desc="An in-depth teaching and discipleship gathering focused on biblical understanding, spiritual maturity and practical Christian living."
              time="16:30"
              location="THE HOUSE OF BREAD"
              city="JOS"
              buttonLabel="View schedule"
              isPrimary={false}
            />
            <EventRow
              day="SUN"
              month="WEEKLY"
              title="Sunday worship service"
              desc="The core weekly gathering. Intense worship and in-depth teaching of the Word, grounding believers in accurate doctrine."
              time="08:00"
              location="THE HOUSE OF BREAD"
              city="JOS"
              buttonLabel="View schedule"
              isPrimary={false}
            />
            <EventRow
              day="26"
              month="AUG 2026"
              title="The Forge"
              desc="Wednesday to Friday of prayer, closing with the Friday overnight vigil."
              time="16:00"
              location="THE HOUSE OF BREAD"
              city="JOS"
              buttonLabel="Register now"
              isPrimary={true}
            />
            <EventRow
              day="04"
              month="SEP 2026"
              title="Abuja Apostolic Camp"
              desc="Equipping, prophetic ministry and deep spiritual alignment, held in the first two weeks of the month."
              time="17:00"
              location="TBD"
              city="ABUJA"
              buttonLabel="Register now"
              isPrimary={true}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
