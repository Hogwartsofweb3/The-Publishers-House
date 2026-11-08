"use client";

import { useEffect, useState, useMemo } from "react";
import { UNITS } from "@/lib/portalAuth";
import type { ComparedAttendee } from "@/app/api/portal/attendance/compare/route";

interface AttendanceCompareTabProps {
  initialCampus?: "all" | "jos" | "abuja" | "online";
}

export default function AttendanceCompareTab({ initialCampus = "all" }: AttendanceCompareTabProps) {
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [date1, setDate1] = useState<string>("");
  const [date2, setDate2] = useState<string>("");
  const [date3, setDate3] = useState<string>("");
  const [campus, setCampus] = useState<string>(initialCampus);
  const [filterType, setFilterType] = useState<"all" | "candidates" | "walk_ins" | "members">("all");
  const [search, setSearch] = useState("");
  const [attendees, setAttendees] = useState<ComparedAttendee[]>([]);
  const [summary, setSummary] = useState({
    totalAttendees: 0,
    candidatesCount: 0,
    perfectAttendanceCount: 0,
    walkInsCount: 0,
    membersCount: 0,
  });

  // Modal State for Creating Member Profile
  const [targetCandidate, setTargetCandidate] = useState<ComparedAttendee | null>(null);
  const [creatingMember, setCreatingMember] = useState(false);
  const [createMsg, setCreateMsg] = useState("");
  const [memberForm, setMemberForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    campus: "jos" as "jos" | "abuja",
    assignedUnitId: "none",
    role: "member",
    activityTier: "active",
    password: "",
  });

  const fetchData = async (d1?: string, d2?: string, d3?: string, c?: string, f?: string, q?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (d1) params.set("date1", d1);
      if (d2) params.set("date2", d2);
      if (d3) params.set("date3", d3);
      if (c && c !== "all") params.set("campus", c);
      if (f && f !== "all") params.set("filter", f);
      if (q) params.set("q", q);

      const res = await fetch(`/api/portal/attendance/compare?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableDates(data.availableDates || []);
        if (data.selectedDates && data.selectedDates.length === 3) {
          setDate1(data.selectedDates[0]);
          setDate2(data.selectedDates[1]);
          setDate3(data.selectedDates[2]);
        }
        setAttendees(data.attendees || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error("Failed to load attendance comparison:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyFilter = () => {
    fetchData(date1, date2, date3, campus, filterType, search);
  };

  const handleOpenCreateModal = (candidate: ComparedAttendee) => {
    // Generate secure default temporary password
    const tempPass = `TPH${Math.random().toString(36).slice(-6)}!`;
    const inferredCampus = candidate.campus.toLowerCase().includes("abuja") ? "abuja" : "jos";

    setMemberForm({
      displayName: candidate.name,
      email: candidate.email || "",
      phone: candidate.phone || "",
      campus: inferredCampus,
      assignedUnitId: "none",
      role: "member",
      activityTier: "active",
      password: tempPass,
    });
    setTargetCandidate(candidate);
    setCreateMsg("");
  };

  const handleCreateMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.email.trim()) {
      setCreateMsg("Error: An email address is required to create a Member Portal account.");
      return;
    }

    setCreatingMember(true);
    setCreateMsg("");

    try {
      const res = await fetch("/api/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_member",
          displayName: memberForm.displayName,
          email: memberForm.email,
          phone: memberForm.phone,
          campus: memberForm.campus,
          assignedUnitId: memberForm.assignedUnitId === "none" ? "" : memberForm.assignedUnitId,
          role: memberForm.role,
          activityTier: memberForm.activityTier,
          password: memberForm.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create member profile");
      }

      setCreateMsg("Member profile created successfully! Login credentials registered ✓");

      // Update local state to immediately show them as Member
      setAttendees((prev) =>
        prev.map((att) =>
          att.key === targetCandidate?.key
            ? {
                ...att,
                isMember: true,
                statusTag: "Member",
                isCandidateForMembership: false,
                recommendationNote: "Official Member Profile Created ✓",
              }
            : att
        )
      );

      setSummary((prev) => ({
        ...prev,
        candidatesCount: Math.max(0, prev.candidatesCount - 1),
        walkInsCount: Math.max(0, prev.walkInsCount - 1),
        membersCount: prev.membersCount + 1,
      }));

      setTimeout(() => {
        setTargetCandidate(null);
        setCreateMsg("");
      }, 2000);
    } catch (err: any) {
      setCreateMsg(`Error: ${err.message}`);
    } finally {
      setCreatingMember(false);
    }
  };

  const handleExportCSV = () => {
    if (attendees.length === 0) return;
    const headers = [
      "Name",
      "Phone",
      "Email",
      "Status",
      "Campus",
      `Date 1 (${date1})`,
      `Date 2 (${date2})`,
      `Date 3 (${date3})`,
      "Total Attended (out of 3)",
      "Consistency %",
      "Membership Candidate",
      "Recommendation Note",
    ];

    const rows = attendees.map((a) => [
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.phone}"`,
      `"${a.email}"`,
      a.statusTag,
      `"${a.campus}"`,
      a.date1Detail.attended ? `Attended (${a.date1Detail.mode})` : "Absent",
      a.date2Detail.attended ? `Attended (${a.date2Detail.mode})` : "Absent",
      a.date3Detail.attended ? `Attended (${a.date3Detail.mode})` : "Absent",
      a.totalAttendedOutOf3,
      `${a.consistencyRate}%`,
      a.isCandidateForMembership ? "YES" : "NO",
      `"${a.recommendationNote.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TPH_Attendance_Compare_${date1}_${date2}_${date3}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Overview & Pastoral Guide Banner */}
      <div
        style={{
          backgroundColor: "#F0F4FF",
          border: "1px solid #C7D7FE",
          borderRadius: "14px",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>📈</span>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#141C6E", margin: 0 }}>
              Tri-Date Attendance Matrix &amp; Membership Promotion
            </h2>
          </div>
          <p style={{ fontSize: "12.5px", color: "#3B487A", margin: "4px 0 0", maxWidth: "800px" }}>
            Compare attendance records across three historical church gatherings to identify faithful attendees.
            Attendees tagged as <strong>Walk-in</strong> who attended 2 or 3 services are highlighted as{" "}
            <strong>Prime Candidates</strong> to receive an official Church Member Profile.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #1F46C8",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#1F46C8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>📥</span> Export CSV Report
        </button>
      </div>

      {/* Date Selectors & Filter Strip */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E8EDFB",
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 1px 3px rgba(20, 28, 110, 0.04)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
          {/* Date 1 Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "160px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase" }}>
              Service Date 1 (Recent)
            </label>
            <select
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid #D5DCF2",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#141C6E",
                backgroundColor: "#F8FAFD",
              }}
            >
              {availableDates.map((d) => (
                <option key={`d1-${d}`} value={d}>
                  📅 {d}
                </option>
              ))}
            </select>
          </div>

          {/* Date 2 Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "160px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase" }}>
              Service Date 2
            </label>
            <select
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid #D5DCF2",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#141C6E",
                backgroundColor: "#F8FAFD",
              }}
            >
              {availableDates.map((d) => (
                <option key={`d2-${d}`} value={d}>
                  📅 {d}
                </option>
              ))}
            </select>
          </div>

          {/* Date 3 Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "160px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase" }}>
              Service Date 3
            </label>
            <select
              value={date3}
              onChange={(e) => setDate3(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid #D5DCF2",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#141C6E",
                backgroundColor: "#F8FAFD",
              }}
            >
              {availableDates.map((d) => (
                <option key={`d3-${d}`} value={d}>
                  📅 {d}
                </option>
              ))}
            </select>
          </div>

          {/* Campus Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "160px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase" }}>
              Campus
            </label>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid #D5DCF2",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#141C6E",
                backgroundColor: "#F8FAFD",
              }}
            >
              <option value="all">🌐 All Campuses &amp; Stream</option>
              <option value="jos">📍 Jos (House of Bread)</option>
              <option value="abuja">🏛️ Abuja Campus</option>
              <option value="online">📡 Online Stream</option>
            </select>
          </div>

          {/* Apply Dates Button */}
          <div style={{ alignSelf: "flex-end", marginTop: "auto" }}>
            <button
              onClick={handleApplyFilter}
              style={{
                backgroundColor: "#1F46C8",
                border: "none",
                borderRadius: "8px",
                padding: "9px 18px",
                fontWeight: 600,
                fontSize: "12.5px",
                color: "#FFFFFF",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
              }}
            >
              Compare Dates 🔍
            </button>
          </div>
        </div>

        {/* Search & Quick Filter Tabs */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderTop: "1px solid #F1F4FA", paddingTop: "12px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                setFilterType("all");
                fetchData(date1, date2, date3, campus, "all", search);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: filterType === "all" ? "#141C6E" : "#F4F6FB",
                color: filterType === "all" ? "#FFFFFF" : "#4A5490",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              All Attendees ({summary.totalAttendees})
            </button>

            <button
              onClick={() => {
                setFilterType("candidates");
                fetchData(date1, date2, date3, campus, "candidates", search);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: filterType === "candidates" ? "#D97706" : "#FEF3C7",
                color: filterType === "candidates" ? "#FFFFFF" : "#92400E",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>⭐</span> Prime Member Candidates ({summary.candidatesCount})
            </button>

            <button
              onClick={() => {
                setFilterType("walk_ins");
                fetchData(date1, date2, date3, campus, "walk_ins", search);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: filterType === "walk_ins" ? "#1F46C8" : "#F4F6FB",
                color: filterType === "walk_ins" ? "#FFFFFF" : "#4A5490",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Walk-ins Only ({summary.walkInsCount})
            </button>

            <button
              onClick={() => {
                setFilterType("members");
                fetchData(date1, date2, date3, campus, "members", search);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: filterType === "members" ? "#10B981" : "#E4F5EA",
                color: filterType === "members" ? "#FFFFFF" : "#0F6B38",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Official Members ({summary.membersCount})
            </button>
          </div>

          <div style={{ minWidth: "220px" }}>
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApplyFilter();
              }}
              style={{
                width: "100%",
                padding: "7px 12px",
                borderRadius: "8px",
                border: "1px solid #D5DCF2",
                fontSize: "12px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "14px 18px", border: "1px solid #E8EDFB", boxShadow: "0 1px 3px rgba(20,28,110,0.04)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Total Unique Attendees</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#141C6E", marginTop: "2px" }}>{summary.totalAttendees}</div>
          <div style={{ fontSize: "11.5px", color: "#6B7280", marginTop: "2px" }}>Across selected 3 dates</div>
        </div>

        <div style={{ backgroundColor: "#FFFBEB", borderRadius: "10px", padding: "14px 18px", border: "1px solid #FDE68A", boxShadow: "0 1px 3px rgba(20,28,110,0.04)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400E", textTransform: "uppercase" }}>⭐ Prime Candidates</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#B45309", marginTop: "2px" }}>{summary.candidatesCount}</div>
          <div style={{ fontSize: "11.5px", color: "#B45309", marginTop: "2px" }}>Walk-ins who attended 2+ services</div>
        </div>

        <div style={{ backgroundColor: "#F0FDF4", borderRadius: "10px", padding: "14px 18px", border: "1px solid #BBF7D0", boxShadow: "0 1px 3px rgba(20,28,110,0.04)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>100% Attendance (3/3)</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#15803D", marginTop: "2px" }}>{summary.perfectAttendanceCount}</div>
          <div style={{ fontSize: "11.5px", color: "#166534", marginTop: "2px" }}>Present at every service</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "14px 18px", border: "1px solid #E8EDFB", boxShadow: "0 1px 3px rgba(20,28,110,0.04)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Official Directory Members</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#1F46C8", marginTop: "2px" }}>{summary.membersCount}</div>
          <div style={{ fontSize: "11.5px", color: "#6B7280", marginTop: "2px" }}>Registered in church directory</div>
        </div>
      </div>

      {/* Comparison Table */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          border: "1px solid #E8EDFB",
          overflow: "hidden",
          boxShadow: "0 2px 6px rgba(20, 28, 110, 0.04)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12.5px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFD", borderBottom: "1.5px solid #E8EDFB" }}>
                <th style={{ padding: "12px 16px", color: "#4A5490", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Attendee</th>
                <th style={{ padding: "12px 14px", color: "#4A5490", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Type</th>
                <th style={{ padding: "12px 14px", color: "#4A5490", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Campus / Mode</th>
                <th style={{ padding: "12px 14px", color: "#4A5490", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>{date1}</th>
                <th style={{ padding: "12px 14px", color: "#4A5490", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>{date2}</th>
                <th style={{ padding: "12px 14px", color: "#4A5490", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>{date3}</th>
                <th style={{ padding: "12px 14px", color: "#4A5490", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>Consistency</th>
                <th style={{ padding: "12px 16px", color: "#4A5490", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", textAlign: "right" }}>Pastor Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
                    Loading historical attendance comparison...
                  </td>
                </tr>
              ) : attendees.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
                    No attendee records found matching the selected dates and filters.
                  </td>
                </tr>
              ) : (
                attendees.map((att) => {
                  return (
                    <tr
                      key={att.key}
                      style={{
                        borderBottom: "1px solid #F1F4FA",
                        backgroundColor: att.isCandidateForMembership ? "#FFFDF7" : "transparent",
                        transition: "background-color 0.1s ease",
                      }}
                    >
                      {/* Attendee Info */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              backgroundColor: att.isMember ? "#E4F5EA" : att.isCandidateForMembership ? "#FEF3C7" : "#F1F4FA",
                              color: att.isMember ? "#0F6B38" : att.isCandidateForMembership ? "#92400E" : "#141C6E",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "12px",
                              flexShrink: 0,
                            }}
                          >
                            {att.name ? att.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#141C6E", fontSize: "13px" }}>
                              {att.name}
                              {att.isCandidateForMembership && (
                                <span
                                  style={{
                                    marginLeft: "8px",
                                    fontSize: "10.5px",
                                    fontWeight: 700,
                                    color: "#92400E",
                                    backgroundColor: "#FEF3C7",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    border: "1px solid #FDE68A",
                                  }}
                                >
                                  ⭐ Candidate for Profile
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                              {att.phone && <span>📞 {att.phone}</span>}
                              {att.email && <span>✉️ {att.email}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Tag */}
                      <td style={{ padding: "14px 14px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 700,
                            backgroundColor: att.isMember ? "#E4F5EA" : "#FEF3C7",
                            color: att.isMember ? "#0F6B38" : "#92400E",
                            border: att.isMember ? "1px solid #C4EED0" : "1px solid #FDE68A",
                          }}
                        >
                          {att.isMember ? "✓ Member" : "Walk-in"}
                        </span>
                      </td>

                      {/* Campus / Mode */}
                      <td style={{ padding: "14px 14px", color: "#3B487A", fontSize: "12px" }}>
                        {att.campus}
                      </td>

                      {/* Date 1 Attendance */}
                      <td style={{ padding: "14px 14px" }}>
                        {att.date1Detail.attended ? (
                          <div style={{ display: "inline-flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ color: "#0F6B38", fontWeight: 700, fontSize: "12px" }}>
                              ✅ Attended
                            </span>
                            <span style={{ fontSize: "10.5px", color: "#64748B" }}>
                              {att.date1Detail.mode === "online" ? "Virtual Stream" : "In-Person"}
                              {att.date1Detail.time ? ` • ${att.date1Detail.time}` : ""}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "#94A3B8", fontSize: "12px" }}>— Absent</span>
                        )}
                      </td>

                      {/* Date 2 Attendance */}
                      <td style={{ padding: "14px 14px" }}>
                        {att.date2Detail.attended ? (
                          <div style={{ display: "inline-flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ color: "#0F6B38", fontWeight: 700, fontSize: "12px" }}>
                              ✅ Attended
                            </span>
                            <span style={{ fontSize: "10.5px", color: "#64748B" }}>
                              {att.date2Detail.mode === "online" ? "Virtual Stream" : "In-Person"}
                              {att.date2Detail.time ? ` • ${att.date2Detail.time}` : ""}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "#94A3B8", fontSize: "12px" }}>— Absent</span>
                        )}
                      </td>

                      {/* Date 3 Attendance */}
                      <td style={{ padding: "14px 14px" }}>
                        {att.date3Detail.attended ? (
                          <div style={{ display: "inline-flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ color: "#0F6B38", fontWeight: 700, fontSize: "12px" }}>
                              ✅ Attended
                            </span>
                            <span style={{ fontSize: "10.5px", color: "#64748B" }}>
                              {att.date3Detail.mode === "online" ? "Virtual Stream" : "In-Person"}
                              {att.date3Detail.time ? ` • ${att.date3Detail.time}` : ""}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "#94A3B8", fontSize: "12px" }}>— Absent</span>
                        )}
                      </td>

                      {/* Consistency */}
                      <td style={{ padding: "14px 14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "90px" }}>
                          <span style={{ fontWeight: 700, color: att.totalAttendedOutOf3 >= 2 ? "#0F6B38" : "#4A5490" }}>
                            {att.totalAttendedOutOf3} / 3 ({att.consistencyRate}%)
                          </span>
                          <div style={{ width: "100%", height: "5px", backgroundColor: "#E2E8F0", borderRadius: "3px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${att.consistencyRate}%`,
                                height: "100%",
                                backgroundColor: att.totalAttendedOutOf3 === 3 ? "#10B981" : att.totalAttendedOutOf3 === 2 ? "#F59E0B" : "#94A3B8",
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Pastor Action Button */}
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        {att.isMember ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "5px 12px",
                              borderRadius: "6px",
                              backgroundColor: "#F0FDF4",
                              color: "#166534",
                              fontSize: "11px",
                              fontWeight: 600,
                              border: "1px solid #BBF7D0",
                            }}
                          >
                            ✓ Official Member
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenCreateModal(att)}
                            style={{
                              backgroundColor: att.isCandidateForMembership ? "#1F46C8" : "#FFFFFF",
                              border: "1.5px solid #1F46C8",
                              color: att.isCandidateForMembership ? "#FFFFFF" : "#1F46C8",
                              padding: "6px 14px",
                              borderRadius: "7px",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              cursor: "pointer",
                              boxShadow: att.isCandidateForMembership ? "0 2px 6px rgba(31,70,200,0.25)" : "none",
                              transition: "all 0.15s ease",
                            }}
                          >
                            + Create Member Profile
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Member Profile Modal */}
      {targetCandidate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "26px",
              boxShadow: "0 10px 40px rgba(14, 21, 86, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Membership Onboarding
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#141C6E", margin: "2px 0 0" }}>
                  Create Church Member Profile
                </h3>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0" }}>
                  Promote {targetCandidate.name} ({targetCandidate.totalAttendedOutOf3}/3 services attended) into the official church members directory.
                </p>
              </div>
              <button
                onClick={() => setTargetCandidate(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  color: "#94A3B8",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                ✕
              </button>
            </div>

            {createMsg && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  backgroundColor: createMsg.startsWith("Error") ? "#FFF1F2" : "#E4F5EA",
                  color: createMsg.startsWith("Error") ? "#BE123C" : "#0F6B38",
                  border: createMsg.startsWith("Error") ? "1px solid #FECDD3" : "1px solid #C4EED0",
                }}
              >
                {createMsg}
              </div>
            )}

            <form onSubmit={handleCreateMemberSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={memberForm.displayName}
                  onChange={(e) => setMemberForm({ ...memberForm, displayName: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>
                    Email (Required for Login)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. member@gmail.com"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +234..."
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>
                    Campus
                  </label>
                  <select
                    value={memberForm.campus}
                    onChange={(e) => setMemberForm({ ...memberForm, campus: e.target.value as any })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", backgroundColor: "#F8FAFD", boxSizing: "border-box" }}
                  >
                    <option value="jos">Jos Headquarters</option>
                    <option value="abuja">Abuja Campus</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>
                    Ministry / Church Unit
                  </label>
                  <select
                    value={memberForm.assignedUnitId}
                    onChange={(e) => setMemberForm({ ...memberForm, assignedUnitId: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", backgroundColor: "#F8FAFD", boxSizing: "border-box" }}
                  >
                    <option value="none">Unassigned</option>
                    {UNITS.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>
                    Activity Tier
                  </label>
                  <select
                    value={memberForm.activityTier}
                    onChange={(e) => setMemberForm({ ...memberForm, activityTier: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", backgroundColor: "#F8FAFD", boxSizing: "border-box" }}
                  >
                    <option value="active">Active (Faithful Attendee)</option>
                    <option value="regular">Regular</option>
                    <option value="leader">Leader</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", marginBottom: "4px" }}>
                    Temporary Password
                  </label>
                  <input
                    type="text"
                    value={memberForm.password}
                    onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box", fontFamily: "monospace" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setTargetCandidate(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "8px",
                    border: "1px solid #D5DCF2",
                    backgroundColor: "#F8FAFD",
                    color: "#4A5490",
                    fontWeight: 600,
                    fontSize: "12.5px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingMember}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "12.5px",
                    cursor: creatingMember ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
                  }}
                >
                  {creatingMember ? "Creating Member..." : "Create Member Profile ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
