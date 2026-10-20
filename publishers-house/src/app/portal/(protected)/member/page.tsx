"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";
import { getPortalUser, PortalUser, UNITS, getTierLabel, getRoleLabel } from "@/lib/portalAuth";
import { getSermons, getArticles, Sermon, Article } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useAudio } from "@/components/GlobalAudioPlayer";
import type { PlaybackRecord } from "@/app/api/portal/playback/route";

function formatSeconds(secs: number): string {
  if (isNaN(secs) || secs < 0) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function FashionableMemberDashboard() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentSermons, setRecentSermons] = useState<Sermon[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [continueItem, setContinueItem] = useState<PlaybackRecord | null>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<PlaybackRecord[]>([]);

  // Upcoming Events Carousel State
  const [eventSlide, setEventSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);

  const UPCOMING_EVENTS = [
    {
      id: "shout-of-a-king",
      badge: "Flagship Event",
      category: "Annual Apostolic Convocation",
      title: "Shout of a King",
      scripture: "Numbers 23:21",
      date: "Coming This Season",
      venue: "The House of Bread, Korinjoh House, Jos",
      time: "Evening Rallies & Morning Conclaves",
      summary: "Annual apostolic victory and high praise convocation. A sacred assembly where the voice of triumph resounds, unveiling kingdom dominion, healing, and prophetic empowerment.",
      themeColor: "#F59E0B",
      bgGradient: "linear-gradient(135deg, #0E1556 0%, #1E1B4B 45%, #0B0E14 100%)",
      glowColor: "rgba(245, 158, 11, 0.22)",
      href: "/events",
      actionText: "View Convocation Details →",
    },
    {
      id: "merismos",
      badge: "Apostolic Conclave",
      category: "Doctrinal Deep-Dive Encounter",
      title: "Merismos",
      scripture: "Hebrews 4:12",
      date: "Annual Believers Conclave",
      venue: "Jos Headquarters Sanctuary",
      time: "Intensive Word Exposition",
      summary: "A power-packed encounter where the Word of God is rightly divided—discerning soul and spirit, joints and marrow—purifying apostolic doctrine and igniting personal consecration.",
      themeColor: "#2090FF",
      bgGradient: "linear-gradient(135deg, #0E1556 0%, #0369A1 45%, #0B0E14 100%)",
      glowColor: "rgba(32, 144, 255, 0.28)",
      href: "/programs",
      actionText: "Explore Merismos Curriculum →",
    },
    {
      id: "sunday-service-oct-25",
      badge: "Next Gathering",
      category: "Sunday Corporate Encounter",
      title: "Sunday Word & Worship Encounter",
      scripture: "Acts 2:42",
      date: "Sunday, 25th October 2026",
      venue: "The House of Bread, Korinjoh House, British, Jos",
      time: "9:00 AM West Africa Time",
      summary: "Join Dr. Joshua Agunbiade and the Company of the Great for our weekly apostolic assembly. Experience the undiluted preaching of the Word, corporate worship, and divine transformation.",
      themeColor: "#10B981",
      bgGradient: "linear-gradient(135deg, #0E1556 0%, #065F46 45%, #0B0E14 100%)",
      glowColor: "rgba(16, 185, 129, 0.25)",
      href: "/contact",
      actionText: "Service Details & Directions →",
    },
  ];

  useEffect(() => {
    if (carouselPaused) return;
    const timer = setInterval(() => {
      setEventSlide((prev) => (prev + 1) % UPCOMING_EVENTS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [carouselPaused, UPCOMING_EVENTS.length]);

  // Fast action states
  const [prayerContent, setPrayerContent] = useState("");
  const [prayerSubmitting, setPrayerSubmitting] = useState(false);
  const [prayerSuccess, setPrayerSuccess] = useState(false);

  const { playVideo, playAudio } = useAudio();

  // Load user & church feeds
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const portalUser = await getPortalUser(firebaseUser.uid);
        setUser(portalUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const loadChurchData = async () => {
      try {
        const [sermonsData, articlesData] = await Promise.all([
          getSermons(3),
          getArticles(3),
        ]);
        setRecentSermons(sermonsData);
        setRecentArticles(articlesData);
      } catch (err) {
        console.error("Error loading dashboard feeds:", err);
      }
    };
    loadChurchData();

    return () => unsub();
  }, []);

  // Load Playback State from API & LocalStorage
  const syncPlayback = async () => {
    try {
      let items: PlaybackRecord[] = [];
      const res = await fetch("/api/portal/playback");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          items = data.items;
        }
      }

      if (items.length === 0 && typeof window !== "undefined") {
        const raw = localStorage.getItem("tph_playback_history");
        if (raw) {
          items = JSON.parse(raw);
        }
      }

      if (Array.isArray(items)) {
        // In-progress item
        const unfinished = items.find((i) => !i.completed && i.progressSeconds > 10);
        setContinueItem(unfinished || null);

        // Completed / recently engaged
        const completed = items.filter((i) => i.completed || i.percent >= 90).slice(0, 3);
        setRecentlyPlayed(completed);
      }
    } catch (e) {
      console.error("Failed to sync playback state:", e);
    }
  };

  useEffect(() => {
    syncPlayback();
    const handleUpdate = () => syncPlayback();
    window.addEventListener("tph_playback_update", handleUpdate);
    return () => window.removeEventListener("tph_playback_update", handleUpdate);
  }, []);

  const handleResume = (item: PlaybackRecord) => {
    if (item.videoUrl) {
      playVideo(
        {
          id: item.id,
          title: item.title,
          speaker: item.speaker,
          series: item.series,
          scripture: item.scripture,
          videoUrl: item.videoUrl,
          audioUrl: item.audioUrl,
          type: item.type,
          resourceSlug: item.resourceSlug,
        },
        item.progressSeconds
      );
    } else {
      playAudio(
        {
          id: item.id,
          title: item.title,
          speaker: item.speaker,
          series: item.series,
          scripture: item.scripture,
          videoUrl: item.videoUrl,
          audioUrl: item.audioUrl,
          type: item.type,
          resourceSlug: item.resourceSlug,
        },
        item.progressSeconds
      );
    }
  };

  const handleMarkCompleted = async (item: PlaybackRecord) => {
    const updated: PlaybackRecord = {
      ...item,
      completed: true,
      percent: 100,
      updatedAt: new Date().toISOString(),
    };
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("tph_playback_history");
        let list: PlaybackRecord[] = raw ? JSON.parse(raw) : [];
        list = list.map((l) => (l.id === item.id ? updated : l));
        localStorage.setItem("tph_playback_history", JSON.stringify(list));
      }
      await fetch("/api/portal/playback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      syncPlayback();
    } catch {}
  };

  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerContent.trim() || !user) return;
    setPrayerSubmitting(true);
    try {
      await addDoc(collection(db, "prayers"), {
        content: prayerContent.trim(),
        status: "pending",
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      });
      setPrayerSuccess(true);
      setPrayerContent("");
      setTimeout(() => setPrayerSuccess(false), 4500);
    } catch (e) {
      console.error(e);
    } finally {
      setPrayerSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "#1F46C8", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
        Loading your personal member portal...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "40px", color: "#DC2626", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
        Session expired. Please log in to continue.
      </div>
    );
  }

  const unitName = user.assignedUnitId
    ? UNITS.find((u) => u.id === user.assignedUnitId)?.name || user.assignedUnitId
    : null;

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "1280px", margin: "0 auto" }}>
      
      {/* ── 1. PERSONALIZED WELCOME GREETING (ABOVE THE CARD) ───────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "20px",
                backgroundColor: "rgba(31, 70, 200, 0.1)",
                border: "1px solid rgba(31, 70, 200, 0.25)",
                color: "#1F46C8",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "10.5px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              Company of the Great · Psalm 68:11
            </span>
            <span style={{ fontSize: "12px", color: "#94A3B8" }}>•</span>
            <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 500, fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
              {todayLabel}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 800,
              fontSize: "clamp(26px, 3.5vw, 36px)",
              lineHeight: "1.15em",
              margin: "0 0 10px",
              color: "#0E1556",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome back, {user.displayName}!
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif, 'Playfair Display', serif)",
              fontStyle: "italic",
              fontSize: "16px",
              color: "#4A62A0",
              margin: 0,
              maxWidth: "760px",
              lineHeight: "1.6em",
            }}
          >
            &ldquo;The Lord gave the word: great was the company of those that published it.&rdquo; Stand equipped in biblical doctrine, fervent prayer, and righteous service.
          </p>
        </div>

        {/* Member Status & Campus Badges */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 14px",
              borderRadius: "8px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              boxShadow: "0 2px 8px rgba(14,21,86,0.04)",
              color: "#141C6E",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
            <span>Campus: {user.campus === "abuja" ? "Abuja Center" : "Jos Sanctuary"}</span>
          </div>
          <div
            style={{
              padding: "7px 14px",
              borderRadius: "8px",
              backgroundColor: "#EEF2FB",
              border: "1px solid #D5DCF2",
              color: "#0140C1",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {getTierLabel(user.activityTier)} • {unitName || "General Assembly"}
          </div>
        </div>
      </div>

      {/* ── 2. UPCOMING EVENTS CAROUSEL (THE BLUE CARD) ──────────────── */}
      <div
        onMouseEnter={() => setCarouselPaused(true)}
        onMouseLeave={() => setCarouselPaused(false)}
        style={{
          position: "relative",
          borderRadius: "16px",
          padding: "36px 40px",
          background: UPCOMING_EVENTS[eventSlide].bgGradient,
          color: "#FFFFFF",
          overflow: "hidden",
          border: `1px solid rgba(255, 255, 255, 0.14)`,
          boxShadow: `0 12px 36px rgba(14, 21, 86, 0.22)`,
          transition: "all 0.4s ease",
        }}
      >
        {/* Decorative background glow matching current event theme */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${UPCOMING_EVENTS[eventSlide].glowColor} 0%, transparent 70%)`,
            pointerEvents: "none",
            transition: "all 0.5s ease",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Top Row: Category Eyebrow, Badge & Carousel Navigation Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  border: `1px solid ${UPCOMING_EVENTS[eventSlide].themeColor}88`,
                  color: UPCOMING_EVENTS[eventSlide].themeColor,
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                {UPCOMING_EVENTS[eventSlide].badge}
              </span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>•</span>
              <span
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12px",
                  color: "#A9C2FF",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {UPCOMING_EVENTS[eventSlide].category}
              </span>
            </div>

            {/* Carousel Arrow Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "rgba(255,255,255,0.6)", marginRight: "6px" }}>
                {eventSlide + 1} / {UPCOMING_EVENTS.length}
              </span>
              <button
                onClick={() => setEventSlide((prev) => (prev - 1 + UPCOMING_EVENTS.length) % UPCOMING_EVENTS.length)}
                aria-label="Previous event"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  transition: "background 0.2s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
              >
                ‹
              </button>
              <button
                onClick={() => setEventSlide((prev) => (prev + 1) % UPCOMING_EVENTS.length)}
                aria-label="Next event"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  transition: "background 0.2s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
              >
                ›
              </button>
            </div>
          </div>

          {/* Main Event Content */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "28px", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 800,
                    fontSize: "clamp(24px, 3.2vw, 34px)",
                    lineHeight: "1.15em",
                    margin: 0,
                    letterSpacing: "-0.01em",
                    color: "#FFFFFF",
                  }}
                >
                  {UPCOMING_EVENTS[eventSlide].title}
                </h2>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontSize: "11px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 600,
                    color: "#A9C2FF",
                  }}
                >
                  {UPCOMING_EVENTS[eventSlide].scripture}
                </span>
              </div>

              {/* Date & Location Line */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "13px",
                  color: UPCOMING_EVENTS[eventSlide].themeColor,
                  fontWeight: 600,
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>📅</span>
                  <span>{UPCOMING_EVENTS[eventSlide].date}</span>
                </span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#E2E8F0" }}>
                  <span>⏰</span>
                  <span>{UPCOMING_EVENTS[eventSlide].time}</span>
                </span>
              </div>

              {/* Summary Description */}
              <p
                style={{
                  fontFamily: "var(--font-serif, 'Playfair Display', serif)",
                  fontSize: "15.5px",
                  color: "rgba(255, 255, 255, 0.88)",
                  margin: 0,
                  maxWidth: "760px",
                  lineHeight: "1.65em",
                }}
              >
                {UPCOMING_EVENTS[eventSlide].summary}
              </p>
            </div>

            {/* Action CTA */}
            <div style={{ flexShrink: 0 }}>
              <Link
                href={UPCOMING_EVENTS[eventSlide].href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "13px 24px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  color: "#0E1556",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 700,
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = UPCOMING_EVENTS[eventSlide].themeColor;
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.color = "#0E1556";
                }}
              >
                {UPCOMING_EVENTS[eventSlide].actionText}
              </Link>
            </div>
          </div>

          {/* Bottom Tabs / Direct Slide Selectors */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              flexWrap: "wrap",
            }}
          >
            {UPCOMING_EVENTS.map((ev, idx) => {
              const isActive = idx === eventSlide;
              return (
                <button
                  key={ev.id}
                  onClick={() => setEventSlide(idx)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    backgroundColor: isActive ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)",
                    border: isActive ? `1px solid ${ev.themeColor}` : "1px solid rgba(255,255,255,0.12)",
                    color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.65)",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "11px",
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {idx + 1}. {ev.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. CONTINUE LISTENING / WATCHING CARD ───────────────────── */}
      {continueItem && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "2px solid #2090FF",
            borderRadius: "14px",
            padding: "24px 28px",
            boxShadow: "0 4px 20px rgba(32, 144, 255, 0.12)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px", minWidth: "280px", flex: 1 }}>
            {continueItem.thumbnailUrl ? (
              <img
                src={continueItem.thumbnailUrl}
                alt={continueItem.title}
                style={{ width: "70px", height: "70px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "8px",
                  backgroundColor: "#0E1556",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                ▶
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor: "#EBF3FE",
                    color: "#0140C1",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Continue Listening
                </span>
                <span style={{ fontSize: "11px", color: "#747CA1" }}>
                  {continueItem.percent}% complete
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#141C6E",
                  margin: "0 0 4px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {continueItem.title}
              </h3>
              <div style={{ fontSize: "12px", color: "#4A5490" }}>
                {continueItem.speaker || "Dr. Joshua Agunbiade"} {continueItem.series ? `• ${continueItem.series}` : ""}
              </div>

              {/* Progress bar */}
              <div style={{ width: "100%", height: "5px", backgroundColor: "#E8ECF7", borderRadius: "3px", marginTop: "10px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.max(5, continueItem.percent)}%`,
                    height: "100%",
                    backgroundColor: "#2090FF",
                    borderRadius: "3px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={() => handleResume(continueItem)}
              style={{
                padding: "12px 22px",
                backgroundColor: "#2090FF",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(32, 144, 255, 0.3)",
              }}
            >
              <span>▶</span>
              <span>Resume at {formatSeconds(continueItem.progressSeconds)}</span>
            </button>
            <button
              onClick={() => handleMarkCompleted(continueItem)}
              style={{
                padding: "11px 16px",
                backgroundColor: "#F4F6FB",
                color: "#4A5490",
                border: "1px solid #D5DCF2",
                borderRadius: "8px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="Mark as finished"
            >
              Done ✓
            </button>
          </div>
        </div>
      )}

      {/* ── 3. MAIN DASHBOARD GRID (Sermons, Articles & Unit) ─────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "28px" }}>
        
        {/* FRESH WORD: LATEST TEACHINGS */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid #D5DCF2",
            padding: "26px",
            boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                Fresh Word
              </div>
              <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 700, color: "#141C6E", margin: "2px 0 0" }}>
                Recent Sermons &amp; Expositions
              </h2>
            </div>
            <Link href="/sermons" style={{ fontSize: "12px", color: "#2090FF", fontWeight: 600, textDecoration: "none" }}>
              All Sermons →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
            {recentSermons.slice(0, 3).map((sermon) => (
              <div
                key={sermon.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  backgroundColor: "#F8FAFD",
                  border: "1px solid #E4ECF9",
                  gap: "12px",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#2090FF", textTransform: "uppercase" }}>
                    {sermon.series || "Sermon"} {sermon.scripture ? `• ${sermon.scripture}` : ""}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontWeight: 700,
                      fontSize: "13.5px",
                      color: "#141C6E",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginTop: "2px",
                    }}
                  >
                    {sermon.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "#747CA1", marginTop: "2px" }}>
                    {sermon.speaker || "Dr. Joshua Agunbiade"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playVideo(sermon)}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    flexShrink: 0,
                  }}
                >
                  <span>▶</span>
                  <span>Play</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* EDITORIAL UNIT: ESSAYS & APOLOGETICS */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid #D5DCF2",
            padding: "26px",
            boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                Editorial Unit
              </div>
              <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 700, color: "#141C6E", margin: "2px 0 0" }}>
                Articles &amp; Doctrinal Essays
              </h2>
            </div>
            <Link href="/articles" style={{ fontSize: "12px", color: "#2090FF", fontWeight: 600, textDecoration: "none" }}>
              All Articles →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
            {recentArticles.slice(0, 3).map((art) => (
              <Link
                key={art.slug}
                href={`/articles/${art.slug}`}
                style={{
                  display: "block",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#F8FAFD",
                  border: "1px solid #E4ECF9",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#2090FF", textTransform: "uppercase" }}>
                  {art.categories?.[0] || "Apologetics"}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 700,
                    fontSize: "13.5px",
                    color: "#141C6E",
                    marginTop: "3px",
                    lineHeight: "1.35em",
                  }}
                >
                  {art.title}
                </div>
                <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "4px" }}>
                  By {art.author || "The Publishers House"} • Read Essay →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* MY SERVICE UNIT & DUTY SCHEDULE */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid #D5DCF2",
            padding: "26px",
            boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>
            Ministry Service
          </div>
          <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 700, color: "#141C6E", margin: "0 0 16px" }}>
            Service Unit &amp; Fellowship
          </h2>

          {unitName ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
              <div style={{ padding: "16px", backgroundColor: "#EEF4FF", borderRadius: "10px", border: "1px solid #C4D7FE" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#0140C1", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Active Assignment
                </span>
                <div style={{ fontSize: "17px", fontWeight: 800, color: "#141C6E", marginTop: "4px" }}>
                  {unitName}
                </div>
                <p style={{ fontSize: "12px", color: "#4A5490", margin: "4px 0 0" }}>
                  Coordinated under church pastoral administration.
                </p>
              </div>

              <div style={{ padding: "14px", backgroundColor: "#F8FAFD", borderRadius: "8px", border: "1px solid #E4ECF9" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Next Service Meeting</div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#141C6E", marginTop: "2px" }}>
                  Sunday Word &amp; Worship Encounter
                </div>
                <div style={{ fontSize: "11.5px", color: "#747CA1", marginTop: "2px" }}>
                  09:00 AM • Main Sanctuary
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                <Link
                  href="/portal/member/events"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "9px 12px",
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  View Schedule
                </Link>
                <Link
                  href="/portal/settings"
                  style={{
                    padding: "9px 12px",
                    backgroundColor: "#F4F6FB",
                    color: "#141C6E",
                    border: "1px solid #D5DCF2",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  My Unit Info
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ padding: "20px", backgroundColor: "#F8FAFD", borderRadius: "10px", border: "1px solid #E4ECF9", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#141C6E" }}>Join a Ministry Service Unit</div>
                <p style={{ fontSize: "12px", color: "#64748B", lineHeight: "1.55em", margin: "6px 0 0" }}>
                  Every believer is called to publish God&apos;s truth. Serve with Media, Editorial, Sanctuary, Welfare, or Protocol teams.
                </p>
              </div>
              <Link
                href="/portal/member/prayers"
                style={{
                  display: "inline-block",
                  textAlign: "center",
                  marginTop: "16px",
                  padding: "9px 14px",
                  backgroundColor: "#0140C1",
                  color: "#FFFFFF",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Inquire With Pastorate →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. QUICK ACTIONS: PRAYER POINT & NAVIGATION SHORTCUTS ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        
        {/* Fast Prayer Submission */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid #D5DCF2",
            padding: "26px",
            boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
          }}
        >
          <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Pastoral Altar
          </div>
          <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 700, color: "#141C6E", margin: "2px 0 6px" }}>
            Submit a Prayer Request
          </h2>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 16px" }}>
            The ministers and prayer band lift every petition before the altar of God.
          </p>

          <form onSubmit={handlePrayerSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <textarea
              value={prayerContent}
              onChange={(e) => setPrayerContent(e.target.value)}
              placeholder="Type your prayer request or spiritual burden here..."
              rows={3}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #D5DCF2",
                backgroundColor: "#F8FAFD",
                fontSize: "13px",
                color: "#141C6E",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {prayerSuccess ? (
                <span style={{ fontSize: "11.5px", color: "#166534", fontWeight: 600 }}>
                  Submitted to pastoral team ✓
                </span>
              ) : <div />}

              <button
                type="submit"
                disabled={prayerSubmitting || !prayerContent.trim()}
                style={{
                  padding: "9px 20px",
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: prayerSubmitting || !prayerContent.trim() ? "not-allowed" : "pointer",
                  opacity: prayerSubmitting || !prayerContent.trim() ? 0.6 : 1,
                }}
              >
                {prayerSubmitting ? "Submitting..." : "Send Petition"}
              </button>
            </div>
          </form>
        </div>

        {/* Member Navigation Hub */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid #D5DCF2",
            padding: "26px",
            boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Quick Hub
            </div>
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 700, color: "#141C6E", margin: "2px 0 16px" }}>
              Member Portals &amp; Resources
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <Link
                href="/portal/member/media"
                style={{
                  padding: "12px",
                  backgroundColor: "#F8FAFD",
                  borderRadius: "8px",
                  border: "1px solid #E4ECF9",
                  textDecoration: "none",
                  color: "#141C6E",
                  fontSize: "12.5px",
                  fontWeight: 600,
                }}
              >
                <div style={{ fontSize: "16px", marginBottom: "4px" }}>▶</div>
                Media &amp; History
              </Link>

              <Link
                href="/portal/member/courses"
                style={{
                  padding: "12px",
                  backgroundColor: "#F8FAFD",
                  borderRadius: "8px",
                  border: "1px solid #E4ECF9",
                  textDecoration: "none",
                  color: "#141C6E",
                  fontSize: "12.5px",
                  fontWeight: 600,
                }}
              >
                <div style={{ fontSize: "16px", marginBottom: "4px" }}>✦</div>
                Growth Track
              </Link>

              <Link
                href="/portal/member/prayers"
                style={{
                  padding: "12px",
                  backgroundColor: "#F8FAFD",
                  borderRadius: "8px",
                  border: "1px solid #E4ECF9",
                  textDecoration: "none",
                  color: "#141C6E",
                  fontSize: "12.5px",
                  fontWeight: 600,
                }}
              >
                <div style={{ fontSize: "16px", marginBottom: "4px" }}>♡</div>
                Prayer &amp; Testimony
              </Link>

              <Link
                href="/portal/member/events"
                style={{
                  padding: "12px",
                  backgroundColor: "#F8FAFD",
                  borderRadius: "8px",
                  border: "1px solid #E4ECF9",
                  textDecoration: "none",
                  color: "#141C6E",
                  fontSize: "12.5px",
                  fontWeight: 600,
                }}
              >
                <div style={{ fontSize: "16px", marginBottom: "4px" }}>◉</div>
                Church Events
              </Link>
            </div>
          </div>

          <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #E8ECF7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#747CA1" }}>Need help or counseling?</span>
            <Link href="/portal/settings" style={{ fontSize: "11.5px", color: "#0140C1", fontWeight: 600, textDecoration: "none" }}>
              My Profile Settings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
