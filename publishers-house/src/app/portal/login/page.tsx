"use client";

import { useState } from "react";
import {
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { createOrUpdatePortalUser, getPortalUser, type UserRole } from "@/lib/portalAuth";
import { establishSession } from "@/lib/clientSession";
import { useRouter } from "next/navigation";

function destinationFor(role: UserRole) {
  if (role === "admin") return "/portal";
  if (role === "unit_head") return "/portal/unit";
  return "/portal/member";
}

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [continueTo, setContinueTo] = useState("");
  const router = useRouter();

  const finishSignIn = async (firebaseUser: User) => {
    const existing = await getPortalUser(firebaseUser.uid);
    const portalUser = existing ?? await createOrUpdatePortalUser(firebaseUser);
    const session = await establishSession(firebaseUser);
    const role = (session.role as UserRole) || portalUser.role;
    const next = destinationFor(role);

    if (!existing && !firebaseUser.emailVerified) {
      await sendEmailVerification(firebaseUser);
      setInfo("Check your inbox to verify your email. You can continue into the portal.");
      setContinueTo(next);
      return;
    }

    router.push(next);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setContinueTo("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await finishSignIn(cred.user);
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

  const handleGoogle = async () => {
    setError("");
    setInfo("");
    setContinueTo("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      await finishSignIn(cred.user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      if (!msg.includes("popup-closed-by-user")) setError(msg);
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
    <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#0B0E14", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(32,144,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ marginBottom: "48px", textAlign: "center" }}>
        <img src="/images/nav-logo.png" alt="The Publishers House" style={{ height: "80px", marginBottom: "16px" }} />
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#D97706" }}>Administration Portal</div>
      </div>

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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#94A3B8" }}>Password</label>
              <button type="button" onClick={handleReset} disabled={loading} style={{ background: "none", border: "none", padding: 0, color: "#2090FF", fontFamily: "'Poppins', sans-serif", fontSize: "11px", cursor: "pointer" }}>
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "13px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#F8FAFC", fontFamily: "'Poppins', sans-serif", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          {error && <p style={{ color: "#EF4444", fontSize: "13px", fontFamily: "'Poppins', sans-serif", margin: "0", textAlign: "center" }}>{error}</p>}
          {info && <p style={{ color: "#10B981", fontSize: "13px", fontFamily: "'Poppins', sans-serif", margin: "0", textAlign: "center" }}>{info}</p>}
          {continueTo ? (
            <button
              type="button"
              onClick={() => router.push(continueTo)}
              style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #0140C1 0%, #2090FF 100%)", color: "white", border: "none", borderRadius: "8px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", marginTop: "8px" }}
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "14px", background: loading ? "#374151" : "linear-gradient(135deg, #0140C1 0%, #2090FF 100%)", color: "white", border: "none", borderRadius: "8px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", marginTop: "8px", transition: "opacity 0.2s" }}
            >
              {loading ? "Signing In..." : "Sign In to Portal"}
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading || Boolean(continueTo)}
          style={{ width: "100%", marginTop: "16px", padding: "14px", background: "transparent", color: "#F8FAFC", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "8px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "13px", letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer" }}
        >
          Continue with Google
        </button>
      </div>

      <div style={{ marginTop: "40px", fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "#4B5563", letterSpacing: "0.1em", textAlign: "center" }}>
        Psalm 68:11 · Publishing the Word
      </div>
    </div>
  );
}
