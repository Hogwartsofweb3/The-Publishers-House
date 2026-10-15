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
    const portalUser = existing ?? (await createOrUpdatePortalUser(firebaseUser));
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
    setContinueTo("");
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
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#0E1556",
        backgroundImage: "radial-gradient(circle at 50% 20%, #1F46C8 0%, #0E1556 70%)",
        padding: "24px",
      }}
    >
      {/* Brand Header */}
      <div style={{ marginBottom: "36px", textAlign: "center" }}>
        <img
          src="/images/nav-logo.png"
          alt="The Publishers House"
          style={{ height: "64px", marginBottom: "12px", filter: "brightness(0) invert(1)" }}
        />
        <div
          style={{
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#A9C2FF",
          }}
        >
          Administration & Member Portal
        </div>
      </div>

      {/* Login Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D5DCF2",
          borderRadius: "20px",
          padding: "40px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 20px 40px rgba(14, 21, 86, 0.3)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontWeight: 800,
            fontSize: "24px",
            color: "#141C6E",
            margin: "0 0 6px",
            textAlign: "center",
          }}
        >
          Welcome Back
        </h1>
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "14px",
            color: "#4A5490",
            textAlign: "center",
            margin: "0 0 28px",
          }}
        >
          Company of the Great
        </p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "10.5px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#4A5490",
                marginBottom: "6px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@thepublishershouse.org"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #D5DCF2",
                backgroundColor: "#FFFFFF",
                color: "#141C6E",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "13.5px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#4A5490",
                }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  color: "#1F46C8",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Forgot?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #D5DCF2",
                backgroundColor: "#FFFFFF",
                color: "#141C6E",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "13.5px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p
              style={{
                color: "#9B1C1C",
                backgroundColor: "#FDE7E7",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                margin: 0,
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          {info && (
            <div
              style={{
                color: "#0F6B38",
                backgroundColor: "#E4F5EA",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                textAlign: "center",
              }}
            >
              {info}
              {continueTo && (
                <button
                  type="button"
                  onClick={() => router.push(continueTo)}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: "8px",
                    padding: "8px",
                    background: "#0F6B38",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Continue to Portal →
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              backgroundColor: "#1F46C8",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "13px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 3px 8px rgba(31, 70, 200, 0.3)",
              transition: "opacity 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing In..." : "Sign In to Portal"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#E8EDFB" }} />
          <span style={{ fontSize: "11px", color: "#747CA1", textTransform: "uppercase", letterSpacing: "0.08em" }}>OR</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#E8EDFB" }} />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "10px",
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontWeight: 600,
            fontSize: "13px",
            color: "#141C6E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Footer Quote */}
      <div
        style={{
          marginTop: "32px",
          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
          fontSize: "11px",
          color: "#A9C2FF",
          letterSpacing: "0.08em",
          textAlign: "center",
        }}
      >
        Psalm 68:11 · The Lord gave the word: great was the company of those that published it.
      </div>
    </div>
  );
}
