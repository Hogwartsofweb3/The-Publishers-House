"use client";

import { useState } from "react";
import { updatePassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { clearSession } from "@/lib/clientSession";
import { UNITS, getRoleLabel, getTierLabel, type PortalUser, type Campus } from "@/lib/portalAuth";

interface MemberSettingsProps {
  user: PortalUser;
  onUserUpdated?: (updated: Partial<PortalUser>) => void;
}

export default function MemberSettings({ user, onUserUpdated }: MemberSettingsProps) {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [campus, setCampus] = useState<Campus>((user.campus as Campus) || "jos");
  const [photoURL, setPhotoURL] = useState(user.photoURL || "");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const unitName = UNITS.find((u) => u.id === user.assignedUnitId)?.name || (user.assignedUnitId ? user.assignedUnitId : "No unit assigned");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    setProfileError("");

    try {
      const res = await fetch("/api/portal/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, phone, campus, photoURL }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }
      setProfileMsg("Profile updated successfully ✓");
      if (onUserUpdated) {
        onUserUpdated({ displayName, phone, campus, photoURL });
      }
      setTimeout(() => setProfileMsg(""), 4000);
    } catch (err: any) {
      setProfileError(err?.message || "Failed to save profile changes");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordError("");

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No active authenticated session found. Please sign in again.");
      }
      await updatePassword(currentUser, newPassword);
      setPasswordMsg("Your password has been updated successfully ✓");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMsg(""), 4000);
    } catch (err: any) {
      if (err?.code === "auth/requires-recent-login") {
        setPasswordError("Security policy: please sign out and sign back in before changing your password.");
      } else {
        setPasswordError(err?.message || "Failed to update password.");
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSendResetEmail = async () => {
    const email = auth.currentUser?.email || user.email;
    if (!email) {
      setPasswordError("No email address found on your account.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setTimeout(() => setResetEmailSent(false), 5000);
    } catch (err: any) {
      setPasswordError("Could not send password reset email: " + err.message);
    }
  };

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out of the portal?")) {
      await clearSession();
      await signOut(auth);
      window.location.href = "/portal/login";
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "8px",
    border: "1px solid #D5DCF2",
    backgroundColor: "#FFFFFF",
    color: "#141C6E",
    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
    fontSize: "13.5px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
    fontSize: "11px",
    fontWeight: 700,
    color: "#4A5490",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "6px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    borderRadius: "14px",
    border: "1px solid #D5DCF2",
    padding: "28px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
  };

  return (
    <div style={{ maxWidth: "920px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontSize: "10.5px",
            fontWeight: 700,
            color: "#1F46C8",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Member Account · Personal Profile
        </div>
        <h1
          style={{
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontWeight: 800,
            fontSize: "clamp(24px, 3vw, 32px)",
            color: "#141C6E",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          My Profile &amp; Settings
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif, 'Playfair Display', serif)",
            fontStyle: "italic",
            fontSize: "14.5px",
            color: "#4A5490",
            marginTop: "6px",
          }}
        >
          Manage your personal information, contact details, campus fellowship, and account security.
        </p>
      </div>

      {/* 1. PERSONAL INFORMATION & CONTACT DETAILS */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#2090FF",
              backgroundImage: photoURL ? `url(${photoURL})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "24px",
              border: "3px solid #D5DCF2",
              flexShrink: 0,
            }}
          >
            {!photoURL && (displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "M")}
          </div>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 700,
                fontSize: "17px",
                color: "#141C6E",
                margin: 0,
              }}
            >
              Personal Information
            </h2>
            <p style={{ fontSize: "12.5px", color: "#747CA1", margin: "4px 0 0" }}>
              Your name and contact details used across The Publishers House fellowship.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={labelStyle}>Full Name / Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Michael Nwadinso Okoro"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Email Address (Sign-In Identity)</label>
              <input
                type="email"
                value={user.email}
                disabled
                style={{
                  ...inputStyle,
                  backgroundColor: "#F4F6FB",
                  color: "#747CA1",
                  cursor: "not-allowed",
                }}
              />
              <span style={{ fontSize: "11px", color: "#747CA1", marginTop: "4px", display: "block" }}>
                Email is managed via your secure portal account.
              </span>
            </div>

            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 813 000 0000"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Preferred Campus</label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value as Campus)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="jos">📍 Jos Headquarters Sanctuary</option>
                <option value="abuja">📍 Abuja Campus Center</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Profile Picture URL</label>
              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://example.com/my-photo.jpg"
                style={inputStyle}
              />
              <span style={{ fontSize: "11px", color: "#747CA1", marginTop: "4px", display: "block" }}>
                Paste a public image link for your avatar.
              </span>
            </div>
          </div>

          {profileMsg && (
            <div style={{ padding: "10px 14px", backgroundColor: "#DCFCE7", color: "#166534", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
              {profileMsg}
            </div>
          )}
          {profileError && (
            <div style={{ padding: "10px 14px", backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
              {profileError}
            </div>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            style={{
              padding: "11px 24px",
              backgroundColor: "#2090FF",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "13px",
              fontWeight: 700,
              cursor: savingProfile ? "not-allowed" : "pointer",
              opacity: savingProfile ? 0.7 : 1,
              boxShadow: "0 2px 6px rgba(32, 144, 255, 0.25)",
            }}
          >
            {savingProfile ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </form>
      </div>

      {/* 2. MINISTRY & SPIRITUAL GROWTH STATUS */}
      <div style={cardStyle}>
        <h2
          style={{
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontWeight: 700,
            fontSize: "17px",
            color: "#141C6E",
            margin: "0 0 8px",
          }}
        >
          Ministry &amp; Fellowship Status
        </h2>
        <p style={{ fontSize: "12.5px", color: "#747CA1", margin: "0 0 20px" }}>
          Your service unit assignment and spiritual membership tier at The Publishers House.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          <div style={{ padding: "16px 20px", borderRadius: "10px", backgroundColor: "#F4F6FB", border: "1px solid #D5DCF2" }}>
            <span style={{ ...labelStyle, marginBottom: "4px" }}>Assigned Service Unit</span>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#141C6E" }}>
              {unitName}
            </div>
            <p style={{ fontSize: "11px", color: "#747CA1", margin: "6px 0 0" }}>
              Unit assignments are coordinated by Unit Heads and Church Administration.
            </p>
          </div>

          <div style={{ padding: "16px 20px", borderRadius: "10px", backgroundColor: "#F4F6FB", border: "1px solid #D5DCF2" }}>
            <span style={{ ...labelStyle, marginBottom: "4px" }}>Membership Level</span>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#2090FF", textTransform: "capitalize" }}>
              {getTierLabel(user.activityTier)}
            </div>
            <p style={{ fontSize: "11px", color: "#747CA1", margin: "6px 0 0" }}>
              Role: {getRoleLabel(user.role)}
            </p>
          </div>

          <div style={{ padding: "16px 20px", borderRadius: "10px", backgroundColor: "#F4F6FB", border: "1px solid #D5DCF2" }}>
            <span style={{ ...labelStyle, marginBottom: "4px" }}>Member Since</span>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#141C6E" }}>
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Active"}
            </div>
            <p style={{ fontSize: "11px", color: "#747CA1", margin: "6px 0 0" }}>
              Campus: {campus === "abuja" ? "Abuja Center" : "Jos Headquarters"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. ACCOUNT SECURITY & PASSWORD */}
      <div style={cardStyle}>
        <h2
          style={{
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontWeight: 700,
            fontSize: "17px",
            color: "#141C6E",
            margin: "0 0 8px",
          }}
        >
          Account Security &amp; Password
        </h2>
        <p style={{ fontSize: "12.5px", color: "#747CA1", margin: "0 0 20px" }}>
          Update your portal password or request a reset email link.
        </p>

        <form onSubmit={handleUpdatePassword} style={{ marginBottom: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                style={inputStyle}
              />
            </div>
          </div>

          {passwordMsg && (
            <div style={{ padding: "10px 14px", backgroundColor: "#DCFCE7", color: "#166534", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
              {passwordMsg}
            </div>
          )}
          {passwordError && (
            <div style={{ padding: "10px 14px", backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
              {passwordError}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="submit"
              disabled={passwordSaving || !newPassword}
              style={{
                padding: "10px 20px",
                backgroundColor: "#0140C1",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: passwordSaving || !newPassword ? "not-allowed" : "pointer",
                opacity: passwordSaving || !newPassword ? 0.6 : 1,
              }}
            >
              {passwordSaving ? "Updating Password..." : "Update Password"}
            </button>

            <button
              type="button"
              onClick={handleSendResetEmail}
              style={{
                padding: "10px 18px",
                backgroundColor: "#F4F6FB",
                color: "#1F46C8",
                border: "1px solid #D5DCF2",
                borderRadius: "8px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Email Me Password Reset Link
            </button>
          </div>

          {resetEmailSent && (
            <p style={{ color: "#166534", fontSize: "12.5px", marginTop: "12px", fontWeight: 600 }}>
              Password reset link sent to {user.email}! Please check your inbox.
            </p>
          )}
        </form>

        {/* Sign out */}
        <div style={{ paddingTop: "20px", borderTop: "1px solid #E8ECF7", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#141C6E" }}>Sign Out of Member Portal</div>
            <div style={{ fontSize: "11.5px", color: "#747CA1" }}>End your session on this browser device.</div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              padding: "9px 18px",
              backgroundColor: "#FFF5F5",
              color: "#DC2626",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
