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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#F4F6FB" }}>
      <div style={{ backgroundColor: "white", padding: "48px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", width: "100%", maxWidth: "400px" }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "24px", color: "#151A54", marginBottom: "24px", textAlign: "center" }}>TPH Content Manager</h1>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: 600, color: "#4A62A0", marginBottom: "8px" }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #D3DAEC", fontFamily: "'Playfair Display', serif" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: 600, color: "#4A62A0", marginBottom: "8px" }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #D3DAEC", fontFamily: "'Playfair Display', serif" }}
            />
          </div>
          {error && <p style={{ color: "red", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", padding: "12px", backgroundColor: "#0140C1", color: "white", border: "none", borderRadius: "4px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: "8px" }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>
      </div>
    </div>
  );
}
