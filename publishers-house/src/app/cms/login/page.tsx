"use client";

import { useState } from "react";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { clearSession, establishSession } from "@/lib/clientSession";
import { useRouter } from "next/navigation";

export default function CMSLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const enterCms = async (firebaseUser: User) => {
    try {
      const session = await establishSession(firebaseUser);
      if (session.role !== "admin") {
        await clearSession();
        await signOut(auth);
        setError("This account does not have CMS access.");
        return;
      }
      router.push("/cms");
    } catch (err) {
      await signOut(auth).catch(() => undefined);
      throw err;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await enterCms(cred.user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to log in.";
      if (msg.includes("No portal profile")) {
        setError("This account does not have CMS access.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      await enterCms(cred.user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      if (msg.includes("No portal profile")) {
        setError("This account does not have CMS access.");
      } else if (!msg.includes("popup-closed-by-user")) {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError("");
    setInfo("");
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo("Password reset email sent. Check your inbox.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send the reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#151A54" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/hero-v2.webp')", backgroundSize: "cover", backgroundPosition: "center top", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(21,26,84,0.88)", zIndex: 1 }} />

      <div style={{ position: "absolute", top: "40px", right: "48px", zIndex: 2 }}>
        <img src="/images/nav-logo.png" alt="The Publishers House" style={{ height: "96px" }} />
      </div>

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
              style={{ width: "100%", padding: "14px 16px", borderRadius: "6px", border: "1px solid #D3DAEC", fontFamily: "'Playfair Display', serif", fontSize: "16px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#4A62A0" }}>Password</label>
              <button type="button" onClick={handleReset} disabled={loading} style={{ background: "none", border: "none", padding: 0, color: "#0140C1", fontFamily: "'Poppins', sans-serif", fontSize: "12px", cursor: "pointer" }}>
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "14px 16px", borderRadius: "6px", border: "1px solid #D3DAEC", fontFamily: "'Playfair Display', serif", fontSize: "16px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          {error && <p style={{ color: "#DC2626", fontSize: "13px", fontFamily: "'Poppins', sans-serif", margin: "0" }}>{error}</p>}
          {info && <p style={{ color: "#137333", fontSize: "13px", fontFamily: "'Poppins', sans-serif", margin: "0" }}>{info}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", backgroundColor: "#0140C1", color: "white", border: "none", borderRadius: "6px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "14px", letterSpacing: "0.05em", cursor: loading ? "not-allowed" : "pointer", marginTop: "12px" }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          style={{ width: "100%", marginTop: "12px", padding: "14px", backgroundColor: "white", color: "#151A54", border: "1px solid #D3DAEC", borderRadius: "6px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer" }}
        >
          Continue with Google
        </button>
      </div>

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
