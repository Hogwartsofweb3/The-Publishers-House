"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";
import { getPortalUser, PortalUser, UNITS } from "@/lib/portalAuth";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

interface RosterAssignment {
  id?: string;
  unitId: string;
  serviceName: string;
  serviceDate: string;
  memberName: string;
  memberUid: string;
  dutyRole: string;
  status: "confirmed" | "scheduled" | "swapped";
  notes?: string;
}

export default function UnitRosterPage() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<PortalUser[]>([]);
  const [roster, setRoster] = useState<RosterAssignment[]>([]);

  // Form
  const [serviceName, setServiceName] = useState("Sunday Word Encounter");
  const [serviceDate, setServiceDate] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [dutyRole, setDutyRole] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const activeUnit = UNITS.find((u) => u.id === user?.assignedUnitId) || UNITS[0];

  useEffect(() => {
    // Next Sunday default
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
    setServiceDate(d.toISOString().split("T")[0]);

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
      // Fetch unit members
      const mq = query(collection(db, "users"), where("assignedUnitId", "==", unitId));
      const msnap = await getDocs(mq);
      const mList = msnap.docs.map((d) => d.data() as PortalUser);
      setMembers(mList);
      if (mList.length > 0 && !selectedMember) {
        setSelectedMember(mList[0].displayName || mList[0].email);
      }

      // Fetch unit roster
      const rq = query(collection(db, "unit_rosters"), where("unitId", "==", unitId));
      const rsnap = await getDocs(rq);
      const rList = rsnap.docs.map((d) => ({ id: d.id, ...d.data() } as RosterAssignment));
      rList.sort((a, b) => (a.serviceDate > b.serviceDate ? -1 : 1));
      setRoster(rList);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.assignedUnitId || !selectedMember || !dutyRole.trim() || !serviceDate) return;
    setSaving(true);
    setMsg("");
    try {
      const mem = members.find((m) => m.displayName === selectedMember || m.email === selectedMember);
      const newEntry: RosterAssignment = {
        unitId: user.assignedUnitId,
        serviceName,
        serviceDate,
        memberName: selectedMember,
        memberUid: mem?.uid || "",
        dutyRole: dutyRole.trim(),
        status: "scheduled",
        notes: notes.trim() || undefined,
      };

      await addDoc(collection(db, "unit_rosters"), newEntry);
      setMsg("Duty assigned successfully ✓");
      setDutyRole("");
      setNotes("");
      fetchUnitData(user.assignedUnitId);
      setTimeout(() => setMsg(""), 4000);
    } catch (err: any) {
      alert("Error adding duty: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Delete this duty assignment?")) return;
    try {
      await deleteDoc(doc(db, "unit_rosters", id));
      if (user?.assignedUnitId) fetchUnitData(user.assignedUnitId);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", color: "#1F46C8" }}>Loading duty roster...</div>;
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
          Unit Management · {activeUnit?.name}
        </div>
        <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 32px)", color: "#141C6E", margin: 0 }}>
          Unit Duty Roster &amp; Assignments
        </h1>
        <p style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontStyle: "italic", fontSize: "14.5px", color: "#4A5490", marginTop: "6px" }}>
          Schedule and manage ministry worker assignments for upcoming church services and vigils.
        </p>
      </div>

      {/* Roster Assignment Form */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: "0 0 20px" }}>
          Assign Service Duty
        </h2>

        <form onSubmit={handleAddAssignment}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Service / Program
              </label>
              <select
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Sunday Word Encounter">Sunday Word Encounter (9:00 AM)</option>
                <option value="Wednesday Bible Study">Wednesday Bible Study (5:30 PM)</option>
                <option value="Friday All-Night Prayer">Friday All-Night Prayer (10:00 PM)</option>
                <option value="Special Ministry Conference">Special Ministry Conference</option>
              </select>
            </div>

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
                Assigned Unit Member
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                {members.length > 0 ? (
                  members.map((m) => (
                    <option key={m.uid} value={m.displayName || m.email}>
                      {m.displayName || m.email}
                    </option>
                  ))
                ) : (
                  <option value="">No members found in this unit</option>
                )}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Duty Role / Post
              </label>
              <input
                type="text"
                value={dutyRole}
                onChange={(e) => setDutyRole(e.target.value)}
                placeholder="e.g. Audio Mixer / Camera 1 / Usher"
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
              Special Briefing / Instructions (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Arrive 45 mins before service for sound check"
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
            {saving ? "Scheduling..." : "Add to Duty Roster"}
          </button>
        </form>
      </div>

      {/* Roster Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: "0 0 16px" }}>
          Scheduled Service Roster
        </h2>

        {roster.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #D5DCF2", color: "#4A5490" }}>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Date</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Service</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Member</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Duty Role</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Status</th>
                  <th style={{ padding: "12px 14px", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #E8EDFB" }}>
                    <td style={{ padding: "14px", fontWeight: 600, color: "#141C6E" }}>
                      {row.serviceDate}
                    </td>
                    <td style={{ padding: "14px", color: "#4A5490" }}>{row.serviceName}</td>
                    <td style={{ padding: "14px", fontWeight: 700, color: "#1F46C8" }}>{row.memberName}</td>
                    <td style={{ padding: "14px", color: "#141C6E" }}>{row.dutyRole}</td>
                    <td style={{ padding: "14px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: "4px", backgroundColor: "#DCFCE7", color: "#166534", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px", textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(row.id)}
                        style={{ padding: "4px 8px", backgroundColor: "#FFF1F2", color: "#BE123C", border: "1px solid #FECDD3", borderRadius: "4px", fontSize: "11.5px", cursor: "pointer" }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#747CA1", fontSize: "13px", fontStyle: "italic", margin: 0 }}>
            No duty assignments scheduled yet. Use the form above to assign workers for upcoming services.
          </p>
        )}
      </div>
    </div>
  );
}
