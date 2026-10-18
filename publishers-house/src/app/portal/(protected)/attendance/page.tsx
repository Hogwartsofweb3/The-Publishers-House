"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
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

  // Move Attendee to Member State
  const [enrollAttendee, setEnrollAttendee] = useState<{ fullName: string; phone: string; email: string } | null>(null);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [createAccountImmediately, setCreateAccountImmediately] = useState(true);

  // Fetch Stream Code Settings
  const fetchStreamSettings = async () => {
    try {
      const res = await fetch("/api/attendance/config");
      const data = await res.json().catch(() => ({}));
      if (data) {
        setStreamCode(data.code || "");
        setStreamCodeActive(Boolean(data.active));
      }
    } catch (err) {
      console.error("Error fetching stream settings:", err);
    }
  };

  // Fetch Attendance Records & Headcount for Selected Date
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "attendance"),
        where("date", "==", selectedDate)
      );
      const snap = await getDocs(q);
      const items: AttendanceRecord[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AttendanceRecord, "id">),
      }));

      items.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });

      setRecords(items);
      setFilteredRecords(items);

      try {
        const hcRes = await fetch(`/api/portal/headcount?date=${selectedDate}`);
        if (hcRes.ok) {
          const hcJson = await hcRes.json();
          if (hcJson.exists && hcJson.data) {
            setHeadcount(hcJson.data as HeadcountRecord);
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
        } else {
          const hcSnap = await getDoc(doc(db, "attendance_headcounts", selectedDate));
          if (hcSnap.exists()) {
            setHeadcount(hcSnap.data() as HeadcountRecord);
          }
        }
      } catch {
        const hcSnap = await getDoc(doc(db, "attendance_headcounts", selectedDate));
        if (hcSnap.exists()) {
          setHeadcount(hcSnap.data() as HeadcountRecord);
        }
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

  const handleSaveStreamCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamCode.trim()) {
      setStreamCodeMsg("Please enter a code to activate (e.g. LIGHT-2026)");
      return;
    }
    setStreamCodeLoading(true);
    setStreamCodeMsg("");
    try {
      const res = await fetch("/api/attendance/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: streamCode.trim().toUpperCase(),
          active: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update stream code.");
      setStreamCode(data.code || streamCode.trim().toUpperCase());
      setStreamCodeActive(true);
      setStreamCodeMsg("Stream code activated successfully ✓");
      setTimeout(() => setStreamCodeMsg(""), 4000);
    } catch (err: any) {
      setStreamCodeMsg("Failed to save stream code: " + err.message);
    } finally {
      setStreamCodeLoading(false);
    }
  };

  const handleDeactivateStreamCode = async () => {
    setStreamCodeLoading(true);
    setStreamCodeMsg("");
    try {
      const res = await fetch("/api/attendance/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "", active: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to deactivate stream code.");
      setStreamCode("");
      setStreamCodeActive(false);
      setStreamCodeMsg("Stream code requirement deactivated ✓");
      setTimeout(() => setStreamCodeMsg(""), 4000);
    } catch (err: any) {
      setStreamCodeMsg("Failed to deactivate: " + err.message);
    } finally {
      setStreamCodeLoading(false);
    }
  };

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

      const res = await fetch("/api/portal/headcount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Server failed to save headcount");
      }

      setHeadcount(toSave);
      setHeadcountMsg("Official usher headcount saved ✓");
      setTimeout(() => setHeadcountMsg(""), 3500);
    } catch (err: any) {
      setHeadcountMsg("Failed to save headcount: " + err.message);
    } finally {
      setHeadcountLoading(false);
    }
  };

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

  const inPersonRecords = records.filter((r) => r.mode === "in_person");
  const onlineRecords = records.filter((r) => r.mode === "online");
  const guestCount = records.filter((r) => r.isGuest || !r.userId).length;

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
            Attendance & Headcounts
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
            In-person usher counts, virtual stream check-in validation, and attendee registry
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "11px",
                fontWeight: 600,
                color: "#4A5490",
                textTransform: "uppercase",
              }}
            >
              Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #D5DCF2",
                backgroundColor: "#FFFFFF",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "13px",
                color: "#141C6E",
                outline: "none",
              }}
            />
          </div>

          <button
            onClick={handleExportCSV}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "10px",
              padding: "10px 16px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "13px",
              color: "#141C6E",
              cursor: "pointer",
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "12px",
            padding: "18px 20px",
          }}
        >
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Usher Headcount</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "30px", fontWeight: 800, color: "#141C6E", marginTop: "4px" }}>
            {headcount.total || (Number(headcount.men) + Number(headcount.women) + Number(headcount.children)) || "—"}
          </div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#0F6B38", marginTop: "2px" }}>
            {headcount.men} Men · {headcount.women} Women · {headcount.children} Kids
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "12px",
            padding: "18px 20px",
          }}
        >
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Digital Check-Ins</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "30px", fontWeight: 800, color: "#1F46C8", marginTop: "4px" }}>
            {records.length}
          </div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#1F46C8", marginTop: "2px" }}>
            Verified check-in submissions
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "12px",
            padding: "18px 20px",
          }}
        >
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Physical In-Person</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "30px", fontWeight: 800, color: "#141C6E", marginTop: "4px" }}>
            {inPersonRecords.length}
          </div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490", marginTop: "2px" }}>
            Jos & Abuja campus attendees
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "12px",
            padding: "18px 20px",
          }}
        >
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Virtual Stream Viewers</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "30px", fontWeight: 800, color: "#7A5200", marginTop: "4px" }}>
            {onlineRecords.length}
          </div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#7A5200", marginTop: "2px" }}>
            Online stream validated
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "12px",
            padding: "18px 20px",
          }}
        >
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>First-Timers / Guests</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "30px", fontWeight: 800, color: "#0F6B38", marginTop: "4px" }}>
            {guestCount}
          </div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#0F6B38", marginTop: "2px" }}>
            New seekers & visitors
          </div>
        </div>
      </div>

      {/* Two Control Cards: Virtual Code Generator & Usher Headcount Form */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Stream Code Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "14px",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "16px",
                fontWeight: 700,
                color: "#141C6E",
                margin: 0,
              }}
            >
              Virtual Stream Validation Code
            </h2>
            <span
              style={{
                padding: "3px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                backgroundColor: streamCodeActive ? "#E4F5EA" : "#FFF2D6",
                color: streamCodeActive ? "#0F6B38" : "#7A5200",
              }}
            >
              {streamCodeActive ? "Active" : "Inactive"}
            </span>
          </div>

          <p
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "12px",
              color: "#4A5490",
              margin: "0 0 16px",
            }}
          >
            Display this code on the YouTube/Mixlr livestream banner for online attendees to validate their check-in.
          </p>

          <form onSubmit={handleSaveStreamCode} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Active Service Code
              </label>
              <input
                type="text"
                placeholder="e.g. LIGHT-2026"
                value={streamCode}
                onChange={(e) => setStreamCode(e.target.value.toUpperCase())}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #D5DCF2",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "#1F46C8",
                  letterSpacing: "0.1em",
                  outline: "none",
                }}
              />
            </div>

            {streamCodeMsg && (
              <div
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: streamCodeMsg.includes("Failed") ? "#9B1C1C" : "#0F6B38",
                }}
              >
                {streamCodeMsg}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={streamCodeLoading}
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
                {streamCodeLoading ? "Saving..." : "Set / Update Code"}
              </button>

              {streamCodeActive && (
                <button
                  type="button"
                  onClick={handleDeactivateStreamCode}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#FDE7E7",
                    color: "#9B1C1C",
                    border: "1px solid #F8B4B4",
                    borderRadius: "8px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 600,
                    fontSize: "12.5px",
                    cursor: "pointer",
                  }}
                >
                  Deactivate
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Usher Headcount Form Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "14px",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "16px",
                fontWeight: 700,
                color: "#141C6E",
                margin: 0,
              }}
            >
              Usher Official Headcount Entry
            </h2>
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "11px",
                fontWeight: 600,
                color: "#4A5490",
              }}
            >
              Date: {selectedDate}
            </span>
          </div>

          <form onSubmit={handleSaveHeadcount} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Men</label>
                <input
                  type="number"
                  min="0"
                  value={headcount.men}
                  onChange={(e) => setHeadcount({ ...headcount, men: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "14px", fontWeight: 700, color: "#141C6E", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Women</label>
                <input
                  type="number"
                  min="0"
                  value={headcount.women}
                  onChange={(e) => setHeadcount({ ...headcount, women: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "14px", fontWeight: 700, color: "#141C6E", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Children</label>
                <input
                  type="number"
                  min="0"
                  value={headcount.children}
                  onChange={(e) => setHeadcount({ ...headcount, children: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "14px", fontWeight: 700, color: "#141C6E", outline: "none" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Service Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 1st service peak count, rainy morning"
                value={headcount.notes || ""}
                onChange={(e) => setHeadcount({ ...headcount, notes: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
              />
            </div>

            {headcountMsg && (
              <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", fontWeight: 600, color: "#0F6B38" }}>
                {headcountMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={headcountLoading}
              style={{
                padding: "10px 16px",
                backgroundColor: "#1F46C8",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {headcountLoading ? "Saving Headcount..." : "Save Official Headcount"}
            </button>
          </form>
        </div>
      </div>

      {/* Registry Table & Filters */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D5DCF2",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #E8EDFB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "260px", maxWidth: "420px" }}>
            <input
              type="text"
              placeholder="Filter attendees by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #D5DCF2",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12.5px",
                color: "#141C6E",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {["all", "in_person", "online"].map((m) => (
              <button
                key={m}
                onClick={() => setModeFilter(m)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: modeFilter === m ? "#1F46C8" : "#F4F6FB",
                  color: modeFilter === m ? "#FFFFFF" : "#4A5490",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {m === "all" ? "All Modes" : m === "in_person" ? "In-Person" : "Online Stream"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFD", borderBottom: "1px solid #E8EDFB" }}>
                <th style={{ padding: "14px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Attendee</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Phone</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Mode</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Location / Channel</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Type</th>
                <th style={{ padding: "14px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Time</th>
                <th style={{ padding: "14px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                    Loading attendance records...
                  </td>
                </tr>
              )}
              {!loading && filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                    No check-ins recorded for {selectedDate}.
                  </td>
                </tr>
              )}
              {filteredRecords.map((r) => {
                const timeStr = r.timestamp?.toDate
                  ? r.timestamp.toDate().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
                  : "—";
                return (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: "1px solid #E8EDFB",
                      transition: "background-color 0.15s",
                    }}
                  >
                    <td style={{ padding: "14px 24px" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "13.5px",
                          fontWeight: 700,
                          color: "#141C6E",
                        }}
                      >
                        {r.fullName}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "14px 20px",
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "12px",
                        color: "#141C6E",
                      }}
                    >
                      {r.phone || "—"}
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "99px",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: r.mode === "online" ? "#FFF2D6" : "#E8EDFB",
                          color: r.mode === "online" ? "#7A5200" : "#1F46C8",
                        }}
                      >
                        {r.mode === "online" ? "Virtual Stream" : "In-Person"}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "14px 20px",
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "12px",
                        color: "#4A5490",
                      }}
                    >
                      {r.location || r.streamChannel || "Main Sanctuary"}
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          backgroundColor: r.userId ? "#E4F5EA" : "#FFF2D6",
                          color: r.userId ? "#0F6B38" : "#7A5200",
                        }}
                      >
                        {r.userId ? "Member" : "Guest"}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "14px 24px",
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "12px",
                        color: "#4A5490",
                      }}
                    >
                      {timeStr}
                    </td>

                    {/* Action: Add to Members */}
                    <td style={{ padding: "14px 24px", textAlign: "right" }}>
                      <button
                        onClick={() => setEnrollAttendee({ fullName: r.fullName, phone: r.phone || "", email: "" })}
                        style={{
                          backgroundColor: "#EEF2FB",
                          color: "#1F46C8",
                          border: "1px solid #C4D3FA",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        + Add Member
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Attendee as Member Modal */}
      {enrollAttendee && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.6)",
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
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.2)",
              border: "1px solid #D5DCF2",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "18px",
                fontWeight: 800,
                color: "#141C6E",
                margin: "0 0 8px",
              }}
            >
              Move Attendee to Church Membership
            </h2>
            <p
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12.5px",
                color: "#4A5490",
                margin: "0 0 20px",
              }}
            >
              Enroll <strong>{enrollAttendee.fullName}</strong> into the church member directory and optionally generate their portal access credentials.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEnrollLoading(true);
                try {
                  const res = await fetch("/api/portal/members", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "add_member",
                      displayName: enrollAttendee.fullName,
                      phone: enrollAttendee.phone,
                      email: enrollAttendee.email,
                      role: "member",
                      activityTier: "active",
                      campus: "jos",
                      createAuthImmediately: Boolean(enrollAttendee.email && createAccountImmediately),
                    }),
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.error || "Failed to enroll member");

                  alert(`✓ ${enrollAttendee.fullName} has been successfully added to church membership!` + (json.tempPassword ? `\nTemporary password: ${json.tempPassword}` : ""));
                  setEnrollAttendee(null);
                } catch (err: any) {
                  alert("Error: " + err.message);
                } finally {
                  setEnrollLoading(false);
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "4px" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={enrollAttendee.fullName}
                  onChange={(e) => setEnrollAttendee({ ...enrollAttendee, fullName: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "4px" }}>Phone Number</label>
                <input
                  type="text"
                  value={enrollAttendee.phone}
                  onChange={(e) => setEnrollAttendee({ ...enrollAttendee, phone: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "4px" }}>Email Address (Required for Portal Login)</label>
                <input
                  type="email"
                  value={enrollAttendee.email}
                  placeholder="e.g. member@gmail.com"
                  onChange={(e) => setEnrollAttendee({ ...enrollAttendee, email: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#141C6E", cursor: "pointer", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  checked={createAccountImmediately}
                  onChange={(e) => setCreateAccountImmediately(e.target.checked)}
                />
                Generate portal login account & temporary password immediately
              </label>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button
                  type="submit"
                  disabled={enrollLoading}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "12.5px",
                    cursor: enrollLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {enrollLoading ? "Enrolling..." : "Confirm & Add to Membership"}
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollAttendee(null)}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#F4F6FB",
                    color: "#141C6E",
                    border: "1px solid #D5DCF2",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "12px",
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
