"use client";

import { useState, useRef, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface FirstTimeForm {
  fullName: string;
  phone: string;
}

export default function FloatingAttendance() {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [formData, setForm] = useState<FirstTimeForm>({ fullName: "", phone: "" });
  
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Check if returning user
  useEffect(() => {
    const stored = localStorage.getItem("tph_attendance_user");
    if (stored) {
      setIsReturning(true);
      setForm(JSON.parse(stored));
    }
  }, []);

  const submitAttendance = async (data: FirstTimeForm) => {
    try {
      await addDoc(collection(db, "attendance"), {
        fullName: data.fullName,
        phone: data.phone,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split("T")[0],
        type: "weekend_service",
      });
      localStorage.setItem("tph_attendance_user", JSON.stringify(data));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to sign attendance:", err);
    }
  };

  const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (showForm || showSuccess) return;
    
    setIsPressing(true);
    setProgress(0);

    // Animate progress ring
    let currentProgress = 0;
    progressInterval.current = setInterval(() => {
      currentProgress += 100 / (3000 / 50); // 3 seconds total, updating every 50ms
      setProgress(Math.min(currentProgress, 100));
    }, 50);

    // Timer for completion
    pressTimer.current = setTimeout(() => {
      clearTimers();
      if (isReturning) {
        submitAttendance(formData);
      } else {
        setShowForm(true);
      }
    }, 3000);
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowForm(false);
    await submitAttendance(formData);
  };

  // SVG for progress ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .attendance-form { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

      {/* Floating Button Area */}
      <div
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "16px",
        }}
      >
        {/* Success Toast */}
        {showSuccess && (
          <div
            className="attendance-form"
            style={{
              background: "#10B981",
              color: "#fff",
              padding: "16px 24px",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(16,185,129,0.3)",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "18px" }}>✓</span>
            <div>
              <div style={{ fontWeight: 700 }}>Attendance Confirmed</div>
              <div style={{ fontWeight: 400, opacity: 0.9 }}>Thank you for worshipping with us today.</div>
            </div>
          </div>
        )}

        {/* First Time Form */}
        {showForm && (
          <div
            className="attendance-form"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E8ECF7",
              borderRadius: "16px",
              padding: "24px",
              width: "320px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "16px", fontWeight: 700, color: "#151A54", margin: 0 }}>
                Welcome to TPH
              </h3>
              <button 
                onClick={() => setShowForm(false)}
                style={{ background: "none", border: "none", fontSize: "16px", color: "#94A3B8", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: "#747CA1", margin: "0 0 20px" }}>
              Please provide your details once to sign attendance.
            </p>
            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #D3DAEC", fontFamily: "'Poppins', sans-serif", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <input
                  type="tel"
                  required
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #D3DAEC", fontFamily: "'Poppins', sans-serif", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <button
                type="submit"
                style={{ width: "100%", padding: "12px", background: "#0140C1", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer", marginTop: "4px" }}
              >
                Confirm Attendance
              </button>
            </form>
          </div>
        )}

        {/* The Button */}
        {!showForm && !showSuccess && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Tooltip */}
            <div style={{
              background: "#151A54",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: "8px",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              opacity: isPressing ? 0 : 1,
              transition: "opacity 0.2s",
              pointerEvents: "none",
            }}>
              Tap and hold to sign attendance
            </div>

            {/* Circular Press Button */}
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
                transform: isPressing ? "scale(0.95)" : "scale(1)",
                transition: "transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {/* Background Circle */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "#0140C1",
                borderRadius: "50%",
                boxShadow: isPressing ? "0 0 0 rgba(1,64,193,0)" : "0 8px 24px rgba(1,64,193,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "24px",
                transition: "box-shadow 0.2s",
                zIndex: 2,
              }}>
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
