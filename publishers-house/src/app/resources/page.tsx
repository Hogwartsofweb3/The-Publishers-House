import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Teachings & Resources | The Publishers House",
  description:
    "Every message preached in this house, searchable by title, series, speaker or Scripture reference.",
};

const S = {
  eyebrow: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  colophon: { fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  displayXL: { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 58px)", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  displayS: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(16px, 2.5vw, 21px)", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  readLede: { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
  readSmall: { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
};

// Sample sermon data from Figma: #31:4587 teaching cards (Foundations series)
const sermons = [
  {
    series: "Foundations · Part eight",
    title: "A workman unashamed",
    desc: "What Paul asks of anyone who handles Scripture in public, and why accuracy is love before it is scholarship.",
    scripture: "2 Timothy 2:15",
    speaker: "Dr. Joshua Agunbiade",
    duration: "48:12",
    youtubeUrl: "https://www.youtube.com/watch?v=XwHiPOaPwOs",
  },
  {
    series: "Foundations · Part seven",
    title: "A vessel unto honour",
    desc: "What it costs to be usable.",
    scripture: "2 Timothy 2:21",
    speaker: "Dr. Joshua Agunbiade",
    duration: "51:33",
    youtubeUrl: "https://www.youtube.com/watch?v=9-XCPRb7ctA",
  },
  {
    series: "Foundations · Part six",
    title: "Study to shew thyself",
    desc: "On the discipline behind public teaching.",
    scripture: "2 Timothy 2:15",
    speaker: "Dr. Joshua Agunbiade",
    duration: "44:10",
    youtubeUrl: "https://www.youtube.com/watch?v=X_U9b85Vl0M",
  },
  {
    series: "Foundations",
    title: "The Scriptures",
    desc: "Why the sixty-six books are the final word, and what it means to trust them completely.",
    scripture: "2 Timothy 3:16",
    speaker: "Dr. Joshua Agunbiade",
    duration: "52:00",
    youtubeUrl: "https://www.youtube.com/watch?v=SUAnI9yLuWk",
  },
  {
    series: "Foundations",
    title: "The Holy Spirit",
    desc: "How the Spirit is at work now — illuminating, sanctifying and empowering.",
    scripture: "1 Corinthians 12:7",
    speaker: "Dr. Joshua Agunbiade",
    duration: "56:40",
    youtubeUrl: "https://www.youtube.com/watch?v=VbySJaL8V5I",
  },
  {
    series: "Foundations",
    title: "The apostolic mandate",
    desc: "What the ascension gifts are for and why the church cannot function without them.",
    scripture: "Ephesians 4:11",
    speaker: "Dr. Joshua Agunbiade",
    duration: "49:21",
    youtubeUrl: "https://www.youtube.com/watch?v=2E1WKzvqKEA",
  },
];

// Filter tabs from Figma: #31:4569
const tabs = ["All", "Series", "Conferences", "Latest"];

export default function ResourcesPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>

        {/* ══════════════════════════════════════════════════════════
            HERO — Figma: #31:4562 — layout_56aa83c5
            "Teachings and resources"
        ══════════════════════════════════════════════════════════ */}
        <section
          style={{
            background: "#151A54",
            padding: "90px 100px",
          }}
        >
          <div style={{ maxWidth: "1440px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "18px" }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#D3DAEC" }}>
              2 Timothy 2:15
            </span>
            <h1 style={{ ...S.displayXL, color: "#FFFFFF", maxWidth: "1000px" }}>
              Teachings and resources
            </h1>
            <p style={{ ...S.readLede, color: "#E8ECF7", maxWidth: "760px" }}>
              Every message preached in this house, searchable by title, series, speaker or Scripture reference.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            ARCHIVE — Figma: #31:4566
            padding 72px 100px 96px, bg Paper/300 (#D3DAEC)
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: "#D3DAEC" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "72px 100px 96px",
              display: "flex",
              flexDirection: "column",
              gap: "28px",
            }}
          >
            {/* Search bar — Figma: #31:4567 */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignSelf: "stretch",
                padding: "0 20px",
                alignItems: "center",
                height: "56px",
                background: "#FFFFFF",
                border: "1px solid #99AFC6",
                borderRadius: "2px",
              }}
            >
              <span style={{ ...S.readLede, color: "#99AFC6", fontSize: "17px" }}>
                Search by title, series, speaker or Scripture, for example Hebrews 4
              </span>
            </div>

            {/* Filter tabs — Figma: #31:4569 */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "30px",
                paddingBottom: "14px",
                borderBottom: "1px solid #D3DAEC",
              }}
            >
              {tabs.map((tab, i) => (
                <span
                  key={tab}
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: i === 0 ? 700 : 400,
                    fontSize: "15px",
                    lineHeight: "1.5em",
                    letterSpacing: "0.02em",
                    color: i === 0 ? "#151A54" : "#4A62A0",
                    cursor: "pointer",
                    borderBottom: i === 0 ? "2px solid #151A54" : "2px solid transparent",
                    paddingBottom: "12px",
                    marginBottom: "-15px",
                  }}
                >
                  {tab}
                </span>
              ))}
            </div>

            {/* Series filter chips — Figma: #31:4574 */}
            <div style={{ display: "flex", flexDirection: "row", gap: "8px", flexWrap: "wrap" as const }}>
              {["Foundations", "Festival of Light", "Merismos", "The Forge", "Jesus Convention"].map((series, i) => (
                <div
                  key={series}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 14px",
                    height: "40px",
                    background: i === 0 ? "#151A54" : "#FFFFFF",
                    border: `1px solid ${i === 0 ? "#151A54" : "#99AFC6"}`,
                    borderRadius: "999px",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ ...S.eyebrow, color: i === 0 ? "#FFFFFF" : "#4A62A0" }}>{series}</span>
                </div>
              ))}
            </div>

            {/* Sermon cards grid — Figma: #31:4587 Row of 3 cards */}
            <div style={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: "wrap" as const }}>
              {sermons.map((sermon) => (
                <a
                  key={sermon.title}
                  href={sermon.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
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
                    textDecoration: "none",
                    transition: "box-shadow 200ms ease",
                  }}
                >
                  {/* Thumbnail plate */}
                  <div
                    style={{
                      height: "190px",
                      background: "#E8ECF7",
                      border: "1px solid #6496EF",
                      borderRadius: "4px",
                      margin: "12px 12px 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ ...S.eyebrow, color: "#6496EF" }}>▶ YouTube</span>
                  </div>

                  <div style={{ padding: "0 22px 22px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ ...S.eyebrow, color: "#0140C1" }}>{sermon.series}</span>
                    <span style={{ ...S.displayS, color: "#151A54" }}>{sermon.title}</span>
                    <p style={{ ...S.readSmall, color: "#4A62A0" }}>{sermon.desc}</p>

                    {/* Colophon row */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap" as const,
                        gap: "5px 12px",
                        paddingTop: "10px",
                        borderTop: "1px solid #151A54",
                      }}
                    >
                      <span style={{ ...S.colophon, color: "#0140C1" }}>{sermon.scripture}</span>
                      <span style={{ ...S.colophon, color: "#C0C9E0" }}>·</span>
                      <span style={{ ...S.colophon, color: "#4A62A0" }}>{sermon.speaker}</span>
                      <span style={{ ...S.colophon, color: "#C0C9E0" }}>·</span>
                      <span style={{ ...S.colophon, color: "#4A62A0" }}>{sermon.duration}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
