"use client";

import { useState, useRef, useEffect } from "react";
import { auth } from "@/lib/firebaseAuth";
import { onAuthStateChanged, User } from "firebase/auth";

interface AttendanceUser {
  fullName: string;
  phone: string;
  uid?: string;
}

type ServiceMode = "in_person" | "online";
type VenueLocation = "jos" | "abuja";
type StreamChannel = "youtube" | "mixlr" | "telegram";

export default function FloatingAttendance() {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // User state
  const [savedUser, setSavedUser] = useState<AttendanceUser | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);

  // Form selections
  const [mode, setMode] = useState<ServiceMode>("in_person");
  const [location, setLocation] = useState<VenueLocation>("jos");
  const [streamChannel, setStreamChannel] = useState<StreamChannel>("youtube");
  const [enteredCode, setEnteredCode] = useState("");

  // Input states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Family / Guest check-in mode
  const [isCheckingInOther, setIsCheckingInOther] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [otherPhone, setOtherPhone] = useState("");

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Load identity from localStorage & Firebase Auth
  useEffect(() => {
    let foundProfile = false;
    try {
      const stored = localStorage.getItem("tph_attendance_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && parsed.fullName) {
          setSavedUser(parsed);
          setFullName(parsed.fullName);
          if (parsed.phone) setPhone(parsed.phone);
          foundProfile = true;
        }
      }
    } catch {
      // ignore
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        if (!foundProfile && user.displayName) {
          setFullName(user.displayName);
        }
        if (!foundProfile && user.phoneNumber) {
          setPhone(user.phoneNumber);
        }
      } else {
        setAuthUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (showModal || showSuccess) return;

    setIsPressing(true);
    setProgress(0);

    let currentProgress = 0;
    progressInterval.current = setInterval(() => {
      currentProgress += 100 / (2200 / 50); // ~2.2s hold duration
      setProgress(Math.min(currentProgress, 100));
    }, 50);

    pressTimer.current = setTimeout(() => {
      clearTimers();
      setIsPressing(false);
      setProgress(0);
      setError("");
      setShowModal(true);
    }, 2200);
  };

  const handlePressEnd = () => {
    clearTimers();
    setIsPressing(false);
    setProgress(0);
  };

  const clearTimers = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  const recognizedName = savedUser?.fullName || authUser?.displayName || "";
  const recognizedPhone = savedUser?.phone || authUser?.phoneNumber || "";
  const isRecognized = Boolean(recognizedName) && !isEditing;

  const targetName = isCheckingInOther
    ? otherName.trim()
    : (isRecognized ? recognizedName.trim() : fullName.trim());
  const targetPhone = isCheckingInOther
    ? otherPhone.trim()
    : (isRecognized ? (recognizedPhone.trim() || phone.trim()) : phone.trim());

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (!targetName) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, any> = {
        fullName: targetName,
        phone: targetPhone,
        mode,
        location: location === "jos" ? "Jos (House of Bread)" : "Abuja Outreach",
        streamChannel,
        serviceCode: enteredCode.trim(),
      };

      if (isCheckingInOther) {
        payload.checkedInBy = (isRecognized ? recognizedName : fullName) || "Family/Friend";
      }

      // Submit via Server-Side API endpoint (bypasses Firestore client security rule issues)
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Could not record attendance. Please try again.");
      }

      // Update local storage if signing self
      if (!isCheckingInOther) {
        const toSave = { fullName: targetName, phone: targetPhone };
        localStorage.setItem("tph_attendance_user", JSON.stringify(toSave));
        setSavedUser(toSave);
        setIsEditing(false);
      }

      setShowModal(false);
      setSuccessMessage(
        isCheckingInOther
          ? `Attendance confirmed for ${targetName} ✓`
          : "Attendance Confirmed! Thank you for worshipping with us today."
      );
      setShowSuccess(true);

      if (isCheckingInOther) {
        setIsCheckingInOther(false);
        setOtherName("");
        setOtherPhone("");
      }

      setTimeout(() => setShowSuccess(false), 4500);
    } catch (err: any) {
      console.error("Attendance submission error:", err);
      setError(err?.message || "Could not sign attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // SVG circular progress ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      <style>{`
        @keyframes tphSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .tph-modal-anim {
          animation: tphSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Floating Container */}
      <div
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "14px",
        }}
      >
        {/* Success Banner */}
        {showSuccess && (
          <div
            className="tph-modal-anim"
            style={{
              background: "#0140C1",
              color: "#FFFFFF",
              padding: "16px 22px",
              borderRadius: "14px",
              boxShadow: "0 16px 36px rgba(1,64,193,0.35)",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              maxWidth: "340px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              ✓
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", lineHeight: "1.2em" }}>TPH Attendance</div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "2px" }}>{successMessage}</div>
            </div>
          </div>
        )}

        {/* Modal Form */}
        {showModal && (
          <div
            className="tph-modal-anim"
            style={{
              background: "#0F172A",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "20px",
              padding: "24px",
              width: "350px",
              boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
              color: "#F8FAFC",
              fontFamily: "'Poppins', sans-serif",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: "#D97706", textTransform: "uppercase" }}>
                  The Publishers House
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "2px 0 0", color: "#FFFFFF" }}>
                  {isCheckingInOther
                    ? "Check In Guest / Family"
                    : isRecognized
                    ? `Welcome, ${recognizedName.split(" ")[0]}!`
                    : "Sign Attendance"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setIsCheckingInOther(false);
                }}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94A3B8",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* User Identity View / Inputs */}
              {isRecognized && !isCheckingInOther ? (
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#F8FAFC" }}>{recognizedName}</div>
                      <div style={{ fontSize: "11px", color: recognizedPhone ? "#94A3B8" : "#F59E0B", marginTop: "2px" }}>
                        {recognizedPhone ? `Phone: ${recognizedPhone}` : "Phone: Not provided"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFullName(recognizedName);
                        setPhone(recognizedPhone);
                        setIsEditing(true);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#38BDF8",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Switch / Edit
                    </button>
                  </div>
                </div>
              ) : (
                /* Inputs for new attendee OR family member */
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", marginBottom: "6px" }}>
                      {isCheckingInOther ? "Family Member / Friend's Name *" : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Michael Okoro"
                      value={isCheckingInOther ? otherName : fullName}
                      onChange={(e) => (isCheckingInOther ? setOtherName(e.target.value) : setFullName(e.target.value))}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", marginBottom: "6px" }}>
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 0706 194 5751"
                      value={isCheckingInOther ? otherPhone : phone}
                      onChange={(e) => (isCheckingInOther ? setOtherPhone(e.target.value) : setPhone(e.target.value))}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </>
              )}

              {/* Mode Selection */}
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", marginBottom: "6px" }}>
                  Where are you worshipping today?
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setMode("in_person")}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: mode === "in_person" ? "#2090FF" : "rgba(255,255,255,0.1)",
                      background: mode === "in_person" ? "rgba(32,144,255,0.2)" : "rgba(255,255,255,0.03)",
                      color: mode === "in_person" ? "#38BDF8" : "#94A3B8",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>🏛️</span> In-Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("online")}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: mode === "online" ? "#2090FF" : "rgba(255,255,255,0.1)",
                      background: mode === "online" ? "rgba(32,144,255,0.2)" : "rgba(255,255,255,0.03)",
                      color: mode === "online" ? "#38BDF8" : "#94A3B8",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>🌐</span> Online Stream
                  </button>
                </div>
              </div>

              {/* In-Person vs Online Options */}
              {mode === "in_person" ? (
                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", marginBottom: "6px" }}>
                    Select Sanctuary Center
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setLocation("jos")}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "6px",
                        border: location === "jos" ? "1px solid #D97706" : "1px solid rgba(255,255,255,0.08)",
                        background: location === "jos" ? "rgba(217,119,6,0.18)" : "transparent",
                        color: location === "jos" ? "#F59E0B" : "#94A3B8",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Jos (House of Bread)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocation("abuja")}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "6px",
                        border: location === "abuja" ? "1px solid #D97706" : "1px solid rgba(255,255,255,0.08)",
                        background: location === "abuja" ? "rgba(217,119,6,0.18)" : "transparent",
                        color: location === "abuja" ? "#F59E0B" : "#94A3B8",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Abuja Outreach
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", marginBottom: "6px" }}>
                      Streaming Via
                    </label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {(["youtube", "mixlr", "telegram"] as StreamChannel[]).map((ch) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setStreamChannel(ch)}
                          style={{
                            flex: 1,
                            padding: "6px",
                            borderRadius: "6px",
                            border: streamChannel === ch ? "1px solid #2090FF" : "1px solid rgba(255,255,255,0.08)",
                            background: streamChannel === ch ? "rgba(32,144,255,0.2)" : "transparent",
                            color: streamChannel === ch ? "#38BDF8" : "#94A3B8",
                            fontSize: "11px",
                            textTransform: "capitalize",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F59E0B", marginBottom: "4px" }}>
                      Stream Check-In Code (if announced)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LIGHT-2026"
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(245,158,11,0.4)",
                        background: "rgba(245,158,11,0.06)",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div style={{ color: "#EF4444", fontSize: "11px", background: "rgba(239,68,68,0.1)", padding: "8px 10px", borderRadius: "6px", lineHeight: "1.4em" }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: loading ? "#475569" : "linear-gradient(135deg, #0140C1 0%, #2090FF 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "4px",
                  boxShadow: "0 8px 20px rgba(1,64,193,0.3)",
                }}
              >
                {loading ? "Confirming..." : isCheckingInOther ? "Confirm Guest Check-In" : "Confirm My Attendance"}
              </button>

              {/* Family / Friend Check-in Toggle */}
              {isRecognized && (
                <button
                  type="button"
                  onClick={() => setIsCheckingInOther(!isCheckingInOther)}
                  style={{
                    background: "transparent",
                    border: "1px dashed rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    padding: "8px",
                    color: isCheckingInOther ? "#EF4444" : "#94A3B8",
                    fontSize: "11px",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  {isCheckingInOther ? "← Back to My Check-in" : "+ Check in a family member or friend"}
                </button>
              )}
            </form>
          </div>
        )}

        {/* Floating Circle Button */}
        {!showModal && !showSuccess && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "#0F172A",
                color: "#F8FAFC",
                padding: "8px 16px",
                borderRadius: "30px",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                opacity: isPressing ? 0 : 1,
                transition: "opacity 0.2s",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ color: "#D97706" }}>●</span>
              <span>Tap & hold to sign attendance</span>
            </div>

            <div
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              style={{
                position: "relative",
                width: "64px",
                height: "64px",
                cursor: "pointer",
                userSelect: "none",
                WebkitUserSelect: "none",
                transform: isPressing ? "scale(0.92)" : "scale(1)",
                transition: "transform 0.12s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              aria-label="Tap and hold to sign attendance"
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(135deg, #0140C1 0%, #2090FF 100%)",
                  borderRadius: "50%",
                  boxShadow: isPressing
                    ? "0 0 0 rgba(1,64,193,0)"
                    : "0 10px 28px rgba(1,64,193,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "22px",
                  transition: "box-shadow 0.2s",
                  zIndex: 2,
                }}
              >
                📍
              </div>

              <svg
                width="64"
                height="64"
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: "rotate(-90deg)",
                  zIndex: 3,
                  pointerEvents: "none",
                }}
              >
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="#D97706"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: "stroke-dashoffset 0.05s linear" }}
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
