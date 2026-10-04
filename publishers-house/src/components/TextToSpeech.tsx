"use client";

import { useState, useEffect, useRef } from "react";

const Navy    = "#151A54";
const Blue500 = "#2090FF";
const Blue700 = "#0140C1";
const Paper200 = "#E8ECF7";
const Slate500 = "#747CA1";
const White   = "#FFFFFF";

export default function TextToSpeech({ title, htmlContent }: { title: string, htmlContent: string }) {
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

    // Clean HTML to get plain text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    const textToRead = `${title}. . ${textContent}`; // Read title first, short pause, then body

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9; // Slightly slower for comfortable listening
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsPlaying(false);
      setIsPaused(false);
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    };

    utteranceRef.current = utterance;

    // Cleanup on unmount
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    };
  }, [title, htmlContent]);

  const startKeepAlive = () => {
    // Workaround for Chrome/WebKit bug where TTS stops after 15 seconds
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
      // Pause
      synthRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    } else if (isPaused) {
      // Resume
      synthRef.current.resume();
      setIsPlaying(true);
      setIsPaused(false);
      startKeepAlive();
    } else {
      // Start fresh
      synthRef.current.cancel(); // Clear queue just in case
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
        gap: "16px"
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
            transition: "all 0.2s"
          }}
        >
          {isPlaying ? (
            <>
              <span>⏸</span> Pause
            </>
          ) : (
            <>
              <span>▶</span> {isPaused ? "Resume" : "Play"}
            </>
          )}
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
              textTransform: "uppercase"
            }}
          >
            <span>⏹</span> Stop
          </button>
        )}
      </div>
    </div>
  );
}
