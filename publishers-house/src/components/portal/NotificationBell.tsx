"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export interface PortalNotification {
  id: string;
  userId: string;
  userEmail?: string;
  title: string;
  message: string;
  type: "duty_assigned" | "prayer_prayed" | "testimony_approved" | "announcement" | "general";
  link?: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/portal/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/portal/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleClickItem = async (notif: PortalNotification) => {
    if (!notif.read) {
      try {
        await fetch("/api/portal/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_read", id: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {}
    }
    setOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getIconForType = (type: string) => {
    if (type === "duty_assigned") {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F46C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    }
    if (type === "prayer_prayed") {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6B38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    }
    if (type === "testimony_approved") {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      {/* Realistic Bell Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Portal Notifications"
        title="Notifications"
        style={{
          position: "relative",
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          border: "1px solid #D5DCF2",
          backgroundColor: open ? "#EDE9FE" : "#F4F6FB",
          color: open ? "#1F46C8" : "#4A5490",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.15s ease",
          outline: "none",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread Badge Pill */}
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              backgroundColor: "#DC2626",
              color: "#FFFFFF",
              fontSize: "10px",
              fontWeight: 800,
              minWidth: "18px",
              height: "18px",
              borderRadius: "99px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              border: "2px solid #FFFFFF",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              boxShadow: "0 2px 4px rgba(220, 38, 38, 0.4)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Drawer */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "340px",
            maxWidth: "calc(100vw - 24px)",
            backgroundColor: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid #D5DCF2",
            boxShadow: "0 16px 36px -8px rgba(14, 21, 86, 0.22), 0 6px 16px -4px rgba(14, 21, 86, 0.12)",
            zIndex: 100,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid #E8EDFB",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#FAFBFD",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 800,
                  fontSize: "14px",
                  color: "#141C6E",
                }}
              >
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: "#EFF6FF",
                    color: "#1F46C8",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "99px",
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: "none",
                  border: "none",
                  color: "#1F46C8",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "4px 6px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "36px 20px", textAlign: "center", color: "#64748B" }}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ margin: "0 auto 8px", display: "block" }}
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#141C6E" }}>
                  All caught up!
                </div>
                <div style={{ fontSize: "11.5px", marginTop: "2px" }}>
                  You have no unread notifications.
                </div>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleClickItem(notif)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #F1F4F9",
                    cursor: "pointer",
                    backgroundColor: notif.read ? "#FFFFFF" : "#F8FAFF",
                    transition: "background-color 0.12s",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F1F5FD")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = notif.read ? "#FFFFFF" : "#F8FAFF")
                  }
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getIconForType(notif.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "3px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12.5px",
                          fontWeight: notif.read ? 600 : 700,
                          color: "#141C6E",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {notif.title}
                      </span>
                      <span style={{ fontSize: "10px", color: "#94A3B8", flexShrink: 0 }}>
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "11.5px",
                        color: "#4A5490",
                        margin: 0,
                        lineHeight: "1.4em",
                        wordBreak: "break-word",
                      }}
                    >
                      {notif.message}
                    </p>
                  </div>

                  {!notif.read && (
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: "#1F46C8",
                        flexShrink: 0,
                        marginTop: "5px",
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
