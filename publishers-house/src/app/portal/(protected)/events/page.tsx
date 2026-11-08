"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { db } from "@/lib/firebase";

const EventFormModal = dynamic(() => import("@/components/portal/EventFormModal"), {
  ssr: false,
});
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

export interface EventDaySession {
  dayNumber: number;
  label: string; // e.g. "Day 1", "Day 2", etc.
  date: string; // YYYY-MM-DD
  title?: string; // e.g. "Opening Night & Apostolic Impartation"
  time?: string; // e.g. "4:00 PM WAT" or "Morning 9:00 AM / Evening 5:00 PM"
  speaker?: string; // e.g. "Rev. Joshua Agunbiade"
  venue?: string;
  description?: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  category: string;
  date: string; // Start date
  endDate?: string; // End date
  time: string;
  venue: string;
  description?: string;
  status: "published" | "draft" | "completed";
  attendeesCount: number;
  days?: EventDaySession[];
  imageUrl?: string;
  registrationUrl?: string;
  speaker?: string;
  scripture?: string;
}

function formatDateRange(startDate: string, endDate?: string): string {
  if (!startDate) return "Upcoming";
  if (!endDate || endDate === startDate) {
    try {
      const d = new Date(startDate + "T00:00:00");
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      }
    } catch {}
    return startDate;
  }
  try {
    const s = new Date(startDate + "T00:00:00");
    const e = new Date(endDate + "T00:00:00");
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      const sStr = s.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const eStr = e.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      return `${sStr} – ${eStr}`;
    }
  } catch {}
  return `${startDate} – ${endDate}`;
}

function computeDaysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 1;
  try {
    const s = new Date(startDate + "T00:00:00").getTime();
    const e = new Date(endDate + "T00:00:00").getTime();
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  } catch {
    return 1;
  }
}

function generateDaySessions(startDate: string, endDate: string, defaultTime = "4:00 PM WAT"): EventDaySession[] {
  if (!startDate) return [];
  const count = computeDaysBetween(startDate, endDate || startDate);
  const startObj = new Date(startDate + "T00:00:00");
  const sessions: EventDaySession[] = [];

  for (let i = 0; i < count; i++) {
    const current = new Date(startObj);
    current.setDate(startObj.getDate() + i);
    const dateStr = current.toISOString().split("T")[0];
    const dayNum = i + 1;
    
    let defaultTitle = `Day ${dayNum} Encounter`;
    if (i === 0) defaultTitle = "Day 1 — Opening Session";
    else if (i === count - 1 && count > 1) defaultTitle = `Day ${dayNum} — Grand Finale & Impartation`;

    sessions.push({
      dayNumber: dayNum,
      label: `Day ${dayNum}`,
      date: dateStr,
      title: defaultTitle,
      time: defaultTime,
      speaker: "",
      description: "",
    });
  }
  return sessions;
}

const emptyFormState = {
  title: "",
  category: "Weekly Service",
  date: new Date().toISOString().split("T")[0],
  endDate: "",
  time: "8:00 AM",
  venue: "Main Sanctuary (Jos)",
  description: "",
  status: "published" as "published" | "draft" | "completed",
  days: [] as EventDaySession[],
  registrationUrl: "",
  speaker: "",
  scripture: "",
  imageUrl: "",
};

