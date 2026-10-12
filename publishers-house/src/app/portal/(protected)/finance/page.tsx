"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  name: string;
  email: string;
  amountNGN: number;
  category: string;
  method: string;
  status: "pending" | "success" | "failed";
  timestamp: string;
  reference?: string;
}

type StatusKey = "pending" | "success" | "failed";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatNaira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 0 });

const STATUS_STYLE: Record<StatusKey, { bg: string; color: string }> = {
  success: { bg: "rgba(16,185,129,0.15)",  color: "#10B981" },
  pending: { bg: "rgba(245,158,11,0.15)",  color: "#F59E0B" },
  failed:  { bg: "rgba(239,68,68,0.15)",   color: "#EF4444" },
};

const CATEGORIES = ["Tithe", "Offering", "Special Projects", "Thanksgiving"];

const CATEGORY_ICONS: Record<string, string> = {
  "Tithe": "💎",
  "Offering": "🌿",
  "Special Projects": "🚀",
  "Thanksgiving": "🙏",
};

function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function getMonthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "24px 20px",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <div style={{ width: 80, height: 13, borderRadius: 6, background: "rgba(255,255,255,0.06)", marginBottom: 12 }} />
      <div style={{ width: 120, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500 }}>{label}</span>
      <span
        style={{
          color: accent ?? "#F8FAFC",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </span>
      {sub && <span style={{ color: "#4B5563", fontSize: 12 }}>{sub}</span>}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // ── Fetch ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "transactions"),
          orderBy("timestamp", "desc")
        );
        const snap = await getDocs(q);
        const data: Transaction[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Transaction, "id">),
        }));
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // ── Derived stats ─────────────────────────────────────────────────────────────

  const successful = useMemo(
    () => transactions.filter((t) => t.status === "success"),
    [transactions]
  );

  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  const totalAll = useMemo(
    () => successful.reduce((s, t) => s + (t.amountNGN || 0), 0),
    [successful]
  );
  const totalMonth = useMemo(
    () =>
      successful
        .filter((t) => t.timestamp >= monthStart)
        .reduce((s, t) => s + (t.amountNGN || 0), 0),
    [successful, monthStart]
  );
  const totalWeek = useMemo(
    () =>
      successful
        .filter((t) => t.timestamp >= weekStart)
        .reduce((s, t) => s + (t.amountNGN || 0), 0),
    [successful, weekStart]
  );
  const avgTransaction = useMemo(
    () => (successful.length > 0 ? totalAll / successful.length : 0),
    [totalAll, successful]
  );

  const categoryBreakdown = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const items = successful.filter(
        (t) => (t.category ?? "").toLowerCase() === cat.toLowerCase()
      );
      return {
        name: cat,
        total: items.reduce((s, t) => s + (t.amountNGN || 0), 0),
        count: items.length,
      };
    });
  }, [successful]);

  // ── Table filtering ────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        !search ||
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase()) ||
        t.reference?.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        categoryFilter === "All" ||
        (t.category ?? "").toLowerCase() === categoryFilter.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [transactions, search, categoryFilter]);

  // ── CSV export ────────────────────────────────────────────────────────────────

  const handleExportCSV = () => {
    const headers = ["Date", "Name", "Email", "Category", "Amount (NGN)", "Method", "Status", "Reference"];
    const rows = filtered.map((t) => [
      t.timestamp ? new Date(t.timestamp).toLocaleDateString("en-NG") : "",
      t.name,
      t.email,
      t.category,
      t.amountNGN,
      t.method,
      t.status,
      t.reference ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tph-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        .cat-pill:hover { background: rgba(255,255,255,0.08) !important; }
        .export-btn:hover { background: rgba(217,119,6,0.2) !important; }
        .table-row:hover td { background: rgba(255,255,255,0.02); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 28, fontWeight: 700, color: "#F8FAFC", margin: 0 }}>
            Finance Overview
          </h1>
          <p style={{ color: "#94A3B8", marginTop: 6, fontSize: 14 }}>
            Track giving, transactions and category breakdowns
          </p>
        </div>
        <button
          className="export-btn"
          onClick={handleExportCSV}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "1px solid rgba(217,119,6,0.4)",
            background: "rgba(217,119,6,0.1)",
            color: "#D97706",
            fontFamily: "'Poppins',sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ↓ Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {loading ? (
          [1, 2, 3, 4].map((i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard label="Total Giving (All Time)" value={formatNaira(totalAll)} sub={`${successful.length} transactions`} accent="#D97706" />
            <KpiCard label="This Month" value={formatNaira(totalMonth)} accent="#2090FF" />
            <KpiCard label="This Week" value={formatNaira(totalWeek)} accent="#10B981" />
            <KpiCard label="Avg. Transaction" value={formatNaira(Math.round(avgTransaction))} />
          </>
        )}
      </div>

      {/* Category Breakdown */}
      <h2
        style={{
          fontFamily: "'Poppins',sans-serif",
          fontSize: 16,
          fontWeight: 600,
          color: "#F8FAFC",
          marginBottom: 16,
          marginTop: 0,
        }}
      >
        Category Breakdown
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 36,
        }}
      >
        {CATEGORIES.map((cat) => {
          const data = categoryBreakdown.find((c) => c.name === cat) ?? { total: 0, count: 0 };
          return (
            <div
              key={cat}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[cat] ?? "💰"}</span>
                <span style={{ color: "#4B5563", fontSize: 12 }}>{data.count} gifts</span>
              </div>
              <span style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500, marginTop: 4 }}>{cat}</span>
              <span style={{ color: "#F8FAFC", fontSize: 20, fontWeight: 700 }}>
                {loading ? "…" : formatNaira(data.total)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Table Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 16, fontWeight: 600, color: "#F8FAFC", margin: 0 }}>
          All Transactions
          <span style={{ color: "#4B5563", fontSize: 13, fontWeight: 400, marginLeft: 8 }}>
            ({filtered.length})
          </span>
        </h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Category filter pills */}
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              className="cat-pill"
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: "5px 14px",
                borderRadius: 20,
                border: categoryFilter === cat
                  ? "1px solid #D97706"
                  : "1px solid rgba(255,255,255,0.08)",
                background: categoryFilter === cat
                  ? "rgba(217,119,6,0.15)"
                  : "transparent",
                color: categoryFilter === cat ? "#D97706" : "#94A3B8",
                fontFamily: "'Poppins',sans-serif",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {cat}
            </button>
          ))}
          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name / email…"
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "#F8FAFC",
              fontFamily: "'Poppins',sans-serif",
              fontSize: 13,
              outline: "none",
              width: 200,
            }}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Date", "Name", "Email", "Category", "Amount", "Method", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: "#4B5563",
                      fontFamily: "'Poppins',sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            height: 14,
                            borderRadius: 4,
                            background: "rgba(255,255,255,0.05)",
                            width: j === 0 ? 80 : j === 2 ? 130 : 90,
                            animation: "pulse 1.5s ease-in-out infinite",
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "60px 24px",
                      color: "#94A3B8",
                      fontStyle: "italic",
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 16,
                    }}
                  >
                    No transactions found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const st = STATUS_STYLE[t.status as StatusKey] ?? STATUS_STYLE.pending;
                  return (
                    <tr
                      key={t.id}
                      className="table-row"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <td style={{ padding: "14px 16px", color: "#94A3B8", fontSize: 13, whiteSpace: "nowrap" }}>
                        {t.timestamp
                          ? new Date(t.timestamp).toLocaleDateString("en-NG", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#F8FAFC", fontSize: 14, fontWeight: 500, whiteSpace: "nowrap" }}>
                        {t.name || "—"}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#94A3B8", fontSize: 13 }}>
                        {t.email || "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            background: "rgba(217,119,6,0.12)",
                            color: "#D97706",
                            border: "1px solid rgba(217,119,6,0.3)",
                            borderRadius: 20,
                            padding: "3px 10px",
                            fontSize: 12,
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.category || "General"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#10B981", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>
                        {formatNaira(t.amountNGN || 0)}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#94A3B8", fontSize: 13, whiteSpace: "nowrap" }}>
                        {t.method || "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            background: st.bg,
                            color: st.color,
                            borderRadius: 20,
                            padding: "3px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && (
        <p style={{ color: "#4B5563", fontSize: 12, marginTop: 12, textAlign: "right" }}>
          Showing {filtered.length} of {transactions.length} records
        </p>
      )}
    </div>
  );
}
