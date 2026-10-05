"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getPortalUser } from "@/lib/portalAuth";
import { useRouter } from "next/navigation";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const portalUser = await getPortalUser(cred.user.uid);
      
      if (!portalUser) {
        // New user — default to member portal
        router.push("/portal/member");
        return;
      }
      
      switch (portalUser.role) {
        case "admin": router.push("/portal"); break;
        case "unit_head": router.push("/portal/unit"); break;
        case "member": router.push("/portal/member"); break;
        default: router.push("/portal/member");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in.";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("Invalid email or password.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#0B0E14", overflow: "hidden" }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(32,144,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{ marginBottom: "48px", textAlign: "center" }}>
        <img src="/images/nav-logo.png" alt="The Publishers House" style={{ height: "80px", marginBottom: "16px" }} />
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#D97706" }}>Administration Portal</div>
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "48px",
        width: "100%",
        maxWidth: "420px",
        backdropFilter: "blur(12px)",
      }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "24px", color: "#F8FAFC", marginBottom: "8px", textAlign: "center" }}>Welcome Back</h1>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "14px", color: "#94A3B8", textAlign: "center", marginBottom: "36px" }}>Company of the Great</p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#94A3B8", marginBottom: "8px" }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "13px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#F8FAFC", fontFamily: "'Poppins', sans-serif", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#94A3B8", marginBottom: "8px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "13px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#F8FAFC", fontFamily: "'Poppins', sans-serif", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          {error && <p style={{ color: "#EF4444", fontSize: "13px", fontFamily: "'Poppins', sans-serif", margin: "0", textAlign: "center" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", background: loading ? "#374151" : "linear-gradient(135deg, #0140C1 0%, #2090FF 100%)", color: "white", border: "none", borderRadius: "8px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", marginTop: "8px", transition: "opacity 0.2s" }}
          >
            {loading ? "Signing In..." : "Sign In to Portal"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "40px", fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "#4B5563", letterSpacing: "0.1em", textAlign: "center" }}>
        Psalm 68:11 · Publishing the Word
      </div>
    </div>
  );
}
