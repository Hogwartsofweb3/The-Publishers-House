import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { TRACK_DETAILS } from "@/lib/cmsDefaults";
import ResourcesCurriculumClient from "./ResourcesCurriculumClient";

export const revalidate = 0;

export { TRACK_DETAILS };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const track = TRACK_DETAILS[slug];
  if (!track) return { title: "Resource Track Not Found | The Publishers House" };
  return {
    title: `${track.title} | Resources | The Publishers House`,
    description: track.lede,
  };
}

export default async function ResourceSubpage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let track = TRACK_DETAILS[slug];

  // Fetch live track data from Firestore (settings/resources_tracks or fallback to resource_tracks/slug)
  try {
    const settingsDoc = await getAdminDb().collection("settings").doc("resources_tracks").get();
    let custom: any = null;
    if (settingsDoc.exists) {
      const allTracks = settingsDoc.data()?.tracks || {};
      custom = allTracks[slug];
    }
    if (!custom) {
      const directDoc = await getAdminDb().collection("resource_tracks").doc(slug).get();
      if (directDoc.exists) {
        custom = directDoc.data();
      }
    }

    if (custom) {
      const rawMaterials: any[] = custom.materials && Array.isArray(custom.materials) ? custom.materials : [];
      const normalizedMaterials = rawMaterials
        .filter((m) => m && m.published !== false)
        .map((m, i) => ({
          part: m.part || (m.series ? m.series : `Part ${i + 1}`),
          title: m.title || "Untitled Teaching",
          speaker: m.speaker || "Dr. Joshua Agunbiade",
          duration: m.duration || "Study Session",
          scripture: m.scripture || "",
          overview: m.overview || m.description || "",
          youtubeUrl: m.youtubeUrl || (m.url && (m.url.includes("youtu") || m.type === "Video") ? m.url : ""),
          audioUrl: m.audioUrl || (m.url && (m.url.includes(".mp3") || m.type === "Audio") ? m.url : ""),
          pdfUrl: m.pdfUrl || (m.url && (m.url.includes(".pdf") || m.type === "PDF") ? m.url : ""),
          notesUrl: m.notesUrl || "",
        }));

      track = {
        ...track,
        title: custom.title || track?.title,
        description: custom.description || track?.description,
        materials: normalizedMaterials.length > 0 ? normalizedMaterials : track?.materials,
      };
    }
  } catch (err) {
    console.error("Error fetching resource track:", err);
  }

  if (!track) notFound();

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
              src="/images/teaching-and-resources.jpg"
              alt={track.title}
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
                background: "linear-gradient(to bottom, rgba(21, 26, 84, 0.78) 0%, rgba(1, 64, 193, 0.58) 100%)",
              }}
            />
          </div>

          <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            {/* Breadcrumbs */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Link href="/resources" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.6)", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                ← Resources Hub
              </Link>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, color: "#2090FF", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                {track.eyebrow}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(30px, 4.5vw, 54px)",
                lineHeight: "1.08em",
                letterSpacing: "-0.025em",
                color: "#FFFFFF",
                margin: "0 0 16px",
                textTransform: "uppercase",
              }}
            >
              {track.title}
            </h1>

            <div
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#2090FF",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              {track.scripture}
            </div>

            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(18px, 2.2vw, 22px)",
                lineHeight: "1.55em",
                color: "rgba(255,255,255,0.88)",
                margin: "0 0 32px",
                maxWidth: "840px",
              }}
            >
              {track.lede}
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
              <a
                href="#curriculum"
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
                  boxShadow: "0 4px 16px rgba(32, 144, 255, 0.35)",
                }}
              >
                Access Course Materials ↓
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
                Browse All Sermons
              </Link>
            </div>
          </div>
        </section>

        {/* Overview Exposition */}
        <section style={{ padding: "72px 100px", backgroundColor: "#F4F6FB", borderBottom: "1px solid #D3DAEC" }} className="tph-section">
          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#0140C1", marginBottom: "12px" }}>
              Theological Focus & Context
            </div>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "28px", fontWeight: 800, color: "#151A54", margin: "0 0 20px", textTransform: "uppercase" }}>
              About This Resource
            </h2>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", lineHeight: "1.75em", color: "#4A62A0", margin: 0 }}>
              {track.description}
            </p>
          </div>
        </section>

        {/* Curriculum / Materials List */}
        <section id="curriculum" style={{ padding: "80px 100px 100px", backgroundColor: "#FFFFFF" }} className="tph-section">
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "36px" }}>
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#0140C1", marginBottom: "8px" }}>
                  Curriculum & Sessions
                </div>
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "30px", fontWeight: 800, color: "#151A54", margin: 0, textTransform: "uppercase" }}>
                  Course Teachings & Downloads
                </h2>
              </div>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: 600, color: "#747CA1" }}>
                {track.materials.length} Materials Available
              </span>
            </div>

            <ResourcesCurriculumClient
              trackSlug={slug}
              trackTitle={track.title}
              materials={track.materials}
            />

            {/* Other Resources Carousel link */}
            <div style={{ marginTop: "60px", padding: "32px", backgroundColor: "#E8ECF7", borderRadius: "12px", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "18px", fontWeight: 800, color: "#151A54", margin: "0 0 8px", textTransform: "uppercase" }}>
                Explore Other Categorized Studies
              </h3>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: "#4A62A0", margin: "0 0 20px" }}>
                Deepen your spiritual understanding with other courses in this curriculum.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                {Object.entries(TRACK_DETAILS).filter(([s]) => s !== slug).slice(0, 4).map(([s, t]) => (
                  <Link
                    key={s}
                    href={`/resources/${s}`}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#FFFFFF",
                      borderRadius: "20px",
                      border: "1px solid #D3DAEC",
                      color: "#0140C1",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {t.title} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
