"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { UNITS, PortalUser } from "@/lib/portalAuth";
import { usePortal } from "@/lib/portalContext";
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

const CANONICAL_SERVICES = [
  { value: "Sunday Word & Worship Celebration (9:00 AM WAT)", label: "Sunday Word & Worship Celebration (9:00 AM WAT)" },
  { value: "Thursday Doctrine & Prayer Encounter (4:30 PM WAT)", label: "Thursday Doctrine & Prayer Encounter (4:30 PM WAT)" },
  { value: "The Forge — Monthly Thursday Encounter (4:30 PM WAT)", label: "The Forge — Monthly Thursday Encounter (4:30 PM WAT)" },
  { value: "The Forge — Monthly Friday Vigil (8:00 PM WAT)", label: "The Forge — Monthly Friday Vigil (8:00 PM WAT)" },
  { value: "Festival of Light (FOL)", label: "Festival of Light (FOL)" },
  { value: "Merismos Prophetic Conference", label: "Merismos Prophetic Conference" },
  { value: "Unit Department Meeting / Rehearsal", label: "Unit Department Meeting / Rehearsal" },
  { value: "custom", label: "Other / Custom Special Program..." },
];

export default function UnitAttendancePage() {
  const { effectiveUser } = usePortal();
  const [members, setMembers] = useState<PortalUser[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<UnitAttendanceRecord[]>([]);

  // Form State
  const [serviceDate, setServiceDate] = useState("");
  const [serviceName, setServiceName] = useState("Sunday Word & Worship Celebration (9:00 AM WAT)");
  const [customServiceName, setCustomServiceName] = useState("");
  const [checkedMembers, setCheckedMembers] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const normUnitId = (effectiveUser?.assignedUnitId || "").toLowerCase();
  const activeUnit = UNITS.find((u) => u.id === normUnitId) || UNITS[0];

  useEffect(() => {
    setServiceDate(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (!normUnitId) {
      setLoadingMembers(false);
      return;
    }

    const fetchUnitData = async () => {
      setLoadingMembers(true);
      try {
        // Fetch unit members from API directory (quota-safe)
        let mList: PortalUser[] = [];
        try {
          const res = await fetch(`/api/portal/members?unitId=${encodeURIComponent(normUnitId)}`);
          if (res.ok) {
            const data = await res.json();
            mList = data.members || [];
          }
        } catch {}

        // Fallback to Firestore users if API returned empty
        if (mList.length === 0) {
          try {
            const mq = query(collection(db, "users"), where("assignedUnitId", "==", normUnitId));
            const msnap = await getDocs(mq);
            mList = msnap.docs.map((d) => d.data() as PortalUser);
          } catch {}
        }

        setMembers(mList);

        // Default check all members present
        const initialChecked: Record<string, boolean> = {};
        mList.forEach((m) => {
          const key = m.displayName || m.email;
          initialChecked[key] = true;
        });
        setCheckedMembers(initialChecked);

        // Attendance history for this unit
        try {
          const aq = query(collection(db, "unit_attendance"), where("unitId", "==", normUnitId));
          const asnap = await getDocs(aq);
          const aList = asnap.docs.map((d) => ({ id: d.id, ...d.data() } as UnitAttendanceRecord));
          aList.sort((a, b) => (a.serviceDate > b.serviceDate ? -1 : 1));
          setAttendanceRecords(aList);
        } catch (e) {
          console.warn("Could not load attendance history:", e);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchUnitData();
  }, [normUnitId]);

  const toggleMemberCheck = (name: string) => {
    setCheckedMembers((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!normUnitId || !serviceDate) return;

    const resolvedService = serviceName === "custom"
      ? (customServiceName.trim() || "Special Gathering")
      : serviceName;

    setSaving(true);
    setMsg("");
    try {
      const presentNames = Object.entries(checkedMembers)
        .filter(([, checked]) => checked)
        .map(([name]) => name);

      const record: UnitAttendanceRecord = {
        unitId: normUnitId,
        serviceDate,
        serviceName: resolvedService,
        presentCount: presentNames.length,
        totalMembers: members.length,
        presentMembers: presentNames,
        notes: notes.trim() || undefined,
        recordedBy: effectiveUser?.displayName || effectiveUser?.email || "Unit Leadership",
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "unit_attendance"), record);
      setMsg("Unit service attendance recorded successfully ✓");
      setNotes("");
      if (serviceName === "custom") {
        setCustomServiceName("");
      }
      setAttendanceRecords((prev) => [record, ...prev]);
      setTimeout(() => setMsg(""), 4000);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

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
                {CANONICAL_SERVICES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {serviceName === "custom" && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Custom Program / Gathering Title
              </label>
              <input
                type="text"
                value={customServiceName}
                onChange={(e) => setCustomServiceName(e.target.value)}
                placeholder="e.g. Festival of Light — Day 3 Evening Session"
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #2090FF", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          )}

          {/* Member Checkbox Grid */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase" }}>
                Mark Present Members ({presentCount} of {members.length} Present)
              </span>
            </div>

            {loadingMembers ? (
              <p style={{ color: "#747CA1", fontSize: "13px" }}>Loading unit roster...</p>
            ) : members.length > 0 ? (
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
                No members registered under {activeUnit?.name} yet. Use the Unit Command Center to add workers from the directory.
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
              cursor: saving || members.length === 0 ? "not-allowed" : "pointer",
              opacity: members.length === 0 ? 0.6 : 1,
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
            {attendanceRecords.map((rec, idx) => (
              <div
                key={rec.id || idx}
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
            No attendance records submitted yet for {activeUnit?.name}.
          </p>
        )}
      </div>
    </div>
  );
}
