"use client";

import { usePathname } from "next/navigation";
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

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
