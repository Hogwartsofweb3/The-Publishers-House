"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";
import { getPortalUser, PortalUser, UNITS } from "@/lib/portalAuth";
import { useRouter } from "next/navigation";

const FONT = "var(--font-montserrat-family, 'Montserrat', sans-serif)";

export default function CommunicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "unit" | "unit_heads" | "admins">("all");
  const [targetUnitId, setTargetUnitId] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  // Sent history from audit log (lightweight)
  const [history, setHistory] = useState<{ id: string; subject?: string; action: string; actor: string; timestamp: string; sent?: number }[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const pUser = await getPortalUser(fbUser.uid);
        if (pUser && ["admin", "super_admin", "portal_manager"].includes(pUser.role)) {
          setUser(pUser);
        } else {
          router.push("/portal");
        }
      } else {
        router.push("/portal/login");
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    // Load recent announcement audit logs
    const load = async () => {
      try {
        const res = await fetch("/api/portal/audit?category=announcement&limit=10");
        if (res.ok) {
          const data = await res.json();
          setHistory(data.logs || []);
        }
      } catch {
        // non-critical
      }
    };
    load();
  }, [user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setResult("");
    try {
      const body: Record<string, string> = {
        subject: subject.trim(),
        message: message.trim(),
        target: targetType,
      };
      if (targetType === "unit" && targetUnitId) body.unitId = targetUnitId;

      const res = await fetch("/api/portal/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(`✓ Announcement sent to ${data.sent ?? "all"} recipient(s).`);
        setSubject("");
        setMessage("");
        // Refresh history
        setTimeout(async () => {
          try {
            const r2 = await fetch("/api/portal/audit?category=announcement&limit=10");
            if (r2.ok) setHistory((await r2.json()).logs || []);
          } catch { /* ok */ }
        }, 1200);
      } else {
        setResult(`✗ ${data.error || "Failed to send."}`);
      }
    } catch {
      setResult("✗ Network error. Please try again.");
    } finally {
      setSending(false);
      setTimeout(() => setResult(""), 8000);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ fontFamily: FONT, color: "#64748B" }}>Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const targetLabel: Record<string, string> = {
    all: "All Portal Members",
    unit_heads: "All Unit Heads",
    admins: "Admins & Pastors",
    unit: "Specific Unit Members",
  };

  return (
    <div style={{ padding: "24px", maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div>
        <div style={{ fontFamily: FONT, fontSize: "22px", fontWeight: 800, color: "#0E1556" }}>
          📣 Communications
        </div>
        <div style={{ fontFamily: FONT, fontSize: "13px", color: "#64748B", marginTop: "4px" }}>
          Send email announcements to members, unit heads, or specific units.
        </div>
      </div>

      {/* Compose Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D5DCF2",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "0 4px 14px rgba(14,21,86,0.06)",
        }}
      >
        <div style={{ fontFamily: FONT, fontSize: "15px", fontWeight: 800, color: "#0E1556", marginBottom: "20px" }}>
          Compose Announcement
        </div>

        <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Target Audience */}
          <div>
            <label style={{ display: "block", fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Recipients
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(["all", "unit_heads", "admins", "unit"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTargetType(t)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "99px",
                    border: `2px solid ${targetType === t ? "#1F46C8" : "#D5DCF2"}`,
                    backgroundColor: targetType === t ? "#1F46C8" : "#F8FAFD",
                    color: targetType === t ? "#FFFFFF" : "#334155",
                    fontFamily: FONT,
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {targetLabel[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Unit selector (shows only when "unit" is selected) */}
          {targetType === "unit" && (
            <div>
              <label style={{ display: "block", fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                Select Unit *
              </label>
              <select
                required
                value={targetUnitId}
                onChange={(e) => setTargetUnitId(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: FONT, fontSize: "13px", color: "#141C6E", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="">— Select a unit —</option>
                {UNITS.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Subject */}
          <div>
            <label style={{ display: "block", fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              Subject *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Important update from TPH Leadership"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: FONT, fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Message */}
          <div>
            <label style={{ display: "block", fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              Message *
            </label>
            <textarea
              required
              rows={6}
              placeholder="Dear member,&#10;&#10;This is an announcement from The Publishers House..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: FONT, fontSize: "13px", color: "#141C6E", outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          {/* Result banner */}
          {result && (
            <div
              style={{
                fontFamily: FONT,
                fontSize: "13px",
                fontWeight: 600,
                color: result.startsWith("✓") ? "#0F6B38" : "#B91C1C",
                backgroundColor: result.startsWith("✓") ? "#DCFCE7" : "#FEE2E2",
                padding: "12px 16px",
                borderRadius: "8px",
              }}
            >
              {result}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            style={{
              padding: "14px",
              backgroundColor: "#0E1556",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: "14px",
              cursor: sending ? "not-allowed" : "pointer",
              opacity: sending ? 0.7 : 1,
              letterSpacing: "0.03em",
            }}
          >
            {sending ? "Sending..." : `📨 Send to ${targetLabel[targetType]}`}
          </button>
        </form>
      </div>

      {/* Sent History */}
      {history.length > 0 && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 6px rgba(14,21,86,0.04)",
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 800, color: "#0E1556", marginBottom: "14px" }}>
            Recent Announcements
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {history.map((log) => {
              const ts = log.timestamp ? new Date(log.timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
              return (
                <div
                  key={log.id}
                  style={{
                    padding: "12px 14px",
                    backgroundColor: "#F8FAFD",
                    borderRadius: "8px",
                    border: "1px solid #E8EDFB",
                  }}
                >
                  <div style={{ fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, color: "#0E1556", marginBottom: "2px" }}>
                    {log.action}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>
                    By {log.actor} · {ts}{log.sent != null ? ` · ${log.sent} recipients` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
