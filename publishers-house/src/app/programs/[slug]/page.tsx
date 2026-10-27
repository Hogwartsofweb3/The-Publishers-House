import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgramEditionsClient from "./ProgramEditionsClient";
import { getSermons, type Sermon } from "@/lib/firebase";

export const revalidate = 60;

// ─── Per-program metadata & brand information ─────────────────────────────────

export interface ProgramInfo {
  slug: string;
  name: string;
  scripture: string;
  scriptureVerse: string;
  frequency: string;
  cadence: string;
  location: string;
  description: string;
  liveUrl?: string;
  logoImage?: string;
  bannerImage?: string;
}

const PROGRAM_REGISTRY: Record<string, ProgramInfo> = {
  "festival-of-light": {
    slug: "festival-of-light",
    name: "Festival of Light",
    scripture: "Isaiah 60:1",
    scriptureVerse: "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.",
    frequency: "Annual Homecoming Conference · October",
    cadence: "Annual",
    location: "Jos, Plateau State",
    description:
      "Each October, believers from across Nigeria and around the world gather in Jos for worship, sound apostolic teaching, Holy Ghost expressions, and corporate fellowship. Festival of Light is our annual homecoming gathering where the light of God's Word illuminates lives and sets hearts ablaze.",
    liveUrl: "https://www.youtube.com/@thepublishershouse",
    logoImage: "/images/Festival of Light logo (white).png",
    bannerImage: "/images/programs-hero.jpg",
  },
  "merismos": {
    slug: "merismos",
    name: "Merismos",
    scripture: "Hebrews 4:12",
    scriptureVerse: "For the word of God is quick, and powerful, and sharper than any twoedged sword, piercing even to the dividing asunder of soul and spirit...",
    frequency: "Annual Word & Power Conference",
    cadence: "Annual",
    location: "Jos, Plateau State",
    description:
      "A power-packed encounter where the Word of God is rightly taught and the Holy Spirit moves tangibly to transform lives. Merismos — the piercing, dividing, and discerning work of the Word — defines every edition as believers are established in accurate doctrine, spiritual power, and inward transformation.",
    liveUrl: "https://www.youtube.com/@thepublishershouse",
    logoImage: "/images/Merismos black.png",
    bannerImage: "/images/programs-hero.jpg",
  },
  "jesus-convention": {
    slug: "jesus-convention",
    name: "Jesus Convention",
    scripture: "Philippians 3:10",
    scriptureVerse: "That I may know him, and the power of his resurrection, and the fellowship of his sufferings, being made conformable unto his death.",
    frequency: "Annual Conference · Easter Weekend",
    cadence: "Easter",
    location: "Jos, Plateau State",
    description:
      "Every Easter, we gather to unveil the person, finished work, and eternal lordship of Jesus Christ through sound teaching, intensive prayer, and heartfelt corporate worship. Jesus Convention is a consecrated time of beholding the Lamb of God.",
    liveUrl: "https://www.youtube.com/@thepublishershouse",
    logoImage: "/images/Jesus Convention logo white.png",
    bannerImage: "/images/programs-hero.jpg",
  },
  "the-forge": {
    slug: "the-forge",
    name: "The Forge",
    scripture: "Jeremiah 23:29",
    scriptureVerse: "Is not my word like as a fire? saith the LORD; and like a hammer that breaketh the rock in pieces?",
    frequency: "Monthly Intensive · End of Month (Wed–Fri)",
    cadence: "Monthly",
    location: "The House of Bread, Jos",
    description:
      "An intensive prayer gathering running Wednesday through Friday and culminating in an overnight prayer vigil. The Forge is where men are tempered, consecrated, and empowered in prevailing intercession.",
    liveUrl: "https://www.youtube.com/@thepublishershouse",
    logoImage: "/images/THE FORGE 1.png",
    bannerImage: "/images/programs-hero.jpg",
  },
  "apostolic-camps": {
    slug: "apostolic-camps",
    name: "Apostolic Camps",
    scripture: "Ephesians 4:11",
    scriptureVerse: "And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers; for the perfecting of the saints...",
    frequency: "Monthly Apostolic Intensive · Second Weekend",
    cadence: "Monthly",
    location: "Abuja, FCT & Nationwide",
    description:
      "A close spiritual camp and apostolic intensive focused on equipping believers, prophetic alignment, and deep spiritual formation across Abuja and nationwide centers.",
    liveUrl: "https://www.youtube.com/@thepublishershouse",
    logoImage: "/images/TPH ABUJA.png",
    bannerImage: "/images/programs-hero.jpg",
  },
  // Alias for backward compatibility:
  "abuja-apostolic-camp": {
    slug: "apostolic-camps",
    name: "Apostolic Camps",
    scripture: "Ephesians 4:11",
    scriptureVerse: "And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers; for the perfecting of the saints...",
    frequency: "Monthly Apostolic Intensive · Second Weekend",
    cadence: "Monthly",
    location: "Abuja, FCT & Nationwide",
    description:
      "A close spiritual camp and apostolic intensive focused on equipping believers, prophetic alignment, and deep spiritual formation across Abuja and nationwide centers.",
    liveUrl: "https://www.youtube.com/@thepublishershouse",
    logoImage: "/images/TPH ABUJA.png",
    bannerImage: "/images/programs-hero.jpg",
  },
};

