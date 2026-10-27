import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgramEditionsClient from "./ProgramEditionsClient";

// ─── Per-program metadata ──────────────────────────────────────────────────────

const PROGRAM_META: Record<string, { name: string; eyebrow: string; description: string }> = {
  "festival-of-light": {
    name: "Festival of Light",
    eyebrow: "Annual Conference · Isaiah 60:1",
    description:
      "Each October, believers from across the world gather in Jos for worship, sound teaching, Holy Ghost expressions and fellowship. Festival of Light is our yearly homecoming.",
  },
  "merismos": {
    name: "Merismos",
    eyebrow: "Annual Conference · Hebrews 4:12",
    description:
      "A power-packed encounter where the Word is rightly taught and the Holy Spirit moves tangibly. Merismos — the piercing, dividing work of the Word — defines every edition.",
  },
  "jesus-convention": {
    name: "Jesus Convention",
    eyebrow: "Annual Conference · Easter · Philippians 3:10",
    description:
      "Every Easter, we gather to unveil the person, finished work and lordship of Jesus Christ through sound teaching, prayer and corporate worship.",
  },
  "the-forge": {
    name: "The Forge",
    eyebrow: "Monthly Intensive · Jeremiah 23:29",
    description:
      "An intensive prayer gathering running Wednesday to Friday and culminating in an overnight vigil. The Forge is where men are made in the place of prayer.",
  },
  "apostolic-camps": {
    name: "Apostolic Camps",
    eyebrow: "Monthly Camp · Ephesians 4:11",
    description:
      "Monthly apostolic gatherings in Abuja and across Nigeria, focused on equipping believers, prophetic alignment and deep spiritual formation.",
  },
};

const S = {
  eyebrow: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "10px",
    lineHeight: "1.6em",
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
  },
  displayXL: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 800,
    fontSize: "clamp(40px, 6vw, 72px)",
    lineHeight: "0.95em",
    letterSpacing: "-0.02em",
    textTransform: "uppercase" as const,
  },
  readLede: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 400,
    fontSize: "clamp(16px, 2vw, 20px)",
    lineHeight: "1.6em",
  },
};

export default async function ProgramSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const meta = PROGRAM_META[slug] ?? {
    name: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    eyebrow: "Flagship Program",
    description: "Explore past editions, speakers, themes, and full sermon archives from this program.",
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px", background: "#0B0E14" }}>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section
          className="tph-hero"
          style={{
            position: "relative",
            background: "#151A54",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            overflow: "hidden",
            borderBottom: "4px solid #D97706",
          }}
        >
          {/* Background image + dual overlay */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <img
              src="/images/programs-hero.jpg"
              alt={meta.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(21,26,84,0.92) 0%, rgba(1,64,193,0.70) 60%, rgba(11,14,20,0.85) 100%)",
              }}
            />
          </div>

          {/* Content */}
          <div
            className="tph-inner"
            style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "20px", maxWidth: "860px" }}
          >
            {/* Gold rule */}
            <div style={{ width: "40px", height: "3px", background: "#D97706", borderRadius: "2px" }} />

            <span style={{ ...S.eyebrow, color: "#D97706" }}>{meta.eyebrow}</span>

            <h1 style={{ ...S.displayXL, color: "#FFFFFF", margin: 0 }}>{meta.name}</h1>

            <p style={{ ...S.readLede, color: "#BFD0F7", maxWidth: "640px", margin: 0 }}>
              {meta.description}
            </p>
          </div>
        </section>

        {/* ── EDITIONS ──────────────────────────────────────────────────── */}
        <ProgramEditionsClient programSlug={slug} programName={meta.name} />

      </main>
      <Footer />
    </>
  );
}
