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

  const hasDirectAudio = Boolean(
    sermon.audioUrl &&
    !sermon.audioUrl.includes("t.me") &&
    !sermon.audioUrl.includes("spotify.com") &&
    !sermon.audioUrl.includes("youtube.com") &&
    !sermon.audioUrl.includes("youtu.be") &&
    (
      sermon.audioUrl.endsWith(".mp3") ||
      sermon.audioUrl.endsWith(".m4a") ||
      sermon.audioUrl.endsWith(".aac") ||
      sermon.audioUrl.includes("storage.googleapis.com") ||
      sermon.audioUrl.includes("firebasestorage")
    )
  );

  const [audioSource, setAudioSource] = useState<"spotify" | "telegram" | "direct">("spotify");

  useEffect(() => {
    if (hasDirectAudio) {
      setAudioSource("direct");
    } else if (sermon.audioUrl && sermon.audioUrl.includes("t.me")) {
      setAudioSource("telegram");
    } else {
      setAudioSource("spotify");
    }
  }, [sermon.id, hasDirectAudio, sermon.audioUrl]);

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

          {/* AUDIO MODE — STRICTLY AUDIO ONLY (Spotify, Telegram, or direct MP3) */}
          {mode === "audio" && (
            <div style={{ padding: "16px", backgroundColor: "#151A54" }}>
              {/* Sermon Header */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                <img
                  src={thumbnailUrl}
                  alt={sermon.title}
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "6px",
                    objectFit: "cover",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-poppins)",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#FFFFFF",
                      lineHeight: "1.25em",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      marginBottom: "3px",
                    }}
                  >
                    {sermon.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
                    {sermon.speaker || "Dr. Joshua Agunbiade"}
                  </div>
                  {sermon.series && (
                    <div style={{ fontSize: "10px", color: "#2090FF", marginTop: "2px", fontWeight: 600 }}>
                      {sermon.series}
                    </div>
                  )}
                </div>
              </div>

              {/* Source Switcher: Spotify vs Telegram vs Direct */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={() => setAudioSource("spotify")}
                  style={{
                    flex: 1,
                    padding: "7px 10px",
                    borderRadius: "6px",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    backgroundColor: audioSource === "spotify" ? "#1DB954" : "rgba(255,255,255,0.08)",
                    color: audioSource === "spotify" ? "#000000" : "rgba(255,255,255,0.85)",
                    border: audioSource === "spotify" ? "1px solid #1DB954" : "1px solid rgba(255,255,255,0.15)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  Spotify
                </button>

                <button
                  type="button"
                  onClick={() => setAudioSource("telegram")}
                  style={{
                    flex: 1,
                    padding: "7px 10px",
                    borderRadius: "6px",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    backgroundColor: audioSource === "telegram" ? "#229ED9" : "rgba(255,255,255,0.08)",
                    color: "#FFFFFF",
                    border: audioSource === "telegram" ? "1px solid #229ED9" : "1px solid rgba(255,255,255,0.15)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.92 9.07c-.14.65-.53.81-1.07.51l-2.95-2.18-1.42 1.37c-.16.16-.29.29-.6.29l.21-3.01 5.48-4.95c.24-.21-.05-.33-.37-.12l-6.77 4.26-2.92-.91c-.64-.2-.65-.64.13-.95l11.41-4.4c.53-.19.99.13.8.92z" />
                  </svg>
                  Telegram
                </button>

                {hasDirectAudio && (
                  <button
                    type="button"
                    onClick={() => setAudioSource("direct")}
                    style={{
                      flex: 1,
                      padding: "7px 10px",
                      borderRadius: "6px",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      backgroundColor: audioSource === "direct" ? "#2090FF" : "rgba(255,255,255,0.08)",
                      color: "#FFFFFF",
                      border: audioSource === "direct" ? "1px solid #2090FF" : "1px solid rgba(255,255,255,0.15)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    Direct MP3
                  </button>
                )}
              </div>

              {/* 1. Spotify Audio Player Embed */}
              {audioSource === "spotify" && (
                <div>
                  <div style={{ borderRadius: "8px", overflow: "hidden", backgroundColor: "#000" }}>
                    <iframe
                      style={{ borderRadius: "8px", border: "none" }}
                      src={getSpotifyEmbedUrl(sermon)}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      title={`Spotify Audio - ${sermon.title}`}
                    />
                  </div>
                  <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.6)" }}>The Publishers House Podcast</span>
                    <a
                      href="https://open.spotify.com/show/0FELkmsjm7yVoytlwCXXDG"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "10.5px", color: "#1DB954", textDecoration: "none", fontWeight: 600 }}
                    >
                      Open Spotify App ↗
                    </a>
                  </div>
                </div>
              )}

              {/* 2. Telegram Audio Player Embed */}
              {audioSource === "telegram" && (
                <div>
                  <div style={{ borderRadius: "8px", overflow: "hidden", backgroundColor: "#FFFFFF" }}>
                    <iframe
                      style={{ borderRadius: "8px", border: "none" }}
                      src={getTelegramEmbedUrl(sermon)}
                      width="100%"
                      height="180"
                      frameBorder="0"
                      loading="lazy"
                      title={`Telegram Audio - ${sermon.title}`}
                    />
                  </div>
                  <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.6)" }}>@ThePublishersHouse Channel</span>
                    <a
                      href="https://t.me/ThePublishersHouse"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "10.5px", color: "#229ED9", textDecoration: "none", fontWeight: 600 }}
                    >
                      Open Telegram ↗
                    </a>
                  </div>
                </div>
              )}

              {/* 3. Direct HTML5 Audio Player */}
              {audioSource === "direct" && hasDirectAudio && (
                <div>
                  <audio
                    ref={audioRef}
                    src={sermon.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={onTogglePlay}
                  />

                  {/* Scrubber */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", minWidth: "32px", textAlign: "right" }}>
                      {currentTime}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isNaN(progress) ? 0 : progress}
                      onChange={handleSeek}
                      style={{
                        flex: 1,
                        accentColor: "#2090FF",
                        height: "4px",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderRadius: "2px",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", minWidth: "32px" }}>
                      {duration}
                    </span>
                  </div>

                  {/* Controls */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px" }}>
                    <button
                      onClick={() => skip(-15)}
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                    >
                      ↺ 15s
                    </button>
                    <button
                      onClick={onTogglePlay}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#2090FF",
                        border: "none",
                        color: "#FFFFFF",
                        fontSize: "16px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isPlaying ? "⏸" : "▶"}
                    </button>
                    <button
                      onClick={() => skip(15)}
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                    >
                      15s ↻
                    </button>
                  </div>
                </div>
              )}
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
