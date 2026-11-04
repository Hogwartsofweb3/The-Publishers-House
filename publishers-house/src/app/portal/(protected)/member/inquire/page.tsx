"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePortal } from "@/lib/portalContext";

const MINISTRY_UNITS = [
  { id: "editorial", name: "Editorial Unit", desc: "Writing, publications, doctrinal transcriptions, proofreading" },
  { id: "media_technical", name: "Media & Technical Unit", desc: "Sound engineering, video broadcast, lighting, photography, creative media" },
  { id: "sanctuary_protocol", name: "Sanctuary & Protocol Unit", desc: "Hospitality, ushering, service order, guest coordination" },
  { id: "welfare", name: "Welfare & Follow-Up Unit", desc: "Compassion ministry, hospitality, visitation, benevolence" },
  { id: "worship", name: "Worship & Choir Unit", desc: "Vocalists, instrumentalists, music ministry" },
  { id: "children_teens", name: "Children & Teens Ministry", desc: "Kids church, discipleship, adolescent mentorship" },
];

export default function MemberInquirePage() {
  const { effectiveUser } = usePortal();

  const [category, setCategory] = useState("Join a Ministry Unit");
  const [targetUnit, setTargetUnit] = useState("editorial");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [preferredContact, setPreferredContact] = useState("WhatsApp");
  const [phone, setPhone] = useState(effectiveUser?.phone || "");
  const [email, setEmail] = useState(effectiveUser?.email || "");
  const [name, setName] = useState(effectiveUser?.displayName || "");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [myInquiries, setMyInquiries] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Sync default user data
  useEffect(() => {
    if (effectiveUser) {
      if (!name && effectiveUser.displayName) setName(effectiveUser.displayName);
      if (!email && effectiveUser.email) setEmail(effectiveUser.email);
      if (!phone && effectiveUser.phone) setPhone(effectiveUser.phone);
    }
  }, [effectiveUser]);

  // Load existing inquiries for this member
  const loadMyInquiries = async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/portal/inquiries");
      if (res.ok) {
        const data = await res.json();
        if (data.inquiries && Array.isArray(data.inquiries)) {
          setMyInquiries(data.inquiries);
        }
      }
    } catch (err) {
      console.warn("Could not load member inquiries:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadMyInquiries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Please describe your inquiry or why you are interested in serving.");
      return;
    }

    setSubmitting(true);
    try {
      const unitObj = MINISTRY_UNITS.find((u) => u.id === targetUnit);
      const computedSubject =
        subject.trim() ||
        (category === "Join a Ministry Unit"
          ? `Interest in joining ${unitObj ? unitObj.name : targetUnit}`
          : category);

      const res = await fetch("/api/portal/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          targetUnit: category === "Join a Ministry Unit" ? (unitObj?.name || targetUnit) : "General Pastoral",
          subject: computedSubject,
          message: message.trim(),
          preferredContact,
          phone: phone.trim(),
          email: email.trim(),
          name: name.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setSuccess(true);
      setMessage("");
      setSubject("");
      loadMyInquiries();
    } catch (err: any) {
      setError(err.message || "Failed to submit inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "10px 0 40px" }}>
      {/* Breadcrumb / Back Link */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          href="/portal/member"
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#1F46C8",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ← Back to Member Dashboard
        </Link>
      </div>

      {/* Header Banner */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D5DCF2",
          borderRadius: "14px",
          padding: "28px 32px",
          marginBottom: "28px",
          boxShadow: "0 2px 10px rgba(14,21,86,0.03)",
        }}
      >
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>
          Ministry Service &amp; Pastoral Connection
        </div>
        <h1
          style={{
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontSize: "26px",
            fontWeight: 800,
            color: "#0E1556",
            margin: "0 0 8px",
            letterSpacing: "-0.015em",
          }}
        >
          Inquire with the Pastorate
        </h1>
        <p style={{ fontSize: "14px", color: "#64748B", margin: 0, lineHeight: 1.6, maxWidth: "680px" }}>
          Every believer in the Company of the Great is commissioned to publish the Word of God. Express your interest in joining a ministry service unit, request pastoral spiritual guidance, or submit a confidential inquiry directly to the pastoral leadership.
        </p>
      </div>

      {/* Success Notification */}
      {success && (
        <div
          style={{
            backgroundColor: "#ECFDF5",
            border: "1px solid #6EE7B7",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#065F46", marginBottom: "4px" }}>
              ✓ Inquiry Received by the Pastorate
            </div>
            <p style={{ fontSize: "12.5px", color: "#047857", margin: 0, lineHeight: 1.5 }}>
              Your inquiry has been logged and sent to the Pastoral &amp; Leadership team. A pastor will review your submission and contact you via {preferredContact}.
            </p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            style={{
              background: "none",
              border: "none",
              color: "#047857",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Inquiry Form Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D5DCF2",
          borderRadius: "14px",
          padding: "28px 32px",
          boxShadow: "0 2px 10px rgba(14,21,86,0.03)",
          marginBottom: "36px",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {error && (
            <div
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: "8px",
                padding: "12px 16px",
                fontSize: "12.5px",
                color: "#991B1B",
              }}
            >
              {error}
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Inquiry Purpose *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
              {[
                { key: "Join a Ministry Unit", title: "Join a Service Unit", desc: "Serve in Media, Editorial, Sanctuary, etc." },
                { key: "Pastoral Counseling", title: "Pastoral Counseling", desc: "Spiritual guidance & prayer appointment" },
                { key: "Doctrinal Question", title: "Doctrinal Question", desc: "Scripture clarification & teachings" },
                { key: "General Inquiry", title: "General Inquiry", desc: "Community, welfare, or other inquiry" },
              ].map((cat) => {
                const selected = category === cat.key;
                return (
                  <div
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    style={{
                      border: selected ? "2px solid #1F46C8" : "1px solid #D5DCF2",
                      backgroundColor: selected ? "#EEF2FB" : "#FFFFFF",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 700, color: selected ? "#1F46C8" : "#0E1556", marginBottom: "3px" }}>
                      {cat.title}
                    </div>
                    <div style={{ fontSize: "11px", color: selected ? "#4A5490" : "#64748B", lineHeight: 1.4 }}>
                      {cat.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unit Selector (if Join a Ministry Unit) */}
          {category === "Join a Ministry Unit" && (
            <div>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                Select Preferred Service Unit *
              </label>
              <select
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid #D5DCF2",
                  fontSize: "13.5px",
                  color: "#0E1556",
                  backgroundColor: "#F8FAFD",
                  outline: "none",
                }}
              >
                {MINISTRY_UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.desc}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject */}
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Subject / Topic (Optional)
            </label>
            <input
              type="text"
              placeholder={category === "Join a Ministry Unit" ? "e.g. Passion for sound engineering & media broadcast" : "e.g. Spiritual inquiry regarding water baptism"}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "8px",
                border: "1px solid #D5DCF2",
                fontSize: "13.5px",
                color: "#0E1556",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {/* Message Area */}
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#141C6E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Message / Inquiry Details *
            </label>
            <textarea
              required
              rows={4}
              placeholder={
                category === "Join a Ministry Unit"
                  ? "Tell us briefly about your spiritual background, any relevant skills, or why you feel drawn to serve in this unit..."
                  : "Please share what is on your heart. Your message will be treated with confidentiality by our pastoral team..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #D5DCF2",
                fontSize: "13.5px",
                color: "#0E1556",
                boxSizing: "border-box",
                fontFamily: "inherit",
                lineHeight: 1.6,
                outline: "none",
              }}
            />
          </div>

          {/* Contact Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#747CA1", textTransform: "uppercase", marginBottom: "6px" }}>
                Your Phone / WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0818 000 0000"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #D5DCF2",
                  fontSize: "13px",
                  color: "#0E1556",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#747CA1", textTransform: "uppercase", marginBottom: "6px" }}>
                Preferred Follow-Up Channel
              </label>
              <select
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #D5DCF2",
                  fontSize: "13px",
                  color: "#0E1556",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <option value="WhatsApp">WhatsApp Message</option>
                <option value="Phone Call">Direct Phone Call</option>
                <option value="Email">Email Communication</option>
                <option value="In-Person">In-Person After Service</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ paddingTop: "10px" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "14px 28px",
                backgroundColor: submitting ? "#93C5FD" : "#0140C1",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(1,64,193,0.25)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {submitting ? "Sending to Pastorate..." : "Submit Inquiry to Pastorate →"}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Inquiries Submitted by this Member */}
      <div>
        <h3
          style={{
            fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            fontSize: "16px",
            fontWeight: 700,
            color: "#0E1556",
            marginBottom: "14px",
          }}
        >
          My Inquiries History
        </h3>

        {loadingList ? (
          <div style={{ padding: "20px", color: "#64748B", fontSize: "13px" }}>Loading your inquiries...</div>
        ) : myInquiries.length === 0 ? (
          <div
            style={{
              padding: "24px",
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              border: "1px dashed #CBD5E1",
              textAlign: "center",
              color: "#64748B",
              fontSize: "13px",
            }}
          >
            You have not submitted any inquiries yet. When you submit one above, its status and pastoral response will appear here.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {myInquiries.map((inq) => {
              const isPending = inq.status === "pending";
              const isContacted = inq.status === "contacted";
              const dateStr = inq.createdAt ? new Date(inq.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

              return (
                <div
                  key={inq.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #D5DCF2",
                    borderRadius: "10px",
                    padding: "18px 20px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#EEF2FB",
                          color: "#1F46C8",
                          marginRight: "8px",
                        }}
                      >
                        {inq.category}
                      </span>
                      <strong style={{ fontSize: "14px", color: "#0E1556" }}>{inq.subject}</strong>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "12px",
                          backgroundColor: isPending ? "#FEF3C7" : isContacted ? "#EFF6FF" : "#ECFDF5",
                          color: isPending ? "#92400E" : isContacted ? "#1E40AF" : "#065F46",
                        }}
                      >
                        {isPending ? "⏳ Awaiting Review" : isContacted ? "📞 Pastor Follow-Up" : "✓ Completed"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#94A3B8" }}>{dateStr}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: "13px", color: "#475569", margin: "6px 0 0", lineHeight: 1.55 }}>
                    {inq.message}
                  </p>

                  {inq.pastoralNotes && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "10px 14px",
                        backgroundColor: "#F8FAFC",
                        borderLeft: "3px solid #1F46C8",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#334155",
                      }}
                    >
                      <strong>Pastoral Note:</strong> {inq.pastoralNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
