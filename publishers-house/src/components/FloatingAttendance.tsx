"use client";

import { useState, useRef, useEffect } from "react";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseAuth";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

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

  // Family / Guest check-in mode
  const [isCheckingInOther, setIsCheckingInOther] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [otherPhone, setOtherPhone] = useState("");

  // Stream code requirement from Admin
  const [streamCodeConfig, setStreamCodeConfig] = useState<{ active: boolean; code: string }>({
    active: false,
    code: "",
  });

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // 1. Listen for logged-in Portal user or read from localStorage
  useEffect(() => {
    // Check localStorage first
    try {
      const stored = localStorage.getItem("tph_attendance_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedUser(parsed);
        setFullName(parsed.fullName || "");
        setPhone(parsed.phone || "");
      }
    } catch {
      // ignore
    }

    // Check Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        if (user.displayName && !fullName) {
          setFullName(user.displayName);
        }
        if (user.phoneNumber && !phone) {
          setPhone(user.phoneNumber);
        }
      } else {
        setAuthUser(null);
      }
    });

    // Check today's stream code setting from Firestore
    const fetchStreamConfig = async () => {
      try {
        const snap = await getDoc(doc(db, "homeSettings", "attendance"));
        if (snap.exists()) {
          const data = snap.data();
          if (data?.streamCodeActive && data?.streamCode) {
            setStreamCodeConfig({
              active: Boolean(data.streamCodeActive),
              code: String(data.streamCode).trim().toUpperCase(),
            });
          }
        }
      } catch {
        // non-blocking
      }
    };
    fetchStreamConfig();

    return () => unsubscribe();
  }, []);

  const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (showModal || showSuccess) return;

    setIsPressing(true);
    setProgress(0);

    let currentProgress = 0;
    progressInterval.current = setInterval(() => {
      currentProgress += 100 / (2500 / 50); // 2.5 seconds total for responsive feel
      setProgress(Math.min(currentProgress, 100));
    }, 50);

    pressTimer.current = setTimeout(() => {
      clearTimers();
      setIsPressing(false);
      setProgress(0);
      setShowModal(true);
    }, 2500);
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    // Validate Stream Code if Online & Active
    if (mode === "online" && streamCodeConfig.active) {
      const inputTrimmed = enteredCode.trim().toUpperCase();
      if (!inputTrimmed) {
        setError("Please enter the Stream Check-In Code announced during service.");
        return;
      }
      if (inputTrimmed !== streamCodeConfig.code) {
        setError("Invalid stream code. Please verify the code displayed on stream.");
        return;
      }
    }

    const attendeeName = isCheckingInOther ? otherName.trim() : fullName.trim();
    const attendeePhone = isCheckingInOther ? otherPhone.trim() : phone.trim();

    if (!attendeeName) {
      setError("Please enter a full name.");
      return;
    }
    if (!attendeePhone) {
      setError("Please enter a phone number.");
      return;
    }

    setLoading(true);

    try {
      const todayDate = new Date().toISOString().split("T")[0];

      const record: Record<string, any> = {
        fullName: attendeeName,
        phone: attendeePhone,
        mode,
        location: mode === "in_person" ? (location === "jos" ? "Jos (The House of Bread)" : "Abuja Outreach") : "Online",
        streamChannel: mode === "online" ? streamChannel : "none",
        type: "weekend_service",
        date: todayDate,
        timestamp: serverTimestamp(),
        isGuest: !authUser,
      };

      if (enteredCode) {
        record.serviceCode = enteredCode.trim().toUpperCase();
      }

      if (authUser?.uid && !isCheckingInOther) {
        record.userId = authUser.uid;
      }

      if (isCheckingInOther) {
        record.checkedInBy = fullName || savedUser?.fullName || "Family/Friend";
      }

      await addDoc(collection(db, "attendance"), record);

      // Save primary user to localStorage if not checking in someone else
      if (!isCheckingInOther) {
        const toSave = { fullName: attendeeName, phone: attendeePhone, uid: authUser?.uid };
        localStorage.setItem("tph_attendance_user", JSON.stringify(toSave));
        setSavedUser(toSave);
      }

      setShowModal(false);
      setSuccessMessage(
        isCheckingInOther
          ? `Attendance confirmed for ${attendeeName} ✓`
          : "Attendance Confirmed! Thank you for worshipping with us today."
      );
      setShowSuccess(true);

      // Reset 'other' form if used
      if (isCheckingInOther) {
        setIsCheckingInOther(false);
        setOtherName("");
        setOtherPhone("");
      }

      setTimeout(() => setShowSuccess(false), 4500);
    } catch (err: any) {
      console.error("Attendance submission error:", err);
      setError("Could not sign attendance. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const isRecognized = Boolean(savedUser?.fullName || authUser?.displayName);
  const activeDisplayName = authUser?.displayName || savedUser?.fullName || fullName;

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

      {/* Floating Widget Container */}
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
        {/* Success Toast */}
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

        {/* Modal Sheet / Form */}
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
            {/* Top Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: "#D97706", textTransform: "uppercase" }}>
                  The Publishers House
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "2px 0 0", color: "#FFFFFF" }}>
                  {isCheckingInOther ? "Check In Guest / Family" : isRecognized ? `Welcome, ${activeDisplayName.split(" ")[0]}!` : "Sign Attendance"}
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
              {/* If recognized & NOT checking in another person */}
              {isRecognized && !isCheckingInOther ? (
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#F8FAFC" }}>{activeDisplayName}</div>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>{phone || savedUser?.phone || "Phone logged"}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSavedUser(null);
                      setFullName("");
                      setPhone("");
                      localStorage.removeItem("tph_attendance_user");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#38BDF8",
                      fontSize: "11px",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Switch
                  </button>
                </div>
              ) : (
                /* Inputs for First-time user OR checking in family member */
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", marginBottom: "6px" }}>
                      {isCheckingInOther ? "Family Member / Friend's Name *" : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Adekunle"
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
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0801 234 5678"
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

              {/* Attendance Mode Selector */}
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

              {/* Sub-options based on mode */}
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
                /* Online Mode details */
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

                  {/* Stream Code Input */}
                  {streamCodeConfig.active && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <label style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F59E0B" }}>
                          Stream Check-In Code *
                        </label>
                        <span style={{ fontSize: "9px", color: "#94A3B8" }}>Announced on stream</span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter stream code"
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #F59E0B",
                          background: "rgba(245,158,11,0.08)",
                          color: "#FFFFFF",
                          fontSize: "13px",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div style={{ color: "#EF4444", fontSize: "11px", background: "rgba(239,68,68,0.1)", padding: "8px 10px", borderRadius: "6px", lineHeight: "1.4em" }}>
                  {error}
                </div>
              )}

              {/* Action Buttons */}
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

              {/* Multi-person check-in toggle button */}
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

        {/* The Floating Trigger Button */}
        {!showModal && !showSuccess && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Pill Tooltip */}
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

            {/* Circular Hold Button */}
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
              {/* Background Glow & Button Body */}
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

              {/* Progress SVG Ring */}
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
