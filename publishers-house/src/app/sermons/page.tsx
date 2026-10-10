

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSermons, type Sermon } from "@/lib/firebase";
import SermonsClient from "./SermonsClient";

export const revalidate = 0; // Always fetch fresh — no caching

export const metadata: Metadata = {
  title: "Sermons & Teachings | The Publishers House",
  description:
    "Browse every sermon preached at The Publishers House — searchable by title, series, speaker, and Scripture reference. Watch on YouTube, listen, or download.",
  openGraph: {
    title: "Sermons & Teachings | The Publishers House",
    description:
      "Every message preached at The Publishers House. Search by title, speaker, series, or Scripture.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Sermons – The Publishers House" }],
  },
};

const Navy    = "#151A54";
const White   = "#FFFFFF";

const T = {
  displayXL: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "clamp(36px,5vw,58px)", lineHeight: "0.98em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  eyebrow:   { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  readLede:  { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "20px", lineHeight: "1.5em" },
};

export default async function SermonsPage() {
  // Fetch live sermons from Firestore
  let sermons: Sermon[] = [];
  try {
    sermons = await getSermons(1000);
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
            justifyContent: "center",
            padding: "80px 100px",
            position: "relative",
            overflow: "hidden",
            minHeight: "360px"
          }}
        >
          {/* We use the same image but styled as dark blue overlay like the mockup */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/sermon-hero-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center", zIndex: 0, opacity: 0.15, mixBlendMode: "luminosity" }} />
          
          <div style={{ position: "relative", zIndex: 2, maxWidth: "800px" }}>
            <div style={{ ...T.eyebrow, color: "rgba(255,255,255,0.7)", marginBottom: "16px" }}>2 TIMOTHY 2:15</div>
            <h1 style={{ ...T.displayXL, color: White, margin: "0 0 16px" }}>Teachings and<br/>Resources</h1>
            <p style={{ ...T.readLede, color: "rgba(255,255,255,0.85)", margin: 0, maxWidth: "600px" }}>
              Every message preached in this house, searchable by title, series, speaker or Scripture reference.
            </p>
          </div>
        </section>

        {/* ── SERMONS GRID (Client Component) ────────────────── */}
        <SermonsClient initialSermons={sermons} />

      </main>
      <Footer />
    </>
  );
}
