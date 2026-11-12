"use client";

import { useEffect, useState, useMemo } from "react";
import type { PortalUser } from "@/lib/portalAuth";

export interface VisitorRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  firstVisitDate?: string;
  assignedTo?: string;
  notes?: string;
  status: "new" | "followup" | "handed_over_to_discipleship" | "established" | string;
  campus?: string;
  targetUnit?: string;
  handoverDate?: string;
  handoverBy?: string;
  discipleshipStage?: string;
}

export default function FollowUpPipelineCard({
  currentUser,
}: {
  currentUser: PortalUser;
}) {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"active" | "handed_over" | "all">("active");
  const [search, setSearch] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [activeNoteVisitorId, setActiveNoteVisitorId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState("");

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/portal/visitors");
      if (res.ok) {
        const data = await res.json();
        setVisitors(data.visitors || []);
      }
    } catch (e) {
      console.warn("Could not load first-timers for Follow-Up unit:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleHandover = async (visitor: VisitorRecord) => {
    const confirmMsg = `Hand over ${visitor.name} to the Discipleship & Evangelism unit?\n\nThis will transfer them to the discipleship team for Foundation Class enrollment.`;
    if (!window.confirm(confirmMsg)) return;

    setActionInProgress(visitor.id);
    try {
      const res = await fetch("/api/portal/visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: visitor.id,
          status: "handed_over_to_discipleship",
          targetUnit: "discipleship_evangelism",
          handoverDate: new Date().toISOString(),
          handoverBy: currentUser.displayName || currentUser.email || "Follow-Up Team",
        }),
      });

      if (res.ok) {
        setVisitors((prev) =>
          prev.map((v) =>
            v.id === visitor.id
              ? {
                  ...v,
                  status: "handed_over_to_discipleship",
                  targetUnit: "discipleship_evangelism",
                  handoverDate: new Date().toISOString(),
                  handoverBy: currentUser.displayName || currentUser.email || "Follow-Up Team",
                }
              : v
          )
        );
        setMsg(`✓ ${visitor.name} has been successfully handed over to Discipleship & Evangelism ✦`);
        setTimeout(() => setMsg(""), 5000);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to complete handover.");
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleAddNote = async (visitor: VisitorRecord) => {
    if (!newNoteText.trim()) return;
    setActionInProgress(visitor.id);
    try {
      const timestamp = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const author = currentUser.displayName?.split(" ")[0] || "Worker";
      const appendedNote = visitor.notes
        ? `${visitor.notes} \n[${timestamp} · ${author}]: ${newNoteText.trim()}`
        : `[${timestamp} · ${author}]: ${newNoteText.trim()}`;

      const res = await fetch("/api/portal/visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: visitor.id,
          notes: appendedNote,
        }),
      });

      if (res.ok) {
        setVisitors((prev) =>
          prev.map((v) => (v.id === visitor.id ? { ...v, notes: appendedNote } : v))
        );
        setNewNoteText("");
        setActiveNoteVisitorId(null);
        setMsg(`✓ Note added for ${visitor.name}`);
        setTimeout(() => setMsg(""), 3500);
      }
    } catch {
      alert("Could not save note");
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      // Tab filter
      if (filterTab === "active") {
        if (v.status === "handed_over_to_discipleship" || v.status === "established") return false;
      } else if (filterTab === "handed_over") {
        if (v.status !== "handed_over_to_discipleship") return false;
      }
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = (v.name || "").toLowerCase().includes(q);
        const matchesPhone = (v.phone || "").toLowerCase().includes(q);
        const matchesNotes = (v.notes || "").toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesNotes;
      }
      return true;
    });
  }, [visitors, filterTab, search]);

  const activeCount = visitors.filter(
    (v) => v.status !== "handed_over_to_discipleship" && v.status !== "established"
  ).length;

  const handedOverCount = visitors.filter(
    (v) => v.status === "handed_over_to_discipleship"
  ).length;

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
            <span style={{ fontSize: "20px" }}>🤝</span>
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "18px",
                fontWeight: 800,
                color: "#141C6E",
                margin: 0,
              }}
            >
              First-Timers Shepherding &amp; Discipleship Handover
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
            Follow up new visitors and converts. Once they have completed initial orientation, click <strong>Handover to Discipleship ✦</strong> to transition them into the discipleship cohort.
          </p>
        </div>

        {/* Action Pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setFilterTab("active")}
            style={{
              padding: "7px 14px",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: filterTab === "active" ? "#1F46C8" : "#D5DCF2",
              backgroundColor: filterTab === "active" ? "#EFF6FF" : "#FFFFFF",
              color: filterTab === "active" ? "#1F46C8" : "#64748B",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            In Follow-Up ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("handed_over")}
            style={{
              padding: "7px 14px",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: filterTab === "handed_over" ? "#7C3AED" : "#D5DCF2",
              backgroundColor: filterTab === "handed_over" ? "#F5F3FF" : "#FFFFFF",
              color: filterTab === "handed_over" ? "#7C3AED" : "#64748B",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Handed Over to Discipleship ✦ ({handedOverCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            style={{
              padding: "7px 14px",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: filterTab === "all" ? "#141C6E" : "#D5DCF2",
              backgroundColor: filterTab === "all" ? "#F1F5F9" : "#FFFFFF",
              color: filterTab === "all" ? "#141C6E" : "#64748B",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            All Contacts ({visitors.length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search first-timers by name, phone, or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "9px 14px",
            borderRadius: "8px",
            border: "1px solid #D5DCF2",
            fontSize: "13px",
            color: "#141C6E",
            outline: "none",
          }}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            style={{
              padding: "8px 12px",
              backgroundColor: "#F1F5F9",
              border: "none",
              borderRadius: "6px",
              color: "#64748B",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Success/Status Alert */}
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

      {/* Visitor Cards Grid */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
          Loading first-timers &amp; follow-up pipeline...
        </div>
      ) : filteredVisitors.length === 0 ? (
        <div
          style={{
            padding: "36px 16px",
            textAlign: "center",
            color: "#64748B",
            backgroundColor: "#F8FAFD",
            borderRadius: "12px",
            border: "1px dashed #D5DCF2",
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>🌱</div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#141C6E" }}>
            {filterTab === "active"
              ? "No active first-timers currently in Follow-Up."
              : filterTab === "handed_over"
              ? "No contacts handed over to Discipleship yet."
              : "No visitor contacts found."}
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            {filterTab === "active"
              ? "When new visitors or converts register on Sundays, pastors assign them here for follow-up."
              : "When a person completes orientation in follow-up, click Handover to transition them."}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {filteredVisitors.map((v) => {
            const isHandedOver = v.status === "handed_over_to_discipleship";
            const isProcessing = actionInProgress === v.id;
            const cleanPhone = (v.phone || "").replace(/[^0-9]/g, "");
            const waPhone = cleanPhone.startsWith("0") && cleanPhone.length === 11
              ? "234" + cleanPhone.substring(1)
              : cleanPhone;

            const waText = encodeURIComponent(
              `Grace and peace ${v.name}! This is ${currentUser.displayName?.split(" ")[0] || "the team"} from The Publishers House Follow-Up team. We were so blessed to have you in church and wanted to check in on how your week is going!`
            );

            return (
              <div
                key={v.id}
                style={{
                  backgroundColor: isHandedOver ? "#FAF5FF" : "#FAFBFE",
                  border: isHandedOver ? "1px solid #DDD6FE" : "1px solid #E8EDFB",
                  borderRadius: "12px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  position: "relative",
                  boxShadow: "0 1px 3px rgba(14,21,86,0.03)",
                }}
              >
                {/* Top Row: Name + Status Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#141C6E" }}>
                      {v.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                      First Visited: {v.firstVisitDate || "Recent"} · {v.campus || "Jos"}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      backgroundColor: isHandedOver ? "#7C3AED" : "#DBEAFE",
                      color: isHandedOver ? "#FFFFFF" : "#1E40AF",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isHandedOver ? "In Discipleship ✦" : "In Follow-Up"}
                  </span>
                </div>

                {/* Contact Links */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  {v.phone && (
                    <a
                      href={`tel:${v.phone}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "5px 10px",
                        backgroundColor: "#FFFFFF",
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
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
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
                      💬 WhatsApp
                    </a>
                  )}

                  {v.email && (
                    <span style={{ fontSize: "11px", color: "#64748B" }}>
                      ✉️ {v.email}
                    </span>
                  )}
                </div>

                {/* Handover Details if already handed over */}
                {isHandedOver && (
                  <div
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#F3E8FF",
                      borderRadius: "8px",
                      border: "1px solid #E9D5FF",
                      fontSize: "11.5px",
                      color: "#6B21A8",
                    }}
                  >
                    <strong>✦ Handed Over to Discipleship</strong>
                    <div style={{ fontSize: "11px", color: "#7E22CE", marginTop: "2px" }}>
                      Transferred by {v.handoverBy || "Follow-Up Team"} on{" "}
                      {v.handoverDate ? new Date(v.handoverDate).toLocaleDateString() : "Recent"}
                    </div>
                  </div>
                )}

                {/* Notes History */}
                {v.notes && (
                  <div
                    style={{
                      padding: "8px 10px",
                      backgroundColor: "#FFFFFF",
                      borderRadius: "8px",
                      border: "1px solid #E8EDFB",
                      fontSize: "11.5px",
                      color: "#4A5490",
                      lineHeight: "16px",
                      whiteSpace: "pre-wrap",
                      maxHeight: "100px",
                      overflowY: "auto",
                    }}
                  >
                    {v.notes}
                  </div>
                )}

                {/* Add Note Section */}
                {activeNoteVisitorId === v.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <textarea
                      rows={2}
                      placeholder="Log conversation outcome or prayer points..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "1px solid #2090FF",
                        fontSize: "12px",
                        outline: "none",
                      }}
                    />
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveNoteVisitorId(null);
                          setNewNoteText("");
                        }}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#F1F5F9",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAddNote(v)}
                        style={{
                          padding: "4px 12px",
                          backgroundColor: "#1F46C8",
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
                      setActiveNoteVisitorId(v.id);
                      setNewNoteText("");
                    }}
                    style={{
                      alignSelf: "flex-start",
                      background: "none",
                      border: "none",
                      color: "#1F46C8",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    + Add Follow-Up Note
                  </button>
                )}

                {/* Primary Action Button: HANDOVER TO DISCIPLESHIP */}
                {!isHandedOver && (
                  <div style={{ marginTop: "4px", paddingTop: "10px", borderTop: "1px solid #E8EDFB" }}>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleHandover(v)}
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        backgroundColor: "#7C3AED",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                        cursor: isProcessing ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>✦ Handover to Discipleship Unit</span>
                      <span style={{ fontSize: "10px", opacity: 0.8 }}>→</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
