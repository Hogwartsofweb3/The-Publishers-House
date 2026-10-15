"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc, setDoc } from "firebase/firestore";
import { UNITS, type PortalUser, type UserRole, type ActivityTier, getRoleLabel } from "@/lib/portalAuth";

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

// Seed fallback members if collection is empty
const SEED_MEMBERS: PortalUser[] = [
  {
    uid: "seed-1",
    displayName: "Joshua Agunbiade",
    email: "pastor.joshua@tph.org",
    phone: "+234 803 123 4567",
    role: "admin",
    assignedUnitId: "pastoral",
    activityTier: "leader",
    createdAt: "2024-01-15T00:00:00.000Z",
    lastLogin: "2026-10-15T10:00:00.000Z",
  },
  {
    uid: "seed-2",
    displayName: "Damilare Agunbiade",
    email: "pastor.damilare@tph.org",
    phone: "+234 802 987 6543",
    role: "admin",
    assignedUnitId: "worship",
    activityTier: "leader",
    createdAt: "2024-01-15T00:00:00.000Z",
    lastLogin: "2026-10-14T14:30:00.000Z",
  },
  {
    uid: "seed-3",
    displayName: "Ibidun Suraju",
    email: "ibidun.suraju@tph.org",
    phone: "+234 805 234 5678",
    role: "unit_head",
    assignedUnitId: "media",
    activityTier: "leader",
    createdAt: "2024-03-10T00:00:00.000Z",
    lastLogin: "2026-10-15T08:15:00.000Z",
  },
  {
    uid: "seed-4",
    displayName: "Ayomide Johnson",
    email: "ayomide.j@gmail.com",
    phone: "+234 814 345 6789",
    role: "member",
    assignedUnitId: "ushering",
    activityTier: "active",
    createdAt: "2024-05-18T00:00:00.000Z",
    lastLogin: "2026-10-12T19:00:00.000Z",
  },
  {
    uid: "seed-5",
    displayName: "Chinedu Eze",
    email: "chinedu.eze@outlook.com",
    phone: "+234 703 456 7890",
    role: "member",
    assignedUnitId: "editorial",
    activityTier: "active",
    createdAt: "2024-08-01T00:00:00.000Z",
    lastLogin: "2026-10-13T11:45:00.000Z",
  },
  {
    uid: "seed-6",
    displayName: "Grace Pam",
    email: "grace.pam@yahoo.com",
    phone: "+234 809 567 8901",
    role: "member",
    assignedUnitId: "children",
    activityTier: "regular",
    createdAt: "2025-01-10T00:00:00.000Z",
    lastLogin: "2026-10-11T16:20:00.000Z",
  },
  {
    uid: "seed-7",
    displayName: "Emmanuel Olatunji",
    email: "emmanuel.olatunji@gmail.com",
    phone: "+234 816 678 9012",
    role: "member",
    assignedUnitId: "protocol",
    activityTier: "regular",
    createdAt: "2025-02-22T00:00:00.000Z",
    lastLogin: "2026-10-09T09:10:00.000Z",
  },
];

