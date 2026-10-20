"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { clearSession } from "@/lib/clientSession";
import type { PortalUser, UserRole, Campus } from "@/lib/portalAuth";
import { getRoleLabel } from "@/lib/portalAuth";
import Sidebar from "@/components/portal/Sidebar";
import { PortalProvider, usePortal } from "@/lib/portalContext";

function PortalHeaderAndContent({
  user,
  children,
}: {
  user: PortalUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    campus,
    setCampus,
    previewRole,
    previewUnitId,
    startPreview,
    exitPreview,
    effectiveUser,
    isSuperAdmin,
  } = usePortal();

  // Force Password Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(
    Boolean(user.mustChangePassword)
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Mobile Drawer & Sidebar Collapse State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSignOut = async () => {
    try {
      await clearSession();
      await signOut(auth);
    } catch {}
    window.location.href = "/portal/login";
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
      }
      await fetch("/api/portal/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "password_changed",
          uid: user.uid,
        }),
      });

      setPasswordSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
      }, 1500);
    } catch (err: any) {
      setPasswordError("Failed to update password: " + err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const getSectionTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return "Dashboard";
    const sub = segments[1];
    switch (sub) {
      case "members": return "Members Directory";
      case "units": return "Church Units";
      case "attendance": return "Attendance & Headcounts";
      case "events": return "Events & Calendar";
      case "finance": return "Finance Overview";
      case "pastoral": return "Pastoral Care";
      case "testimonies": return "Testimonies & Prayers";
      case "courses": return "Theological Courses";
      case "facility": return "Facility & Assets";
      case "audit": return "Audit Log";
      case "settings": return "Settings & Church Profile";
      case "unit": return "Unit Management";
      case "member": return "Member Portal";
      default: return sub.charAt(0).toUpperCase() + sub.slice(1);
    }
  };

  const isModerator =
    user.email.toLowerCase() === "thepublishershouse007@gmail.com";
  const canImpersonate = isModerator;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F4F6FB", overflowX: "hidden" }}>
      <Sidebar
        user={effectiveUser}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <main className={`portal-main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        
        {/* Impersonation Banner */}
        {previewRole && (
          <div
            style={{
              backgroundColor: "#7C3AED",
              color: "#FFFFFF",
              padding: "10px 40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12.5px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
              position: "sticky",
              top: 0,
              zIndex: 35,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span>👁️ Impersonation Mode Active:</span>
              <span style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "4px" }}>
                Viewing as {getRoleLabel(previewRole)} {previewUnitId ? `(${previewUnitId})` : ""}
              </span>
            </div>
            <button
              onClick={exitPreview}
              style={{
                backgroundColor: "#FFFFFF",
                color: "#7C3AED",
                border: "none",
                borderRadius: "6px",
                padding: "4px 12px",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Exit Preview Mode ✕
            </button>
          </div>
        )}

        {/* Top bar matching Figma */}
        <div
          className="portal-topbar"
          style={{
            position: "sticky",
            top: previewRole ? "40px" : 0,
            zIndex: 30,
          }}
        >
          {/* Left: Mobile Hamburger & Section Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <button
              onClick={() => setMobileOpen(true)}
              className="portal-mobile-hamburger"
              aria-label="Open sidebar menu"
              title="Open Navigation Drawer"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <div
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <span style={{ color: "#1F46C8" }}>TPH</span>
              <span style={{ color: "#D5DCF2", margin: "0 6px" }}>/</span>
              <span style={{ color: "#141C6E" }}>{getSectionTitle()}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            
            {/* Moderator-Only Controls: Campus Filter & Role Preview Impersonation */}
            {isModerator && (
              <>
                {/* Campus Filter Dropdown */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#747CA1", textTransform: "uppercase" }}>Campus:</span>
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value as any)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "1px solid #D5DCF2",
                      backgroundColor: "#F4F6FB",
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#141C6E",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">🌐 All Campuses</option>
                    <option value="jos">📍 Jos Headquarters</option>
                    <option value="abuja">📍 Abuja Campus</option>
                  </select>
                </div>

                {/* Role Preview Mode Impersonation Dropdown */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <select
                    value={previewRole || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        exitPreview();
                      } else if (val === "unit_head_ushering") {
                        startPreview("unit_head", "ushering");
                      } else if (val === "unit_head_media") {
                        startPreview("unit_head", "media_technical");
                      } else if (val === "unit_head_worship") {
                        startPreview("unit_head", "worship");
                      } else {
                        startPreview(val as UserRole);
                      }
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid #C4B5FD",
                      backgroundColor: previewRole ? "#EDE9FE" : "#F4F6FB",
                      color: previewRole ? "#6D28D9" : "#141C6E",
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "12px",
                      fontWeight: 600,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">👁️ Role Preview: Normal</option>
                    <option value="super_admin">Viewing as Super Admin</option>
                    <option value="admin">Viewing as Administrator</option>
                    <option value="portal_manager">Viewing as Portal Manager (007)</option>
                    <option value="unit_head_ushering">Preview as Unit Head (Ushering)</option>
                    <option value="unit_head_media">Preview as Unit Head (Media)</option>
                    <option value="unit_head_worship">Preview as Unit Head (Worship)</option>
                    <option value="member">Preview as Regular Member</option>
                  </select>
                </div>
              </>
            )}

            {/* Online Indicator (Desktop only) */}
            <div className="portal-desktop-only" style={{ alignItems: "center", gap: "6px", padding: "5px 10px", backgroundColor: "#E4F5EA", borderRadius: "99px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#0F6B38" }} />
              <span
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#0F6B38",
                  letterSpacing: "0.04em",
                }}
              >
                Online
              </span>
            </div>

            {/* User Name Badge (Desktop only) */}
            <span
              className="portal-desktop-only"
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#141C6E",
              }}
            >
              {effectiveUser.displayName}
            </span>

            {/* Mobile User Avatar Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: "#1F46C8",
                color: "#FFFFFF",
                fontSize: "11.5px",
                fontWeight: 700,
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                position: "relative",
                flexShrink: 0,
              }}
              title={effectiveUser.displayName}
            >
              <span>{effectiveUser.displayName?.[0]?.toUpperCase() || "M"}</span>
              <span
                style={{
                  position: "absolute",
                  bottom: "-1px",
                  right: "-1px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                  border: "1.5px solid #FFFFFF",
                }}
              />
            </div>

            {/* Settings Link */}
            <Link
              href="/portal/settings"
              title="Portal Settings"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 10px",
                backgroundColor: pathname === "/portal/settings" ? "#EEF2FB" : "#F4F6FB",
                border: "1px solid #D5DCF2",
                borderRadius: "8px",
                color: "#141C6E",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span className="portal-desktop-only">Settings</span>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              title="Sign Out of Portal"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 10px",
                backgroundColor: "#FEE2E2",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                color: "#DC2626",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className="portal-desktop-only">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Content Page area */}
        <div className="portal-content-pad" style={{ maxWidth: "1600px", margin: "0 auto" }}>
          {children}
        </div>

        {/* ── MOBILE APP BOTTOM NAVIGATION BAR (Piggyvest Style) ── */}
        <nav
          className="portal-mobile-bottom-nav"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: "62px",
            backgroundColor: "#FFFFFF",
            borderTop: "1px solid #D5DCF2",
            boxShadow: "0 -4px 18px rgba(14, 21, 86, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            zIndex: 100,
            padding: "0 4px",
          }}
        >
          {[
            {
              href: effectiveUser.role === "member" ? "/portal/member" : "/portal",
              label: "Home",
              icon: (active: boolean) => (
                <svg width="19" height="19" viewBox="0 0 24 24" fill={active ? "#1F46C8" : "none"} stroke={active ? "#1F46C8" : "#64748B"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              ),
            },
            {
              href: "/portal/member/courses",
              label: "Growth",
              icon: (active: boolean) => (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={active ? "#1F46C8" : "#64748B"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              ),
            },
            {
              href: "/portal/member/media",
              label: "Media",
              icon: (active: boolean) => (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={active ? "#1F46C8" : "#64748B"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
              ),
            },
            {
              href: "/portal/member/prayers",
              label: "Prayers",
              icon: (active: boolean) => (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={active ? "#1F46C8" : "#64748B"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              ),
            },
            {
              href: "/portal/settings",
              label: "Settings",
              icon: (active: boolean) => (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={active ? "#1F46C8" : "#64748B"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              ),
            },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                  textDecoration: "none",
                  flex: 1,
                  padding: "6px 0",
                  transition: "transform 0.15s ease",
                }}
              >
                {item.icon(isActive)}
                <span
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "10px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#1F46C8" : "#64748B",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </main>

      {/* Force Change Password Modal for First-time Sign In */}
      {showPasswordModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "36px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(14, 21, 86, 0.25)",
              border: "1px solid #D5DCF2",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔐</div>
              <h2
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 800,
                  fontSize: "20px",
                  color: "#141C6E",
                  margin: "0 0 8px",
                }}
              >
                Set Your Permanent Password
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "13px",
                  color: "#4A5490",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                Welcome, <strong>{user.displayName}</strong>. You signed in using a temporary credentials invitation. To protect your account, please set a new personal password now.
              </p>
            </div>

            {passwordSuccess ? (
              <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#E4F5EA", borderRadius: "10px", color: "#0F6B38", fontWeight: 700 }}>
                ✓ Password updated successfully! Welcome aboard.
              </div>
            ) : (
              <form onSubmit={handleSaveNewPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                    New Password (Min. 6 Characters) *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #D5DCF2",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #D5DCF2",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {passwordError && (
                  <div style={{ fontSize: "12px", color: "#DC2626", fontWeight: 600 }}>
                    {passwordError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px",
                    fontWeight: 700,
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    cursor: passwordLoading ? "not-allowed" : "pointer",
                    marginTop: "8px",
                  }}
                >
                  {passwordLoading ? "Saving Password..." : "Update Password & Enter Portal"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function PortalShell({
  user,
  children,
}: {
  user: PortalUser;
  children: React.ReactNode;
}) {
  return (
    <PortalProvider user={user}>
      <PortalHeaderAndContent user={user}>{children}</PortalHeaderAndContent>
    </PortalProvider>
  );
}
