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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0E14" }}>
      <Sidebar user={user} />
      <main style={{ flex: 1, marginLeft: "240px", minHeight: "100vh", overflow: "auto" }}>
        <div style={{ height: "60px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(15,23,42,0.8)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 30 }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "#4B5563", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <span style={{ color: "#D97706" }}>TPH</span> / {pathname.split("/").filter(Boolean).slice(1).join(" / ") || "Overview"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "#94A3B8" }}>{user.displayName}</span>
          </div>
        </div>
        <div style={{ padding: "32px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
