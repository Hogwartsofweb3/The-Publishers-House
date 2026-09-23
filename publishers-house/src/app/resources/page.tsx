

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSermons, type Sermon } from "@/lib/firebase";

export const revalidate = 0; // Always fetch fresh — no caching

export const metadata: Metadata = {
  title: "Resources | The Publishers House",
  description: "Sermons, teachings and transcripts from The Publishers House.",
};

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
  displayXL: { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "clamp(36px,5vw,58px)", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  displayM:  { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "26px", lineHeight: "1.14em", letterSpacing: "-0.015em", textTransform: "uppercase" as const },
  displayS:  { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "17px", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  eyebrow:   { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  label:     { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  colophon:  { fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  readBody:  { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "15px", lineHeight: "1.6em" },
  readLede:  { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "20px", lineHeight: "1.5em" },
  epigraph:  { fontFamily: "var(--font-playfair)", fontWeight: 400, fontStyle: "italic" as const, fontSize: "clamp(24px,3vw,36px)", lineHeight: "1.3em" },
  button:    { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
};

import SermonCard from "@/components/SermonCard";

export default async function ResourcesPage() {
  // Fetch live sermons from Firestore
  let sermons: Sermon[] = [];
  try {
    sermons = await getSermons(24);
  } catch (e) {
    console.error("Failed to fetch sermons:", e);
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>

        {/* ── HERO ──────────────────────────────────────────────── */}
        <section
          className="tph-hero"
          style={{
            background: Navy,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/hero.jpg')", backgroundSize: "cover", backgroundPosition: "center top", zIndex: 0, opacity: 0.18 }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ ...T.eyebrow, color: Blue300, marginBottom: "12px" }}>Resources</div>
            <h1 style={{ ...T.displayXL, color: White, margin: "0 0 16px" }}>The Published Word</h1>
            <p style={{ ...T.epigraph, color: "rgba(255,255,255,0.8)", margin: 0, maxWidth: "560px" }}>
              Study to shew thyself approved unto God.
            </p>
            <div style={{ ...T.colophon, color: Blue300, marginTop: "8px" }}>2 Timothy 2:15</div>
          </div>
        </section>

        {/* ── SERMONS GRID ──────────────────────────────────────── */}
        <section className="tph-section" style={{ backgroundColor: Paper100 }}>

          {sermons.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ ...T.eyebrow, color: Slate500, marginBottom: "16px" }}>Coming Soon</div>
              <h2 style={{ ...T.displayM, color: Navy, margin: "0 0 12px" }}>Teachings Loading</h2>
              <p style={{ ...T.readBody, color: Slate600 }}>Sermons are being published through the CMS. Check back soon.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                  <div style={{ ...T.eyebrow, color: Blue500, marginBottom: "8px" }}>All Teachings</div>
                  <h2 style={{ ...T.displayM, color: Navy, margin: 0 }}>{sermons.length} Teaching{sermons.length !== 1 ? "s" : ""}</h2>
                </div>
              </div>
              <div className="tph-grid-3">
                {sermons.map((sermon) => (
                  <SermonCard key={sermon.id} sermon={sermon} />
                ))}
              </div>
            </>
          )}
        </section>

      </main>
      <Footer />
    </>
  );
}
