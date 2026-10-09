"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { useRouter, usePathname } from "next/navigation";

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== "/cms/login") {
      router.push("/cms/login");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#F4F6FB" }}>
        <p style={{ fontFamily: "'Poppins', sans-serif", color: "#151A54" }}>Loading CMS...</p>
      </div>
    );
  }

  // If not logged in and not on login page, we will redirect anyway.
  if (!user && pathname !== "/cms/login") {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F9FC", position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Background Watermark — black logo, very faint */}
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

      {user && (
        <header style={{
          position: "relative", zIndex: 1,
          backgroundColor: "#151A54",
          padding: "16px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          color: "white"
        }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px" }}>TPH CMS</div>
          <button
            onClick={() => auth.signOut()}
            style={{ backgroundColor: "transparent", border: "1px solid white", color: "white", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontSize: "12px" }}
          >
            Sign Out
          </button>
        </header>
      )}
      <main style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
