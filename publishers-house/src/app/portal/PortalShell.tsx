"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { clearSession } from "@/lib/clientSession";
import type { PortalUser } from "@/lib/portalAuth";
import Sidebar from "@/components/portal/Sidebar";

export default function PortalShell({
  user,
  children,
}: {
  user: PortalUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await clearSession();
      await signOut(auth);
    } catch {
      // Continue redirect even if network fails
    }
    window.location.href = "/portal/login";
  };

  const getSectionTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return "Dashboard";
    const sub = segments[1];
    switch (sub) {
      case "members": return "Members";
      case "units": return "Church Units";
      case "attendance": return "Attendance & Headcounts";
      case "events": return "Events & Calendar";
      case "finance": return "Finance Overview";
      case "pastoral": return "Pastoral Care";
      case "testimonies": return "Testimonies & Prayers";
      case "courses": return "Theological Courses";
      case "facility": return "Facility & Assets";
      case "audit": return "Audit Log";
      case "settings": return "Settings & Church Profile";
      case "unit": return "Unit Management";
      case "member": return "Member Portal";
      default: return sub.charAt(0).toUpperCase() + sub.slice(1);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F4F6FB" }}>
      <Sidebar user={user} />
      <main style={{ flex: 1, marginLeft: "264px", minHeight: "100vh", overflow: "auto" }}>
        {/* Top bar matching Figma */}
        <div
          style={{
            height: "64px",
            borderBottom: "1px solid #D5DCF2",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
            backgroundColor: "#FFFFFF",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "11px",
              fontWeight: 600,
              color: "#5FCD48",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: "#1F46C8" }}>TPH ADMIN</span>
            <span style={{ color: "#D5DCF2", margin: "0 8px" }}>/</span>
            <span style={{ color: "#141C6E" }}>{getSectionTitle()}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Online Indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", backgroundColor: "#E4F5EA", borderRadius: "99px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#0F6B38" }} />
              <span
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#0F6B38",
                  letterSpacing: "0.04em",
                }}
              >
                Online
              </span>
            </div>

            {/* User Name Badge */}
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#141C6E",
              }}
            >
              {user.displayName}
            </span>

            {/* Settings Link */}
            <Link
              href="/portal/settings"
              title="Portal Settings"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 12px",
                backgroundColor: pathname === "/portal/settings" ? "#EEF2FB" : "#F4F6FB",
                border: "1px solid #D5DCF2",
                borderRadius: "8px",
                color: "#141C6E",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#EEF2FB";
                e.currentTarget.style.borderColor = "#1F46C8";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = pathname === "/portal/settings" ? "#EEF2FB" : "#F4F6FB";
                e.currentTarget.style.borderColor = "#D5DCF2";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>Settings</span>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              title="Sign Out of Portal"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                backgroundColor: "#FEE2E2",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                color: "#DC2626",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#FCD3D3";
                e.currentTarget.style.borderColor = "#F87171";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#FEE2E2";
                e.currentTarget.style.borderColor = "#FECACA";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Content Page area */}
        <div style={{ padding: "36px 40px", maxWidth: "1600px", margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
