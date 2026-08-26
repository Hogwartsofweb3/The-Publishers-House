import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "The Publishers House",
  description:
    "The Publishers House — a teaching-focused apostolic church in Jos, Plateau State. Led by Dr. Joshua Agunbiade.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens from Figma
// Display/XL  — Poppins ExtraBold 800, 72px, lh 0.98em, ls -0.02em, UPPER
// Display/L   — Poppins ExtraBold 800, 48px, lh 1.04em, ls -0.02em, UPPER
// Display/M   — Poppins Bold 700, 30px, lh 1.14em, ls -0.015em, UPPER
// Display/S   — Poppins Bold 700, 21px, lh 1.2em, ls -0.01em, UPPER
// Read/Lede   — Playfair Display Reg 400, 20px, lh 1.55em
// Read/Small  — Playfair Display Reg 400, 14.5px, lh 1.5em
// UI/Eyebrow  — Poppins SemiBold 600, 10px, lh 1.6em, ls 0.2em, UPPER
// UI/Label    — Poppins SemiBold 600, 11px, lh 1.6em, ls 0.16em, UPPER
// UI/Colophon — Poppins Medium 500, 10.5px, lh 1.6em, ls 0.1em, UPPER
// UI/Button   — Poppins SemiBold 600, 12px, lh 1em, ls 0.14em, UPPER
// UI/Scripture— Poppins SemiBold 600, 11px, lh 1.6em, ls 0.14em, UPPER
//
// Colors:
// Navy:  #151A54 | Slate/600: #4A62A0 | Blue/500: #2090FF | Blue/700: #0140C1
// Paper/100: #F4F6FB | Paper/200: #E8ECF7 | Paper/300: #D3DAEC | Paper/400: #C0C9E0
// ─────────────────────────────────────────────────────────────────────────────

const S = {
  eyebrow: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "10px",
    lineHeight: "1.6em",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
  },
  label: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "1.6em",
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
  },
  scripture: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "1.6em",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
  },
  colophon: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    fontSize: "10.5px",
    lineHeight: "1.6em",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  },
  button: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "1em",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
  },
  displayXL: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 800,
    fontSize: "clamp(40px, 6vw, 72px)",
    lineHeight: "0.98em",
    letterSpacing: "-0.02em",
    textTransform: "uppercase" as const,
  },
  displayL: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 800,
    fontSize: "clamp(32px, 5vw, 48px)",
    lineHeight: "1.04em",
    letterSpacing: "-0.02em",
    textTransform: "uppercase" as const,
  },
  displayM: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: "clamp(22px, 3vw, 30px)",
    lineHeight: "1.14em",
    letterSpacing: "-0.015em",
    textTransform: "uppercase" as const,
  },
  displayS: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: "clamp(17px, 2.5vw, 21px)",
    lineHeight: "1.2em",
    letterSpacing: "-0.01em",
    textTransform: "uppercase" as const,
  },
  readLede: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 400,
    fontSize: "20px",
    lineHeight: "1.55em",
  },
  readSmall: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 400,
    fontSize: "14.5px",
    lineHeight: "1.5em",
  },
  readBody: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 400,
    fontSize: "17px",
    lineHeight: "1.68em",
  },
};

// Reusable Button components
function BtnPrimary({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        ...S.button,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 26px",
        height: "48px",
        background: "#2090FF",
        border: "1px solid #2090FF",
        borderRadius: "2px",
        color: "#151A54",
        textDecoration: "none",
        transition: "background 150ms ease",
      }}
    >
      {children}
    </Link>
  );
}

