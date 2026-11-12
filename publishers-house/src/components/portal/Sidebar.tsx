"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { clearSession } from "@/lib/clientSession";
import type { PortalUser } from "@/lib/portalAuth";
import { getRoleLabel, normalizeUnitId, UNITS, DUAL_ROLE_PASTORS } from "@/lib/portalAuth";
import { usePortal } from "@/lib/portalContext";

// ── Realistic Vector SVGs (Brand compliant, non-AI) ──────────────────────────
const Icons = {
  dashboard: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  ),
  members: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  units: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  ),
  attendance: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  ),
  events: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  ),
  finance: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  ),
  pastoral: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  testimonies: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  courses: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  ),
  facility: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
    </svg>
  ),
  communications: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  ),
  audit: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="8" x2="16" y1="10" y2="10" />
      <line x1="8" x2="12" y1="14" y2="14" />
    </svg>
  ),
  settings: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  user: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  roster: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  ),
  swaps: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 3 4 4-4 4" />
      <path d="M20 7H4" />
      <path d="m8 21-4-4 4-4" />
      <path d="M4 17h16" />
    </svg>
  ),
  assets: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  media: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  ),
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export const adminNav: NavItem[] = [
  { href: "/portal", label: "Dashboard", icon: Icons.dashboard },
  { href: "/portal/members", label: "Members", icon: Icons.members },
  { href: "/portal/units", label: "Church Units", icon: Icons.units },
  { href: "/portal/attendance", label: "Attendance", icon: Icons.attendance },
  { href: "/portal/events", label: "Events", icon: Icons.events },
  { href: "/portal/finance", label: "Finances", icon: Icons.finance },
  { href: "/portal/pastoral", label: "Pastoral Care", icon: Icons.pastoral },
  { href: "/portal/testimonies", label: "Testimonies", icon: Icons.testimonies },
  { href: "/portal/courses", label: "Courses", icon: Icons.courses },
  { href: "/portal/facility", label: "Facility", icon: Icons.facility },
  { href: "/portal/communications", label: "Communications", icon: Icons.communications },
  { href: "/portal/audit", label: "Audit Log", icon: Icons.audit },
  { href: "/portal/settings", label: "Settings", icon: Icons.settings },
];

interface SidebarProps {
  user: PortalUser;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  collapsed?: boolean;
  setCollapsed?: (val: boolean) => void;
}

