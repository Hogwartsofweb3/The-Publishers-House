"use client";

import React, { useState, useRef, useEffect } from "react";

interface AddToCalendarButtonProps {
  title: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD or ISO string
  endDate?: string;
  time?: string; // e.g. "9:00 AM WAT" or "18:00"
  variant?: "primary" | "secondary" | "subtle" | "banner";
  buttonText?: string;
}

/** Format date string & time to iCalendar compact format: YYYYMMDDTHHmm00Z */
function formatIcsDateTime(dateStr: string, timeStr?: string, defaultHour = 9, durationHours = 2): { start: string; end: string } {
  try {
    // If dateStr is an ISO string or YYYY-MM-DD
    const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const parts = cleanDate.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    let hour = defaultHour;
    let minute = 0;

    if (timeStr) {
      const match12 = timeStr.match(/(\d+):?(\d*)\s*(am|pm)/i);
      const match24 = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (match12) {
        let h = parseInt(match12[1], 10);
        const m = match12[2] ? parseInt(match12[2], 10) : 0;
        const isPm = match12[3].toLowerCase() === "pm";
        if (isPm && h < 12) h += 12;
        if (!isPm && h === 12) h = 0;
        hour = h;
        minute = m;
      } else if (match24) {
        hour = parseInt(match24[1], 10);
        minute = parseInt(match24[2], 10);
      }
    }

    const startDate = new Date(year, month, day, hour, minute);
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

    const pad = (n: number) => n.toString().padStart(2, "0");
    const toCompact = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    return {
      start: toCompact(startDate),
      end: toCompact(endDate),
    };
  } catch {
    // Fallback simple date
    const clean = dateStr.replace(/-/g, "");
    return { start: clean, end: clean };
  }
}

export default function AddToCalendarButton({
  title,
  description = "Join us at The Publishers House for this fellowship encounter.",
  location = "The House of Bread, Jos & Online Stream",
  startDate,
  endDate,
  time,
  variant = "secondary",
  buttonText = "Add to Calendar",
}: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const { start, end } = formatIcsDateTime(startDate, time);

  // 1. Google Calendar URL
  const googleCalUrl = (() => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      details: description,
      location: location,
      dates: `${start}/${end}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  })();

  // 2. Apple / Outlook ICS file download
  const handleDownloadIcs = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//The Publishers House//Portal Events//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:tph-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@thepublishershouse.org`,
      `DTSTAMP:${start}Z`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title.replace(/[,;]/g, " ")}`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n").replace(/[,;]/g, " ")}`,
      `LOCATION:${location.replace(/[,;]/g, " ")}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  // Button styles based on variant
  let btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
    cursor: "pointer",
    border: "1px solid #D5DCF2",
    backgroundColor: "#FFFFFF",
    color: "#141C6E",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
  };

  if (variant === "primary") {
    btnStyle = {
      ...btnStyle,
      backgroundColor: "#1F46C8",
      color: "#FFFFFF",
      border: "1px solid #1F46C8",
      boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
    };
  } else if (variant === "banner") {
    btnStyle = {
      ...btnStyle,
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      color: "#FFFFFF",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      backdropFilter: "blur(8px)",
    };
  } else if (variant === "subtle") {
    btnStyle = {
      ...btnStyle,
      padding: "6px 10px",
      fontSize: "11px",
      backgroundColor: "#F4F6FB",
      color: "#1F46C8",
      border: "1px solid #D5DCF2",
    };
  }

  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={btnStyle}
        aria-haspopup="true"
        aria-expanded={open}
        title="Sync this service or conference with your calendar"
      >
        {/* Realistic crisp vector Calendar SVG */}
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="8" cy="14" r="1" fill="currentColor" />
          <circle cx="12" cy="14" r="1" fill="currentColor" />
          <circle cx="16" cy="14" r="1" fill="currentColor" />
          <circle cx="8" cy="18" r="1" fill="currentColor" />
          <circle cx="12" cy="18" r="1" fill="currentColor" />
        </svg>
        <span>{buttonText}</span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: variant === "banner" ? 0 : "auto",
            right: variant === "banner" ? "auto" : 0,
            zIndex: 100,
            minWidth: "215px",
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
            border: "1px solid #D5DCF2",
            boxShadow: "0 10px 25px -5px rgba(20, 28, 110, 0.22), 0 8px 10px -6px rgba(20, 28, 110, 0.12)",
            padding: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <div
            style={{
              padding: "6px 10px 4px",
              fontSize: "10.5px",
              fontWeight: 700,
              color: "#747CA1",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            }}
          >
            Select Calendar
          </div>

          {/* Google Calendar Link */}
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              borderRadius: "7px",
              color: "#141C6E",
              textDecoration: "none",
              fontSize: "12.5px",
              fontWeight: 600,
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              transition: "background-color 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F4F6FB")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            {/* Google Calendar clean icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" fill="#4285F4" />
              <rect x="5" y="7" width="14" height="12" rx="1.5" fill="#FFFFFF" />
              <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#4285F4">
                31
              </text>
            </svg>
            <span>Google Calendar</span>
          </a>

          {/* Apple / Outlook .ics Download */}
          <button
            type="button"
            onClick={handleDownloadIcs}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              borderRadius: "7px",
              color: "#141C6E",
              backgroundColor: "transparent",
              border: "none",
              fontSize: "12.5px",
              fontWeight: 600,
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              transition: "background-color 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F4F6FB")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            {/* Apple / iCal clean vector icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141C6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-4h2zm0-6h-2V8h2z" fill="#0E1556" />
            </svg>
            <span>Apple / Outlook (.ics)</span>
          </button>
        </div>
      )}
    </div>
  );
}