const S = {
  eyebrow: {
    fontFamily: "var(--font-poppins)",
    fontWeight: 600,
    fontSize: "10.5px",
    lineHeight: "1.6em",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
  },
  displayXL: {
    fontFamily: "var(--font-poppins)",
    fontWeight: 800,
    fontSize: "clamp(38px, 5.5vw, 68px)",
    lineHeight: "1.0em",
    letterSpacing: "-0.02em",
    textTransform: "uppercase" as const,
  },
  readLede: {
    fontFamily: "var(--font-playfair)",
    fontWeight: 400,
    fontSize: "clamp(17px, 2.2vw, 21px)",
    lineHeight: "1.6em",
  },
  scriptureBox: {
    fontFamily: "var(--font-playfair)",
    fontStyle: "italic" as const,
    fontSize: "14.5px",
    lineHeight: "1.6em",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const program = PROGRAM_REGISTRY[slug];
  const name = program ? program.name : slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return {
    title: `${name} | The Publishers House`,
    description: program?.description || `Explore past editions, speakers, and sermon archives for ${name}.`,
    openGraph: {
      title: `${name} – Archives & Editions | The Publishers House`,
      description: program?.description || `Archives, fliers, and messages for ${name}.`,
      images: [{ url: "/images/programs-hero.jpg" }],
    },
  };
}

export default async function ProgramSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Resolve metadata
  const program: ProgramInfo = PROGRAM_REGISTRY[slug] ?? {
    slug,
    name: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    scripture: "Ephesians 4:12",
    scriptureVerse: "For the perfecting of the saints, for the work of the ministry, for the edifying of the body of Christ.",
    frequency: "Flagship Gathering",
    cadence: "Gathering",
    location: "Jos, Plateau State",
    description: "Explore past editions, sound teachings, and full sermon archives from this program.",
    liveUrl: "https://www.youtube.com/@thepublishershouse",
  };

  // Fetch live sermons from Firestore catalog to enable in-page message cross-referencing
  let allSermons: Sermon[] = [];
  try {
    allSermons = await getSermons(1000);
  } catch (err) {
    console.error("Failed to fetch sermons catalog:", err);
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px", background: "#F4F6FB" }}>

        {/* ══════════════════════════════════════════════════════════
            HERO HEADER & OVERVIEW — Standardized Template
            Deep TPH Navy background (#151A54) with photography overlay
            Scripture Anchor, Full Overview, Cadence, & Quick Links
        ══════════════════════════════════════════════════════════ */}
        <section
          className="tph-hero"
          style={{
            position: "relative",
            background: "#151A54",
            padding: "80px 24px 90px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderBottom: "4px solid #D97706",
          }}
        >
          {/* Hero background image + layered gradient overlay */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <img
              src={program.bannerImage || "/images/programs-hero.jpg"}
              alt={program.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 25%",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(21, 26, 84, 0.94) 0%, rgba(1, 64, 193, 0.78) 55%, rgba(15, 23, 42, 0.90) 100%)",
              }}
            />
          </div>

          <div
            className="tph-inner"
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              maxWidth: "1000px",
            }}
          >
            {/* Top Navigation breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <Link
                href="/programs"
                style={{
                  ...S.eyebrow,
                  color: "#2090FF",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "color 0.2s",
                }}
              >
                <span>←</span> ALL PROGRAMS
              </Link>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
              <span style={{ ...S.eyebrow, color: "#D97706" }}>
                {program.frequency}
              </span>
            </div>

            {/* Program Title & Scripture Anchor */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(217, 119, 6, 0.15)",
                  border: "1px solid rgba(217, 119, 6, 0.4)",
                  padding: "4px 14px",
                  borderRadius: "2px",
                  marginBottom: "16px",
                }}
              >
                <span style={{ ...S.eyebrow, color: "#F59E0B", letterSpacing: "0.15em" }}>
                  ANCHOR SCRIPTURE: {program.scripture}
                </span>
              </div>
              <h1 style={{ ...S.displayXL, color: "#FFFFFF", margin: "0 0 16px" }}>
                {program.name}
              </h1>
              <p style={{ ...S.readLede, color: "#E8ECF7", maxWidth: "820px", margin: 0 }}>
                {program.description}
              </p>
            </div>

            {/* Scripture Quote Box */}
            {program.scriptureVerse && (
              <div
                style={{
                  borderLeft: "3px solid #D97706",
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "14px 20px",
                  borderRadius: "0 4px 4px 0",
                  maxWidth: "760px",
                }}
              >
                <p style={{ ...S.scriptureBox, color: "#D3DAEC", margin: 0 }}>
                  &ldquo;{program.scriptureVerse}&rdquo;
                </p>
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-poppins)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#D97706",
                    marginTop: "6px",
                  }}
                >
                  — {program.scripture}
                </span>
              </div>
            )}

            {/* Core Info Bar: Frequency & Location */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px 28px",
                paddingTop: "8px",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#2090FF", fontSize: "14px" }}>📅</span>
                <span style={{ fontFamily: "var(--font-poppins)", fontSize: "13px", fontWeight: 500, color: "#BFD0F7" }}>
                  {program.frequency}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#2090FF", fontSize: "14px" }}>📍</span>
                <span style={{ fontFamily: "var(--font-poppins)", fontSize: "13px", fontWeight: 500, color: "#BFD0F7" }}>
                  {program.location}
                </span>
              </div>
            </div>

            {/* Quick Links Buttons: Live Stream, Audio Feeds, Resources */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "14px",
                paddingTop: "12px",
              }}
            >
              <a
                href={program.liveUrl || "https://www.youtube.com/@thepublishershouse"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 24px",
                  background: "#D97706",
                  color: "#151A54",
                  border: "1.5px solid #D97706",
                  borderRadius: "3px",
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 700,
                  fontSize: "11.5px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#DC2626" }} />
                <span>Watch Live / Stream</span>
              </a>

              <a
                href="#editions-archive"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#FFFFFF",
                  border: "1.5px solid rgba(255, 255, 255, 0.25)",
                  borderRadius: "3px",
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 700,
                  fontSize: "11.5px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <span>🎧</span>
                <span>Past Editions Archive</span>
              </a>

              <Link
                href="/sermons"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  background: "transparent",
                  color: "#BFD0F7",
                  border: "1.5px solid rgba(191, 208, 247, 0.25)",
                  borderRadius: "3px",
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                  fontSize: "11.5px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <span>Sermons Catalog →</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            EDITIONS CHRONOLOGICAL ARCHIVE (THE CORE SECTION)
            Interactive client component with:
            - Reverse-chronological flier list (line by line)
            - High-res Lightbox popup when flier is clicked
            - Dynamic button: "Listen to [Program] [Year] Messages"
            - In-page scrollable messages card with direct playable audio
            - Style guide matched: #F4F6FB, #151A54, #0140C1, #D97706
        ══════════════════════════════════════════════════════════ */}
        <section id="editions-archive">
          <ProgramEditionsClient
            programSlug={program.slug}
            programName={program.name}
            allSermons={allSermons}
          />
        </section>

      </main>
      <Footer />
    </>
  );
}
