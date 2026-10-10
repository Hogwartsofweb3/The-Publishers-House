"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react";
import type { Sermon } from "@/lib/firebase";
import Link from "next/link";

interface GlobalPlayerContextType {
  currentSermon: Sermon | null;
  mode: "video" | "audio" | null;
  isPlaying: boolean;
  isMinimized: boolean;
  playSermon: (sermon: Sermon) => void;
  playVideo: (sermon: Sermon) => void;
  playAudio: (sermon: Sermon) => void;
  togglePlay: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
}

const GlobalPlayerContext = createContext<GlobalPlayerContextType>({
  currentSermon: null,
  mode: null,
  isPlaying: false,
  isMinimized: false,
  playSermon: () => {},
  playVideo: () => {},
  playAudio: () => {},
  togglePlay: () => {},
  toggleMinimize: () => {},
  closePlayer: () => {},
});

export const useAudio = () => useContext(GlobalPlayerContext);
export const useGlobalPlayer = () => useContext(GlobalPlayerContext);

function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

function getSpotifyEmbedUrl(sermon: Sermon): string {
  if (sermon.spotifyEpisodeId) {
    return `https://open.spotify.com/embed/episode/${sermon.spotifyEpisodeId}?utm_source=generator&theme=0`;
  }
  if (sermon.audioUrl && sermon.audioUrl.includes("spotify.com/episode/")) {
    const match = sermon.audioUrl.match(/episode\/([a-zA-Z0-9]+)/);
    if (match) return `https://open.spotify.com/embed/episode/${match[1]}?utm_source=generator&theme=0`;
  }
  return `https://open.spotify.com/embed/show/0FELkmsjm7yVoytlwCXXDG?utm_source=generator&theme=0`;
}

function getTelegramEmbedUrl(sermon: Sermon): string {
  if (sermon.telegramMessageId) {
    return `https://t.me/ThePublishersHouse/${sermon.telegramMessageId}?embed=1`;
  }
  if (sermon.audioUrl && sermon.audioUrl.includes("t.me/")) {
    const clean = sermon.audioUrl.replace(/^https?:\/\/t\.me\//, "").replace(/\?.*/, "");
    if (clean) return `https://t.me/${clean}?embed=1`;
  }
  return `https://t.me/ThePublishersHouse/1457?embed=1`;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentSermon, setCurrentSermon] = useState<Sermon | null>(null);
  const [mode, setMode] = useState<"video" | "audio" | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playVideo = (sermon: Sermon) => {
    // If audio element is playing, pause it
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentSermon(sermon);
    setMode("video");
    setIsPlaying(true);
    setIsMinimized(false);
  };

  const playAudio = (sermon: Sermon) => {
    setCurrentSermon(sermon);
    setMode("audio");
    setIsPlaying(true);
    setIsMinimized(false);
  };

  const playSermon = (sermon: Sermon) => {
    if (sermon.audioUrl && !sermon.audioUrl.includes("t.me") && !sermon.audioUrl.includes("spotify.com")) {
      playAudio(sermon);
    } else if (sermon.videoUrl) {
      playAudio(sermon);
    } else {
      playAudio(sermon);
    }
  };

  const togglePlay = () => {
    if (audioRef.current && mode === "audio") {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentSermon(null);
    setMode(null);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (audioRef.current && currentSermon && mode === "audio" && currentSermon.audioUrl && !currentSermon.audioUrl.includes("t.me")) {
      audioRef.current.play().catch(e => console.error("Audio playback error:", e));
    }
  }, [currentSermon, mode]);

  return (
    <GlobalPlayerContext.Provider
      value={{
        currentSermon,
        mode,
        isPlaying,
        isMinimized,
        playSermon,
        playVideo,
        playAudio,
        togglePlay,
        toggleMinimize,
        closePlayer,
      }}
    >
      {children}
      {currentSermon && (
        <FloatingDockedPlayer
          sermon={currentSermon}
          mode={mode || "video"}
          isPlaying={isPlaying}
          isMinimized={isMinimized}
          audioRef={audioRef}
          onTogglePlay={togglePlay}
          onToggleMinimize={toggleMinimize}
          onClose={closePlayer}
        />
      )}
    </GlobalPlayerContext.Provider>
  );
}

interface PlayerProps {
  sermon: Sermon;
  mode: "video" | "audio";
  isPlaying: boolean;
  isMinimized: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onTogglePlay: () => void;
  onToggleMinimize: () => void;
  onClose: () => void;
}

