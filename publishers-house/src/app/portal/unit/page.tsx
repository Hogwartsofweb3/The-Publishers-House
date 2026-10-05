"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
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
    // Set initial date in useEffect to avoid hydration mismatch
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const activeUnit = UNITS.find((u) => u.id === user?.assignedUnitId);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const portalUser = await getPortalUser(firebaseUser.uid);
        if (portalUser && portalUser.role === "unit_head") {
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
        const fetchedMembers = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as PortalUser));
        // Simple client-side sort
        fetchedMembers.sort((a, b) => a.displayName.localeCompare(b.displayName));
        setMembers(fetchedMembers);
      } catch (err) {
        console.error("Failed to fetch unit members:", err);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [user]);

  const handleLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.assignedUnitId) return;

    setSavingAttendance(true);
    setAttendanceMessage("");
    try {
      await addDoc(collection(db, "attendance"), {
        type: "department",
        unitId: user.assignedUnitId,
        date,
        headcount: parseInt(headcount, 10),
        notes,
        timestamp: new Date().toISOString(),
        loggedBy: user.uid
      });
      setAttendanceMessage("Attendance logged successfully!");
      setHeadcount("");
      setNotes("");
    } catch (err) {
      console.error("Failed to log attendance:", err);
      setAttendanceMessage("Failed to log attendance. Please try again.");
    } finally {
      setSavingAttendance(false);
      setTimeout(() => setAttendanceMessage(""), 3000);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B0E14", display: "flex", alignItems: "center", justifyContent: "center", color: "#F8FAFC", fontFamily: "'Poppins', sans-serif" }}>
        Loading...
      </div>
    );
  }

  if (!user) return null; // handled by redirect

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0E14",
        fontFamily: "'Poppins', sans-serif",
        color: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        padding: "32px 24px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#F8FAFC",
            margin: 0,
          }}
        >
          {activeUnit?.name || "Unit"} Command Center
        </h1>
        <p style={{ color: "#94A3B8", marginTop: 6, fontSize: 14 }}>
          Welcome back, {user.displayName}. Manage your unit below.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {/* Left Column: Roster */}
        <div
          style={{
            flex: "1 1 500px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>
            Unit Roster
          </h2>
          {loadingMembers ? (
            <p style={{ color: "#94A3B8", fontSize: 14 }}>Loading members...</p>
          ) : members.length === 0 ? (
            <p style={{ color: "#94A3B8", fontSize: 14 }}>No members found in this unit.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", textAlign: "left" }}>
                    <th style={{ padding: "12px 8px", color: "#94A3B8", fontWeight: 500 }}>Name</th>
                    <th style={{ padding: "12px 8px", color: "#94A3B8", fontWeight: 500 }}>Email</th>
                    <th style={{ padding: "12px 8px", color: "#94A3B8", fontWeight: 500 }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.uid} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "12px 8px" }}>{m.displayName}</td>
                      <td style={{ padding: "12px 8px", color: "#94A3B8" }}>{m.email}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{
                          background: m.role === "unit_head" ? "rgba(32, 144, 255, 0.15)" : "rgba(16, 185, 129, 0.15)",
                          color: m.role === "unit_head" ? "#2090FF" : "#10B981",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500
                        }}>
                          {m.role === "unit_head" ? "Head" : "Member"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Attendance */}
        <div
          style={{
            flex: "1 1 300px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: 16,
            padding: 24,
            alignSelf: "flex-start"
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>
            Log Attendance
          </h2>
          <form onSubmit={handleLogAttendance} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: "#F8FAFC",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 14,
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>Headcount</label>
              <input
                type="number"
                min="0"
                required
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value)}
                placeholder="Number of members present"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: "#F8FAFC",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 14,
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special remarks or challenges"
                rows={3}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: "#F8FAFC",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 14,
                  resize: "vertical",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={savingAttendance}
              style={{
                background: "#D97706",
                color: "#F8FAFC",
                border: "none",
                borderRadius: 8,
                padding: "12px",
                fontFamily: "'Poppins', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                cursor: savingAttendance ? "not-allowed" : "pointer",
                opacity: savingAttendance ? 0.7 : 1,
              }}
            >
              {savingAttendance ? "Saving..." : "Submit Log"}
            </button>
            {attendanceMessage && (
              <p style={{ color: attendanceMessage.includes("Failed") ? "#EF4444" : "#10B981", fontSize: 13, marginTop: 4 }}>
                {attendanceMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