function BtnOutline({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        ...S.button,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 26px",
        height: "48px",
        background: "transparent",
        border: `1px solid ${dark ? "#E8ECF7" : "#151A54"}`,
        borderRadius: "2px",
        color: dark ? "#E8ECF7" : "#151A54",
        textDecoration: "none",
        transition: "all 150ms ease",
      }}
    >
      {children}
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>

        {/* ══════════════════════════════════════════════════════════
            HERO — Figma: Full-bleed image, navy overlay
            layout_56aa83c5: column, padding 90px 100px, gap 18px
        ══════════════════════════════════════════════════════════ */}
        <section
          style={{
            position: "relative",
            minHeight: "90vh",
            display: "flex",
            alignItems: "center",
            background: "#151A54",
            overflow: "hidden",
          }}
        >
          {/* Background image overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(21,26,84,0.92) 0%, rgba(21,26,84,0.75) 100%)",
              zIndex: 1,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "90px 100px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              width: "100%",
            }}
          >
            {/* UI/Scripture — "Plan your visit" button area */}
            <div style={{ display: "flex", flexDirection: "row", gap: "12px" }}>
              <Link
                href="/about"
                style={{
                  ...S.button,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 26px",
                  height: "48px",
                  background: "transparent",
                  border: "1px solid #FFFFFF",
                  borderRadius: "2px",
                  color: "#151A54",
                  backgroundColor: "#FFFFFF",
                  textDecoration: "none",
                }}
              >
                Plan your visit
              </Link>
            </div>

            {/* Display/XL headline */}
            <h1 style={{ ...S.displayXL, color: "#FFFFFF", maxWidth: "700px" }}>
              The Publishers House
            </h1>

            {/* Read/Lede — subtext */}
            <p
              style={{
                ...S.readLede,
                color: "#E8ECF7",
                maxWidth: "500px",
              }}
            >
              A teaching-focused apostolic church. Accurate doctrine, Spirit-filled community.
            </p>

            {/* Next gatherings strip — Figma: EL-334edf6b */}
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                padding: "16px 32px",
                alignItems: "center",
                gap: "6px",
                border: "1px solid #E8ECF7",
                borderRadius: "0px",
                marginTop: "8px",
                alignSelf: "flex-start",
              }}
            >
              <span style={{ ...S.eyebrow, color: "#0140C1" }}>Next gatherings</span>
              {/* Service cards row */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignSelf: "stretch" }}>
                  {/* Thursday service */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "22px",
                      alignItems: "stretch",
                      gap: "14px",
                      background: "#FFFFFF",
                      border: "1px solid #D3DAEC",
                      borderRadius: "4px",
                      flex: 1,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
                      {/* Date box */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "2px",
                          width: "64px",
                          height: "64px",
                          border: "1px solid #151A54",
                          borderRadius: "2px",
                        }}
                      >
                        <span style={{ ...S.eyebrow, color: "#0140C1" }}>Thu</span>
                        <span
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 700,
                            fontSize: "25px",
                            lineHeight: "1.5em",
                            letterSpacing: "0.02em",
                            color: "#151A54",
                          }}
                        >
                          13
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: "8px", flex: 1 }}>
                        <p style={{ ...S.readSmall, color: "#4A62A0" }}>
                          Doctrine, spiritual re-alignment and corporate prayer.
                        </p>
                      </div>
                    </div>
                    {/* Colophon row */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap" as const,
                        gap: "5px 12px",
                        paddingTop: "10px",
                        borderTop: "1px solid #151A54",
                        alignSelf: "stretch",
                      }}
                    >
                      <span style={{ ...S.colophon, color: "#0140C1" }}>2 Timothy 3:16</span>
                      <span style={{ ...S.colophon, color: "#C0C9E0" }}>·</span>
                      <span style={{ ...S.colophon, color: "#4A62A0" }}>5:00 PM</span>
                      <span style={{ ...S.colophon, color: "#4A62A0" }}>Jos</span>
                    </div>
                  </div>

                  {/* Sunday service */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "22px",
                      alignItems: "stretch",
                      gap: "14px",
                      background: "#FFFFFF",
                      border: "1px solid #D3DAEC",
                      borderRadius: "4px",
                      flex: 1,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "2px",
                          width: "64px",
                          height: "64px",
                          border: "1px solid #151A54",
                          borderRadius: "2px",
                        }}
                      >
                        <span style={{ ...S.eyebrow, color: "#0140C1" }}>Sun</span>
                        <span
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 700,
                            fontSize: "25px",
                            lineHeight: "1.5em",
                            color: "#151A54",
                          }}
                        >
                          16
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                        <p style={{ ...S.readSmall, color: "#4A62A0" }}>
                          Intense worship and in-depth teaching of the Word.
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap" as const,
                        gap: "5px 12px",
                        paddingTop: "10px",
                        borderTop: "1px solid #151A54",
                      }}
                    >
                      <span style={{ ...S.colophon, color: "#0140C1" }}>Colossians 3:16</span>
                      <span style={{ ...S.colophon, color: "#C0C9E0" }}>·</span>
                      <span style={{ ...S.colophon, color: "#4A62A0" }}>9:00 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            LATEST TEACHING — Figma: EL-8f527725
            layout_a50cdbe1: column, padding 96px 100px, gap 32px, bg #E8ECF7
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: "#E8ECF7" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "96px 100px",
              display: "flex",
              flexDirection: "column",
              gap: "32px",
            }}
          >
            <span style={{ ...S.eyebrow, color: "#0140C1" }}>The latest teaching</span>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px", flexWrap: "wrap" as const }}>
              {/* Listen button */}
              <Link
                href="/resources"
                style={{
                  ...S.button,
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 26px",
                  height: "48px",
                  background: "#151A54",
                  border: "none",
                  borderRadius: "2px",
                  color: "#FFFFFF",
                  textDecoration: "none",
                }}
              >
                Listen · 48:12
              </Link>
              {/* Read transcript button */}
              <Link
                href="/resources"
                style={{
                  ...S.button,
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 26px",
                  height: "48px",
                  background: "transparent",
                  border: "1px solid #151A54",
                  borderRadius: "2px",
                  color: "#151A54",
                  textDecoration: "none",
                }}
              >
                Read the transcript
              </Link>
            </div>

            {/* Sermon info */}
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "5px 12px" }}>
              <span style={{ ...S.colophon, color: "#0140C1" }}>2 Timothy 2:15</span>
              <span style={{ ...S.colophon, color: "#C0C9E0" }}>·</span>
              <span style={{ ...S.colophon, color: "#4A62A0" }}>Foundations</span>
              <span style={{ ...S.colophon, color: "#C0C9E0" }}>·</span>
              <span style={{ ...S.colophon, color: "#4A62A0" }}>Dr. Joshua Agunbiade</span>
              <span style={{ ...S.colophon, color: "#C0C9E0" }}>·</span>
              <span style={{ ...S.colophon, color: "#4A62A0" }}>48:12</span>
            </div>

            {/* Series label */}
            <span style={{ ...S.eyebrow, color: "#0140C1" }}>Foundations · Part eight</span>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            BUILDING PROJECT — Centre stage as requested by Pastor Josh
            Prominent CTA with background image overlay
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: "#151A54", position: "relative", overflow: "hidden" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "96px 100px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <span style={{ ...S.eyebrow, color: "#6496EF" }}>Our Building Project</span>
            <h2 style={{ ...S.displayL, color: "#FFFFFF", maxWidth: "700px" }}>
              We are building
            </h2>
            <p style={{ ...S.readLede, color: "#E8ECF7", maxWidth: "600px" }}>
              The Publishers House is building its home in Jos. We believe by God&apos;s grace it will be ready before Festival of Light, October 28 – November 1.
            </p>
            <p style={{ ...S.readSmall, color: "#99AFC6", maxWidth: "600px" }}>
              Join us and partner with us in this great work.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" as const, marginTop: "8px" }}>
              <a
                href="https://forms.gle/4Gimdh1WcUerMQvVA"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...S.button,
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 26px",
                  height: "48px",
                  background: "#2090FF",
                  border: "1px solid #2090FF",
                  borderRadius: "2px",
                  color: "#151A54",
                  textDecoration: "none",
                }}
              >
                Partner with us
              </a>
              <Link
                href="/giving"
                style={{
                  ...S.button,
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 26px",
                  height: "48px",
                  background: "transparent",
                  border: "1px solid #E8ECF7",
                  borderRadius: "2px",
                  color: "#E8ECF7",
                  textDecoration: "none",
                }}
              >
                See more on our Building Project
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            FLAGSHIP PROGRAMS — Figma: EL-b93384d7
            layout_b94af0f4: column, padding 96px 100px, gap 18px
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: "#FFFFFF" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "96px 100px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <span style={{ ...S.eyebrow, color: "#0140C1" }}>Flagship programs</span>

            {/* Programs grid — Figma: EL-87843322 program cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                marginTop: "8px",
              }}
            >
              {[
                {
                  frequency: "Annual homecoming conference",
                  name: "Festival of Light",
                  desc: "Believers from across the world gather for worship, sound teaching, Holy Ghost expressions and fellowship.",
                  scripture: "Isaiah 60:1",
                  cadence: "Annual",
                  href: "/events",
                },
                {
                  frequency: "Annual conference",
                  name: "Merismos",
                  desc: "A power-packed encounter where the Word is rightly taught and the Holy Spirit moves tangibly to transform lives.",
                  scripture: "Hebrews 4:12",
                  cadence: "Annual",
                  href: "/events",
                },
                {
                  frequency: "Annual · Easter",
                  name: "Jesus Convention",
                  desc: "Unveiling the person, finished work and lordship of Jesus Christ through sound teaching, prayer and worship.",
                  scripture: "Philippians 3:10",
                  cadence: "Easter",
                  href: "/events",
                },
                {
                  frequency: "Monthly · end of month",
                  name: "The Forge",
                  desc: "An intensive prayer gathering running Wednesday to Friday and culminating in an overnight vigil.",
                  scripture: "Jeremiah 23:29",
                  cadence: "Monthly",
                  href: "/programs",
                },
                {
                  frequency: "Monthly · Abuja",
                  name: "Abuja Apostolic Camp",
                  desc: "An intense spiritual camp focused on equipping believers, prophetic words and deep spiritual alignment.",
                  scripture: "Ephesians 4:11",
                  cadence: "Monthly",
                  href: "/programs",
                },
                {
                  frequency: "Every week",
                  name: "Sunday and midweek",
                  desc: "Sunday worship at 9:00 AM is the core weekly gathering. Thursday at 5:00 PM is doctrine and corporate prayer.",
                  scripture: "Acts 2:42",
                  cadence: "Weekly",
                  href: "/about",
                },
              ].map((prog) => (
                <Link
                  key={prog.name}
                  href={prog.href}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "22px",
                    gap: "12px",
                    background: "#FFFFFF",
                    border: "1px solid #D3DAEC",
                    borderRadius: "4px",
                    textDecoration: "none",
                    transition: "box-shadow 200ms ease",
                  }}
                >
                  {/* Program image placeholder */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "190px",
                      background: "#E8ECF7",
                      borderRadius: "4px",
                    }}
                  />
                  <span style={{ ...S.eyebrow, color: "#0140C1" }}>{prog.frequency}</span>
                  <span style={{ ...S.displayS, color: "#151A54" }}>{prog.name}</span>
                  <p style={{ ...S.readSmall, color: "#4A62A0" }}>{prog.desc}</p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap" as const,
                      gap: "5px 12px",
                      paddingTop: "10px",
                      borderTop: "1px solid #151A54",
                    }}
                  >
                    <span style={{ ...S.colophon, color: "#0140C1" }}>{prog.scripture}</span>
                    <span style={{ ...S.colophon, color: "#C0C9E0" }}>·</span>
                    <span style={{ ...S.colophon, color: "#4A62A0" }}>{prog.cadence}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            GIVING SECTION — Figma: EL-11f7e0f8
            bg navy, giving categories, bank account CTAs
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: "#151A54" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "96px 100px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <span style={{ ...S.scripture, color: "#E8ECF7" }}>Giving</span>
            <h2 style={{ ...S.displayM, color: "#FFFFFF" }}>Give now</h2>

            {/* Giving category buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
              {["Tithe", "Offering", "Special projects", "Thanksgiving"].map((cat) => (
                <Link
                  key={cat}
                  href="/giving"
                  style={{
                    ...S.label,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "240px",
                    height: "60px",
                    border: "1px solid #F4F6FB",
                    borderRadius: "2px",
                    color: "#FFFFFF",
                    textDecoration: "none",
                    transition: "background 150ms ease",
                  }}
                >
                  {cat}
                </Link>
              ))}
            </div>

            <Link
              href="/giving"
              style={{
                ...S.button,
                display: "inline-flex",
                alignItems: "center",
                padding: "0 26px",
                height: "48px",
                background: "transparent",
                border: "1px solid #E8ECF7",
                borderRadius: "2px",
                color: "#E8ECF7",
                textDecoration: "none",
                marginTop: "8px",
                alignSelf: "flex-start",
              }}
            >
              See account details
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            WHAT TO EXPECT / PLAN YOUR VISIT
            Figma: EL-cdaacbb3 — padding 96px 100px, bg Paper/300 (#D3DAEC)
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: "#D3DAEC" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "96px 100px",
              display: "flex",
              flexDirection: "column",
              gap: "40px",
            }}
          >
            {/* Two column row */}
            <div style={{ display: "flex", flexDirection: "row", gap: "56px", alignSelf: "stretch", flexWrap: "wrap" as const }}>
              {/* Left col */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", flex: 1 }}>
                {/* When we meet card */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "22px",
                    gap: "8px",
                    background: "#FFFFFF",
                    border: "1px solid #D3DAEC",
                    borderRadius: "4px",
                  }}
                >
                  <span style={{ ...S.displayS, color: "#151A54" }}>When we meet</span>
                  <p style={{ ...S.readSmall, color: "#4A62A0" }}>
                    Sunday worship at 9:00 AM. Midweek teaching service Thursday at 5:00 PM. Both run to roughly two hours.
                  </p>
                </div>

                {/* Where to find us */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "22px",
                    gap: "8px",
                    background: "#FFFFFF",
                    border: "1px solid #D3DAEC",
                    borderRadius: "4px",
                  }}
                >
                  <span style={{ ...S.displayS, color: "#151A54" }}>Where to find us</span>
                  <p style={{ ...S.readSmall, color: "#4A62A0" }}>
                    The House of Bread, Korinjoh House, British, Jos. There is parking on the compound.
                  </p>
                </div>
              </div>

              {/* Right col */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", flex: 1 }}>
                {/* What to wear */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "22px",
                    gap: "8px",
                    background: "#FFFFFF",
                    border: "1px solid #D3DAEC",
                    borderRadius: "4px",
                  }}
                >
                  <span style={{ ...S.displayS, color: "#151A54" }}>What to wear</span>
                  <p style={{ ...S.readSmall, color: "#4A62A0" }}>
                    Come as you are, and comfortably dressed as well. You will see everything from traditional dress to jeans, and nobody is counting. All we encourage is modesty.
                  </p>
                </div>

                {/* Bring your Bible */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "22px",
                    gap: "8px",
                    background: "#FFFFFF",
                    border: "1px solid #D3DAEC",
                    borderRadius: "4px",
                  }}
                >
                  <span style={{ ...S.displayS, color: "#151A54" }}>Bring your Bible</span>
                  <p style={{ ...S.readSmall, color: "#4A62A0" }}>
                    This is a teaching ministry. Most people arrive with a Bible and a notebook, and you will want both.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <BtnPrimary href="/about">Plan your visit</BtnPrimary>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
