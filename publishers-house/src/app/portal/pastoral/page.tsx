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

// ─── Types ─────────────────────────────────────────────────────────────────────

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

interface NewVisitorForm {
  name: string;
  phone: string;
  firstVisitDate: string;
  assignedTo: string;
  notes: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_ORDER: VisitorStatus[] = ["new", "followup", "established"];

const COLUMNS: {
  key: VisitorStatus;
  label: string;
  accent: string;
  bg: string;
  emptyMessage: string;
  icon: string;
}[] = [
  {
    key: "new",
    label: "New Visitors",
    accent: "#2090FF",
    bg: "rgba(32,144,255,0.08)",
    emptyMessage: "The gates are open — new faces will come.",
    icon: "🌿",
  },
  {
    key: "followup",
    label: "In Follow-up",
    accent: "#D97706",
    bg: "rgba(217,119,6,0.08)",
    emptyMessage: "All souls have been attended to. Well done!",
    icon: "✉️",
  },
  {
    key: "established",
    label: "Established",
    accent: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    emptyMessage: "Keep walking with the flock faithfully.",
    icon: "🏡",
  },
];

const EMPTY_FORM: NewVisitorForm = {
  name: "",
  phone: "",
  firstVisitDate: "",
  assignedTo: "",
  notes: "",
};

// ─── Visitor Card ──────────────────────────────────────────────────────────────

function VisitorCard({
  visitor,
  columnAccent,
  isLast,
  onMove,
  onViewNotes,
}: {
  visitor: Visitor;
  columnAccent: string;
  isLast: boolean;
  onMove: (id: string) => void;
  onViewNotes: (v: Visitor) => void;
}) {
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso ?? "—";
    }
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "border-color 0.2s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          columnAccent + "50";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Name & phone */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 600, color: "#F8FAFC", fontSize: 14 }}>
            {visitor.name}
          </div>
          <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 2 }}>
            {visitor.phone}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ color: "#4B5563", fontSize: 11 }}>
          <span style={{ color: "#94A3B8" }}>First visit: </span>
          {formatDate(visitor.firstVisitDate)}
        </div>
        {visitor.assignedTo && (
          <div style={{ color: "#4B5563", fontSize: 11 }}>
            <span style={{ color: "#94A3B8" }}>Assigned to: </span>
            {visitor.assignedTo}
          </div>
        )}
      </div>

      {/* Notes preview */}
      {visitor.notes && (
        <p
          style={{
            color: "#4B5563",
            fontSize: 12,
            margin: 0,
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          {visitor.notes.length > 80
            ? visitor.notes.slice(0, 80) + "…"
            : visitor.notes}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <button
          onClick={() => onViewNotes(visitor)}
          style={{
            flex: 1,
            padding: "6px",
            borderRadius: 7,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            color: "#94A3B8",
            fontFamily: "'Poppins', sans-serif",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLButtonElement).style.color = "#F8FAFC";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8";
          }}
        >
          📄 View Notes
        </button>

        {!isLast && (
          <button
            onClick={() => onMove(visitor.id)}
            style={{
              flex: 1,
              padding: "6px",
              borderRadius: 7,
              border: `1px solid ${columnAccent}50`,
              background: `${columnAccent}15`,
              color: columnAccent,
              fontFamily: "'Poppins', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "filter 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.filter =
                "brightness(1.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.filter = "none";
            }}
          >
            Move →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function PastoralPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingNotes, setViewingNotes] = useState<Visitor | null>(null);
  const [form, setForm] = useState<NewVisitorForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "pastoral_notes"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data: Visitor[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Visitor, "id">),
      }));
      setVisitors(data);
    } catch (err) {
      console.error("Failed to fetch pastoral notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // ── Add visitor ───────────────────────────────────────────────────────────────

  const handleAddVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        status: "new" as VisitorStatus,
        createdAt: new Date().toISOString(),
      };
      const ref = await addDoc(collection(db, "pastoral_notes"), payload);
      setVisitors((prev) => [{ id: ref.id, ...payload }, ...prev]);
      setForm(EMPTY_FORM);
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add visitor:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Move visitor to next column ────────────────────────────────────────────────

  const handleMove = async (visitorId: string) => {
    const visitor = visitors.find((v) => v.id === visitorId);
    if (!visitor) return;
    const currentIdx = STATUS_ORDER.indexOf(visitor.status);
    if (currentIdx === STATUS_ORDER.length - 1) return;
    const nextStatus = STATUS_ORDER[currentIdx + 1];
    setMovingId(visitorId);
    try {
      await updateDoc(doc(db, "pastoral_notes", visitorId), {
        status: nextStatus,
      });
      setVisitors((prev) =>
        prev.map((v) =>
          v.id === visitorId ? { ...v, status: nextStatus } : v
        )
      );
    } catch (err) {
      console.error("Failed to move visitor:", err);
    } finally {
      setMovingId(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0E14",
        padding: "32px 24px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        input:focus, textarea:focus { border-color: rgba(217,119,6,0.5) !important; outline: none; }
        select:focus { border-color: rgba(217,119,6,0.5) !important; outline: none; }
        .modal-backdrop { animation: fadeIn 0.15s ease; }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#F8FAFC",
              margin: 0,
            }}
          >
            Pastoral Care
          </h1>
          <p style={{ color: "#94A3B8", marginTop: 6, fontSize: 14, margin: "6px 0 0" }}>
            Track and shepherd visitors through their journey
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            background: "#D97706",
            color: "#fff",
            fontFamily: "'Poppins', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "filter 0.15s",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.filter =
              "brightness(1.15)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.filter = "none")
          }
        >
          + Add Visitor
        </button>
      </div>

      {/* Kanban columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        {COLUMNS.map((col, colIdx) => {
          const colVisitors = visitors.filter((v) => v.status === col.key);
          const isLastCol = colIdx === COLUMNS.length - 1;

          return (
            <div key={col.key}>
              {/* Column header */}
              <div
                style={{
                  background: col.bg,
                  border: `1px solid ${col.accent}30`,
                  borderRadius: "12px 12px 0 0",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{col.icon}</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: col.accent,
                      fontSize: 14,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {col.label}
                  </span>
                </div>
                <span
                  style={{
                    background: `${col.accent}20`,
                    color: col.accent,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "2px 10px",
                    borderRadius: 20,
                  }}
                >
                  {loading ? "…" : colVisitors.length}
                </span>
              </div>

              {/* Cards area */}
              <div
                style={{
                  background: "rgba(255,255,255,0.015)",
                  border: `1px solid ${col.accent}20`,
                  borderTop: "none",
                  borderRadius: "0 0 12px 12px",
                  padding: 12,
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: 100,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.04)",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                  ))
                ) : colVisitors.length === 0 ? (
                  <div
                    style={{
                      padding: "32px 12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 28, opacity: 0.4 }}>{col.icon}</span>
                    <p
                      style={{
                        color: "#4B5563",
                        fontSize: 13,
                        fontStyle: "italic",
                        textAlign: "center",
                        margin: 0,
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {col.emptyMessage}
                    </p>
                  </div>
                ) : (
                  colVisitors.map((visitor) => (
                    <VisitorCard
                      key={visitor.id}
                      visitor={visitor}
                      columnAccent={col.accent}
                      isLast={isLastCol}
                      onMove={handleMove}
                      onViewNotes={setViewingNotes}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add Visitor Modal ────────────────────────────────────────────────── */}
      {showAddModal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
              setForm(EMPTY_FORM);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
          }}
        >
          <div
            style={{
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              width: "100%",
              maxWidth: 480,
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#F8FAFC",
                  margin: 0,
                }}
              >
                Add New Visitor
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setForm(EMPTY_FORM); }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent",
                  color: "#94A3B8",
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVisitor} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(
                [
                  { label: "Full Name *", key: "name", type: "text", placeholder: "e.g. Grace Adeyemi" },
                  { label: "Phone Number *", key: "phone", type: "tel", placeholder: "e.g. 08012345678" },
                  { label: "First Visit Date *", key: "firstVisitDate", type: "date", placeholder: "" },
                  { label: "Assigned Pastor / Worker", key: "assignedTo", type: "text", placeholder: "e.g. Pastor James" },
                ] as { label: string; key: keyof NewVisitorForm; type: string; placeholder: string }[]
              ).map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label
                    style={{
                      display: "block",
                      color: "#94A3B8",
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    required={key === "name" || key === "phone"}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#F8FAFC",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 13,
                      boxSizing: "border-box",
                      transition: "border-color 0.15s",
                      colorScheme: "dark",
                    }}
                  />
                </div>
              ))}

              <div>
                <label
                  style={{
                    display: "block",
                    color: "#94A3B8",
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Initial Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Any observations, prayer points, or context…"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#F8FAFC",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 13,
                    resize: "vertical",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "11px",
                  borderRadius: 10,
                  border: "none",
                  background: submitting ? "rgba(217,119,6,0.5)" : "#D97706",
                  color: "#fff",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "filter 0.15s",
                  marginTop: 4,
                }}
              >
                {submitting ? "Adding…" : "Add to New Visitors"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── View Notes Modal ─────────────────────────────────────────────────── */}
      {viewingNotes && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingNotes(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div
            style={{
              background: "rgba(17,24,39,0.9)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 520,
              padding: "28px",
            }}
          >
            {/* Visitor name + status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#F8FAFC",
                    margin: 0,
                  }}
                >
                  {viewingNotes.name}
                </h2>
                <p style={{ color: "#94A3B8", fontSize: 13, margin: "4px 0 0" }}>
                  {viewingNotes.phone}
                </p>
              </div>
              <button
                onClick={() => setViewingNotes(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent",
                  color: "#94A3B8",
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Info grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 20,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: 16,
              }}
            >
              {[
                { label: "First Visit", value: viewingNotes.firstVisitDate ? new Date(viewingNotes.firstVisitDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                {
                  label: "Status",
                  value:
                    viewingNotes.status === "new"
                      ? "🌿 New Visitor"
                      : viewingNotes.status === "followup"
                      ? "✉️ In Follow-up"
                      : "🏡 Established",
                },
                { label: "Assigned To", value: viewingNotes.assignedTo || "Unassigned" },
                { label: "Record Created", value: viewingNotes.createdAt ? new Date(viewingNotes.createdAt).toLocaleDateString("en-NG") : "—" },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ color: "#4B5563", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ color: "#F8FAFC", fontSize: 13, fontWeight: 500 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <div style={{ color: "#4B5563", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Pastoral Notes
              </div>
              {viewingNotes.notes ? (
                <p
                  style={{
                    color: "#94A3B8",
                    fontSize: 14,
                    lineHeight: 1.7,
                    margin: 0,
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  &ldquo;{viewingNotes.notes}&rdquo;
                </p>
              ) : (
                <p
                  style={{
                    color: "#4B5563",
                    fontSize: 13,
                    fontStyle: "italic",
                    fontFamily: "'Playfair Display', serif",
                    margin: 0,
                  }}
                >
                  No notes recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
