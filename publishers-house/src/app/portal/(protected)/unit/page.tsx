"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseAuth";
import { getPortalUser, PortalUser, UNITS } from "@/lib/portalAuth";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export default function UnitCommandCenter() {
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [members, setMembers] = useState<PortalUser[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Attendance Form State
  const [date, setDate] = useState("");
  const [headcount, setHeadcount] = useState("");
  const [notes, setNotes] = useState("");
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState("");

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const activeUnit = UNITS.find((u) => u.id === user?.assignedUnitId);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const portalUser = await getPortalUser(firebaseUser.uid);
        if (portalUser && (portalUser.role === "unit_head" || portalUser.role === "admin")) {
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
        const q = query(
          collection(db, "users"),
          where("assignedUnitId", "==", user.assignedUnitId)
        );
        const snap = await getDocs(q);
        setMembers(snap.docs.map((doc) => doc.data() as PortalUser));
      } catch (err) {
        console.error("Error fetching unit members:", err);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [user]);

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
              Unit Volunteer Roster
            </h2>
            <span
              style={{
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

          {loadingMembers ? (
            <p style={{ color: "#4A5490", fontSize: "13px" }}>Loading members...</p>
          ) : members.length === 0 ? (
            <p style={{ color: "#4A5490", fontSize: "13px" }}>No members currently assigned to this unit.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFD", borderBottom: "1px solid #E8EDFB" }}>
                    <th style={{ padding: "10px 16px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Name</th>
                    <th style={{ padding: "10px 16px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Email</th>
                    <th style={{ padding: "10px 16px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.uid} style={{ borderBottom: "1px solid #E8EDFB" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", fontWeight: 600, color: "#141C6E" }}>
                        {m.displayName}
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
      </div>
    </div>
  );
}
