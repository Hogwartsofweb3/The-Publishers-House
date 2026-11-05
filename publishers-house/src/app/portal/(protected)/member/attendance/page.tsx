"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePortal } from "@/lib/portalContext";

interface AttendanceRecord {
  id: string;
  date: string;
  mode: string;
  type: string;
  location?: string;
  serviceCode?: string;
  timestamp: string;
  fullName?: string;
}

export default function MemberAttendancePage() {
  const { effectiveUser } = usePortal();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | "in-person" | "online">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Try fetching via the attendance API (which uses Admin SDK)
        const res = await fetch("/api/portal/attendance?myHistory=true");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.records)) {
            setRecords(data.records);
            setLoading(false);
            return;
          }
        }

        // Fallback: Firestore client SDK
        const { getDocs, query, collection, where, orderBy, limit } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");

        let snap;
        if (effectiveUser?.uid) {
          try {
            snap = await getDocs(
              query(
                collection(db, "attendance"),
                where("userId", "==", effectiveUser.uid),
                orderBy("timestamp", "desc"),
                limit(100)
              )
            );
          } catch {
            // composite index may be missing; try email
          }
        }

        if ((!snap || snap.empty) && effectiveUser?.email) {
          snap = await getDocs(
            query(
              collection(db, "attendance"),
              where("email", "==", effectiveUser.email),
              orderBy("timestamp", "desc"),
              limit(100)
            )
          );
        }

        if (snap && !snap.empty) {
          setRecords(
            snap.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                date: data.date || "",
                mode: data.mode || "in-person",
                type: data.type || "regular",
                location: data.location || data.channel || "",
                serviceCode: data.serviceCode || "",
                timestamp: data.timestamp?.toDate?.()?.toISOString() || data.createdAt || "",
                fullName: data.fullName || "",
              };
            })
          );
        }
      } catch (err) {
        console.warn("Could not load attendance history:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [effectiveUser]);

  const filtered = records.filter((r) => {
    if (filterMode !== "all" && r.mode !== filterMode) return false;
    if (search && !r.date.includes(search) && !(r.serviceCode || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const inPersonCount = records.filter((r) => r.mode !== "online").length;
  const onlineCount = records.filter((r) => r.mode === "online").length;

  const inputStyle: React.CSSProperties = {
    padding: "9px 14px",
    borderRadius: "8px",
    border: "1px solid #D5DCF2",
    fontSize: "13px",
    color: "#0E1556",
    outline: "none",
    backgroundColor: "#FFFFFF",
  };

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
          background: "linear-gradient(135deg, #0E1556 0%, #1F46C8 100%)",
          borderRadius: "16px",
          padding: "28px 32px",
          marginBottom: "28px",
          color: "#FFFFFF",
        }}
      >
        <div style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: "6px" }}>
          My Attendance Record
        </div>
        <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.015em" }}>
          Attendance History
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", margin: "0 0 20px", lineHeight: 1.5 }}>
          Every service you have been recorded present — in-person or online.
        </p>

        {/* Stats pills */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { label: "Total Services", value: records.length, color: "#F59E0B" },
            { label: "In-Person", value: inPersonCount, color: "#34D399" },
            { label: "Online Stream", value: onlineCount, color: "#38BDF8" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "8px",
                padding: "8px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search by date or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, minWidth: "200px", flex: 1 }}
        />
        {(["all", "in-person", "online"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilterMode(mode)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1.5px solid",
              borderColor: filterMode === mode ? "#1F46C8" : "#D5DCF2",
              backgroundColor: filterMode === mode ? "#EEF2FB" : "#FFFFFF",
              color: filterMode === mode ? "#1F46C8" : "#64748B",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {mode === "all" ? "All Modes" : mode === "in-person" ? "🏛️ In-Person" : "🌐 Online"}
          </button>
        ))}
      </div>

      {/* Records */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
          Loading your attendance history...
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
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📋</div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0E1556", marginBottom: "6px" }}>
            {records.length === 0 ? "No attendance records yet" : "No records match your filter"}
          </div>
          <div style={{ fontSize: "13px", lineHeight: 1.5 }}>
            {records.length === 0
              ? "Your attendance will appear here once you sign in during a service."
              : "Try changing your search or filter."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((rec, idx) => {
            const modeEmoji = rec.mode === "online" ? "🌐" : "🏛️";
            const modeLabel = rec.mode === "online" ? "Online Stream" : "In-Person";
            const isFirstTimer = rec.type === "first-timer" || rec.type === "first_timer";
            const displayDate = rec.date
              ? new Date(rec.date + "T00:00:00").toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "—";
            const timeStr = rec.timestamp
              ? new Date(rec.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
              : "";

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
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      backgroundColor: rec.mode === "online" ? "#E0F2FE" : "#EEF2FB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0,
                    }}
                  >
                    {modeEmoji}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "14px", fontWeight: 700, color: "#0E1556" }}>
                      {displayDate}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <span>{modeLabel}</span>
                      {rec.location && <span>• {rec.location}</span>}
                      {timeStr && <span>• {timeStr}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  {isFirstTimer && (
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#D97706", backgroundColor: "#FEF3C7", padding: "3px 8px", borderRadius: "99px" }}>
                      First Visit
                    </span>
                  )}
                  {rec.serviceCode && (
                    <span style={{ fontSize: "10.5px", fontWeight: 600, color: "#475569", backgroundColor: "#F1F5F9", padding: "3px 8px", borderRadius: "6px", fontFamily: "monospace" }}>
                      {rec.serviceCode}
                    </span>
                  )}
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#0F6B38", backgroundColor: "#DCFCE7", padding: "4px 11px", borderRadius: "99px" }}>
                    ✓ Signed
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "#94A3B8" }}>
          Showing {filtered.length} of {records.length} attendance record{records.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
