"use client";

import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemStatus = "pending" | "approved" | "rejected" | "prayed";

interface TestimonyItem {
  id: string;
  type: "testimony" | "prayer";
  name: string;
  email?: string;
  content: string;
  status: ItemStatus;
  submittedAt: string;
}

type FilterValue = "all" | "pending" | "approved" | "rejected";
type Tab = "testimonies" | "prayers";

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ItemStatus, { bg: string; color: string; label: string }> = {
  pending:  { bg: "rgba(245,158,11,0.15)",  color: "#F59E0B", label: "Pending" },
  approved: { bg: "rgba(16,185,129,0.15)",  color: "#10B981", label: "Approved" },
  rejected: { bg: "rgba(239,68,68,0.15)",   color: "#EF4444", label: "Rejected" },
  prayed:   { bg: "rgba(32,144,255,0.15)",  color: "#2090FF", label: "Prayed Over" },
};

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All",      value: "all" },
  { label: "Pending",  value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: 140, height: 16, borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ width: 72, height: 22, borderRadius: 20, background: "rgba(255,255,255,0.06)" }} />
      </div>
      <div style={{ width: "100%", height: 14, borderRadius: 6, background: "rgba(255,255,255,0.04)" }} />
      <div style={{ width: "80%", height: 14, borderRadius: 6, background: "rgba(255,255,255,0.04)" }} />
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <div style={{ width: 80, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ width: 80, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)" }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TestimoniesPage() {
  const [tab, setTab] = useState<Tab>("testimonies");
  const [items, setItems] = useState<TestimonyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const colName = tab === "testimonies" ? "testimonies" : "prayers";
      const q = query(collection(db, colName), orderBy("submittedAt", "desc"));
      const snap = await getDocs(q);
      const data: TestimonyItem[] = snap.docs.map((d) => ({
        id: d.id,
        type: tab === "testimonies" ? "testimony" : "prayer",
        ...(d.data() as Omit<TestimonyItem, "id" | "type">),
      }));
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    setFilter("all");
    fetchItems();
  }, [fetchItems]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const updateStatus = async (id: string, status: ItemStatus) => {
    setUpdating(id);
    try {
      const colName = tab === "testimonies" ? "testimonies" : "prayers";
      await updateDoc(doc(db, colName, id), { status });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(null);
    }
  };

  // ── Filtering ──────────────────────────────────────────────────────────────

  const displayed = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "approved" && tab === "prayers") {
      return item.status === "approved" || item.status === "prayed";
    }
    return item.status === filter;
  });

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

  // ─── Render ───────────────────────────────────────────────────────────────

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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .action-btn:hover { filter: brightness(1.2); transform: translateY(-1px); }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
        .filter-pill:hover { background: rgba(255,255,255,0.08) !important; }
        .tab-btn:hover { color: #F8FAFC !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#F8FAFC",
            margin: 0,
          }}
        >
          Testimonies &amp; Prayer Requests
        </h1>
        <p style={{ color: "#94A3B8", marginTop: 6, fontSize: 14 }}>
          Review and moderate submissions from the congregation
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: 4,
          width: "fit-content",
          marginBottom: 24,
        }}
      >
        {(["testimonies", "prayers"] as Tab[]).map((t) => (
          <button
            key={t}
            className="tab-btn"
            onClick={() => setTab(t)}
            style={{
              padding: "8px 24px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Poppins', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              transition: "all 0.2s ease",
              background: tab === t ? "#D97706" : "transparent",
              color: tab === t ? "#fff" : "#94A3B8",
            }}
          >
            {t === "testimonies" ? "✦ Testimonies" : "🙏 Prayer Requests"}
          </button>
        ))}
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const count =
            f.value === "all"
              ? items.length
              : items.filter((i) => i.status === f.value).length;
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              className="filter-pill"
              onClick={() => setFilter(f.value)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: active
                  ? "1px solid #D97706"
                  : "1px solid rgba(255,255,255,0.08)",
                background: active ? "rgba(217,119,6,0.15)" : "transparent",
                color: active ? "#D97706" : "#94A3B8",
                fontFamily: "'Poppins', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {f.label}
              <span
                style={{
                  background: active ? "rgba(217,119,6,0.3)" : "rgba(255,255,255,0.08)",
                  color: active ? "#D97706" : "#94A3B8",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 10,
                  padding: "1px 7px",
                  minWidth: 22,
                  textAlign: "center",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 48 }}>
            {tab === "testimonies" ? "✦" : "🙏"}
          </span>
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              color: "#94A3B8",
              fontStyle: "italic",
              textAlign: "center",
              margin: 0,
            }}
          >
            {tab === "testimonies"
              ? "No testimonies found — the harvest is coming."
              : "No prayer requests at this time. The church is at peace."}
          </p>
          <p style={{ color: "#4B5563", fontSize: 13, margin: 0 }}>
            {filter !== "all" ? `Try switching to "All" to see all items.` : ""}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {displayed.map((item) => {
            const st = STATUS_STYLES[item.status] ?? STATUS_STYLES.pending;
            const isUpdating = updating === item.id;
            const truncated =
              item.content.length > 120
                ? item.content.slice(0, 120) + "…"
                : item.content;

            return (
              <div
                key={item.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "20px 24px",
                  transition: "border-color 0.2s",
                }}
              >
                {/* Top row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#F8FAFC",
                        fontSize: 15,
                      }}
                    >
                      {item.name || "Anonymous"}
                    </span>
                    {item.email && (
                      <span
                        style={{
                          color: "#4B5563",
                          fontSize: 12,
                          marginLeft: 8,
                        }}
                      >
                        {item.email}
                      </span>
                    )}
                    <div
                      style={{
                        color: "#4B5563",
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {formatDate(item.submittedAt)}
                    </div>
                  </div>

                  {/* Status pill */}
                  <span
                    style={{
                      background: st.bg,
                      color: st.color,
                      border: `1px solid ${st.color}40`,
                      borderRadius: 20,
                      padding: "3px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {st.label}
                  </span>
                </div>

                {/* Content preview */}
                <p
                  style={{
                    color: "#94A3B8",
                    fontSize: 14,
                    lineHeight: 1.6,
                    margin: "0 0 16px",
                  }}
                >
                  {truncated}
                </p>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="action-btn"
                    disabled={isUpdating || item.status === "approved"}
                    onClick={() => updateStatus(item.id, "approved")}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 8,
                      border: "1px solid rgba(16,185,129,0.4)",
                      background: "rgba(16,185,129,0.12)",
                      color: "#10B981",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {isUpdating ? "…" : "✓ Approve"}
                  </button>

                  {tab === "prayers" && (
                    <button
                      className="action-btn"
                      disabled={isUpdating || item.status === "prayed"}
                      onClick={() => updateStatus(item.id, "prayed")}
                      style={{
                        padding: "7px 16px",
                        borderRadius: 8,
                        border: "1px solid rgba(32,144,255,0.4)",
                        background: "rgba(32,144,255,0.12)",
                        color: "#2090FF",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      🙏 Pray Over
                    </button>
                  )}

                  <button
                    className="action-btn"
                    disabled={isUpdating || item.status === "rejected"}
                    onClick={() => updateStatus(item.id, "rejected")}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 8,
                      border: "1px solid rgba(239,68,68,0.4)",
                      background: "rgba(239,68,68,0.12)",
                      color: "#EF4444",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
