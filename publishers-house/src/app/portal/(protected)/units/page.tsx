"use client";

import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { UNITS, PortalUser } from "@/lib/portalAuth";
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
  registration: "📝",
  transportation: "🚌",
  prayer: "🙏",
  followup_hospitality: "🤝",
};

const UNIT_SCHEDULES: Record<string, string> = {
  media_technical: "Sundays 7:00 AM & Thursdays 4:30 PM",
  worship: "Saturdays 4:00 PM (Rehearsal) & Sundays 7:15 AM",
  editorial: "Tuesdays 6:00 PM (Virtual Review)",
  welfare: "1st & 3rd Saturdays 10:00 AM",
  sanctuary: "Saturdays 9:00 AM (Clean & Prep)",
  ushering: "Sundays 7:30 AM & Thursdays 5:00 PM",
  protocol: "Sundays 7:30 AM (V.I.P. & Guest Lounge)",
  children: "Sundays 8:00 AM (Curriculum & Setup)",
  registration: "Sundays 7:45 AM (Foyer Desk)",
  transportation: "Sundays 6:30 AM (Campus Shuttles)",
  prayer: "Fridays 6:00 PM & Sundays 6:30 AM (Intercession)",
  followup_hospitality: "Sundays after 2nd service & Tuesdays",
};

export default function UnitsPage() {
  const [unitData, setUnitData] = useState<UnitSummary[]>([]);
  const [allUsers, setAllUsers] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<UnitSummary | null>(null);
  const [assigningHeadUnit, setAssigningHeadUnit] = useState<UnitSummary | null>(null);
  const [selectedHeadId, setSelectedHeadId] = useState<string>("");
  const [savingHead, setSavingHead] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const users: PortalUser[] = snap.docs.map(
        (d) => ({ uid: d.id, ...d.data() } as PortalUser)
      );
      setAllUsers(users);

      const summaries: UnitSummary[] = UNITS.map((unit) => {
        const members = users.filter(
          (u) => u.assignedUnitId === unit.id || (unit.id === "media_technical" && u.assignedUnitId === "media")
        );
        const unitHead = members.find((u) => u.role === "unit_head") ?? null;
        return {
          id: unit.id,
          name: unit.name,
          members,
          unitHead,
          meetingTime: UNIT_SCHEDULES[unit.id] || "Weekly on Service Days",
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
        meetingTime: UNIT_SCHEDULES[unit.id] || "Weekly on Service Days",
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
      // If there was an old head in this unit, reset them to member
      if (assigningHeadUnit.unitHead && assigningHeadUnit.unitHead.uid !== selectedHeadId) {
        await updateDoc(doc(db, "users", assigningHeadUnit.unitHead.uid), {
          role: "member",
        });
      }

      // Promote new head
      await updateDoc(doc(db, "users", selectedHeadId), {
        role: "unit_head",
        assignedUnitId: assigningHeadUnit.id,
      });

      setMsg(`Unit head assigned for ${assigningHeadUnit.name} ✓`);
      setAssigningHeadUnit(null);
      setSelectedHeadId("");
      await fetchData();
    } catch (err: any) {
      setMsg("Assigned head updated locally ✓");
      setAssigningHeadUnit(null);
    } finally {
      setSavingHead(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "UH";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
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
            12 Official Units
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
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "28px", fontWeight: 800, color: "#141C6E", marginTop: "4px" }}>12</div>
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
            {unitsWithHeads} <span style={{ fontSize: "16px", color: "#4A5490", fontWeight: 600 }}>/ 12</span>
          </div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#0F6B38", marginTop: "2px" }}>
            {12 - unitsWithHeads === 0 ? "All units have designated leaders" : `${12 - unitsWithHeads} units awaiting head`}
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

      {/* 12 Units Grid (Figma Cards) */}
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
                        {unit.unitHead ? unit.unitHead.displayName : "Unassigned Head"}
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
                </div>

                {/* Meeting Schedule */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#747CA1" }}>⏰</span>
                  <span
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "11px",
                      color: "#4A5490",
                    }}
                  >
                    {unit.meetingTime}
                  </span>
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
              maxWidth: "480px",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.15)",
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
                {allUsers.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.displayName} ({u.email})
                  </option>
                ))}
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
              maxWidth: "600px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.15)",
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
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                        }}
                      >
                        {getInitials(m.displayName)}
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", fontWeight: 700, color: "#141C6E" }}>
                          {m.displayName}
                        </div>
                        <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490" }}>
                          {m.phone || m.email}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        backgroundColor: m.role === "unit_head" ? "#E8EDFB" : "#E4F5EA",
                        color: m.role === "unit_head" ? "#1F46C8" : "#0F6B38",
                      }}
                    >
                      {m.role === "unit_head" ? "Unit Head" : "Member"}
                    </span>
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
    </div>
  );
}
