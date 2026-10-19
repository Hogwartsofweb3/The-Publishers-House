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

  let hubData = {
    heroEyebrow: "Equipping the Saints · Psalm 68:11",
    heroHeadline: "Resources & Study Guides",
    heroDescription:
      "Systematic teaching series, prayer class manuals, devotionals, and foundational apostolic courses designed to establish believers in Christ.",
    heroImage: "/images/teaching-and-resources.jpg",
  };

  try {
    const hubDoc = await getAdminDb().collection("settings").doc("resources_hub").get();
    if (hubDoc.exists) {
      hubData = { ...hubData, ...(hubDoc.data() as any) };
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
          {/* Hero background image with blue overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
            }}
          >
            <img
              src={hubData.heroImage || "/images/teaching-and-resources.jpg"}
              alt="Teaching and Resources"
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
                background: "linear-gradient(to bottom, rgba(21, 26, 84, 0.65) 0%, rgba(1, 64, 193, 0.38) 100%)",
              }}
            />
          </div>

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
              {hubData.heroEyebrow}
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
              {hubData.heroHeadline}
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
              {hubData.heroDescription}
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

        {/* Specialized Resource Tracks + Sermons */}
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
              {/* Dedicated Sermons Card */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #2090FF",
                  borderRadius: "10px",
                  padding: "32px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 16px rgba(32, 144, 255, 0.08)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10.5px", fontWeight: 700, color: "#0140C1", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "10px" }}>
                    Audio &amp; Video Messages
                  </div>
                  <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "20px", fontWeight: 800, color: "#151A54", margin: "0 0 10px", textTransform: "uppercase" }}>
                    Sermons &amp; Audio Teachings
                  </h3>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11.5px", fontWeight: 600, color: "#0140C1", textTransform: "uppercase", marginBottom: "14px" }}>
                    Romans 10:17
                  </div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "14.5px", lineHeight: "1.6em", color: "#4A62A0", margin: "0 0 24px" }}>
                    Explore all Sunday services, midweek doctrines, conferences, and intensive prayer teachings with instant audio and video streaming.
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #E8ECF7" }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600, color: "#0140C1" }}>
                    All Sermons Catalog
                  </span>
                  <Link
                    href="/sermons"
                    style={{
                      backgroundColor: "#0140C1",
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
                    Open Sermons →
                  </Link>
                </div>
              </div>

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
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11.5px", fontWeight: 600, color: "#0140C1", textTransform: "uppercase", marginBottom: "14px" }}>
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

      </main>
      <Footer />
    </>
  );
}
