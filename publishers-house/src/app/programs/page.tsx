import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Programs | The Publishers House",
  description:
    "Two weekly gatherings, three annual conferences and two monthly intensives. Every one exists to put the Word into the hands of believers.",
};

const S = {
  eyebrow: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  colophon: { fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  displayXL: { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 58px)", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  displayS: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(16px, 2.5vw, 21px)", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  readLede: { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
  readSmall: { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
};

// Programs from Figma: #27:1821 Grid — all 6 program cards
const programs = [
  {
    frequency: "Annual homecoming conference",
    name: "Festival of Light",
    desc: "Believers from across the world gather for worship, sound teaching, Holy Ghost expressions and fellowship.",
    scripture: "Isaiah 60:1",
    cadence: "Annual",
    location: "Jos",
    logoImage: "/images/fol-logo.png",
  },
  {
    frequency: "Annual conference",
    name: "Merismos",
    desc: "A power-packed encounter where the Word is rightly taught and the Holy Spirit moves tangibly to transform lives.",
    scripture: "Hebrews 4:12",
    cadence: "Annual",
    location: "Jos",
    logoImage: "/images/merismos-logo.png",
  },
  {
    frequency: "Annual · Easter",
    name: "Jesus Convention",
    desc: "Unveiling the person, finished work and lordship of Jesus Christ through sound teaching, prayer and worship.",
    scripture: "Philippians 3:10",
    cadence: "Easter",
    location: "Jos",
    logoImage: "/images/jc-logo.png",
  },
  {
    frequency: "Monthly · end of month",
    name: "The Forge",
    desc: "An intensive prayer gathering running Wednesday to Friday and culminating in an overnight vigil.",
    scripture: "Jeremiah 23:29",
    cadence: "Monthly",
    location: "Jos",
    logoImage: "/images/forge-logo.png",
  },
  {
    frequency: "Monthly · Abuja",
    name: "Abuja Apostolic Camp",
    desc: "An intense spiritual camp focused on equipping believers, prophetic words and deep spiritual alignment.",
    scripture: "Ephesians 4:11",
    cadence: "Monthly",
    location: "Abuja",
    logoImage: "/images/aac-logo.png",
  },
  {
    frequency: "Every week",
    name: "Sunday and midweek",
    desc: "Sunday worship at 9:00 AM is the core weekly gathering. Thursday at 5:00 PM is doctrine and corporate prayer.",
    scripture: "Acts 2:42",
    cadence: "Weekly",
    location: "Jos",
    logoImage: "/images/tph-logo.png",
  },
];

export default function ProgramsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>

        {/* ══════════════════════════════════════════════════════════
            HERO — Figma: #27:1817 — layout_56aa83c5
            "Flagship programs"
        ══════════════════════════════════════════════════════════ */}
        <section
          style={{
            background: "#151A54",
            padding: "90px 100px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div style={{ maxWidth: "1440px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "18px" }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#D3DAEC" }}>
              Ephesians 4:12
            </span>
            <h1 style={{ ...S.displayXL, color: "#FFFFFF", maxWidth: "1000px" }}>
              Flagship programs
            </h1>
            <p style={{ ...S.readLede, color: "#E8ECF7", maxWidth: "760px" }}>
              Two weekly gatherings, three annual conferences and two monthly intensives. Every one exists to put the Word into the hands of believers.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            PROGRAMS GRID — Figma: #27:1821
            padding 96px 100px, bg Paper/300 (#D3DAEC)
            Two rows of 3 cards each
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: "#D3DAEC" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "96px 100px",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: "20px",
            }}
          >
            {/* Row 1 */}
            <div style={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: "wrap" as const }}>
              {programs.slice(0, 3).map((prog) => (
                <ProgramCard key={prog.name} prog={prog} />
              ))}
            </div>

            {/* Row 2 */}
            <div style={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: "wrap" as const }}>
              {programs.slice(3).map((prog) => (
                <ProgramCard key={prog.name} prog={prog} />
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

function ProgramCard({ prog }: { prog: typeof programs[0] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        background: "#FFFFFF",
        border: "1px solid #D3DAEC",
        borderRadius: "4px",
        overflow: "hidden",
        flex: 1,
        minWidth: "280px",
      }}
    >
      {/* Plate — real logo image, top half only */}
      <div
        style={{
          height: "190px",
          overflow: "hidden",
          background: "#F4F6FB",
          borderRadius: "4px",
          margin: "12px 12px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={prog.logoImage}
          alt={prog.name}
          style={{
            width: "100%",
            height: "260px",
            objectFit: "contain",
            objectPosition: "center top",
            padding: "20px 28px",
          }}
        />
      </div>

      <div style={{ padding: "0 22px 22px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <span
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: "10px",
            lineHeight: "1.6em",
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "#0140C1",
          }}
        >
          {prog.frequency}
        </span>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "21px", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const, color: "#151A54" }}>
          {prog.name}
        </span>
        <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em", color: "#4A62A0" }}>
          {prog.desc}
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "5px 12px",
            paddingTop: "10px",
            borderTop: "1px solid #151A54",
          }}
        >
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#0140C1" }}>
            {prog.scripture}
          </span>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: "10.5px", color: "#C0C9E0" }}>·</span>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#4A62A0" }}>
            {prog.cadence}
          </span>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: "10.5px", color: "#C0C9E0" }}>·</span>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#4A62A0" }}>
            {prog.location}
          </span>
        </div>
      </div>
    </div>
  );
}
