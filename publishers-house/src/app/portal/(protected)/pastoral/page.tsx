"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

type VisitorStatus = "new" | "followup" | "established";

interface Visitor {
  id: string;
  name: string;
  phone: string;
  firstVisitDate: string;
  assignedTo: string;
  notes: string;
  status: VisitorStatus;
  createdAt: string;
}

const SEED_VISITORS: Visitor[] = [
  {
    id: "vis-1",
    name: "Tobiloba Alabi",
    phone: "+234 803 555 1212",
    firstVisitDate: "2026-10-11",
    assignedTo: "Pastor Damilare",
    notes: "Attended Sunday 1st service. Just moved to Jos from Abuja. Interested in joining the Media Unit.",
    status: "new",
    createdAt: "2026-10-11T10:00:00.000Z",
  },
  {
    id: "vis-2",
    name: "Keturah Danjuma",
    phone: "+234 812 777 8901",
    firstVisitDate: "2026-10-11",
    assignedTo: "Sister Ibidun",
    notes: "Invited by friend from UniJos. Needs prayer for final year exams.",
    status: "new",
    createdAt: "2026-10-11T12:30:00.000Z",
  },
  {
    id: "vis-3",
    name: "Kelechi Okafor",
    phone: "+234 809 333 4455",
    firstVisitDate: "2026-10-04",
    assignedTo: "Brother Ayomide",
    notes: "Called on Tuesday. Came to Midweek Faith clinic. Preparing to enroll in Foundation Discipleship Class.",
    status: "followup",
    createdAt: "2026-10-04T11:00:00.000Z",
  },
  {
    id: "vis-4",
    name: "Faith Adebayo",
    phone: "+234 705 111 2233",
    firstVisitDate: "2026-09-20",
    assignedTo: "Pastor Joshua",
    notes: "Completed Foundation Class. Now an active member of the Worship team.",
    status: "established",
    createdAt: "2026-09-20T09:00:00.000Z",
  },
];

const COLUMNS: {
  key: VisitorStatus;
  label: string;
  badgeBg: string;
  badgeColor: string;
  desc: string;
}[] = [
  {
    key: "new",
    label: "First-Time Visitors",
    badgeBg: "#FFF2D6",
    badgeColor: "#7A5200",
    desc: "Awaiting initial welcome call and hospitality connection",
  },
  {
    key: "followup",
    label: "In Shepherding Follow-Up",
    badgeBg: "#E8EDFB",
    badgeColor: "#1F46C8",
    desc: "Contacted, praying together, and invited to discipleship",
  },
  {
    key: "established",
    label: "Established & Integrated",
    badgeBg: "#E4F5EA",
    badgeColor: "#0F6B38",
    desc: "Committed members, rostered in church units or cell groups",
  },
];

