"use client";

import { useState, useRef, useEffect } from "react";
import { auth } from "@/lib/firebaseAuth";
import { onAuthStateChanged, User } from "firebase/auth";

interface AttendanceUser {
  fullName: string;
  phone: string;
  uid?: string;
}

interface GuestAttendee {
  id: string;
  fullName: string;
  phone: string;
}

type ServiceMode = "in_person" | "online";
type VenueLocation = "jos" | "abuja";
type StreamChannel = "youtube" | "mixlr" | "telegram";

/* ─── Design Tokens (TPH Design System v2.0) ─── */
const Navy      = "#151A54";
const NavyDark  = "#0F1338";
const Blue700   = "#0140C1";
const Blue500   = "#2090FF";
const AmberGold = "#2090FF";
const AmberWarm = "#6496EF";
const Slate500  = "#747CA1";
const Slate400  = "#94A3B8";
const White     = "#FFFFFF";
const Red       = "#EF4444";
const Green     = "#10B981";

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

  // Input states for self
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isCodeRequired, setIsCodeRequired] = useState(false);

  // Multi-guest check-in state
  const [guests, setGuests] = useState<GuestAttendee[]>([]);
  const [isCheckingInOther, setIsCheckingInOther] = useState(false);
  const [checkInSelf, setCheckInSelf] = useState(true);

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const checkStreamConfig = () => {
    fetch("/api/attendance/config")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.active === "boolean") {
          setIsCodeRequired(data.active);
        }
      })
      .catch(() => {});
  };

  // Load identity from localStorage & Firebase Auth
  useEffect(() => {
    checkStreamConfig();
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

    checkStreamConfig();
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

  const targetName = isRecognized ? recognizedName.trim() : fullName.trim();
  const targetPhone = isRecognized ? (recognizedPhone.trim() || phone.trim()) : phone.trim();

  // Guest Management
  const addGuest = () => {
    const newGuest: GuestAttendee = {
      id: "guest-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      fullName: "",
      phone: "",
    };
    setGuests((prev) => [...prev, newGuest]);
  };

  const updateGuest = (id: string, field: "fullName" | "phone", value: string) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const removeGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    // Determine attendees to submit
    const attendeesToSubmit: Array<{
      fullName: string;
      phone?: string;
      mode: ServiceMode;
      location: string;
      streamChannel: StreamChannel;
      serviceCode?: string;
      checkedInBy?: string;
    }> = [];

    const locString = location === "jos" ? "Jos (House of Bread)" : "Abuja Outreach";

    // 1. Add self if enabled
    if (checkInSelf && !isCheckingInOther) {
      if (!targetName) {
        setError("Please enter your full name.");
        return;
      }
      attendeesToSubmit.push({
        fullName: targetName,
        phone: targetPhone,
        mode,
        location: locString,
        streamChannel,
        serviceCode: enteredCode.trim(),
      });
    }

    // 2. Add guests
    const sponsorName = (isRecognized ? recognizedName : fullName) || "Family/Friend";
    for (const g of guests) {
      const gName = g.fullName.trim();
      if (!gName && isCheckingInOther) {
        setError("Please provide a name for each guest, or remove empty guest rows.");
        return;
      }
      if (gName) {
        attendeesToSubmit.push({
          fullName: gName,
          phone: g.phone.trim(),
          mode,
          location: locString,
          streamChannel,
          serviceCode: enteredCode.trim(),
          checkedInBy: sponsorName,
        });
      }
    }

    if (attendeesToSubmit.length === 0) {
      setError("Please provide at least one attendee name.");
      return;
    }

    if (mode === "online" && isCodeRequired && !enteredCode.trim()) {
      setError("Please enter the Stream Check-In Code announced during the service.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        mode,
        location: locString,
        streamChannel,
        serviceCode: enteredCode.trim(),
        attendees: attendeesToSubmit,
      };

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Could not record attendance. Please try again.");
      }

      // Update local storage if signed self
      if (checkInSelf && !isCheckingInOther && targetName) {
        const toSave = { fullName: targetName, phone: targetPhone };
        localStorage.setItem("tph_attendance_user", JSON.stringify(toSave));
        setSavedUser(toSave);
        setIsEditing(false);
      }

      setShowModal(false);

      const guestCount = attendeesToSubmit.length - (checkInSelf && !isCheckingInOther ? 1 : 0);
      if (checkInSelf && !isCheckingInOther) {
        setSuccessMessage(
          guestCount > 0
            ? `Attendance confirmed for you + ${guestCount} guest${guestCount > 1 ? "s" : ""} ✓`
            : "Attendance Confirmed! Thank you for worshipping with us today."
        );
      } else {
        setSuccessMessage(
          `Attendance confirmed for ${guestCount} guest${guestCount > 1 ? "s" : ""} ✓`
        );
      }

      setShowSuccess(true);
      setGuests([]);
      setIsCheckingInOther(false);
      setCheckInSelf(true);

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err: any) {
      console.error("Attendance submission error:", err);
      setError(err?.message || "Could not record attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // SVG circular progress ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const totalAttendeesCount = (checkInSelf && !isCheckingInOther ? 1 : 0) + guests.filter(g => g.fullName.trim()).length;

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
        .tph-custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .tph-custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .tph-custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
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
              background: Blue700,
              color: White,
              padding: "16px 22px",
              borderRadius: "8px",
              boxShadow: "0 16px 36px rgba(1,64,193,0.35)",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              maxWidth: "360px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: Green,
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
              <div style={{ fontSize: "12px", opacity: 0.95, marginTop: "2px" }}>{successMessage}</div>
            </div>
          </div>
        )}

        {/* Modal Form */}
        {showModal && (
          <div
            className="tph-modal-anim tph-custom-scrollbar"
            style={{
              background: `linear-gradient(180deg, ${Navy} 0%, ${NavyDark} 100%)`,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "14px",
              padding: "24px",
              width: "360px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 24px 50px rgba(0,0,0,0.5)",
              color: White,
              fontFamily: "'Poppins', sans-serif",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", color: AmberGold, textTransform: "uppercase" }}>
                  The Publishers House
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "20px",
                    fontWeight: 700,
                    margin: "2px 0 0",
                    color: White,
                  }}
                >
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
                  setGuests([]);
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
                  color: Slate400,
                  cursor: "pointer",
                  fontSize: "13px",
                  transition: "background-color 0.15s ease",
                }}
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Member Identity Card */}
              {isRecognized && !isCheckingInOther ? (
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: White }}>{recognizedName}</div>
                      <div style={{ fontSize: "11px", color: recognizedPhone ? Slate400 : AmberWarm, marginTop: "2px" }}>
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
                        color: Blue500,
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Switch / Edit
                    </button>
                  </div>
                </div>
              ) : !isCheckingInOther ? (
                /* Inputs for new / editing primary attendee */
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: Slate400, marginBottom: "6px" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Michael Okoro"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.05)",
                        color: White,
                        fontSize: "13px",
                        fontFamily: "'Poppins', sans-serif",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: Slate400, marginBottom: "6px" }}>
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 0706 194 5751"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.05)",
                        color: White,
                        fontSize: "13px",
                        fontFamily: "'Poppins', sans-serif",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </>
              ) : null}

              {/* Mode Selection */}
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: Slate400, marginBottom: "6px" }}>
                  Where are you worshipping today?
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setMode("in_person")}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "6px",
                      border: mode === "in_person" ? `1.5px solid ${Blue500}` : "1px solid rgba(255,255,255,0.1)",
                      background: mode === "in_person" ? "rgba(32, 144, 255, 0.18)" : "rgba(255,255,255,0.03)",
                      color: mode === "in_person" ? White : Slate400,
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: "'Poppins', sans-serif",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>🏛️</span> In-Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("online")}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "6px",
                      border: mode === "online" ? `1.5px solid ${Blue500}` : "1px solid rgba(255,255,255,0.1)",
                      background: mode === "online" ? "rgba(32, 144, 255, 0.18)" : "rgba(255,255,255,0.03)",
                      color: mode === "online" ? White : Slate400,
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: "'Poppins', sans-serif",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>🌐</span> Online Stream
                  </button>
                </div>
              </div>

              {/* In-Person Sanctuary vs Online Options */}
              {mode === "in_person" ? (
                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: Slate400, marginBottom: "6px" }}>
                    Select Sanctuary Center
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setLocation("jos")}
                      style={{
                        flex: 1,
                        padding: "9px 8px",
                        borderRadius: "6px",
                        border: location === "jos" ? `1.5px solid ${AmberGold}` : "1px solid rgba(255,255,255,0.1)",
                        background: location === "jos" ? "rgba(217,119,6,0.18)" : "rgba(255,255,255,0.02)",
                        color: location === "jos" ? AmberWarm : Slate400,
                        fontSize: "11px",
                        fontWeight: 600,
                        fontFamily: "'Poppins', sans-serif",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Jos (House of Bread)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocation("abuja")}
                      style={{
                        flex: 1,
                        padding: "9px 8px",
                        borderRadius: "6px",
                        border: location === "abuja" ? `1.5px solid ${AmberGold}` : "1px solid rgba(255,255,255,0.1)",
                        background: location === "abuja" ? "rgba(217,119,6,0.18)" : "rgba(255,255,255,0.02)",
                        color: location === "abuja" ? AmberWarm : Slate400,
                        fontSize: "11px",
                        fontWeight: 600,
                        fontFamily: "'Poppins', sans-serif",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Abuja Outreach
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: Slate400, marginBottom: "6px" }}>
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
                            padding: "7px 6px",
                            borderRadius: "6px",
                            border: streamChannel === ch ? `1px solid ${Blue500}` : "1px solid rgba(255,255,255,0.08)",
                            background: streamChannel === ch ? "rgba(32,144,255,0.2)" : "transparent",
                            color: streamChannel === ch ? White : Slate400,
                            fontSize: "11px",
                            textTransform: "capitalize",
                            fontWeight: 600,
                            fontFamily: "'Poppins', sans-serif",
                            cursor: "pointer",
                          }}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isCodeRequired ? (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: AmberWarm }}>
                          Stream Check-In Code *
                        </label>
                        <span style={{ fontSize: "9px", color: AmberWarm, background: "rgba(32,144,255,0.15)", border: "1px solid rgba(32,144,255,0.3)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                          CODE REQUIRED
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter code displayed on stream"
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "6px",
                          border: `1px solid ${AmberWarm}`,
                          background: "rgba(32,144,255,0.08)",
                          color: White,
                          fontSize: "13px",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <p style={{ fontSize: "11px", color: Slate400, margin: 0 }}>
                        ✓ Open stream check-in — no stream code is required for today's service.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── MULTI-GUEST / FAMILY SECTION ── */}
              <div style={{ marginTop: "4px" }}>
                {guests.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: Blue500 }}>
                        Family / Guests ({guests.length})
                      </label>
                      {!isCheckingInOther && (
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: Slate400, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={checkInSelf}
                            onChange={(e) => setCheckInSelf(e.target.checked)}
                            style={{ accentColor: Blue700 }}
                          />
                          <span>Include myself</span>
                        </label>
                      )}
                    </div>

                    {/* Guest entries list */}
                    {guests.map((guest, idx) => (
                      <div
                        key={guest.id}
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          padding: "12px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: AmberWarm, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Guest #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeGuest(guest.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: Red,
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                              padding: "2px 4px",
                            }}
                          >
                            ✕ Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Family Member / Friend's Name *"
                          value={guest.fullName}
                          onChange={(e) => updateGuest(guest.id, "fullName", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: "rgba(255,255,255,0.05)",
                            color: White,
                            fontSize: "12px",
                            fontFamily: "'Poppins', sans-serif",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                        <input
                          type="tel"
                          placeholder="Phone number (optional)"
                          value={guest.phone}
                          onChange={(e) => updateGuest(guest.id, "phone", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: "rgba(255,255,255,0.05)",
                            color: White,
                            fontSize: "12px",
                            fontFamily: "'Poppins', sans-serif",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    ))}

                    {/* Add Another Guest Button */}
                    <button
                      type="button"
                      onClick={addGuest}
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px dashed rgba(32, 144, 255, 0.4)",
                        background: "rgba(32, 144, 255, 0.05)",
                        color: Blue500,
                        fontSize: "11px",
                        fontWeight: 600,
                        fontFamily: "'Poppins', sans-serif",
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        transition: "all 0.15s ease",
                      }}
                    >
                      + Add Another Guest / Family Member
                    </button>
                  </div>
                ) : (
                  /* Button to trigger guest mode */
                  <button
                    type="button"
                    onClick={() => {
                      addGuest();
                      setIsCheckingInOther(false);
                    }}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "1px dashed rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      padding: "10px",
                      color: Slate400,
                      fontSize: "11px",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500,
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "border-color 0.15s ease, color 0.15s ease",
                    }}
                  >
                    + Check in a family member or friend
                  </button>
                )}
              </div>

              {error && (
                <div style={{ color: Red, fontSize: "11px", background: "rgba(239,68,68,0.1)", padding: "8px 10px", borderRadius: "6px", lineHeight: "1.4em" }}>
                  {error}
                </div>
              )}

              {/* Submit Button (TPH Design System v2.0 Standard Button) */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "46px",
                  background: loading ? "#3A4570" : Blue700,
                  color: White,
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontFamily: "'Poppins', sans-serif",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "6px",
                  boxShadow: "0 4px 14px rgba(1,64,193,0.35)",
                  transition: "background-color 0.15s ease",
                }}
              >
                {loading
                  ? "Confirming..."
                  : totalAttendeesCount > 1
                  ? `Confirm Attendance (${totalAttendeesCount} Attendees)`
                  : isCheckingInOther || !checkInSelf
                  ? "Confirm Guest Check-In"
                  : "Confirm My Attendance"}
              </button>

              {/* Switch back button if checking in only others */}
              {isCheckingInOther && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCheckingInOther(false);
                    setCheckInSelf(true);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: Slate400,
                    fontSize: "11px",
                    cursor: "pointer",
                    textAlign: "center",
                    textDecoration: "underline",
                  }}
                >
                  ← Back to My Check-in
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
                background: Navy,
                color: White,
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
              <span style={{ color: AmberGold }}>●</span>
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
                  background: Blue700,
                  borderRadius: "50%",
                  boxShadow: isPressing
                    ? "0 0 0 rgba(1,64,193,0)"
                    : "0 10px 28px rgba(1,64,193,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: White,
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
                  stroke={AmberGold}
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
