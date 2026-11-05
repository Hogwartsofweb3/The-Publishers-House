"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePortal } from "@/lib/portalContext";

interface GivingRecord {
  id: string;
  amountNGN: number;
  category: string;
  method: string;
  status: string;
  timestamp: string;
  reference?: string;
  notes?: string;
}

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG", { minimumFractionDigits: 0 });
}

export default function MemberGivingPage() {
  const { effectiveUser } = usePortal();
  const [records, setRecords] = useState<GivingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/portal/finance");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.transactions)) {
            setRecords(data.transactions);
          }
        }
      } catch (err) {
        console.warn("Could not load giving history:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [effectiveUser]);

  const categories = ["all", ...Array.from(new Set(records.map((r) => r.category).filter(Boolean)))];

  const filtered = filterCategory === "all"
    ? records
    : records.filter((r) => r.category === filterCategory);

  const totalGiven = filtered
    .filter((r) => r.status === "success")
    .reduce((sum, r) => sum + (r.amountNGN || 0), 0);

  const categoryColors: Record<string, { bg: string; color: string }> = {
    Tithe: { bg: "#EEF2FB", color: "#1F46C8" },
    Offering: { bg: "#FEF3C7", color: "#D97706" },
    "Special Projects": { bg: "#F3E8FF", color: "#7C3AED" },
    Thanksgiving: { bg: "#DCFCE7", color: "#166534" },
  };

  const getCatStyle = (cat: string) =>
    categoryColors[cat] || { bg: "#F1F5F9", color: "#475569" };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "10px 0 48px" }}>
      {/* Back */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          href="/portal/member"
          style={{ fontSize: "12px", fontWeight: 600, color: "#1F46C8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          ← Back to My Portal
        </Link>
      </div>

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #065F46 0%, #0F6B38 50%, #047857 100%)",
          borderRadius: "16px",
          padding: "28px 32px",
          marginBottom: "28px",
          color: "#FFFFFF",
        }}
      >
        <div style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: "6px" }}>
          My Giving Record
        </div>
        <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.015em" }}>
          My Giving History
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", margin: "0 0 20px", lineHeight: 1.5 }}>
          A personal record of your tithes, offerings, and kingdom contributions.
        </p>

        {/* Summary */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "10px", padding: "12px 20px" }}>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Total {filterCategory !== "all" ? filterCategory : ""} Given
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#34D399", marginTop: "2px" }}>
              {loading ? "—" : formatNaira(totalGiven)}
            </div>
          </div>
          <div style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "10px", padding: "12px 20px" }}>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Transactions</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#F59E0B", marginTop: "2px" }}>{loading ? "—" : filtered.length}</div>
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: "7px 14px",
              borderRadius: "8px",
              border: "1.5px solid",
              borderColor: filterCategory === cat ? "#0F6B38" : "#D5DCF2",
              backgroundColor: filterCategory === cat ? "#DCFCE7" : "#FFFFFF",
              color: filterCategory === cat ? "#0F6B38" : "#64748B",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {cat === "all" ? "All Categories" : cat}
          </button>
        ))}
      </div>

      {/* Records */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
          Loading your giving history...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: "48px 32px",
            textAlign: "center",
            backgroundColor: "#FFFFFF",
            border: "1px dashed #CBD5E1",
            borderRadius: "14px",
            color: "#64748B",
          }}
        >
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>💚</div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0E1556", marginBottom: "6px" }}>
            {records.length === 0 ? "No giving records found" : "No records in this category"}
          </div>
          <div style={{ fontSize: "13px", lineHeight: 1.5 }}>
            {records.length === 0
              ? "Your tithe, offering, and special giving records will appear here once they are logged by the church."
              : "Try a different category filter."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((rec, idx) => {
            const catStyle = getCatStyle(rec.category);
            const dateStr = rec.timestamp
              ? new Date(rec.timestamp).toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "—";
            const isSuccess = rec.status === "success";

            return (
              <div
                key={rec.id || idx}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E8EDFB",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  boxShadow: "0 1px 4px rgba(14,21,86,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      backgroundColor: catStyle.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0,
                    }}
                  >
                    {rec.category === "Tithe" ? "🙏" : rec.category === "Offering" ? "🫶" : rec.category === "Thanksgiving" ? "🎉" : "💙"}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: catStyle.bg,
                          color: catStyle.color,
                        }}
                      >
                        {rec.category}
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>{rec.method}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "3px" }}>
                      {dateStr}
                      {rec.reference && <span style={{ marginLeft: "8px", fontFamily: "monospace", fontSize: "11px" }}>{rec.reference}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: isSuccess ? "#0F6B38" : "#DC2626",
                    }}
                  >
                    {formatNaira(rec.amountNGN)}
                  </div>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "99px",
                      backgroundColor: isSuccess ? "#DCFCE7" : "#FEE2E2",
                      color: isSuccess ? "#166534" : "#991B1B",
                    }}
                  >
                    {isSuccess ? "✓ Confirmed" : rec.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "#94A3B8" }}>
          Showing {filtered.length} record{filtered.length !== 1 ? "s" : ""} · Total: {formatNaira(totalGiven)}
        </div>
      )}
    </div>
  );
}
