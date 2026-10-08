"use client";

import { useState, useEffect, useRef } from "react";

interface TextToSpeechProps {
  title: string;
  slug?: string;
  audioUrl?: string;
}

export default function TextToSpeech({ title, slug, audioUrl }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio source: explicit audioUrl or on-demand streaming endpoint
  const resolvedAudioSrc = audioUrl || (slug ? `/api/tts?slug=${slug}` : "");

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time < 0) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn("Audio play error:", err);
          setIsLoading(false);
        });
    }
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
    setIsLoading(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekPct = Number(e.target.value);
    const totalDuration = audioRef.current.duration;
    if (totalDuration && !isNaN(totalDuration)) {
      const newTime = (seekPct / 100) * totalDuration;
      audioRef.current.currentTime = newTime;
    }
    setProgress(seekPct);
  };

  const changeSpeed = () => {
    if (!audioRef.current) return;
    const rates = [1, 1.25, 1.5];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  if (!resolvedAudioSrc) return null;

  const downloadHref = audioUrl || `/api/tts?slug=${slug}&download=1`;

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#0B0E14",
        color: "#FFFFFF",
        borderRadius: "8px",
        padding: "18px 24px 20px",
        marginBottom: "36px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <audio
        ref={audioRef}
        src={resolvedAudioSrc}
        preload="metadata"
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
      />

      {/* Title centered at top */}
      <div
        style={{
          textAlign: "center",
          fontFamily: "var(--font-poppins)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.7)",
          marginBottom: "12px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          padding: "0 10px",
        }}
      >
        {isLoading ? "Loading audio stream..." : title}
      </div>

      {/* Main player controls row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          width: "100%",
        }}
      >
        {/* Circular Play / Pause button */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "transparent",
            border: "1.5px solid rgba(255,255,255,0.85)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.2s ease",
            padding: 0,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "#FFFFFF";
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.85)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {isLoading ? (
            <span
              style={{
                width: "14px",
                height: "14px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#FFFFFF",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.8s linear infinite",
              }}
            />
          ) : isPlaying ? (
            // Pause icon
            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
              <rect x="1" width="3.5" height="14" rx="1" />
              <rect x="7.5" width="3.5" height="14" rx="1" />
            </svg>
          ) : (
            // Play icon
            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" style={{ marginLeft: "2px" }}>
              <path d="M1 1.25C1 0.63 1.68 0.25 2.21 0.58L11.21 6.33C11.71 6.65 11.71 7.35 11.21 7.67L2.21 13.42C1.68 13.75 1 13.37 1 12.75V1.25Z" />
            </svg>
          )}
        </button>

        {/* Current Time */}
        <span
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: "11px",
            color: "rgba(255,255,255,0.8)",
            letterSpacing: "0.05em",
            minWidth: "36px",
            flexShrink: 0,
          }}
        >
          {currentTime}
        </span>

        {/* Sliding Range Track */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", position: "relative" }}>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={isNaN(progress) ? 0 : progress}
            onChange={handleSeek}
            style={{
              width: "100%",
              height: "4px",
              cursor: "pointer",
              accentColor: "#FFFFFF",
              appearance: "none",
              backgroundColor: "rgba(255,255,255,0.22)",
              borderRadius: "2px",
              outline: "none",
            }}
          />
        </div>

        {/* Total Duration */}
        <span
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: "11px",
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.05em",
            minWidth: "36px",
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          {duration}
        </span>

        {/* Speed toggle */}
        <button
          onClick={changeSpeed}
          title="Playback Speed"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "4px",
            padding: "4px 8px",
            color: "#FFFFFF",
            fontFamily: "var(--font-poppins)",
            fontSize: "10px",
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {playbackRate}x
        </button>

        {/* Download Button matching screenshot */}
        <a
          href={downloadHref}
          download={`${slug || "article"}.mp3`}
          target="_blank"
          rel="noopener noreferrer"
          title="Download audio"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            color: "rgba(255,255,255,0.75)",
            textDecoration: "none",
            fontFamily: "var(--font-poppins)",
            fontSize: "11px",
            fontWeight: 500,
            cursor: "pointer",
            flexShrink: 0,
            padding: "4px 8px",
            borderRadius: "4px",
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#FFFFFF")}
          onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download</span>
        </a>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
