"use client";

import { useEffect, useState } from "react";
import { UNITS, type PortalUser, type UserRole, type ActivityTier, type Campus, getRoleLabel, getRoleColor } from "@/lib/portalAuth";
import { usePortal } from "@/lib/portalContext";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Administrator" },
  { value: "portal_manager", label: "Portal Manager" },
  { value: "unit_head", label: "Unit Head" },
  { value: "member", label: "Member" },
];

const TIER_OPTIONS: { value: ActivityTier; label: string }[] = [
  { value: "seeker", label: "Seeker" },
  { value: "regular", label: "Regular" },
  { value: "active", label: "Active" },
  { value: "leader", label: "Leader" },
];

export default function MembersPage() {
  const { campus: globalCampus } = usePortal();
  const [members, setMembers] = useState<PortalUser[]>([]);
  const [filtered, setFiltered] = useState<PortalUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [campusFilter, setCampusFilter] = useState<"all" | Campus>("all");
  const [loading, setLoading] = useState(true);

  // Modals State
  const [editUser, setEditUser] = useState<PortalUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenuUid, setActiveMenuUid] = useState<string | null>(null);
  const [unitAssignUser, setUnitAssignUser] = useState<PortalUser | null>(null);
  const [invitationModal, setInvitationModal] = useState<{
    user: PortalUser;
    tempPassword?: string;
    emailHtml?: string;
  } | null>(null);

  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Add Member Form State
  const [addForm, setAddForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    role: "member" as UserRole,
    assignedUnitId: "",
    activityTier: "regular" as ActivityTier,
    campus: "jos" as Campus,
    createAuthImmediately: true,
  });

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/members");
      const json = await res.json();
      if (json.ok && Array.isArray(json.members)) {
        setMembers(json.members);
        setFiltered(json.members);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Sync with global campus if changed in header
  useEffect(() => {
    if (globalCampus) {
      setCampusFilter(globalCampus);
    }
  }, [globalCampus]);

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
    if (campusFilter !== "all") {
      result = result.filter((m) => (m.campus || "jos") === campusFilter);
    }
    setFiltered(result);
  }, [search, roleFilter, unitFilter, campusFilter, members]);

  // Handle Member Details Update (including Email!)
  const handleUpdate = async () => {
    if (!editUser) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_member",
          uid: editUser.uid,
          displayName: editUser.displayName,
          email: editUser.email,
          phone: editUser.phone,
          role: editUser.role,
          assignedUnitId: editUser.assignedUnitId,
          activityTier: editUser.activityTier,
          campus: editUser.campus || "jos",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");

      setMsg("Member details updated successfully ✓");
      setEditUser(null);
      fetchMembers();
    } catch (err: any) {
      alert("Failed to update: " + err.message);
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(""), 3500);
    }
  };

  // Handle Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.displayName) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_member",
          ...addForm,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add member");

      setShowAddModal(false);
      setAddForm({
        displayName: "",
        email: "",
        phone: "",
        role: "member",
        assignedUnitId: "",
        activityTier: "regular",
        campus: "jos",
        createAuthImmediately: true,
      });

      if (json.tempPassword) {
        setInvitationModal({
          user: json.member,
          tempPassword: json.tempPassword,
          emailHtml: json.emailHtml,
        });
      } else {
        setMsg("Member enrolled successfully ✓");
        setTimeout(() => setMsg(""), 3500);
      }
      fetchMembers();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Create Account / Send Invite
  const handleCreateAccount = async (member: PortalUser) => {
    if (!member.email) {
      alert("Please add an email address for this member first by editing their details.");
      setEditUser(member);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_account",
          uid: member.uid,
          email: member.email,
          displayName: member.displayName,
          role: member.role,
          phone: member.phone,
          assignedUnitId: member.assignedUnitId,
          campus: member.campus,
          activityTier: member.activityTier,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create account");

      setInvitationModal({
        user: json.user,
        tempPassword: json.tempPassword,
        emailHtml: json.emailHtml,
      });
      fetchMembers();
    } catch (err: any) {
      alert("Error creating account: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Member
  const handleDeleteMember = async (member: PortalUser) => {
    if (!confirm(`Are you sure you want to delete ${member.displayName}? This will delete their portal profile and login access.`)) {
      return;
    }

    try {
      const res = await fetch("/api/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_member",
          uid: member.uid,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");

      setMsg("Member account deleted successfully ✓");
      setTimeout(() => setMsg(""), 3000);
      fetchMembers();
    } catch (err: any) {
      alert("Error deleting member: " + err.message);
    }
  };

  // Handle Assign Unit
  const handleSaveUnitAssignment = async (unitId: string) => {
    if (!unitAssignUser) return;
    try {
      const res = await fetch("/api/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_unit",
          uid: unitAssignUser.uid,
          assignedUnitId: unitId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to assign unit");

      setUnitAssignUser(null);
      setMsg("Unit assignment updated ✓");
      setTimeout(() => setMsg(""), 3000);
      fetchMembers();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "TP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const exportCSV = () => {
    const headers = "Full Name,Email,Phone,Role,Unit,Tier,Campus,Joined Date\n";
    const rows = filtered
      .map(
        (m) =>
          `"${m.displayName}","${m.email}","${m.phone || ""}","${m.role}","${m.assignedUnitId || "None"}","${m.activityTier}","${m.campus || "jos"}","${m.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TPH-Members-${campusFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Page Header */}
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
          <div
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "11px",
              fontWeight: 600,
              color: "#5FCD48",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Directory · Community
          </div>
          <h1
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "28px",
              fontWeight: 800,
              color: "#141C6E",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Members Directory
          </h1>
          <p
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "13px",
              color: "#4A5490",
              marginTop: "6px",
              marginBottom: 0,
            }}
          >
            Official registry of church members, leaders, and portal accounts.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && (
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                color: "#0F6B38",
                fontWeight: 600,
                backgroundColor: "#E4F5EA",
                padding: "6px 14px",
                borderRadius: "8px",
              }}
            >
              {msg}
            </span>
          )}

          <button
            onClick={exportCSV}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 18px",
              borderRadius: "8px",
              border: "1px solid #D5DCF2",
              backgroundColor: "#FFFFFF",
              color: "#141C6E",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <span>📥 Export to CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#1F46C8",
              color: "#FFFFFF",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "12.5px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(31, 70, 200, 0.25)",
            }}
          >
            <span>+ Add Member</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <div style={{ padding: "18px 24px", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #D5DCF2" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#747CA1", textTransform: "uppercase" }}>Total Members</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#141C6E", marginTop: "4px" }}>{members.length}</div>
        </div>

        <div style={{ padding: "18px 24px", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #D5DCF2" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#747CA1", textTransform: "uppercase" }}>Portal Accounts</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#1F46C8", marginTop: "4px" }}>
            {members.filter((m) => m.hasAccount || m.role === "admin" || m.role === "super_admin").length}
          </div>
        </div>

        <div style={{ padding: "18px 24px", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #D5DCF2" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#747CA1", textTransform: "uppercase" }}>Assigned to Units</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#0F6B38", marginTop: "4px" }}>
            {members.filter((m) => m.assignedUnitId).length}
          </div>
        </div>

        <div style={{ padding: "18px 24px", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #D5DCF2" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#747CA1", textTransform: "uppercase" }}>Active Leaders</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#7A5200", marginTop: "4px" }}>
            {members.filter((m) => m.activityTier === "leader" || m.role === "super_admin" || m.role === "admin" || m.role === "unit_head").length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          padding: "16px 20px",
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          border: "1px solid #D5DCF2",
        }}
      >
        <div style={{ flex: 1, minWidth: "240px" }}>
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 14px",
              borderRadius: "8px",
              border: "1px solid #D5DCF2",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "13px",
              color: "#141C6E",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Campus Filter */}
        <select
          value={campusFilter}
          onChange={(e) => setCampusFilter(e.target.value as any)}
          style={{
            padding: "9px 14px",
            borderRadius: "8px",
            border: "1px solid #D5DCF2",
            backgroundColor: "#FFFFFF",
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontSize: "12.5px",
            fontWeight: 600,
            color: "#141C6E",
            outline: "none",
          }}
        >
          <option value="all">🌐 All Campuses</option>
          <option value="jos">📍 Jos Headquarters</option>
          <option value="abuja">📍 Abuja Campus</option>
        </select>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: "9px 14px",
            borderRadius: "8px",
            border: "1px solid #D5DCF2",
            backgroundColor: "#FFFFFF",
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontSize: "12.5px",
            fontWeight: 600,
            color: "#141C6E",
            outline: "none",
          }}
        >
          <option value="all">All Roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Unit Filter */}
        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          style={{
            padding: "9px 14px",
            borderRadius: "8px",
            border: "1px solid #D5DCF2",
            backgroundColor: "#FFFFFF",
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontSize: "12.5px",
            fontWeight: 600,
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

      {/* Members Table */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D5DCF2",
          borderRadius: "14px",
          overflow: "visible",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFD", borderBottom: "1px solid #E8EDFB" }}>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Member</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Email Address</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Phone</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Role</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Church Unit</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Activity Tier</th>
                <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Campus</th>
                <th style={{ padding: "14px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                    Loading members directory...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                    No members found matching your search.
                  </td>
                </tr>
              )}
              {filtered.map((m) => {
                const unit = UNITS.find((u) => u.id === m.assignedUnitId);
                const hasPortalAccess = m.hasAccount || m.role === "admin" || m.role === "super_admin";
                const isMenuOpen = activeMenuUid === m.uid;

                return (
                  <tr
                    key={m.uid}
                    style={{
                      borderBottom: "1px solid #E8EDFB",
                      transition: "background-color 0.15s",
                    }}
                  >
                    {/* Member Name */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "18px",
                            backgroundColor: getRoleColor(m.role),
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
                          {hasPortalAccess && (
                            <span style={{ fontSize: "10px", color: "#0F6B38", fontWeight: 700 }}>
                              ✓ Portal Account Active
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email (Separate Column as Requested) */}
                    <td
                      style={{
                        padding: "14px 20px",
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "12.5px",
                        color: m.email ? "#1F46C8" : "#94A3B8",
                      }}
                    >
                      {m.email || "(No email set)"}
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
                          backgroundColor: `${getRoleColor(m.role)}1A`,
                          color: getRoleColor(m.role),
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

                    {/* Campus */}
                    <td style={{ padding: "14px 20px", fontSize: "12px", color: "#141C6E", textTransform: "capitalize" }}>
                      {m.campus || "jos"}
                    </td>

                    {/* Vertical Three Dots Action Menu (⋮) */}
                    <td style={{ padding: "14px 24px", textAlign: "right", position: "relative" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuUid(isMenuOpen ? null : m.uid);
                        }}
                        style={{
                          backgroundColor: isMenuOpen ? "#E8EDFB" : "#F4F6FB",
                          border: "1px solid #D5DCF2",
                          borderRadius: "8px",
                          width: "32px",
                          height: "32px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#141C6E",
                          fontSize: "18px",
                          fontWeight: 800,
                        }}
                        title="Actions"
                      >
                        ⋮
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: "absolute",
                            right: "24px",
                            top: "44px",
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #D5DCF2",
                            borderRadius: "10px",
                            boxShadow: "0 8px 24px rgba(20, 28, 110, 0.15)",
                            zIndex: 50,
                            minWidth: "190px",
                            padding: "6px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                            textAlign: "left",
                          }}
                        >
                          {/* Create Account / Send Invite */}
                          <button
                            onClick={() => {
                              setActiveMenuUid(null);
                              handleCreateAccount(m);
                            }}
                            style={{
                              padding: "8px 12px",
                              border: "none",
                              borderRadius: "6px",
                              backgroundColor: "transparent",
                              color: "#1F46C8",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              textAlign: "left",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#EEF2FB")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <span>⚡</span>
                            <span>{hasPortalAccess ? "Resend Account Invite" : "Create Account & Invite"}</span>
                          </button>

                          {/* Assign to Unit */}
                          <button
                            onClick={() => {
                              setActiveMenuUid(null);
                              setUnitAssignUser(m);
                            }}
                            style={{
                              padding: "8px 12px",
                              border: "none",
                              borderRadius: "6px",
                              backgroundColor: "transparent",
                              color: "#141C6E",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              textAlign: "left",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#EEF2FB")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <span>🏢</span>
                            <span>Assign to Unit</span>
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setActiveMenuUid(null);
                              setEditUser({ ...m });
                            }}
                            style={{
                              padding: "8px 12px",
                              border: "none",
                              borderRadius: "6px",
                              backgroundColor: "transparent",
                              color: "#141C6E",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              textAlign: "left",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#EEF2FB")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <span>✏️</span>
                            <span>Edit Details</span>
                          </button>

                          <div style={{ height: "1px", backgroundColor: "#E8EDFB", margin: "4px 0" }} />

                          {/* Delete Account */}
                          <button
                            onClick={() => {
                              setActiveMenuUid(null);
                              handleDeleteMember(m);
                            }}
                            style={{
                              padding: "8px 12px",
                              border: "none",
                              borderRadius: "6px",
                              backgroundColor: "transparent",
                              color: "#DC2626",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              textAlign: "left",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#FEE2E2")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <span>🗑️</span>
                            <span>Delete Account</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Member Modal (With Editable Email!) */}
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
                marginTop: 0,
                marginBottom: "8px",
              }}
            >
              Edit Member Details
            </h2>
            <p
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "13px",
                color: "#4A5490",
                marginTop: 0,
                marginBottom: "24px",
              }}
            >
              Modify personal details, email address, role, and department.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate();
              }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={editUser.displayName}
                  onChange={(e) => setEditUser({ ...editUser, displayName: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              {/* Editable Email Field */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Email Address (Required for Sign In) *</label>
                <input
                  type="email"
                  required
                  value={editUser.email || ""}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Phone Number</label>
                  <input
                    type="text"
                    value={editUser.phone || ""}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Campus</label>
                  <select
                    value={editUser.campus || "jos"}
                    onChange={(e) => setEditUser({ ...editUser, campus: e.target.value as any })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    <option value="jos">Jos Headquarters</option>
                    <option value="abuja">Abuja Campus</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Portal Role</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value as UserRole })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Activity Tier</label>
                  <select
                    value={editUser.activityTier}
                    onChange={(e) => setEditUser({ ...editUser, activityTier: e.target.value as ActivityTier })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    {TIER_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Church Unit</label>
                <select
                  value={editUser.assignedUnitId || ""}
                  onChange={(e) => setEditUser({ ...editUser, assignedUnitId: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                >
                  <option value="">No Unit Assigned</option>
                  {UNITS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Saving Updates..." : "Save Member Details"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#F4F6FB",
                    color: "#141C6E",
                    border: "1px solid #D5DCF2",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "12.5px",
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

      {/* Add New Member Modal */}
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
                marginTop: 0,
                marginBottom: "8px",
              }}
            >
              Enroll New Church Member
            </h2>
            <p
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "13px",
                color: "#4A5490",
                marginTop: 0,
                marginBottom: "24px",
              }}
            >
              Add a new believer to the directory and optionally generate their portal credentials.
            </p>

            <form onSubmit={handleAddMember} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Adekunle"
                  value={addForm.displayName}
                  onChange={(e) => setAddForm({ ...addForm, displayName: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. samuel@gmail.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+234 800 000 0000"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Campus</label>
                  <select
                    value={addForm.campus}
                    onChange={(e) => setAddForm({ ...addForm, campus: e.target.value as any })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    <option value="jos">Jos Headquarters</option>
                    <option value="abuja">Abuja Campus</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Portal Role</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as UserRole })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Activity Tier</label>
                  <select
                    value={addForm.activityTier}
                    onChange={(e) => setAddForm({ ...addForm, activityTier: e.target.value as ActivityTier })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                  >
                    {TIER_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Church Unit</label>
                <select
                  value={addForm.assignedUnitId}
                  onChange={(e) => setAddForm({ ...addForm, assignedUnitId: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box" }}
                >
                  <option value="">No Unit Assigned</option>
                  {UNITS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {addForm.email && (
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#141C6E", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={addForm.createAuthImmediately}
                    onChange={(e) => setAddForm({ ...addForm, createAuthImmediately: e.target.checked })}
                  />
                  Create portal login account and generate temporary password immediately
                </label>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Enrolling..." : "Enroll Member"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#F4F6FB",
                    color: "#141C6E",
                    border: "1px solid #D5DCF2",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "12.5px",
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

      {/* Account Invitation & Temp Password Modal */}
      {invitationModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 110,
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
              padding: "36px",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 20px 40px rgba(14, 21, 86, 0.25)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎉</div>
              <h2
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 800,
                  fontSize: "20px",
                  color: "#141C6E",
                  margin: "0 0 6px",
                }}
              >
                Portal Account Created!
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "13px",
                  color: "#4A5490",
                  margin: 0,
                }}
              >
                Account generated for <strong>{invitationModal.user.displayName}</strong> ({invitationModal.user.email}).
              </p>
            </div>

            {/* Credentials Card */}
            <div
              style={{
                backgroundColor: "#F4F6FB",
                border: "1px solid #D5DCF2",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#747CA1", textTransform: "uppercase", marginBottom: "8px" }}>
                Temporary Login Credentials
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "#4A5490" }}>Sign-In Email:</span>
                <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#141C6E" }}>{invitationModal.user.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#4A5490" }}>Temporary Password:</span>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#0140C1", fontFamily: "monospace", backgroundColor: "#FFFFFF", padding: "4px 10px", borderRadius: "6px", border: "1px dashed #2090FF" }}>
                  {invitationModal.tempPassword}
                </span>
              </div>
            </div>

            {/* Warning Note */}
            <div
              style={{
                backgroundColor: "#FEF3C7",
                borderLeft: "4px solid #D97706",
                padding: "12px 16px",
                borderRadius: "4px",
                marginBottom: "24px",
                fontSize: "12.5px",
                color: "#92400E",
                lineHeight: "1.5",
              }}
            >
              ⚠️ <strong>Security Requirement:</strong> The user will be automatically prompted to change this temporary password immediately upon their first sign-in.
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Welcome to The Publishers House Portal!\nEmail: ${invitationModal.user.email}\nTemporary Password: ${invitationModal.tempPassword}\nSign in: https://thepublishershouse.org/portal/login\n(You will be required to change your password on first login).`
                  );
                  alert("✓ Credentials copied to clipboard!");
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "12.5px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                📋 Copy Credentials & Login Link
              </button>

              <button
                onClick={() => setInvitationModal(null)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#F4F6FB",
                  color: "#141C6E",
                  border: "1px solid #D5DCF2",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "12.5px",
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unit Assignment Modal */}
      {unitAssignUser && (
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
              maxWidth: "460px",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.15)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 800,
                fontSize: "18px",
                color: "#141C6E",
                margin: "0 0 8px",
              }}
            >
              Assign Church Unit
            </h2>
            <p
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "13px",
                color: "#4A5490",
                margin: "0 0 20px",
              }}
            >
              Select the ministry department for <strong>{unitAssignUser.displayName}</strong>.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto", marginBottom: "20px" }}>
              <button
                onClick={() => handleSaveUnitAssignment("")}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #D5DCF2",
                  backgroundColor: !unitAssignUser.assignedUnitId ? "#EEF2FB" : "#FFFFFF",
                  color: "#141C6E",
                  fontWeight: 600,
                  fontSize: "12.5px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                🚫 Remove from all units (Unassigned)
              </button>
              {UNITS.map((u) => {
                const selected = unitAssignUser.assignedUnitId === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSaveUnitAssignment(u.id)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: selected ? "2px solid #1F46C8" : "1px solid #D5DCF2",
                      backgroundColor: selected ? "#EEF2FB" : "#FFFFFF",
                      color: selected ? "#1F46C8" : "#141C6E",
                      fontWeight: selected ? 700 : 500,
                      fontSize: "12.5px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{u.name}</span>
                    {selected && <span>✓ Active</span>}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setUnitAssignUser(null)}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#F4F6FB",
                color: "#141C6E",
                border: "1px solid #D5DCF2",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
