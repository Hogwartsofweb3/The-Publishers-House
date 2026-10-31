"use client";

import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import type { Sermon } from "@/lib/firebase";
import Link from "next/link";

export interface PlayableMedia extends Partial<Sermon> {
  id: string;
  title: string;
  speaker?: string;
  series?: string;
  scripture?: string;
  videoUrl?: string;
  audioUrl?: string;
  spotifyEpisodeId?: string;
  coverImageUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  type?: "sermon" | "resource";
  resourceSlug?: string;
}

interface GlobalPlayerContextType {
  currentSermon: PlayableMedia | null;
  mode: "video" | "audio" | null;
  isPlaying: boolean;
  isMinimized: boolean;
  startSeconds: number;
  playSermon: (sermon: PlayableMedia, startSeconds?: number) => void;
  playVideo: (sermon: PlayableMedia, startSeconds?: number) => void;
  playAudio: (sermon: PlayableMedia, startSeconds?: number) => void;
  togglePlay: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
}

const GlobalPlayerContext = createContext<GlobalPlayerContextType>({
  currentSermon: null,
  mode: null,
  isPlaying: false,
  isMinimized: false,
  startSeconds: 0,
  playSermon: () => {},
  playVideo: () => {},
  playAudio: () => {},
  togglePlay: () => {},
  toggleMinimize: () => {},
  closePlayer: () => {},
});

export const useAudio = () => useContext(GlobalPlayerContext);
export const useGlobalPlayer = () => useContext(GlobalPlayerContext);

export function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

function parseDurationToSeconds(durationStr?: string): number {
  if (!durationStr) return 2400; // default 40 min
  if (durationStr.includes(":")) {
    const parts = durationStr.split(":").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }
  let total = 0;
  const hrMatch = durationStr.match(/(\d+)\s*hr/i);
  const minMatch = durationStr.match(/(\d+)\s*min/i);
  const secMatch = durationStr.match(/(\d+)\s*sec/i);
  if (hrMatch) total += parseInt(hrMatch[1], 10) * 3600;
  if (minMatch) total += parseInt(minMatch[1], 10) * 60;
  if (secMatch) total += parseInt(secMatch[1], 10);
  return total > 0 ? total : 2400;
}

