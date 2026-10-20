"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";
import { getPortalUser, PortalUser, UNITS } from "@/lib/portalAuth";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

interface UnitAttendanceRecord {
  id?: string;
  unitId: string;
  serviceDate: string;
  serviceName: string;
  presentCount: number;
  totalMembers: number;
  presentMembers: string[];
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export default function UnitAttendancePage() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<PortalUser[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<UnitAttendanceRecord[]>([]);

  // Form State
  const [serviceDate, setServiceDate] = useState("");
  const [serviceName, setServiceName] = useState("Sunday Word Encounter");
  const [checkedMembers, setCheckedMembers] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const activeUnit = UNITS.find((u) => u.id === user?.assignedUnitId) || UNITS[0];

  useEffect(() => {
    setServiceDate(new Date().toISOString().split("T")[0]);

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const pUser = await getPortalUser(fbUser.uid);
        setUser(pUser);
        if (pUser?.assignedUnitId) {
          fetchUnitData(pUser.assignedUnitId);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const fetchUnitData = async (unitId: string) => {
    try {
      // Unit Members
      const mq = query(collection(db, "users"), where("assignedUnitId", "==", unitId));
      const msnap = await getDocs(mq);
      const mList = msnap.docs.map((d) => d.data() as PortalUser);
      setMembers(mList);

      // Default check all
      const initialChecked: Record<string, boolean> = {};
      mList.forEach((m) => {
        initialChecked[m.displayName || m.email] = true;
      });
      setCheckedMembers(initialChecked);

      // History
      const aq = query(collection(db, "unit_attendance"), where("unitId", "==", unitId));
      const asnap = await getDocs(aq);
      const aList = asnap.docs.map((d) => ({ id: d.id, ...d.data() } as UnitAttendanceRecord));
      aList.sort((a, b) => (a.serviceDate > b.serviceDate ? -1 : 1));
      setAttendanceRecords(aList);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMemberCheck = (name: string) => {
    setCheckedMembers((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.assignedUnitId || !serviceDate) return;
    setSaving(true);
    setMsg("");
    try {
      const presentNames = Object.entries(checkedMembers)
        .filter(([, checked]) => checked)
        .map(([name]) => name);

      const record: UnitAttendanceRecord = {
        unitId: user.assignedUnitId,
        serviceDate,
        serviceName,
        presentCount: presentNames.length,
        totalMembers: members.length,
        presentMembers: presentNames,
        notes: notes.trim() || undefined,
        recordedBy: user.displayName || user.email,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "unit_attendance"), record);
      setMsg("Unit service attendance recorded successfully ✓");
      setNotes("");
      fetchUnitData(user.assignedUnitId);
      setTimeout(() => setMsg(""), 4000);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", color: "#1F46C8" }}>Loading unit attendance...</div>;
  }

  const presentCount = Object.values(checkedMembers).filter(Boolean).length;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
          Unit Management · {activeUnit?.name}
        </div>
        <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 32px)", color: "#141C6E", margin: 0 }}>
          Unit Service Attendance &amp; Roll Call
        </h1>
        <p style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontStyle: "italic", fontSize: "14.5px", color: "#4A5490", marginTop: "6px" }}>
          Take roll call of unit workers present at services, track punctuality, and submit attendance records.
        </p>
      </div>

      {/* Roll Call Form */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: "0 0 18px" }}>
          Take Service Roll Call
        </h2>

        <form onSubmit={handleSaveAttendance}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "20px" }}>
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
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Service Meeting
              </label>
              <select
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Sunday Word Encounter">Sunday Word Encounter</option>
                <option value="Wednesday Bible Study">Wednesday Bible Study</option>
                <option value="Friday All-Night Prayer">Friday All-Night Prayer</option>
                <option value="Unit Department Meeting">Unit Department Meeting</option>
              </select>
            </div>
          </div>

          {/* Member Checkbox Grid */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase" }}>
                Mark Present Members ({presentCount} of {members.length} Present)
              </span>
            </div>

            {members.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                {members.map((m) => {
                  const mName = m.displayName || m.email;
                  const isChecked = Boolean(checkedMembers[mName]);
                  return (
                    <div
                      key={m.uid}
                      onClick={() => toggleMemberCheck(mName)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        backgroundColor: isChecked ? "#EBF3FE" : "#F8FAFD",
                        border: isChecked ? "1px solid #2090FF" : "1px solid #D5DCF2",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by div
                        style={{ accentColor: "#1F46C8", width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "13px", fontWeight: isChecked ? 600 : 400, color: "#141C6E" }}>
                        {mName}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "#747CA1", fontSize: "13px", fontStyle: "italic" }}>
                No members registered under this unit yet.
              </p>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
              Meeting Notes / Department Feedback (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Great worship flow, 2 workers excused for exams"
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
            {saving ? "Saving Record..." : "Submit Unit Attendance"}
          </button>
        </form>
      </div>

      {/* History Ledger */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: "0 0 16px" }}>
          Attendance Log History
        </h2>

        {attendanceRecords.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {attendanceRecords.map((rec) => (
              <div
                key={rec.id}
                style={{
                  padding: "16px 20px",
                  borderRadius: "8px",
                  backgroundColor: "#F8FAFD",
                  border: "1px solid #E8EDFB",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#0140C1", textTransform: "uppercase" }}>
                      {rec.serviceDate} • {rec.serviceName}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#141C6E", marginTop: "2px" }}>
                    Turnout: {rec.presentCount} of {rec.totalMembers} Workers Present
                  </div>
                  {rec.notes && (
                    <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                      Notes: {rec.notes}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: "11.5px", color: "#747CA1" }}>
                  Submitted by {rec.recordedBy}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#747CA1", fontSize: "13px", fontStyle: "italic", margin: 0 }}>
            No attendance records submitted yet.
          </p>
        )}
      </div>
    </div>
  );
}