export default function Sidebar({
  user,
  mobileOpen = false,
  onCloseMobile,
  collapsed: externalCollapsed,
  setCollapsed: externalSetCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const toggleCollapse = (next: boolean) => {
    if (externalSetCollapsed) externalSetCollapsed(next);
    else setInternalCollapsed(next);
  };

  let activeRole = user.role;
  let activeUser = user;
  try {
    const ctx = usePortal();
    if (ctx.effectiveUser) {
      activeRole = ctx.effectiveUser.role;
      activeUser = ctx.effectiveUser;
    }
  } catch {}

  const isSecretariat =
    activeRole === "unit_head" &&
    normalizeUnitId(activeUser.assignedUnitId) === "secretariat";

  const isSuperOrAdminOrManager =
    activeRole === "super_admin" ||
    activeRole === "admin" ||
    activeRole === "portal_manager" ||
    isSecretariat;

  const emailClean = (activeUser.email || "").trim().toLowerCase();
  const dualMatch = DUAL_ROLE_PASTORS[emailClean];
  const resolvedUnitId = dualMatch ? dualMatch.unitId : normalizeUnitId(activeUser.assignedUnitId);
  const assignedUnit = UNITS.find((u) => u.id === resolvedUnitId);
  const isUnitHead = Boolean(
    activeRole === "unit_head" ||
    activeUser.isUnitHead ||
    activeUser.roles?.includes("unit_head") ||
    dualMatch
  );
  const isDualUnitHead = (isSuperOrAdminOrManager && isUnitHead && Boolean(assignedUnit)) || Boolean(dualMatch);

  // Active zone tracking
  const isUnitRoute = pathname.startsWith("/portal/unit");
  const isMemberRoute = pathname.startsWith("/portal/member");
  const isAdminRoute = !isUnitRoute && !isMemberRoute && pathname.startsWith("/portal");

  // ── Construct Structured Nav Sections ───────────────────────────────────────
  const sections: NavSection[] = [];

  // Case A: Administrator with Dual Unit Leadership (Merged Duo View)
  if (isSuperOrAdminOrManager && isDualUnitHead && assignedUnit) {
    if (isUnitRoute) {
      // In Unit Mode: Focus on unit management with 1-click back to Admin
      sections.push({
        title: `${assignedUnit.name.toUpperCase()} COMMAND`,
        items: [
          { href: "/portal/unit", label: "Unit Overview", icon: Icons.units },
          { href: "/portal/unit/roster", label: "Duty Roster", icon: Icons.roster },
          { href: "/portal/unit/swaps", label: "Swap Requests", icon: Icons.swaps },
          { href: "/portal/unit/assets", label: "Assets", icon: Icons.assets },
          { href: "/portal/unit/attendance", label: "Unit Attendance", icon: Icons.attendance },
        ],
      });
      sections.push({
        title: "PORTAL SPACES",
        items: [
          { href: "/portal", label: "← Back to Church Admin", icon: Icons.dashboard },
          { href: "/portal/member", label: "My Member Profile", icon: Icons.user },
        ],
      });
      sections.push({
        title: "ACCOUNT",
        items: [{ href: "/portal/settings", label: "Settings", icon: Icons.settings }],
      });
    } else if (isMemberRoute) {
      // In Member Mode: Focus on personal spiritual walk with shortcuts back
      sections.push({
        title: "MY MEMBER PROFILE",
        items: [
          { href: "/portal/member", label: "Member Dashboard", icon: Icons.dashboard },
          { href: "/portal/member/courses", label: "Growth Track", icon: Icons.courses },
          { href: "/portal/member/prayers", label: "Prayer & Testimony", icon: Icons.testimonies },
          { href: "/portal/member/events", label: "Church Events", icon: Icons.events },
          { href: "/portal/member/media", label: "Sermons & Media", icon: Icons.media },
          { href: "/portal/member/inquire", label: "Pastoral Inquiry", icon: Icons.communications },
        ],
      });
      sections.push({
        title: "LEADERSHIP SPACES",
        items: [
          { href: "/portal", label: "Church Admin Portal", icon: Icons.dashboard },
          { href: "/portal/unit", label: `${assignedUnit.name} Command`, icon: Icons.units },
        ],
      });
      sections.push({
        title: "ACCOUNT",
        items: [{ href: "/portal/settings", label: "Settings", icon: Icons.settings }],
      });
    } else {
      // In Admin Mode: Complete administration suite + shortcuts
      sections.push({
        title: "CHURCH ADMINISTRATION",
        items: [
          { href: "/portal", label: "Dashboard", icon: Icons.dashboard },
          { href: "/portal/members", label: "Members", icon: Icons.members },
          { href: "/portal/units", label: "Church Units", icon: Icons.units },
          { href: "/portal/attendance", label: "Attendance", icon: Icons.attendance },
          { href: "/portal/events", label: "Events", icon: Icons.events },
          { href: "/portal/finance", label: "Finances", icon: Icons.finance },
          { href: "/portal/pastoral", label: "Pastoral Care", icon: Icons.pastoral },
          { href: "/portal/testimonies", label: "Testimonies", icon: Icons.testimonies },
          { href: "/portal/courses", label: "Courses", icon: Icons.courses },
          { href: "/portal/facility", label: "Facility", icon: Icons.facility },
          { href: "/portal/communications", label: "Communications", icon: Icons.communications },
          { href: "/portal/audit", label: "Audit Log", icon: Icons.audit },
        ],
      });
      sections.push({
        title: "MY RESPONSIBILITIES",
        items: [
          { href: "/portal/unit", label: `My Unit: ${assignedUnit.name}`, icon: Icons.units },
          { href: "/portal/member", label: "My Member Profile", icon: Icons.user },
        ],
      });
      sections.push({
        title: "ACCOUNT",
        items: [{ href: "/portal/settings", label: "Settings", icon: Icons.settings }],
      });
    }
  }

  // Case B: Pure Unit Head (e.g. Danny Mikey) — Member profile + Unit command
  else if (activeRole === "unit_head") {
    const unitTitle = assignedUnit ? `${assignedUnit.name.toUpperCase()} UNIT` : "UNIT LEADERSHIP";
    sections.push({
      title: unitTitle,
      items: [
        { href: "/portal/unit", label: "Unit Overview", icon: Icons.units },
        { href: "/portal/member/unit", label: "My Unit Info", icon: Icons.members },
        { href: "/portal/unit/roster", label: "Duty Roster", icon: Icons.roster },
        { href: "/portal/unit/swaps", label: "Swap Requests", icon: Icons.swaps },
        { href: "/portal/unit/assets", label: "Assets", icon: Icons.assets },
        { href: "/portal/unit/attendance", label: "Unit Attendance", icon: Icons.attendance },
      ],
    });
    sections.push({
      title: "MY MEMBER PROFILE",
      items: [
        { href: "/portal/member", label: "Member Dashboard", icon: Icons.dashboard },
        { href: "/portal/member/courses", label: "Growth Track", icon: Icons.courses },
        { href: "/portal/member/prayers", label: "Prayer & Testimony", icon: Icons.testimonies },
        { href: "/portal/member/events", label: "Church Events", icon: Icons.events },
        { href: "/portal/member/media", label: "Sermons & Media", icon: Icons.media },
        { href: "/portal/member/inquire", label: "Pastoral Inquiry", icon: Icons.communications },
      ],
    });
    sections.push({
      title: "ACCOUNT",
      items: [{ href: "/portal/settings", label: "Settings", icon: Icons.settings }],
    });
  }

  // Case C: Standard Church Administrator (without a specific assigned unit)
  else if (isSuperOrAdminOrManager) {
    sections.push({
      title: "CHURCH ADMINISTRATION",
      items: [
        { href: "/portal", label: "Dashboard", icon: Icons.dashboard },
        { href: "/portal/members", label: "Members", icon: Icons.members },
        { href: "/portal/units", label: "Church Units", icon: Icons.units },
        { href: "/portal/attendance", label: "Attendance", icon: Icons.attendance },
        { href: "/portal/events", label: "Events", icon: Icons.events },
        { href: "/portal/finance", label: "Finances", icon: Icons.finance },
        { href: "/portal/pastoral", label: "Pastoral Care", icon: Icons.pastoral },
        { href: "/portal/testimonies", label: "Testimonies", icon: Icons.testimonies },
        { href: "/portal/courses", label: "Courses", icon: Icons.courses },
        { href: "/portal/facility", label: "Facility", icon: Icons.facility },
        { href: "/portal/communications", label: "Communications", icon: Icons.communications },
        { href: "/portal/audit", label: "Audit Log", icon: Icons.audit },
      ],
    });
    sections.push({
      title: "PERSONAL",
      items: [
        { href: "/portal/member", label: "My Member Profile", icon: Icons.user },
        { href: "/portal/settings", label: "Settings", icon: Icons.settings }],
    });
  }

  // Case D: Member Assigned to a Unit (Member Profile + Unit Duty Obligations)
  else if (assignedUnit) {
    sections.push({
      title: "MY SPIRITUAL WALK",
      items: [
        { href: "/portal/member", label: "My Dashboard", icon: Icons.dashboard },
        { href: "/portal/member/courses", label: "Growth Track", icon: Icons.courses },
        { href: "/portal/member/prayers", label: "Prayer & Testimony", icon: Icons.testimonies },
        { href: "/portal/member/events", label: "Events", icon: Icons.events },
        { href: "/portal/member/media", label: "Sermons & Media", icon: Icons.media },
        { href: "/portal/member/inquire", label: "Pastoral Inquiry", icon: Icons.communications },
      ],
    });
    sections.push({
      title: `MY UNIT: ${assignedUnit.name.toUpperCase()}`,
      items: [
        { href: "/portal/member/unit", label: "My Unit Info", icon: Icons.units },
        { href: "/portal/unit/roster", label: "Duty Roster", icon: Icons.roster },
        { href: "/portal/unit/swaps", label: "Swap Requests", icon: Icons.swaps },
      ],
    });
    sections.push({
      title: "ACCOUNT",
      items: [{ href: "/portal/settings", label: "Settings", icon: Icons.settings }],
    });
  }

  // Case E: Regular Church Member (not yet in a unit)
  else {
    sections.push({
      title: "MY SPIRITUAL WALK",
      items: [
        { href: "/portal/member", label: "My Dashboard", icon: Icons.dashboard },
        { href: "/portal/member/courses", label: "Growth Track", icon: Icons.courses },
        { href: "/portal/member/prayers", label: "Prayer & Testimony", icon: Icons.testimonies },
        { href: "/portal/member/events", label: "Events", icon: Icons.events },
        { href: "/portal/member/media", label: "Sermons & Media", icon: Icons.media },
        { href: "/portal/member/inquire", label: "Pastoral Inquiry", icon: Icons.communications },
        { href: "/portal/settings", label: "Settings", icon: Icons.settings },
      ],
    });
  }

  const handleSignOut = async () => {
    await clearSession();
    await signOut(auth);
    window.location.href = "/portal/login";
  };

  const getInitials = (name?: string) => {
    if (!name) return "TP";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`portal-sidebar-backdrop ${mobileOpen ? "active" : ""}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={`portal-sidebar-drawer ${mobileOpen ? "open" : ""}`}
        style={{
          width: isCollapsed ? "72px" : "264px",
          minHeight: "100vh",
          backgroundColor: "#0E1556",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          top: 0,
          left: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: isCollapsed ? "24px 14px 16px" : "24px 20px 16px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(169, 194, 255, 0.12)",
          }}
        >
          {!isCollapsed && (
            <div>
              <div
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 700,
                  fontSize: "11px",
                  lineHeight: "18px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#FFFFFF",
                }}
              >
                The Publishers House
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif, 'Playfair Display', serif)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "13.5px",
                  color: "#A9C2FF",
                  marginTop: "2px",
                }}
              >
                {isDualUnitHead
                  ? `${assignedUnit?.name || "Unit"} Head & Admin`
                  : activeRole === "unit_head"
                  ? `${assignedUnit?.name || "Unit"} Head Portal`
                  : activeRole === "admin" || activeRole === "super_admin"
                  ? "Admin Dashboard"
                  : activeRole === "portal_manager"
                  ? "Management Portal"
                  : assignedUnit
                  ? `${assignedUnit.name} Member`
                  : "Member Portal"}
              </div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="portal-mobile-hamburger"
              style={{
                background: "transparent",
                border: "none",
                color: "#A9C2FF",
                cursor: "pointer",
                fontSize: "20px",
                padding: "2px 6px",
                lineHeight: 1,
              }}
              title="Close navigation drawer"
            >
              ✕
            </button>

            {/* Desktop Collapse Button */}
            <button
              onClick={() => toggleCollapse(!isCollapsed)}
              style={{
                background: "transparent",
                border: "none",
                color: "#A9C2FF",
                cursor: "pointer",
                fontSize: "18px",
                padding: "4px",
                lineHeight: 1,
                marginTop: isCollapsed ? "0" : "2px",
              }}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? "›" : "‹"}
            </button>
          </div>
        </div>

        {/* ── Quick Context Mode Switcher Pill (For Unit Heads & Dual Role Admins) ── */}
        {!isCollapsed && (activeRole === "unit_head" || isDualUnitHead) && (
          <div style={{ padding: "12px 14px 6px" }}>
            {isDualUnitHead ? (
              // 3-way toggle for dual administrators
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "3px",
                  gap: "2px",
                }}
              >
                <Link
                  href="/portal"
                  onClick={() => onCloseMobile?.()}
                  style={{
                    padding: "6px 2px",
                    textAlign: "center",
                    borderRadius: "6px",
                    backgroundColor: isAdminRoute ? "#1F46C8" : "transparent",
                    color: "#FFFFFF",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    textDecoration: "none",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    transition: "all 0.15s ease",
                  }}
                  title="Switch to Church Admin View"
                >
                  Admin
                </Link>
                <Link
                  href="/portal/unit"
                  onClick={() => onCloseMobile?.()}
                  style={{
                    padding: "6px 2px",
                    textAlign: "center",
                    borderRadius: "6px",
                    backgroundColor: isUnitRoute ? "#1F46C8" : "transparent",
                    color: "#FFFFFF",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    textDecoration: "none",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    transition: "all 0.15s ease",
                  }}
                  title="Switch to Unit Command View"
                >
                  Unit
                </Link>
                <Link
                  href="/portal/member"
                  onClick={() => onCloseMobile?.()}
                  style={{
                    padding: "6px 2px",
                    textAlign: "center",
                    borderRadius: "6px",
                    backgroundColor: isMemberRoute ? "#1F46C8" : "transparent",
                    color: "#FFFFFF",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    textDecoration: "none",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    transition: "all 0.15s ease",
                  }}
                  title="Switch to Personal Member View"
                >
                  Member
                </Link>
              </div>
            ) : (
              // 2-way toggle for unit heads (e.g. Danny Mikey)
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "3px",
                  gap: "3px",
                }}
              >
                <Link
                  href="/portal/unit"
                  onClick={() => onCloseMobile?.()}
                  style={{
                    padding: "6px 4px",
                    textAlign: "center",
                    borderRadius: "6px",
                    backgroundColor: isUnitRoute ? "#1F46C8" : "transparent",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 700,
                    textDecoration: "none",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    transition: "all 0.15s ease",
                  }}
                >
                  🛡️ Unit Command
                </Link>
                <Link
                  href="/portal/member"
                  onClick={() => onCloseMobile?.()}
                  style={{
                    padding: "6px 4px",
                    textAlign: "center",
                    borderRadius: "6px",
                    backgroundColor: isMemberRoute ? "#1F46C8" : "transparent",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 700,
                    textDecoration: "none",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    transition: "all 0.15s ease",
                  }}
                >
                  👤 Member View
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── Nav List Grouped by Sections ── */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {sections.map((section, sIdx) => (
            <div key={sIdx}>
              {section.title && !isCollapsed && (
                <div
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "9.5px",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    color: "#7D8EB5",
                    textTransform: "uppercase",
                    padding: "10px 12px 4px",
                  }}
                >
                  {section.title}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {section.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/portal" &&
                      item.href !== "/portal/unit" &&
                      item.href !== "/portal/member" &&
                      pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      onClick={() => onCloseMobile?.()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: isCollapsed ? "11px 0" : "9px 14px",
                        borderRadius: "8px",
                        backgroundColor: active ? "#1F46C8" : "transparent",
                        color: active ? "#FFFFFF" : "#C9D6FF",
                        textDecoration: "none",
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        fontSize: "13px",
                        fontWeight: active ? 600 : 500,
                        transition: "all 0.15s ease",
                        justifyContent: isCollapsed ? "center" : "flex-start",
                      }}
                      onMouseOver={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                          e.currentTarget.style.color = "#FFFFFF";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#C9D6FF";
                        }
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer matching Figma */}
        <div
          style={{
            padding: isCollapsed ? "16px 10px" : "16px 18px",
            borderTop: "1px solid #2F5BE0",
            backgroundColor: "#0E1556",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              justifyContent: isCollapsed ? "center" : "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              {/* Avatar Badge */}
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  backgroundColor: "#1F46C8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {activeUser.photoURL ? (
                  <img
                    src={activeUser.photoURL}
                    alt={activeUser.displayName}
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontWeight: 600,
                      fontSize: "12px",
                      color: "#FFFFFF",
                    }}
                  >
                    {getInitials(activeUser.displayName)}
                  </span>
                )}
              </div>

              {!isCollapsed && (
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontWeight: 700,
                      fontSize: "12.5px",
                      lineHeight: "16px",
                      color: "#FFFFFF",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {activeUser.displayName || "Portal User"}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "10.5px",
                      color: "#A9C2FF",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginTop: "1px",
                    }}
                  >
                    {isDualUnitHead
                      ? `${assignedUnit?.name || "Unit"} Head · Admin`
                      : activeRole === "unit_head"
                      ? `${assignedUnit?.name || "Unit"} Head`
                      : getRoleLabel(activeRole)}
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={handleSignOut}
                title="Sign Out of Portal"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "rgba(254, 226, 226, 0.12)",
                  border: "1px solid rgba(254, 202, 202, 0.2)",
                  color: "#FFA8A8",
                  cursor: "pointer",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.3)";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(254, 226, 226, 0.12)";
                  e.currentTarget.style.color = "#FFA8A8";
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Exit</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