function persistPlayback(item: {
  id: string;
  title: string;
  speaker?: string;
  series?: string;
  scripture?: string;
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  progressSeconds: number;
  durationSeconds: number;
  percent: number;
  completed: boolean;
  type?: "sermon" | "resource";
  resourceSlug?: string;
}) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("tph_playback_history");
    let history: any[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(history)) history = [];

    const updated = {
      ...item,
      updatedAt: new Date().toISOString(),
    };

    const index = history.findIndex((h) => h.id === item.id);
    if (index >= 0) {
      history[index] = { ...history[index], ...updated };
    } else {
      history.unshift(updated);
    }

    localStorage.setItem("tph_playback_history", JSON.stringify(history.slice(0, 50)));
    window.dispatchEvent(new CustomEvent("tph_playback_update", { detail: updated }));

    fetch("/api/portal/playback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(() => {});
  } catch (e) {
    // silently catch storage errors
  }
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentSermon, setCurrentSermon] = useState<PlayableMedia | null>(null);
  const [mode, setMode] = useState<"video" | "audio" | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [startSeconds, setStartSeconds] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentPosRef = useRef<number>(0);
  const durationPosRef = useRef<number>(2400);

  const playVideo = useCallback((media: PlayableMedia, startSec = 0) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    currentPosRef.current = startSec;
    durationPosRef.current = parseDurationToSeconds(media.duration);
    setStartSeconds(startSec);
    setCurrentSermon(media);
    setMode("video");
    setIsPlaying(true);
    setIsMinimized(false);
  }, []);

  const playAudio = useCallback((media: PlayableMedia, startSec = 0) => {
    currentPosRef.current = startSec;
    durationPosRef.current = parseDurationToSeconds(media.duration);
    setStartSeconds(startSec);
    setCurrentSermon(media);
    setMode("audio");
    setIsPlaying(true);
    setIsMinimized(false);
  }, []);

  const playSermon = useCallback((media: PlayableMedia, startSec = 0) => {
    if (media.videoUrl) {
      playVideo(media, startSec);
    } else {
      playAudio(media, startSec);
    }
  }, [playVideo, playAudio]);

  const togglePlay = useCallback(() => {
    if (audioRef.current && mode === "audio") {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying, mode]);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // Save final progress on close
    if (currentSermon && currentPosRef.current > 5) {
      const vid = getYouTubeVideoId(currentSermon.videoUrl);
      const thumb = vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : undefined;
      const dur = durationPosRef.current || 2400;
      const pct = Math.min(100, Math.round((currentPosRef.current / dur) * 100));
      persistPlayback({
        id: currentSermon.id,
        title: currentSermon.title,
        speaker: currentSermon.speaker,
        series: currentSermon.series,
        scripture: currentSermon.scripture,
        videoUrl: currentSermon.videoUrl,
        audioUrl: currentSermon.audioUrl,
        thumbnailUrl: thumb,
        progressSeconds: currentPosRef.current,
        durationSeconds: dur,
        percent: pct,
        completed: pct >= 90,
        type: currentSermon.type || "sermon",
        resourceSlug: currentSermon.resourceSlug,
      });
    }
    setCurrentSermon(null);
    setMode(null);
    setIsPlaying(false);
    setStartSeconds(0);
  }, [currentSermon]);

  // Audio HTML element autoplay
  useEffect(() => {
    if (audioRef.current && currentSermon && mode === "audio" && currentSermon.audioUrl && !currentSermon.audioUrl.includes("t.me")) {
      audioRef.current.play().catch((e) => console.error("Audio playback error:", e));
    }
  }, [currentSermon, mode]);

  // YouTube postMessage listener
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data && data.event === "infoDelivery" && data.info) {
          if (typeof data.info.currentTime === "number") {
            currentPosRef.current = Math.floor(data.info.currentTime);
          }
          if (typeof data.info.duration === "number" && data.info.duration > 0) {
            durationPosRef.current = Math.floor(data.info.duration);
          }
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Periodic heartbeat timer to track and sync progress
  useEffect(() => {
    if (!isPlaying || !currentSermon) return;

    const interval = setInterval(() => {
      currentPosRef.current += 3;
      const dur = durationPosRef.current || 2400;
      const pct = Math.min(100, Math.round((currentPosRef.current / dur) * 100));
      const vid = getYouTubeVideoId(currentSermon.videoUrl);
      const thumb = vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : undefined;

      // Persist to localStorage and backend
      persistPlayback({
        id: currentSermon.id,
        title: currentSermon.title,
        speaker: currentSermon.speaker,
        series: currentSermon.series,
        scripture: currentSermon.scripture,
        videoUrl: currentSermon.videoUrl,
        audioUrl: currentSermon.audioUrl,
        thumbnailUrl: thumb,
        progressSeconds: currentPosRef.current,
        durationSeconds: dur,
        percent: pct,
        completed: pct >= 90,
        type: currentSermon.type || "sermon",
        resourceSlug: currentSermon.resourceSlug,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, currentSermon]);

  return (
    <GlobalPlayerContext.Provider
      value={{
        currentSermon,
        mode,
        isPlaying,
        isMinimized,
        startSeconds,
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
          startSeconds={startSeconds}
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
  sermon: PlayableMedia;
  mode: "video" | "audio";
  isPlaying: boolean;
  isMinimized: boolean;
  startSeconds: number;
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
  startSeconds,
  audioRef,
  onTogglePlay,
  onToggleMinimize,
  onClose,
}: PlayerProps) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState(sermon.duration || "00:00");
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const videoId = getYouTubeVideoId(sermon.videoUrl);
  const spotifyEpId =
    sermon.spotifyEpisodeId ||
    (sermon.audioUrl && sermon.audioUrl.match(/episode\/([a-zA-Z0-9]+)/)?.[1]) ||
    null;
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : sermon.coverImageUrl || "/images/sermon-hero-bg.jpg";

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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

  const startParam = startSeconds > 0 ? `&start=${Math.floor(startSeconds)}` : "";

  return (
    <div
      style={{
        position: "fixed",
        bottom: isMobile ? "12px" : "24px",
        right: isMobile ? "12px" : "24px",
        width: isMobile
          ? "calc(100% - 24px)"
          : isExpanded
          ? "min(720px, calc(100vw - 48px))"
          : "390px",
        maxWidth: "calc(100vw - 24px)",
        backgroundColor: "#151A54",
        color: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        boxShadow: isExpanded
          ? "0 24px 64px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(32, 144, 255, 0.35)"
          : "0 16px 48px rgba(0, 0, 0, 0.5)",
        zIndex: 99999,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-poppins), sans-serif",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* HEADER / TITLE BAR */}
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
              backgroundColor: mode === "video" ? "#2090FF" : spotifyEpId ? "#1DB954" : "#0140C1",
              color: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            {mode === "video" ? "VIDEO" : spotifyEpId ? "SPOTIFY" : "AUDIO"}
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
          {/* Custom Expand / Theater Mode button */}
          {!isMinimized && (
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              style={{
                background: isExpanded ? "rgba(32, 144, 255, 0.25)" : "none",
                border: isExpanded ? "1px solid #2090FF" : "1px solid transparent",
                color: isExpanded ? "#2090FF" : "rgba(255,255,255,0.7)",
                cursor: "pointer",
                padding: "3px 7px",
                fontSize: "12px",
                lineHeight: 1,
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                fontFamily: "var(--font-poppins)",
                fontWeight: 600,
              }}
              title={isExpanded ? "Collapse to standard size (390px)" : "Expand player size (720px theater)"}
            >
              <span>{isExpanded ? "⊡ Compact" : "⛶ Expand"}</span>
            </button>
          )}

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

      {/* PLAYER BODY */}
      {!isMinimized && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* VIDEO MODE */}
          {mode === "video" && videoId && (
            <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "#000" }}>
              <iframe
                key={`${videoId}-${startSeconds}`}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1${startParam}`}
                title={sermon.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* AUDIO MODE — YouTube iframe as audio source with artwork overlay */}
          {mode === "audio" && (
            <div style={{ backgroundColor: "#0D1238" }}>
              {videoId ? (
                <div style={{ position: "relative", width: "100%" }}>
                  <div style={{ width: "100%", aspectRatio: "16/9" }}>
                    <iframe
                      key={`${videoId}-${startSeconds}`}
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1${startParam}`}
                      title={sermon.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      style={{ display: "block" }}
                    />
                  </div>

                  {/* Artwork overlay */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
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
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : spotifyEpId ? (
                /* In-page Spotify Embed Player (Zero Redirection) */
                <div style={{ padding: "8px", backgroundColor: "#0D1238" }}>
                  <iframe
                    key={spotifyEpId}
                    src={`https://open.spotify.com/embed/episode/${spotifyEpId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    style={{ borderRadius: "8px", border: "none", display: "block" }}
                  />
                </div>
              ) : (
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <img
                      src={thumbnailUrl}
                      alt={sermon.title}
                      style={{ width: "56px", height: "56px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "13px", color: "#FFF", marginBottom: "3px" }}>
                        {sermon.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                        {sermon.speaker || "Dr. Joshua Agunbiade"}
                      </div>
                      {sermon.series && (
                        <div style={{ fontSize: "10px", color: "#2090FF", marginTop: "2px", fontWeight: 600 }}>
                          {sermon.series}
                        </div>
                      )}
                    </div>
                    {sermon.audioUrl && !sermon.audioUrl.includes("t.me") && (
                      <button
                        onClick={onTogglePlay}
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          backgroundColor: "#2090FF",
                          border: "none",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                          fontSize: "14px",
                        }}
                        title={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? "⏸" : "▶"}
                      </button>
                    )}
                  </div>

                  {/* Scrub slider & time */}
                  {sermon.audioUrl && !sermon.audioUrl.includes("t.me") && (
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleSeek}
                        style={{
                          width: "100%",
                          accentColor: "#2090FF",
                          cursor: "pointer",
                          height: "4px",
                          marginBottom: "4px",
                          display: "block",
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "rgba(255,255,255,0.55)" }}>
                        <span>{currentTime}</span>
                        <span>{duration}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Native audio element hook */}
              {sermon.audioUrl && !sermon.audioUrl.includes("t.me") && (
                <audio
                  ref={audioRef}
                  src={sermon.audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={onClose}
                  preload="metadata"
                  style={{ display: "none" }}
                />
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
                  Telegram
                </a>
              </div>
            </div>
          )}

          {/* FOOTER ROW */}
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
            {sermon.id && !sermon.id.startsWith("res_") ? (
              <Link
                href={`/sermons/${sermon.id}`}
                style={{ color: "#2090FF", textDecoration: "none", fontWeight: 600 }}
              >
                View Sermon Notes →
              </Link>
            ) : (
              <span style={{ color: "#2090FF", fontWeight: 600 }}>Active Study Session</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
