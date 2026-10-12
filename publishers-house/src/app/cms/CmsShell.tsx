"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { clearSession } from "@/lib/clientSession";

export default function CmsShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F9FC", position: "relative", display: "flex", flexDirection: "column" }}>
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "360px", height: "360px",
        backgroundImage: "url('/images/main-tph-logo-b.png')",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: 0.04,
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <header style={{
        position: "relative", zIndex: 1,
        backgroundColor: "#151A54",
        padding: "16px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        color: "white"
      }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px" }}>TPH CMS</div>
        <button
          onClick={async () => {
            await clearSession();
            await signOut(auth);
            window.location.href = "/cms/login";
          }}
          style={{ backgroundColor: "transparent", border: "1px solid white", color: "white", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontSize: "12px" }}
        >
          Sign Out
        </button>
      </header>
      <main style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
