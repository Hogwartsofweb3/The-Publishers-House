"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CMSEvent {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  location?: string;
  imageUrl?: string;
  registrationUrl?: string;
  speaker?: string;
  scripture?: string;
  published?: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const S = {
  Navy: "#151A54",
  Blue700: "#0140C1",
  Blue500: "#2090FF",
  Paper100: "#F4F6FB",
  Paper200: "#E8ECF7",
  Paper300: "#D3DAEC",
  White: "#FFFFFF",
  Slate500: "#747CA1",
  Slate600: "#4A62A0",
  Gold: "#D97706",
};

export default function ContactCalendar() {
  const [events, setEvents] = useState<CMSEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  // Pop-up modal state
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [activeDateEvents, setActiveDateEvents] = useState<CMSEvent[]>([]);
  const [isServiceDay, setIsServiceDay] = useState<"sunday" | "thursday" | null>(null);

  useEffect(() => {
    fetch("/api/cms/events")
      .then((r) => r.json())
      .then((data) => {
        if (data.events && Array.isArray(data.events)) {
          // Filter to published events only
          setEvents(data.events.filter((e: CMSEvent) => e.published !== false));
        }
      })
      .catch((e) => console.error("Error fetching calendar events:", e))
      .finally(() => setLoading(false));
  }, []);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar math
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Helper to format date as YYYY-MM-DD
  const formatDateKey = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const handleDateClick = (day: number) => {
    const dateKey = formatDateKey(currentYear, currentMonth, day);
    const dateObj = new Date(currentYear, currentMonth, day);
    const dayOfWeek = dateObj.getDay();

    // Find CMS events on this day
    const matching = events.filter((ev) => {
      if (!ev.startAt) return false;
      return ev.startAt.startsWith(dateKey);
    });

    setSelectedDateStr(dateKey);
    setActiveDateEvents(matching);

    if (dayOfWeek === 0) {
      setIsServiceDay("sunday");
    } else if (dayOfWeek === 4) {
      setIsServiceDay("thursday");
    } else {
      setIsServiceDay(null);
    }
  };

  const closePopup = () => {
    setSelectedDateStr(null);
    setActiveDateEvents([]);
    setIsServiceDay(null);
  };

  const formatEventTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) + " WAT";
    } catch {
      return "";
    }
  };

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      {/* Calendar Header Card */}
      <div
        style={{
          backgroundColor: S.White,
          border: `1px solid ${S.Paper300}`,
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0px 8px 24px rgba(21, 26, 84, 0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span style={{ fontFamily: "var(--font-poppins)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: S.Blue500 }}>
              Plan Your Visit · Gatherings Calendar
            </span>
            <h2 style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "24px", color: S.Navy, margin: "4px 0 0" }}>
              {MONTHS[currentMonth]} {currentYear}
            </h2>
          </div>

          {/* Month Switcher Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={prevMonth}
              aria-label="Previous Month"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "4px",
                border: `1px solid ${S.Paper300}`,
                background: S.Paper100,
                color: S.Navy,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ‹
            </button>
            <button
              onClick={() => {
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "4px",
                border: `1px solid ${S.Paper300}`,
                background: S.Paper100,
                color: S.Slate600,
                cursor: "pointer",
                fontFamily: "var(--font-poppins)",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              aria-label="Next Month"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "4px",
                border: `1px solid ${S.Paper300}`,
                background: S.Paper100,
                color: S.Navy,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ›
            </button>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px", fontSize: "11px", fontFamily: "var(--font-poppins)", color: S.Slate500, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: S.Blue700 }} />
            <span>Special Event / Program</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: S.Gold }} />
            <span>Regular Service (Sun 9:00 AM WAT · Thu 4:30 PM WAT)</span>
          </div>
        </div>

        {/* Day-of-week header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center", marginBottom: "8px" }}>
          {DAYS.map((d, idx) => (
            <div
              key={d}
              style={{
                fontFamily: "var(--font-poppins)",
                fontWeight: 600,
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: idx === 0 ? S.Blue700 : S.Slate500,
                padding: "8px 0",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
          {/* Empty offset days */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} style={{ minHeight: "64px", opacity: 0.2 }} />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateKey = formatDateKey(currentYear, currentMonth, dayNum);
            const dateObj = new Date(currentYear, currentMonth, dayNum);
            const dayOfWeek = dateObj.getDay();

            const isToday =
              today.getFullYear() === currentYear &&
              today.getMonth() === currentMonth &&
              today.getDate() === dayNum;

            const isSun = dayOfWeek === 0;
            const isThu = dayOfWeek === 4;

            // Events on this day
            const dayEvents = events.filter((ev) => ev.startAt && ev.startAt.startsWith(dateKey));
            const hasSpecialEvent = dayEvents.length > 0;
            const hasGathering = isSun || isThu;

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                onClick={() => handleDateClick(dayNum)}
                style={{
                  minHeight: "70px",
                  padding: "8px 6px",
                  border: isToday
                    ? `2px solid ${S.Blue500}`
                    : hasSpecialEvent
                    ? `1.5px solid ${S.Blue700}`
                    : `1px solid ${S.Paper200}`,
                  borderRadius: "6px",
                  backgroundColor: hasSpecialEvent
                    ? "rgba(1, 64, 193, 0.05)"
                    : isToday
                    ? S.Paper100
                    : S.White,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  transition: "all 0.15s ease",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = S.Paper200;
                  e.currentTarget.style.borderColor = S.Blue700;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = hasSpecialEvent
                    ? "rgba(1, 64, 193, 0.05)"
                    : isToday
                    ? S.Paper100
                    : S.White;
                  e.currentTarget.style.borderColor = isToday
                    ? S.Blue500
                    : hasSpecialEvent
                    ? S.Blue700
                    : S.Paper200;
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-poppins)",
                      fontWeight: isToday ? 800 : 600,
                      fontSize: "13px",
                      color: isToday ? S.Blue700 : S.Navy,
                    }}
                  >
                    {dayNum}
                  </span>
                  {isToday && (
                    <span style={{ fontSize: "8px", fontWeight: 700, color: S.Blue700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Today
                    </span>
                  )}
                </div>

                {/* Badges / indicators on date cell */}
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", width: "100%", marginTop: "4px" }}>
                  {hasSpecialEvent && (
                    <div
                      style={{
                        fontSize: "9px",
                        fontFamily: "var(--font-poppins)",
                        fontWeight: 700,
                        backgroundColor: S.Blue700,
                        color: S.White,
                        padding: "2px 4px",
                        borderRadius: "3px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                      title={dayEvents[0].title}
                    >
                      ★ {dayEvents[0].title}
                    </div>
                  )}

                  {!hasSpecialEvent && hasGathering && (
                    <div
                      style={{
                        fontSize: "9px",
                        fontFamily: "var(--font-poppins)",
                        fontWeight: 600,
                        backgroundColor: "rgba(217, 119, 6, 0.12)",
                        color: S.Gold,
                        padding: "2px 4px",
                        borderRadius: "3px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isSun ? "9:00 AM WAT" : "4:30 PM WAT"}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          POP-UP EVENT CARD MODAL (Detailed Event with Register)
      ══════════════════════════════════════════════════════════ */}
      {selectedDateStr && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999,
          }}
          onClick={closePopup}
        >
          <div
            style={{
              backgroundColor: S.White,
              borderRadius: "8px",
              border: `1px solid ${S.Paper300}`,
              maxWidth: "540px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(21, 26, 84, 0.25)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${S.Paper200}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: S.Paper100,
              }}
            >
              <div>
                <span style={{ fontFamily: "var(--font-poppins)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: S.Blue500 }}>
                  Gathering Details
                </span>
                <div style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "17px", color: S.Navy, marginTop: "2px" }}>
                  {new Date(selectedDateStr + "T00:00:00").toLocaleDateString("en-NG", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
              <button
                onClick={closePopup}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  color: S.Slate500,
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: "4px 8px",
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* CMS Special Events */}
              {activeDateEvents.length > 0 ? (
                activeDateEvents.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      border: `1px solid ${S.Paper300}`,
                      borderRadius: "6px",
                      overflow: "hidden",
                      backgroundColor: S.White,
                    }}
                  >
                    {ev.imageUrl && (
                      <div style={{ width: "100%", height: "180px", overflow: "hidden", backgroundColor: S.Paper100 }}>
                        <img src={ev.imageUrl} alt={ev.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <span style={{ fontFamily: "var(--font-poppins)", fontSize: "10px", fontWeight: 700, color: S.Blue700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                        Special Gathering
                      </span>
                      <h3 style={{ fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "20px", color: S.Navy, margin: 0 }}>
                        {ev.title}
                      </h3>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontFamily: "var(--font-poppins)", color: S.Slate600 }}>
                        {ev.startAt && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: 600, color: S.Navy }}>Time:</span>
                            <span>{formatEventTime(ev.startAt)} {ev.endAt ? `– ${formatEventTime(ev.endAt)}` : ""}</span>
                          </div>
                        )}
                        {ev.location && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: 600, color: S.Navy }}>Location:</span>
                            <span>{ev.location}</span>
                          </div>
                        )}
                        {ev.speaker && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: 600, color: S.Navy }}>Speaker:</span>
                            <span>{ev.speaker}</span>
                          </div>
                        )}
                        {ev.scripture && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: 600, color: S.Navy }}>Scripture:</span>
                            <span style={{ fontStyle: "italic" }}>{ev.scripture}</span>
                          </div>
                        )}
                      </div>

                      {ev.description && (
                        <p style={{ fontFamily: "var(--font-playfair)", fontSize: "15px", lineHeight: "1.6em", color: S.Slate600, margin: 0 }}>
                          {ev.description}
                        </p>
                      )}

                      {/* Register Button */}
                      <div style={{ marginTop: "12px", paddingTop: "14px", borderTop: `1px solid ${S.Paper200}`, display: "flex", gap: "10px" }}>
                        {ev.registrationUrl ? (
                          <a
                            href={ev.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "12px 24px",
                              backgroundColor: S.Blue700,
                              color: S.White,
                              textDecoration: "none",
                              fontFamily: "var(--font-poppins)",
                              fontWeight: 700,
                              fontSize: "12px",
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              borderRadius: "4px",
                              flex: 1,
                              textAlign: "center",
                            }}
                          >
                            Register for Event →
                          </a>
                        ) : (
                          <a
                            href="#contact-form"
                            onClick={closePopup}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "12px 24px",
                              backgroundColor: S.Blue700,
                              color: S.White,
                              textDecoration: "none",
                              fontFamily: "var(--font-poppins)",
                              fontWeight: 700,
                              fontSize: "12px",
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              borderRadius: "4px",
                              flex: 1,
                              textAlign: "center",
                            }}
                          >
                            Plan to Attend · Contact Us
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : isServiceDay ? (
                /* Regular Sunday / Thursday Service Card */
                <div
                  style={{
                    border: `1px solid ${S.Paper300}`,
                    borderRadius: "6px",
                    padding: "20px",
                    backgroundColor: S.White,
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-poppins)", fontSize: "10px", fontWeight: 700, color: S.Gold, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    Weekly Gathering
                  </span>
                  <h3 style={{ fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "20px", color: S.Navy, margin: 0 }}>
                    {isServiceDay === "sunday" ? "Sunday Worship Service" : "Midweek Service"}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontFamily: "var(--font-poppins)", color: S.Slate600 }}>
                    <div>
                      <strong style={{ color: S.Navy }}>Time: </strong>
                      {isServiceDay === "sunday" ? "9:00 AM WAT" : "4:30 PM WAT"}
                    </div>
                    <div>
                      <strong style={{ color: S.Navy }}>Venue: </strong>
                      The House of Bread, Korinjoh House, British, Jos
                    </div>
                    <div>
                      <strong style={{ color: S.Navy }}>What to Expect: </strong>
                      {isServiceDay === "sunday"
                        ? "Sound exposition of Scripture, reverent and passionate worship, ministry of the Holy Spirit, and fellowship."
                        : "Doctrine, prayer, spiritual re-alignment and corporate study of God's Word."}
                    </div>
                  </div>

                  <div style={{ marginTop: "8px", paddingTop: "14px", borderTop: `1px solid ${S.Paper200}` }}>
                    <a
                      href="https://wa.link/xr46nk"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "12px 24px",
                        backgroundColor: S.Blue700,
                        color: S.White,
                        textDecoration: "none",
                        fontFamily: "var(--font-poppins)",
                        fontWeight: 700,
                        fontSize: "12px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        borderRadius: "4px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      Register Your Visit via WhatsApp →
                    </a>
                  </div>
                </div>
              ) : (
                /* General Day */
                <div style={{ textAlign: "center", padding: "20px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", color: S.Slate600, margin: 0 }}>
                    No public gatherings are scheduled for this date.
                  </p>
                  <p style={{ fontFamily: "var(--font-poppins)", fontSize: "13px", color: S.Navy, margin: 0 }}>
                    You are warmly welcome to join us for our next services:
                    <br />
                    <strong>Sunday Worship:</strong> 9:00 AM WAT
                    <br />
                    <strong>Thursday Midweek:</strong> 4:30 PM WAT
                  </p>
                  <div style={{ marginTop: "12px" }}>
                    <a
                      href="#contact-form"
                      onClick={closePopup}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "10px 20px",
                        backgroundColor: S.Paper200,
                        color: S.Navy,
                        textDecoration: "none",
                        fontFamily: "var(--font-poppins)",
                        fontWeight: 600,
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        borderRadius: "4px",
                      }}
                    >
                      Send Us an Enquiry / Prayer Request ↓
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