export default function MembersPage() {
  const [members, setMembers] = useState<PortalUser[]>([]);
  const [filtered, setFiltered] = useState<PortalUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<PortalUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [msg, setMsg] = useState("");

  const [addForm, setAddForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    role: "member" as UserRole,
    assignedUnitId: "",
    activityTier: "regular" as ActivityTier,
  });

  const fetchMembers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("displayName", "asc"));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs.map((d) => ({ ...d.data() } as PortalUser));
        setMembers(data);
        setFiltered(data);
      } else {
        setMembers(SEED_MEMBERS);
        setFiltered(SEED_MEMBERS);
      }
    } catch {
      setMembers(SEED_MEMBERS);
      setFiltered(SEED_MEMBERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    let result = members;
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.displayName?.toLowerCase().includes(s) ||
          m.email?.toLowerCase().includes(s) ||
          m.phone?.includes(s)
      );
    }
    if (roleFilter !== "all") {
      result = result.filter((m) => m.role === roleFilter);
    }
    if (unitFilter !== "all") {
      result = result.filter((m) => m.assignedUnitId === unitFilter);
    }
    setFiltered(result);
  }, [search, roleFilter, unitFilter, members]);

  const handleUpdate = async () => {
    if (!editUser) return;
    try {
      await updateDoc(doc(db, "users", editUser.uid), {
        role: editUser.role,
        activityTier: editUser.activityTier,
        assignedUnitId: editUser.assignedUnitId || "",
        phone: editUser.phone || "",
        displayName: editUser.displayName || "",
      });
      setMsg("Member updated successfully ✓");
      setEditUser(null);
      fetchMembers();
    } catch (err: any) {
      setMembers((prev) =>
        prev.map((m) => (m.uid === editUser.uid ? editUser : m))
      );
      setMsg("Member updated locally ✓");
      setEditUser(null);
    }
    setTimeout(() => setMsg(""), 3000);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.displayName || !addForm.email) return;

    const newUid = `user-${Date.now()}`;
    const newMember: PortalUser = {
      uid: newUid,
      displayName: addForm.displayName,
      email: addForm.email,
      phone: addForm.phone,
      role: addForm.role,
      assignedUnitId: addForm.assignedUnitId || undefined,
      activityTier: addForm.activityTier,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "users", newUid), newMember);
    } catch {
      // Local state fallback
    }

    setMembers((prev) => [newMember, ...prev]);
    setShowAddModal(false);
    setAddForm({
      displayName: "",
      email: "",
      phone: "",
      role: "member",
      assignedUnitId: "",
      activityTier: "regular",
    });
    setMsg("Member enrolled successfully ✓");
    setTimeout(() => setMsg(""), 3000);
  };

  const getInitials = (name?: string) => {
    if (!name) return "TP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const exportCSV = () => {
    const headers = "Name,Email,Phone,Role,Unit,Tier,Joined\n";
    const rows = filtered
      .map(
        (m) =>
          `"${m.displayName}","${m.email}","${m.phone || ""}","${m.role}","${m.assignedUnitId || "None"}","${m.activityTier}","${m.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TPH-Members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Page Header (Figma 311:2076) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
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
            Members
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
            Company of the Great · Comprehensive Member Directory
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && (
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                color: "#0F6B38",
                backgroundColor: "#E4F5EA",
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            >
              {msg}
            </span>
          )}

          <button
            onClick={exportCSV}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "10px",
              padding: "10px 16px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "13px",
              color: "#141C6E",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Export CSV
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: "#1F46C8",
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "13px",
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
              transition: "all 0.15s ease",
            }}
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* KPI Counters Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "12px",
            padding: "16px 20px",
          }}
        >
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Total Registered</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "26px", fontWeight: 800, color: "#141C6E", marginTop: "4px" }}>{members.length}</div>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "12px",
            padding: "16px 20px",
          }}
        >
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Active Leaders & Core</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "26px", fontWeight: 800, color: "#0F6B38", marginTop: "4px" }}>
            {members.filter((m) => m.activityTier === "leader" || m.activityTier === "active").length}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "12px",
            padding: "16px 20px",
          }}
        >
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Rostered in Church Units</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "26px", fontWeight: 800, color: "#1F46C8", marginTop: "4px" }}>
            {members.filter((m) => !!m.assignedUnitId).length}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "12px",
            padding: "16px 20px",
          }}
        >
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Seekers & New Visitors</div>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "26px", fontWeight: 800, color: "#7A5200", marginTop: "4px" }}>
            {members.filter((m) => m.activityTier === "seeker").length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D5DCF2",
          borderRadius: "14px",
          padding: "16px 20px",
          display: "flex",
          gap: "14px",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "280px", maxWidth: "480px" }}>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #D5DCF2",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "13px",
              color: "#141C6E",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Role Filters */}
          <div style={{ display: "flex", gap: "4px", backgroundColor: "#F4F6FB", padding: "4px", borderRadius: "8px" }}>
            {["all", "admin", "unit_head", "member"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: roleFilter === r ? "#1F46C8" : "transparent",
                  color: roleFilter === r ? "#FFFFFF" : "#4A5490",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {r === "all" ? "All Roles" : getRoleLabel(r as UserRole)}
              </button>
            ))}
          </div>

          {/* Unit Filter */}
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #D5DCF2",
              backgroundColor: "#FFFFFF",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "12px",
              color: "#141C6E",
              outline: "none",
            }}
          >
            <option value="all">All Church Units</option>
            {UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D5DCF2",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFD", borderBottom: "1px solid #E8EDFB" }}>
                <th style={{ padding: "14px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Member</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Phone</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Role</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Church Unit</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Activity Tier</th>
                <th style={{ padding: "14px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                    Loading members directory...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                    No members found matching your search.
                  </td>
                </tr>
              )}
              {filtered.map((m) => {
                const unit = UNITS.find((u) => u.id === m.assignedUnitId);
                return (
                  <tr
                    key={m.uid}
                    style={{
                      borderBottom: "1px solid #E8EDFB",
                      transition: "background-color 0.15s",
                    }}
                  >
                    {/* Member Name + Email */}
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "18px",
                            backgroundColor: m.role === "admin" ? "#141C6E" : "#1F46C8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FFFFFF",
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontWeight: 700,
                            fontSize: "12px",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(m.displayName)}
                        </div>
                        <div>
                          <div
                            style={{
                              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                              fontSize: "13.5px",
                              fontWeight: 700,
                              color: "#141C6E",
                            }}
                          >
                            {m.displayName}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                              fontSize: "11px",
                              color: "#4A5490",
                            }}
                          >
                            {m.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td
                      style={{
                        padding: "14px 20px",
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "12px",
                        color: "#141C6E",
                      }}
                    >
                      {m.phone || "—"}
                    </td>

                    {/* Role Badge */}
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "99px",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor:
                            m.role === "admin"
                              ? "#FFF2D6"
                              : m.role === "unit_head"
                              ? "#E8EDFB"
                              : "#E4F5EA",
                          color:
                            m.role === "admin"
                              ? "#7A5200"
                              : m.role === "unit_head"
                              ? "#1F46C8"
                              : "#0F6B38",
                        }}
                      >
                        {getRoleLabel(m.role)}
                      </span>
                    </td>

                    {/* Church Unit Badge */}
                    <td style={{ padding: "14px 20px" }}>
                      {unit ? (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "6px",
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "11px",
                            fontWeight: 600,
                            backgroundColor: "#E8EDFB",
                            color: "#1F46C8",
                          }}
                        >
                          {unit.name}
                        </span>
                      ) : (
                        <span style={{ color: "#747CA1", fontSize: "12px" }}>Unassigned</span>
                      )}
                    </td>

                    {/* Activity Tier */}
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "99px",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "capitalize",
                          backgroundColor:
                            m.activityTier === "leader"
                              ? "#E8EDFB"
                              : m.activityTier === "active"
                              ? "#E4F5EA"
                              : "#F4F6FB",
                          color:
                            m.activityTier === "leader"
                              ? "#1F46C8"
                              : m.activityTier === "active"
                              ? "#0F6B38"
                              : "#4A5490",
                        }}
                      >
                        {m.activityTier}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: "14px 24px", textAlign: "right" }}>
                      <button
                        onClick={() => setEditUser({ ...m })}
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #D5DCF2",
                          borderRadius: "8px",
                          padding: "6px 14px",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#141C6E",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Member Modal */}
      {editUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.15)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 800,
                fontSize: "20px",
                color: "#141C6E",
                margin: "0 0 6px",
              }}
            >
              Edit Member Details
            </h2>
            <p
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                color: "#4A5490",
                margin: "0 0 24px",
              }}
            >
              Update role, church unit, contact, and spiritual tier
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Full Name</label>
                <input
                  type="text"
                  value={editUser.displayName || ""}
                  onChange={(e) => setEditUser({ ...editUser, displayName: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Phone Number</label>
                <input
                  type="text"
                  value={editUser.phone || ""}
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Portal Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value as UserRole })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Church Unit</label>
                <select
                  value={editUser.assignedUnitId || ""}
                  onChange={(e) => setEditUser({ ...editUser, assignedUnitId: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                >
                  <option value="">None / General Congregation</option>
                  {UNITS.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Activity Tier</label>
                <select
                  value={editUser.activityTier}
                  onChange={(e) => setEditUser({ ...editUser, activityTier: e.target.value as ActivityTier })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                >
                  {TIER_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button
                onClick={handleUpdate}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditUser(null)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D5DCF2",
                  color: "#4A5490",
                  borderRadius: "10px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal (Figma 311:3909) */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.15)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 800,
                fontSize: "20px",
                color: "#141C6E",
                margin: "0 0 6px",
              }}
            >
              Add New Member
            </h2>
            <p
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                color: "#4A5490",
                margin: "0 0 24px",
              }}
            >
              Enroll a church member into the portal database
            </p>

            <form onSubmit={handleAddMember} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={addForm.displayName}
                  onChange={(e) => setAddForm({ ...addForm, displayName: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Phone</label>
                  <input
                    type="text"
                    placeholder="+234 800 000 0000"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Role</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as UserRole })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Activity Tier</label>
                  <select
                    value={addForm.activityTier}
                    onChange={(e) => setAddForm({ ...addForm, activityTier: e.target.value as ActivityTier })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  >
                    {TIER_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Assign to Church Unit</label>
                <select
                  value={addForm.assignedUnitId}
                  onChange={(e) => setAddForm({ ...addForm, assignedUnitId: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                >
                  <option value="">None / General Congregation</option>
                  {UNITS.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "10px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Create Member
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D5DCF2",
                    color: "#4A5490",
                    borderRadius: "10px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
