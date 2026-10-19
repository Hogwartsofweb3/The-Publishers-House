"use client";

import { useState } from "react";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { getPortalUser, createOrUpdatePortalUser, type UserRole } from "@/lib/portalAuth";
import { establishSession } from "@/lib/clientSession";
import { useRouter } from "next/navigation";

function destinationFor(role: UserRole) {
  if (role === "admin" || role === "super_admin" || role === "portal_manager") return "/portal";
  if (role === "unit_head") return "/portal/unit";
  return "/portal/member";
}

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const finishSignIn = async (firebaseUser: User) => {
    try {
      const userEmail = (firebaseUser.email || "").toLowerCase();
      const isSuperAdminEmail =
        userEmail === "joshuaagunbiade@gmail.com" ||
        userEmail === "thepublishershouse007@gmail.com";

      let portalUser = await getPortalUser(firebaseUser.uid);
      if (!portalUser) {
        if (isSuperAdminEmail) {
          portalUser = await createOrUpdatePortalUser(firebaseUser, "super_admin");
        } else {
          setError(
            "No portal account found for this email. Please contact the church admin to have your account created."
          );
          return;
        }
      }
      const session = await establishSession(firebaseUser);
      const role = (session.role as UserRole) || portalUser.role || "member";
      const next = destinationFor(role);
      router.push(next);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not complete sign in.";
      setError(msg);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await finishSignIn(cred.user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in.";
      if (
        msg.includes("user-not-found") ||
        msg.includes("wrong-password") ||
        msg.includes("invalid-credential")
      ) {
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
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = await signInWithPopup(auth, provider);
      await finishSignIn(cred.user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      if (msg.includes("unauthorized-domain")) {
        setError(
          "Google sign-in is not allowed on this website yet. Add this site under Firebase Authentication, Settings, Authorized domains."
        );
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
      setError("Enter your email address first to reset password.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo("Password reset link sent to your email. Check your inbox.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send the reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#151A54",
        padding: "24px",
        overflow: "hidden",
      }}
    >
      {/* Background Congregation Photograph with Blue Tint Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/images/hero-v2.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(21, 26, 84, 0.88)",
          zIndex: 1,
        }}
      />

      {/* Top Right White Logo matching CMS Login */}
      <div
        style={{
          position: "absolute",
          top: "36px",
          right: "44px",
          zIndex: 2,
        }}
      >
        <img
          src="/images/nav-logo.png"
          alt="The Publishers House"
          style={{ height: "88px", width: "auto" }}
        />
      </div>

      {/* Centered White Rounded Card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          backgroundColor: "#FFFFFF",
          padding: "48px 40px",
          borderRadius: "14px",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.25)",
          width: "100%",
          maxWidth: "420px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "26px",
            color: "#151A54",
            marginBottom: "28px",
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          TPH Portal Login
        </h1>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#4A62A0",
                marginBottom: "8px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="thepublishershouse007@gmail.com"
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: "6px",
                border: "1px solid #D3DAEC",
                backgroundColor: "#EEF2FB",
                color: "#151A54",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#4A62A0",
                }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#0140C1",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: "6px",
                border: "1px solid #D3DAEC",
                backgroundColor: "#EEF2FB",
                color: "#151A54",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p
              style={{
                color: "#DC2626",
                fontSize: "12.5px",
                fontFamily: "'Poppins', sans-serif",
                margin: 0,
                padding: "8px 12px",
                backgroundColor: "#FEE2E2",
                borderRadius: "6px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          {info && (
            <p
              style={{
                color: "#16A34A",
                fontSize: "12.5px",
                fontFamily: "'Poppins', sans-serif",
                margin: 0,
                padding: "8px 12px",
                backgroundColor: "#DCFCE7",
                borderRadius: "6px",
                textAlign: "center",
              }}
            >
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              backgroundColor: "#0140C1",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              letterSpacing: "0.04em",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "4px",
              transition: "opacity 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "13px",
            backgroundColor: "white",
            color: "#151A54",
            border: "1px solid #D3DAEC",
            borderRadius: "6px",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Scripture & Subtitle Footer */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          marginTop: "36px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255, 255, 255, 0.75)",
          }}
        >
          Psalm 68:11
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "20px",
            color: "#FFFFFF",
          }}
        >
          Company of the Great
        </div>
      </div>
    </div>
  );
}
