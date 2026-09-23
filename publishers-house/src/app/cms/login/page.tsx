"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function CMSLoginPage() {
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
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/cms");
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#151A54" }}>
      {/* Background Image with Overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/hero-v2.jpg')", backgroundSize: "cover", backgroundPosition: "center top", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(21,26,84,0.88)", zIndex: 1 }} />

      {/* Top Right Logo */}
      <div style={{ position: "absolute", top: "40px", right: "48px", zIndex: 2 }}>
        <img src="/images/nav-logo.png" alt="The Publishers House" style={{ height: "96px" }} />
      </div>

      {/* Login Card */}
      <div style={{ position: "relative", zIndex: 2, backgroundColor: "white", padding: "48px", borderRadius: "12px", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", width: "100%", maxWidth: "420px" }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: "#151A54", marginBottom: "32px", textAlign: "center", letterSpacing: "-0.02em" }}>TPH Content Manager</h1>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#4A62A0", marginBottom: "8px" }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "14px 16px", borderRadius: "6px", border: "1px solid #D3DAEC", fontFamily: "'Playfair Display', serif", fontSize: "16px", outline: "none" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#4A62A0", marginBottom: "8px" }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "14px 16px", borderRadius: "6px", border: "1px solid #D3DAEC", fontFamily: "'Playfair Display', serif", fontSize: "16px", outline: "none" }}
            />
          </div>
          {error && <p style={{ color: "#DC2626", fontSize: "13px", fontFamily: "'Poppins', sans-serif", margin: "0" }}>{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", padding: "14px", backgroundColor: "#0140C1", color: "white", border: "none", borderRadius: "6px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "14px", letterSpacing: "0.05em", cursor: loading ? "not-allowed" : "pointer", marginTop: "12px", transition: "background-color 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#013091"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#0140C1"}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>

      {/* Slogan & Scripture underneath */}
      <div style={{ position: "relative", zIndex: 2, marginTop: "40px", textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
          Psalm 68:11
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "20px", color: "#FFFFFF" }}>
          Company of the Great
        </div>
      </div>
    </div>
  );
}
