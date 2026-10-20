"use client";

import { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { clearSession, establishSession } from "@/lib/clientSession";
import { useRouter } from "next/navigation";

export default function CMSLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const enterCms = async (firebaseUser: User) => {
    try {
      const session = await establishSession(firebaseUser);
      const allowedRoles = ["admin", "super_admin", "portal_manager"];
      const userEmail = (firebaseUser.email || session.email || "").toLowerCase();
      const isAllowed =
        allowedRoles.includes(session.role) ||
        userEmail === "thepublishershouse007@gmail.com" ||
        userEmail === "joshuaagunbiade@gmail.com";

      if (!isAllowed) {
        await clearSession();
        await signOut(auth);
        setError("This account does not have CMS access.");
        return;
      }
      router.push("/cms");
    } catch (err: unknown) {
      await signOut(auth).catch(() => undefined);
      throw err;
    }
  };

  // Listen for redirect sign-in return (especially on mobile browsers)
  useEffect(() => {
    let active = true;
    getRedirectResult(auth)
      .then(async (cred) => {
        if (cred && cred.user && active) {
          setLoading(true);
          await enterCms(cred.user);
        }
      })
      .catch((err: unknown) => {
        console.error("CMS Redirect check:", err);
        const msg = err instanceof Error ? err.message : "";
        if (active && msg && !msg.includes("Database is closing") && !msg.includes("popup-closed")) {
          setError(msg);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await enterCms(cred.user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to log in.";
      if (msg.includes("No portal profile")) {
        setError("This account does not have CMS access.");
      } else if (
        msg.includes("user-not-found") ||
        msg.includes("wrong-password") ||
        msg.includes("invalid-credential")
      ) {
        setError("Invalid email or password.");
      } else if (msg.includes("Database is closing")) {
        setError("Connection refreshed. Please tap Sign In again.");
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

    const isMobile =
      typeof window !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      try {
        const cred = await signInWithPopup(auth, provider);
        await enterCms(cred.user);
      } catch (popupErr: any) {
        const pmsg = String(popupErr?.message || "");
        if (
          isMobile ||
          pmsg.includes("Database is closing") ||
          pmsg.includes("popup-blocked")
        ) {
          console.warn("Mobile or popup disruption, switching to signInWithRedirect:", pmsg);
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      if (msg.includes("unauthorized-domain")) {
        setError("Google sign-in is not allowed on this website yet. Add this site under Firebase Authentication, Settings, Authorized domains.");
      } else if (msg.includes("No portal profile")) {
        setError("This account does not have CMS access.");
      } else if (msg.includes("Database is closing")) {
        setError("Connection refreshed. Please tap 'Continue with Google' again.");
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
      await sendPasswordResetEmail(auth, email.trim());
      setInfo("Password reset email sent. Check your inbox.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send the reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#151A54", padding: "20px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/hero-v2.webp')", backgroundSize: "cover", backgroundPosition: "center top", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(21,26,84,0.88)", zIndex: 1 }} />

      <div style={{ position: "absolute", top: "36px", right: "40px", zIndex: 2 }}>
        <img src="/images/nav-logo.png" alt="The Publishers House" style={{ height: "88px", width: "auto" }} />
      </div>

      <div style={{ position: "relative", zIndex: 2, backgroundColor: "white", padding: "44px 36px", borderRadius: "14px", boxShadow: "0 24px 48px rgba(0,0,0,0.22)", width: "100%", maxWidth: "420px", boxSizing: "border-box" }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "26px", color: "#151A54", marginBottom: "28px", textAlign: "center", letterSpacing: "-0.02em" }}>TPH Content Manager</h1>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#4A62A0", marginBottom: "8px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@thepublishershouse.org"
              style={{ width: "100%", padding: "13px 16px", borderRadius: "6px", border: "1px solid #D3DAEC", backgroundColor: "#EEF2FB", color: "#151A54", fontFamily: "'Poppins', sans-serif", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#4A62A0" }}>Password</label>
              <button type="button" onClick={handleReset} disabled={loading} style={{ background: "none", border: "none", padding: 0, color: "#0140C1", fontFamily: "'Poppins', sans-serif", fontSize: "11.5px", fontWeight: 600, cursor: "pointer" }}>
                Forgot password?
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                style={{ width: "100%", padding: "13px 44px 13px 16px", borderRadius: "6px", border: "1px solid #D3DAEC", backgroundColor: "#EEF2FB", color: "#151A54", fontFamily: "'Poppins', sans-serif", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#4A62A0",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>
          {error && <p style={{ color: "#DC2626", fontSize: "12.5px", fontFamily: "'Poppins', sans-serif", margin: "0", padding: "8px 12px", backgroundColor: "#FEE2E2", borderRadius: "6px", textAlign: "center" }}>{error}</p>}
          {info && <p style={{ color: "#16A34A", fontSize: "12.5px", fontFamily: "'Poppins', sans-serif", margin: "0", padding: "8px 12px", backgroundColor: "#DCFCE7", borderRadius: "6px", textAlign: "center" }}>{info}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "13px", backgroundColor: "#0140C1", color: "white", border: "none", borderRadius: "6px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "14px", letterSpacing: "0.04em", cursor: loading ? "not-allowed" : "pointer", marginTop: "6px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          style={{ width: "100%", marginTop: "12px", padding: "13px", backgroundColor: "white", color: "#151A54", border: "1px solid #D3DAEC", borderRadius: "6px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
        >
          <span>Continue with Google</span>
        </button>
      </div>

      <div style={{ position: "relative", zIndex: 2, marginTop: "36px", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>
          Psalm 68:11
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "20px", color: "#FFFFFF" }}>
          Company of the Great
        </div>
      </div>
    </div>
  );
}
