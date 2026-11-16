"use client";

import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  UNITS,
  PortalUser,
  normalizeUnitId,
  isUserUnitHead,
  UNIT_SCHEDULES_DEFAULT,
  DESIGNATED_UNIT_HEADS,
  getHeadedUnits,
} from "@/lib/portalAuth";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

interface UnitSummary {
  id: string;
  name: string;
  members: PortalUser[];
  unitHead: PortalUser | null;
  meetingTime: string;
  venue?: string;
  leadershipNote?: string;
}

const UNIT_ICONS: Record<string, string> = {
  media_technical: "📡",
  worship: "🎵",
  editorial: "✍️",
  welfare: "❤️",
  sanctuary: "🏛️",
  ushering: "🚪",
  protocol: "📋",
  children: "🌱",
  secretariat: "📝",
  registration: "📝",
  transportation: "🚌",
  prayer: "🙏",
  followup_hospitality: "🤝",
  discipleship_evangelism: "📖",
};

export default function UnitsPage() {
  const [unitData, setUnitData] = useState<UnitSummary[]>([]);
  const [allUsers, setAllUsers] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<UnitSummary | null>(null);
  const [assigningHeadUnit, setAssigningHeadUnit] = useState<UnitSummary | null>(null);
  const [selectedHeadId, setSelectedHeadId] = useState<string>("");
  const [savingHead, setSavingHead] = useState(false);

  // Edit Schedule & Details Modal State
  const [editingUnit, setEditingUnit] = useState<UnitSummary | null>(null);
  const [editMeetingTime, setEditMeetingTime] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [savingUnitDetails, setSavingUnitDetails] = useState(false);

  // Lock page scroll when any modal is open
  useEffect(() => {
    const anyOpen = Boolean(selectedUnit) || Boolean(assigningHeadUnit) || Boolean(editingUnit);
    if (anyOpen) {
      const origHtml = document.documentElement.style.overflow;
      const origBody = document.body.style.overflow;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = origHtml;
        document.body.style.overflow = origBody;
      };
    }
  }, [selectedUnit, assigningHeadUnit, editingUnit]);
  const [removingHeadUid, setRemovingHeadUid] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let users: PortalUser[] = [];
      try {
        const res = await fetch("/api/portal/members");
        if (res.ok) {
          const data = await res.json();
          users = data.members || [];
        }
      } catch {
        // Fallback to client SDK
      }

      if (users.length === 0) {
        try {
          const snap = await getDocs(collection(db, "users"));
          users = snap.docs.map(
            (d) => ({ uid: d.id, ...d.data() } as PortalUser)
          );
        } catch {
          // Firestore quota reached or offline
        }
      }

      // Sort alphabetically for clean UI dropdown selection
      users.sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));
      setAllUsers(users);

      // Fetch saved unit metadata (schedules, venues, notes stamped in Firestore)
      let customSchedules: Record<string, string> = {};
      let customVenues: Record<string, string> = {};
      try {
        const metaRes = await fetch("/api/portal/units");
        if (metaRes.ok) {
          const metaData = await metaRes.json();
          customSchedules = metaData.schedules || {};
          customVenues = metaData.venues || {};
        }
      } catch {}

      const summaries: UnitSummary[] = UNITS.map((unit) => {
        const members = users.filter((u) => {
          const uUnit = normalizeUnitId(u.assignedUnitId);
          return uUnit === unit.id;
        });

        // 1. Direct unit member marked as unit_head
        let unitHead = members.find((u) => isUserUnitHead(u, unit.id)) ?? null;

        // 2. Multi-unit head from general congregation (e.g. Ifedayo for Children, David Jatto for Protocol cluster)
        if (!unitHead) {
          unitHead = users.find((u) => isUserUnitHead(u, unit.id)) ?? null;
        }

        // 3. Fallback to canonical designated lead mapping
        let leadershipNote: string | undefined;
        if (DESIGNATED_UNIT_HEADS[unit.id]) {
          leadershipNote = DESIGNATED_UNIT_HEADS[unit.id].note;
          if (!unitHead) {
            const des = DESIGNATED_UNIT_HEADS[unit.id];
            unitHead = {
              uid: `designated_${unit.id}`,
              email: des.email,
              displayName: des.name,
              phone: des.phone || "",
              role: "unit_head",
              activityTier: "leader",
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            } as PortalUser;
          }
        }

        return {
          id: unit.id,
          name: unit.name,
          members,
          unitHead,
          meetingTime: customSchedules[unit.id] || UNIT_SCHEDULES_DEFAULT[unit.id] || "Weekly on Service Days",
          venue: customVenues[unit.id] || "",
          leadershipNote,
        };
      });

      setUnitData(summaries);
    } catch {
      // Fallback local summaries
      const summaries: UnitSummary[] = UNITS.map((unit) => ({
        id: unit.id,
        name: unit.name,
        members: [],
        unitHead: null,
        meetingTime: UNIT_SCHEDULES_DEFAULT[unit.id] || "Weekly on Service Days",
      }));
      setUnitData(summaries);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignHead = async () => {
    if (!assigningHeadUnit || !selectedHeadId) return;
    setSavingHead(true);
    try {
      // 1. Call server API (uses admin SDK & resilient cache)
      const res = await fetch("/api/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_unit_head",
          unitId: assigningHeadUnit.id,
          memberUid: selectedHeadId,
          previousHeadUid: assigningHeadUnit.unitHead?.uid,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to assign unit head");
      }

      setMsg(`Unit head assigned for ${assigningHeadUnit.name} ✓`);
      setAssigningHeadUnit(null);
      setSelectedHeadId("");
      await fetchData();
    } catch (err: any) {
      setMsg("Failed to assign unit head: " + (err.message || "Network error"));
      setAssigningHeadUnit(null);
    } finally {
      setSavingHead(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  /** Demote a unit head back to plain member (keeps them in the unit roster) */
  const handleRemoveUnitHead = async (unit: UnitSummary) => {
    if (!unit.unitHead) return;
    if (!confirm(`Remove ${unit.unitHead.displayName} as head of ${unit.name}?\n\nThey will remain a member of the unit.`)) return;
    setRemovingHeadUid(unit.unitHead.uid);
    try {
      const res = await fetch("/api/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_unit_head",
          memberUid: unit.unitHead.uid,
          keepInUnit: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg(`${unit.unitHead.displayName} removed as head of ${unit.name} ✓`);
        try {
          const { doc, updateDoc } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");
          await updateDoc(doc(db, "users", unit.unitHead.uid), { role: "member" });
        } catch { /* quota / offline — server already handled it */ }
        await fetchData();
      } else {
        setMsg(data.error || "Failed to remove unit head");
      }
    } catch {
      setMsg("Network error. Please try again.");
    } finally {
      setRemovingHeadUid(null);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "UH";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleStartEditUnit = (unit: UnitSummary) => {
    setEditingUnit(unit);
    setEditMeetingTime(unit.meetingTime || "");
    setEditVenue(unit.venue || "");
  };

  const handleSaveUnitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    setSavingUnitDetails(true);
    const newSchedule = editMeetingTime.trim();
    const newVenue = editVenue.trim();

    // Optimistically update immediately
    setUnitData((prev) =>
      prev.map((u) => (u.id === editingUnit.id ? { ...u, meetingTime: newSchedule, venue: newVenue } : u))
    );

    try {
      const res = await fetch("/api/portal/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: editingUnit.id,
          meetingTime: newSchedule,
          venue: newVenue,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save schedule to server");
      }

      setMsg(`Meeting schedule for ${editingUnit.name} updated and saved ✓`);
      setEditingUnit(null);
    } catch (err: any) {
      setMsg("Error saving schedule: " + err.message);
    } finally {
      setSavingUnitDetails(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const totalVolunteers = unitData.reduce((acc, u) => acc + u.members.length, 0);
  const unitsWithHeads = unitData.filter((u) => u.unitHead !== null).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Page Header */}
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
            Church Units
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
            Ministry Teams, Departmental Rosters, and Unit Leadership
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && (
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                color: "#0F6B38",
                backgroundColor: "#E4F5EA",
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            >
              {msg}
            </span>
          )}
          <span
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "#1F46C8",
              backgroundColor: "#E8EDFB",
              padding: "8px 14px",
              borderRadius: "8px",
            }}
          >
            {UNITS.length} Official Units
          </span>
        </div>
      </div>

      {/* KPI Counters */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Total Church Units</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#141C6E", marginTop: "4px" }}>{UNITS.length}</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490", marginTop: "2px" }}>Active ministry departments</div>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "12px",
            padding: "18px 20px",
          }}
        >
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Assigned Unit Heads</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#0F6B38", marginTop: "4px" }}>
            {unitsWithHeads} <span style={{ fontSize: "16px", color: "#4A5490", fontWeight: 600 }}>/ {UNITS.length}</span>
          </div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#0F6B38", marginTop: "2px" }}>
            {UNITS.length - unitsWithHeads === 0 ? "All units have designated leaders" : `${UNITS.length - unitsWithHeads} units awaiting head`}
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
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Rostered Volunteers</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#1F46C8", marginTop: "4px" }}>
            {totalVolunteers}
          </div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#1F46C8", marginTop: "2px" }}>Active across Sunday & Midweek</div>
        </div>
      </div>

      {/* Units Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "20px",
        }}
      >
        {unitData.map((unit) => {
          const icon = UNIT_ICONS[unit.id] || "⬡";
          return (
            <div
              key={unit.id}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D5DCF2",
                borderRadius: "14px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "18px",
                boxShadow: "0 1px 3px rgba(14, 21, 86, 0.05)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        backgroundColor: "#E8EDFB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      {icon}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#141C6E",
                          margin: 0,
                        }}
                      >
                        {unit.name}
                      </h3>
                      <span
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          color: "#4A5490",
                        }}
                      >
                        {unit.members.length} members rostered
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      backgroundColor: unit.unitHead ? "#E4F5EA" : "#FFF2D6",
                      color: unit.unitHead ? "#0F6B38" : "#7A5200",
                    }}
                  >
                    {unit.unitHead ? "Leader Assigned" : "No Head"}
                  </span>
                </div>

                {/* Unit Head Info */}
                <div
                  style={{
                    backgroundColor: "#F8FAFD",
                    border: "1px solid #E8EDFB",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "16px",
                        backgroundColor: unit.unitHead ? "#1F46C8" : "#D5DCF2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontWeight: 700,
                        fontSize: "11px",
                      }}
                    >
                      {unit.unitHead ? getInitials(unit.unitHead.displayName) : "?"}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          color: "#141C6E",
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span>{unit.unitHead ? unit.unitHead.displayName : "Unassigned Head"}</span>
                          {unit.unitHead && (unit.unitHead.role === "admin" || unit.unitHead.role === "super_admin" || unit.unitHead.roles?.includes("admin")) && (
                            <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "4px", backgroundColor: "#E8EDFB", color: "#1F46C8", fontWeight: 700, textTransform: "uppercase" }}>
                              Admin
                            </span>
                          )}
                          {unit.leadershipNote && (
                            <span style={{ fontSize: "9.5px", padding: "1px 6px", borderRadius: "4px", backgroundColor: "#FEF3C7", color: "#92400E", fontWeight: 600 }}>
                              {unit.leadershipNote}
                            </span>
                          )}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "10.5px",
                          color: "#4A5490",
                        }}
                      >
                        {unit.unitHead?.phone || "Tap assign to designate"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => {
                        setAssigningHeadUnit(unit);
                        setSelectedHeadId(unit.unitHead?.uid || "");
                      }}
                      style={{
                        background: "transparent",
                        border: "1px solid #D5DCF2",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#1F46C8",
                        cursor: "pointer",
                      }}
                    >
                      {unit.unitHead ? "Change" : "Assign"}
                    </button>
                    {unit.unitHead && (
                      <button
                        onClick={() => handleRemoveUnitHead(unit)}
                        disabled={removingHeadUid === unit.unitHead.uid}
                        title="Remove as unit head (keeps them as a member)"
                        style={{
                          background: "transparent",
                          border: "1px solid #FCA5A5",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#9B1C1C",
                          cursor: removingHeadUid === unit.unitHead.uid ? "not-allowed" : "pointer",
                          opacity: removingHeadUid === unit.unitHead.uid ? 0.5 : 1,
                        }}
                      >
                        {removingHeadUid === unit.unitHead.uid ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Meeting Schedule & Preparation Time (Editable) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    background: "#F8FAFC",
                    padding: "7px 10px",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: "12px", color: "#747CA1", flexShrink: 0 }}>⏰</span>
                    <span
                      style={{
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "11px",
                        color: "#334155",
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={unit.meetingTime}
                    >
                      {unit.meetingTime || "No schedule configured"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleStartEditUnit(unit)}
                    title="Edit meeting time and details"
                    style={{
                      background: "#EEF2FF",
                      border: "1px solid #C7D2FE",
                      borderRadius: "6px",
                      padding: "2px 7px",
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "10.5px",
                      fontWeight: 600,
                      color: "#1F46C8",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      flexShrink: 0,
                    }}
                  >
                    <span>✏️</span> Edit
                  </button>
                </div>
              </div>

              {/* Action */}
              <div style={{ borderTop: "1px solid #E8EDFB", paddingTop: "14px" }}>
                <button
                  onClick={() => setSelectedUnit(unit)}
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D5DCF2",
                    borderRadius: "8px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 600,
                    fontSize: "12px",
                    color: "#141C6E",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#E8EDFB";
                    e.currentTarget.style.borderColor = "#1F46C8";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                    e.currentTarget.style.borderColor = "#D5DCF2";
                  }}
                >
                  View Members ({unit.members.length}) →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Unit Head Modal */}
      {assigningHeadUnit && (
        <div
          onWheel={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            overflow: "hidden",
            overscrollBehavior: "contain",
          }}
        >
          <div
            className="portal-modal"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "480px",
              maxHeight: "calc(100vh - 40px)",
              overflowY: "auto",
              overscrollBehavior: "contain",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.25)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 800,
                fontSize: "20px",
                color: "#141C6E",
                margin: "0 0 6px",
              }}
            >
              Assign Unit Head
            </h2>
            <p
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                color: "#4A5490",
                margin: "0 0 20px",
              }}
            >
              Designate leader for <strong>{assigningHeadUnit.name}</strong>
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "8px" }}>
                Select Member to be Unit Head
              </label>
              <select
                value={selectedHeadId}
                onChange={(e) => setSelectedHeadId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #D5DCF2",
                  backgroundColor: "#FFFFFF",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "13px",
                  color: "#141C6E",
                  outline: "none",
                }}
              >
                <option value="">-- Choose Member --</option>
                {allUsers.map((u) => {
                  const currentUnit = UNITS.find((un) => un.id === normalizeUnitId(u.assignedUnitId));
                  const unitTag = currentUnit ? ` · [${currentUnit.name}]` : "";
                  const adminTag = u.role === "admin" ? " · [Admin]" : u.role === "super_admin" ? " · [Super Admin]" : "";
                  const contactTag = u.email ? ` (${u.email})` : u.phone ? ` (${u.phone})` : "";
                  return (
                    <option key={u.uid} value={u.uid}>
                      {u.displayName || "Member"}{adminTag}{contactTag}{unitTag}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                disabled={savingHead || !selectedHeadId}
                onClick={handleAssignHead}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: savingHead || !selectedHeadId ? "not-allowed" : "pointer",
                  opacity: savingHead || !selectedHeadId ? 0.6 : 1,
                }}
              >
                {savingHead ? "Assigning..." : "Confirm Unit Head"}
              </button>
              <button
                onClick={() => setAssigningHeadUnit(null)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D5DCF2",
                  color: "#4A5490",
                  borderRadius: "10px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unit Members Drawer / Modal */}
      {selectedUnit && (
        <div
          onWheel={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            overflow: "hidden",
            overscrollBehavior: "contain",
          }}
        >
          <div
            className="portal-modal"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "calc(100vh - 40px)",
              overflowY: "auto",
              overscrollBehavior: "contain",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 800,
                    fontSize: "20px",
                    color: "#141C6E",
                    margin: 0,
                  }}
                >
                  {selectedUnit.name} Roster
                </h2>
                <p style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#4A5490", margin: "4px 0 0" }}>
                  {selectedUnit.members.length} members assigned to this unit
                </p>
              </div>

              <button
                onClick={() => setSelectedUnit(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  color: "#4A5490",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {selectedUnit.members.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                No members currently assigned to this unit. Go to the Members tab to assign volunteers.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedUnit.members.map((m) => (
                  <div
                    key={m.uid}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      backgroundColor: "#F8FAFD",
                      border: "1px solid #E8EDFB",
                      borderRadius: "10px",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "17px",
                          backgroundColor: m.role === "unit_head" ? "#1F46C8" : "#2F5BE0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#FFFFFF",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontWeight: 700,
                          fontSize: "11px",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(m.displayName)}
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", fontWeight: 700, color: "#141C6E" }}>
                          {m.displayName}
                        </div>
                        <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490" }}>
                          {m.email || m.phone}
                        </div>
                      </div>
                    </div>

                    {(() => {
                      const isMemberHead = Boolean(m.isUnitHead || m.role === "unit_head" || m.roles?.includes("unit_head") || selectedUnit.unitHead?.uid === m.uid);
                      const isMemberAdmin = m.role === "admin" || m.role === "super_admin" || m.roles?.includes("admin");

                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                          {isMemberAdmin && (
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "10px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                backgroundColor: "#E8EDFB",
                                color: "#1F46C8",
                              }}
                            >
                              Admin
                            </span>
                          )}
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "10px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              backgroundColor: isMemberHead ? "#E4F5EA" : "#F4F6FB",
                              color: isMemberHead ? "#0F6B38" : "#4A5490",
                            }}
                          >
                            {isMemberHead ? "Unit Head" : "Member"}
                          </span>

                          {/* If this member is the unit head, show "Remove as Head" */}
                          {isMemberHead && (
                            <button
                              onClick={async () => {
                                if (!confirm(`Remove ${m.displayName} as head of ${selectedUnit.name}? They will remain a member.`)) return;
                                setRemovingHeadUid(m.uid);
                                try {
                                  const res = await fetch("/api/portal/members", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ action: "remove_unit_head", memberUid: m.uid, keepInUnit: true }),
                                  });
                                  if (res.ok) {
                                    setMsg(`${m.displayName} removed as head ✓`);
                                    setSelectedUnit(null);
                                    await fetchData();
                                  }
                                } catch { /* noop */ } finally {
                                  setRemovingHeadUid(null);
                                  setTimeout(() => setMsg(""), 4000);
                                }
                              }}
                              disabled={removingHeadUid === m.uid}
                              style={{
                                background: "none",
                                border: "1px solid #FCA5A5",
                                borderRadius: "6px",
                                padding: "3px 8px",
                                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                                fontSize: "10px",
                                fontWeight: 600,
                                color: "#9B1C1C",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {removingHeadUid === m.uid ? "Removing…" : "Remove as Head"}
                            </button>
                          )}

                          {/* If not unit head, offer "Make Head" shortcut */}
                          {!isMemberHead && (
                            <button
                              onClick={() => {
                                setSelectedUnit(null);
                                setAssigningHeadUnit(selectedUnit);
                                setSelectedHeadId(m.uid);
                              }}
                              style={{
                                background: "none",
                                border: "1px solid #A5B4FC",
                                borderRadius: "6px",
                                padding: "3px 8px",
                                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                                fontSize: "10px",
                                fontWeight: 600,
                                color: "#1F46C8",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Make Head
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: "24px", textAlign: "right" }}>
              <button
                onClick={() => setSelectedUnit(null)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Unit Meeting Schedule & Details Modal */}
      {editingUnit && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(10, 15, 30, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              border: "1px solid #E2E8F0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-cinzel-family, 'Cinzel', serif)",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#141C6E",
                    margin: 0,
                  }}
                >
                  Edit Unit Schedule
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "12px",
                    color: "#64748B",
                    margin: "4px 0 0 0",
                  }}
                >
                  {editingUnit.name}
                </p>
              </div>
              <button
                onClick={() => setEditingUnit(null)}
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

            <form onSubmit={handleSaveUnitDetails}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#1E293B",
                    marginBottom: "6px",
                  }}
                >
                  Meeting & Preparation Time
                </label>
                <input
                  type="text"
                  value={editMeetingTime}
                  onChange={(e) => setEditMeetingTime(e.target.value)}
                  placeholder="e.g. Sundays 7:30 AM (V.I.P. & Guest Lounge)"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", display: "block" }}>
                  This reflects immediately across admin cards and member unit dashboards.
                </span>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#1E293B",
                    marginBottom: "6px",
                  }}
                >
                  Venue / Preparation Room (Optional)
                </label>
                <input
                  type="text"
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                  placeholder="e.g. Main Sanctuary / Choir Loft"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setEditingUnit(null)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    background: "#F8FAFC",
                    color: "#475569",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUnitDetails}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#1F46C8",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: savingUnitDetails ? "not-allowed" : "pointer",
                    opacity: savingUnitDetails ? 0.7 : 1,
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  }}
                >
                  {savingUnitDetails ? "Saving & Stamping..." : "Save & Update Immediately"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
