"use client";

import { useState, useRef, useEffect } from "react";
import { updatePassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { clearSession } from "@/lib/clientSession";
import { UNITS, getRoleLabel, getTierLabel, type PortalUser, type Campus } from "@/lib/portalAuth";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const NOTIFICATION_TOPICS = [
  {
    key: "services",
    icon: "⛪",
    title: "Church Services & Gatherings",
    description: "Reminders for Sunday Word & Worship encounters, midweek services, and special conferences.",
  },
  {
    key: "duties",
    icon: "🛡️",
    title: "Duty Roster & Unit Preparation Calls",
    description: "Notifications about your duty dates, preparation call times, and unit head notices.",
  },
  {
    key: "sermons",
    icon: "📖",
    title: "Pastoral Word & Fresh Teachings",
    description: "Immediate alerts when Dr. Joshua Agunbiade or the pastorate releases new audio messages or essays.",
  },
  {
    key: "prayers",
    icon: "🔥",
    title: "Altar Prayers & Testimonies",
    description: "Updates on submitted prayer petitions, intercession alerts, and approved praise reports.",
  },
  {
    key: "counsel",
    icon: "💬",
    title: "Pastoral Inquiries & Pastoral Care",
    description: "Direct notifications when pastors or ministry coordinators respond to your inquiries.",
  },
];

interface MemberSettingsProps {
  user: PortalUser;
  onUserUpdated?: (updated: Partial<PortalUser>) => void;
}

export default function MemberSettings({ user, onUserUpdated }: MemberSettingsProps) {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [campus, setCampus] = useState<Campus>((user.campus as Campus) || "jos");
  const [photoURL, setPhotoURL] = useState(user.photoURL || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const unitName = UNITS.find((u) => u.id === user.assignedUnitId)?.name || (user.assignedUnitId ? user.assignedUnitId : "No unit assigned");

  // Push Notifications state
  const {
    permissionState,
    isSubscribed,
    loading: notifLoading,
    statusMessage: notifStatusMsg,
    requestPermissionAndSubscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications({
    uid: user.uid,
    email: user.email,
    enabled: true,
  });

  const [topicPreferences, setTopicPreferences] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tph_notif_topics");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return (user as any)?.notificationPreferences || {
      services: true,
      duties: true,
      sermons: true,
      prayers: true,
      counsel: true,
    };
  });

  const handleMasterToggle = async () => {
    if (permissionState === "granted" && isSubscribed) {
      await unsubscribe();
    } else {
      await requestPermissionAndSubscribe();
    }
  };

  const handleToggleTopic = async (key: string) => {
    const nextVal = !(topicPreferences[key] ?? true);
    const updated = { ...topicPreferences, [key]: nextVal };
    setTopicPreferences(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem("tph_notif_topics", JSON.stringify(updated));
    }

    try {
      await fetch("/api/portal/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationPreferences: updated }),
      });
    } catch {}
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please select an image file (PNG, JPG, WebP).");
      return;
    }

    setUploadingImage(true);
    setProfileError("");
    setProfileMsg("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const size = 256;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            setPhotoURL(dataUrl);
            setProfileMsg("New photo loaded! Click 'Save Profile Changes' to finalize ✓");
          }
        } catch (err: any) {
          setProfileError("Failed to process image: " + err.message);
        } finally {
          setUploadingImage(false);
        }
      };
      img.onerror = () => {
        setProfileError("Failed to read image file.");
        setUploadingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tph_user_updated", {
            detail: { displayName, phone, campus, photoURL },
          })
        );
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
      if (currentUser) {
        await updatePassword(currentUser, newPassword).catch(() => undefined);
      }
      const res = await fetch("/api/portal/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }
      setPasswordMsg("Your password has been updated successfully ✓");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMsg(""), 4000);
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to update password.");
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
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px", flexWrap: "wrap" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
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
              fontSize: "26px",
              border: "3px solid #D5DCF2",
              boxShadow: "0 4px 12px rgba(20, 28, 110, 0.12)",
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
                margin: "0 0 6px",
              }}
            >
              Personal Information
            </h2>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                style={{
                  padding: "7px 14px",
                  backgroundColor: "#EEF4FF",
                  color: "#0140C1",
                  border: "1px solid #C4D7FE",
                  borderRadius: "6px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>📷</span>
                <span>{uploadingImage ? "Processing..." : photoURL ? "Change Photo" : "Upload Photo"}</span>
              </button>

              {photoURL && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoURL("");
                    setProfileMsg("Photo removed. Click 'Save Profile Changes' to finalize.");
                  }}
                  style={{
                    padding: "7px 12px",
                    backgroundColor: "#FFF1F2",
                    color: "#BE123C",
                    border: "1px solid #FECDD3",
                    borderRadius: "6px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            <p style={{ fontSize: "11px", color: "#747CA1", margin: "6px 0 0" }}>
              Upload any JPG or PNG image. It will be automatically formatted for your member profile.
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

            {photoURL && !photoURL.startsWith("data:") && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>External Photo URL</label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>
            )}
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

      {/* 3. PUSH NOTIFICATIONS & MOBILE ALERTS */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h2
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 700,
                  fontSize: "17px",
                  color: "#141C6E",
                  margin: 0,
                }}
              >
                Push Notifications &amp; Alerts
              </h2>
              {/* Status Badge */}
              {permissionState === "granted" && isSubscribed ? (
                <span style={{ fontSize: "10.5px", padding: "3px 10px", borderRadius: "99px", backgroundColor: "#DCFCE7", color: "#166534", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#16A34A" }}></span>
                  Active on this Device
                </span>
              ) : permissionState === "denied" ? (
                <span style={{ fontSize: "10.5px", padding: "3px 10px", borderRadius: "99px", backgroundColor: "#FEE2E2", color: "#991B1B", fontWeight: 700 }}>
                  Blocked in Phone/Browser
                </span>
              ) : (
                <span style={{ fontSize: "10.5px", padding: "3px 10px", borderRadius: "99px", backgroundColor: "#F1F5F9", color: "#64748B", fontWeight: 700 }}>
                  Turned Off
                </span>
              )}
            </div>
            <p style={{ fontSize: "12.5px", color: "#747CA1", margin: "4px 0 0" }}>
              Manage phone push notifications and ministry alerts. Notifications are delivered even when this app is closed.
            </p>
          </div>

          {/* Send Test Notification Button */}
          {permissionState === "granted" && isSubscribed && (
            <button
              type="button"
              onClick={sendTestNotification}
              disabled={notifLoading}
              style={{
                padding: "8px 14px",
                backgroundColor: "#EEF4FF",
                color: "#0140C1",
                border: "1px solid #C4D7FE",
                borderRadius: "8px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "11.5px",
                fontWeight: 700,
                cursor: notifLoading ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              <span>📲</span>
              <span>{notifLoading ? "Sending..." : "Send Test Notification"}</span>
            </button>
          )}
        </div>

        {/* Master Toggle Column */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            backgroundColor: (permissionState === "granted" && isSubscribed) ? "#F0FDF4" : "#F8FAFD",
            border: (permissionState === "granted" && isSubscribed) ? "1.5px solid #BBF7D0" : "1.5px solid #E2E8F0",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0, paddingRight: "16px" }}>
            <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "14px", fontWeight: 700, color: "#141C6E" }}>
              Allow Notifications on this Phone/Device
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "3px" }}>
              {permissionState === "granted" && isSubscribed
                ? "Active & Connected! Your phone will receive real-time alerts even when the portal is closed."
                : permissionState === "denied"
                ? "Notifications are blocked in your browser. Please tap the lock/tune icon in your address bar and select 'Allow Notifications'."
                : "Toggle on to receive instant service reminders, duty preparation alerts, and pastoral messages."}
            </div>
          </div>

          {/* Master Toggle Button */}
          <button
            type="button"
            role="switch"
            aria-checked={permissionState === "granted" && isSubscribed}
            onClick={handleMasterToggle}
            disabled={notifLoading}
            title={permissionState === "granted" && isSubscribed ? "Turn off notifications" : "Turn on notifications"}
            style={{
              position: "relative",
              width: "52px",
              height: "28px",
              borderRadius: "99px",
              backgroundColor: (permissionState === "granted" && isSubscribed) ? "#16A34A" : "#CBD5E1",
              border: "none",
              cursor: notifLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s ease",
              outline: "none",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "3px",
                left: (permissionState === "granted" && isSubscribed) ? "27px" : "3px",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                transition: "left 0.2s ease",
              }}
            />
          </button>
        </div>

        {/* Status Message */}
        {notifStatusMsg && (
          <div style={{ padding: "10px 14px", backgroundColor: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE", borderRadius: "8px", fontSize: "12.5px", fontWeight: 600, marginBottom: "20px" }}>
            {notifStatusMsg}
          </div>
        )}

        {/* Notification Categories & Options */}
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            Turn Notifications On / Off For:
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {NOTIFICATION_TOPICS.map((topic) => {
              const isChecked = topicPreferences[topic.key] ?? true;
              return (
                <div
                  key={topic.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    borderRadius: "10px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    transition: "border-color 0.15s ease",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "15px" }}>{topic.icon}</span>
                      <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", fontWeight: 700, color: "#141C6E" }}>
                        {topic.title}
                      </span>
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "2px", paddingLeft: "23px" }}>
                      {topic.description}
                    </div>
                  </div>

                  {/* Category Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isChecked}
                    onClick={() => handleToggleTopic(topic.key)}
                    style={{
                      position: "relative",
                      width: "44px",
                      height: "24px",
                      borderRadius: "99px",
                      backgroundColor: isChecked ? "#1F46C8" : "#CBD5E1",
                      border: "none",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      outline: "none",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: isChecked ? "22px" : "2px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. ACCOUNT SECURITY & PASSWORD */}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={labelStyle}>New Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: "none", border: "none", color: "#1F46C8", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={{ ...inputStyle, paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  style={{ ...inputStyle, paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
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
