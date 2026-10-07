"use client";

import { useState, useEffect, useRef } from "react";

const Navy    = "#151A54";
const Blue500 = "#2090FF";
const Blue700 = "#0140C1";
const Paper200 = "#E8ECF7";
const Slate500 = "#747CA1";
const White   = "#FFFFFF";

interface TextToSpeechProps {
  title: string;
  htmlContent: string;
  audioUrl?: string;
}

export default function TextToSpeech({ title, htmlContent, audioUrl }: TextToSpeechProps) {
  // If an audioUrl (cloned voice recording / ElevenLabs MP3) is available
  if (audioUrl) {
    return <AudioFilePlayer title={title} audioUrl={audioUrl} />;
  }

  // Fallback: Browser Web Speech API
  return <BrowserSpeechPlayer title={title} htmlContent={htmlContent} />;
}

/* ── Dedicated player for the cloned voice MP3 file ──────────────── */
function AudioFilePlayer({ title, audioUrl }: { title: string; audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
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
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekPct = Number(e.target.value);
    const newTime = (seekPct / 100) * (audioRef.current.duration || 0);
    audioRef.current.currentTime = newTime;
    setProgress(seekPct);
  };

  const changeSpeed = () => {
    if (!audioRef.current) return;
    const rates = [1, 1.25, 1.5];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  return (
    <div
      style={{
        marginBottom: "40px",
        padding: "20px 24px",
        backgroundColor: "#F4F6FB",
        borderRadius: "8px",
        border: `1px solid ${Paper200}`,
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase", color: Blue500, marginBottom: "2px" }}>
            Audio on the Go · Rev. Joshua Agunbiade
          </div>
          <div style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", color: Navy, fontWeight: 600 }}>
            {isPlaying ? "Playing article narration..." : "Listen to this article"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={togglePlay}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              backgroundColor: isPlaying ? Navy : Blue700,
              color: White,
              border: "none",
              borderRadius: "32px",
              cursor: "pointer",
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              transition: "all 0.2s",
            }}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          <button
            onClick={changeSpeed}
            style={{
              background: "none",
              border: `1px solid ${Paper200}`,
              padding: "6px 12px",
              borderRadius: "16px",
              fontFamily: "var(--font-poppins)",
              fontSize: "11px",
              fontWeight: 600,
              color: Navy,
              cursor: "pointer",
            }}
          >
            {playbackRate}x
          </button>
        </div>
      </div>

      {/* Progress & Time */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "11px", fontFamily: "var(--font-poppins)", color: Slate500, minWidth: "32px" }}>{currentTime}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={isNaN(progress) ? 0 : progress}
          onChange={handleSeek}
          style={{ flex: 1, accentColor: Blue700, height: "4px", cursor: "pointer" }}
        />
        <span style={{ fontSize: "11px", fontFamily: "var(--font-poppins)", color: Slate500, minWidth: "32px", textAlign: "right" }}>{duration}</span>
      </div>
    </div>
  );
}

/* ── Browser Web Speech fallback player ──────────────────────────── */
function BrowserSpeechPlayer({ title, htmlContent }: { title: string; htmlContent: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const keepAliveInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    synthRef.current = window.speechSynthesis;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    const textToRead = `${title}. . ${textContent}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    };

    utteranceRef.current = utterance;

    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    };
  }, [title, htmlContent]);

  const startKeepAlive = () => {
    if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    keepAliveInterval.current = setInterval(() => {
      if (synthRef.current?.speaking && !synthRef.current?.paused) {
        synthRef.current.pause();
        synthRef.current.resume();
      }
    }, 14000);
  };

  const handlePlayPause = () => {
    if (!synthRef.current || !utteranceRef.current) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    } else if (isPaused) {
      synthRef.current.resume();
      setIsPlaying(true);
      setIsPaused(false);
      startKeepAlive();
    } else {
      synthRef.current.cancel();
      synthRef.current.speak(utteranceRef.current);
      setIsPlaying(true);
      setIsPaused(false);
      startKeepAlive();
    }
  };

  const handleStop = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
  };

  if (!isSupported || !htmlContent) return null;

  return (
    <div
      style={{
        marginBottom: "40px",
        padding: "20px 24px",
        backgroundColor: "#F4F6FB",
        borderRadius: "8px",
        border: `1px solid ${Paper200}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <div>
        <div style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase", color: Blue500, marginBottom: "4px" }}>
          Audio on the go
        </div>
        <div style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", color: Navy, fontWeight: 600 }}>
          {isPlaying ? "Reading aloud..." : isPaused ? "Paused" : "Listen to this article"}
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={handlePlayPause}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            backgroundColor: isPlaying ? Navy : Blue700,
            color: White,
            border: "none",
            borderRadius: "32px",
            cursor: "pointer",
            fontFamily: "var(--font-poppins)",
            fontWeight: 600,
            fontSize: "12px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            transition: "all 0.2s",
          }}
        >
          {isPlaying ? "⏸ Pause" : isPaused ? "▶ Resume" : "▶ Play"}
        </button>

        {(isPlaying || isPaused) && (
          <button
            onClick={handleStop}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              backgroundColor: "transparent",
              color: Slate500,
              border: `1px solid ${Paper200}`,
              borderRadius: "32px",
              cursor: "pointer",
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            ⏹ Stop
          </button>
        )}
      </div>
    </div>
  );
}
