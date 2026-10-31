"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAudio } from "@/components/GlobalAudioPlayer";
import type { PlaybackRecord } from "@/app/api/portal/playback/route";

function formatSeconds(secs: number): string {
  if (isNaN(secs) || secs < 0) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function MemberMediaPage() {
  const [history, setHistory] = useState<PlaybackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { playVideo, playAudio } = useAudio();

  const loadHistory = async () => {
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

      setHistory(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    const handleUpdate = () => loadHistory();
    window.addEventListener("tph_playback_update", handleUpdate);
    return () => window.removeEventListener("tph_playback_update", handleUpdate);
  }, []);

  const handleResume = (item: PlaybackRecord) => {
    if (item.videoUrl && !item.spotifyEpisodeId) {
      playVideo(
        {
          id: item.id,
          title: item.title,
          speaker: item.speaker,
          series: item.series,
          scripture: item.scripture,
          videoUrl: item.videoUrl,
          audioUrl: item.audioUrl,
          spotifyEpisodeId: item.spotifyEpisodeId,
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
          spotifyEpisodeId: item.spotifyEpisodeId,
          type: item.type,
          resourceSlug: item.resourceSlug,
        },
        item.progressSeconds
      );
    }
  };

  const handlePlayFromStart = (item: PlaybackRecord) => {
    if (item.videoUrl && !item.spotifyEpisodeId) {
      playVideo(
        {
          id: item.id,
          title: item.title,
          speaker: item.speaker,
          series: item.series,
          scripture: item.scripture,
          videoUrl: item.videoUrl,
          audioUrl: item.audioUrl,
          spotifyEpisodeId: item.spotifyEpisodeId,
          type: item.type,
          resourceSlug: item.resourceSlug,
        },
        0
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
          spotifyEpisodeId: item.spotifyEpisodeId,
          type: item.type,
          resourceSlug: item.resourceSlug,
        },
        0
      );
    }
  };

  const continueItems = history.filter((i) => !i.completed && i.progressSeconds > 10);
  const completedItems = history.filter((i) => i.completed || i.percent >= 90);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
          Media Library · Cross-Platform Sync
        </div>
        <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 32px)", color: "#141C6E", margin: 0 }}>
          My Media &amp; Playback History
        </h1>
        <p style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontStyle: "italic", fontSize: "14.5px", color: "#4A5490", marginTop: "6px" }}>
          Pick up right where you left off on any sermon or resource curriculum teaching across all devices.
        </p>
      </div>

      {/* Quick Library Links */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link
          href="/sermons"
          style={{
            padding: "10px 18px",
            backgroundColor: "#0140C1",
            color: "#FFFFFF",
            borderRadius: "8px",
            fontSize: "12.5px",
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>🎙️</span>
          <span>Browse All Sermons</span>
        </Link>
        <Link
          href="/resources"
          style={{
            padding: "10px 18px",
            backgroundColor: "#FFFFFF",
            color: "#141C6E",
            border: "1px solid #D5DCF2",
            borderRadius: "8px",
            fontSize: "12.5px",
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>📚</span>
          <span>Curriculum &amp; Resource Tracks</span>
        </Link>
      </div>

      {/* SECTION 1: CONTINUE LISTENING */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 700, color: "#141C6E", margin: 0 }}>
              Continue Listening &amp; Watching
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0" }}>
              Teachings in progress with saved timestamps.
            </p>
          </div>
          <span style={{ fontSize: "12px", color: "#2090FF", fontWeight: 700 }}>
            {continueItems.length} In Progress
          </span>
        </div>

        {continueItems.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {continueItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderRadius: "10px",
                  backgroundColor: "#F8FAFD",
                  border: "1px solid #E4ECF9",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "260px", flex: 1 }}>
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: "64px", height: "64px", borderRadius: "8px", backgroundColor: "#0E1556", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                      ▶
                    </div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#0140C1", textTransform: "uppercase" }}>
                      {item.type === "resource" ? "Course Curriculum" : "Sermon Series"} {item.series ? `• ${item.series}` : ""}
                    </div>
                    <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 700, fontSize: "15px", color: "#141C6E", marginTop: "2px" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                      {item.speaker || "Dr. Joshua Agunbiade"} • {formatSeconds(item.progressSeconds)} / {formatSeconds(item.durationSeconds)} ({item.percent}%)
                    </div>
                    {/* Progress bar */}
                    <div style={{ width: "100%", maxWidth: "340px", height: "4px", backgroundColor: "#E2E8F0", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
                      <div style={{ width: `${Math.max(4, item.percent)}%`, height: "100%", backgroundColor: "#2090FF", borderRadius: "2px" }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    onClick={() => handleResume(item)}
                    style={{
                      padding: "10px 18px",
                      backgroundColor: "#2090FF",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>▶</span>
                    <span>Resume at {formatSeconds(item.progressSeconds)}</span>
                  </button>
                  <button
                    onClick={() => handlePlayFromStart(item)}
                    style={{
                      padding: "9px 12px",
                      backgroundColor: "#FFFFFF",
                      color: "#4A5490",
                      border: "1px solid #D5DCF2",
                      borderRadius: "6px",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    title="Play from start"
                  >
                    Restart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "36px 20px", color: "#747CA1", fontSize: "13.5px" }}>
            No unfinished teachings in progress. Click on any sermon or resource lesson to start listening!
          </div>
        )}
      </div>

      {/* SECTION 2: RECENTLY PLAYED & COMPLETED */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 700, color: "#141C6E", margin: "0 0 6px" }}>
          Recently Completed &amp; Listened
        </h2>
        <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 20px" }}>
          Teachings and messages you have fully finished.
        </p>

        {completedItems.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {completedItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  borderRadius: "8px",
                  backgroundColor: "#F8FAFD",
                  border: "1px solid #E8EDFB",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#10B981", textTransform: "uppercase" }}>
                    Completed ✓ • {item.series || item.type}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#141C6E", marginTop: "2px" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#747CA1", marginTop: "2px" }}>
                    {item.speaker || "Dr. Joshua Agunbiade"}
                  </div>
                </div>

                <button
                  onClick={() => handlePlayFromStart(item)}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: "#EEF4FF",
                    color: "#0140C1",
                    border: "1px solid #C4D7FE",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Play Again ↺
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "30px 20px", color: "#747CA1", fontSize: "13px" }}>
            Completed messages will automatically appear here once you finish listening.
          </div>
        )}
      </div>
    </div>
  );
}
