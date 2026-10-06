"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react";
import type { Sermon } from "@/lib/firebase";

interface AudioContextType {
  currentSermon: Sermon | null;
  isPlaying: boolean;
  playSermon: (sermon: Sermon) => void;
  togglePlay: () => void;
  closePlayer: () => void;
}

const AudioContext = createContext<AudioContextType>({
  currentSermon: null,
  isPlaying: false,
  playSermon: () => {},
  togglePlay: () => {},
  closePlayer: () => {},
});

export const useAudio = () => useContext(AudioContext);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentSermon, setCurrentSermon] = useState<Sermon | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSermon = (sermon: Sermon) => {
    if (!sermon.audioUrl) {
      alert("No audio available for this sermon.");
      return;
    }
    setCurrentSermon(sermon);
    setIsPlaying(true);
    // Audio element src will update, and useEffect will trigger play
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentSermon(null);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (audioRef.current && currentSermon) {
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, [currentSermon]);

  return (
    <AudioContext.Provider value={{ currentSermon, isPlaying, playSermon, togglePlay, closePlayer }}>
      {children}
      {currentSermon && (
        <GlobalAudioPlayer audioRef={audioRef} />
      )}
    </AudioContext.Provider>
  );
}

function GlobalAudioPlayer({ audioRef }: { audioRef: React.RefObject<HTMLAudioElement | null> }) {
  const { currentSermon, isPlaying, togglePlay, closePlayer } = useAudio();
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const { currentTime, duration } = audioRef.current;
    setProgress((currentTime / duration) * 100);
    setCurrentTime(formatTime(currentTime));
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

  if (!currentSermon) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "#22272E",
      color: "#FFFFFF",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      gap: "24px",
      zIndex: 9999,
      boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
      fontFamily: "var(--font-poppins)"
    }}>
      <audio 
        ref={audioRef} 
        src={currentSermon.audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => togglePlay()}
      />

      <button style={{ background: "none", border: "1px solid rgba(255,255,255,0.4)", color: "white", padding: "6px 16px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>
        Share
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "0 0 auto", minWidth: "200px" }}>
        <button onClick={closePlayer} style={{ background: "none", border: "none", color: "#8B949E", cursor: "pointer", fontSize: "18px", padding: "0 8px" }}>✕</button>
        <div style={{ fontSize: "14px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "250px" }}>
          {currentSermon.title}
        </div>
      </div>

      {/* Play Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
        <button onClick={togglePlay} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "24px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isPlaying ? "⏸" : "▶"}
        </button>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          <span style={{ fontSize: "12px", color: "#8B949E", width: "40px", textAlign: "right" }}>{currentTime}</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={isNaN(progress) ? 0 : progress} 
            onChange={handleSeek}
            style={{ flex: 1, accentColor: "#6496EF", height: "4px", backgroundColor: "#373E47", borderRadius: "2px", outline: "none", appearance: "none", cursor: "pointer" }}
          />
          <span style={{ fontSize: "12px", color: "#8B949E", width: "40px" }}>{duration}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={() => skip(-15)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "14px" }}>↺ 15</button>
        <button onClick={() => skip(15)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "14px" }}>15 ↻</button>
        <button style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "18px" }}>🔊</button>
      </div>
    </div>
  );
}
