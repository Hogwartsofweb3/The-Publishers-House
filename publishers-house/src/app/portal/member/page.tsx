"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
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
            setAttendance(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
      setTimeout(() => setPrayerSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingPrayer(false);
    }
  };

  if (loading) {
    return <div style={{ color: "#94A3B8", fontFamily: "'Poppins', sans-serif" }}>Loading your dashboard...</div>;
  }

  if (!user) {
    return <div style={{ color: "#EF4444", fontFamily: "'Poppins', sans-serif" }}>Please log in to view this page.</div>;
  }

  const unitName = user.assignedUnitId ? UNITS.find(u => u.id === user.assignedUnitId)?.name || "Unknown Unit" : "None";

  return (
    <div style={{ background: "#0B0E14", color: "#F8FAFC", minHeight: "100%", fontFamily: "'Poppins', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 3vw, 36px)", margin: 0, letterSpacing: "-0.02em" }}>
          Welcome, <span style={{ color: "#D97706" }}>{user.displayName}</span>!
        </h1>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#94A3B8", fontSize: "14px", marginTop: "8px" }}>
          We are glad to have you here today.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        
        {/* My Profile */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "16px", color: "#F8FAFC", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#D97706" }}>■</span> My Profile
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94A3B8" }}>Email</span>
              <span>{user.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94A3B8" }}>Assigned Unit</span>
              <span style={{ color: user.assignedUnitId ? "#2090FF" : "#4B5563" }}>{unitName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94A3B8" }}>Activity Tier</span>
              <span style={{ color: "#10B981", textTransform: "capitalize" }}>{getTierLabel(user.activityTier)}</span>
            </div>
          </div>
        </div>

        {/* My Activity */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "16px", color: "#F8FAFC", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#10B981" }}>✦</span> Recent Activity
          </h2>
          {attendance.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {attendance.map((att) => (
                <div key={att.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", paddingBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "#94A3B8" }}>{new Date(att.date || att.timestamp).toLocaleDateString()}</span>
                  <span style={{ color: "#F8FAFC" }}>{att.type || "Service"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#4B5563", fontSize: "13px", fontStyle: "italic" }}>
              {user.phone ? "No recent attendance records found." : "Please update your phone number to see attendance."}
            </p>
          )}
        </div>

        {/* Prayer Request */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px", gridColumn: "1 / -1" }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "16px", color: "#F8FAFC", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#8B5CF6" }}>♡</span> Submit a Prayer Request
          </h2>
          <form onSubmit={handlePrayerSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <textarea 
              value={prayerRequest}
              onChange={(e) => setPrayerRequest(e.target.value)}
              placeholder="How can we pray for you today?"
              rows={4}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "12px",
                color: "#F8FAFC",
                fontFamily: "inherit",
                fontSize: "14px",
                resize: "vertical",
                boxSizing: "border-box"
              }}
              required
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#10B981", fontSize: "13px", opacity: prayerSuccess ? 1 : 0, transition: "opacity 0.3s" }}>
                Prayer request submitted successfully!
              </span>
              <button 
                type="submit" 
                disabled={submittingPrayer || !prayerRequest.trim()}
                style={{
                  background: "#D97706",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: submittingPrayer || !prayerRequest.trim() ? "not-allowed" : "pointer",
                  opacity: submittingPrayer || !prayerRequest.trim() ? 0.7 : 1,
                  fontFamily: "inherit"
                }}
              >
                {submittingPrayer ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
