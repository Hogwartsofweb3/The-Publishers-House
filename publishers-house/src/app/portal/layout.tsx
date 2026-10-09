"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { getPortalUser, type PortalUser } from "@/lib/portalAuth";
import Sidebar from "@/components/portal/Sidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/portal/login";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (!isLoginPage) router.push("/portal/login");
        setLoading(false);
        return;
      }
      const portalUser = await getPortalUser(firebaseUser.uid);
      if (!portalUser && !isLoginPage) {
        router.push("/portal/login");
        setLoading(false);
        return;
      }
      setUser(portalUser);
      setLoading(false);
    });
    return () => unsub();
  }, [pathname]);

  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0B0E14" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "2px solid rgba(255,255,255,0.1)", borderTop: "2px solid #2090FF", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: "#94A3B8", letterSpacing: "0.1em" }}>Loading Portal...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0E14" }}>
      <Sidebar user={user} />
      <main style={{ flex: 1, marginLeft: "240px", minHeight: "100vh", overflow: "auto" }}>
        {/* Top bar */}
        <div style={{ height: "60px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(15,23,42,0.8)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 30 }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "#4B5563", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <span style={{ color: "#D97706" }}>TPH</span> / {pathname.split("/").filter(Boolean).slice(1).join(" / ") || "Overview"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "#94A3B8" }}>{user.displayName}</span>
          </div>
        </div>
        {/* Page content */}
        <div style={{ padding: "32px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
