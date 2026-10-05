"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { PortalUser } from "@/lib/portalAuth";
import { getRoleColor, getRoleLabel } from "@/lib/portalAuth";

const adminNav = [
  { href: "/portal", label: "Overview", icon: "◈" },
  { href: "/portal/members", label: "Members", icon: "◉" },
  { href: "/portal/units", label: "Units", icon: "⬡" },
  { href: "/portal/attendance", label: "Attendance", icon: "✦" },
  { href: "/portal/finance", label: "Finance", icon: "◇" },
  { href: "/portal/testimonies", label: "Testimonies", icon: "✧" },
  { href: "/portal/pastoral", label: "Pastoral Care", icon: "♡" },
  { href: "/portal/facility", label: "Facility", icon: "▦" },
  { href: "/portal/audit", label: "Audit Log", icon: "◻" },
];

const unitNav = [
  { href: "/portal/unit", label: "Overview", icon: "◈" },
  { href: "/portal/unit/roster", label: "Roster", icon: "◉" },
  { href: "/portal/unit/swaps", label: "Swap Requests", icon: "⟳" },
  { href: "/portal/unit/assets", label: "Assets", icon: "◇" },
  { href: "/portal/unit/attendance", label: "Attendance", icon: "✦" },
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
    await signOut(auth);
    window.location.href = "/portal/login";
  };

  return (
    <aside style={{
      width: collapsed ? "64px" : "240px",
      minHeight: "100vh",
      background: "#0F172A",
      borderRight: "1px solid rgba(255,255,255,0.06)",
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
    }}>
      {/* Header */}
      <div style={{ padding: collapsed ? "20px 16px" : "24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "13px", color: "#F8FAFC", letterSpacing: "-0.01em" }}>TPH</div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "9px", color: "#D97706", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "2px" }}>Admin Portal</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "16px", padding: "4px", lineHeight: 1 }}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* User */}
      {!collapsed && (
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #0140C1, #2090FF)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "14px", color: "#fff" }}>{user.displayName?.[0]?.toUpperCase()}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", color: "#F8FAFC", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.displayName}</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", color: getRoleColor(user.role), fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{getRoleLabel(user.role)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/portal" && item.href !== "/portal/unit" && item.href !== "/portal/member" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: collapsed ? "10px" : "10px 12px",
                borderRadius: "8px",
                marginBottom: "2px",
                background: active ? "rgba(32,144,255,0.15)" : "transparent",
                border: active ? "1px solid rgba(32,144,255,0.2)" : "1px solid transparent",
                color: active ? "#2090FF" : "#94A3B8",
                textDecoration: "none",
                transition: "all 0.15s",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <span style={{ fontSize: "14px", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={handleSignOut}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: collapsed ? "10px" : "10px 12px",
            borderRadius: "8px", width: "100%",
            background: "none", border: "1px solid transparent",
            color: "#EF4444", cursor: "pointer",
            fontFamily: "'Poppins', sans-serif", fontSize: "12px",
            justifyContent: collapsed ? "center" : "flex-start",
            transition: "background 0.15s",
          }}
        >
          <span style={{ fontSize: "14px" }}>⤫</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
