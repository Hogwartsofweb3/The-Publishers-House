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

const DAYS_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const S = {
  Navy:    "#151A54",
  Blue700: "#0140C1",
  Blue500: "#2090FF",
  Paper100:"#F4F6FB",
  Paper200:"#E8ECF7",
  Paper300:"#D3DAEC",
  White:   "#FFFFFF",
  Slate500:"#747CA1",
  Slate600:"#4A62A0",
  Gold:    "#D97706",
};

export default function ContactCalendar() {
  const [events, setEvents] = useState<CMSEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const today = new Date();
  const [currentYear, setCurrentYear]   = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const [selectedDateStr, setSelectedDateStr]   = useState<string | null>(null);
  const [activeDateEvents, setActiveDateEvents] = useState<CMSEvent[]>([]);
  const [isServiceDay, setIsServiceDay]         = useState<"sunday" | "thursday" | null>(null);

  /* Detect mobile */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Fetch CMS events */
  useEffect(() => {
    fetch("/api/cms/events")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.events))
          setEvents(data.events.filter((e: CMSEvent) => e.published !== false));
      })
      .catch((e) => console.error("Calendar events error:", e))
      .finally(() => setLoading(false));
  }, []);

  /* Calendar maths */
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth    = new Date(currentYear, currentMonth + 1, 0).getDate();

  const fmtKey = (y: number, mo: number, d: number) =>
    `${y}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const handleDateClick = (day: number) => {
    const dateKey = fmtKey(currentYear, currentMonth, day);
    const dow     = new Date(currentYear, currentMonth, day).getDay();
    const matching = events.filter((ev) => ev.startAt?.startsWith(dateKey));
    setSelectedDateStr(dateKey);
    setActiveDateEvents(matching);
    setIsServiceDay(dow === 0 ? "sunday" : dow === 4 ? "thursday" : null);
  };

  const closePopup = () => {
    setSelectedDateStr(null);
    setActiveDateEvents([]);
    setIsServiceDay(null);
  };

  const fmtTime = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit", hour12: true,
      }) + " WAT";
    } catch { return ""; }
  };

  /* ── Shared styles ── */
  const btnStyle = (bg: string, color: string) => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "11px 20px", backgroundColor: bg, color,
    textDecoration: "none" as const, fontFamily: "var(--font-poppins)",
    fontWeight: 700, fontSize: "12px", letterSpacing: "0.14em",
    textTransform: "uppercase" as const, borderRadius: "4px",
    border: "none", cursor: "pointer", width: "100%", boxSizing: "border-box" as const,
  });

  const DAYS = isMobile ? DAYS_SHORT : DAYS_FULL;
  const cellMinH = isMobile ? "44px" : "70px";
  const cellPad  = isMobile ? "4px 2px" : "8px 6px";

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      {/* Calendar Card */}
      <div style={{
        backgroundColor: S.White,
        border: `1px solid ${S.Paper300}`,
        borderRadius: "8px",
        padding: isMobile ? "16px 12px" : "24px",
        boxShadow: "0 8px 24px rgba(21,26,84,0.04)",
      }}>
        {/* Header row */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "16px",
          flexWrap: "wrap", gap: "10px",
        }}>
          <div>
            <span style={{
              fontFamily: "var(--font-poppins)", fontSize: "9px", fontWeight: 600,
              letterSpacing: "0.18em", textTransform: "uppercase", color: S.Blue500,
              display: "block", marginBottom: "2px",
            }}>
              Plan Your Visit · Calendar
            </span>
            <h2 style={{
              fontFamily: "var(--font-poppins)", fontWeight: 700,
              fontSize: isMobile ? "18px" : "22px", color: S.Navy, margin: 0,
            }}>
              {MONTHS[currentMonth]} {currentYear}
            </h2>
          </div>

          {/* Nav buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={prevMonth}
              aria-label="Previous month"
              style={{
                width: "34px", height: "34px", borderRadius: "4px",
                border: `1px solid ${S.Paper300}`, background: S.Paper100,
                color: S.Navy, cursor: "pointer", fontWeight: 700,
                fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >‹</button>
            <button
              onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }}
              style={{
                padding: "6px 10px", borderRadius: "4px",
                border: `1px solid ${S.Paper300}`, background: S.Paper100,
                color: S.Slate600, cursor: "pointer",
                fontFamily: "var(--font-poppins)", fontSize: "10px",
                fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
              }}
            >Today</button>
            <button
              onClick={nextMonth}
              aria-label="Next month"
              style={{
                width: "34px", height: "34px", borderRadius: "4px",
                border: `1px solid ${S.Paper300}`, background: S.Paper100,
                color: S.Navy, cursor: "pointer", fontWeight: 700,
                fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >›</button>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: "flex", gap: "12px", marginBottom: "12px",
          fontSize: "10px", fontFamily: "var(--font-poppins)",
          color: S.Slate500, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: S.Blue700, flexShrink: 0 }} />
            <span>Special Event</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: S.Gold, flexShrink: 0 }} />
            <span>{isMobile ? "Regular Service" : "Service (Sun 9AM · Thu 4:30PM WAT)"}</span>
          </div>
        </div>

        {/* Day-of-week header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px", marginBottom: "4px" }}>
          {DAYS.map((d, idx) => (
            <div key={d + idx} style={{
              fontFamily: "var(--font-poppins)", fontWeight: 600,
              fontSize: isMobile ? "10px" : "11px",
              letterSpacing: "0.05em", textTransform: "uppercase",
              color: idx === 0 ? S.Blue700 : S.Slate500,
              padding: isMobile ? "4px 0" : "8px 0",
              textAlign: "center",
            }}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: isMobile ? "3px" : "5px" }}>
          {/* Empty offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} style={{ minHeight: cellMinH }} />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum   = i + 1;
            const dateKey  = fmtKey(currentYear, currentMonth, dayNum);
            const dow      = new Date(currentYear, currentMonth, dayNum).getDay();
            const isToday  = today.getFullYear() === currentYear &&
                             today.getMonth()    === currentMonth &&
                             today.getDate()     === dayNum;
            const isSun    = dow === 0;
            const isThu    = dow === 4;
            const dayEvts  = events.filter((ev) => ev.startAt?.startsWith(dateKey));
            const hasEvt   = dayEvts.length > 0;
            const hasSvc   = isSun || isThu;

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                onClick={() => handleDateClick(dayNum)}
                style={{
                  minHeight: cellMinH,
                  padding: cellPad,
                  border: isToday
                    ? `2px solid ${S.Blue500}`
                    : hasEvt
                    ? `1.5px solid ${S.Blue700}`
                    : `1px solid ${S.Paper200}`,
                  borderRadius: "5px",
                  backgroundColor: hasEvt
                    ? "rgba(1,64,193,0.05)"
                    : isToday ? S.Paper100 : S.White,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  transition: "background 0.12s",
                  textAlign: "left",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = S.Paper200;
                  e.currentTarget.style.borderColor = S.Blue700;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = hasEvt
                    ? "rgba(1,64,193,0.05)" : isToday ? S.Paper100 : S.White;
                  e.currentTarget.style.borderColor = isToday
                    ? S.Blue500 : hasEvt ? S.Blue700 : S.Paper200;
                }}
              >
                <span style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: isToday ? 800 : 600,
                  fontSize: isMobile ? "11px" : "13px",
                  color: isToday ? S.Blue700 : S.Navy,
                }}>
                  {dayNum}
                </span>

                {/* Indicators */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%" }}>
                  {hasEvt && (
                    isMobile ? (
                      /* Mobile: coloured dot only */
                      <span style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        backgroundColor: S.Blue700, flexShrink: 0,
                        marginTop: "3px",
                      }} />
                    ) : (
                      <div style={{
                        fontSize: "8px", fontFamily: "var(--font-poppins)", fontWeight: 700,
                        backgroundColor: S.Blue700, color: S.White,
                        padding: "2px 3px", borderRadius: "2px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }} title={dayEvts[0].title}>
                        ★ {dayEvts[0].title}
                      </div>
                    )
                  )}
                  {!hasEvt && hasSvc && (
                    isMobile ? (
                      <span style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        backgroundColor: S.Gold, flexShrink: 0, marginTop: "3px",
                      }} />
                    ) : (
                      <div style={{
                        fontSize: "8px", fontFamily: "var(--font-poppins)", fontWeight: 600,
                        backgroundColor: "rgba(217,119,6,0.12)", color: S.Gold,
                        padding: "2px 3px", borderRadius: "2px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {isSun ? "9:00 AM" : "4:30 PM"}
                      </div>
                    )
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MODAL ── */}
      {selectedDateStr && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobile ? "0" : "20px",
            zIndex: 9999,
          }}
          onClick={closePopup}
        >
          <div
            style={{
              backgroundColor: S.White,
              borderRadius: isMobile ? "12px 12px 0 0" : "8px",
              border: isMobile ? "none" : `1px solid ${S.Paper300}`,
              width: "100%",
              maxWidth: isMobile ? "100%" : "520px",
              maxHeight: isMobile ? "88vh" : "88vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(21,26,84,0.22)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            {isMobile && (
              <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
                <div style={{ width: "36px", height: "4px", borderRadius: "2px", backgroundColor: S.Paper300 }} />
              </div>
            )}

            {/* Modal header */}
            <div style={{
              padding: isMobile ? "12px 16px" : "18px 22px",
              borderBottom: `1px solid ${S.Paper200}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              backgroundColor: S.Paper100,
              borderRadius: isMobile ? "12px 12px 0 0" : undefined,
            }}>
              <div>
                <span style={{
                  fontFamily: "var(--font-poppins)", fontSize: "9px", fontWeight: 700,
                  letterSpacing: "0.16em", textTransform: "uppercase", color: S.Blue500,
                  display: "block",
                }}>
                  Gathering Details
                </span>
                <div style={{
                  fontFamily: "var(--font-poppins)", fontWeight: 700,
                  fontSize: isMobile ? "14px" : "16px", color: S.Navy, marginTop: "2px",
                }}>
                  {new Date(selectedDateStr + "T00:00:00").toLocaleDateString("en-NG", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </div>
              </div>
              <button
                onClick={closePopup}
                style={{
                  background: "transparent", border: "none", fontSize: "22px",
                  color: S.Slate500, cursor: "pointer", lineHeight: 1, padding: "4px 8px",
                }}
                aria-label="Close"
              >✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: isMobile ? "16px" : "22px", display: "flex", flexDirection: "column", gap: "16px" }}>

              {activeDateEvents.length > 0 ? (
                activeDateEvents.map((ev) => (
                  <div key={ev.id} style={{
                    border: `1px solid ${S.Paper300}`, borderRadius: "6px",
                    overflow: "hidden", backgroundColor: S.White,
                  }}>
                    {ev.imageUrl && (
                      <div style={{ width: "100%", height: isMobile ? "150px" : "180px", overflow: "hidden", backgroundColor: S.Paper100 }}>
                        <img src={ev.imageUrl} alt={ev.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <div style={{ padding: isMobile ? "14px" : "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <span style={{
                        fontFamily: "var(--font-poppins)", fontSize: "9px", fontWeight: 700,
                        color: S.Blue700, letterSpacing: "0.15em", textTransform: "uppercase",
                      }}>Special Gathering</span>
                      <h3 style={{
                        fontFamily: "var(--font-poppins)", fontWeight: 800,
                        fontSize: isMobile ? "16px" : "19px", color: S.Navy, margin: 0,
                      }}>{ev.title}</h3>

                      <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontFamily: "var(--font-poppins)", color: S.Slate600 }}>
                        {ev.startAt && (
                          <div><strong style={{ color: S.Navy }}>Time: </strong>
                            {fmtTime(ev.startAt)}{ev.endAt ? ` – ${fmtTime(ev.endAt)}` : ""}
                          </div>
                        )}
                        {ev.location && <div><strong style={{ color: S.Navy }}>Location: </strong>{ev.location}</div>}
                        {ev.speaker   && <div><strong style={{ color: S.Navy }}>Speaker: </strong>{ev.speaker}</div>}
                        {ev.scripture && <div><strong style={{ color: S.Navy }}>Scripture: </strong><em>{ev.scripture}</em></div>}
                      </div>

                      {ev.description && (
                        <p style={{ fontFamily: "var(--font-playfair)", fontSize: "14px", lineHeight: "1.6em", color: S.Slate600, margin: 0 }}>
                          {ev.description}
                        </p>
                      )}

                      <div style={{ marginTop: "8px", paddingTop: "12px", borderTop: `1px solid ${S.Paper200}` }}>
                        {ev.registrationUrl ? (
                          <a href={ev.registrationUrl} target="_blank" rel="noopener noreferrer"
                            style={btnStyle(S.Blue700, S.White)}>
                            Register for Event →
                          </a>
                        ) : (
                          <a href="#contact-form" onClick={closePopup} style={btnStyle(S.Blue700, S.White)}>
                            Plan to Attend · Contact Us
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : isServiceDay ? (
                <div style={{
                  border: `1px solid ${S.Paper300}`, borderRadius: "6px",
                  padding: isMobile ? "14px" : "18px", backgroundColor: S.White,
                  display: "flex", flexDirection: "column", gap: "10px",
                }}>
                  <span style={{
                    fontFamily: "var(--font-poppins)", fontSize: "9px", fontWeight: 700,
                    color: S.Gold, letterSpacing: "0.15em", textTransform: "uppercase",
                  }}>Weekly Gathering</span>
                  <h3 style={{
                    fontFamily: "var(--font-poppins)", fontWeight: 800,
                    fontSize: isMobile ? "16px" : "19px", color: S.Navy, margin: 0,
                  }}>
                    {isServiceDay === "sunday" ? "Sunday Worship Service" : "Midweek Service"}
                  </h3>
                  <div style={{ fontSize: "13px", fontFamily: "var(--font-poppins)", color: S.Slate600, display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div><strong style={{ color: S.Navy }}>Time: </strong>
                      {isServiceDay === "sunday" ? "9:00 AM WAT" : "4:30 PM WAT"}
                    </div>
                    <div><strong style={{ color: S.Navy }}>Venue: </strong>The House of Bread, Korinjoh House, British, Jos</div>
                    <div style={{ lineHeight: "1.6em" }}>
                      <strong style={{ color: S.Navy }}>What to Expect: </strong>
                      {isServiceDay === "sunday"
                        ? "Sound exposition of Scripture, reverent and passionate worship, ministry of the Holy Spirit, and fellowship."
                        : "Doctrine, prayer, spiritual re-alignment and corporate study of God's Word."}
                    </div>
                  </div>
                  <div style={{ paddingTop: "10px", borderTop: `1px solid ${S.Paper200}` }}>
                    <a href="https://wa.link/xr46nk" target="_blank" rel="noopener noreferrer"
                      style={btnStyle(S.Blue700, S.White)}>
                      Register Your Visit via WhatsApp →
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "16px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <p style={{ fontFamily: "var(--font-playfair)", fontSize: "15px", color: S.Slate600, margin: 0 }}>
                    No public gatherings on this date.
                  </p>
                  <p style={{ fontFamily: "var(--font-poppins)", fontSize: "13px", color: S.Navy, margin: 0 }}>
                    Join us for our next services:<br />
                    <strong>Sunday Worship:</strong> 9:00 AM WAT<br />
                    <strong>Thursday Midweek:</strong> 4:30 PM WAT
                  </p>
                  <div style={{ paddingTop: "4px" }}>
                    <a href="#contact-form" onClick={closePopup}
                      style={{ ...btnStyle(S.Paper200, S.Navy), fontSize: "11px" }}>
                      Send Enquiry / Prayer Request ↓
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
