"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ─── Design Tokens (TPH Design System v2.0) ─── */
const Navy     = "#151A54";
const Slate600 = "#4A62A0";
const Blue500  = "#2090FF";
const Blue700  = "#0140C1";
const Blue300  = "#6496EF";
const Paper100 = "#F4F6FB";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const Paper400 = "#C0C9E0";
const Slate500 = "#747CA1";
const White    = "#FFFFFF";

const T = {
  displayL:  { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 3.2vw, 36px)", lineHeight: "1.08em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  displayM:  { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", lineHeight: "1.14em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  eyebrow:   { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  readBody:  { fontFamily: "var(--font-serif, 'Playfair Display', Georgia, serif)", fontWeight: 400, fontSize: "17px", lineHeight: "1.68em" },
  button:    { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  colophon:  { fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  badge:     { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" as const },
};

export interface TeachingSlideData {
  id: string;
  title: string;
  seriesEyebrow: string;
  desc: string;
  btn1Label: string;
  btn1Url: string;
  btn2Label: string;
  btn2Url: string;
  imageUrl: string;
  colophon: string[];
  rankLabel: string;
  date?: string;
  duration?: string;
}

interface LatestTeachingCarouselProps {
  sermons?: any[];
  cmsSettings?: any;
  defaultTeaching?: any;
}

const FALLBACK_SLIDES: TeachingSlideData[] = [
  {
    id: "fallback-1",
    title: "A Workman Unashamed",
    seriesEyebrow: "Foundations · Part Eight",
    desc: "What Paul asks of anyone who handles Scripture in public, and why accuracy is a matter of love before it is a matter of scholarship.",
    btn1Label: "Listen — 48:12",
    btn1Url: "/resources",
    btn2Label: "Read The Transcript",
    btn2Url: "/resources",
    imageUrl: "/images/sermon-v2.webp",
    colophon: ["2 Timothy 2:15", "Foundations", "Dr. Joshua Agunbiade", "Jos", "48:12"],
    rankLabel: "Latest Release",
  },
  {
    id: "fallback-2",
    title: "The Ministry of Reconciliation",
    seriesEyebrow: "Apostolic Order · Part Four",
    desc: "Understanding the divine delegation committed unto every believer — that God was in Christ reconciling the world unto Himself.",
    btn1Label: "Listen — 52:40",
    btn1Url: "/resources",
    btn2Label: "Read The Transcript",
    btn2Url: "/resources",
    imageUrl: "/images/fol-gallery-1.png",
    colophon: ["2 Corinthians 5:18", "Apostolic Order", "Dr. Joshua Agunbiade", "Jos", "52:40"],
    rankLabel: "2nd Most Recent",
  },
  {
    id: "fallback-3",
    title: "The Mystery of the Gospel",
    seriesEyebrow: "Ephesians Expository",
    desc: "An examination of the unsearchable riches of Christ and how the manifold wisdom of God is revealed through the Church.",
    btn1Label: "Listen — 55:10",
    btn1Url: "/resources",
    btn2Label: "Read The Transcript",
    btn2Url: "/resources",
    imageUrl: "/images/fol-gallery-2.png",
    colophon: ["Ephesians 3:8-10", "Ephesians", "Dr. Joshua Agunbiade", "Jos", "55:10"],
    rankLabel: "3rd Most Recent",
  },
  {
    id: "fallback-4",
    title: "Rooted and Grounded in Love",
    seriesEyebrow: "Spiritual Maturity · Part Two",
    desc: "Moving beyond surface doctrines to the deep experiential comprehension of the breadth, length, depth, and height of God's love.",
    btn1Label: "Listen — 46:30",
    btn1Url: "/resources",
    btn2Label: "Read The Transcript",
    btn2Url: "/resources",
    imageUrl: "/images/fol-gallery-3.png",
    colophon: ["Ephesians 3:17-19", "Spiritual Maturity", "Dr. Joshua Agunbiade", "Jos", "46:30"],
    rankLabel: "4th Most Recent",
  },
  {
    id: "fallback-5",
    title: "The Living Word and Spiritual Perception",
    seriesEyebrow: "Hebrews Series · Part One",
    desc: "How the Word of God discerns the thoughts and intents of the heart, bringing the believer into alignment with eternity.",
    btn1Label: "Listen — 58:22",
    btn1Url: "/resources",
    btn2Label: "Read The Transcript",
    btn2Url: "/resources",
    imageUrl: "/images/sermon-hero.png",
    colophon: ["Hebrews 4:12", "Hebrews", "Dr. Joshua Agunbiade", "Jos", "58:22"],
    rankLabel: "5th Most Recent",
  },
];

export default function LatestTeachingCarousel({
  sermons = [],
  cmsSettings = {},
  defaultTeaching = {},
}: LatestTeachingCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // 1. Build the 5 slides
  const slides: TeachingSlideData[] = (() => {
    // Mode A: Manual Overrides from CMS
    if (
      cmsSettings.teachingMode === "manual" &&
      Array.isArray(cmsSettings.manualSlides) &&
      cmsSettings.manualSlides.length > 0
    ) {
      return cmsSettings.manualSlides.slice(0, 5).map((m: any, i: number) => ({
        id: m.id || `manual-${i}`,
        title: m.title || `Teaching ${i + 1}`,
        seriesEyebrow: m.seriesEyebrow || (m.series ? m.series : "Foundations"),
        desc: m.desc || m.summary || defaultTeaching.desc || "",
        btn1Label: m.btn1Label || "Listen Now",
        btn1Url: m.btn1Url || (m.id ? `/sermons/${m.id}` : "/resources"),
        btn2Label: m.btn2Label || "Read The Transcript",
        btn2Url: m.btn2Url || (m.id ? `/sermons/${m.id}` : "/resources"),
        imageUrl: m.imageUrl || "/images/sermon-v2.webp",
        colophon: m.colophon
          ? (Array.isArray(m.colophon) ? m.colophon : m.colophon.split(",").map((s: string) => s.trim()))
          : ["Dr. Joshua Agunbiade", "Jos"],
        rankLabel: i === 0 ? "Latest Release" : i === 1 ? "2nd Most Recent" : i === 2 ? "3rd Most Recent" : i === 3 ? "4th Most Recent" : "5th Most Recent",
      }));
    }

    // Mode B: Automatic from Sermons Database (top 5 by date)
    if (sermons && sermons.length > 0) {
      return sermons.slice(0, 5).map((s: any, i: number) => {
        const rankLabels = ["Latest Release", "2nd Most Recent", "3rd Most Recent", "4th Most Recent", "5th Most Recent"];
        const seriesEyebrow = s.series
          ? (s.scripture ? `${s.series} · ${s.scripture}` : s.series)
          : (s.scripture || cmsSettings.teachingSeriesEyebrow || defaultTeaching.teachingSeriesEyebrow || "Foundations");

        const btn1Label = s.duration ? `Listen — ${s.duration}` : "Listen Now";
        const btn1Url = `/sermons/${s.id}`;
        const btn2Label = cmsSettings.teachingBtn2Label || defaultTeaching.teachingBtn2Label || "Read The Transcript";
        const btn2Url = `/sermons/${s.id}`;

        const colophon = [
          s.scripture,
          s.series,
          s.speaker || "Dr. Joshua Agunbiade",
          s.date,
          s.duration,
        ].filter(Boolean);

        return {
          id: s.id,
          title: s.title || "Teaching",
          seriesEyebrow,
          desc: s.summary || defaultTeaching.teachingDesc || "Explore this apostolic teaching from The Publishers House.",
          btn1Label,
          btn1Url,
          btn2Label,
          btn2Url,
          imageUrl: s.thumbnailUrl || "/images/sermon-v2.webp",
          colophon: colophon.length > 0 ? colophon : ["Dr. Joshua Agunbiade", "Jos"],
          rankLabel: rankLabels[i] || `${i + 1}th Recent`,
          date: s.date,
          duration: s.duration,
        };
      });
    }

    // Mode C: Fallbacks
    return FALLBACK_SLIDES;
  })();

  const totalSlides = slides.length;
  const currentSlide = slides[activeIndex] || slides[0];

  const handleSlideChange = useCallback(
    (newIndex: number) => {
      if (newIndex === activeIndex || isFading) return;
      setIsFading(true);
      setTimeout(() => {
        setActiveIndex(newIndex);
        setIsFading(false);
      }, 180);
    },
    [activeIndex, isFading]
  );

  const nextSlide = useCallback(() => {
    handleSlideChange((activeIndex + 1) % totalSlides);
  }, [activeIndex, totalSlides, handleSlideChange]);

  const prevSlide = useCallback(() => {
    handleSlideChange((activeIndex - 1 + totalSlides) % totalSlides);
  }, [activeIndex, totalSlides, handleSlideChange]);

  // Autoplay timer: advances every 8 seconds when not paused
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const interval = setInterval(() => {
      handleSlideChange((activeIndex + 1) % totalSlides);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeIndex, isPaused, totalSlides, handleSlideChange]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  const sectionEyebrow = cmsSettings.teachingEyebrow || defaultTeaching.teachingEyebrow || "The Latest Teaching";
  const sectionHeading = cmsSettings.teachingHeading || defaultTeaching.teachingHeading || "Published This Week";

  return (
    <section
      className="tph-section"
      style={{ backgroundColor: Paper100 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="tph-inner">
        {/* ── Section Header with Carousel Controls ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <div>
            <div style={{ ...T.eyebrow, color: Slate500, marginBottom: "8px" }}>
              {sectionEyebrow}
            </div>
            <h2 style={{ ...T.displayM, color: Navy, margin: 0 }}>
              {sectionHeading}
            </h2>
          </div>

          {/* Carousel Navigation Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* 5 Slide Indicator Pills */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: White,
                border: `1px solid ${Paper300}`,
                borderRadius: "30px",
                padding: "4px 8px",
              }}
            >
              {slides.map((s, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => handleSlideChange(idx)}
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      fontSize: "11px",
                      letterSpacing: "0.08em",
                      border: "none",
                      borderRadius: "20px",
                      padding: isActive ? "5px 12px" : "5px 9px",
                      backgroundColor: isActive ? Blue700 : "transparent",
                      color: isActive ? White : Slate500,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    title={`Slide ${idx + 1}: ${s.title}`}
                  >
                    <span>0{idx + 1}</span>
                    {isActive && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 500,
                          opacity: 0.9,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        · {idx === 0 ? "Latest" : "Recent"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Prev / Next Chevrons */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous teaching"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: `1px solid ${Paper300}`,
                  backgroundColor: White,
                  color: Navy,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: 700,
                  transition: "all 0.15s ease",
                }}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next teaching"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: `1px solid ${Paper300}`,
                  backgroundColor: White,
                  color: Navy,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: 700,
                  transition: "all 0.15s ease",
                }}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* ── Featured Teaching Slide Card ── */}
        <div
          style={{
            backgroundColor: White,
            border: `1px solid ${Paper300}`,
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(21, 26, 84, 0.04)",
            opacity: isFading ? 0.35 : 1,
            transform: isFading ? "scale(0.995)" : "scale(1)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
        >
          <div className="tph-two-col" style={{ gap: "0" }}>
            {/* Left Column: Sermon Cover / Video Thumbnail */}
            <Link
              href={currentSlide.btn1Url}
              style={{
                display: "block",
                position: "relative",
                backgroundImage: `url('${currentSlide.imageUrl}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "380px",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              {/* Dark subtle gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(21, 26, 84, 0.3) 0%, rgba(21, 26, 84, 0.65) 100%)",
                }}
              />

              {/* Rank Pill in Top Left */}
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "20px",
                  backgroundColor: "rgba(21, 26, 84, 0.88)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  borderRadius: "20px",
                  padding: "5px 12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: Blue500 }} />
                <span
                  style={{
                    ...T.badge,
                    color: White,
                    fontSize: "10px",
                  }}
                >
                  0{activeIndex + 1} / 05 · {currentSlide.rankLabel}
                </span>
              </div>

              {/* Play Badge Icon at Center */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(1, 64, 193, 0.85)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: White,
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                  transition: "transform 0.2s ease",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* Duration badge at bottom right */}
              {currentSlide.duration && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    backdropFilter: "blur(4px)",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: White,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {currentSlide.duration}
                </div>
              )}
            </Link>

            {/* Right Column: Teaching Content, Overview & Actions */}
            <div
              style={{
                padding: "40px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "18px",
              }}
            >
              {/* Series / Topic Eyebrow */}
              <div style={{ ...T.eyebrow, color: Blue500 }}>
                {currentSlide.seriesEyebrow}
              </div>

              {/* Sermon Title */}
              <h3
                style={{
                  ...T.displayL,
                  color: Navy,
                  margin: 0,
                }}
              >
                <Link
                  href={currentSlide.btn1Url}
                  style={{ color: Navy, textDecoration: "none" }}
                >
                  {currentSlide.title}
                </Link>
              </h3>

              {/* Overview / Synopsis Body */}
              <p
                style={{
                  ...T.readBody,
                  color: Slate600,
                  margin: 0,
                  maxWidth: "64ch",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {currentSlide.desc}
              </p>

              {/* Action Buttons Row */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "4px" }}>
                <Link
                  href={currentSlide.btn1Url}
                  style={{
                    ...T.button,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "48px",
                    padding: "0 26px",
                    borderRadius: "2px",
                    backgroundColor: Blue700,
                    color: White,
                    textDecoration: "none",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {currentSlide.btn1Label}
                </Link>

                <Link
                  href={currentSlide.btn2Url}
                  style={{
                    ...T.button,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "48px",
                    padding: "0 26px",
                    borderRadius: "2px",
                    border: `1px solid ${Paper300}`,
                    backgroundColor: "transparent",
                    color: Navy,
                    textDecoration: "none",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {currentSlide.btn2Label}
                </Link>
              </div>

              {/* Colophon Metadata Strip */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  paddingTop: "16px",
                  borderTop: `1px solid ${Paper200}`,
                }}
              >
                {currentSlide.colophon.map((item: string, i: number, arr: string[]) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ ...T.colophon, color: i === 0 ? Blue700 : Slate500 }}>
                      {item}
                    </span>
                    {i < arr.length - 1 && (
                      <span style={{ ...T.colophon, color: Paper400 }}>·</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Slide Indicators for Mobile / Quick Glances */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            marginTop: "20px",
          }}
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSlideChange(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: idx === activeIndex ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                backgroundColor: idx === activeIndex ? Blue700 : Paper300,
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
