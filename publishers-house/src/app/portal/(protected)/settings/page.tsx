"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { clearSession } from "@/lib/clientSession";
import { usePortal } from "@/lib/portalContext";
import MemberSettings from "@/components/portal/MemberSettings";

interface ChurchSettings {
  churchName: string;
  motto: string;
  leadPastor: string;
  contactEmail: string;
  contactPhone: string;
  josAddress: string;
  abujaAddress: string;
  youtubeUrl: string;
  mixlrUrl: string;
  instagramUrl: string;
  telegramUrl: string;
  defaultMemberTier: "seeker" | "regular" | "active";
  allowSelfRegistration: boolean;
  requireTestimonyApproval: boolean;
  notifyOnNewPrayer: boolean;
  notifyWeeklyGiving: boolean;
  attendanceWindowHours: number;
}

const DEFAULT_SETTINGS: ChurchSettings = {
  churchName: "The Publishers House",
  motto: "Company of the Great — Psalm 68:11",
  leadPastor: "Rev. Joshua Agunbiade",
  contactEmail: "info@thepublishershouse.org",
  contactPhone: "+234 813 906 3144",
  josAddress: "Plot 14, Yakubu Gowon Way, Jos, Plateau State, Nigeria",
  abujaAddress: "TPH Abuja Campus, Central Business District, Abuja FCT",
  youtubeUrl: "https://www.youtube.com/@ThePublishersHouse",
  mixlrUrl: "https://thepublishershouse.mixlr.com",
  instagramUrl: "https://instagram.com/thepublishershouse",
  telegramUrl: "https://t.me/thepublishershouse",
  defaultMemberTier: "regular",
  allowSelfRegistration: false,
  requireTestimonyApproval: true,
  notifyOnNewPrayer: true,
  notifyWeeklyGiving: true,
  attendanceWindowHours: 48,
};

