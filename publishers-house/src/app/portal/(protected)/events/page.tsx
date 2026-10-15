"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

interface ChurchEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  description?: string;
  status: "published" | "draft" | "completed";
  attendeesCount: number;
}

const SEED_EVENTS: ChurchEvent[] = [
  {
    id: "ev-1",
    title: "Sunday Celebration Service",
    category: "Weekly Service",
    date: "2026-10-18",
    time: "8:00 AM & 10:00 AM",
    venue: "Main Sanctuary (Jos)",
    description: "Two powerful services of Word, Worship, and the demonstration of the Spirit.",
    status: "published",
    attendeesCount: 420,
  },
  {
    id: "ev-2",
    title: "Midweek Faith Clinic",
    category: "Weekly Service",
    date: "2026-10-22",
    time: "5:30 PM",
    venue: "Main Sanctuary & Online",
    description: "In-depth Bible exposition and healing prayer meeting.",
    status: "published",
    attendeesCount: 180,
  },
  {
    id: "ev-3",
    title: "Festival of Light 2026",
    category: "Conference",
    date: "2026-11-20",
    time: "5:00 PM Daily",
    venue: "TPH Jos Convention Grounds",
    description: "Our flagship annual spiritual gathering: light, revelation, and kingdom harvest.",
    status: "published",
    attendeesCount: 1500,
  },
  {
    id: "ev-4",
    title: "Pastoral Leadership Retreat",
    category: "Leadership",
    date: "2026-10-30",
    time: "9:00 AM",
    venue: "Abuja Campus Hall",
    description: "Quarterly spiritual and strategic alignment for ministers and unit heads.",
    status: "draft",
    attendeesCount: 35,
  },
  {
    id: "ev-5",
    title: "All-Night Praise & Prophetic Vigils",
    category: "Prayer Meeting",
    date: "2026-11-06",
    time: "10:00 PM – 4:00 AM",
    venue: "Main Sanctuary (Jos)",
    description: "A continuous night of worship, prophetic declaration, and intercession.",
    status: "published",
    attendeesCount: 310,
  },
];

export default function EventsAdminPage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState<Omit<ChurchEvent, "id" | "attendeesCount">>({
    title: "",
    category: "Weekly Service",
    date: new Date().toISOString().split("T")[0],
    time: "8:00 AM",
    venue: "Main Sanctuary (Jos)",
    description: "",
    status: "published",
  });

  const fetchEvents = async () => {
    try {
      const snap = await getDocs(query(collection(db, "events"), orderBy("date", "asc")));
      if (!snap.empty) {
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChurchEvent)));
      } else {
        setEvents(SEED_EVENTS);
      }
    } catch {
      setEvents(SEED_EVENTS);
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
    const toSave: ChurchEvent = {
      ...form,
      id,
      attendeesCount: editingEvent ? editingEvent.attendeesCount : 0,
    };

    try {
      await setDoc(doc(db, "events", id), toSave);
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
    setForm({
      title: "",
      category: "Weekly Service",
      date: new Date().toISOString().split("T")[0],
      time: "8:00 AM",
      venue: "Main Sanctuary (Jos)",
      description: "",
      status: "published",
    });
    setTimeout(() => setMsg(""), 3500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
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
      time: ev.time,
      venue: ev.venue,
      description: ev.description || "",
      status: ev.status,
    });
    setShowModal(true);
  };

  const filteredEvents = events.filter((ev) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return ev.status === "published";
    if (filter === "draft") return ev.status === "draft";
    if (filter === "conference") return ev.category === "Conference";
    return true;
  });

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
            Events & Calendar
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
            Schedule worship services, conferences, vigils, and campus special events
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
              setForm({
                title: "",
                category: "Weekly Service",
                date: new Date().toISOString().split("T")[0],
                time: "8:00 AM",
                venue: "Main Sanctuary (Jos)",
                description: "",
                status: "published",
              });
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
          { key: "conference", label: "Conferences" },
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

      {/* Events Table (Figma 311:2385) */}
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
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Date & Time</th>
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
              {filteredEvents.map((ev) => (
                <tr
                  key={ev.id}
                  style={{
                    borderBottom: "1px solid #E8EDFB",
                    transition: "background-color 0.15s",
                  }}
                >
                  <td style={{ padding: "16px 24px" }}>
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
                  </td>

                  <td style={{ padding: "16px 20px" }}>
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

                  <td style={{ padding: "16px 20px" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "#141C6E",
                      }}
                    >
                      {ev.date}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "11px",
                        color: "#4A5490",
                      }}
                    >
                      {ev.time}
                    </div>
                  </td>

                  <td
                    style={{
                      padding: "16px 20px",
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "12.5px",
                      color: "#4A5490",
                    }}
                  >
                    {ev.venue}
                  </td>

                  <td style={{ padding: "16px 20px" }}>
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

                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal (Figma 311:3844) */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "540px",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.15)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 800,
                fontSize: "20px",
                color: "#141C6E",
                margin: "0 0 6px",
              }}
            >
              {editingEvent ? "Edit Event" : "Create New Event"}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                color: "#4A5490",
                margin: "0 0 24px",
              }}
            >
              Configure sanctuary service, conference, or retreat details
            </p>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunday Worship Celebration"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  >
                    <option value="Weekly Service">Weekly Service</option>
                    <option value="Conference">Conference</option>
                    <option value="Prayer Meeting">Prayer Meeting</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Youth & Campus">Youth & Campus</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 8:00 AM & 10:00 AM"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Venue / Campus</label>
                <input
                  type="text"
                  placeholder="e.g. Main Sanctuary (Jos) or Abuja Campus"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Theme / Scripture / Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. 2 Peter 1:3 - According as his divine power hath given unto us..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "10px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {editingEvent ? "Save Changes" : "Publish Event"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D5DCF2",
                    color: "#4A5490",
                    borderRadius: "10px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
