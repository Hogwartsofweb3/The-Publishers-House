"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { AtRiskMember, AttendanceRecordItem } from "@/app/api/portal/pastoral/at-risk/route";

// Dynamically import heavy comparison tab — only needed when "compare" tab is active
const AttendanceCompareTab = dynamic(
  () => import("@/components/portal/AttendanceCompareTab"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D5DCF2",
          borderRadius: "14px",
          padding: "48px 24px",
          textAlign: "center",
          color: "#64748B",
          fontSize: "13px",
        }}
      >
        Loading attendance comparison...
      </div>
    ),
  }
);

type VisitorStatus = "fading" | "new" | "followup" | "established";

interface Visitor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  firstVisitDate: string;
  assignedTo: string;
  notes: string;
  status: "new" | "followup" | "established";
  campus?: string;
  createdAt: string;
}

interface SelectedMemberProfile {
  name: string;
  phone: string;
  email?: string;
  campus?: string;
  status?: string;
  assignedTo?: string;
  notes?: string;
  totalAttended?: number;
  lastAttendedDate?: string;
  consecutiveMissed?: number;
  riskLevel?: "high" | "moderate";
  primaryMode?: "in_person" | "online";
  attendanceHistory?: AttendanceRecordItem[];
  recentServiceDates?: { date: string; attended: boolean }[];
  visitorId?: string;
  isAtRiskAttendee?: boolean;
}

const COLUMNS: {
  key: VisitorStatus;
  label: string;
  badgeBg: string;
  badgeColor: string;
  accentColor: string;
  desc: string;
}[] = [
  {
    key: "fading",
    label: "Fading Attendance / At-Risk",
    badgeBg: "#FFE4E6",
    badgeColor: "#9F1239",
    accentColor: "#E11D48",
    desc: "Active attendees with 3+ consecutive missed services since Nov 5th",
  },
  {
    key: "new",
    label: "First-Time Visitors",
    badgeBg: "#FFF2D6",
    badgeColor: "#7A5200",
    accentColor: "#F59E0B",
    desc: "Awaiting initial welcome call and hospitality connection",
  },
  {
    key: "followup",
    label: "In Shepherding Follow-Up",
    badgeBg: "#E8EDFB",
    badgeColor: "#1F46C8",
    accentColor: "#2563EB",
    desc: "Contacted, praying together, and invited to discipleship",
  },
  {
    key: "established",
    label: "Established & Integrated",
    badgeBg: "#E4F5EA",
    badgeColor: "#0F6B38",
    accentColor: "#10B981",
    desc: "Committed members, rostered in church units or cell groups",
  },
];