export default function PortalSettingsPage() {
  const { effectiveUser, updateCurrentUser } = usePortal();
  const isChurchAdmin =
    effectiveUser.role === "admin" ||
    effectiveUser.role === "super_admin" ||
    effectiveUser.role === "portal_manager";

  const [activeTab, setActiveTab] = useState<"general" | "portal" | "notifications" | "security">("general");
  const [form, setForm] = useState<ChurchSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    if (!isChurchAdmin) {
      setLoading(false);
      return;
    }
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/portal/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.settings) {
            setForm({ ...DEFAULT_SETTINGS, ...data.settings });
          }
        }
      } catch (err) {
        console.error("Could not fetch church portal settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch("/api/portal/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save settings");
      }
      setSavedMsg("Settings updated and saved successfully ✓");
      setTimeout(() => setSavedMsg(""), 4000);
    } catch (err: any) {
      alert("Error saving settings: " + (err?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = auth.currentUser?.email || form.contactEmail;
    if (!email) {
      alert("No email found for current user.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setTimeout(() => setResetEmailSent(false), 5000);
    } catch (err: any) {
      alert("Could not send password reset email: " + err.message);
    }
  };

  const handleSignOutAll = async () => {
    if (confirm("Sign out of the admin portal? You will be redirected to login.")) {
      await clearSession();
      await signOut(auth);
      window.location.href = "/portal/login";
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    backgroundColor: "#F8FAFD",
    border: "1px solid #D5DCF2",
    borderRadius: "8px",
    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
    fontSize: "13px",
    color: "#141C6E",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
    fontSize: "11px",
    fontWeight: 700 as const,
    color: "#4A5490",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "6px",
  };

  if (!isChurchAdmin) {
    return <MemberSettings user={effectiveUser} onUserUpdated={updateCurrentUser} />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
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
            Administration · System Config
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
            Portal Settings
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
            Manage global church details, campuses, access policies, and security credentials.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {savedMsg && (
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: "#DCFCE7",
                border: "1px solid #86EFAC",
                borderRadius: "8px",
                color: "#166534",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {savedMsg}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 22px",
              backgroundColor: "#1F46C8",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "12.5px",
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
              transition: "opacity 0.2s",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid #D5DCF2",
          marginBottom: "28px",
        }}
      >
        {[
          { id: "general", label: "Church Profile & Campuses", icon: "🏛️" },
          { id: "portal", label: "Portal Access Rules", icon: "🔒" },
          { id: "notifications", label: "Alerts & Reports", icon: "🔔" },
          { id: "security", label: "Admin Security & Sign Out", icon: "🛡️" },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 18px",
                background: "transparent",
                border: "none",
                borderBottom: active ? "3px solid #1F46C8" : "3px solid transparent",
                color: active ? "#1F46C8" : "#4A5490",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: active ? 700 : 500,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General Church Profile */}
      {activeTab === "general" && (
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px solid #D5DCF2",
              padding: "28px",
              boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#141C6E",
                margin: "0 0 20px",
              }}
            >
              Ministry Identity
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Church Name</label>
                <input
                  style={inputStyle}
                  value={form.churchName}
                  onChange={(e) => setForm({ ...form, churchName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Lead Pastor</label>
                <input
                  style={inputStyle}
                  value={form.leadPastor}
                  onChange={(e) => setForm({ ...form, leadPastor: e.target.value })}
                  required
                />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Scripture Motto / Tagline</label>
                <input
                  style={inputStyle}
                  value={form.motto}
                  onChange={(e) => setForm({ ...form, motto: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Official Contact Email</label>
                <input
                  type="email"
                  style={inputStyle}
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Official Telephone</label>
                <input
                  style={inputStyle}
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px solid #D5DCF2",
              padding: "28px",
              boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#141C6E",
                margin: "0 0 20px",
              }}
            >
              Campuses & Sanctuary Locations
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Jos Headquarters Sanctuary</label>
                <input
                  style={inputStyle}
                  value={form.josAddress}
                  onChange={(e) => setForm({ ...form, josAddress: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Abuja Campus Center</label>
                <input
                  style={inputStyle}
                  value={form.abujaAddress}
                  onChange={(e) => setForm({ ...form, abujaAddress: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px solid #D5DCF2",
              padding: "28px",
              boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#141C6E",
                margin: "0 0 20px",
              }}
            >
              Broadcast & Media Streaming Channels
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>YouTube Live Stream URL</label>
                <input
                  style={inputStyle}
                  value={form.youtubeUrl}
                  onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Mixlr Radio Stream URL</label>
                <input
                  style={inputStyle}
                  value={form.mixlrUrl}
                  onChange={(e) => setForm({ ...form, mixlrUrl: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Instagram Profile URL</label>
                <input
                  style={inputStyle}
                  value={form.instagramUrl}
                  onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Telegram Bulletin URL</label>
                <input
                  style={inputStyle}
                  value={form.telegramUrl}
                  onChange={(e) => setForm({ ...form, telegramUrl: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Portal Access Rules */}
      {activeTab === "portal" && (
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px solid #D5DCF2",
              padding: "28px",
              boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#141C6E",
                margin: "0 0 20px",
              }}
            >
              Member Registration & Tiers
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <label style={labelStyle}>Default Activity Tier for New Members</label>
                <select
                  style={inputStyle}
                  value={form.defaultMemberTier}
                  onChange={(e) => setForm({ ...form, defaultMemberTier: e.target.value as any })}
                >
                  <option value="seeker">Seeker (First-time visitor / inquiring)</option>
                  <option value="regular">Regular (Attending Sunday / Midweek)</option>
                  <option value="active">Active (Committed & serving)</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Roster Attendance Edit Window</label>
                <select
                  style={inputStyle}
                  value={form.attendanceWindowHours}
                  onChange={(e) => setForm({ ...form, attendanceWindowHours: Number(e.target.value) })}
                >
                  <option value={24}>24 Hours after service</option>
                  <option value={48}>48 Hours after service</option>
                  <option value={72}>72 Hours after service</option>
                  <option value={168}>7 Days (1 Week)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #EEF2FB" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.allowSelfRegistration}
                  onChange={(e) => setForm({ ...form, allowSelfRegistration: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "#1F46C8" }}
                />
                <div>
                  <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", fontWeight: 600, color: "#141C6E" }}>
                    Allow Member Self-Registration (Not Recommended)
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>
                    <strong style={{ color: "#991B1B" }}>OFF by default.</strong> TPH policy: Admin staff create all member accounts manually.
                    Enable only if you want anyone with a Google account to self-enrol as a portal member without admin pre-approval.
                  </div>
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.requireTestimonyApproval}
                  onChange={(e) => setForm({ ...form, requireTestimonyApproval: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "#1F46C8" }}
                />
                <div>
                  <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", fontWeight: 600, color: "#141C6E" }}>
                    Require Pastoral Approval for Testimonies
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>
                    Testimonies submitted by congregation members stay pending until an Administrator reviews them.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === "notifications" && (
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px solid #D5DCF2",
              padding: "28px",
              boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#141C6E",
                margin: "0 0 20px",
              }}
            >
              Email & Pastoral Dispatch Alerts
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.notifyOnNewPrayer}
                  onChange={(e) => setForm({ ...form, notifyOnNewPrayer: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "#1F46C8" }}
                />
                <div>
                  <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", fontWeight: 600, color: "#141C6E" }}>
                    Prayer Request Alerts to Pastoral Care Team
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>
                    Send immediate notification to assigned pastors when an urgent prayer or visitation request is filed.
                  </div>
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.notifyWeeklyGiving}
                  onChange={(e) => setForm({ ...form, notifyWeeklyGiving: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "#1F46C8" }}
                />
                <div>
                  <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", fontWeight: 600, color: "#141C6E" }}>
                    Weekly Giving & Reconciliation Digest
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>
                    Email automated Monday reconciliation summaries of Paystack & bank contributions to finance admins.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* Tab 4: Security & Sign Out */}
      {activeTab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Active Session Overview */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px solid #D5DCF2",
              padding: "28px",
              boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#141C6E",
                margin: "0 0 16px",
              }}
            >
              Active Admin Session
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div style={{ padding: "14px", backgroundColor: "#F4F6FB", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Logged In Account</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#141C6E", marginTop: "4px" }}>
                  {auth.currentUser?.email || "thepublishershouse007@gmail.com"}
                </div>
              </div>
              <div style={{ padding: "14px", backgroundColor: "#F4F6FB", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Privilege Level</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#1F46C8", marginTop: "4px" }}>
                  Master Administrator (All Units & Audit Access)
                </div>
              </div>
            </div>

            <div style={{ padding: "16px", backgroundColor: "#EEF2FB", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "#141C6E" }}>Change Password</div>
                <div style={{ fontSize: "12px", color: "#4A5490", marginTop: "2px" }}>
                  Send a password reset email directly to your account email to update credentials safely.
                </div>
              </div>
              <button
                onClick={handlePasswordReset}
                style={{
                  padding: "9px 18px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #1F46C8",
                  color: "#1F46C8",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Send Reset Link
              </button>
            </div>
            {resetEmailSent && (
              <p style={{ color: "#166534", fontSize: "12.5px", marginTop: "12px", fontWeight: 600 }}>
                Reset email sent! Please check your inbox.
              </p>
            )}
          </div>

          {/* Sign Out Card */}
          <div
            style={{
              backgroundColor: "#FFF5F5",
              borderRadius: "14px",
              border: "1px solid #FECACA",
              padding: "28px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 700,
                fontSize: "16px",
                color: "#991B1B",
                margin: "0 0 8px",
              }}
            >
              Session Termination
            </h2>
            <p style={{ fontSize: "13px", color: "#7F1D1D", margin: "0 0 20px" }}>
              Sign out of this portal session and clear all secure browser authentication cookies. You will be redirected to the portal login screen.
            </p>
            <button
              onClick={handleSignOutAll}
              style={{
                padding: "11px 22px",
                backgroundColor: "#DC2626",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(220, 38, 38, 0.25)",
              }}
            >
              Sign Out of Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