export default function EventsAdminPage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({ ...emptyFormState });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // 1. Try CMS API first
      const res = await fetch("/api/cms/events");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.events) && data.events.length > 0) {
          setEvents(
            data.events.map((item: any) => {
              const startAt = item.startAt || "";
              const endAt = item.endAt || "";
              const [dPart, tPart] = startAt.includes("T") ? startAt.split("T") : [startAt, ""];
              const [endDPart] = endAt.includes("T") ? endAt.split("T") : [endAt, ""];
              return {
                id: item.id,
                title: item.title || "",
                category: item.category || "Weekly Service",
                date: item.startDate || item.date || dPart || "Upcoming",
                endDate: item.endDate || endDPart || "",
                time: item.time || tPart || "8:00 AM",
                venue: item.location || item.venue || "Main Sanctuary (Jos)",
                description: item.description || item.summary || "",
                status: (item.published === false || item.status === "draft") ? "draft" : "published",
                attendeesCount: item.attendeesCount || 0,
                days: Array.isArray(item.days) ? item.days : [],
                imageUrl: item.imageUrl || "",
                registrationUrl: item.registrationUrl || "",
                speaker: item.speaker || "",
                scripture: item.scripture || "",
              };
            })
          );
          setLoading(false);
          return;
        }
      }
    } catch {}

    // Fallback to direct client Firestore
    try {
      const snap = await getDocs(query(collection(db, "events"), orderBy("startAt", "desc")));
      if (!snap.empty) {
        setEvents(
          snap.docs.map((d) => {
            const data = d.data();
            const startAt = data.startAt || "";
            const endAt = data.endAt || "";
            const [dPart, tPart] = startAt.includes("T") ? startAt.split("T") : [startAt, ""];
            const [endDPart] = endAt.includes("T") ? endAt.split("T") : [endAt, ""];
            return {
              id: d.id,
              title: data.title || "",
              category: data.category || "Weekly Service",
              date: data.startDate || dPart || data.date || "Upcoming",
              endDate: data.endDate || endDPart || "",
              time: data.time || tPart || "8:00 AM",
              venue: data.location || data.venue || "Main Sanctuary (Jos)",
              description: data.description || data.summary || "",
              status: (data.published === false || data.status === "draft") ? "draft" : "published",
              attendeesCount: data.attendeesCount || 0,
              days: Array.isArray(data.days) ? data.days : [],
              imageUrl: data.imageUrl || "",
              registrationUrl: data.registrationUrl || "",
              speaker: data.speaker || "",
              scripture: data.scripture || "",
            };
          })
        );
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.warn("Could not load events from Firestore:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;

    const id = editingEvent ? editingEvent.id : `event-${Date.now()}`;
    const startAt = form.date ? (form.time && form.time.includes(":") ? `${form.date}T${form.time}` : `${form.date}T08:00`) : "";
    const endAt = form.endDate ? `${form.endDate}T23:00` : "";

    const toSave: ChurchEvent = {
      ...form,
      id,
      attendeesCount: editingEvent ? editingEvent.attendeesCount : 0,
    };

    try {
      await fetch("/api/cms/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          id: editingEvent ? id : undefined,
          event: {
            title: form.title,
            summary: form.description || form.title,
            description: form.description,
            startDate: form.date,
            endDate: form.endDate || "",
            startAt: startAt || form.date,
            endAt: endAt || "",
            time: form.time,
            location: form.venue,
            venue: form.venue,
            category: form.category,
            days: form.days || [],
            published: form.status === "published",
            status: form.status,
            registrationUrl: form.registrationUrl || "",
            speaker: form.speaker || "",
            scripture: form.scripture || "",
            imageUrl: form.imageUrl || "",
          },
        }),
      });
    } catch {
      // Local fallback
    }

    if (editingEvent) {
      setEvents((prev) => prev.map((ev) => (ev.id === id ? toSave : ev)));
      setMsg("Event updated successfully ✓");
    } else {
      setEvents((prev) => [toSave, ...prev]);
      setMsg("Event created successfully ✓");
    }

    setShowModal(false);
    setEditingEvent(null);
    setForm({ ...emptyFormState });
    setTimeout(() => setMsg(""), 3500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await fetch("/api/cms/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
    } catch {}
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    setMsg("Event removed ✓");
    setTimeout(() => setMsg(""), 3000);
  };

  const openEdit = (ev: ChurchEvent) => {
    setEditingEvent(ev);
    setForm({
      title: ev.title,
      category: ev.category,
      date: ev.date,
      endDate: ev.endDate || "",
      time: ev.time,
      venue: ev.venue,
      description: ev.description || "",
      status: ev.status,
      days: ev.days && ev.days.length > 0 ? [...ev.days] : [],
      registrationUrl: ev.registrationUrl || "",
      speaker: ev.speaker || "",
      scripture: ev.scripture || "",
      imageUrl: ev.imageUrl || "",
    });
    setShowModal(true);
  };

  const handleAutoGenerateDays = () => {
    if (!form.date) {
      alert("Please select a Start Date first.");
      return;
    }
    const end = form.endDate || form.date;
    const generated = generateDaySessions(form.date, end, form.time || "4:00 PM WAT");
    setForm((prev) => ({ ...prev, days: generated }));
  };

  const handleAddDay = () => {
    const nextNum = (form.days?.length || 0) + 1;
    let nextDate = form.endDate || form.date;
    if (form.days && form.days.length > 0) {
      const lastDate = form.days[form.days.length - 1].date;
      if (lastDate) {
        try {
          const d = new Date(lastDate + "T00:00:00");
          d.setDate(d.getDate() + 1);
          nextDate = d.toISOString().split("T")[0];
        } catch {}
      }
    }

    const newDay: EventDaySession = {
      dayNumber: nextNum,
      label: `Day ${nextNum}`,
      date: nextDate || "",
      title: `Day ${nextNum} Session`,
      time: form.time || "4:00 PM WAT",
      speaker: "",
      description: "",
    };
    setForm((prev) => ({ ...prev, days: [...(prev.days || []), newDay] }));
  };

  const handleUpdateDay = (index: number, field: keyof EventDaySession, val: any) => {
    setForm((prev) => {
      const list = [...(prev.days || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, days: list };
    });
  };

  const handleRemoveDay = (index: number) => {
    setForm((prev) => {
      const list = (prev.days || []).filter((_, i) => i !== index);
      const renumbered = list.map((item, idx) => ({
        ...item,
        dayNumber: idx + 1,
        label: item.label.startsWith("Day ") ? `Day ${idx + 1}` : item.label,
      }));
      return { ...prev, days: renumbered };
    });
  };

  const filteredEvents = events.filter((ev) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return ev.status === "published";
    if (filter === "draft") return ev.status === "draft";
    if (filter === "conference") return ev.category === "Conference" || (ev.endDate && ev.endDate !== ev.date);
    return true;
  });

  const isMultiDay = Boolean(form.endDate && form.endDate !== form.date);
  const detectedDaysCount = isMultiDay ? computeDaysBetween(form.date, form.endDate || "") : 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 800,
              fontSize: "28px",
              lineHeight: "34px",
              color: "#141C6E",
              margin: 0,
            }}
          >
            Events &amp; Calendar
          </h1>
          <p
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 500,
              fontSize: "13px",
              color: "#4A5490",
              margin: "6px 0 0",
            }}
          >
            Schedule worship services, multi-day conferences, vigils, and campus special events
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && (
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                color: "#0F6B38",
                backgroundColor: "#E4F5EA",
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            >
              {msg}
            </span>
          )}

          <button
            onClick={() => {
              setEditingEvent(null);
              setForm({ ...emptyFormState });
              setShowModal(true);
            }}
            style={{
              backgroundColor: "#1F46C8",
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "13px",
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
              transition: "all 0.15s ease",
            }}
          >
            + Create Event
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #D5DCF2", paddingBottom: "12px" }}>
        {[
          { key: "all", label: "All Events" },
          { key: "upcoming", label: "Published & Upcoming" },
          { key: "conference", label: "Conferences & Multi-Day" },
          { key: "draft", label: "Drafts" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: filter === tab.key ? "#1F46C8" : "transparent",
              color: filter === tab.key ? "#FFFFFF" : "#4A5490",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Table */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D5DCF2",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFD", borderBottom: "1px solid #E8EDFB" }}>
                <th style={{ padding: "14px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Event Name</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Category</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Date Range &amp; Time</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Venue</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "14px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                    Loading events schedule...
                  </td>
                </tr>
              )}
              {!loading && filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                    No events found in this category.
                  </td>
                </tr>
              )}
              {filteredEvents.map((ev) => {
                const dateDisplay = formatDateRange(ev.date, ev.endDate);
                const hasMultipleDays = Boolean(ev.endDate && ev.endDate !== ev.date);
                const daysCount = hasMultipleDays ? computeDaysBetween(ev.date, ev.endDate || "") : 1;
                const isExpanded = expandedEventId === ev.id;

                return (
                  <tr
                    key={ev.id}
                    style={{
                      borderBottom: "1px solid #E8EDFB",
                      transition: "background-color 0.15s",
                    }}
                  >
                    <td style={{ padding: "16px 24px", verticalAlign: "top" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#141C6E",
                        }}
                      >
                        {ev.title}
                      </div>
                      {ev.description && (
                        <div
                          style={{
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "11.5px",
                            color: "#4A5490",
                            marginTop: "2px",
                            maxWidth: "380px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ev.description}
                        </div>
                      )}

                      {/* Multi-day schedule pill & toggle */}
                      {ev.days && ev.days.length > 0 && (
                        <div style={{ marginTop: "8px" }}>
                          <button
                            type="button"
                            onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                            style={{
                              background: "#EEF4FF",
                              border: "1px solid #C7D9FB",
                              borderRadius: "4px",
                              padding: "3px 8px",
                              fontSize: "11px",
                              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                              fontWeight: 600,
                              color: "#0140C1",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span>🗓️</span> {ev.days.length} Sessions Schedule {isExpanded ? "▲ Hide" : "▼ View"}
                          </button>

                          {isExpanded && (
                            <div
                              style={{
                                marginTop: "10px",
                                padding: "12px",
                                background: "#F8FAFD",
                                border: "1px solid #D5DCF2",
                                borderRadius: "8px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                              }}
                            >
                              {ev.days.map((d, dIdx) => (
                                <div
                                  key={dIdx}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "11px",
                                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                                    color: "#141C6E",
                                  }}
                                >
                                  <span
                                    style={{
                                      backgroundColor: "#1F46C8",
                                      color: "#FFFFFF",
                                      fontWeight: 700,
                                      padding: "1px 6px",
                                      borderRadius: "3px",
                                      fontSize: "10px",
                                    }}
                                  >
                                    {d.label || `Day ${d.dayNumber}`}
                                  </span>
                                  <span style={{ fontWeight: 600, color: "#4A5490" }}>{d.date}</span>
                                  {d.title && <span>· <strong>{d.title}</strong></span>}
                                  {d.time && <span style={{ color: "#747CA1" }}>({d.time})</span>}
                                  {d.speaker && <span style={{ color: "#0140C1" }}>— {d.speaker}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          backgroundColor: "#E8EDFB",
                          color: "#1F46C8",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {ev.category}
                      </span>
                    </td>

                    <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: "#141C6E",
                        }}
                      >
                        {dateDisplay}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          color: "#4A5490",
                          marginTop: "2px",
                        }}
                      >
                        {ev.time}
                      </div>
                      {hasMultipleDays && (
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "4px",
                            backgroundColor: "#FEF3C7",
                            color: "#92400E",
                            border: "1px solid #FDE68A",
                            borderRadius: "4px",
                            padding: "2px 6px",
                            fontSize: "10px",
                            fontWeight: 700,
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          }}
                        >
                          {daysCount} Days (Day 1 – {daysCount})
                        </span>
                      )}
                    </td>

                    <td
                      style={{
                        padding: "16px 20px",
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "12.5px",
                        color: "#4A5490",
                        verticalAlign: "top",
                      }}
                    >
                      {ev.venue}
                    </td>

                    <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "99px",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: ev.status === "published" ? "#E4F5EA" : "#FFF2D6",
                          color: ev.status === "published" ? "#0F6B38" : "#7A5200",
                        }}
                      >
                        {ev.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>

                    <td style={{ padding: "16px 24px", textAlign: "right", verticalAlign: "top" }}>
                      <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                        <Link
                          href={`/schedule/${ev.id}`}
                          target="_blank"
                          style={{
                            backgroundColor: "#F4F6FB",
                            border: "1px solid #D3DAEC",
                            borderRadius: "6px",
                            padding: "6px 10px",
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            color: "#0140C1",
                            textDecoration: "none",
                          }}
                        >
                          View ↗
                        </Link>
                        <button
                          onClick={() => openEdit(ev)}
                          style={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #D5DCF2",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            color: "#141C6E",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          style={{
                            backgroundColor: "#FDE7E7",
                            border: "1px solid #F8B4B4",
                            borderRadius: "6px",
                            padding: "6px 10px",
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            color: "#9B1C1C",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal (Dynamically Imported) */}
      {showModal && (
        <EventFormModal
          editingEvent={editingEvent}
          form={form}
          setForm={setForm}
          onClose={() => setShowModal(false)}
          onSubmit={handleSave}
          onAutoGenerateDays={handleAutoGenerateDays}
          onAddDay={handleAddDay}
          onRemoveDay={handleRemoveDay}
          onUpdateDay={handleUpdateDay}
          formatDateRange={formatDateRange}
        />
      )}
    </div>
  );
}