function FloatingDockedPlayer({
  sermon,
  mode,
  isPlaying,
  isMinimized,
  audioRef,
  onTogglePlay,
  onToggleMinimize,
  onClose,
}: PlayerProps) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState(sermon.duration || "00:00");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const videoId = getYouTubeVideoId(sermon.videoUrl);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "/images/sermon-hero-bg.jpg";




  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const { currentTime, duration } = audioRef.current;
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
      setCurrentTime(formatTime(currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(formatTime(audioRef.current.duration));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = (Number(e.target.value) / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(Number(e.target.value));
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += seconds;
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: isMobile ? "12px" : "24px",
        right: isMobile ? "12px" : "24px",
        width: isMobile ? "calc(100% - 24px)" : "390px",
        backgroundColor: "#151A54",
        color: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.5)",
        zIndex: 99999,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-poppins), sans-serif",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* ── HEADER / TITLE BAR ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          backgroundColor: "#0F1238",
          borderBottom: isMinimized ? "none" : "1px solid rgba(255,255,255,0.12)",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={onToggleMinimize}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", flex: 1, minWidth: 0 }}>
          <span
            style={{
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              backgroundColor: mode === "video" ? "#2090FF" : "#E8740C",
              color: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            {mode === "video" ? "VIDEO" : "AUDIO"}
          </span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "#FFFFFF",
            }}
          >
            {sermon.title}
          </span>
        </div>

        <div
          style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, marginLeft: "8px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onToggleMinimize}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              padding: "4px 8px",
              fontSize: "13px",
              lineHeight: 1,
              borderRadius: "4px",
            }}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? "□" : "—"}
          </button>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              padding: "4px 8px",
              fontSize: "13px",
              lineHeight: 1,
              borderRadius: "4px",
            }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── PLAYER BODY (hidden when minimized) ── */}
      {!isMinimized && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* VIDEO MODE */}
          {mode === "video" && videoId && (
            <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "#000" }}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={sermon.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* AUDIO MODE — YouTube iframe as audio source, artwork overlay covers video */}
          {mode === "audio" && (
            <div style={{ backgroundColor: "#0D1238" }}>
              {videoId ? (
                /* ── YouTube playing, video hidden behind artwork cover ── */
                <div style={{ position: "relative", width: "100%" }}>
                  {/* The real YouTube iframe — plays correct sermon audio */}
                  <div style={{ width: "100%", aspectRatio: "16/9" }}>
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                      title={sermon.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      style={{ display: "block" }}
                    />
                  </div>

                  {/* Artwork overlay — covers the video portion, leaves YT control bar visible */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      /* Leave ~46px at bottom for YouTube native control bar */
                      bottom: "46px",
                      background: "linear-gradient(160deg, #0D1238 0%, #151A54 100%)",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 16px",
                      pointerEvents: "none",
                    }}
                  >
                    <img
                      src={thumbnailUrl}
                      alt={sermon.title}
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        flexShrink: 0,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-poppins)",
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "#FFFFFF",
                          lineHeight: "1.3em",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          marginBottom: "4px",
                        }}
                      >
                        {sermon.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)" }}>
                        {sermon.speaker || "Dr. Joshua Agunbiade"}
                      </div>
                      {sermon.series && (
                        <div style={{ fontSize: "10px", color: "#2090FF", marginTop: "2px", fontWeight: 600 }}>
                          {sermon.series}
                        </div>
                      )}
                    </div>
                    {/* Sound wave visual indicator */}
                    <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
                      {[14, 22, 18, 26, 16, 20].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            width: "3px",
                            height: `${h}px`,
                            borderRadius: "2px",
                            backgroundColor: "#2090FF",
                            opacity: 0.8,
                            animation: `pulse ${0.8 + i * 0.1}s ease-in-out infinite alternate`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── No YouTube video — fallback info card ── */
                <div style={{ padding: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
                  <img
                    src={thumbnailUrl}
                    alt={sermon.title}
                    style={{ width: "56px", height: "56px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "13px", color: "#FFF", marginBottom: "3px" }}>
                      {sermon.title}
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                      {sermon.speaker || "Dr. Joshua Agunbiade"}
                    </div>
                  </div>
                </div>
              )}

              {/* Listen externally row */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  padding: "10px 14px",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  alignItems: "center",
                }}
              >
                <span style={{ fontFamily: "var(--font-poppins)", fontSize: "10px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
                  Also on:
                </span>
                <a
                  href="https://open.spotify.com/show/0FELkmsjm7yVoytlwCXXDG"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    backgroundColor: "rgba(29,185,84,0.12)",
                    border: "1px solid rgba(29,185,84,0.35)",
                    color: "#1DB954",
                    textDecoration: "none",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    fontFamily: "var(--font-poppins)",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Spotify
                </a>
                <a
                  href="https://t.me/ThePublishersHouse"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    backgroundColor: "rgba(34,158,217,0.12)",
                    border: "1px solid rgba(34,158,217,0.35)",
                    color: "#229ED9",
                    textDecoration: "none",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    fontFamily: "var(--font-poppins)",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.92 9.07c-.14.65-.53.81-1.07.51l-2.95-2.18-1.42 1.37c-.16.16-.29.29-.6.29l.21-3.01 5.48-4.95c.24-.21-.05-.33-.37-.12l-6.77 4.26-2.92-.91c-.64-.2-.65-.64.13-.95l11.41-4.4c.53-.19.99.13.8.92z"/>
                  </svg>
                  Telegram
                </a>
              </div>
            </div>
          )}

          {/* ── FOOTER ROW ── */}
          <div
            style={{
              padding: "8px 14px",
              backgroundColor: "#0D1030",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "10px",
              color: "rgba(255,255,255,0.6)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span>The Publishers House</span>
            <Link
              href={`/sermons/${sermon.id}`}
              style={{ color: "#2090FF", textDecoration: "none", fontWeight: 600 }}
            >
              View Notes →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
