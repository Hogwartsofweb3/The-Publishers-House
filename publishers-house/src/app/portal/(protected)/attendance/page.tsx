"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";

interface AttendanceRecord {
  id: string;
  fullName: string;
  phone: string;
  mode?: "in_person" | "online";
  location?: string;
  streamChannel?: string;
  serviceCode?: string;
  isGuest?: boolean;
  userId?: string;
  checkedInBy?: string;
  date: string;
  timestamp?: any;
  type?: string;
}

interface HeadcountRecord {
  id?: string;
  date: string;
  men: number;
  women: number;
  children: number;
  total: number;
  notes?: string;
  loggedBy?: string;
  updatedAt?: any;
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "#F8FAFC",
  fontFamily: "'Poppins', sans-serif",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block",
  fontFamily: "'Poppins', sans-serif",
  fontSize: "10px",
  fontWeight: 600 as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "#94A3B8",
  marginBottom: "6px",
};

export default function AttendanceAdminPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");

  // Stream Code Management
  const [streamCode, setStreamCode] = useState("");
  const [streamCodeActive, setStreamCodeActive] = useState(false);
  const [streamCodeLoading, setStreamCodeLoading] = useState(false);
  const [streamCodeMsg, setStreamCodeMsg] = useState("");

  // Usher Headcount Form
  const [headcount, setHeadcount] = useState<HeadcountRecord>({
    date: new Date().toISOString().split("T")[0],
    men: 0,
    women: 0,
    children: 0,
    total: 0,
    notes: "",
  });
  const [headcountLoading, setHeadcountLoading] = useState(false);
  const [headcountMsg, setHeadcountMsg] = useState("");

  // 1. Fetch Stream Code Settings
  const fetchStreamSettings = async () => {
    try {
      const snap = await getDoc(doc(db, "homeSettings", "attendance"));
      if (snap.exists()) {
        const data = snap.data();
        setStreamCode(data.streamCode || "");
        setStreamCodeActive(Boolean(data.streamCodeActive));
      }
    } catch (err) {
      console.error("Error fetching stream settings:", err);
    }
  };

  // 2. Fetch Attendance Records & Headcount for Selected Date
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // Query digital attendance
      const q = query(
        collection(db, "attendance"),
        where("date", "==", selectedDate)
      );
      const snap = await getDocs(q);
      const items: AttendanceRecord[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AttendanceRecord, "id">),
      }));

      // Sort by timestamp desc in JS
      items.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });

      setRecords(items);
      setFilteredRecords(items);

      // Query manual headcount for this date
      const hcSnap = await getDoc(doc(db, "attendance_headcounts", selectedDate));
      if (hcSnap.exists()) {
        setHeadcount(hcSnap.data() as HeadcountRecord);
      } else {
        setHeadcount({
          date: selectedDate,
          men: 0,
          women: 0,
          children: 0,
          total: 0,
          notes: "",
        });
      }
    } catch (err) {
      console.error("Error fetching attendance records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreamSettings();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  // Search & Filter
  useEffect(() => {
    let list = records;
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.fullName?.toLowerCase().includes(term) ||
          r.phone?.toLowerCase().includes(term) ||
          r.location?.toLowerCase().includes(term) ||
          r.checkedInBy?.toLowerCase().includes(term)
      );
    }
    if (modeFilter !== "all") {
      list = list.filter((r) => r.mode === modeFilter);
    }
    setFilteredRecords(list);
  }, [search, modeFilter, records]);

  // Save Stream Code Setting
  const handleSaveStreamCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStreamCodeLoading(true);
    setStreamCodeMsg("");
    try {
      await setDoc(
        doc(db, "homeSettings", "attendance"),
        {
          streamCode: streamCode.trim().toUpperCase(),
          streamCodeActive,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setStreamCodeMsg("Stream code updated successfully ✓");
      setTimeout(() => setStreamCodeMsg(""), 3500);
    } catch (err: any) {
      setStreamCodeMsg("Failed to save stream code: " + err.message);
    } finally {
      setStreamCodeLoading(false);
    }
  };

  // Save Usher Headcount
  const handleSaveHeadcount = async (e: React.FormEvent) => {
    e.preventDefault();
    setHeadcountLoading(true);
    setHeadcountMsg("");
    try {
      const total =
        Number(headcount.men || 0) +
        Number(headcount.women || 0) +
        Number(headcount.children || 0);

      const toSave = {
        ...headcount,
        date: selectedDate,
        total,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "attendance_headcounts", selectedDate), toSave);
      setHeadcount(toSave);
      setHeadcountMsg("Official headcount saved ✓");
      setTimeout(() => setHeadcountMsg(""), 3500);
    } catch (err: any) {
      setHeadcountMsg("Failed to save headcount: " + err.message);
    } finally {
      setHeadcountLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert("No attendance records to export for this date.");
      return;
    }

    const headers = [
      "Full Name",
      "Phone",
      "Mode",
      "Location / Channel",
      "Member Type",
      "Checked In By",
      "Stream Code Entered",
      "Date",
      "Time",
    ];

    const rows = filteredRecords.map((r) => {
      const timeStr = r.timestamp?.toDate
        ? r.timestamp.toDate().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
        : "";
      return [
        `"${r.fullName || ""}"`,
        `"${r.phone || ""}"`,
        `"${r.mode || "in_person"}"`,
        `"${r.location || r.streamChannel || ""}"`,
        `"${r.userId ? "Member" : "Guest"}"`,
        `"${r.checkedInBy || "Self"}"`,
        `"${r.serviceCode || ""}"`,
        `"${r.date || ""}"`,
        `"${timeStr}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tph_attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute breakdown metrics
  const totalDigital = records.length;
  const inPersonJos = records.filter(
    (r) => r.mode === "in_person" && (r.location?.includes("Jos") || !r.location?.includes("Abuja"))
  ).length;
  const inPersonAbuja = records.filter(
    (r) => r.mode === "in_person" && r.location?.includes("Abuja")
  ).length;
  const onlineCount = records.filter((r) => r.mode === "online").length;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "10px",
              color: "#D97706",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            Admin / Worship Services
          </div>
          <h1
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(24px, 3vw, 32px)",
              color: "#F8FAFC",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Attendance & Headcounts
          </h1>
        </div>

        {/* Date Selector & Export */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#94A3B8", fontFamily: "'Poppins', sans-serif" }}>
              Service Date:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                ...inputStyle,
                width: "auto",
                padding: "8px 12px",
                fontSize: "12px",
              }}
            />
          </div>

          <button
            onClick={fetchAttendance}
            style={{
              padding: "9px 14px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              color: "#F8FAFC",
              fontSize: "12px",
              fontFamily: "'Poppins', sans-serif",
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              padding: "9px 16px",
              background: "linear-gradient(135deg, #0140C1 0%, #2090FF 100%)",
              border: "none",
              borderRadius: "8px",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>↓</span> Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "14px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(32,144,255,0.2)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={labelStyle}>Total Digital Sign-ins</span>
            <span style={{ color: "#2090FF", fontSize: "16px" }}>✦</span>
          </div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "32px", color: "#F8FAFC" }}>
            {loading ? "..." : totalDigital}
          </div>
          <div style={{ fontSize: "11px", color: "#38BDF8", marginTop: "4px" }}>
            Self check-ins recorded
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={labelStyle}>In-Person (Jos)</span>
            <span style={{ color: "#10B981", fontSize: "16px" }}>🏛️</span>
          </div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "32px", color: "#F8FAFC" }}>
            {loading ? "..." : inPersonJos}
          </div>
          <div style={{ fontSize: "11px", color: "#10B981", marginTop: "4px" }}>
            The House of Bread
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(217,119,6,0.2)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={labelStyle}>In-Person (Abuja)</span>
            <span style={{ color: "#D97706", fontSize: "16px" }}>📍</span>
          </div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "32px", color: "#F8FAFC" }}>
            {loading ? "..." : inPersonAbuja}
          </div>
          <div style={{ fontSize: "11px", color: "#F59E0B", marginTop: "4px" }}>
            Abuja Outreach Center
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={labelStyle}>Online Streamers</span>
            <span style={{ color: "#8B5CF6", fontSize: "16px" }}>🌐</span>
          </div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "32px", color: "#F8FAFC" }}>
            {loading ? "..." : onlineCount}
          </div>
          <div style={{ fontSize: "11px", color: "#A78BFA", marginTop: "4px" }}>
            YouTube / Mixlr / Telegram
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={labelStyle}>Usher Clicker Count</span>
            <span style={{ color: "#F8FAFC", fontSize: "16px" }}>🏷️</span>
          </div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "32px", color: "#F8FAFC" }}>
            {headcount.total || "—"}
          </div>
          <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
            Men {headcount.men} · Women {headcount.women} · Kids {headcount.children}
          </div>
        </div>
      </div>

      {/* Control Panels: Stream Code + Official Usher Logger */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          marginBottom: "36px",
        }}
      >
        {/* Stream Code Panel */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            padding: "22px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "15px", fontWeight: 700, color: "#F8FAFC", margin: 0 }}>
                Virtual Stream Check-In Code
              </h3>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "12px", color: "#94A3B8", margin: "4px 0 0" }}>
                Announce during YouTube / Mixlr live stream to verify attendance.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveStreamCode} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Today's Stream Code</label>
              <input
                type="text"
                placeholder="e.g. LIGHT-2026 or 4921"
                value={streamCode}
                onChange={(e) => setStreamCode(e.target.value.toUpperCase())}
                style={{ ...inputStyle, fontWeight: 700, letterSpacing: "0.1em", fontSize: "14px" }}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "12px",
                color: "#F8FAFC",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={streamCodeActive}
                onChange={(e) => setStreamCodeActive(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "#2090FF" }}
              />
              Require this code for Online Attendance Check-In
            </label>

            {streamCodeMsg && (
              <div
                style={{
                  fontSize: "12px",
                  color: streamCodeMsg.includes("✓") ? "#10B981" : "#EF4444",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {streamCodeMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={streamCodeLoading}
              style={{
                padding: "10px 16px",
                background: "rgba(32,144,255,0.15)",
                border: "1px solid rgba(32,144,255,0.3)",
                borderRadius: "8px",
                color: "#38BDF8",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
                cursor: streamCodeLoading ? "not-allowed" : "pointer",
                alignSelf: "flex-start",
              }}
            >
              {streamCodeLoading ? "Saving..." : "Save Stream Code Settings"}
            </button>
          </form>
        </div>

        {/* Usher Official Headcount Logger */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            padding: "22px",
          }}
        >
          <div>
            <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "15px", fontWeight: 700, color: "#F8FAFC", margin: 0 }}>
              Official Usher Headcount Entry
            </h3>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "12px", color: "#94A3B8", margin: "4px 0 0" }}>
              In-house clicker tally for {selectedDate}.
            </p>
          </div>

          <form onSubmit={handleSaveHeadcount} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div>
                <label style={labelStyle}>Men</label>
                <input
                  type="number"
                  min="0"
                  value={headcount.men}
                  onChange={(e) => setHeadcount({ ...headcount, men: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Women</label>
                <input
                  type="number"
                  min="0"
                  value={headcount.women}
                  onChange={(e) => setHeadcount({ ...headcount, women: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Children</label>
                <input
                  type="number"
                  min="0"
                  value={headcount.children}
                  onChange={(e) => setHeadcount({ ...headcount, children: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Service Notes / Ushership Comments</label>
              <input
                type="text"
                placeholder="e.g. 1st service overflow occupied, 15 visitors recorded"
                value={headcount.notes || ""}
                onChange={(e) => setHeadcount({ ...headcount, notes: e.target.value })}
                style={inputStyle}
              />
            </div>

            {headcountMsg && (
              <div
                style={{
                  fontSize: "12px",
                  color: headcountMsg.includes("✓") ? "#10B981" : "#EF4444",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {headcountMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={headcountLoading}
              style={{
                padding: "10px 16px",
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: "8px",
                color: "#10B981",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
                cursor: headcountLoading ? "not-allowed" : "pointer",
                alignSelf: "flex-start",
              }}
            >
              {headcountLoading ? "Saving..." : "Save Official Headcount"}
            </button>
          </form>
        </div>
      </div>

      {/* Roster Table Section */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "24px",
        }}
      >
        {/* Table Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search attendee or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, width: "260px" }}
            />

            <div style={{ display: "flex", gap: "6px" }}>
              {[
                { id: "all", label: "All" },
                { id: "in_person", label: "🏛️ In-Person" },
                { id: "online", label: "🌐 Online" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setModeFilter(tab.id)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: modeFilter === tab.id ? "1px solid #2090FF" : "1px solid rgba(255,255,255,0.08)",
                    background: modeFilter === tab.id ? "rgba(32,144,255,0.18)" : "transparent",
                    color: modeFilter === tab.id ? "#38BDF8" : "#94A3B8",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <span style={{ fontSize: "12px", color: "#94A3B8", fontFamily: "'Poppins', sans-serif" }}>
            Showing {filteredRecords.length} of {records.length} attendees
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "13px",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <th style={{ padding: "12px 14px", color: "#94A3B8", fontWeight: 600, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Attendee</th>
                <th style={{ padding: "12px 14px", color: "#94A3B8", fontWeight: 600, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Phone</th>
                <th style={{ padding: "12px 14px", color: "#94A3B8", fontWeight: 600, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Mode & Location</th>
                <th style={{ padding: "12px 14px", color: "#94A3B8", fontWeight: 600, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Profile</th>
                <th style={{ padding: "12px 14px", color: "#94A3B8", fontWeight: 600, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
                    {loading ? "Loading attendance..." : "No attendance recorded for this date yet."}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const timeStr = r.timestamp?.toDate
                    ? r.timestamp.toDate().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
                    : "—";

                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.15s",
                      }}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, color: "#F8FAFC" }}>{r.fullName}</div>
                        {r.checkedInBy && (
                          <div style={{ fontSize: "10px", color: "#38BDF8", marginTop: "2px" }}>
                            ↳ Guest of {r.checkedInBy}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#94A3B8" }}>{r.phone}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: r.mode === "online" ? "rgba(139,92,246,0.15)" : "rgba(16,185,129,0.15)",
                            color: r.mode === "online" ? "#A78BFA" : "#10B981",
                            marginRight: "6px",
                          }}
                        >
                          {r.mode === "online" ? "Online" : "In-Person"}
                        </span>
                        <span style={{ fontSize: "12px", color: "#CBD5E1" }}>
                          {r.location || (r.streamChannel ? `Via ${r.streamChannel}` : "Jos Center")}
                        </span>
                        {r.serviceCode && (
                          <span style={{ fontSize: "10px", color: "#D97706", marginLeft: "6px" }}>
                            (Code: {r.serviceCode})
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            color: r.userId ? "#38BDF8" : "#94A3B8",
                            background: r.userId ? "rgba(56,189,248,0.1)" : "rgba(255,255,255,0.04)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          {r.userId ? "Portal Member" : "Guest Check-in"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", color: "#64748B", fontSize: "12px" }}>
                        {timeStr}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
