"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";
import { getPortalUser, PortalUser, UNITS, getTierLabel } from "@/lib/portalAuth";
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

export default function MemberDashboard() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [submittingPrayer, setSubmittingPrayer] = useState(false);
  const [prayerRequest, setPrayerRequest] = useState("");
  const [prayerSuccess, setPrayerSuccess] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const portalUser = await getPortalUser(firebaseUser.uid);
        setUser(portalUser);

        if (portalUser?.phone) {
          try {
            const attQ = query(
              collection(db, "attendance"),
              where("phone", "==", portalUser.phone),
              orderBy("date", "desc"),
              limit(5)
            );
            const snap = await getDocs(attQ);
            setAttendance(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          } catch (e) {
            console.error("Failed to fetch attendance", e);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerRequest.trim() || !user) return;
    setSubmittingPrayer(true);
    try {
      await addDoc(collection(db, "prayers"), {
        content: prayerRequest,
        status: "pending",
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        timestamp: serverTimestamp(),
      });
      setPrayerSuccess(true);
      setPrayerRequest("");
      setTimeout(() => setPrayerSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingPrayer(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
        Loading your member dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "40px", color: "#9B1C1C", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
        Please log in to view this page.
      </div>
    );
  }

  const unitName = user.assignedUnitId
    ? UNITS.find((u) => u.id === user.assignedUnitId)?.name || "Unknown Unit"
    : "None / General Congregation";

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
          Welcome, {user.displayName}!
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
          Company of the Great · Your spiritual journey, unit roster, and ministry notes
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Profile Card */}
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
            My Member Profile
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E8EDFB", paddingBottom: "8px" }}>
              <span style={{ color: "#4A5490", fontWeight: 500 }}>Email</span>
              <span style={{ color: "#141C6E", fontWeight: 600 }}>{user.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E8EDFB", paddingBottom: "8px" }}>
              <span style={{ color: "#4A5490", fontWeight: 500 }}>Assigned Unit</span>
              <span style={{ color: user.assignedUnitId ? "#1F46C8" : "#4A5490", fontWeight: 700 }}>
                {unitName}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#4A5490", fontWeight: 500 }}>Activity Tier</span>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "99px",
                  backgroundColor: "#E4F5EA",
                  color: "#0F6B38",
                  fontWeight: 700,
                  fontSize: "11px",
                  textTransform: "uppercase",
                }}
              >
                {getTierLabel(user.activityTier)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
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
            Recent Attendance Check-Ins
          </h2>

          {attendance.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {attendance.map((att) => (
                <div
                  key={att.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "13px",
                    padding: "8px 12px",
                    backgroundColor: "#F8FAFD",
                    borderRadius: "8px",
                  }}
                >
                  <span style={{ color: "#4A5490" }}>{att.date || "Sunday Service"}</span>
                  <span style={{ color: "#1F46C8", fontWeight: 600 }}>{att.mode === "online" ? "Virtual Stream" : "In-Person"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#4A5490", fontSize: "13px", fontStyle: "italic", margin: 0 }}>
              {user.phone ? "No recent attendance records found." : "Attendance logs will appear here when you check in."}
            </p>
          )}
        </div>

        {/* Submit Prayer Request */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "14px",
            padding: "24px",
            gridColumn: "1 / -1",
            boxShadow: "0 1px 3px rgba(14, 21, 86, 0.05)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "16px",
              fontWeight: 700,
              color: "#141C6E",
              margin: "0 0 8px",
            }}
          >
            Submit a Personal Prayer Request
          </h2>
          <p style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#4A5490", margin: "0 0 16px" }}>
            The ministerial team and prayer intercessors will stand with you in faith.
          </p>

          <form onSubmit={handlePrayerSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <textarea
              value={prayerRequest}
              onChange={(e) => setPrayerRequest(e.target.value)}
              placeholder="How can we pray for you this week?..."
              rows={4}
              required
              style={{
                width: "100%",
                backgroundColor: "#FFFFFF",
                border: "1px solid #D5DCF2",
                borderRadius: "8px",
                padding: "12px 14px",
                color: "#141C6E",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "13.5px",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {prayerSuccess ? (
                <span style={{ color: "#0F6B38", backgroundColor: "#E4F5EA", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>
                  Prayer request submitted to ministers ✓
                </span>
              ) : <div />}

              <button
                type="submit"
                disabled={submittingPrayer || !prayerRequest.trim()}
                style={{
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: submittingPrayer || !prayerRequest.trim() ? "not-allowed" : "pointer",
                  opacity: submittingPrayer || !prayerRequest.trim() ? 0.6 : 1,
                }}
              >
                {submittingPrayer ? "Submitting..." : "Send Prayer Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
