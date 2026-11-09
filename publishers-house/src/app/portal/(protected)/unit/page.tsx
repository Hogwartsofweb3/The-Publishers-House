"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseAuth";
import { getPortalUser, PortalUser, UNITS, normalizeUnitId } from "@/lib/portalAuth";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export default function UnitCommandCenter() {
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [members, setMembers] = useState<PortalUser[]>([]);
  const [allMembers, setAllMembers] = useState<PortalUser[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Add Member to Unit State
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingUid, setAddingUid] = useState<string | null>(null);
  const [unitFeedback, setUnitFeedback] = useState("");

  // Attendance Form State
  const [date, setDate] = useState("");
  const [headcount, setHeadcount] = useState("");
  const [notes, setNotes] = useState("");
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState("");

  // Announcement Form State
  const [announceSubject, setAnnounceSubject] = useState("");
  const [announceMessage, setAnnounceMessage] = useState("");
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [announcementResult, setAnnouncementResult] = useState("");

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const activeUnit = UNITS.find((u) => u.id === normalizeUnitId(user?.assignedUnitId));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const portalUser = await getPortalUser(firebaseUser.uid);
        if (
          portalUser &&
          (portalUser.role === "unit_head" ||
           portalUser.role === "admin" ||
           portalUser.role === "super_admin" ||
           portalUser.role === "portal_manager" ||
           portalUser.isUnitHead ||
           portalUser.roles?.includes("unit_head"))
        ) {
          setUser(portalUser);
        } else {
          router.push("/portal/login");
        }
      } else {
        router.push("/portal/login");
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user?.assignedUnitId) return;

    const fetchMembers = async () => {
      setLoadingMembers(true);
      try {
        const normUnitId = normalizeUnitId(user.assignedUnitId);
        let mList: PortalUser[] = [];
        try {
          const res = await fetch("/api/portal/members");
          if (res.ok) {
            const data = await res.json();
            const memberList: PortalUser[] = data.members || [];
            setAllMembers(memberList);
            mList = memberList.filter((u) => normalizeUnitId(u.assignedUnitId) === normUnitId);
          }
        } catch {
          // Fallback to client query
        }

        if (mList.length === 0) {
          try {
            const q = query(
              collection(db, "users"),
              where("assignedUnitId", "==", user.assignedUnitId)
            );
            const snap = await getDocs(q);
            mList = snap.docs.map((doc) => doc.data() as PortalUser);
          } catch {
            // Quota reached
          }
        }

        setMembers(mList);
      } catch (err) {
        console.error("Error fetching unit members:", err);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [user]);

  const handleAddMemberToUnit = async (targetMember: PortalUser) => {
    if (!activeUnit?.id) return;
    setAddingUid(targetMember.uid);
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
        setUnitFeedback(`✓ ${targetMember.displayName || targetMember.email} added to ${activeUnit.name}`);
        setTimeout(() => setUnitFeedback(""), 4000);
      } else {
        alert(data.error || "Failed to add member to unit");
      }
    } catch (err) {
      console.error("Error adding member to unit:", err);
      alert("Network error. Please try again.");
    } finally {
      setAddingUid(null);
    }
  };

  const handleRemoveMemberFromUnit = async (targetMember: PortalUser) => {
    if (!confirm(`Remove ${targetMember.displayName || targetMember.email} from ${activeUnit?.name}?`)) return;
    try {
      const res = await fetch("/api/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_unit",
          memberUid: targetMember.uid,
          assignedUnitId: "",
          performedBy: user?.displayName || user?.email || "Unit Head",
        }),
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.uid !== targetMember.uid));
        setAllMembers((prev) =>
          prev.map((m) => (m.uid === targetMember.uid ? { ...m, assignedUnitId: "" } : m))
        );
        setUnitFeedback(`✓ ${targetMember.displayName || targetMember.email} removed from unit.`);
        setTimeout(() => setUnitFeedback(""), 4000);
      }
    } catch (err) {
      console.error("Error removing member from unit:", err);
    }
  };

  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headcount || !user?.assignedUnitId) return;

    setSavingAttendance(true);
    setAttendanceMessage("");

    try {
      await addDoc(collection(db, "unit_attendance"), {
        unitId: user.assignedUnitId,
        unitName: activeUnit?.name || "Unknown Unit",
        date,
        headcount: parseInt(headcount, 10),
        notes,
        recordedBy: user.displayName,
        recordedAt: new Date().toISOString(),
      });

      setAttendanceMessage("Unit attendance recorded successfully ✓");
      setHeadcount("");
      setNotes("");
    } catch (err) {
      console.error("Error saving attendance:", err);
      setAttendanceMessage("Failed to record attendance. Please try again.");
    } finally {
      setSavingAttendance(false);
      setTimeout(() => setAttendanceMessage(""), 4000);
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceSubject.trim() || !announceMessage.trim() || !user?.assignedUnitId) return;
    setSendingAnnouncement(true);
    setAnnouncementResult("");
    try {
      const res = await fetch("/api/portal/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: announceSubject.trim(),
          message: announceMessage.trim(),
          unitId: user.assignedUnitId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnnouncementResult(`✓ Announcement sent to ${data.sent ?? "your"} unit member(s).`);
        setAnnounceSubject("");
        setAnnounceMessage("");
      } else {
        setAnnouncementResult(`✗ ${data.error || "Failed to send announcement."}`);
      }
    } catch {
      setAnnouncementResult("✗ Network error. Please try again.");
    } finally {
      setSendingAnnouncement(false);
      setTimeout(() => setAnnouncementResult(""), 6000);
    }
  };

  if (authLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
        Loading unit command center...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Admin Link if user has Admin privileges */}
      {(user.role === "admin" || user.role === "super_admin" || user.roles?.includes("admin") || user.role === "portal_manager") && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", padding: "10px 16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#1E40AF", fontWeight: 600 }}>
            <span>👑</span>
            <span>You are viewing this Unit Command Center with your Administrator privileges.</span>
          </div>
          <a
            href="/portal"
            style={{
              padding: "6px 14px",
              backgroundColor: "#1F46C8",
              color: "#FFFFFF",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            }}
          >
            ← Back to Church Admin Portal
          </a>
        </div>
      )}

      {/* Header */}
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
          {activeUnit?.name || "Unit"} Command Center
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
          Welcome back, {user.displayName}. Unit leadership and Sunday duty management.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Unit Roster */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "14px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(14, 21, 86, 0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#141C6E",
                  margin: 0,
                }}
              >
                Unit Volunteer Roster
              </h2>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "4px",
                  padding: "3px 10px",
                  borderRadius: "99px",
                  backgroundColor: "#E8EDFB",
                  color: "#1F46C8",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {members.length} Assigned
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddModal(true);
                setSearchTerm("");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                backgroundColor: "#1F46C8",
                color: "#FFFFFF",
                borderRadius: "8px",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(31, 70, 200, 0.2)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              + Add Member to Unit
            </button>
          </div>

          {unitFeedback && (
            <div
              style={{
                marginBottom: "14px",
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: "#DCFCE7",
                color: "#0F6B38",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              }}
            >
              {unitFeedback}
            </div>
          )}

          {loadingMembers ? (
            <p style={{ color: "#4A5490", fontSize: "13px" }}>Loading members...</p>
          ) : members.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", backgroundColor: "#F8FAFD", borderRadius: "10px", border: "1px dashed #D5DCF2" }}>
              <p style={{ color: "#4A5490", fontSize: "13px", margin: "0 0 12px" }}>No members currently assigned to this unit.</p>
              <button
                type="button"
                onClick={() => { setShowAddModal(true); setSearchTerm(""); }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Add Member from Directory
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFD", borderBottom: "1px solid #E8EDFB" }}>
                    <th style={{ padding: "10px 16px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Name</th>
                    <th style={{ padding: "10px 16px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Email</th>
                    <th style={{ padding: "10px 16px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Role</th>
                    <th style={{ padding: "10px 16px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.uid} style={{ borderBottom: "1px solid #E8EDFB" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", fontWeight: 600, color: "#141C6E" }}>
                        {m.displayName || "Unnamed Member"}
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#4A5490" }}>
                        {m.email}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                            backgroundColor: m.role === "unit_head" ? "#E8EDFB" : "#E4F5EA",
                            color: m.role === "unit_head" ? "#1F46C8" : "#0F6B38",
                          }}
                        >
                          {m.role === "unit_head" ? "Unit Head" : "Member"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        {m.role !== "unit_head" && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMemberFromUnit(m)}
                            title="Remove member from this unit"
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "transparent",
                              border: "1px solid #E2E8F0",
                              borderRadius: "6px",
                              color: "#64748B",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#DC2626";
                              e.currentTarget.style.borderColor = "#FCA5A5";
                              e.currentTarget.style.backgroundColor = "#FEF2F2";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#64748B";
                              e.currentTarget.style.borderColor = "#E2E8F0";
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Attendance Form */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "14px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(14, 21, 86, 0.05)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "16px",
              fontWeight: 700,
              color: "#141C6E",
              margin: "0 0 16px",
            }}
          >
            Record Unit Service Turnout
          </h2>

          <form onSubmit={handleRecordAttendance} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Volunteers Present</label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 12"
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "14px", fontWeight: 700, color: "#141C6E", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Notes / Absences</label>
              <textarea
                rows={3}
                placeholder="Mention any duty swaps or excused members..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none", resize: "vertical" }}
              />
            </div>

            {attendanceMessage && (
              <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", fontWeight: 600, color: "#0F6B38" }}>
                {attendanceMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={savingAttendance}
              style={{
                padding: "12px",
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
              {savingAttendance ? "Submitting..." : "Submit Unit Attendance"}
            </button>
          </form>
        </div>

        {/* ── UNIT ANNOUNCEMENT TOOL ── */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "14px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(14,21,86,0.04)",
          }}
        >
          <div style={{ marginBottom: "18px" }}>
            <div
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "15px",
                fontWeight: 800,
                color: "#0E1556",
                marginBottom: "4px",
              }}
            >
              📣 Send Unit Announcement
            </div>
            <div style={{ fontSize: "12px", color: "#64748B" }}>
              Send an email announcement to all members of <strong>{activeUnit?.name || "your unit"}</strong>.
            </div>
          </div>

          <form onSubmit={handleSendAnnouncement} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Subject *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Reminder: Ushering duty this Sunday 7:30 AM"
                value={announceSubject}
                onChange={(e) => setAnnounceSubject(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Message *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Type your message here..."
                value={announceMessage}
                onChange={(e) => setAnnounceMessage(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            {announcementResult && (
              <div
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: announcementResult.startsWith("✓") ? "#0F6B38" : "#B91C1C",
                  backgroundColor: announcementResult.startsWith("✓") ? "#DCFCE7" : "#FEE2E2",
                  padding: "10px 14px",
                  borderRadius: "8px",
                }}
              >
                {announcementResult}
              </div>
            )}

            <button
              type="submit"
              disabled={sendingAnnouncement}
              style={{
                padding: "12px",
                backgroundColor: "#0E1556",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 700,
                fontSize: "13px",
                cursor: sendingAnnouncement ? "not-allowed" : "pointer",
                opacity: sendingAnnouncement ? 0.7 : 1,
              }}
            >
              {sendingAnnouncement ? "Sending..." : "📨 Send to All Unit Members"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Add Member to Unit Modal ── */}
      {showAddModal && (
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
            if (e.target === e.currentTarget) setShowAddModal(false);
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
                  Add Member to {activeUnit?.name || "Unit"}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "12.5px",
                    color: "#4A5490",
                    margin: "4px 0 0",
                  }}
                >
                  Search and add any member from the church directory. No pastoral approval needed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: "13px",
                    color: "#141C6E",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
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
                  if (!searchTerm.trim()) return true;
                  const q = searchTerm.toLowerCase();
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
                        {searchTerm ? "No matching members found." : "All church members are already assigned to this unit."}
                      </p>
                      {searchTerm && (
                        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#94A3B8" }}>
                          Try searching by first name, last name, or email.
                        </p>
                      )}
                    </div>
                  );
                }

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {available.slice(0, 30).map((m) => {
                      const currentUnit = UNITS.find((u) => u.id === normalizeUnitId(m.assignedUnitId));
                      const isAdding = addingUid === m.uid;
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
                onClick={() => setShowAddModal(false)}
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
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
