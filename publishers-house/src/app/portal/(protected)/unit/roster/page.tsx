"use client";

import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { PortalUser, UNITS, normalizeUnitId } from "@/lib/portalAuth";
import { usePortal } from "@/lib/portalContext";
import { collection, query, where, getDocs } from "firebase/firestore";

interface RosterAssignment {
  id?: string;
  unitId: string;
  serviceName: string;
  serviceDate: string;
  memberName: string;
  memberUid: string;
  dutyRole: string;
  status: "confirmed" | "scheduled" | "swapped";
  notes?: string;
}

export default function UnitRosterPage() {
  const { effectiveUser } = usePortal();
  const user = effectiveUser;
  const normUnitId = normalizeUnitId(effectiveUser?.assignedUnitId) || "ushering";
  const activeUnit = UNITS.find((u) => u.id === normUnitId) || UNITS[0];

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<PortalUser[]>([]);
  const [allMembers, setAllMembers] = useState<PortalUser[]>([]);
  const [roster, setRoster] = useState<RosterAssignment[]>([]);
  const [allRosters, setAllRosters] = useState<RosterAssignment[]>([]);

  // Form
  const [serviceName, setServiceName] = useState("Sunday Word & Worship Celebration (9:00 AM WAT)");
  const [customServiceName, setCustomServiceName] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [dutyRole, setDutyRole] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Add Member to Unit Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchMemberTerm, setSearchMemberTerm] = useState("");
  const [addingMemberUid, setAddingMemberUid] = useState<string | null>(null);

  const fetchUnitData = useCallback(async (unitId: string) => {
    setLoading(true);
    try {
      const targetUnitId = normalizeUnitId(unitId);
      let mList: PortalUser[] = [];
      try {
        const res = await fetch("/api/portal/members");
        if (res.ok) {
          const data = await res.json();
          const memberArr: PortalUser[] = data.members || [];
          setAllMembers(memberArr);
          mList = memberArr.filter((u) => normalizeUnitId(u.assignedUnitId) === targetUnitId);
        }
      } catch {
        // Fallback to client SDK
      }

      if (mList.length === 0) {
        try {
          const mq = query(collection(db, "users"), where("assignedUnitId", "==", targetUnitId));
          const msnap = await getDocs(mq);
          mList = msnap.docs.map((d) => d.data() as PortalUser);
        } catch {
          // Firestore quota reached
        }
      }

      setMembers(mList);
      if (mList.length > 0) {
        setSelectedMember(mList[0].displayName || mList[0].email);
      } else {
        setSelectedMember("");
      }

      // Fetch unit roster — via Admin SDK API (bypasses Firestore permission restrictions)
      try {
        const rRes = await fetch(`/api/portal/unit/roster?unitId=${encodeURIComponent(targetUnitId)}`);
        if (rRes.ok) {
          const rData = await rRes.json();
          const rList = (rData.roster || []) as RosterAssignment[];
          rList.sort((a, b) => (a.serviceDate > b.serviceDate ? -1 : 1));
          setRoster(rList);
        }
      } catch (err) {
        console.warn("Could not load unit roster:", err);
      }

      // Fetch all assignments for cross-unit conflict detection
      try {
        const allRes = await fetch("/api/portal/unit/roster?all=true");
        if (allRes.ok) {
          const allData = await allRes.json();
          setAllRosters((allData.roster || []) as RosterAssignment[]);
        }
      } catch {
        // non-critical fallback
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Next Sunday default
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
    setServiceDate(d.toISOString().split("T")[0]);

    if (normUnitId) {
      fetchUnitData(normUnitId);
    }
  }, [normUnitId, fetchUnitData]);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!normUnitId || !selectedMember || !dutyRole.trim() || !serviceDate) return;
    setSaving(true);
    setMsg("");
    try {
      const mem = members.find((m) => m.displayName === selectedMember || m.email === selectedMember);

      // Conflict warning check before saving
      const existingCrossUnit = allRosters.find(
        (other) =>
          other.serviceDate === serviceDate &&
          normalizeUnitId(other.unitId) !== normalizeUnitId(normUnitId) &&
          ((other.memberUid && mem?.uid && other.memberUid === mem.uid) ||
            other.memberName.toLowerCase().trim() === selectedMember.toLowerCase().trim())
      );

      if (existingCrossUnit) {
        const otherUnitName = UNITS.find((u) => normalizeUnitId(u.id) === normalizeUnitId(existingCrossUnit.unitId))?.name || existingCrossUnit.unitId;
        const proceed = confirm(
          `⚠️ ROSTER CONFLICT WARNING:\n\n${selectedMember} is ALREADY assigned to ${otherUnitName} on ${serviceDate} (${existingCrossUnit.dutyRole}).\n\nDo you still want to schedule them for ${activeUnit?.name || "this unit"}?`
        );
        if (!proceed) {
          setSaving(false);
          return;
        }
      }

      const resolvedServiceName = serviceName === "custom"
        ? (customServiceName.trim() || "Special Church Program")
        : serviceName;

      const res = await fetch("/api/portal/unit/roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: normUnitId,
          serviceName: resolvedServiceName,
          serviceDate,
          memberName: selectedMember,
          memberUid: mem?.uid || "",
          dutyRole: dutyRole.trim(),
          notes: notes.trim() || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign duty");

      // Dispatch in-portal notification to the scheduled member
      if (mem?.uid || mem?.email) {
        fetch("/api/portal/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            targetUserId: mem?.uid || "",
            targetEmail: mem?.email || "",
            title: "Sunday Duty Assignment 📋",
            message: `You are scheduled for ${dutyRole.trim()} duty in ${activeUnit?.name || "your unit"} on ${serviceDate} (${serviceName}).`,
            type: "duty_assigned",
            link: "/portal/unit/roster",
          }),
        }).catch(() => {});
      }

      setMsg("Duty assigned successfully ✓");
      setDutyRole("");
      setNotes("");
      fetchUnitData(normUnitId);
      setTimeout(() => setMsg(""), 4000);
    } catch (err: any) {
      alert("Error adding duty: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 1-Click WhatsApp reminder pre-filled sender
  const handleSendWhatsAppReminder = (row: RosterAssignment) => {
    const unitName = activeUnit?.name || "Church Unit";
    // Look up member in allMembers or members
    const mem =
      members.find(
        (m) =>
          (m.uid && row.memberUid && m.uid === row.memberUid) ||
          m.displayName?.toLowerCase() === row.memberName.toLowerCase() ||
          m.email?.toLowerCase() === row.memberName.toLowerCase()
      ) ||
      allMembers.find(
        (m) =>
          (m.uid && row.memberUid && m.uid === row.memberUid) ||
          m.displayName?.toLowerCase() === row.memberName.toLowerCase() ||
          m.email?.toLowerCase() === row.memberName.toLowerCase()
      );

    let phone = mem?.phone || "";
    if (!phone) {
      const entered = window.prompt(
        `Enter WhatsApp phone number for ${row.memberName} (e.g. 080... or +234...):`
      );
      if (!entered) return;
      phone = entered;
    }

    // Clean phone number (Nigerian format to international 234...)
    let clean = phone.replace(/\D/g, "");
    if (clean.startsWith("0") && clean.length === 11) {
      clean = "234" + clean.substring(1);
    } else if (!clean.startsWith("234") && clean.length === 10) {
      clean = "234" + clean;
    }

    // Pre-filled reminder message format as requested
    const text = `Hi ${row.memberName}, gentle reminder that you are on ${unitName} duty this Sunday at 8:00 AM (${row.dutyRole}). See you at church!`;
    const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Delete this duty assignment?")) return;
    try {
      await fetch(`/api/portal/unit/roster?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (user?.assignedUnitId) fetchUnitData(user.assignedUnitId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMemberToUnit = async (targetMember: PortalUser) => {
    if (!activeUnit?.id) return;
    setAddingMemberUid(targetMember.uid);
    try {
      const res = await fetch("/api/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_member_to_unit",
          memberUid: targetMember.uid,
          assignedUnitId: activeUnit.id,
          performedBy: user?.displayName || user?.email || "Unit Head",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = { ...targetMember, assignedUnitId: activeUnit.id };
        setMembers((prev) => {
          if (prev.some((m) => m.uid === targetMember.uid)) return prev;
          return [...prev, updated];
        });
        setAllMembers((prev) =>
          prev.map((m) => (m.uid === targetMember.uid ? updated : m))
        );
        setSelectedMember(targetMember.displayName || targetMember.email);
        setShowAddMemberModal(false);
        setMsg(`✓ ${targetMember.displayName || targetMember.email} added to ${activeUnit.name} and selected.`);
        setTimeout(() => setMsg(""), 5000);
      } else {
        alert(data.error || "Failed to add member to unit");
      }
    } catch (err) {
      console.error("Error adding member to unit:", err);
      alert("Network error. Please try again.");
    } finally {
      setAddingMemberUid(null);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", color: "#1F46C8" }}>Loading duty roster...</div>;
  }

  const isLeader = Boolean(
    user?.role === "unit_head" ||
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    user?.role === "portal_manager" ||
    user?.isUnitHead ||
    user?.roles?.includes("unit_head")
  );

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
          Unit Management · {activeUnit?.name}
        </div>
        <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 32px)", color: "#141C6E", margin: 0 }}>
          Unit Duty Roster &amp; Assignments
        </h1>
        <p style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontStyle: "italic", fontSize: "14.5px", color: "#4A5490", marginTop: "6px" }}>
          Schedule and manage ministry worker assignments for upcoming church services and vigils.
        </p>
      </div>

      {/* Roster Assignment Form (For Leaders) or Information Box (For Unit Members) */}
      {!isLeader ? (
        <div
          style={{
            backgroundColor: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: "14px",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div>
            <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#1E40AF" }}>
              📋 {activeUnit?.name} Volunteer Duty Schedule
            </div>
            <div style={{ fontSize: "12.5px", color: "#3B82F6", marginTop: "4px" }}>
              Check your scheduled service duties below. If you cannot attend a scheduled service, you can easily request a swap with a teammate.
            </div>
          </div>
          <a
            href="/portal/unit/swaps"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              backgroundColor: "#1F46C8",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 2px 6px rgba(31, 70, 200, 0.2)",
            }}
          >
            <span>⟳ Request Duty Swap</span>
          </a>
        </div>
      ) : (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
          <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: "0 0 20px" }}>
            Assign Service Duty
          </h2>

        <form onSubmit={handleAddAssignment}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Service / Program
              </label>
              <select
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Sunday Word & Worship Celebration (9:00 AM WAT)">Sunday Word & Worship Celebration (9:00 AM WAT)</option>
                <option value="Thursday Doctrine & Prayer Encounter (4:30 PM WAT)">Thursday Doctrine & Prayer Encounter (4:30 PM WAT)</option>
                <option value="The Forge — Monthly Thursday Encounter (4:30 PM WAT)">The Forge — Monthly Thursday Encounter (4:30 PM WAT)</option>
                <option value="The Forge — Monthly Friday Vigil (8:00 PM WAT)">The Forge — Monthly Friday Vigil (8:00 PM WAT)</option>
                <option value="Festival of Light (FOL)">Festival of Light (FOL)</option>
                <option value="Merismos Prophetic Conference">Merismos Prophetic Conference</option>
                <option value="Unit Department Meeting / Rehearsal">Unit Department Meeting / Rehearsal</option>
                <option value="custom">✏️ Other / Custom Event (type below)</option>
              </select>
              {serviceName === "custom" && (
                <input
                  type="text"
                  placeholder="e.g. Workers Retreat, Convocation..."
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  required
                  style={{ width: "100%", marginTop: "8px", padding: "9px 12px", borderRadius: "8px", border: "1px solid #1F46C8", fontSize: "12.5px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
                />
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Service Date
              </label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase" }}>
                  Assigned Unit Member
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(true);
                    setSearchMemberTerm("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#1F46C8",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  + Add from Directory
                </button>
              </div>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                {members.length > 0 ? (
                  members.map((m) => (
                    <option key={m.uid} value={m.displayName || m.email}>
                      {m.displayName || m.email}
                    </option>
                  ))
                ) : (
                  <option value="">No members in this unit — click above to add</option>
                )}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Duty Role / Post
              </label>
              <input
                type="text"
                value={dutyRole}
                onChange={(e) => setDutyRole(e.target.value)}
                placeholder="e.g. Audio Mixer / Camera 1 / Usher"
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
              Special Briefing / Instructions (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Arrive 45 mins before service for sound check"
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {msg && (
            <div style={{ padding: "10px 14px", backgroundColor: "#DCFCE7", color: "#166534", borderRadius: "8px", fontSize: "12.5px", fontWeight: 600, marginBottom: "16px" }}>
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || members.length === 0}
            style={{
              padding: "10px 24px",
              backgroundColor: "#1F46C8",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Scheduling..." : "Add to Duty Roster"}
          </button>
        </form>
      </div>
      )}

      {/* Roster Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: 0 }}>
            Scheduled Service Roster
          </h2>
          <span style={{ fontSize: "12px", color: "#64748B" }}>
            Showing {roster.length} duty assignment{roster.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Global Conflict Alert Banner */}
        {(() => {
          const conflictCount = roster.filter((r) =>
            allRosters.some(
              (o) =>
                o.id !== r.id &&
                o.serviceDate === r.serviceDate &&
                normalizeUnitId(o.unitId) !== normalizeUnitId(r.unitId) &&
                ((o.memberUid && r.memberUid && o.memberUid === r.memberUid) ||
                  o.memberName.toLowerCase().trim() === r.memberName.toLowerCase().trim())
            )
          ).length;

          if (conflictCount === 0) return null;

          return (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #F87171",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "18px",
                color: "#991B1B",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <strong style={{ display: "block", fontSize: "13px" }}>
                  Roster Conflict Detected ({conflictCount} member{conflictCount === 1 ? "" : "s"})
                </strong>
                <span style={{ fontSize: "12px" }}>
                  One or more members are scheduled for duties in two different units on the same Sunday. Check the highlighted red rows below.
                </span>
              </div>
            </div>
          );
        })()}

        {roster.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #D5DCF2", color: "#4A5490" }}>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Date</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Service</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Member</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Duty Role</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Status</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((row) => {
                  const conflict = allRosters.find(
                    (other) =>
                      other.id !== row.id &&
                      other.serviceDate === row.serviceDate &&
                      normalizeUnitId(other.unitId) !== normalizeUnitId(row.unitId) &&
                      ((other.memberUid && row.memberUid && other.memberUid === row.memberUid) ||
                        other.memberName.toLowerCase().trim() === row.memberName.toLowerCase().trim())
                  );

                  const otherUnit = conflict
                    ? UNITS.find((u) => normalizeUnitId(u.id) === normalizeUnitId(conflict.unitId))?.name || conflict.unitId
                    : "";

                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: "1px solid #E8EDFB",
                        backgroundColor: conflict ? "#FEF2F2" : "#FFFFFF",
                        borderLeft: conflict ? "4px solid #DC2626" : "4px solid transparent",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <td style={{ padding: "14px", fontWeight: 600, color: "#141C6E" }}>
                        {row.serviceDate}
                      </td>
                      <td style={{ padding: "14px", color: "#4A5490" }}>{row.serviceName}</td>
                      <td style={{ padding: "14px", fontWeight: 700, color: "#1F46C8" }}>
                        <div>{row.memberName}</div>
                        {conflict && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              backgroundColor: "#FEE2E2",
                              color: "#B91C1C",
                              border: "1px solid #FCA5A5",
                              borderRadius: "4px",
                              padding: "2px 7px",
                              fontSize: "10.5px",
                              fontWeight: 700,
                              marginTop: "5px",
                            }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <span>CONFLICT: Also on {otherUnit} duty ({conflict.dutyRole})</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "14px", color: "#141C6E" }}>{row.dutyRole}</td>
                      <td style={{ padding: "14px" }}>
                        <span style={{ padding: "3px 8px", borderRadius: "4px", backgroundColor: "#DCFCE7", color: "#166534", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                          {isLeader ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSendWhatsAppReminder(row)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "6px 12px",
                                  backgroundColor: "#25D366",
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "11.5px",
                                  fontWeight: 700,
                                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                                  cursor: "pointer",
                                  boxShadow: "0 2px 4px rgba(37, 211, 102, 0.25)",
                                  whiteSpace: "nowrap",
                                }}
                                title="Send pre-filled WhatsApp reminder"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.57 20.15 9.12 19.76 7.85 19.01L7.55 18.83L4.44 19.65L5.27 16.62L5.07 16.31C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.05 3.68C14.25 3.68 16.31 4.54 17.87 6.1C19.42 7.66 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.05 20.15ZM16.57 14.39C16.32 14.27 15.1 13.67 14.88 13.58C14.65 13.5 14.49 13.46 14.32 13.71C14.16 13.95 13.69 14.51 13.55 14.67C13.41 14.83 13.27 14.85 13.02 14.73C12.78 14.61 11.99 14.35 11.06 13.52C10.33 12.87 9.84 12.07 9.7 11.83C9.56 11.58 9.68 11.45 9.81 11.33C9.92 11.22 10.05 11.05 10.18 10.91C10.3 10.76 10.34 10.66 10.42 10.49C10.5 10.33 10.46 10.19 10.4 10.07C10.34 9.95 9.85 8.74 9.64 8.24C9.44 7.76 9.24 7.82 9.09 7.81C8.94 7.81 8.78 7.81 8.61 7.81C8.45 7.81 8.18 7.87 7.96 8.11C7.73 8.36 7.1 8.95 7.1 10.15C7.1 11.35 7.98 12.51 8.1 12.67C8.22 12.83 9.82 15.31 12.29 16.37C12.88 16.63 13.33 16.78 13.69 16.9C14.28 17.08 14.82 17.06 15.24 16.99C15.72 16.92 16.71 16.39 16.92 15.81C17.12 15.23 17.12 14.73 17.06 14.63C17 14.53 16.82 14.51 16.57 14.39Z"/>
                                </svg>
                                <span>Remind via WhatsApp</span>
                              </button>

                              <button
                                onClick={() => handleDelete(row.id)}
                                style={{ padding: "6px 10px", backgroundColor: "#FFF1F2", color: "#BE123C", border: "1px solid #FECDD3", borderRadius: "6px", fontSize: "11.5px", fontWeight: 600, cursor: "pointer" }}
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            (row.memberUid === user?.uid ||
                              row.memberName.toLowerCase() === user?.displayName?.toLowerCase() ||
                              row.memberName.toLowerCase() === user?.email?.toLowerCase()) ? (
                              <a
                                href={`/portal/unit/swaps?date=${encodeURIComponent(row.serviceDate)}&role=${encodeURIComponent(row.dutyRole)}`}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "6px 12px",
                                  backgroundColor: "#EFF6FF",
                                  border: "1px solid #BFDBFE",
                                  borderRadius: "6px",
                                  color: "#1E40AF",
                                  fontSize: "11.5px",
                                  fontWeight: 700,
                                  textDecoration: "none",
                                }}
                              >
                                ⟳ Request Swap
                              </a>
                            ) : (
                              <span style={{ color: "#94A3B8", fontSize: "12px", fontWeight: 500 }}>—</span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#747CA1", fontSize: "13px", fontStyle: "italic", margin: 0 }}>
            No duty assignments scheduled yet. Use the form above to assign workers for upcoming services.
          </p>
        )}
      </div>

      {/* ── Add Member from Church Directory Modal ── */}
      {showAddMemberModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(10, 14, 46, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddMemberModal(false);
          }}
        >
          <div
            style={{
              maxWidth: "560px",
              width: "100%",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.22)",
              border: "1px solid #D5DCF2",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "85vh",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #E8EDFB",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                backgroundColor: "#F8FAFD",
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "17px",
                    fontWeight: 800,
                    color: "#141C6E",
                    margin: 0,
                  }}
                >
                  Add Member to {activeUnit?.name}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "12.5px",
                    color: "#4A5490",
                    margin: "4px 0 0",
                  }}
                >
                  Add a member from the church directory to assign them to this unit and duty.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  color: "#64748B",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #E8EDFB" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #D5DCF2",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  autoFocus
                  placeholder="Search by name, email, or phone..."
                  value={searchMemberTerm}
                  onChange={(e) => setSearchMemberTerm(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: "13px",
                    color: "#141C6E",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  }}
                />
                {searchMemberTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchMemberTerm("")}
                    style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "12px" }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Member Candidates List */}
            <div style={{ overflowY: "auto", flex: 1, padding: "12px 24px", maxHeight: "380px" }}>
              {(() => {
                const available = allMembers.filter((m) => {
                  if (normalizeUnitId(m.assignedUnitId) === normalizeUnitId(activeUnit?.id)) return false;
                  if (members.some((cur) => cur.uid === m.uid)) return false;
                  if (!searchMemberTerm.trim()) return true;
                  const q = searchMemberTerm.toLowerCase();
                  return (
                    (m.displayName || "").toLowerCase().includes(q) ||
                    (m.email || "").toLowerCase().includes(q) ||
                    (m.phone || "").toLowerCase().includes(q)
                  );
                });

                if (available.length === 0) {
                  return (
                    <div style={{ padding: "36px 16px", textAlign: "center", color: "#64748B" }}>
                      <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 600 }}>
                        {searchMemberTerm ? "No matching members found." : "All church members are already assigned to this unit."}
                      </p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {available.slice(0, 30).map((m) => {
                      const currentUnit = UNITS.find((u) => u.id === normalizeUnitId(m.assignedUnitId));
                      const isAdding = addingMemberUid === m.uid;
                      const initial = (m.displayName || m.email || "M").charAt(0).toUpperCase();

                      return (
                        <div
                          key={m.uid}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: "1px solid #E8EDFB",
                            backgroundColor: "#FAFBFE",
                            gap: "12px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                backgroundColor: "#1F46C8",
                                color: "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "14px",
                                flexShrink: 0,
                              }}
                            >
                              {initial}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: "#141C6E",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                                }}
                              >
                                {m.displayName || "Unnamed Member"}
                              </div>
                              <div
                                style={{
                                  fontSize: "11.5px",
                                  color: "#64748B",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {m.email}
                              </div>
                              <div style={{ marginTop: "2px" }}>
                                <span
                                  style={{
                                    fontSize: "10px",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    backgroundColor: currentUnit ? "#FEF3C7" : "#F1F5F9",
                                    color: currentUnit ? "#92400E" : "#64748B",
                                    fontWeight: 600,
                                  }}
                                >
                                  {currentUnit ? `Currently: ${currentUnit.name}` : "Unassigned"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isAdding}
                            onClick={() => handleAddMemberToUnit(m)}
                            style={{
                              padding: "6px 14px",
                              backgroundColor: isAdding ? "#94A3B8" : "#1F46C8",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: isAdding ? "not-allowed" : "pointer",
                              whiteSpace: "nowrap",
                              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                              transition: "background-color 0.15s ease",
                            }}
                          >
                            {isAdding ? "Adding..." : "+ Add to Unit"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #E8EDFB",
                display: "flex",
                justifyContent: "flex-end",
                backgroundColor: "#F8FAFD",
              }}
            >
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#0E1556",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