export default function PastoralCarePage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [atRiskMembers, setAtRiskMembers] = useState<AtRiskMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [atRiskLoading, setAtRiskLoading] = useState(true);
  const [campusFilter, setCampusFilter] = useState<"all" | "jos" | "abuja" | "online">("all");

  const [activeTab, setActiveTab] = useState<"pipeline" | "compare" | "at_risk_list" | "inquiries">("pipeline");

  // Read tab parameter from URL on load (e.g. /portal/pastoral?tab=compare)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam === "compare" || tabParam === "inquiries" || tabParam === "pipeline" || tabParam === "at_risk_list") {
        setActiveTab(tabParam as any);
      }
    }
  }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDrawerMember, setSelectedDrawerMember] = useState<SelectedMemberProfile | null>(null);
  const [notesEdit, setNotesEdit] = useState("");
  const [assignedPastorInput, setAssignedPastorInput] = useState("");
  const [msg, setMsg] = useState("");
  const [actionInProgress, setActionInProgress] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [inquiryNotes, setInquiryNotes] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("all");
  const [inquirySearch, setInquirySearch] = useState("");
  const [importingFirstTimers, setImportingFirstTimers] = useState(false);

  // Weekly Digest State
  const [showDigestModal, setShowDigestModal] = useState(false);
  const [digestLoading, setDigestLoading] = useState(false);
  const [latestDigest, setLatestDigest] = useState<any | null>(null);

  // Add Visitor Form
  const [form, setForm] = useState({
    name: "",
    phone: "",
    campus: "Jos Headquarters",
    firstVisitDate: new Date().toISOString().split("T")[0],
    assignedTo: "Pastoral Team",
    notes: "",
  });

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/visitors");
      if (res.ok) {
        const data = await res.json();
        if (data.visitors && Array.isArray(data.visitors)) {
          setVisitors(data.visitors);
          return;
        }
      }
      setVisitors([]);
    } catch (err) {
      console.warn("Could not load visitors:", err);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAtRiskMembers = async () => {
    setAtRiskLoading(true);
    try {
      const res = await fetch(`/api/portal/pastoral/at-risk?campus=${campusFilter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.members && Array.isArray(data.members)) {
          setAtRiskMembers(data.members);
        }
      }
    } catch (err) {
      console.warn("Could not load at-risk members:", err);
    } finally {
      setAtRiskLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const res = await fetch("/api/portal/inquiries");
      if (res.ok) {
        const data = await res.json();
        if (data.inquiries && Array.isArray(data.inquiries)) {
          setInquiries(data.inquiries);
        }
      }
    } catch (err) {
      console.warn("Could not load inquiries:", err);
    } finally {
      setInquiriesLoading(false);
    }
  };

  const loadWeeklyDigest = async () => {
    setDigestLoading(true);
    try {
      const res = await fetch("/api/portal/pastoral/digest");
      if (res.ok) {
        const data = await res.json();
        if (data.digest) {
          setLatestDigest(data.digest);
        }
      }
    } catch (err) {
      console.warn("Could not load weekly digest:", err);
    } finally {
      setDigestLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
    fetchInquiries();
    if (typeof window !== "undefined" && window.location.search.includes("tab=inquiries")) {
      setActiveTab("inquiries");
    }
  }, []);

  useEffect(() => {
    fetchAtRiskMembers();
  }, [campusFilter]);

  // Filter visitors by campus
  const filteredVisitors = useMemo(() => {
    if (campusFilter === "all") return visitors;
    return visitors.filter((v) => {
      const c = (v.campus || "").toLowerCase();
      if (campusFilter === "jos") return c.includes("jos") || !c;
      if (campusFilter === "abuja") return c.includes("abuja");
      if (campusFilter === "online") return c.includes("online");
      return true;
    });
  }, [visitors, campusFilter]);

  // Open Drawer for a Visitor or AtRisk member
  const handleOpenDrawer = (member: SelectedMemberProfile) => {
    setSelectedDrawerMember(member);
    setNotesEdit(member.notes || "");
    setAssignedPastorInput(member.assignedTo || "Pastoral Team");
  };

  // Move visitor stage
  const handleAdvanceVisitor = async (visitor: Visitor) => {
    const nextStatus: "followup" | "established" =
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
    setMsg(`${visitor.name} moved to ${nextStatus === "followup" ? "In Shepherding Follow-Up" : "Established & Integrated"} ✓`);
    setTimeout(() => setMsg(""), 3500);

    if (selectedDrawerMember?.visitorId === visitor.id) {
      setSelectedDrawerMember((prev) => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  // Move At-Risk member to Shepherding Follow-Up
  const handleMoveAtRiskToFollowup = async (member: AtRiskMember) => {
    setActionInProgress(true);
    try {
      const res = await fetch("/api/portal/pastoral/at-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move_to_followup",
          member,
          assignedTo: assignedPastorInput || member.assignedTo || "Pastoral Team",
          notes: notesEdit || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`${member.name} moved into Shepherding Follow-Up ✓`);
        await fetchVisitors();
        await fetchAtRiskMembers();
        if (selectedDrawerMember?.phone === member.phone) {
          setSelectedDrawerMember((prev) => prev ? { ...prev, status: "followup", inPipeline: true } : null);
        }
      } else {
        setMsg(`✗ ${data.error || "Failed to update pipeline"}`);
      }
    } catch (err: any) {
      setMsg(`✗ Network error: ${err.message}`);
    } finally {
      setActionInProgress(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  // Handover first-timer from Follow-Up to Discipleship & Evangelism unit
  const handleHandoverToDiscipleship = async (visitor: Visitor) => {
    if (!confirm(`Hand over ${visitor.name} to the Discipleship & Evangelism unit?\n\nThis will move them out of the Follow-Up pipeline.`)) return;
    try {
      await fetch("/api/portal/visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: visitor.id,
          status: "handed_over_to_discipleship",
          targetUnit: "discipleship_evangelism",
          handoverDate: new Date().toISOString(),
          handoverBy: assignedPastorInput || "Follow-Up Team",
        }),
      });
      setVisitors((prev) => prev.filter((v) => v.id !== visitor.id));
      setMsg(`${visitor.name} handed over to Discipleship & Evangelism ✦`);
      setTimeout(() => setMsg(""), 4000);
    } catch (err: any) {
      setMsg(`✗ Error: ${err.message}`);
    }
  };

  // Save Pastoral Notes from Drawer
  const handleSaveDrawerNotes = async () => {
    if (!selectedDrawerMember) return;
    setActionInProgress(true);
    try {
      if (selectedDrawerMember.visitorId) {
        // Update visitor record
        await fetch("/api/portal/visitors", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedDrawerMember.visitorId,
            notes: notesEdit,
            assignedTo: assignedPastorInput,
          }),
        });
        setVisitors((prev) =>
          prev.map((v) =>
            v.id === selectedDrawerMember.visitorId
              ? { ...v, notes: notesEdit, assignedTo: assignedPastorInput }
              : v
          )
        );
      } else {
        // Add note via at-risk API
        await fetch("/api/portal/pastoral/at-risk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add_note",
            member: selectedDrawerMember,
            notes: notesEdit,
            assignedTo: assignedPastorInput,
          }),
        });
        await fetchVisitors();
        await fetchAtRiskMembers();
      }

      setMsg("Pastoral shepherding notes updated ✓");
      setSelectedDrawerMember((prev) =>
        prev ? { ...prev, notes: notesEdit, assignedTo: assignedPastorInput } : null
      );
    } catch (err: any) {
      setMsg(`✗ Failed to save notes: ${err.message}`);
    } finally {
      setActionInProgress(false);
      setTimeout(() => setMsg(""), 3500);
    }
  };

  const handleDeleteVisitor = async (visitor: Visitor) => {
    if (!confirm(`Remove "${visitor.name}" from the pastoral care pipeline?`)) return;
    try {
      const res = await fetch(`/api/portal/visitors?id=${visitor.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVisitors((prev) => prev.filter((v) => v.id !== visitor.id));
        if (selectedDrawerMember?.visitorId === visitor.id) setSelectedDrawerMember(null);
        setMsg(`${visitor.name} removed from pipeline ✓`);
        setTimeout(() => setMsg(""), 3500);
      } else {
        const data = await res.json();
        setMsg(`✗ ${data.error || "Failed to remove visitor"}`);
      }
    } catch {
      setMsg("✗ Network error deleting visitor");
    }
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
        fetchVisitors();
      }
    } catch {
      fetchVisitors();
    }

    setShowAddModal(false);
    setForm({
      name: "",
      phone: "",
      campus: "Jos Headquarters",
      firstVisitDate: new Date().toISOString().split("T")[0],
      assignedTo: "Pastoral Team",
      notes: "",
    });
    setMsg("First-time visitor registered ✓");
    setTimeout(() => setMsg(""), 3500);
  };

  const handleImportFirstTimers = async () => {
    setImportingFirstTimers(true);
    setMsg("");
    try {
      const res = await fetch("/api/portal/pastoral/import-first-timers", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setMsg(data.message || `${data.imported} first-timer${data.imported !== 1 ? "s" : ""} imported ✓`);
      if (data.imported > 0) fetchVisitors();
      setTimeout(() => setMsg(""), 5000);
    } catch (err: any) {
      setMsg("Import failed: " + (err.message || "unknown error"));
      setTimeout(() => setMsg(""), 4000);
    } finally {
      setImportingFirstTimers(false);
    }
  };

  const handleTriggerDigest = async () => {
    setDigestLoading(true);
    try {
      const res = await fetch("/api/portal/pastoral/digest", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.digest) {
        setLatestDigest(data.digest);
        setShowDigestModal(true);
        setMsg("Weekly shepherding digest generated successfully ✓");
      } else {
        setMsg(`✗ ${data.error || "Failed to generate digest"}`);
      }
    } catch (err: any) {
      setMsg(`✗ Error: ${err.message}`);
    } finally {
      setDigestLoading(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: string, notes?: string) => {
    try {
      await fetch("/api/portal/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, pastoralNotes: notes }),
      });
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === id ? { ...inq, status, ...(notes !== undefined ? { pastoralNotes: notes } : {}) } : inq
        )
      );
      setMsg(`Inquiry marked as ${status} ✓`);
      setTimeout(() => setMsg(""), 3000);
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
    } catch {
      alert("Failed to update inquiry status");
    }
  };

  // High-risk count calculation for quick alert banner
  const highRiskMembersCount = useMemo(() => {
    return atRiskMembers.filter((m) => m.riskLevel === "high").length;
  }, [atRiskMembers]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "var(--font-poppins-family, 'Poppins', sans-serif)" }}>
      {/* Header Bar */}
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
              fontWeight: 800,
              fontSize: "26px",
              lineHeight: "32px",
              color: "#141C6E",
              margin: 0,
            }}
          >
            Pastoral Care & Shepherding
          </h1>
          <p
            style={{
              fontWeight: 500,
              fontSize: "13px",
              color: "#4A5490",
              margin: "6px 0 0",
            }}
          >
            Multi-day attendance analytics, automated fading member alerts, & assimilation pipeline
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {msg && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#0F6B38",
                backgroundColor: "#E4F5EA",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #C4EED0",
              }}
            >
              {msg}
            </span>
          )}

          {/* Generate Weekly Digest Button */}
          <button
            onClick={handleTriggerDigest}
            disabled={digestLoading}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #1F46C8",
              borderRadius: "10px",
              padding: "9px 15px",
              fontWeight: 600,
              fontSize: "12.5px",
              color: "#1F46C8",
              cursor: digestLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 1px 3px rgba(31,70,200,0.08)",
            }}
          >
            <span>📊</span>
            {digestLoading ? "Compiling..." : "Weekly Shepherding Digest"}
          </button>

          {/* Import First Timers */}
          <button
            onClick={handleImportFirstTimers}
            disabled={importingFirstTimers}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #D5DCF2",
              borderRadius: "10px",
              padding: "9px 15px",
              fontWeight: 600,
              fontSize: "12.5px",
              color: "#141C6E",
              cursor: importingFirstTimers ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>⬇️</span>
            {importingFirstTimers ? "Importing..." : "Import First-Timers"}
          </button>

          {/* Add Visitor Button */}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: "#1F46C8",
              border: "none",
              borderRadius: "10px",
              padding: "9px 16px",
              fontWeight: 600,
              fontSize: "12.5px",
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
            }}
          >
            + Add First-Time Visitor
          </button>
        </div>
      </div>

      {/* High-Risk Pastoral Alert Banner (when members missed 3+ consecutive services) */}
      {highRiskMembersCount > 0 && (
        <div
          style={{
            backgroundColor: "#FFF1F2",
            border: "1px solid #FECDD3",
            borderRadius: "12px",
            padding: "14px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "22px" }}>⚠️</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#9F1239" }}>
                {highRiskMembersCount} Congregation Member{highRiskMembersCount > 1 ? "s" : ""} Flagged for Fading Attendance (Missed 3+ Services)
              </div>
              <div style={{ fontSize: "12px", color: "#BE123C", marginTop: "2px" }}>
                Our attendance analytics detected members who were active in past services but have missed 3 or more consecutive gatherings. Pastors should initiate a caring check-in.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab("pipeline");
              const el = document.getElementById("col-fading");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              backgroundColor: "#9F1239",
              border: "none",
              borderRadius: "8px",
              color: "#FFFFFF",
              padding: "7px 14px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Review At-Risk Members →
          </button>
        </div>
      )}

      {/* Control Strip: Tabs & Campus Filter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E8EDFB",
          borderRadius: "12px",
          padding: "10px 16px",
        }}
      >
        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("pipeline")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "pipeline" ? "#1F46C8" : "transparent",
              color: activeTab === "pipeline" ? "#FFFFFF" : "#4A5490",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            🛡️ Shepherding & Visitor Pipeline
          </button>

          <button
            onClick={() => setActiveTab("compare")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "compare" ? "#1F46C8" : "transparent",
              color: activeTab === "compare" ? "#FFFFFF" : "#4A5490",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <span>📈 3-Date Compare & Member Promotion</span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "inquiries" ? "#1F46C8" : "transparent",
              color: activeTab === "inquiries" ? "#FFFFFF" : "#4A5490",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <span>📬 Member Inquiries & Units</span>
            {inquiries.filter((i) => i.status === "pending").length > 0 && (
              <span
                style={{
                  backgroundColor: "#F59E0B",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  padding: "1px 6px",
                  borderRadius: "99px",
                  fontWeight: 700,
                }}
              >
                {inquiries.filter((i) => i.status === "pending").length}
              </span>
            )}
          </button>
        </div>

        {/* Campus Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#4A5490" }}>Campus Filter:</span>
          <select
            value={campusFilter}
            onChange={(e) => setCampusFilter(e.target.value as any)}
            style={{
              padding: "7px 12px",
              borderRadius: "8px",
              border: "1px solid #D5DCF2",
              fontSize: "12.5px",
              color: "#141C6E",
              fontWeight: 600,
              backgroundColor: "#F8FAFD",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">🌐 All Campuses & Online</option>
            <option value="jos">📍 Jos Headquarters (House of Bread)</option>
            <option value="abuja">🏛️ Abuja Campus</option>
            <option value="online">📡 Online Stream Community</option>
          </select>
        </div>
      </div>

      {/* Main View: Kanban Pipeline */}
      {activeTab === "pipeline" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(280px, 1fr))",
            gap: "20px",
            alignItems: "start",
            overflowX: "auto",
            paddingBottom: "16px",
          }}
        >
          {COLUMNS.map((col) => {
            const isFadingCol = col.key === "fading";
            const colVisitors = filteredVisitors.filter((v) => v.status === col.key);
            const count = isFadingCol ? atRiskMembers.length : colVisitors.length;

            return (
              <div
                key={col.key}
                id={`col-${col.key}`}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: isFadingCol ? "1.5px solid #FECDD3" : "1px solid #D5DCF2",
                  borderRadius: "14px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  minHeight: "580px",
                  boxShadow: isFadingCol ? "0 4px 16px rgba(225, 29, 72, 0.05)" : "0 2px 8px rgba(14,21,86,0.03)",
                }}
              >
                {/* Column Header */}
                <div style={{ borderBottom: "1px solid #E8EDFB", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2
                      style={{
                        fontSize: "14.5px",
                        fontWeight: 700,
                        color: isFadingCol ? "#9F1239" : "#141C6E",
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {isFadingCol && <span>⚠️</span>}
                      {col.label}
                    </h2>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "99px",
                        backgroundColor: col.badgeBg,
                        color: col.badgeColor,
                        fontSize: "12px",
                        fontWeight: 800,
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#4A5490", margin: "4px 0 0", lineHeight: 1.4 }}>
                    {col.desc}
                  </p>
                </div>

                {/* Cards List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                  {/* Fading Attendance Column */}
                  {isFadingCol && (
                    <>
                      {atRiskLoading && (
                        <div style={{ padding: "30px", textAlign: "center", color: "#747CA1", fontSize: "12px" }}>
                          Scanning historical attendance records...
                        </div>
                      )}
                      {!atRiskLoading && atRiskMembers.length === 0 && (
                        <div style={{ padding: "40px 16px", textAlign: "center", color: "#0F6B38", backgroundColor: "#F0FDF4", borderRadius: "10px", fontSize: "12.5px" }}>
                          ✓ No members currently at risk of fading attendance!
                        </div>
                      )}
                      {atRiskMembers.map((member) => (
                        <div
                          key={member.id}
                          onClick={() =>
                            handleOpenDrawer({
                              name: member.name,
                              phone: member.phone,
                              email: member.email,
                              campus: member.primaryCampus,
                              status: member.pipelineStatus || "fading",
                              assignedTo: member.assignedTo || "Pastoral Team",
                              notes: member.notes,
                              totalAttended: member.totalAttended,
                              lastAttendedDate: member.lastAttendedDate,
                              consecutiveMissed: member.consecutiveMissed,
                              riskLevel: member.riskLevel,
                              primaryMode: member.primaryMode,
                              attendanceHistory: member.attendanceHistory,
                              recentServiceDates: member.recentServiceDates,
                              visitorId: member.visitorId,
                              isAtRiskAttendee: true,
                            })
                          }
                          style={{
                            backgroundColor: "#FFF8F8",
                            border: member.riskLevel === "high" ? "1.5px solid #FCA5A5" : "1px solid #FECDD3",
                            borderRadius: "10px",
                            padding: "14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(159, 18, 57, 0.06)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#141C6E" }}>
                                {member.name}
                              </div>
                              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                                Last seen: <strong>{member.lastAttendedDate}</strong>
                              </div>
                            </div>
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: "6px",
                                backgroundColor: member.riskLevel === "high" ? "#FEE2E2" : "#FEF3C7",
                                color: member.riskLevel === "high" ? "#991B1B" : "#92400E",
                                fontSize: "10.5px",
                                fontWeight: 700,
                              }}
                            >
                              Missed {member.consecutiveMissed} Services
                            </span>
                          </div>

                          {/* Campus & Mode Indicator */}
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#E8EDFB", color: "#1F46C8", fontWeight: 600 }}>
                              {member.primaryCampus}
                            </span>
                            <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#F1F5F9", color: "#475569", fontWeight: 600 }}>
                              {member.primaryMode === "online" ? "📡 Online" : "🏛️ In-Person"}
                            </span>
                            <span style={{ fontSize: "10px", color: "#64748B" }}>
                              • {member.totalAttended} total service{member.totalAttended !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Quick Contact & Action Buttons */}
                          <div style={{ display: "flex", gap: "8px", marginTop: "6px", alignItems: "center" }}>
                            <a
                              href={`tel:${member.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#1F46C8",
                                textDecoration: "none",
                                padding: "4px 8px",
                                backgroundColor: "#FFFFFF",
                                borderRadius: "6px",
                                border: "1px solid #D5DCF2",
                              }}
                            >
                              📞 Call
                            </a>
                            <a
                              href={`https://wa.me/${member.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Hello ${member.name}, we missed you in church at The Publishers House! Hope you are doing well and having a blessed week. We are praying for you and look forward to fellowshipping together soon. — Pastoral Care Team`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#0F6B38",
                                textDecoration: "none",
                                padding: "4px 8px",
                                backgroundColor: "#FFFFFF",
                                borderRadius: "6px",
                                border: "1px solid #C4EED0",
                              }}
                            >
                              💬 WhatsApp
                            </a>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveAtRiskToFollowup(member);
                              }}
                              style={{
                                marginLeft: "auto",
                                padding: "4px 10px",
                                backgroundColor: "#1F46C8",
                                border: "none",
                                borderRadius: "6px",
                                color: "#FFFFFF",
                                fontSize: "11px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              To Follow-Up →
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Standard Visitor Pipeline Columns: new, followup, established */}
                  {!isFadingCol && (
                    <>
                      {loading && (
                        <div style={{ padding: "30px", textAlign: "center", color: "#747CA1", fontSize: "12px" }}>
                          Loading contacts...
                        </div>
                      )}
                      {!loading && colVisitors.length === 0 && (
                        <div style={{ padding: "40px 16px", textAlign: "center", color: "#747CA1", fontSize: "12.5px" }}>
                          No contacts currently in this stage.
                        </div>
                      )}
                      {colVisitors.map((v) => (
                        <div
                          key={v.id}
                          onClick={() =>
                            handleOpenDrawer({
                              name: v.name,
                              phone: v.phone,
                              email: v.email,
                              campus: v.campus || "Jos Headquarters",
                              status: v.status,
                              assignedTo: v.assignedTo,
                              notes: v.notes,
                              lastAttendedDate: v.firstVisitDate,
                              visitorId: v.id,
                              isAtRiskAttendee: false,
                            })
                          }
                          style={{
                            backgroundColor: "#F8FAFD",
                            border: "1px solid #E8EDFB",
                            borderRadius: "10px",
                            padding: "14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            boxShadow: "0 1px 2px rgba(14, 21, 86, 0.04)",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#141C6E" }}>
                                {v.name}
                              </div>
                              <div style={{ fontSize: "11px", color: "#4A5490", marginTop: "2px" }}>
                                Visited: {v.firstVisitDate}
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  backgroundColor: "#E8EDFB",
                                  color: "#1F46C8",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                }}
                              >
                                {v.assignedTo || "Pastoral Team"}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteVisitor(v);
                                }}
                                title={`Remove ${v.name} from pipeline`}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#94A3B8",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  padding: "2px 4px",
                                  borderRadius: "4px",
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          {/* Direct Links */}
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <a
                              href={`tel:${v.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{ fontSize: "11.5px", fontWeight: 600, color: "#1F46C8", textDecoration: "none" }}
                            >
                              📞 {v.phone}
                            </a>
                            <a
                              href={`https://wa.me/${v.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ fontSize: "11px", fontWeight: 600, color: "#0F6B38", textDecoration: "none" }}
                            >
                              💬 WhatsApp
                            </a>
                          </div>

                          {/* Notes Snippet */}
                          {v.notes && (
                            <div
                              style={{
                                fontSize: "11.5px",
                                color: "#4A5490",
                                backgroundColor: "#FFFFFF",
                                padding: "6px 8px",
                                borderRadius: "6px",
                                border: "1px solid #E8EDFB",
                                lineHeight: "15px",
                              }}
                            >
                              &ldquo;{v.notes.length > 70 ? v.notes.slice(0, 70) + "..." : v.notes}&rdquo;
                            </div>
                          )}

                          {/* Actions */}
                          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDrawer({
                                  name: v.name,
                                  phone: v.phone,
                                  email: v.email,
                                  campus: v.campus || "Jos Headquarters",
                                  status: v.status,
                                  assignedTo: v.assignedTo,
                                  notes: v.notes,
                                  lastAttendedDate: v.firstVisitDate,
                                  visitorId: v.id,
                                  isAtRiskAttendee: false,
                                });
                              }}
                              style={{
                                flex: 1,
                                padding: "6px 10px",
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #D5DCF2",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#141C6E",
                                cursor: "pointer",
                              }}
                            >
                              Timeline & Notes
                            </button>

                            {col.key !== "established" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdvanceVisitor(v);
                                }}
                                style={{
                                  flex: 1.2,
                                  padding: "6px 10px",
                                  backgroundColor: col.key === "new" ? "#1F46C8" : "#0F6B38",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  color: "#FFFFFF",
                                  cursor: "pointer",
                                }}
                              >
                                {col.key === "new" ? "To Follow-Up →" : "Establish ✓"}
                              </button>
                            )}

                            {/* Handover to Discipleship — only on followup column */}
                            {col.key === "followup" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleHandoverToDiscipleship(v);
                                }}
                                style={{
                                  flex: 1.2,
                                  padding: "6px 10px",
                                  backgroundColor: "#7C3AED",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  color: "#FFFFFF",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                }}
                                title="Transfer this person to the Discipleship & Evangelism unit"
                              >
                                Handover ✦
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3-Date Historical Attendance Comparison & Member Promotion Tab */}
      {activeTab === "compare" && (
        <AttendanceCompareTab initialCampus={campusFilter} />
      )}

      {/* Member Inquiries & Unit Applications Tab */}
      {activeTab === "inquiries" && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D5DCF2", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 10px rgba(14,21,86,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search member, unit, or phone..."
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", minWidth: "260px" }}
              />
              <select
                value={inquiryStatusFilter}
                onChange={(e) => setInquiryStatusFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E" }}
              >
                <option value="all">All Inquiries</option>
                <option value="pending">⏳ Pending Review</option>
                <option value="contacted">📞 Contacted</option>
                <option value="resolved">✓ Resolved</option>
              </select>
            </div>
            <button
              onClick={fetchInquiries}
              style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#F4F6FB", color: "#141C6E", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" }}
            >
              ↻ Refresh Inquiries
            </button>
          </div>

          {inquiriesLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>Loading member inquiries...</div>
          ) : inquiries.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748B" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📬</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#141C6E" }}>No Pastoral Inquiries Yet</div>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>When members inquire with the pastorate or apply to join service units, they appear here.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {inquiries
                .filter((inq) => {
                  if (inquiryStatusFilter !== "all" && inq.status !== inquiryStatusFilter) return false;
                  if (inquirySearch.trim()) {
                    const q = inquirySearch.toLowerCase();
                    return (
                      inq.memberName?.toLowerCase().includes(q) ||
                      inq.memberEmail?.toLowerCase().includes(q) ||
                      inq.memberPhone?.includes(q) ||
                      inq.targetUnit?.toLowerCase().includes(q) ||
                      inq.subject?.toLowerCase().includes(q)
                    );
                  }
                  return true;
                })
                .map((inq) => {
                  const isPending = inq.status === "pending";
                  const isContacted = inq.status === "contacted";
                  const dateStr = inq.createdAt ? new Date(inq.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

                  return (
                    <div
                      key={inq.id}
                      style={{
                        border: isPending ? "2px solid #F59E0B" : "1px solid #D5DCF2",
                        borderRadius: "10px",
                        padding: "18px",
                        backgroundColor: isPending ? "#FFFDF7" : "#FFFFFF",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px", backgroundColor: "#EEF2FB", color: "#1F46C8", marginRight: "8px" }}>
                            {inq.category}
                          </span>
                          {inq.targetUnit && (
                            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px", backgroundColor: "#FEF3C7", color: "#92400E", marginRight: "8px" }}>
                              Unit: {inq.targetUnit}
                            </span>
                          )}
                          <strong style={{ fontSize: "15px", color: "#0E1556" }}>{inq.subject}</strong>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: "12px",
                              backgroundColor: isPending ? "#FEF3C7" : isContacted ? "#EFF6FF" : "#ECFDF5",
                              color: isPending ? "#92400E" : isContacted ? "#1E40AF" : "#065F46",
                            }}
                          >
                            {isPending ? "⏳ Pending Review" : isContacted ? "📞 In Follow-Up" : "✓ Resolved"}
                          </span>
                          <span style={{ fontSize: "11px", color: "#94A3B8" }}>{dateStr}</span>
                        </div>
                      </div>

                      {/* Member Strip */}
                      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#4A5490", flexWrap: "wrap", backgroundColor: "#F8FAFD", padding: "8px 12px", borderRadius: "6px" }}>
                        <div><strong>Member:</strong> {inq.memberName}</div>
                        {inq.memberEmail && <div><strong>Email:</strong> {inq.memberEmail}</div>}
                        {inq.memberPhone && <div><strong>Phone / WhatsApp:</strong> {inq.memberPhone}</div>}
                        <div><strong>Preferred Channel:</strong> {inq.preferredContact || "WhatsApp"}</div>
                        <div><strong>Campus:</strong> {inq.campus || "Jos"}</div>
                      </div>

                      <p style={{ fontSize: "13px", color: "#334155", margin: "4px 0", lineHeight: 1.6 }}>
                        {inq.message}
                      </p>

                      {inq.pastoralNotes && (
                        <div style={{ backgroundColor: "#F1F5F9", padding: "10px 14px", borderRadius: "6px", fontSize: "12.5px", color: "#1E293B", borderLeft: "3px solid #1F46C8" }}>
                          <strong>Pastoral Note:</strong> {inq.pastoralNotes}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "10px", marginTop: "6px", flexWrap: "wrap" }}>
                        {isPending && (
                          <button
                            onClick={() => handleUpdateInquiryStatus(inq.id, "contacted")}
                            style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #BFDBFE", backgroundColor: "#EFF6FF", color: "#1D4ED8", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                          >
                            📞 Mark as Contacted
                          </button>
                        )}
                        {inq.status !== "resolved" && (
                          <button
                            onClick={() => handleUpdateInquiryStatus(inq.id, "resolved")}
                            style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #BBF7D0", backgroundColor: "#F0FDF4", color: "#15803D", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                          >
                            ✓ Mark as Resolved
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setInquiryNotes(inq.pastoralNotes || "");
                          }}
                          style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", color: "#141C6E", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                        >
                          ✎ Add / Edit Note
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* MEMBER SHEPHERDING DRAWER & MULTI-DAY TIMELINE (SLIDE-OVER) */}
      {selectedDrawerMember && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setSelectedDrawerMember(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FFFFFF",
              width: "100%",
              maxWidth: "540px",
              height: "100%",
              boxShadow: "-8px 0 32px rgba(14, 21, 86, 0.2)",
              display: "flex",
              flexDirection: "column",
              animation: "slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              overflowY: "auto",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid #E8EDFB",
                backgroundColor: "#F8FAFD",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#1F46C8",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  >
                    {selectedDrawerMember.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#141C6E", margin: 0 }}>
                      {selectedDrawerMember.name}
                    </h2>
                    <div style={{ fontSize: "12px", color: "#4A5490", marginTop: "2px" }}>
                      {selectedDrawerMember.phone || "No phone provided"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDrawerMember(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "22px",
                    color: "#94A3B8",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Status & Risk Badges */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    backgroundColor: "#E8EDFB",
                    color: "#1F46C8",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {selectedDrawerMember.campus || "Jos Headquarters"}
                </span>

                {selectedDrawerMember.consecutiveMissed !== undefined && selectedDrawerMember.consecutiveMissed >= 2 && (
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "6px",
                      backgroundColor: selectedDrawerMember.riskLevel === "high" ? "#FEE2E2" : "#FEF3C7",
                      color: selectedDrawerMember.riskLevel === "high" ? "#991B1B" : "#92400E",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    ⚠️ {selectedDrawerMember.consecutiveMissed} Services Missed ({selectedDrawerMember.riskLevel === "high" ? "High Risk" : "Moderate Risk"})
                  </span>
                )}

                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    backgroundColor: "#F1F5F9",
                    color: "#475569",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  Stage: {selectedDrawerMember.status || "Visitor"}
                </span>
              </div>
            </div>

            {/* Quick Action Contact Bar */}
            <div
              style={{
                padding: "14px 24px",
                borderBottom: "1px solid #E8EDFB",
                display: "flex",
                gap: "10px",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
              }}
            >
              <a
                href={`https://wa.me/${selectedDrawerMember.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Hello ${selectedDrawerMember.name}, greetings from The Publishers House! Hope you are having a blessed week. We missed you at our recent services and wanted to check in on you. Please let us know if there is anything we can stand with you in prayer for! — Pastoral Care Team`
                )}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "9px 14px",
                  backgroundColor: "#E4F5EA",
                  color: "#0F6B38",
                  border: "1px solid #C4EED0",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <span>💬</span> WhatsApp Message
              </a>

              <a
                href={`tel:${selectedDrawerMember.phone}`}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "9px 14px",
                  backgroundColor: "#EEF2FB",
                  color: "#1F46C8",
                  border: "1px solid #D5DCF2",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <span>📞</span> Call Member
              </a>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
              {/* Multi-Day Attendance Analytics Summary */}
              <div>
                <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>
                  Multi-Day Attendance Metrics
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div style={{ backgroundColor: "#F8FAFD", border: "1px solid #E8EDFB", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#1F46C8" }}>
                      {selectedDrawerMember.totalAttended ?? (selectedDrawerMember.isAtRiskAttendee ? "1+" : "1")}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>Total Attended</div>
                  </div>

                  <div style={{ backgroundColor: "#F8FAFD", border: "1px solid #E8EDFB", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#141C6E" }}>
                      {selectedDrawerMember.lastAttendedDate || "N/A"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>Last Service</div>
                  </div>

                  <div style={{ backgroundColor: "#F8FAFD", border: "1px solid #E8EDFB", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F6B38" }}>
                      {selectedDrawerMember.primaryMode === "online" ? "📡 Online" : "🏛️ In-Person"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>Primary Mode</div>
                  </div>
                </div>
              </div>

              {/* Multi-Day Timeline Breakdown */}
              <div>
                <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>
                  Multi-Day Attendance Timeline
                </h3>
                {selectedDrawerMember.attendanceHistory && selectedDrawerMember.attendanceHistory.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {selectedDrawerMember.attendanceHistory.map((rec, idx) => (
                      <div
                        key={rec.id || idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          backgroundColor: "#F8FAFD",
                          border: "1px solid #E8EDFB",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "16px" }}>
                            {rec.mode === "online" ? "📡" : "🏛️"}
                          </span>
                          <div>
                            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#141C6E" }}>
                              {rec.date}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748B" }}>
                              {rec.location} {rec.streamChannel !== "none" ? `(${rec.streamChannel})` : ""}
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            backgroundColor: "#E4F5EA",
                            color: "#0F6B38",
                          }}
                        >
                          ✓ Present
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "16px", backgroundColor: "#F8FAFD", borderRadius: "8px", fontSize: "12px", color: "#64748B", textAlign: "center" }}>
                    Initial visit recorded on {selectedDrawerMember.lastAttendedDate || "recent gathering"}. Check-in verification code confirmed.
                  </div>
                )}
              </div>

              {/* Pastoral Follow-up & Shepherding Assignment */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
                  Assigned Minister / Pastor
                </h3>
                <input
                  type="text"
                  value={assignedPastorInput}
                  onChange={(e) => setAssignedPastorInput(e.target.value)}
                  placeholder="e.g. Pastor Damilare, Minister Sharon"
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #D5DCF2",
                    fontSize: "13px",
                    color: "#141C6E",
                    outline: "none",
                  }}
                />
              </div>

              {/* Pastoral Counseling & Follow-Up Notes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
                  Pastoral Care Notes & Action History
                </h3>
                <textarea
                  rows={5}
                  value={notesEdit}
                  onChange={(e) => setNotesEdit(e.target.value)}
                  placeholder="Log pastoral calls, prayer items, spiritual state, or visit summaries..."
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #D5DCF2",
                    fontSize: "12.5px",
                    color: "#141C6E",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {/* Quick Pipeline Transition Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto" }}>
                <button
                  onClick={handleSaveDrawerNotes}
                  disabled={actionInProgress}
                  style={{
                    padding: "11px",
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: actionInProgress ? "not-allowed" : "pointer",
                  }}
                >
                  {actionInProgress ? "Saving..." : "Save Shepherding Notes & Minister"}
                </button>

                {selectedDrawerMember.status !== "followup" && (
                  <button
                    onClick={() => {
                      if (selectedDrawerMember.visitorId) {
                        const v = visitors.find((vis) => vis.id === selectedDrawerMember.visitorId);
                        if (v) handleAdvanceVisitor(v);
                      } else {
                        handleMoveAtRiskToFollowup(selectedDrawerMember as any);
                      }
                    }}
                    style={{
                      padding: "11px",
                      backgroundColor: "#EEF2FB",
                      color: "#1F46C8",
                      border: "1px solid #D5DCF2",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    Move to &ldquo;In Shepherding Follow-Up&rdquo;
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY SHEPHERDING DIGEST MODAL */}
      {showDigestModal && latestDigest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowDigestModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "680px",
              width: "100%",
              boxShadow: "0 12px 40px rgba(14,21,86,0.2)",
              maxHeight: "90vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Automated Weekly Digest
                </span>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#141C6E", margin: "4px 0 0" }}>
                  Weekly Shepherding & Attendance Digest
                </h2>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                  Period: <strong>{latestDigest.period}</strong> · Generated {new Date(latestDigest.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              <button
                onClick={() => setShowDigestModal(false)}
                style={{ background: "none", border: "none", fontSize: "22px", color: "#94A3B8", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Digest Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              <div style={{ backgroundColor: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#9F1239" }}>
                  {latestDigest.highRiskCount}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#9F1239", marginTop: "2px" }}>
                  High Risk (Missed 3+ Services)
                </div>
              </div>

              <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#B45309" }}>
                  {latestDigest.moderateRiskCount}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#B45309", marginTop: "2px" }}>
                  Moderate Risk (Missed 2 Services)
                </div>
              </div>

              <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#15803D" }}>
                  {latestDigest.totalTrackedAttendees}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#15803D", marginTop: "2px" }}>
                  Attendees Tracked
                </div>
              </div>
            </div>

            {/* High-Risk Members List */}
            <div>
              <h3 style={{ fontSize: "13.5px", fontWeight: 700, color: "#141C6E", marginBottom: "10px" }}>
                Members Requiring Immediate Pastoral Outreach ({latestDigest.highRiskMembers?.length || 0})
              </h3>
              {latestDigest.highRiskMembers && latestDigest.highRiskMembers.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
                  {latestDigest.highRiskMembers.map((m: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 14px",
                        backgroundColor: "#FFF8F8",
                        border: "1px solid #FEE2E2",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#141C6E" }}>{m.name}</div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>
                          {m.phone} · {m.campus} · Last seen: {m.lastAttendedDate}
                        </div>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#991B1B", backgroundColor: "#FEE2E2", padding: "3px 8px", borderRadius: "6px" }}>
                        Missed {m.consecutiveMissed}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "#0F6B38", backgroundColor: "#F0FDF4", borderRadius: "8px", fontSize: "12px" }}>
                  ✓ All members have maintained regular attendance!
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button
                onClick={() => {
                  const summaryText = `The Publishers House — Weekly Pastoral Shepherding Digest\nPeriod: ${latestDigest.period}\nHigh-Risk Members (Missed 3+ Services): ${latestDigest.highRiskCount}\nModerate-Risk (Missed 2 Services): ${latestDigest.moderateRiskCount}\n\nHigh-Risk Outreach List:\n${latestDigest.highRiskMembers?.map((m: any) => `- ${m.name} (${m.phone}, ${m.campus}) — Missed ${m.consecutiveMissed} services`).join("\n")}`;
                  navigator.clipboard.writeText(summaryText);
                  setMsg("Digest copied to clipboard ✓");
                  setTimeout(() => setMsg(""), 3000);
                }}
                style={{
                  padding: "9px 16px",
                  borderRadius: "8px",
                  border: "1px solid #D5DCF2",
                  backgroundColor: "#FFFFFF",
                  color: "#141C6E",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📋 Copy Summary for Pastoral Meeting
              </button>
              <button
                onClick={() => setShowDigestModal(false)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pastoral Note Edit Modal for Inquiries */}
      {selectedInquiry && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(14,21,86,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", padding: "28px", maxWidth: "520px", width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 800, color: "#141C6E" }}>Pastoral Note for {selectedInquiry.memberName}</h3>
            <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#64748B" }}>Record your conversation notes, spiritual counseling summary, or next action steps.</p>
            <textarea
              rows={4}
              value={inquiryNotes}
              onChange={(e) => setInquiryNotes(e.target.value)}
              placeholder="e.g. Spoke with brother Michael on WhatsApp. Assigned to Media Head for orientation..."
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box", fontFamily: "inherit" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button
                onClick={() => setSelectedInquiry(null)}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", color: "#64748B", fontSize: "13px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, selectedInquiry.status, inquiryNotes)}
                style={{ padding: "8px 18px", borderRadius: "8px", border: "none", backgroundColor: "#1F46C8", color: "#FFFFFF", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
              >
                Save Note
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
            <h2 style={{ fontWeight: 800, fontSize: "20px", color: "#141C6E", margin: "0 0 6px" }}>
              Register First-Time Visitor
            </h2>
            <p style={{ fontSize: "12px", color: "#4A5490", margin: "0 0 24px" }}>
              Capture guest slip info from Sunday or Midweek service
            </p>

            <form onSubmit={handleAddVisitor} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tobiloba Alabi"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>First Visit Date</label>
                  <input
                    type="date"
                    required
                    value={form.firstVisitDate}
                    onChange={(e) => setForm({ ...form, firstVisitDate: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Campus</label>
                <select
                  value={form.campus}
                  onChange={(e) => setForm({ ...form, campus: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", backgroundColor: "#FFFFFF" }}
                >
                  <option value="Jos Headquarters">Jos Headquarters (House of Bread)</option>
                  <option value="Abuja Campus">Abuja Campus</option>
                  <option value="Online Community">Online Stream Community</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Assigned Pastor / Follow-Up Minister</label>
                <input
                  type="text"
                  placeholder="e.g. Pastor Damilare, Sister Ibidun"
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Initial Notes / How they heard about TPH</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Invited by neighbour; interested in Choir; requested prayer for family."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", resize: "vertical" }}
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
