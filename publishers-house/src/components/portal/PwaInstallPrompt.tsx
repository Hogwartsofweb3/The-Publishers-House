"use client";

import React, { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already running as installed standalone PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone || installed) {
    return null; // Already running in installed app
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(!showIosGuide);
    }
  };

  // Only render if browser can install (Android/Chrome prompt ready, or iOS user)
  if (!deferredPrompt && !isIos) {
    return null;
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={handleInstallClick}
        title="Add TPH Portal to Home Screen"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "8px",
          backgroundColor: "#1F46C8",
          color: "#FFFFFF",
          border: "none",
          fontSize: "11.5px",
          fontWeight: 700,
          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
          whiteSpace: "nowrap",
          transition: "all 0.15s ease",
        }}
      >
        {/* Crisp vector device / install icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
          <path d="M12 6v6m-3-3 3 3 3-3" />
        </svg>
        <span>Install App</span>
      </button>

      {/* iOS instructions popup */}
      {showIosGuide && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "270px",
            backgroundColor: "#0E1556",
            color: "#FFFFFF",
            padding: "14px 16px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            zIndex: 100,
            fontSize: "12px",
            lineHeight: "1.45em",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontWeight: 800, color: "#2090FF", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Install on iPhone / iPad
            </span>
            <button
              onClick={() => setShowIosGuide(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "14px", cursor: "pointer", padding: 0 }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: "4px 0", color: "#E2E8F0" }}>
            1. Tap the Safari <strong>Share</strong> button (box with upward arrow) at the bottom.
          </p>
          <p style={{ margin: "4px 0", color: "#E2E8F0" }}>
            2. Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