export default function PastoralCarePage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [notesEdit, setNotesEdit] = useState("");
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    firstVisitDate: new Date().toISOString().split("T")[0],
    assignedTo: "Pastoral Team",
    notes: "",
  });

  const fetchVisitors = async () => {
    try {
      const res = await fetch("/api/portal/visitors");
      if (res.ok) {
        const data = await res.json();
        if (data.visitors && data.visitors.length > 0) {
          setVisitors(data.visitors);
          return;
        }
      }
      setVisitors(SEED_VISITORS);
    } catch {
      setVisitors(SEED_VISITORS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleAdvance = async (visitor: Visitor) => {
    const nextStatus: VisitorStatus =
      visitor.status === "new" ? "followup" : "established";

    try {
      await fetch("/api/portal/visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: visitor.id, status: nextStatus }),
      });
    } catch {}

    setVisitors((prev) =>
      prev.map((v) => (v.id === visitor.id ? { ...v, status: nextStatus } : v))
    );
    setMsg(`${visitor.name} moved to ${nextStatus === "followup" ? "In Follow-up" : "Established"} ✓`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleSaveNotes = async () => {
    if (!selectedVisitor) return;
    try {
      await fetch("/api/portal/visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedVisitor.id, notes: notesEdit }),
      });
    } catch {}
    setVisitors((prev) =>
      prev.map((v) => (v.id === selectedVisitor.id ? { ...v, notes: notesEdit } : v))
    );
    setSelectedVisitor(null);
    setMsg("Shepherding notes updated ✓");
    setTimeout(() => setMsg(""), 3000);
  };

  const handleAddVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    try {
      const res = await fetch("/api/portal/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.visitor) {
        setVisitors((prev) => [data.visitor, ...prev]);
      } else {
        const fallbackId = `vis-${Date.now()}`;
        const newVisitor: Visitor = {
          id: fallbackId,
          name: form.name,
          phone: form.phone,
          firstVisitDate: form.firstVisitDate,
          assignedTo: form.assignedTo || "Pastoral Team",
          notes: form.notes,
          status: "new",
          createdAt: new Date().toISOString(),
        };
        setVisitors((prev) => [newVisitor, ...prev]);
      }
    } catch {
      const fallbackId = `vis-${Date.now()}`;
      const newVisitor: Visitor = {
        id: fallbackId,
        name: form.name,
        phone: form.phone,
        firstVisitDate: form.firstVisitDate,
        assignedTo: form.assignedTo || "Pastoral Team",
        notes: form.notes,
        status: "new",
        createdAt: new Date().toISOString(),
      };
      setVisitors((prev) => [newVisitor, ...prev]);
    }

    setShowAddModal(false);
    setForm({
      name: "",
      phone: "",
      firstVisitDate: new Date().toISOString().split("T")[0],
      assignedTo: "Pastoral Team",
      notes: "",
    });
    setMsg("First-time visitor registered ✓");
    setTimeout(() => setMsg(""), 3500);
  };

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
            Pastoral Care & Shepherding
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
            Visitor assimilation pipeline · First-timers to integrated kingdom disciples
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
            onClick={() => setShowAddModal(true)}
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
            }}
          >
            + Add First-Time Visitor
          </button>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {COLUMNS.map((col) => {
          const colVisitors = visitors.filter((v) => v.status === col.key);
          return (
            <div
              key={col.key}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D5DCF2",
                borderRadius: "14px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                minHeight: "560px",
              }}
            >
              {/* Column Header */}
              <div style={{ borderBottom: "1px solid #E8EDFB", paddingBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#141C6E",
                      margin: 0,
                    }}
                  >
                    {col.label}
                  </h2>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "99px",
                      backgroundColor: col.badgeBg,
                      color: col.badgeColor,
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    {colVisitors.length}
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490", margin: "4px 0 0" }}>
                  {col.desc}
                </p>
              </div>

              {/* Cards List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                {loading && (
                  <div style={{ padding: "30px", textAlign: "center", color: "#747CA1", fontSize: "12px" }}>
                    Loading pastoral records...
                  </div>
                )}
                {!loading && colVisitors.length === 0 && (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: "#747CA1", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12.5px" }}>
                    No contacts currently in this stage.
                  </div>
                )}
                {colVisitors.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      backgroundColor: "#F8FAFD",
                      border: "1px solid #E8EDFB",
                      borderRadius: "10px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      boxShadow: "0 1px 2px rgba(14, 21, 86, 0.04)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#141C6E",
                          }}
                        >
                          {v.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "11.5px",
                            color: "#4A5490",
                            marginTop: "2px",
                          }}
                        >
                          Vis: {v.firstVisitDate}
                        </div>
                      </div>

                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#E8EDFB",
                          color: "#1F46C8",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "10px",
                          fontWeight: 700,
                        }}
                      >
                        {v.assignedTo}
                      </span>
                    </div>

                    {/* Phone & Direct Links */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <a
                        href={`tel:${v.phone}`}
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#1F46C8",
                          textDecoration: "none",
                        }}
                      >
                        📞 {v.phone}
                      </a>
                      <a
                        href={`https://wa.me/${v.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#0F6B38",
                          textDecoration: "none",
                        }}
                      >
                        💬 WhatsApp
                      </a>
                    </div>

                    {/* Notes Snippet */}
                    {v.notes && (
                      <div
                        onClick={() => {
                          setSelectedVisitor(v);
                          setNotesEdit(v.notes);
                        }}
                        title="Click to edit notes"
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11.5px",
                          color: "#4A5490",
                          backgroundColor: "#FFFFFF",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E8EDFB",
                          cursor: "pointer",
                          lineHeight: "16px",
                        }}
                      >
                        &ldquo;{v.notes}&rdquo;
                      </div>
                    )}

                    {/* Card Actions */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <button
                        onClick={() => {
                          setSelectedVisitor(v);
                          setNotesEdit(v.notes);
                        }}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #D5DCF2",
                          borderRadius: "6px",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#141C6E",
                          cursor: "pointer",
                        }}
                      >
                        Notes
                      </button>

                      {col.key !== "established" && (
                        <button
                          onClick={() => handleAdvance(v)}
                          style={{
                            flex: 1.2,
                            padding: "6px 10px",
                            backgroundColor: col.key === "new" ? "#1F46C8" : "#0F6B38",
                            border: "none",
                            borderRadius: "6px",
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#FFFFFF",
                            cursor: "pointer",
                          }}
                        >
                          {col.key === "new" ? "To Follow-Up →" : "Establish ✓"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes Modal */}
      {selectedVisitor && (
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
              maxWidth: "480px",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.15)",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "18px", color: "#141C6E", margin: "0 0 6px" }}>
              Shepherding Notes for {selectedVisitor.name}
            </h2>
            <p style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#4A5490", margin: "0 0 20px" }}>
              Update prayer points, call outcomes, or ministry unit interests
            </p>

            <textarea
              rows={5}
              value={notesEdit}
              onChange={(e) => setNotesEdit(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none", resize: "vertical" }}
            />

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                onClick={handleSaveNotes}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 600,
                  fontSize: "12.5px",
                  cursor: "pointer",
                }}
              >
                Save Notes
              </button>
              <button
                onClick={() => setSelectedVisitor(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D5DCF2",
                  color: "#4A5490",
                  borderRadius: "8px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 600,
                  fontSize: "12.5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Visitor Modal */}
      {showAddModal && (
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
              maxWidth: "500px",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.15)",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "20px", color: "#141C6E", margin: "0 0 6px" }}>
              Register First-Time Visitor
            </h2>
            <p style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#4A5490", margin: "0 0 24px" }}>
              Capture guest slip info from Sunday or Midweek service
            </p>

            <form onSubmit={handleAddVisitor} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tobiloba Alabi"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>First Visit Date</label>
                  <input
                    type="date"
                    required
                    value={form.firstVisitDate}
                    onChange={(e) => setForm({ ...form, firstVisitDate: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Assigned Pastor / Follow-Up Minister</label>
                <input
                  type="text"
                  placeholder="e.g. Pastor Damilare, Sister Ibidun"
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Initial Notes / How they heard about TPH</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Invited by neighbour; interested in Choir; requested prayer for relocation."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                  Save Visitor
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
