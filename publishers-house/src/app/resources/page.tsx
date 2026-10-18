import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { TRACK_DETAILS } from "@/lib/cmsDefaults";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Resources & Study Guides | The Publishers House",
  description:
    "Explore categorized biblical teaching series, prayer school curriculum, 40-day devotionals, and downloadable apostolic study guides.",
};

const DOWNLOADABLE_GUIDES = [
  {
    title: "40 Days of Prayer & Fasting Devotional (PDF)",
    category: "Devotional",
    desc: "Complete 40-day scripture reading plan, prayer confessions, and fasting guidelines.",
    size: "4.2 MB · PDF",
  },
  {
    title: "How to Preach the Gospel: Evangelism Field Manual",
    category: "Apostolic Training",
    desc: "Practical steps, scriptures, and conviction points for witnessing on streets and campuses.",
    size: "2.1 MB · PDF",
  },
  {
    title: "The Doctrine of Christ Study Outline",
    category: "Theology & Foundations",
    desc: "Comprehensive expositional notes on Hebrews 6:1-2, baptisms, and eternal judgment.",
    size: "3.5 MB · PDF",
  },
  {
    title: "Daily Faith Confessions & Kingdom Decrees",
    category: "Spiritual Life",
    desc: "Scriptural confessions for health, wisdom, divine guidance, and financial increase.",
    size: "1.2 MB · PDF",
  },
];

export default async function ResourcesHubPage() {
  let tracks = { ...TRACK_DETAILS };
  try {
    const docSnap = await getAdminDb().collection("settings").doc("resources_tracks").get();
    if (docSnap.exists) {
      const live = docSnap.data()?.tracks || {};
      for (const [slug, custom] of Object.entries(live) as [string, any][]) {
        if (tracks[slug] && custom) {
          tracks[slug] = {
            ...tracks[slug],
            title: custom.title || tracks[slug].title,
            description: custom.description || tracks[slug].description,
            materials: (custom.materials && custom.materials.length > 0)
              ? custom.materials.filter((m: any) => m && m.published !== false)
              : tracks[slug].materials,
          };
        }
      }
    }
  } catch (err) {}
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px", backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
        
        {/* Hero Section */}
        <section
          style={{
            backgroundColor: "#151A54",
            padding: "80px 100px 96px",
            position: "relative",
            overflow: "hidden",
            borderBottom: "4px solid #2090FF",
          }}
          className="tph-hero"
        >
          <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                color: "#2090FF",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Equipping the Saints · Psalm 68:11
            </div>

            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(32px, 5vw, 56px)",
                lineHeight: "1.06em",
                letterSpacing: "-0.025em",
                color: "#FFFFFF",
                margin: "0 0 20px",
                textTransform: "uppercase",
              }}
            >
              Resources & Study Guides
            </h1>

            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(18px, 2.2vw, 22px)",
                lineHeight: "1.55em",
                color: "rgba(255,255,255,0.88)",
                margin: "0 0 32px",
                maxWidth: "760px",
              }}
            >
              Systematic teaching series, prayer class manuals, devotionals, and foundational apostolic courses designed to establish believers in Christ.
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
              <a
                href="#courses"
                style={{
                  backgroundColor: "#2090FF",
                  color: "#FFFFFF",
                  padding: "14px 28px",
                  borderRadius: "4px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: "12px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                Browse Study Courses ↓
              </a>
              <Link
                href="/sermons"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.25)",
                  padding: "14px 24px",
                  borderRadius: "4px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "12px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                Go to Sermons Page →
              </Link>
            </div>
          </div>
        </section>

        {/* 6 Specialized Resource Tracks */}
        <section id="courses" style={{ padding: "80px 100px", backgroundColor: "#F4F6FB" }} className="tph-section">
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "40px" }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#0140C1", marginBottom: "8px" }}>
                Categorized Curricula
              </div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "32px", fontWeight: 800, color: "#151A54", margin: 0, textTransform: "uppercase" }}>
                Specialized Study Tracks
              </h2>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#4A62A0", marginTop: "8px" }}>
                Each track contains structured teachings, audio downloads, and companion outlines.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "24px",
              }}
            >
              {Object.entries(tracks).map(([slug, track]) => (
                <div
                  key={slug}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D3DAEC",
                    borderRadius: "10px",
                    padding: "32px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 4px 16px rgba(21, 26, 84, 0.04)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10.5px", fontWeight: 700, color: "#0140C1", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "10px" }}>
                      {track.eyebrow}
                    </div>
                    <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "20px", fontWeight: 800, color: "#151A54", margin: "0 0 10px", textTransform: "uppercase" }}>
                      {track.title}
                    </h3>
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11.5px", fontWeight: 600, color: "#D97706", textTransform: "uppercase", marginBottom: "14px" }}>
                      {track.scripture}
                    </div>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "14.5px", lineHeight: "1.6em", color: "#4A62A0", margin: "0 0 24px" }}>
                      {track.lede}
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #E8ECF7" }}>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600, color: "#747CA1" }}>
                      {track.materials.length} Materials
                    </span>
                    <Link
                      href={`/resources/${slug}`}
                      style={{
                        backgroundColor: "#151A54",
                        color: "#FFFFFF",
                        padding: "8px 18px",
                        borderRadius: "4px",
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 700,
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        textDecoration: "none",
                      }}
                    >
                      Open Track →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Downloadable Materials Section */}
        <section style={{ padding: "80px 100px 100px", backgroundColor: "#FFFFFF" }} className="tph-section">
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "36px" }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#0140C1", marginBottom: "8px" }}>
                Printable & Digital Materials
              </div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "30px", fontWeight: 800, color: "#151A54", margin: 0, textTransform: "uppercase" }}>
                Downloadable PDF Study Guides
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "20px" }}>
              {DOWNLOADABLE_GUIDES.map((doc, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "#F4F6FB",
                    border: "1px solid #D3DAEC",
                    borderRadius: "8px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#2090FF", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {doc.category}
                    </span>
                    <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "16px", fontWeight: 700, color: "#151A54", margin: "8px 0" }}>
                      {doc.title}
                    </h3>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "13.5px", color: "#4A62A0", lineHeight: "1.5em", margin: "0 0 16px" }}>
                      {doc.desc}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "#747CA1", marginBottom: "12px", fontFamily: "monospace" }}>
                      {doc.size}
                    </div>
                    <a
                      href="#courses"
                      style={{
                        display: "block",
                        textAlign: "center",
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "#0140C1",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "4px",
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 700,
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        boxSizing: "border-box",
                      }}
                    >
                      Access Study Guide 📥
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
