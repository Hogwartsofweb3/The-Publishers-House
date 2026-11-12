"use client";

import { useEffect, useState } from "react";
import { UNITS, PortalUser } from "@/lib/portalAuth";
import { usePortal } from "@/lib/portalContext";

interface SwapRequest {
  id?: string;
  unitId: string;
  requesterName: string;
  requesterUid: string;
  serviceDate: string;
  dutyRole: string;
  proposedSwapMember: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function UnitSwapsPage() {
  const { effectiveUser } = usePortal();
  const [loading, setLoading] = useState(true);
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [members, setMembers] = useState<PortalUser[]>([]);

  // Manual request form for unit members or head
  const [serviceDate, setServiceDate] = useState("");
  const [dutyRole, setDutyRole] = useState("");
  const [proposedSwapMember, setProposedSwapMember] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const normUnitId = (effectiveUser?.assignedUnitId || "").toLowerCase();
  const activeUnit = UNITS.find((u) => u.id === normUnitId) || UNITS[0];

  useEffect(() => {
    if (!normUnitId) {
      setLoading(false);
      return;
    }
    fetchUnitData(normUnitId);
  }, [normUnitId]);

  const fetchUnitData = async (unitId: string) => {
    try {
      // Members — via Admin SDK API (quota-safe; avoids direct Firestore client reads)
      let mList: PortalUser[] = [];
      try {
        const res = await fetch(`/api/portal/members?unitId=${encodeURIComponent(unitId)}`);
        if (res.ok) {
          const data = await res.json();
          const all: PortalUser[] = data.members || [];
          mList = all.filter(
            (u) => (u.assignedUnitId || "").trim().toLowerCase() === unitId.trim().toLowerCase()
          );
        }
      } catch {
        // silent fallback — leave members empty
      }
      setMembers(mList);

      // Swaps — via Admin SDK API route (bypasses Firestore permission restrictions)
      try {
        const sRes = await fetch(`/api/portal/unit/swaps?unitId=${encodeURIComponent(unitId)}`);
        if (sRes.ok) {
          const sData = await sRes.json();
          const list = (sData.swaps || []) as SwapRequest[];
          list.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
          setSwaps(list);
        }
      } catch (e) {
        console.error("Failed to load swaps:", e);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!normUnitId || !serviceDate || !dutyRole || !proposedSwapMember || !reason) return;
    setSubmitting(true);
    setMsg("");
    try {
      const res = await fetch("/api/portal/unit/swaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: normUnitId,
          requesterName: effectiveUser?.displayName || effectiveUser?.email || "Unit Member",
          requesterUid: effectiveUser?.uid || "anon",
          serviceDate,
          dutyRole,
          proposedSwapMember,
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit swap request");

      setMsg("Swap request submitted successfully ✓");
      setReason("");
      setDutyRole("");
      fetchUnitData(normUnitId);
      setTimeout(() => setMsg(""), 4000);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (swapId?: string, newStatus?: "approved" | "rejected") => {
    if (!swapId || !newStatus) return;
    try {
      await fetch("/api/portal/unit/swaps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swapId, status: newStatus }),
      });
      if (normUnitId) fetchUnitData(normUnitId);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", color: "#1F46C8" }}>Loading duty swaps...</div>;
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
          Unit Administration · {activeUnit?.name}
        </div>
        <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 32px)", color: "#141C6E", margin: 0 }}>
          Duty Swap Requests &amp; Coverage
        </h1>
        <p style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontStyle: "italic", fontSize: "14.5px", color: "#4A5490", marginTop: "6px" }}>
          Review and approve service swap requests from unit workers to ensure zero gaps in church operations.
        </p>
      </div>

      {/* File a swap request */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: "0 0 18px" }}>
          File a Service Duty Swap Request
        </h2>

        <form onSubmit={handleCreateSwap}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Original Service Date
              </label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Duty Post To Swap
              </label>
              <input
                type="text"
                value={dutyRole}
                onChange={(e) => setDutyRole(e.target.value)}
                placeholder="e.g. Livestream Engineer"
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
                Covering Member / Replacement
              </label>
              <input
                type="text"
                value={proposedSwapMember}
                onChange={(e) => setProposedSwapMember(e.target.value)}
                placeholder="Name of agreed replacement worker"
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>
              Reason for Absence / Swap Request
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Official travel, medical, or academic engagement"
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {msg && (
            <div style={{ padding: "10px 14px", backgroundColor: "#DCFCE7", color: "#166534", borderRadius: "8px", fontSize: "12.5px", fontWeight: 600, marginBottom: "16px" }}>
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 22px",
              backgroundColor: "#1F46C8",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Submitting..." : "Submit Swap Request"}
          </button>
        </form>
      </div>

      {/* Pending and Resolved Swaps */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "17px", fontWeight: 700, color: "#141C6E", margin: "0 0 16px" }}>
          Swap Request Queue
        </h2>

        {swaps.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {swaps.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: "18px 20px",
                  borderRadius: "10px",
                  backgroundColor: "#F8FAFD",
                  border: "1px solid #E4ECF9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        backgroundColor:
                          s.status === "approved" ? "#DCFCE7" : s.status === "rejected" ? "#FEE2E2" : "#FEF3C7",
                        color:
                          s.status === "approved" ? "#166534" : s.status === "rejected" ? "#991B1B" : "#B45309",
                      }}
                    >
                      {s.status}
                    </span>
                    <span style={{ fontSize: "11px", color: "#64748B" }}>
                      Service Date: {s.serviceDate}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "14.5px", color: "#141C6E" }}>
                    {s.requesterName} → {s.proposedSwapMember} ({s.dutyRole})
                  </div>
                  <p style={{ fontSize: "12px", color: "#4A5490", margin: "4px 0 0" }}>
                    Reason: {s.reason}
                  </p>
                </div>

                {s.status === "pending" && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleUpdateStatus(s.id, "approved")}
                      style={{
                        padding: "8px 14px",
                        backgroundColor: "#16A34A",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Approve ✓
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(s.id, "rejected")}
                      style={{
                        padding: "8px 14px",
                        backgroundColor: "#DC2626",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Decline ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#747CA1", fontSize: "13px", fontStyle: "italic", margin: 0 }}>
            No swap requests in queue. All service workers are scheduled as normal.
          </p>
        )}
      </div>
    </div>
  );
}
