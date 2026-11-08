"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebaseAuth";
import { UNITS } from "@/lib/portalAuth";

interface AttendanceRecord {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  mode?: "in_person" | "online";
  location?: string;
  streamChannel?: string;
  serviceCode?: string;
  isGuest?: boolean;
  isFirstTimer?: boolean;
  hearAboutUs?: string;
  userId?: string;
  isMember?: boolean;
  isRegisteredMember?: boolean;
  checkedInBy?: string;
  date: string;
  timestamp?: any; // Firestore server timestamp — arrives as { _seconds, _nanoseconds } via Admin SDK JSON
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

interface AttendeeAccountConfig {
  attendanceId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  campus: "jos" | "abuja";
  assignedUnitId: string;
}

export default function AttendanceAdminPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotaWarning, setQuotaWarning] = useState(false);

  // Three-dot dropdown state: which record's menu is open
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");

  // Mass Selection & Bulk Deletion
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [massDeleting, setMassDeleting] = useState(false);

  // Service Code & Automatic Timer Management
  const [streamCode, setStreamCode] = useState("");
  const [streamCodeActive, setStreamCodeActive] = useState(false);
  const [streamCodeLoading, setStreamCodeLoading] = useState(false);
  const [streamCodeMsg, setStreamCodeMsg] = useState("");
  const [timerDuration, setTimerDuration] = useState<string>("15"); // "1".."30" or "custom"
  const [customMinutes, setCustomMinutes] = useState<number>(45);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Attendance button visibility toggle
  const [showAttendanceButton, setShowAttendanceButton] = useState<boolean>(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toggleMsg, setToggleMsg] = useState("");

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

  // Create Account modal state
  const [enrollAttendee, setEnrollAttendee] = useState<{ fullName: string; phone: string; email: string } | null>(null);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [createAccountImmediately, setCreateAccountImmediately] = useState(true);

  // Batch Create Accounts state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [attendeesConfigs, setAttendeesConfigs] = useState<AttendeeAccountConfig[]>([]);
  const [batchSendEmail, setBatchSendEmail] = useState<boolean>(true);
  const [batchCreating, setBatchCreating] = useState<boolean>(false);
  // Quick bulk apply options
  const [quickRole, setQuickRole] = useState<string>("keep");
  const [quickCampus, setQuickCampus] = useState<string>("keep");
  const [quickUnit, setQuickUnit] = useState<string>("keep");
  const [batchResults, setBatchResults] = useState<{
    total: number;
    createdCount: number;
    alreadyExistedCount: number;
    skippedCount: number;
    errorCount: number;
    results: Array<{
      attendanceId?: string;
      fullName: string;
      email: string;
      phone?: string;
      tempPassword?: string;
      status: "created" | "already_existed" | "skipped_no_email" | "error";
      message?: string;
    }>;
  } | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Close three-dot menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Stream Code Settings
  const fetchStreamSettings = async () => {
    try {
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch("/api/attendance/config", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (data) {
        setStreamCode(data.code || "");
        setStreamCodeActive(Boolean(data.active));
        setExpiresAt(data.expiresAt || null);
        if (typeof data.remainingSeconds === "number") {
          setRemainingSeconds(data.remainingSeconds);
        } else {
          setRemainingSeconds(null);
        }
        if (data.durationMinutes) {
          if ([1, 2, 5, 10, 15, 20, 25, 30].includes(data.durationMinutes)) {
            setTimerDuration(String(data.durationMinutes));
          } else {
            setTimerDuration("custom");
            setCustomMinutes(data.durationMinutes);
          }
        }
        // Attendance button toggle — default true if not set
        setShowAttendanceButton(data.showAttendanceButton !== false);
      }
    } catch (err) {
      console.error("Error fetching stream settings:", err);
    }
  };

  // Live countdown ticker effect
  useEffect(() => {
    if (!streamCodeActive || remainingSeconds === null || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setStreamCodeActive(false);
          setStreamCodeMsg("Service code timer has expired. Code is now inactive.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [streamCodeActive, remainingSeconds]);

  /** Fetch attendance records for selectedDate via the server API (bypasses Firestore quota) */
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch(`/api/attendance?date=${selectedDate}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const items: AttendanceRecord[] = (data.records || []).map((r: any) => ({
          ...r,
          // Normalize Admin SDK timestamp ({ _seconds }) into a millisecond epoch
          timestamp: r.timestamp?._seconds
            ? { toDate: () => new Date(r.timestamp._seconds * 1000) }
            : r.timestamp,
        }));
        setRecords(items);
        setFilteredRecords(items);
        setSelectedRecordIds([]);
        setQuotaWarning(Boolean(data.quotaBlocked));
      } else {
        setRecords([]);
        setFilteredRecords([]);
        setSelectedRecordIds([]);
      }
    } catch (err) {
      console.error("Error fetching attendance records:", err);
      setRecords([]);
      setFilteredRecords([]);
    } finally {
      setLoading(false);
    }

    // Also fetch headcount for this date
    try {
      const hcRes = await fetch(`/api/portal/headcount?date=${selectedDate}`);
      if (hcRes.ok) {
        const hcJson = await hcRes.json();
        if (hcJson.exists && hcJson.data) {
          setHeadcount(hcJson.data as HeadcountRecord);
        } else {
          setHeadcount({ date: selectedDate, men: 0, women: 0, children: 0, total: 0, notes: "" });
        }
      }
    } catch {
      setHeadcount({ date: selectedDate, men: 0, women: 0, children: 0, total: 0, notes: "" });
    }
  };

  /** Delete an attendance record */
  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Delete this attendance record? This cannot be undone.")) return;
    try {
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch(`/api/attendance?id=${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        setFilteredRecords((prev) => prev.filter((r) => r.id !== id));
        setSelectedRecordIds((prev) => prev.filter((itemId) => itemId !== id));
        setOpenMenuId(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert("Error: " + (data.error || "Failed to delete record."));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  /** Toggle Select All visible filtered records */
  const handleToggleSelectAll = () => {
    if (selectedRecordIds.length === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(filteredRecords.map((r) => r.id));
    }
  };

  /** Toggle Select a single record row */
  const handleToggleSelectRow = (id: string) => {
    setSelectedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  /** Bulk delete selected records */
  const handleMassDelete = async () => {
    if (selectedRecordIds.length === 0) return;
    const count = selectedRecordIds.length;
    if (!confirm(`Delete ${count} selected attendance record${count !== 1 ? "s" : ""}? This cannot be undone.`)) return;

    setMassDeleting(true);
    try {
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch("/api/attendance", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ids: selectedRecordIds }),
      });

      if (res.ok) {
        const toDeleteSet = new Set(selectedRecordIds);
        setRecords((prev) => prev.filter((r) => !toDeleteSet.has(r.id)));
        setFilteredRecords((prev) => prev.filter((r) => !toDeleteSet.has(r.id)));
        setSelectedRecordIds([]);
        setOpenMenuId(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert("Error: " + (data.error || "Failed to delete selected records."));
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setMassDeleting(false);
    }
  };

  /** Open Batch Create Modal and initialize individual configs per attendee */
  const handleOpenBatchModal = () => {
    const selectedAttendees = records.filter((r) => selectedRecordIds.includes(r.id));
    if (selectedAttendees.length === 0) return;

    const initialConfigs: AttendeeAccountConfig[] = selectedAttendees.map((r) => {
      const loc = (r.location || "").toLowerCase();
      const detectedCampus: "jos" | "abuja" = loc.includes("abuja") ? "abuja" : "jos";
      return {
        attendanceId: r.id,
        fullName: r.fullName,
        email: r.email || "",
        phone: r.phone || "",
        role: "member",
        campus: detectedCampus,
        assignedUnitId: "",
      };
    });

    setAttendeesConfigs(initialConfigs);
    setQuickRole("keep");
    setQuickCampus("keep");
    setQuickUnit("keep");
    setShowBatchModal(true);
  };

  /** Update individual attendee configuration */
  const updateAttendeeConfig = (attendanceId: string, patch: Partial<AttendeeAccountConfig>) => {
    setAttendeesConfigs((prev) =>
      prev.map((c) => (c.attendanceId === attendanceId ? { ...c, ...patch } : c))
    );
  };

  /** Bulk apply quick settings to all attendees in the modal */
  const handleApplyToAll = () => {
    setAttendeesConfigs((prev) =>
      prev.map((c) => ({
        ...c,
        ...(quickRole !== "keep" ? { role: quickRole } : {}),
        ...(quickCampus !== "keep" ? { campus: quickCampus as "jos" | "abuja" } : {}),
        ...(quickUnit !== "keep" ? { assignedUnitId: quickUnit } : {}),
      }))
    );
  };

  /** Bulk create accounts for selected records */
  const handleConfirmBatchCreate = async () => {
    const eligibleConfigs = attendeesConfigs.filter(
      (c) => c.email && c.email.trim().length > 0 && c.email.includes("@")
    );
    if (eligibleConfigs.length === 0) return;

    setBatchCreating(true);
    try {
      const payloadAttendees = eligibleConfigs.map((c) => ({
        attendanceId: c.attendanceId,
        fullName: c.fullName,
        email: c.email.trim().toLowerCase(),
        phone: c.phone || "",
        role: c.role,
        campus: c.campus,
        assignedUnitId: c.assignedUnitId,
      }));

      const res = await fetch("/api/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch_create_accounts",
          attendees: payloadAttendees,
          sendEmail: batchSendEmail,
          actorEmail: auth.currentUser?.email || "admin",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to batch create accounts");
      }

      // Mark records locally as having accounts if successful
      if (Array.isArray(data.results)) {
        const successfulAttendanceIds = new Set(
          data.results
            .filter((resItem: any) => resItem.status === "created" || resItem.status === "already_existed")
            .map((resItem: any) => resItem.attendanceId)
            .filter(Boolean)
        );

        setRecords((prev) =>
          prev.map((r) => (successfulAttendanceIds.has(r.id) ? { ...r, userId: r.userId || "created" } : r))
        );
        setFilteredRecords((prev) =>
          prev.map((r) => (successfulAttendanceIds.has(r.id) ? { ...r, userId: r.userId || "created" } : r))
        );
      }

      setShowBatchModal(false);
      setBatchResults(data);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setBatchCreating(false);
    }
  };

  /** Copy all temporary credentials to clipboard for WhatsApp/SMS distribution */
  const handleCopyAllCredentials = () => {
    if (!batchResults || !batchResults.results) return;
    const itemsWithCredentials = batchResults.results.filter((item) => item.tempPassword);
    if (itemsWithCredentials.length === 0) {
      alert("No temporary passwords available to copy.");
      return;
    }

    const text = [
      `🏛️ The Publishers House — Portal Login Credentials`,
      `Generated on: ${new Date().toLocaleDateString("en-NG", { dateStyle: "long" })}`,
      `Portal Sign-In: https://thepublishershouse.org/portal/login`,
      ``,
      ...itemsWithCredentials.map(
        (item, idx) =>
          `${idx + 1}. ${item.fullName}\n   Email: ${item.email}\n   Temporary Password: ${item.tempPassword}\n   ${item.phone ? `Phone: ${item.phone}\n` : ""}`
      ),
      `⚠️ Please log in and change your password upon your first sign-in.`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  useEffect(() => {
    fetchStreamSettings();
  }, []);

  // Toggle the homepage attendance button on/off
  const handleToggleAttendanceButton = async () => {
    setToggleLoading(true);
    setToggleMsg("");
    try {
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const newValue = !showAttendanceButton;
      const res = await fetch("/api/attendance/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          // Keep existing code/active state unchanged — only update visibility
          code: streamCode || "PLACEHOLDER",
          active: streamCodeActive,
          durationMinutes: timerDuration === "custom" ? customMinutes : Number(timerDuration),
          showAttendanceButton: newValue,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowAttendanceButton(newValue);
        setToggleMsg(
          newValue
            ? "Attendance button is now visible on the homepage."
            : "Attendance button is now hidden from the homepage."
        );
      } else {
        setToggleMsg(data.error || "Failed to update setting.");
      }
    } catch {
      setToggleMsg("Network error — please try again.");
    } finally {
      setToggleLoading(false);
      setTimeout(() => setToggleMsg(""), 4000);
    }
  };

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
          r.email?.toLowerCase().includes(term) ||
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
      const selectedMinutes =
        timerDuration === "custom"
          ? Math.max(1, Number(customMinutes) || 1)
          : Math.max(1, Number(timerDuration) || 15);

      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch("/api/attendance/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code: streamCode.trim().toUpperCase(),
          active: true,
          durationMinutes: selectedMinutes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update stream code.");
      setStreamCode(data.code || streamCode.trim().toUpperCase());
      setStreamCodeActive(true);
      setExpiresAt(data.expiresAt || null);
      setRemainingSeconds(selectedMinutes * 60);
      setStreamCodeMsg(`Service code active for ${selectedMinutes} minute${selectedMinutes > 1 ? "s" : ""} ✓`);
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
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch("/api/attendance/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code: "", active: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to deactivate stream code.");
      setStreamCode("");
      setStreamCodeActive(false);
      setExpiresAt(null);
      setRemainingSeconds(null);
      setStreamCodeMsg("Service code requirement deactivated ✓");
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
      "Email",
      "Phone",
      "Mode",
      "Location / Channel",
      "Service Code",
      "Member Type",
      "First Timer",
      "Heard About Us",
      "Date",
      "Time",
    ];
    const rows = filteredRecords.map((r) => {
      const timeStr = r.timestamp?.toDate
        ? r.timestamp.toDate().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
        : "";
      return [
        `"${r.fullName || ""}"`,
        `"${r.email || ""}"`,
        `"${r.phone || ""}"`,
        `"${r.mode || "in_person"}"`,
        `"${r.location || r.streamChannel || ""}"`,
        `"${r.serviceCode || ""}"`,
        `"${(r.isMember || r.isRegisteredMember) ? "Member" : "Walk-in"}"`,
        `"${r.isFirstTimer ? "Yes" : "No"}"`,
        `"${r.hearAboutUs || ""}"`,
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
  const guestCount = records.filter((r) => !r.isMember && !r.isRegisteredMember).length;

  const selectedAttendees = records.filter((r) => selectedRecordIds.includes(r.id));
  const withEmailCount = selectedAttendees.filter((r) => r.email && r.email.trim().length > 0).length;
  const withoutEmailCount = selectedAttendees.length - withEmailCount;

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

          <a
            href="/portal/pastoral?tab=compare"
            style={{
              backgroundColor: "#1F46C8",
              border: "none",
              borderRadius: "10px",
              padding: "10px 16px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "13px",
              color: "#FFFFFF",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
              cursor: "pointer",
            }}
          >
            <span>📈</span>
            Compare 3 Dates (Pastoral Tool)
          </a>

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

      {/* Quota Exhaustion Alert Banner */}
      {quotaWarning && (
        <div
          style={{
            backgroundColor: "#FFFBEB",
            border: "1px solid #FCD34D",
            borderRadius: "12px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
            boxShadow: "0 2px 8px rgba(245, 158, 11, 0.08)",
          }}
        >
          <span style={{ fontSize: "24px", lineHeight: 1 }}>⚠️</span>
          <div>
            <div
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "14px",
                fontWeight: 700,
                color: "#92400E",
                marginBottom: "4px",
              }}
            >
              Daily Database Read Limit Reached (Firebase Spark Free Tier)
            </div>
            <div
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12.5px",
                color: "#B45309",
                lineHeight: 1.6,
              }}
            >
              All 190+ attendee check-ins and first-timer records are safely preserved in the database. Google Cloud limits free Spark projects to 50,000 document reads per day.
              To remove this cap and handle large services (1,000+ worshippers) without interruption, upgrade this project from Spark (Free) to <strong>Blaze (Pay-as-you-go)</strong> in the Firebase Console.
            </div>
          </div>
        </div>
      )}

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
        {/* Service Code & Timer Card */}
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
              Service Validation Code
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {streamCodeActive && remainingSeconds !== null && (
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: remainingSeconds > 60 ? "#E4F5EA" : "#FDE8E8",
                    color: remainingSeconds > 60 ? "#0F6B38" : "#9B1C1C",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>⏱️</span>
                  <span>
                    {Math.floor(remainingSeconds / 60)}m {String(remainingSeconds % 60).padStart(2, "0")}s
                  </span>
                </span>
              )}
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
          </div>

          <p
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "12px",
              color: "#4A5490",
              margin: "0 0 16px",
            }}
          >
            Required for in-person attendees and online stream worshippers. The code automatically shuts off when the timer expires.
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
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Timer Duration Selection: 1m to 30m + Custom */}
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Active Timer Duration (Auto-Off)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                {[1, 2, 5, 10, 15, 20, 25, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTimerDuration(String(mins))}
                    style={{
                      padding: "5px 9px",
                      borderRadius: "6px",
                      border: timerDuration === String(mins) ? "1.5px solid #1F46C8" : "1px solid #D5DCF2",
                      backgroundColor: timerDuration === String(mins) ? "#EBF1FF" : "#FFFFFF",
                      color: timerDuration === String(mins) ? "#1F46C8" : "#4A5490",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    }}
                  >
                    {mins}m
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTimerDuration("custom")}
                  style={{
                    padding: "5px 9px",
                    borderRadius: "6px",
                    border: timerDuration === "custom" ? "1.5px solid #1F46C8" : "1px solid #D5DCF2",
                    backgroundColor: timerDuration === "custom" ? "#EBF1FF" : "#FFFFFF",
                    color: timerDuration === "custom" ? "#1F46C8" : "#4A5490",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  }}
                >
                  Custom
                </button>
              </div>

              {timerDuration === "custom" && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="number"
                    min={1}
                    max={360}
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(1, Number(e.target.value)))}
                    style={{
                      width: "80px",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "1px solid #D5DCF2",
                      fontSize: "13px",
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontWeight: 600,
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                    Minutes (Custom Duration)
                  </span>
                </div>
              )}
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
                {streamCodeLoading ? "Saving..." : streamCodeActive ? "Update Active Code & Timer" : "Set & Activate Code"}
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

        {/* ── Homepage Attendance Button Visibility Toggle ── */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "14px",
            padding: "24px",
            gridColumn: "1 / -1", // span full width below the two-col grid
            marginTop: "0",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#141C6E",
                  margin: "0 0 4px",
                }}
              >
                Homepage Attendance Button
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12px",
                  color: "#4A5490",
                  margin: 0,
                }}
              >
                Toggle the &ldquo;Tap &amp; Hold to Sign Attendance&rdquo; button on the public homepage. Turn it off on days when church is not meeting.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: showAttendanceButton ? "#0F6B38" : "#9B1C1C",
                  backgroundColor: showAttendanceButton ? "#E4F5EA" : "#FDE7E7",
                  border: `1px solid ${showAttendanceButton ? "#A7F3D0" : "#F8B4B4"}`,
                  borderRadius: "6px",
                  padding: "4px 10px",
                }}
              >
                {showAttendanceButton ? "● Visible" : "○ Hidden"}
              </span>
              <button
                type="button"
                onClick={handleToggleAttendanceButton}
                disabled={toggleLoading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: showAttendanceButton ? "#FDE7E7" : "#1F46C8",
                  color: showAttendanceButton ? "#9B1C1C" : "#FFFFFF",
                  border: showAttendanceButton ? "1px solid #F8B4B4" : "none",
                  borderRadius: "8px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 700,
                  fontSize: "12.5px",
                  cursor: toggleLoading ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {toggleLoading ? "Saving..." : showAttendanceButton ? "Hide Button" : "Show Button"}
              </button>
            </div>
          </div>
          {toggleMsg && (
            <p
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                color: toggleMsg.includes("error") || toggleMsg.includes("Failed") ? "#9B1C1C" : "#0F6B38",
                marginTop: "12px",
                marginBottom: 0,
              }}
            >
              {toggleMsg}
            </p>
          )}
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
              placeholder="Filter by name, email or phone..."
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

        {/* ── Mass Action Selection Toolbar ── */}
        {selectedRecordIds.length > 0 && (
          <div
            style={{
              padding: "12px 24px",
              backgroundColor: "#EEF2FB",
              borderBottom: "1px solid #D5DCF2",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  color: "#0E1556",
                }}
              >
                ✓ {selectedRecordIds.length} of {filteredRecords.length} record{selectedRecordIds.length !== 1 ? "s" : ""} selected
              </span>
              <button
                type="button"
                onClick={() => setSelectedRecordIds([])}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#1F46C8",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Deselect all
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {/* Batch Create Accounts Button */}
              <button
                type="button"
                onClick={handleOpenBatchModal}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
                }}
              >
                👤 Create Account{selectedRecordIds.length !== 1 ? "s" : ""} ({selectedRecordIds.length})
              </button>

              {/* Mass Delete Button */}
              <button
                type="button"
                onClick={handleMassDelete}
                disabled={massDeleting}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: massDeleting ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(220, 38, 38, 0.25)",
                }}
              >
                🗑️ {massDeleting ? "Deleting..." : `Delete Selected (${selectedRecordIds.length})`}
              </button>
            </div>
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFD", borderBottom: "1px solid #E8EDFB" }}>
                <th style={{ padding: "14px 16px 14px 24px", width: "40px" }}>
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={
                      filteredRecords.length > 0 &&
                      selectedRecordIds.length === filteredRecords.length
                    }
                    onChange={handleToggleSelectAll}
                    style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#1F46C8" }}
                  />
                </th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", whiteSpace: "nowrap" }}>Attendee</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", whiteSpace: "nowrap" }}>Email</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", whiteSpace: "nowrap" }}>Phone</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", whiteSpace: "nowrap" }}>Mode</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", whiteSpace: "nowrap" }}>Location</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", whiteSpace: "nowrap" }}>Code Used</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", whiteSpace: "nowrap" }}>Type</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", whiteSpace: "nowrap" }}>Time</th>
                <th style={{ padding: "14px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={10} style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                    Loading attendance records...
                  </td>
                </tr>
              )}
              {!loading && filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                    {quotaWarning
                      ? "Daily database read quota reached on the free Spark plan. All 190+ check-in records are safely preserved in Firestore. Upgrade to Blaze in Firebase Console to unlock immediate viewing."
                      : `No check-ins recorded for ${selectedDate}.`}
                  </td>
                </tr>
              )}
              {filteredRecords.map((r) => {
                const timeStr = r.timestamp?.toDate
                  ? r.timestamp.toDate().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
                  : "—";
                const isMenuOpen = openMenuId === r.id;
                const isRowSelected = selectedRecordIds.includes(r.id);
                return (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: "1px solid #E8EDFB",
                      backgroundColor: isRowSelected ? "#F3F6FD" : "transparent",
                      transition: "background-color 0.15s",
                    }}
                  >
                    {/* Row Select Checkbox */}
                    <td style={{ padding: "14px 16px 14px 24px", width: "40px" }}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${r.fullName}`}
                        checked={isRowSelected}
                        onChange={() => handleToggleSelectRow(r.id)}
                        style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#1F46C8" }}
                      />
                    </td>

                    {/* Attendee Name */}
                    <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                      <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13.5px", fontWeight: 700, color: "#141C6E" }}>
                        {r.fullName}
                      </div>
                      {r.isFirstTimer && (
                        <span style={{ fontSize: "10px", backgroundColor: "#FFF2D6", color: "#7A5200", borderRadius: "4px", padding: "1px 6px", fontWeight: 700 }}>
                          First Timer
                        </span>
                      )}
                    </td>

                    {/* Email */}
                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#1F46C8", whiteSpace: "nowrap" }}>
                      {r.email ? (
                        <a href={`mailto:${r.email}`} style={{ color: "#1F46C8", textDecoration: "none" }}>{r.email}</a>
                      ) : (
                        <span style={{ color: "#CBD5E1" }}>—</span>
                      )}
                    </td>

                    {/* Phone */}
                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#141C6E", whiteSpace: "nowrap" }}>
                      {r.phone || "—"}
                    </td>

                    {/* Mode */}
                    <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "99px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, backgroundColor: r.mode === "online" ? "#FFF2D6" : "#E8EDFB", color: r.mode === "online" ? "#7A5200" : "#1F46C8" }}>
                        {r.mode === "online" ? "🌐 Virtual" : "🏛️ In-Person"}
                      </span>
                    </td>

                    {/* Location */}
                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#4A5490", whiteSpace: "nowrap" }}>
                      {r.location || r.streamChannel || "Main Sanctuary"}
                    </td>

                    {/* Service Code Used */}
                    <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                      {r.serviceCode ? (
                        <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, color: "#0F6B38", backgroundColor: "#E4F5EA", padding: "2px 8px", borderRadius: "4px" }}>
                          {r.serviceCode}
                        </span>
                      ) : (
                        <span style={{ color: "#CBD5E1", fontSize: "12px" }}>—</span>
                      )}
                    </td>

                    {/* Member Type */}
                    <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                      {(() => {
                        const isOfficialMember = Boolean(r.isMember || r.isRegisteredMember);
                        const isGuestVia = Boolean(r.checkedInBy);
                        return (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                              fontSize: "10.5px",
                              fontWeight: 700,
                              backgroundColor: isGuestVia ? "#EFF6FF" : isOfficialMember ? "#E4F5EA" : "#FFF2D6",
                              color: isGuestVia ? "#1D4ED8" : isOfficialMember ? "#0F6B38" : "#7A5200",
                            }}
                          >
                            {isGuestVia
                              ? `Guest (via ${r.checkedInBy!.split(" ")[0]})`
                              : isOfficialMember
                              ? "Member"
                              : "Walk-in"}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Time */}
                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#4A5490", whiteSpace: "nowrap" }}>
                      {timeStr}
                    </td>

                    {/* Three-dot Actions Menu */}
                    <td style={{ padding: "14px 24px", textAlign: "right", position: "relative" }}>
                      <div style={{ position: "relative", display: "inline-block" }} ref={isMenuOpen ? menuRef : null}>
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(isMenuOpen ? null : r.id)}
                          title="More actions"
                          style={{
                            background: isMenuOpen ? "#EEF2FB" : "transparent",
                            border: "1px solid " + (isMenuOpen ? "#C4D3FA" : "transparent"),
                            borderRadius: "6px",
                            padding: "5px 10px",
                            cursor: "pointer",
                            fontSize: "18px",
                            color: "#4A5490",
                            lineHeight: 1,
                          }}
                        >
                          ⋮
                        </button>

                        {isMenuOpen && (
                          <div
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "calc(100% + 4px)",
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #D5DCF2",
                              borderRadius: "10px",
                              boxShadow: "0 8px 24px rgba(14,21,86,0.15)",
                              zIndex: 50,
                              minWidth: "190px",
                              overflow: "hidden",
                            }}
                          >
                            {/* Create Account */}
                            <button
                              type="button"
                              onClick={() => {
                                setEnrollAttendee({ fullName: r.fullName, phone: r.phone || "", email: r.email || "" });
                                setOpenMenuId(null);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                width: "100%",
                                padding: "11px 16px",
                                background: "none",
                                border: "none",
                                borderBottom: "1px solid #EEF2FB",
                                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                                fontSize: "12.5px",
                                fontWeight: 600,
                                color: "#1F46C8",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                            >
                              <span>⚡</span> Create Account &amp; Invite
                            </button>

                            {/* Send Pastoral Note */}
                            <button
                              type="button"
                              onClick={() => {
                                if (r.email) window.location.href = `mailto:${r.email}?subject=The Publishers House - Follow Up&body=Dear ${r.fullName.split(" ")[0]},`;
                                else alert("No email address on record for this attendee.");
                                setOpenMenuId(null);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                width: "100%",
                                padding: "11px 16px",
                                background: "none",
                                border: "none",
                                borderBottom: "1px solid #EEF2FB",
                                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                                fontSize: "12.5px",
                                fontWeight: 600,
                                color: "#0F6B38",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                            >
                              <span>✉️</span> Send Pastoral Note
                            </button>

                            {/* Delete Record */}
                            <button
                              type="button"
                              onClick={() => handleDeleteRecord(r.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                width: "100%",
                                padding: "11px 16px",
                                background: "none",
                                border: "none",
                                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                                fontSize: "12.5px",
                                fontWeight: 600,
                                color: "#9B1C1C",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                            >
                              <span>🗑</span> Delete Record
                            </button>
                          </div>
                        )}
                      </div>
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
              Create Account & Invite Member
            </h2>
            <p
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12.5px",
                color: "#4A5490",
                margin: "0 0 20px",
              }}
            >
              Create a portal account for <strong>{enrollAttendee.fullName}</strong>. Their login credentials will be generated and an invitation email will be sent immediately.
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

      {/* Batch Create Accounts Modal */}
      {showBatchModal && (() => {
        const activeWithEmailCount = attendeesConfigs.filter(
          (c) => c.email && c.email.trim().length > 0 && c.email.includes("@")
        ).length;
        const activeWithoutEmailCount = attendeesConfigs.length - activeWithEmailCount;

        return (
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
                padding: "28px 32px",
                maxWidth: "700px",
                width: "100%",
                maxHeight: "92vh",
                overflowY: "auto",
                boxShadow: "0 10px 30px rgba(14, 21, 86, 0.2)",
                border: "1px solid #D5DCF2",
              }}
            >
              {/* Modal Title */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "19px",
                    fontWeight: 800,
                    color: "#141C6E",
                    margin: 0,
                  }}
                >
                  Create Accounts for Selected Attendees
                </h2>
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#747CA1" }}
                >
                  ✕
                </button>
              </div>

              <p
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12.5px",
                  color: "#4A5490",
                  margin: "0 0 16px",
                }}
              >
                Configure individual member roles, units, and campus locations for each of the <strong>{attendeesConfigs.length}</strong> selected attendee{attendeesConfigs.length !== 1 ? "s" : ""}.
              </p>

              {/* Email readiness summary badges */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <div style={{ flex: 1, backgroundColor: "#EAF6ED", border: "1px solid #C4E9CE", borderRadius: "8px", padding: "8px 14px" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#0F6B38", textTransform: "uppercase" }}>Ready to Create</div>
                  <div style={{ fontSize: "17px", fontWeight: 800, color: "#0F6B38", marginTop: "1px" }}>{activeWithEmailCount} Attendee{activeWithEmailCount !== 1 ? "s" : ""}</div>
                </div>
                {activeWithoutEmailCount > 0 && (
                  <div style={{ flex: 1, backgroundColor: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "8px", padding: "8px 14px" }}>
                    <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#C2410C", textTransform: "uppercase" }}>Needs Email Address</div>
                    <div style={{ fontSize: "17px", fontWeight: 800, color: "#C2410C", marginTop: "1px" }}>{activeWithoutEmailCount} Attendee{activeWithoutEmailCount !== 1 ? "s" : ""}</div>
                  </div>
                )}
              </div>

              {/* Quick Bulk Set Toolbar (when 2+ attendees selected) */}
              {attendeesConfigs.length > 1 && (
                <div
                  style={{
                    backgroundColor: "#F4F7FD",
                    border: "1px solid #D5DCF2",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>⚡</span> Quick Set (Apply to All Selected):
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr auto", gap: "8px", alignItems: "center" }}>
                    <select
                      value={quickRole}
                      onChange={(e) => setQuickRole(e.target.value)}
                      style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #C5D1F0", fontSize: "12px", backgroundColor: "#FFFFFF" }}
                    >
                      <option value="keep">Role (Keep current)</option>
                      <option value="member">Set all to Member</option>
                      <option value="unit_head">Set all to Unit Head</option>
                      <option value="admin">Set all to Administrator</option>
                    </select>

                    <select
                      value={quickCampus}
                      onChange={(e) => setQuickCampus(e.target.value)}
                      style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #C5D1F0", fontSize: "12px", backgroundColor: "#FFFFFF" }}
                    >
                      <option value="keep">Campus (Keep current)</option>
                      <option value="jos">Set all to Jos</option>
                      <option value="abuja">Set all to Abuja</option>
                    </select>

                    <select
                      value={quickUnit}
                      onChange={(e) => setQuickUnit(e.target.value)}
                      style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #C5D1F0", fontSize: "12px", backgroundColor: "#FFFFFF" }}
                    >
                      <option value="keep">Unit (Keep current)</option>
                      <option value="">Unassigned</option>
                      {UNITS.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleApplyToAll}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#1F46C8",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* Per-Attendee Cards List */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "8px" }}>
                  Attendee Details & Assignments ({attendeesConfigs.length}):
                </div>

                <div style={{ maxHeight: "360px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "4px" }}>
                  {attendeesConfigs.map((att) => {
                    const hasValidEmail = Boolean(att.email && att.email.trim().length > 0 && att.email.includes("@"));

                    return (
                      <div
                        key={att.attendanceId}
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid " + (hasValidEmail ? "#DCE4F8" : "#FCD34D"),
                          borderRadius: "10px",
                          padding: "12px 14px",
                          boxShadow: "0 2px 6px rgba(14, 21, 86, 0.04)",
                        }}
                      >
                        {/* Attendee Name Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 700, fontSize: "13.5px", color: "#141C6E" }}>
                              {att.fullName}
                            </span>
                            {att.phone && (
                              <span style={{ fontSize: "11px", color: "#747CA1" }}>({att.phone})</span>
                            )}
                          </div>
                          <div>
                            {hasValidEmail ? (
                              <span style={{ fontSize: "10px", backgroundColor: "#E4F5EA", color: "#0F6B38", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                                ✓ Eligible
                              </span>
                            ) : (
                              <span style={{ fontSize: "10px", backgroundColor: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                                ⚠️ Needs Email
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Email row / input if missing */}
                        <div style={{ marginBottom: "10px" }}>
                          {hasValidEmail ? (
                            <div style={{ fontSize: "11.5px", color: "#1F46C8", display: "flex", alignItems: "center", gap: "5px" }}>
                              <span>✉️</span> {att.email}
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <input
                                type="email"
                                placeholder="Enter email to enable portal login for this attendee..."
                                value={att.email}
                                onChange={(e) => updateAttendeeConfig(att.attendanceId, { email: e.target.value })}
                                style={{
                                  flex: 1,
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid #FCD34D",
                                  backgroundColor: "#FFFBEB",
                                  fontSize: "12px",
                                  color: "#141C6E",
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Individual Role, Campus, Unit Selection */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr", gap: "8px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "3px" }}>
                              Role
                            </label>
                            <select
                              value={att.role}
                              onChange={(e) => updateAttendeeConfig(att.attendanceId, { role: e.target.value })}
                              style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "12px", backgroundColor: "#FFFFFF" }}
                            >
                              <option value="member">Member</option>
                              <option value="unit_head">Unit Head</option>
                              <option value="admin">Administrator</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "3px" }}>
                              Campus
                            </label>
                            <select
                              value={att.campus}
                              onChange={(e) => updateAttendeeConfig(att.attendanceId, { campus: e.target.value as "jos" | "abuja" })}
                              style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "12px", backgroundColor: "#FFFFFF" }}
                            >
                              <option value="jos">Jos Campus</option>
                              <option value="abuja">Abuja Campus</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "3px" }}>
                              Church Unit
                            </label>
                            <select
                              value={att.assignedUnitId}
                              onChange={(e) => updateAttendeeConfig(att.attendanceId, { assignedUnitId: e.target.value })}
                              style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "12px", backgroundColor: "#FFFFFF" }}
                            >
                              <option value="">-- Unassigned --</option>
                              {UNITS.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Email dispatch toggle */}
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#141C6E", cursor: "pointer", marginBottom: "16px" }}>
                <input
                  type="checkbox"
                  checked={batchSendEmail}
                  onChange={(e) => setBatchSendEmail(e.target.checked)}
                  style={{ accentColor: "#1F46C8", width: "16px", height: "16px" }}
                />
                Dispatch branded invitation emails with temporary passwords automatically
              </label>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleConfirmBatchCreate}
                  disabled={batchCreating || activeWithEmailCount === 0}
                  style={{
                    flex: 1,
                    padding: "11px",
                    backgroundColor: activeWithEmailCount === 0 ? "#CBD5E1" : "#1F46C8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: batchCreating || activeWithEmailCount === 0 ? "not-allowed" : "pointer",
                    boxShadow: activeWithEmailCount > 0 ? "0 4px 12px rgba(31, 70, 200, 0.25)" : "none",
                  }}
                >
                  {batchCreating
                    ? "Creating Accounts..."
                    : activeWithEmailCount === 0
                    ? "Enter Email for Attendees"
                    : `Confirm & Create ${activeWithEmailCount} Account${activeWithEmailCount !== 1 ? "s" : ""}`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  disabled={batchCreating}
                  style={{
                    padding: "11px 20px",
                    backgroundColor: "#F4F6FB",
                    color: "#141C6E",
                    border: "1px solid #D5DCF2",
                    borderRadius: "8px",
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
        );
      })()}

      {/* Batch Results & Credentials Sheet Modal */}
      {batchResults && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 110,
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
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.2)",
              border: "1px solid #D5DCF2",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "40px", lineHeight: 1, marginBottom: "8px" }}>🎉</div>
              <h2
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#141C6E",
                  margin: "0 0 6px",
                }}
              >
                Accounts Provisioned Successfully!
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "13px",
                  color: "#4A5490",
                  margin: 0,
                }}
              >
                {batchResults.createdCount} new account(s) created · {batchResults.alreadyExistedCount} refreshed · {batchResults.skippedCount} skipped
              </p>
            </div>

            {/* Copy All Button */}
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                onClick={handleCopyAllCredentials}
                style={{
                  padding: "10px 20px",
                  backgroundColor: copiedAll ? "#0F6B38" : "#0E1556",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "12.5px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(14, 21, 86, 0.2)",
                  transition: "background-color 0.2s",
                }}
              >
                {copiedAll ? "✓ Copied to Clipboard!" : "📋 Copy All Credentials (for WhatsApp/SMS)"}
              </button>
            </div>

            {/* Table of accounts */}
            <div style={{ maxHeight: "240px", overflowY: "auto", border: "1px solid #E8EDFB", borderRadius: "8px", marginBottom: "20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFD", borderBottom: "1px solid #E8EDFB" }}>
                    <th style={{ padding: "8px 12px", color: "#4A5490", fontWeight: 600 }}>Name</th>
                    <th style={{ padding: "8px 12px", color: "#4A5490", fontWeight: 600 }}>Email</th>
                    <th style={{ padding: "8px 12px", color: "#4A5490", fontWeight: 600 }}>Temp Password</th>
                    <th style={{ padding: "8px 12px", color: "#4A5490", fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batchResults.results.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #EEF2FB" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 700, color: "#141C6E" }}>{item.fullName}</td>
                      <td style={{ padding: "8px 12px", color: "#1F46C8" }}>{item.email || "—"}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", fontWeight: 700, color: "#0140C1" }}>
                        {item.tempPassword || "—"}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor:
                              item.status === "created"
                                ? "#E4F5EA"
                                : item.status === "already_existed"
                                ? "#E0F2FE"
                                : item.status === "skipped_no_email"
                                ? "#FFF7ED"
                                : "#FEE2E2",
                            color:
                              item.status === "created"
                                ? "#0F6B38"
                                : item.status === "already_existed"
                                ? "#0284C7"
                                : item.status === "skipped_no_email"
                                ? "#C2410C"
                                : "#991B1B",
                          }}
                        >
                          {item.status === "created"
                            ? "Created"
                            : item.status === "already_existed"
                            ? "Updated"
                            : item.status === "skipped_no_email"
                            ? "Skipped"
                            : "Error"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => {
                setBatchResults(null);
                setSelectedRecordIds([]);
              }}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#1F46C8",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
