"use client";

import { useState } from "react";
import type { Sermon } from "@/lib/firebase";
import Link from "next/link";
import SermonCard from "@/components/SermonCard";

import { useAudio } from "@/components/GlobalAudioPlayer";

const Navy    = "#151A54";
const Blue700 = "#0140C1";
const Blue500 = "#2090FF";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const Paper100 = "#F4F6FB";
const White   = "#FFFFFF";

const T = {
  displayL:  { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "clamp(32px,5vw,56px)", lineHeight: "1.04em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  eyebrow:   { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  colophon:  { fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.15em", textTransform: "uppercase" as const },
  readBody:  { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "18px", lineHeight: "1.75em" },
  button:    { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
};

export default function SermonDetailClient({ sermon, relatedSermons }: { sermon: Sermon, relatedSermons: Sermon[] }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const { playSermon } = useAudio();
  const dateStr = sermon.date ? new Date(sermon.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.') : "00.00.0000";

  const handleListen = () => {
    if (sermon.audioUrl && !sermon.audioUrl.includes("t.me/")) {
      playSermon(sermon);
    } else {
      const tgUrl = sermon.audioUrl?.includes("t.me/") ? sermon.audioUrl : "https://t.me/ThePublishersHouse";
      window.open(tgUrl, "_blank");
    }
  };

  return (
    <>
      <main style={{ paddingTop: "70px", backgroundColor: White }}>
        
        {/* ── HERO BANNER ──────────────────────────────────────────────── */}
        <section style={{
          position: "relative",
          backgroundColor: Navy,
          padding: "100px 5%",
          minHeight: "480px",
          display: "flex",
          alignItems: "flex-end"
        }}>
          {/* Background Image */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/sermon-hero-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center", zIndex: 0, opacity: 0.3, mixBlendMode: "luminosity" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #151A54 0%, transparent 80%)", zIndex: 1 }} />
          
          <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ ...T.eyebrow, color: "rgba(255,255,255,0.8)", marginBottom: "16px" }}>
              {sermon.series || "TEACHING"}
            </div>
            
            <h1 style={{ ...T.displayL, color: White, margin: "0 0 24px", maxWidth: "900px" }}>
              {sermon.title}
            </h1>
            
            {/* Meta Line */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", borderBottom: "1px solid rgba(255,255,255,0.2)", padding: "16px 0", marginBottom: "32px", display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
              <span style={{ ...T.colophon, color: White }}>{sermon.scripture || "2 TIMOTHY 2:15"}</span>
              <span style={{ ...T.colophon, color: "rgba(255,255,255,0.5)" }}>·</span>
              <span style={{ ...T.colophon, color: White }}>{sermon.speaker || "REV. JOSHUA AGUNBIADE"}</span>
              <span style={{ ...T.colophon, color: "rgba(255,255,255,0.5)" }}>·</span>
              <span style={{ ...T.colophon, color: White }}>{dateStr}</span>
              {sermon.duration && (
                <>
                  <span style={{ ...T.colophon, color: "rgba(255,255,255,0.5)" }}>·</span>
                  <span style={{ ...T.colophon, color: White }}>{sermon.duration}</span>
                </>
              )}
            </div>
            
            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <button onClick={handleListen} style={{ ...T.button, padding: "14px 32px", backgroundColor: White, color: Navy, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
                </svg>
                LISTEN {sermon.audioUrl && !sermon.audioUrl.includes("t.me/") ? "AUDIO" : "ON TELEGRAM"}
              </button>
              {sermon.videoUrl && (
                <button onClick={() => setVideoOpen(true)} style={{ ...T.button, padding: "14px 32px", backgroundColor: "transparent", color: White, border: "1px solid rgba(255,255,255,0.4)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "background 200ms" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor="rgba(255,255,255,0.1)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor="transparent"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  WATCH VIDEO
                </button>
              )}
              {sermon.studyGuideUrl && (
                <a href={sermon.studyGuideUrl} target="_blank" rel="noopener noreferrer" style={{ ...T.button, padding: "14px 32px", backgroundColor: "transparent", color: White, border: "1px solid rgba(255,255,255,0.4)", textDecoration: "none", transition: "background 200ms" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor="rgba(255,255,255,0.1)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor="transparent"}>
                  STUDY GUIDE
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── MAIN BODY SPLIT ─────────────────────────────────────────── */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 5%", display: "flex", gap: "64px", flexWrap: "wrap", alignItems: "flex-start" }}>
          
          {/* Left Sidebar */}
          <aside style={{ flex: "0 0 200px", position: "sticky", top: "100px" }}>
            <div style={{ ...T.eyebrow, color: Blue500, marginBottom: "16px" }}>IN THIS TEACHING</div>
            {sermon.tags && sermon.tags.map((tag) => (
              <div key={tag} style={{ ...T.colophon, color: Navy, marginBottom: "12px", letterSpacing: "0.1em" }}>
                {tag}
              </div>
            ))}
            
            <div style={{ marginTop: "48px", ...T.colophon, color: Slate500, textTransform: "none", lineHeight: "1.8em", opacity: 0.8 }}>
              Share to WhatsApp · X · Copy link
            </div>
          </aside>
          
          {/* Right Content */}
          <article style={{ flex: "1 1 500px" }}>
            <div style={{ ...T.readBody, color: Navy }}>
              {sermon.summary ? (
                 <div dangerouslySetInnerHTML={{ __html: sermon.summary.replace(/\n/g, '<br/>') }} />
              ) : (
                <p>Teaching by {sermon.speaker || "Rev. Joshua Agunbiade"}.</p>
              )}
            </div>
          </article>
        </section>

        {/* ── REST OF SERIES ─────────────────────────────────────────── */}
        {relatedSermons.length > 0 && (
          <section style={{ backgroundColor: Paper100, padding: "80px 5%" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <div style={{ ...T.eyebrow, color: Blue500, marginBottom: "8px" }}>
                {sermon.series && relatedSermons.some(r => r.series === sermon.series)
                  ? "REST OF THE SERIES"
                  : "MORE TEACHINGS"}
              </div>
              <h2 style={{ ...T.displayL, color: Navy, fontSize: "clamp(24px, 4vw, 42px)", margin: "0 0 48px" }}>
                {sermon.series && relatedSermons.some(r => r.series === sermon.series)
                  ? sermon.series
                  : "FROM THIS HOUSE"}
              </h2>
              
              <div className="tph-grid-3">
                {relatedSermons.slice(0, 3).map(item => (
                  <SermonCard key={item.id} sermon={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── VIDEO MODAL ─────────────────────────────────────────── */}
      {videoOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(11, 14, 20, 0.95)", zIndex: 9999, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "24px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setVideoOpen(false)} style={{ ...T.eyebrow, background: "none", border: "none", color: White, cursor: "pointer" }}>
              CLOSE ✕
            </button>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5% 5% 5%" }}>
            <div style={{ width: "100%", maxWidth: "1000px", aspectRatio: "16/9", backgroundColor: "#000", position: "relative" }}>
              {sermon.videoUrl && sermon.videoUrl.includes("youtube") ? (
                <iframe width="100%" height="100%" src={`${sermon.videoUrl.replace("watch?v=", "embed/")}?autoplay=1`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: Slate500, fontFamily: "var(--font-poppins)" }}>
                  Video URL not provided
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
