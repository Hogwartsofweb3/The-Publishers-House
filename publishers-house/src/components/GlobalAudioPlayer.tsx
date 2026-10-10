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

  const hasDirectAudio = sermon.audioUrl && !sermon.audioUrl.includes("t.me") && !sermon.audioUrl.includes("spotify.com");

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

          {/* AUDIO MODE */}
          {mode === "audio" && (
            <div style={{ padding: "16px", backgroundColor: "#151A54" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "14px" }}>
                <img
                  src={thumbnailUrl}
                  alt={sermon.title}
                  style={{
                    width: "64px",
                    height: "64px",
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
                      marginBottom: "4px",
                    }}
                  >
                    {sermon.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
                    {sermon.speaker || "Dr. Joshua Agunbiade"}
                  </div>
                  {sermon.series && (
                    <div style={{ fontSize: "10px", color: "#2090FF", marginTop: "2px" }}>
                      {sermon.series}
                    </div>
                  )}
                </div>
              </div>

              {/* Direct MP3 Audio Player */}
              {hasDirectAudio ? (
                <>
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
                </>
              ) : videoId ? (
                /* YouTube In-Page Audio-Stream Player */
                <div>
                  <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "6px", overflow: "hidden", backgroundColor: "#000" }}>
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
                  <div style={{ marginTop: "10px", display: "flex", gap: "10px", justifyContent: "center" }}>
                    {sermon.audioUrl?.includes("t.me") && (
                      <a
                        href={sermon.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "10px", color: "#2090FF", textDecoration: "underline" }}
                      >
                        Listen on Telegram ↗
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "16px 0", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                  Audio player initializing...
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
