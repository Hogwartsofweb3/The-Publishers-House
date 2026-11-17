"use client";

import React, { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import type { PortalUser } from "@/lib/portalAuth";

interface PushNotificationPromptProps {
  user: PortalUser;
}

export default function PushNotificationPrompt({ user }: PushNotificationPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    permissionState,
    isSubscribed,
    loading,
    requestPermissionAndSubscribe,
  } = usePushNotifications({
    uid: user.uid,
    email: user.email,
    enabled: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    // Only prompt if permission has never been asked ("default") and not recently dismissed
    if (Notification.permission === "default") {
      const dismissed = localStorage.getItem("tph_notif_prompt_dismissed");
      if (!dismissed) {
        // Gentle delay after first open
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleEnable = async () => {
    const res = await requestPermissionAndSubscribe();
    if (res === "granted") {
      setSuccess(true);
      setTimeout(() => {
        setShowPrompt(false);
      }, 1500);
    } else {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("tph_notif_prompt_dismissed", Date.now().toString());
    }
  };

  if (!showPrompt || permissionState === "granted" || permissionState === "denied") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        right: "20px",
        maxWidth: "420px",
        margin: "0 auto",
        zIndex: 99999,
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        border: "1.5px solid #C4D7FE",
        boxShadow: "0 16px 40px rgba(20, 28, 110, 0.22), 0 2px 8px rgba(0, 0, 0, 0.08)",
        padding: "20px",
        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
        animation: "slideUpNotification 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style>{`
        @keyframes slideUpNotification {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {success ? (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ fontSize: "28px", marginBottom: "6px" }}>🎉</div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#166534" }}>
            Notifications Turned On!
          </div>
          <p style={{ fontSize: "12px", color: "#4A5490", margin: "4px 0 0" }}>
            You will now receive church duty notices and gathering alerts even when the app is closed.
          </p>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#EEF4FF",
                border: "1px solid #BFDBFE",
                color: "#1F46C8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                flexShrink: 0,
              }}
            >
              🔔
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#141C6E", lineHeight: "1.25em" }}>
                Turn On Church Notifications
              </div>
              <p style={{ fontSize: "12px", color: "#4A5490", margin: "5px 0 0", lineHeight: "1.45em" }}>
                Receive instant alerts for Sunday service times, duty roster schedules, and fresh pastoral teachings even when the app is closed.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button
              onClick={handleEnable}
              disabled={loading}
              style={{
                flex: 1,
                padding: "11px 16px",
                backgroundColor: "#1F46C8",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "13px",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(31, 70, 200, 0.28)",
              }}
            >
              <span>🔔</span>
              <span>{loading ? "Connecting..." : "Turn On Notifications"}</span>
            </button>
            <button
              onClick={handleDismiss}
              style={{
                padding: "11px 14px",
                backgroundColor: "#F8FAFC",
                color: "#64748B",
                border: "1px solid #CBD5E1",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "12.5px",
                cursor: "pointer",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              }}
            >
              Not Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
