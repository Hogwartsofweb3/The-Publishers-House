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
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const White   = "#FFFFFF";

const T = {
  headline: {
    fontFamily: "var(--font-poppins)",
    fontWeight: 800,
    fontSize: "clamp(28px, 4.5vw, 52px)",
    lineHeight: "1.08em",
    letterSpacing: "-0.02em",
    textTransform: "uppercase" as const,
  },
  eyebrow: {
    fontFamily: "var(--font-poppins)",
    fontWeight: 600,
    fontSize: "10px",
    lineHeight: "1.6em",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
  },
  colophon: {
    fontFamily: "var(--font-poppins)",
    fontWeight: 500,
    fontSize: "10.5px",
    lineHeight: "1.6em",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
  },
  button: {
    fontFamily: "var(--font-poppins)",
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "1em",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    cursor: "pointer",
  },
  overviewTitle: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: "28px",
    lineHeight: "1.2em",
  },
  readBody: {
    fontFamily: "var(--font-poppins)",
    fontWeight: 400,
    fontSize: "15.5px",
    lineHeight: "1.75em",
    color: "#2C344E",
  },
};

interface Props {
  sermon: Sermon;
  relatedSermons: Sermon[];
}

export default function SermonDetailClient({ sermon, relatedSermons }: Props) {
  const { playVideo, playAudio } = useAudio();
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const dateStr = sermon.date
    ? new Date(sermon.date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".")
    : "00.00.0000";

  const handleShareClick = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: sermon.title,
          text: `Listen to ${sermon.title} from The Publishers House`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to custom share modal
      }
    }
    setShareOpen(true);
  };

  const copyUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(`${sermon.title} — The Publishers House`);
  const encodedUrl = encodeURIComponent(currentUrl);

  return (
    <main style={{ paddingTop: "70px", backgroundColor: White }}>
      {/* ── HERO BANNER (Deep Navy Outlook matching Screenshot 2) ── */}
      <section
        style={{
          position: "relative",
          backgroundColor: Navy,
          padding: "96px 6% 80px",
          minHeight: "440px",
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        {/* Background crowd image watermark with navy gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/images/sermon-hero-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.28,
            mixBlendMode: "luminosity",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, #151A54 0%, rgba(21,26,84,0.7) 60%, rgba(21,26,84,0.4) 100%)",
            zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
          {/* Eyebrow */}
          <div style={{ ...T.eyebrow, color: Blue500, marginBottom: "16px" }}>
            {sermon.series || "TEACHING"}
          </div>

          {/* Title in MADE Soulmaze */}
          <h1 style={{ ...T.headline, color: White, margin: "0 0 24px", maxWidth: "980px" }}>
            {sermon.title}
          </h1>

          {/* Meta divider line */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.2)",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              padding: "14px 0",
              marginBottom: "32px",
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              alignItems: "center",
            }}
          >
            <span style={{ ...T.colophon, color: White }}>
              {sermon.scripture || "2 TIMOTHY 2:15"}
            </span>
            <span style={{ ...T.colophon, color: "rgba(255,255,255,0.4)" }}>·</span>
            <span style={{ ...T.colophon, color: White }}>
              {sermon.speaker || "DR. JOSHUA AGUNBIADE"}
            </span>
            <span style={{ ...T.colophon, color: "rgba(255,255,255,0.4)" }}>·</span>
            <span style={{ ...T.colophon, color: White }}>{dateStr}</span>
            {sermon.duration && (
              <>
                <span style={{ ...T.colophon, color: "rgba(255,255,255,0.4)" }}>·</span>
                <span style={{ ...T.colophon, color: White }}>{sermon.duration}</span>
              </>
            )}
          </div>

          {/* Action buttons: Listen + Watch + Share */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
            {/* LISTEN BUTTON — always visible, plays on the website directly */}
            <button
              onClick={() => playAudio(sermon)}
              style={{
                ...T.button,
                padding: "14px 30px",
                backgroundColor: White,
                color: Navy,
                border: "none",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                transition: "transform 0.15s ease",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
              </svg>
              LISTEN AUDIO
            </button>

            {/* WATCH BUTTON — opens floating docked mini-player */}
            {sermon.videoUrl && (
              <button
                onClick={() => playVideo(sermon)}
                style={{
                  ...T.button,
                  padding: "14px 30px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: White,
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background-color 0.2s ease",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                WATCH VIDEO
              </button>
            )}

            {/* SHARE BUTTON */}
            <button
              onClick={handleShareClick}
              style={{
                ...T.button,
                padding: "14px 24px",
                backgroundColor: "transparent",
                color: White,
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              SHARE
            </button>
          </div>
        </div>
      </section>

      {/* ── TWO-COLUMN LOWER SECTION ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "72px 6%", display: "flex", gap: "60px", flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Left Column — Metadata & Quick Share */}
        <aside style={{ flex: "0 0 260px", width: "100%", maxWidth: "280px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            {sermon.series && (
              <div>
                <div style={{ ...T.eyebrow, color: Slate500, marginBottom: "4px" }}>Series:</div>
                <Link
                  href={`/sermons?series=${encodeURIComponent(sermon.series)}`}
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: Blue700,
                    textDecoration: "none",
                  }}
                >
                  {sermon.series}
                </Link>
              </div>
            )}

            <div>
              <div style={{ ...T.eyebrow, color: Slate500, marginBottom: "4px" }}>Speaker:</div>
              <div style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "14px", color: Navy }}>
                {sermon.speaker || "Dr. Joshua Agunbiade"}
              </div>
            </div>

            {sermon.duration && (
              <div>
                <div style={{ ...T.eyebrow, color: Slate500, marginBottom: "4px" }}>Duration:</div>
                <div style={{ fontFamily: "var(--font-poppins)", fontSize: "14px", color: Navy }}>
                  {sermon.duration}
                </div>
              </div>
            )}

            {sermon.scripture && (
              <div>
                <div style={{ ...T.eyebrow, color: Slate500, marginBottom: "4px" }}>Scripture:</div>
                <div style={{ fontFamily: "var(--font-poppins)", fontSize: "14px", color: Blue700, fontWeight: 600 }}>
                  {sermon.scripture}
                </div>
              </div>
            )}

            {sermon.tags && sermon.tags.length > 0 && (
              <div>
                <div style={{ ...T.eyebrow, color: Slate500, marginBottom: "8px" }}>Tags:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {sermon.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: "3px 8px",
                        backgroundColor: Paper100,
                        border: `1px solid ${Paper300}`,
                        borderRadius: "3px",
                        fontSize: "11px",
                        color: Slate600,
                        fontFamily: "var(--font-poppins)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* In-Page Share Links */}
            <div style={{ marginTop: "16px", paddingTop: "20px", borderTop: `1px solid ${Paper300}` }}>
              <div style={{ ...T.eyebrow, color: Slate500, marginBottom: "12px" }}>Share this message:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a
                  href={`https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: "12px",
                    color: "#16A34A",
                    textDecoration: "none",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  💬 Share on WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "var(--font-body, var(--font-poppins))",
                    fontSize: "12px",
                    color: Navy,
                    textDecoration: "none",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  𝕏 Share on X
                </a>
                <button
                  onClick={copyUrl}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontFamily: "var(--font-poppins)",
                    fontSize: "12px",
                    color: Blue700,
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: 600,
                  }}
                >
                  {copied ? "✓ Link Copied!" : "📋 Copy Link"}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column — Overview notes */}
        <article style={{ flex: "1 1 500px", minWidth: 0 }}>
          <h2
            style={{
              ...T.overviewTitle,
              color: Navy,
              margin: "0 0 24px",
              paddingBottom: "16px",
              borderBottom: `2px solid ${Paper200}`,
            }}
          >
            Overview
          </h2>

          <div style={T.readBody}>
            {sermon.summary ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: sermon.summary.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>"),
                }}
              />
            ) : (
              <p>Teaching by {sermon.speaker || "Dr. Joshua Agunbiade"}.</p>
            )}
          </div>
        </article>
      </section>

      {/* ── REST OF THE SERIES / RELATED SECTION ── */}
      {relatedSermons.length > 0 && (
        <section style={{ backgroundColor: Paper100, padding: "80px 6%" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ ...T.eyebrow, color: Blue500, marginBottom: "8px" }}>
              {sermon.series && relatedSermons.some(r => r.series === sermon.series)
                ? "REST OF THE SERIES"
                : "MORE TEACHINGS"}
            </div>
            <h2
              style={{
                fontFamily: "var(--font-poppins)",
                fontWeight: 700,
                color: Navy,
                fontSize: "clamp(24px, 4vw, 38px)",
                margin: "0 0 40px",
                textTransform: "uppercase",
              }}
            >
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

      {/* ── SHARE MODAL FALLBACK ── */}
      {shareOpen && (
        <div
          onClick={() => setShareOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: White,
              borderRadius: "12px",
              padding: "28px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "16px", color: Navy, margin: 0 }}>
                Share this Sermon
              </h3>
              <button
                onClick={() => setShareOpen(false)}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: Slate500 }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontFamily: "var(--font-poppins)", fontSize: "13px", color: Slate600, margin: "0 0 20px" }}>
              {sermon.title}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "12px",
                  borderRadius: "6px",
                  backgroundColor: "#DCFCE7",
                  color: "#166534",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  textAlign: "center",
                  fontFamily: "var(--font-poppins)",
                }}
              >
                Share via WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "12px",
                  borderRadius: "6px",
                  backgroundColor: "#F1F5F9",
                  color: Navy,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  textAlign: "center",
                  fontFamily: "var(--font-poppins)",
                }}
              >
                Share via X (Twitter)
              </a>
              <button
                onClick={copyUrl}
                style={{
                  padding: "12px",
                  borderRadius: "6px",
                  backgroundColor: Blue700,
                  color: White,
                  border: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "var(--font-poppins)",
                }}
              >
                {copied ? "✓ Copied to Clipboard!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
