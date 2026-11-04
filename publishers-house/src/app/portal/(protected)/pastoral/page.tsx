"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

type VisitorStatus = "new" | "followup" | "established";

interface Visitor {
  id: string;
  name: string;
  phone: string;
  firstVisitDate: string;
  assignedTo: string;
  notes: string;
  status: VisitorStatus;
  createdAt: string;
}

const COLUMNS: {
  key: VisitorStatus;
  label: string;
  badgeBg: string;
  badgeColor: string;
  desc: string;
}[] = [
  {
    key: "new",
    label: "First-Time Visitors",
    badgeBg: "#FFF2D6",
    badgeColor: "#7A5200",
    desc: "Awaiting initial welcome call and hospitality connection",
  },
  {
    key: "followup",
    label: "In Shepherding Follow-Up",
    badgeBg: "#E8EDFB",
    badgeColor: "#1F46C8",
    desc: "Contacted, praying together, and invited to discipleship",
  },
  {
    key: "established",
    label: "Established & Integrated",
    badgeBg: "#E4F5EA",
    badgeColor: "#0F6B38",
    desc: "Committed members, rostered in church units or cell groups",
  },
];

export default function PastoralCarePage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [notesEdit, setNotesEdit] = useState("");
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"pipeline" | "inquiries">("pipeline");
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [inquiryNotes, setInquiryNotes] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("all");
  const [inquirySearch, setInquirySearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    firstVisitDate: new Date().toISOString().split("T")[0],
    assignedTo: "Pastoral Team",
    notes: "",
  });

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/visitors");
      if (res.ok) {
        const data = await res.json();
        if (data.visitors && Array.isArray(data.visitors)) {
          setVisitors(data.visitors);
          return;
        }
      }
      setVisitors([]);
    } catch (err) {
      console.warn("Could not load visitors:", err);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const res = await fetch("/api/portal/inquiries");
      if (res.ok) {
        const data = await res.json();
        if (data.inquiries && Array.isArray(data.inquiries)) {
          setInquiries(data.inquiries);
        }
      }
    } catch (err) {
      console.warn("Could not load inquiries:", err);
    } finally {
      setInquiriesLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
    fetchInquiries();
    if (typeof window !== "undefined" && window.location.search.includes("tab=inquiries")) {
      setActiveTab("inquiries");
    }
  }, []);

  const handleUpdateInquiryStatus = async (id: string, status: string, notes?: string) => {
    try {
      await fetch("/api/portal/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, pastoralNotes: notes }),
      });
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === id ? { ...inq, status, ...(notes !== undefined ? { pastoralNotes: notes } : {}) } : inq
        )
      );
      setMsg(`Inquiry marked as ${status} ✓`);
      setTimeout(() => setMsg(""), 3000);
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    } catch (err) {
      alert("Failed to update inquiry status");
    }
  };

  const handleAdvance = async (visitor: Visitor) => {
    const nextStatus: VisitorStatus =
      visitor.status === "new" ? "followup" : "established";

    try {
      await fetch("/api/portal/visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: visitor.id, status: nextStatus }),
      });
    } catch {}

    setVisitors((prev) =>
      prev.map((v) => (v.id === visitor.id ? { ...v, status: nextStatus } : v))
    );
    setMsg(`${visitor.name} moved to ${nextStatus === "followup" ? "In Follow-up" : "Established"} ✓`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleSaveNotes = async () => {
    if (!selectedVisitor) return;
    try {
      await fetch("/api/portal/visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedVisitor.id, notes: notesEdit }),
      });
    } catch {}
    setVisitors((prev) =>
      prev.map((v) => (v.id === selectedVisitor.id ? { ...v, notes: notesEdit } : v))
    );
    setSelectedVisitor(null);
    setMsg("Shepherding notes updated ✓");
    setTimeout(() => setMsg(""), 3000);
  };

  const handleAddVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    try {
      const res = await fetch("/api/portal/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.visitor) {
        setVisitors((prev) => [data.visitor, ...prev]);
      } else {
        const fallbackId = `vis-${Date.now()}`;
        const newVisitor: Visitor = {
          id: fallbackId,
          name: form.name,
          phone: form.phone,
          firstVisitDate: form.firstVisitDate,
          assignedTo: form.assignedTo || "Pastoral Team",
          notes: form.notes,
          status: "new",
          createdAt: new Date().toISOString(),
        };
        setVisitors((prev) => [newVisitor, ...prev]);
      }
    } catch {
      const fallbackId = `vis-${Date.now()}`;
      const newVisitor: Visitor = {
        id: fallbackId,
        name: form.name,
        phone: form.phone,
        firstVisitDate: form.firstVisitDate,
        assignedTo: form.assignedTo || "Pastoral Team",
        notes: form.notes,
        status: "new",
        createdAt: new Date().toISOString(),
      };
      setVisitors((prev) => [newVisitor, ...prev]);
    }

    setShowAddModal(false);
    setForm({
      name: "",
      phone: "",
      firstVisitDate: new Date().toISOString().split("T")[0],
      assignedTo: "Pastoral Team",
      notes: "",
    });
    setMsg("First-time visitor registered ✓");
    setTimeout(() => setMsg(""), 3500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 800,
              fontSize: "28px",
              lineHeight: "34px",
              color: "#141C6E",
              margin: 0,
            }}
          >
            Pastoral Care & Shepherding
          </h1>
          <p
            style={{
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 500,
              fontSize: "13px",
              color: "#4A5490",
              margin: "6px 0 0",
            }}
          >
            Visitor assimilation pipeline · First-timers to integrated kingdom disciples
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && (
            <span
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                fontWeight: 600,
                color: "#0F6B38",
                backgroundColor: "#E4F5EA",
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            >
              {msg}
            </span>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: "#1F46C8",
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "13px",
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
            }}
          >
            + Add First-Time Visitor
          </button>
        </div>
      </div>

      {/* 3-Column Kanban Board (Rendered only on Visitor Pipeline tab) */}
      {activeTab === "pipeline" ? (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {COLUMNS.map((col) => {
          const colVisitors = visitors.filter((v) => v.status === col.key);
          return (
            <div
              key={col.key}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D5DCF2",
                borderRadius: "14px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                minHeight: "560px",
              }}
            >
              {/* Column Header */}
              <div style={{ borderBottom: "1px solid #E8EDFB", paddingBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#141C6E",
                      margin: 0,
                    }}
                  >
                    {col.label}
                  </h2>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "99px",
                      backgroundColor: col.badgeBg,
                      color: col.badgeColor,
                      fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    {colVisitors.length}
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490", margin: "4px 0 0" }}>
                  {col.desc}
                </p>
              </div>

              {/* Cards List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                {loading && (
                  <div style={{ padding: "30px", textAlign: "center", color: "#747CA1", fontSize: "12px" }}>
                    Loading pastoral records...
                  </div>
                )}
                {!loading && colVisitors.length === 0 && (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: "#747CA1", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12.5px" }}>
                    No contacts currently in this stage.
                  </div>
                )}
                {colVisitors.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      backgroundColor: "#F8FAFD",
                      border: "1px solid #E8EDFB",
                      borderRadius: "10px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      boxShadow: "0 1px 2px rgba(14, 21, 86, 0.04)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#141C6E",
                          }}
                        >
                          {v.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "11.5px",
                            color: "#4A5490",
                            marginTop: "2px",
                          }}
                        >
                          Vis: {v.firstVisitDate}
                        </div>
                      </div>

                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#E8EDFB",
                          color: "#1F46C8",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "10px",
                          fontWeight: 700,
                        }}
                      >
                        {v.assignedTo}
                      </span>
                    </div>

                    {/* Phone & Direct Links */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <a
                        href={`tel:${v.phone}`}
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#1F46C8",
                          textDecoration: "none",
                        }}
                      >
                        📞 {v.phone}
                      </a>
                      <a
                        href={`https://wa.me/${v.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#0F6B38",
                          textDecoration: "none",
                        }}
                      >
                        💬 WhatsApp
                      </a>
                    </div>

                    {/* Notes Snippet */}
                    {v.notes && (
                      <div
                        onClick={() => {
                          setSelectedVisitor(v);
                          setNotesEdit(v.notes);
                        }}
                        title="Click to edit notes"
                        style={{
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11.5px",
                          color: "#4A5490",
                          backgroundColor: "#FFFFFF",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E8EDFB",
                          cursor: "pointer",
                          lineHeight: "16px",
                        }}
                      >
                        &ldquo;{v.notes}&rdquo;
                      </div>
                    )}

                    {/* Card Actions */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <button
                        onClick={() => {
                          setSelectedVisitor(v);
                          setNotesEdit(v.notes);
                        }}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #D5DCF2",
                          borderRadius: "6px",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#141C6E",
                          cursor: "pointer",
                        }}
                      >
                        Notes
                      </button>

                      {col.key !== "established" && (
                        <button
                          onClick={() => handleAdvance(v)}
                          style={{
                            flex: 1.2,
                            padding: "6px 10px",
                            backgroundColor: col.key === "new" ? "#1F46C8" : "#0F6B38",
                            border: "none",
                            borderRadius: "6px",
                            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#FFFFFF",
                            cursor: "pointer",
                          }}
                        >
                          {col.key === "new" ? "To Follow-Up →" : "Establish ✓"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      ) : (
        /* Member Inquiries & Unit Applications View */
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D5DCF2", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 10px rgba(14,21,86,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search member, unit, or phone..."
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", minWidth: "260px" }}
              />
              <select
                value={inquiryStatusFilter}
                onChange={(e) => setInquiryStatusFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", color: "#141C6E" }}
              >
                <option value="all">All Inquiries</option>
                <option value="pending">⏳ Pending Review</option>
                <option value="contacted">📞 Contacted</option>
                <option value="resolved">✓ Resolved</option>
              </select>
            </div>
            <button
              onClick={fetchInquiries}
              style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#F4F6FB", color: "#141C6E", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" }}
            >
              ↻ Refresh
            </button>
          </div>

          {inquiriesLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>Loading member inquiries...</div>
          ) : inquiries.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748B" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📬</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#141C6E" }}>No Pastoral Inquiries Yet</div>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>When members inquire with the pastorate or apply to join service units, they appear here.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {inquiries
                .filter((inq) => {
                  if (inquiryStatusFilter !== "all" && inq.status !== inquiryStatusFilter) return false;
                  if (inquirySearch.trim()) {
                    const q = inquirySearch.toLowerCase();
                    return (
                      inq.memberName?.toLowerCase().includes(q) ||
                      inq.memberEmail?.toLowerCase().includes(q) ||
                      inq.memberPhone?.includes(q) ||
                      inq.targetUnit?.toLowerCase().includes(q) ||
                      inq.subject?.toLowerCase().includes(q)
                    );
                  }
                  return true;
                })
                .map((inq) => {
                  const isPending = inq.status === "pending";
                  const isContacted = inq.status === "contacted";
                  const dateStr = inq.createdAt ? new Date(inq.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

                  return (
                    <div
                      key={inq.id}
                      style={{
                        border: isPending ? "2px solid #F59E0B" : "1px solid #D5DCF2",
                        borderRadius: "10px",
                        padding: "20px",
                        backgroundColor: isPending ? "#FFFDF7" : "#FFFFFF",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px", backgroundColor: "#EEF2FB", color: "#1F46C8", marginRight: "8px" }}>
                            {inq.category}
                          </span>
                          {inq.targetUnit && (
                            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px", backgroundColor: "#FEF3C7", color: "#92400E", marginRight: "8px" }}>
                              Unit: {inq.targetUnit}
                            </span>
                          )}
                          <strong style={{ fontSize: "15px", color: "#0E1556" }}>{inq.subject}</strong>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: "12px",
                              backgroundColor: isPending ? "#FEF3C7" : isContacted ? "#EFF6FF" : "#ECFDF5",
                              color: isPending ? "#92400E" : isContacted ? "#1E40AF" : "#065F46",
                            }}
                          >
                            {isPending ? "⏳ Pending Review" : isContacted ? "📞 In Follow-Up" : "✓ Resolved"}
                          </span>
                          <span style={{ fontSize: "11px", color: "#94A3B8" }}>{dateStr}</span>
                        </div>
                      </div>

                      {/* Member Info Strip */}
                      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#4A5490", flexWrap: "wrap", backgroundColor: "#F8FAFD", padding: "8px 12px", borderRadius: "6px" }}>
                        <div><strong>Member:</strong> {inq.memberName}</div>
                        {inq.memberEmail && <div><strong>Email:</strong> {inq.memberEmail}</div>}
                        {inq.memberPhone && <div><strong>Phone / WhatsApp:</strong> {inq.memberPhone}</div>}
                        <div><strong>Preferred Channel:</strong> {inq.preferredContact || "WhatsApp"}</div>
                        <div><strong>Campus:</strong> {inq.campus || "jos"}</div>
                      </div>

                      <p style={{ fontSize: "13.5px", color: "#334155", margin: "4px 0", lineHeight: 1.6 }}>
                        {inq.message}
                      </p>

                      {inq.pastoralNotes && (
                        <div style={{ backgroundColor: "#F1F5F9", padding: "10px 14px", borderRadius: "6px", fontSize: "12.5px", color: "#1E293B", borderLeft: "3px solid #1F46C8" }}>
                          <strong>Pastoral Note:</strong> {inq.pastoralNotes}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div style={{ display: "flex", gap: "10px", marginTop: "6px", flexWrap: "wrap" }}>
                        {isPending && (
                          <button
                            onClick={() => handleUpdateInquiryStatus(inq.id, "contacted")}
                            style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #BFDBFE", backgroundColor: "#EFF6FF", color: "#1D4ED8", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                          >
                            📞 Mark as Contacted
                          </button>
                        )}
                        {inq.status !== "resolved" && (
                          <button
                            onClick={() => handleUpdateInquiryStatus(inq.id, "resolved")}
                            style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #BBF7D0", backgroundColor: "#F0FDF4", color: "#15803D", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                          >
                            ✓ Mark as Resolved
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setInquiryNotes(inq.pastoralNotes || "");
                          }}
                          style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", color: "#141C6E", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                        >
                          ✎ Add / Edit Note
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Pastoral Note Edit Modal */}
      {selectedInquiry && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(14,21,86,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", padding: "28px", maxWidth: "520px", width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 800, color: "#141C6E" }}>Pastoral Note for {selectedInquiry.memberName}</h3>
            <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#64748B" }}>Record your conversation notes, spiritual counseling summary, or next action steps.</p>
            <textarea
              rows={4}
              value={inquiryNotes}
              onChange={(e) => setInquiryNotes(e.target.value)}
              placeholder="e.g. Spoke with brother Michael on WhatsApp. He has 3 years of audio mixing experience. Assigned to Media Head for orientation..."
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontSize: "13px", boxSizing: "border-box", fontFamily: "inherit" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button
                onClick={() => setSelectedInquiry(null)}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", color: "#64748B", fontSize: "13px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, selectedInquiry.status, inquiryNotes)}
                style={{ padding: "8px 18px", borderRadius: "8px", border: "none", backgroundColor: "#1F46C8", color: "#FFFFFF", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {selectedVisitor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.15)",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "18px", color: "#141C6E", margin: "0 0 6px" }}>
              Shepherding Notes for {selectedVisitor.name}
            </h2>
            <p style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#4A5490", margin: "0 0 20px" }}>
              Update prayer points, call outcomes, or ministry unit interests
            </p>

            <textarea
              rows={5}
              value={notesEdit}
              onChange={(e) => setNotesEdit(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none", resize: "vertical" }}
            />

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                onClick={handleSaveNotes}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#1F46C8",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 600,
                  fontSize: "12.5px",
                  cursor: "pointer",
                }}
              >
                Save Notes
              </button>
              <button
                onClick={() => setSelectedVisitor(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D5DCF2",
                  color: "#4A5490",
                  borderRadius: "8px",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontWeight: 600,
                  fontSize: "12.5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Visitor Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.15)",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "20px", color: "#141C6E", margin: "0 0 6px" }}>
              Register First-Time Visitor
            </h2>
            <p style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#4A5490", margin: "0 0 24px" }}>
              Capture guest slip info from Sunday or Midweek service
            </p>

            <form onSubmit={handleAddVisitor} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tobiloba Alabi"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>First Visit Date</label>
                  <input
                    type="date"
                    required
                    value={form.firstVisitDate}
                    onChange={(e) => setForm({ ...form, firstVisitDate: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Assigned Pastor / Follow-Up Minister</label>
                <input
                  type="text"
                  placeholder="e.g. Pastor Damilare, Sister Ibidun"
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Initial Notes / How they heard about TPH</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Invited by neighbour; interested in Choir; requested prayer for relocation."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "10px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Save Visitor
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D5DCF2",
                    color: "#4A5490",
                    borderRadius: "10px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
