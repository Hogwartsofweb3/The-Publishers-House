"use client";

import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { UNITS, PortalUser } from "@/lib/portalAuth";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface UnitSummary {
  id: string;
  name: string;
  members: PortalUser[];
  unitHead: PortalUser | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const UNIT_ICONS: Record<string, string> = {
  media: "📡",
  worship: "🎵",
  editorial: "✍️",
  welfare: "❤️",
  sanctuary: "🏛️",
  ushering: "🚪",
  protocol: "📋",
  children: "🌱",
  registration: "📝",
  transportation: "🚌",
  followup: "🤝",
};

// ─── Avatar ─────────────────────────────────────────────────────────────────────

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(217,119,6,0.25)",
        border: "1px solid rgba(217,119,6,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#D97706",
        fontSize: size * 0.38,
        fontWeight: 700,
        flexShrink: 0,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {initials(name)}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function UnitsPage() {
  const [unitData, setUnitData] = useState<UnitSummary[]>([]);
  const [allUsers, setAllUsers] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [assigningUnit, setAssigningUnit] = useState<string | null>(null);
  const [selectedHeadId, setSelectedHeadId] = useState<string>("");
  const [savingHead, setSavingHead] = useState(false);

  // ── Fetch all users ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const users: PortalUser[] = snap.docs.map(
        (d) => ({ uid: d.id, ...d.data() } as PortalUser)
      );
      setAllUsers(users);

      const summaries: UnitSummary[] = UNITS.map((unit) => {
        const members = users.filter((u) => u.assignedUnitId === unit.id);
        const unitHead =
          members.find((u) => u.role === "unit_head") ?? null;
        return {
          id: unit.id,
          name: unit.name,
          members,
          unitHead,
        };
      });
      setUnitData(summaries);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Assign unit head ──────────────────────────────────────────────────────────

  const handleAssignHead = async (unitId: string) => {
    if (!selectedHeadId) return;
    setSavingHead(true);
    try {
      // Update selected user's role and unit
      const userRef = doc(db, "users", selectedHeadId);
      await updateDoc(userRef, {
        assignedUnitId: unitId,
        role: "unit_head",
      });
      // Demote existing head if different
      const unit = unitData.find((u) => u.id === unitId);
      if (unit?.unitHead && unit.unitHead.uid !== selectedHeadId) {
        await updateDoc(doc(db, "users", unit.unitHead.uid), {
          role: "member",
        });
      }
      await fetchData();
      setAssigningUnit(null);
      setSelectedHeadId("");
    } catch (err) {
      console.error("Failed to assign unit head:", err);
    } finally {
      setSavingHead(false);
    }
  };

  const activeUnit = unitData.find((u) => u.id === selectedUnit);
  const eligibleHeads = allUsers.filter(
    (u) => u.role === "unit_head" || u.role === "member" || u.role === "admin"
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0E14",
        fontFamily: "'Poppins', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .unit-card:hover { border-color: rgba(217,119,6,0.35) !important; transform: translateY(-2px); }
        .unit-card { transition: all 0.2s ease; cursor: pointer; }
        .member-row:hover { background: rgba(255,255,255,0.03); }
        .close-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .assign-btn:hover { filter: brightness(1.15); }
      `}</style>

      {/* Header */}
      <div style={{ padding: "32px 24px 0" }}>
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#F8FAFC",
            margin: 0,
          }}
        >
          Church Units
        </h1>
        <p style={{ color: "#94A3B8", marginTop: 6, fontSize: 14, marginBottom: 28 }}>
          {loading ? "Loading…" : `${UNITS.length} units · ${allUsers.length} total members`}
        </p>
      </div>

      {/* Main content area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", padding: "0 24px 32px", gap: 24 }}>
        {/* Grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {loading
              ? Array.from({ length: 11 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 14,
                      padding: "20px",
                      animation: "pulse 1.5s ease-in-out infinite",
                      height: 140,
                    }}
                  />
                ))
              : unitData.map((unit) => {
                  const isSelected = selectedUnit === unit.id;
                  return (
                    <div
                      key={unit.id}
                      className="unit-card"
                      onClick={() =>
                        setSelectedUnit(isSelected ? null : unit.id)
                      }
                      style={{
                        background: isSelected
                          ? "rgba(217,119,6,0.07)"
                          : "rgba(255,255,255,0.03)",
                        border: isSelected
                          ? "1px solid rgba(217,119,6,0.5)"
                          : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 14,
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>
                          {UNIT_ICONS[unit.id] ?? "🏢"}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#F8FAFC",
                            fontSize: 15,
                            flex: 1,
                          }}
                        >
                          {unit.name}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 16 }}>
                        <div>
                          <div style={{ color: "#94A3B8", fontSize: 11, marginBottom: 2 }}>MEMBERS</div>
                          <div style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 20 }}>
                            {unit.members.length}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: "#94A3B8", fontSize: 11, marginBottom: 2 }}>UNIT HEAD</div>
                          <div
                            style={{
                              color: unit.unitHead ? "#D97706" : "#4B5563",
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            {unit.unitHead
                              ? unit.unitHead.displayName
                              : "Unassigned"}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          color: isSelected ? "#D97706" : "#94A3B8",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {isSelected ? "◀ Collapse" : "▶ View members"}
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Side drawer */}
        {activeUnit && (
          <div
            style={{
              width: 360,
              flexShrink: 0,
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              maxHeight: "calc(100vh - 120px)",
              position: "sticky",
              top: 24,
              overflow: "hidden",
            }}
          >
            {/* Drawer header */}
            <div
              style={{
                padding: "20px 20px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{UNIT_ICONS[activeUnit.id] ?? "🏢"}</span>
                  <span style={{ fontWeight: 700, color: "#F8FAFC", fontSize: 16 }}>
                    {activeUnit.name}
                  </span>
                </div>
                <p style={{ color: "#94A3B8", fontSize: 13, margin: "4px 0 0" }}>
                  {activeUnit.members.length} member{activeUnit.members.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                className="close-btn"
                onClick={() => { setSelectedUnit(null); setAssigningUnit(null); }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent",
                  color: "#94A3B8",
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s",
                }}
              >
                ✕
              </button>
            </div>

            {/* Unit head section */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Unit Head
                </span>
                <button
                  className="assign-btn"
                  onClick={() =>
                    setAssigningUnit(
                      assigningUnit === activeUnit.id ? null : activeUnit.id
                    )
                  }
                  style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    border: "1px solid rgba(32,144,255,0.4)",
                    background: "rgba(32,144,255,0.1)",
                    color: "#2090FF",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif",
                    transition: "filter 0.15s",
                  }}
                >
                  {assigningUnit === activeUnit.id ? "Cancel" : "Reassign"}
                </button>
              </div>

              {assigningUnit === activeUnit.id ? (
                <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                  <select
                    value={selectedHeadId}
                    onChange={(e) => setSelectedHeadId(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "#0F172A",
                      color: "#F8FAFC",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 13,
                      outline: "none",
                    }}
                  >
                    <option value="">Select a member…</option>
                    {eligibleHeads.map((u) => (
                      <option key={u.uid} value={u.uid}>
                        {u.displayName} ({u.role})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignHead(activeUnit.id)}
                    disabled={!selectedHeadId || savingHead}
                    style={{
                      padding: "8px",
                      borderRadius: 8,
                      border: "none",
                      background: selectedHeadId ? "#D97706" : "rgba(255,255,255,0.05)",
                      color: selectedHeadId ? "#fff" : "#4B5563",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: selectedHeadId ? "pointer" : "not-allowed",
                      transition: "all 0.15s",
                    }}
                  >
                    {savingHead ? "Saving…" : "Confirm Assignment"}
                  </button>
                </div>
              ) : activeUnit.unitHead ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={activeUnit.unitHead.displayName} size={36} />
                  <div>
                    <div style={{ color: "#F8FAFC", fontWeight: 600, fontSize: 14 }}>
                      {activeUnit.unitHead.displayName}
                    </div>
                    <div style={{ color: "#4B5563", fontSize: 12 }}>
                      {activeUnit.unitHead.email}
                    </div>
                  </div>
                </div>
              ) : (
                <p
                  style={{
                    color: "#4B5563",
                    fontSize: 13,
                    fontStyle: "italic",
                    margin: 0,
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  No unit head assigned yet
                </p>
              )}
            </div>

            {/* Members list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
              {activeUnit.members.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "40px 20px",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 32 }}>🌱</span>
                  <p
                    style={{
                      color: "#94A3B8",
                      fontSize: 14,
                      fontStyle: "italic",
                      fontFamily: "'Playfair Display', serif",
                      textAlign: "center",
                      margin: 0,
                    }}
                  >
                    No members assigned to this unit yet.
                  </p>
                </div>
              ) : (
                activeUnit.members.map((member) => (
                  <div
                    key={member.uid}
                    className="member-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 20px",
                      borderRadius: 0,
                      transition: "background 0.15s",
                    }}
                  >
                    <Avatar name={member.displayName} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: "#F8FAFC",
                          fontWeight: 500,
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {member.displayName}
                        {member.role === "unit_head" && (
                          <span
                            style={{
                              background: "rgba(217,119,6,0.15)",
                              color: "#D97706",
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "1px 6px",
                              borderRadius: 4,
                            }}
                          >
                            HEAD
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          color: "#4B5563",
                          fontSize: 11,
                          marginTop: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {member.email}
                      </div>
                    </div>
                    <span
                      style={{
                        color: "#4B5563",
                        fontSize: 10,
                        textTransform: "uppercase",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        flexShrink: 0,
                      }}
                    >
                      {member.activityTier}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
