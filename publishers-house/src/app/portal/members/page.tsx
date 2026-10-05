"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc, where } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { UNITS, type PortalUser, type UserRole, type ActivityTier, getRoleColor, getRoleLabel } from "@/lib/portalAuth";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Administrator" },
  { value: "unit_head", label: "Unit Head" },
  { value: "member", label: "Member" },
];

const TIER_OPTIONS: { value: ActivityTier; label: string }[] = [
  { value: "seeker", label: "Seeker" },
  { value: "regular", label: "Regular" },
  { value: "active", label: "Active" },
  { value: "leader", label: "Leader" },
];

const input = {
  width: "100%", padding: "10px 12px", borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)",
  color: "#F8FAFC", fontFamily: "'Poppins', sans-serif", fontSize: "13px",
  outline: "none", boxSizing: "border-box" as const,
};

const label = {
  display: "block", fontFamily: "'Poppins', sans-serif", fontSize: "10px",
  fontWeight: 600 as const, textTransform: "uppercase" as const, letterSpacing: "0.12em",
  color: "#94A3B8", marginBottom: "6px",
};

export default function MembersPage() {
  const [members, setMembers] = useState<PortalUser[]>([]);
  const [filtered, setFiltered] = useState<PortalUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<PortalUser | null>(null);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({ displayName: "", email: "", phone: "", role: "member" as UserRole, assignedUnitId: "", activityTier: "regular" as ActivityTier });

  const fetchMembers = async () => {
    const q = query(collection(db, "users"), orderBy("displayName", "asc"));
    const snap = await getDocs(q);
    const data = snap.docs.map(d => ({ ...d.data() } as PortalUser));
    setMembers(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  useEffect(() => {
    let result = members;
    if (search) result = result.filter(m => m.displayName?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase()));
    if (roleFilter !== "all") result = result.filter(m => m.role === roleFilter);
    setFiltered(result);
  }, [search, roleFilter, members]);

  const handleUpdate = async () => {
    if (!editUser) return;
    await updateDoc(doc(db, "users", editUser.uid), {
      role: editUser.role,
      activityTier: editUser.activityTier,
      assignedUnitId: editUser.assignedUnitId || "",
    });
    setMsg("Member updated ✓");
    setEditUser(null);
    fetchMembers();
    setTimeout(() => setMsg(""), 3000);
  };

  const tierColor = (tier: ActivityTier) => {
    switch (tier) {
      case "seeker": return "#94A3B8";
      case "regular": return "#2090FF";
      case "active": return "#10B981";
      case "leader": return "#D97706";
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", color: "#D97706", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Admin / Members</div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "28px", color: "#F8FAFC", margin: 0 }}>Members</h1>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: "#10B981" }}>{msg}</span>}
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: "#94A3B8" }}>{members.length} total</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...input, maxWidth: "320px", flex: 1 }}
        />
        {["all", "admin", "unit_head", "member"].map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            style={{
              padding: "10px 16px", borderRadius: "8px", border: "1px solid",
              borderColor: roleFilter === r ? "#2090FF" : "rgba(255,255,255,0.12)",
              background: roleFilter === r ? "rgba(32,144,255,0.15)" : "transparent",
              color: roleFilter === r ? "#2090FF" : "#94A3B8",
              fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer",
            }}
          >
            {r === "all" ? "All" : getRoleLabel(r as UserRole)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["Member", "Role", "Unit", "Activity Tier", "Joined", ""].map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontFamily: "'Poppins', sans-serif", fontSize: "10px", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: "#4B5563" }}>Loading members...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "14px", color: "#4B5563" }}>No members found.</td></tr>
            )}
            {filtered.map((m, i) => (
              <tr key={m.uid || i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #0140C1, #2090FF)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "12px", color: "#fff" }}>{m.displayName?.[0]?.toUpperCase() || "?"}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "13px", color: "#F8FAFC" }}>{m.displayName}</div>
                      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "#4B5563" }}>{m.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: "100px", fontSize: "10px",
                    fontFamily: "'Poppins', sans-serif", fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: "0.08em", background: `${getRoleColor(m.role)}22`, color: getRoleColor(m.role),
                  }}>{getRoleLabel(m.role)}</span>
                </td>
                <td style={{ padding: "14px 20px", fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: "#94A3B8" }}>
                  {UNITS.find(u => u.id === m.assignedUnitId)?.name || "—"}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: "100px", fontSize: "10px",
                    fontFamily: "'Poppins', sans-serif", fontWeight: 600, textTransform: "uppercase",
                    letterSpacing: "0.08em", background: `${tierColor(m.activityTier)}22`, color: tierColor(m.activityTier),
                  }}>{m.activityTier}</span>
                </td>
                <td style={{ padding: "14px 20px", fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "#4B5563" }}>
                  {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <button
                    onClick={() => setEditUser({ ...m })}
                    style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#94A3B8", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600 }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "480px" }}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px", color: "#F8FAFC", marginBottom: "24px" }}>Edit Member</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={label}>Role</label>
                <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value as UserRole })} style={{ ...input }}>
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Activity Tier</label>
                <select value={editUser.activityTier} onChange={e => setEditUser({ ...editUser, activityTier: e.target.value as ActivityTier })} style={{ ...input }}>
                  {TIER_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Assigned Unit</label>
                <select value={editUser.assignedUnitId || ""} onChange={e => setEditUser({ ...editUser, assignedUnitId: e.target.value })} style={{ ...input }}>
                  <option value="">None</option>
                  {UNITS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleUpdate} style={{ flex: 1, padding: "12px", background: "#2090FF", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>Save Changes</button>
              <button onClick={() => setEditUser(null)} style={{ flex: 1, padding: "12px", background: "transparent", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
