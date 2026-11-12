"use client";

import { useEffect, useState, useMemo } from "react";
import type { PortalUser } from "@/lib/portalAuth";
import type { VisitorRecord } from "./FollowUpPipelineCard";

const DISCIPLESHIP_STAGES = [
  "New Handover (Awaiting Outreach)",
  "Foundation Class — Module 1",
  "Foundation Class — Module 2",
  "Foundation Class — Module 3",
  "Water Baptism Candidate",
  "Baptized & Integrated",
  "Active Worker / Believer",
];

export default function DiscipleshipCohortCard({
  currentUser,
}: {
  currentUser: PortalUser;
}) {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const fetchCohort = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/portal/visitors");
      if (res.ok) {
        const data = await res.json();
        const all: VisitorRecord[] = data.visitors || [];
        // Only visitors handed over to discipleship or marked for discipleship
        const cohort = all.filter(
          (v) =>
            v.status === "handed_over_to_discipleship" ||
            v.targetUnit === "discipleship_evangelism" ||
            Boolean(v.handoverDate)
        );
        setVisitors(cohort);
      }
    } catch (e) {
      console.warn("Could not load discipleship cohort:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCohort();
  }, []);

  const handleUpdateStage = async (visitor: VisitorRecord, newStage: string) => {
    setActionInProgress(visitor.id);
    try {
      const res = await fetch("/api/portal/visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: visitor.id,
          discipleshipStage: newStage,
        }),
      });

      if (res.ok) {
        setVisitors((prev) =>
          prev.map((v) => (v.id === visitor.id ? { ...v, discipleshipStage: newStage } : v))
        );
        setMsg(`✓ ${visitor.name} moved to: ${newStage}`);
        setTimeout(() => setMsg(""), 4000);
      }
    } catch {
      alert("Failed to update discipleship stage");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSaveDiscipleshipNote = async (visitor: VisitorRecord) => {
    if (!noteInput.trim()) return;
    setActionInProgress(visitor.id);
    try {
      const timestamp = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const author = currentUser.displayName?.split(" ")[0] || "Discipler";
      const appended = visitor.notes
        ? `${visitor.notes} \n[${timestamp} · Discipleship (${author})]: ${noteInput.trim()}`
        : `[${timestamp} · Discipleship (${author})]: ${noteInput.trim()}`;

      const res = await fetch("/api/portal/visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: visitor.id,
          notes: appended,
        }),
      });

      if (res.ok) {
        setVisitors((prev) =>
          prev.map((v) => (v.id === visitor.id ? { ...v, notes: appended } : v))
        );
        setNoteInput("");
        setEditingNotesId(null);
        setMsg(`✓ Discipleship note recorded for ${visitor.name}`);
        setTimeout(() => setMsg(""), 3500);
      }
    } catch {
      alert("Could not save note");
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredCohort = useMemo(() => {
    return visitors.filter((v) => {
      if (stageFilter !== "all") {
        const curStage = v.discipleshipStage || "New Handover (Awaiting Outreach)";
        if (curStage !== stageFilter) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (v.name || "").toLowerCase().includes(q) ||
          (v.phone || "").toLowerCase().includes(q) ||
          (v.notes || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [visitors, stageFilter, search]);

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #D5DCF2",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 2px 10px rgba(14,21,86,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>📖</span>
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "18px",
                fontWeight: 800,
                color: "#141C6E",
                margin: 0,
              }}
            >
              Received from Follow-Up (Discipleship Cohort)
            </h2>
          </div>
          <p
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "12.5px",
              color: "#4A5490",
              margin: "6px 0 0",
            }}
          >
            These believers have been shepherded by the Follow-Up unit and officially handed over for Foundation Classes, faith formation, and water baptism.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              backgroundColor: "#7C3AED",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {visitors.length} Discipleship Candidate{visitors.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search by disciple name, phone, or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "220px",
            padding: "9px 14px",
            borderRadius: "8px",
            border: "1px solid #D5DCF2",
            fontSize: "13px",
            color: "#141C6E",
            outline: "none",
          }}
        />

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          style={{
            padding: "9px 14px",
            borderRadius: "8px",
            border: "1px solid #D5DCF2",
            fontSize: "12.5px",
            color: "#141C6E",
            outline: "none",
            backgroundColor: "#FFFFFF",
          }}
        >
          <option value="all">All Discipleship Stages ({visitors.length})</option>
          {DISCIPLESHIP_STAGES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {msg && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#DCFCE7",
            color: "#166534",
            borderRadius: "8px",
            fontSize: "12.5px",
            fontWeight: 600,
          }}
        >
          {msg}
        </div>
      )}

      {/* Cohort Cards */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
          Loading discipleship cohort from Follow-Up unit...
        </div>
      ) : filteredCohort.length === 0 ? (
        <div
          style={{
            padding: "36px 16px",
            textAlign: "center",
            color: "#64748B",
            backgroundColor: "#FAF5FF",
            borderRadius: "12px",
            border: "1px dashed #DDD6FE",
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>✦</div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#6B21A8" }}>
            No discipleship candidates found in this view.
          </div>
          <div style={{ fontSize: "12px", color: "#7E22CE", marginTop: "4px" }}>
            When the Follow-Up unit clicks &quot;Handover to Discipleship&quot; on first-timers, they automatically arrive here.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {filteredCohort.map((v) => {
            const isProcessing = actionInProgress === v.id;
            const currentStage = v.discipleshipStage || "New Handover (Awaiting Outreach)";
            const cleanPhone = (v.phone || "").replace(/[^0-9]/g, "");
            const waPhone = cleanPhone.startsWith("0") && cleanPhone.length === 11
              ? "234" + cleanPhone.substring(1)
              : cleanPhone;

            const waText = encodeURIComponent(
              `Grace and peace ${v.name}! Welcome to the Discipleship & Evangelism family at The Publishers House. We are so excited to walk with you through Foundation Classes and spiritual growth!`
            );

            return (
              <div
                key={v.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E4D4F7",
                  borderRadius: "12px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  boxShadow: "0 2px 6px rgba(124, 58, 237, 0.05)",
                }}
              >
                {/* Name + Handover Tag */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#141C6E" }}>
                      {v.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6B21A8", marginTop: "2px", fontWeight: 600 }}>
                      ✦ Handed over by {v.handoverBy || "Follow-Up Team"} on{" "}
                      {v.handoverDate ? new Date(v.handoverDate).toLocaleDateString() : "Recent"}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      backgroundColor: "#F3E8FF",
                      color: "#6B21A8",
                    }}
                  >
                    {v.campus || "Jos"}
                  </span>
                </div>

                {/* Contact Links */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  {v.phone && (
                    <a
                      href={`tel:${v.phone}`}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#F8FAFD",
                        border: "1px solid #D5DCF2",
                        borderRadius: "6px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        color: "#1F46C8",
                        textDecoration: "none",
                      }}
                    >
                      📞 {v.phone}
                    </a>
                  )}

                  {v.phone && (
                    <a
                      href={`https://wa.me/${waPhone}?text=${waText}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#DCFCE7",
                        border: "1px solid #86EFAC",
                        borderRadius: "6px",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#166534",
                        textDecoration: "none",
                      }}
                    >
                      💬 WhatsApp Discipleship Invite
                    </a>
                  )}
                </div>

                {/* Discipleship Progress Tracker */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#6B21A8", textTransform: "uppercase", marginBottom: "4px" }}>
                    Discipleship Growth Stage
                  </label>
                  <select
                    disabled={isProcessing}
                    value={currentStage}
                    onChange={(e) => handleUpdateStage(v, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #C4B5FD",
                      backgroundColor: "#FAF5FF",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#5B21B6",
                      outline: "none",
                    }}
                  >
                    {DISCIPLESHIP_STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes History from Follow-Up */}
                {v.notes && (
                  <div>
                    <label style={{ display: "block", fontSize: "10.5px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: "3px" }}>
                      Follow-Up &amp; Discipleship Notes:
                    </label>
                    <div
                      style={{
                        padding: "8px 10px",
                        backgroundColor: "#F8FAFD",
                        borderRadius: "6px",
                        border: "1px solid #E8EDFB",
                        fontSize: "11.5px",
                        color: "#4A5490",
                        lineHeight: "15px",
                        whiteSpace: "pre-wrap",
                        maxHeight: "90px",
                        overflowY: "auto",
                      }}
                    >
                      {v.notes}
                    </div>
                  </div>
                )}

                {/* Add Discipleship Note */}
                {editingNotesId === v.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <textarea
                      rows={2}
                      placeholder="Log class attendance, spiritual progress, or testimony..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid #7C3AED",
                        fontSize: "12px",
                        outline: "none",
                      }}
                    />
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNotesId(null);
                          setNoteInput("");
                        }}
                        style={{ padding: "4px 8px", backgroundColor: "#F1F5F9", border: "none", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleSaveDiscipleshipNote(v)}
                        style={{
                          padding: "4px 12px",
                          backgroundColor: "#7C3AED",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNotesId(v.id);
                      setNoteInput("");
                    }}
                    style={{
                      alignSelf: "flex-start",
                      background: "none",
                      border: "none",
                      color: "#7C3AED",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    + Add Discipleship Note
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
