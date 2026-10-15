"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { clearSession } from "@/lib/clientSession";
import type { PortalUser } from "@/lib/portalAuth";
import { getRoleLabel } from "@/lib/portalAuth";

export const adminNav = [
  { href: "/portal", label: "Dashboard", icon: "◈" },
  { href: "/portal/members", label: "Members", icon: "◉" },
  { href: "/portal/units", label: "Church Units", icon: "⬡" },
  { href: "/portal/attendance", label: "Attendance", icon: "✦" },
  { href: "/portal/events", label: "Events", icon: "▦" },
  { href: "/portal/finance", label: "Finances", icon: "◇" },
  { href: "/portal/pastoral", label: "Pastoral Care", icon: "♡" },
  { href: "/portal/testimonies", label: "Testimonies", icon: "✧" },
  { href: "/portal/courses", label: "Courses", icon: "📖" },
  { href: "/portal/facility", label: "Facility", icon: "🏛️" },
  { href: "/portal/audit", label: "Audit Log", icon: "📋" },
];

const unitNav = [
  { href: "/portal/unit", label: "Unit Overview", icon: "◈" },
  { href: "/portal/unit/roster", label: "Duty Roster", icon: "◉" },
  { href: "/portal/unit/swaps", label: "Swap Requests", icon: "⟳" },
  { href: "/portal/unit/assets", label: "Assets", icon: "◇" },
  { href: "/portal/unit/attendance", label: "Unit Attendance", icon: "✦" },
];

const memberNav = [
  { href: "/portal/member", label: "My Dashboard", icon: "◈" },
  { href: "/portal/member/courses", label: "Growth Track", icon: "✦" },
  { href: "/portal/member/prayers", label: "Prayer & Testimony", icon: "♡" },
  { href: "/portal/member/events", label: "Events", icon: "◉" },
  { href: "/portal/member/media", label: "Media", icon: "▶" },
];

interface SidebarProps {
  user: PortalUser;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = user.role === "admin" ? adminNav : user.role === "unit_head" ? unitNav : memberNav;

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
    <aside
      style={{
        width: collapsed ? "72px" : "264px",
        minHeight: "100vh",
        backgroundColor: "#0E1556",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 40,
        overflow: "hidden",
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: collapsed ? "24px 14px 20px" : "28px 24px 24px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(169, 194, 255, 0.12)",
        }}
      >
        {!collapsed && (
          <div>
            <div
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 600,
                fontSize: "11px",
                lineHeight: "18.7px",
                letterSpacing: "0.22em",
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
                fontSize: "14px",
                color: "#A9C2FF",
                marginTop: "4px",
              }}
            >
              Admin dashboard
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "transparent",
            border: "none",
            color: "#A9C2FF",
            cursor: "pointer",
            fontSize: "18px",
            padding: "4px",
            lineHeight: 1,
            marginTop: collapsed ? "0" : "2px",
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* Nav List */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {navItems.map((item) => {
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: collapsed ? "12px 0" : "11px 16px",
                borderRadius: "10px",
                backgroundColor: active ? "#1F46C8" : "transparent",
                color: active ? "#FFFFFF" : "#C9D6FF",
                textDecoration: "none",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "13.5px",
                fontWeight: active ? 600 : 500,
                transition: "all 0.15s ease",
                justifyContent: collapsed ? "center" : "flex-start",
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
              <span style={{ fontSize: "15px", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer matching Figma */}
      <div
        style={{
          padding: collapsed ? "16px 12px" : "18px 20px",
          borderTop: "1px solid #2F5BE0",
          backgroundColor: "#0E1556",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: collapsed ? "center" : "flex-start" }}>
          {/* Avatar Badge */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "18px",
              backgroundColor: "#1F46C8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 600,
                fontSize: "12px",
                color: "#FFFFFF",
              }}
            >
              {getInitials(user.displayName)}
            </span>
          </div>

          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 700,
                  fontSize: "13px",
                  lineHeight: "18px",
                  color: "#FFFFFF",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.displayName || "Admin User"}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "10.5px",
                  color: "#A9C2FF",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {getRoleLabel(user.role)}
              </div>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleSignOut}
              title="Sign Out"
              style={{
                background: "transparent",
                border: "none",
                color: "#A9C2FF",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: "4px",
                fontSize: "13px",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#FF6B6B")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#A9C2FF")}
            >
              ⤫
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
