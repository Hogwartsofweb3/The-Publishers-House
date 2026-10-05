import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSermonById, getSermons } from "@/lib/firebase";

export const revalidate = 60;

const S = {
  eyebrow: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  displayL: { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 42px)", lineHeight: "1.04em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  readBody: { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "15px", lineHeight: "1.6em" },
  button: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
};

export default async function SermonDetailPage({ params }: { params: { id: string } }) {
  const sermon = await getSermonById(params.id);
  if (!sermon) return notFound();

  // Fetch some related sermons (mock logic for now: just grab recent ones)
  const relatedSermons = await getSermons(3);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px", backgroundColor: "#F4F6FB", minHeight: "100vh" }}>
        
        {/* Top Banner */}
        <section style={{ backgroundColor: "#151A54", padding: "64px 24px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px", color: "#FFFFFF" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ ...S.eyebrow, color: "#2090FF" }}>{sermon.series || "Stand-alone"}</span>
              <span style={{ ...S.eyebrow, color: "#747CA1" }}>•</span>
              <span style={{ ...S.eyebrow, color: "#D3DAEC" }}>{sermon.date ? new Date(sermon.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : "Unknown Date"}</span>
              <span style={{ ...S.eyebrow, color: "#747CA1" }}>•</span>
              <span style={{ ...S.eyebrow, color: "#D3DAEC" }}>{sermon.duration || "1h 30m"}</span>
            </div>
            
            <h1 style={S.displayL}>{sermon.title}</h1>
            
            <div style={{ display: "flex", gap: "24px", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                  {sermon.speaker.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ ...S.eyebrow, color: "#D3DAEC" }}>Speaker</div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "14px" }}>{sermon.speaker}</div>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "24px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
                <div>
                  <div style={{ ...S.eyebrow, color: "#D3DAEC" }}>Scripture Focus</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontStyle: "italic" }}>{sermon.scripture || "Various Scriptures"}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Media & Details Split */}
        <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
            
            {/* Main Content (Left) */}
            <div style={{ flex: "1 1 600px", display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Media Player */}
              <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "#0B0E14", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {sermon.videoUrl ? (
                  sermon.videoUrl.includes("youtube") ? (
                    <iframe width="100%" height="100%" src={sermon.videoUrl.replace("watch?v=", "embed/")} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                  ) : (
                    <video controls style={{ width: "100%", height: "100%" }} src={sermon.videoUrl}></video>
                  )
                ) : (
                  <div style={{ color: "#D3DAEC", fontFamily: "'Poppins', sans-serif", textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>▶️</div>
                    <div>Video not available.<br/>Click Audio player below.</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", padding: "16px", backgroundColor: "#FFFFFF", border: "1px solid #D3DAEC", borderRadius: "8px" }}>
                {sermon.audioUrl && (
                  <a href={sermon.audioUrl} target="_blank" rel="noopener noreferrer" style={{ ...S.button, display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", backgroundColor: "#0140C1", color: "#FFFFFF", textDecoration: "none", borderRadius: "4px" }}>
                    🎧 Listen Audio
                  </a>
                )}
                {sermon.studyGuideUrl && (
                  <a href={sermon.studyGuideUrl} target="_blank" rel="noopener noreferrer" style={{ ...S.button, display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", backgroundColor: "#E8ECF7", color: "#151A54", textDecoration: "none", borderRadius: "4px" }}>
                    📄 Study Guide
                  </a>
                )}
                <button style={{ ...S.button, display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", backgroundColor: "transparent", border: "1px solid #D3DAEC", color: "#151A54", borderRadius: "4px", cursor: "pointer", marginLeft: "auto" }}>
                  🔗 Share
                </button>
              </div>

            </div>

            {/* Sidebar (Right) */}
            <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Tags/Topics */}
              {sermon.tags && sermon.tags.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "14px", color: "#151A54", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                    Topics Explored
                  </h3>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {sermon.tags.map((tag: string) => (
                      <span key={tag} style={{ backgroundColor: "#FFFFFF", border: "1px solid #D3DAEC", color: "#4A62A0", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location/Conference */}
              <div>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "14px", color: "#151A54", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                  Preached At
                </h3>
                <div style={{ ...S.readBody, color: "#4A62A0" }}>
                  {sermon.location || "TPH Headquarters, Jos"}
                </div>
              </div>
              
              {/* This Month's Article Promo */}
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D3DAEC", padding: "24px", borderRadius: "8px" }}>
                <div style={{ ...S.eyebrow, color: "#2090FF", marginBottom: "8px" }}>Featured Reading</div>
                <h4 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "16px", fontWeight: 700, color: "#151A54", margin: "0 0 12px" }}>
                  The Necessity of the Local Assembly
                </h4>
                <p style={{ ...S.readBody, color: "#747CA1", fontSize: "13px", marginBottom: "16px" }}>
                  Dive deeper into this month's apostolic focus with our lead article on church structure.
                </p>
                <a href="/articles" style={{ ...S.button, color: "#0140C1", textDecoration: "none" }}>Read Article →</a>
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
