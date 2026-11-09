"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePortal } from "@/lib/portalContext";
import { UNITS, PortalUser } from "@/lib/portalAuth";
import { getPortalUser } from "@/lib/portalAuth";

interface UnitMemberInfo {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  isUnitHead?: boolean;
}

const UNIT_DESCRIPTIONS: Record<string, string> = {
  media_technical: "Sound engineering, video broadcast, lighting, photography, and creative media publishing.",
  worship: "Vocalists, instrumentalists, and prophetic worship ministry.",
  editorial: "Publications, doctrinal transcriptions, writing, proofreading, and literature distribution.",
  welfare: "Compassion ministry, hospitality, visitation, and benevolence across the assembly.",
  sanctuary: "Sanctuary order, cleanliness, stage preparation, and sacred environment care.",
  ushering: "Guest reception, seating management, offering coordination, and service flow.",
  protocol: "Pastoral care assistance, dignitary reception, event coordination, and logistics.",
  children: "Kids church, biblical foundation, and discipleship for the next generation.",
  secretariat: "Administrative documentation, records, church registry, and communications.",
  transportation: "Assembly logistics, convoy coordination, and bus transportation service.",
  prayer: "Intercessory altar, vigil preparations, and prayer coverage for church meetings.",
  followup_hospitality: "First-timer integration, new converts follow-up, and fellowship hospitality.",
};

export default function MemberUnitInfoPage() {
  const { effectiveUser } = usePortal();
  const [unitMembers, setUnitMembers] = useState<UnitMemberInfo[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [unitHead, setUnitHead] = useState<{ name: string; email?: string; phone?: string } | null>(null);

  const assignedUnitId = effectiveUser?.assignedUnitId?.toLowerCase() || "";
  const unit = UNITS.find((u) => u.id === assignedUnitId);

  useEffect(() => {
    if (!assignedUnitId) {
      setLoadingMembers(false);
      return;
    }

    const fetchUnitTeam = async () => {
      try {
        const res = await fetch(`/api/portal/members?unitId=${encodeURIComponent(assignedUnitId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.members && Array.isArray(data.members)) {
            setUnitMembers(data.members);
            const head = data.members.find((m: any) => m.role === "unit_head" || m.isUnitHead);
            if (head) {
              setUnitHead({
                name: head.displayName || "Unit Head",
                email: head.email,
                phone: head.phone,
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not load unit team members:", err);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchUnitTeam();
  }, [assignedUnitId]);

  if (!unit) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
        <div>
          <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
            Ministry Service &amp; Fellowship
          </div>
          <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 32px)", color: "#141C6E", margin: 0 }}>
            My Ministry Unit
          </h1>
          <p style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontStyle: "italic", fontSize: "14.5px", color: "#4A5490", marginTop: "6px" }}>
            Every believer is called to be a living publication of the Gospel, deploying their spiritual gifts to serve the body of Christ.
          </p>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "36px", textAlign: "center", boxShadow: "0 2px 8px rgba(20,28,110,0.04)" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🏛️</div>
          <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "20px", fontWeight: 700, color: "#141C6E", margin: "0 0 10px" }}>
            You Are Not Yet Assigned to a Service Unit
          </h2>
          <p style={{ fontSize: "13.5px", color: "#64748B", maxWidth: "560px", margin: "0 auto 24px", lineHeight: "1.6em" }}>
            Serving in a church unit is one of the best ways to grow spiritually, build deep fellowship, and deploy your grace for Kingdom impact.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/portal/member/inquire?category=Join%20a%20Ministry%20Unit"
              style={{
                padding: "10px 22px",
                backgroundColor: "#1F46C8",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Inquire with Pastorate to Join a Unit →
            </Link>
            <Link
              href="/portal/member"
              style={{
                padding: "10px 20px",
                backgroundColor: "#F4F6FB",
                color: "#141C6E",
                border: "1px solid #D5DCF2",
                borderRadius: "8px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
          Active Church Unit · Jos &amp; Abuja Campuses
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 32px)", color: "#141C6E", margin: 0 }}>
              {unit.name}
            </h1>
            <p style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontStyle: "italic", fontSize: "14.5px", color: "#4A5490", marginTop: "6px" }}>
              {UNIT_DESCRIPTIONS[unit.id] || "Coordinated under church pastoral administration."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              href="/portal/unit/roster"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 16px",
                backgroundColor: "#1F46C8",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12.5px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              View Duty Roster →
            </Link>
            <Link
              href="/portal/unit/swaps"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 16px",
                backgroundColor: "#EEF4FF",
                color: "#1F46C8",
                border: "1px solid #C4D7FE",
                borderRadius: "8px",
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12.5px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Request Duty Swap
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        
        {/* Unit Leadership Card */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "24px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
          <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.14em" }}>
            Unit Leadership
          </div>
          <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 700, color: "#141C6E", margin: "4px 0 16px" }}>
            {unitHead ? unitHead.name : "Unit Head"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4A5490" }}>
              <span style={{ fontSize: "15px" }}>📧</span>
              <span>{unitHead?.email || "unithead@thepublishershouse.org"}</span>
            </div>
            {unitHead?.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4A5490" }}>
                <span style={{ fontSize: "15px" }}>📞</span>
                <span>{unitHead.phone}</span>
              </div>
            )}
            <div style={{ padding: "10px 14px", backgroundColor: "#F8FAFD", borderRadius: "8px", border: "1px solid #E4ECF9", marginTop: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Leadership Channel</div>
              <p style={{ fontSize: "12px", color: "#4A5490", margin: "4px 0 0", lineHeight: "1.5em" }}>
                Reach out to your unit head for duty scheduling, briefings, or unit-specific orientation.
              </p>
            </div>
          </div>
        </div>

        {/* Meeting & Rehearsal Schedule */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "24px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
          <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.14em" }}>
            Assembly &amp; Roster
          </div>
          <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 700, color: "#141C6E", margin: "4px 0 16px" }}>
            Weekly Meeting Schedule
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div style={{ padding: "12px", backgroundColor: "#EFF6FF", borderRadius: "8px", border: "1px solid #BFDBFE" }}>
              <div style={{ fontWeight: 700, color: "#1D4ED8" }}>Sunday Service Duty Briefing</div>
              <div style={{ fontSize: "12px", color: "#4B5563", marginTop: "2px" }}>
                Sundays · 8:15 AM WAT (Prompt before 9:00 AM Celebration)
              </div>
            </div>
            <div style={{ padding: "12px", backgroundColor: "#F8FAFD", borderRadius: "8px", border: "1px solid #E4ECF9" }}>
              <div style={{ fontWeight: 700, color: "#141C6E" }}>Midweek Preparation &amp; Setup</div>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                Thursdays · 4:00 PM WAT (Prior to 4:30 PM Doctrine &amp; Prayer)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Roster & Fellowship Obligations */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 700, color: "#141C6E", margin: 0 }}>
              Fellow Unit Servants &amp; Volunteers
            </h2>
            <p style={{ fontSize: "12.5px", color: "#747CA1", margin: "4px 0 0" }}>
              Active believers deployed in {unit.name} across the assembly.
            </p>
          </div>
          <Link
            href="/portal/member/inquire?category=Pastoral%20Counseling"
            style={{
              fontSize: "12px",
              color: "#1F46C8",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Need Pastoral Guidance? Contact Pastorate →
          </Link>
        </div>

        {loadingMembers ? (
          <p style={{ fontSize: "13px", color: "#747CA1" }}>Loading unit members...</p>
        ) : unitMembers.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
            {unitMembers.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #E4ECF9",
                  backgroundColor: "#F8FAFD",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: m.isUnitHead ? "#0E1556" : "#1F46C8",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "13px",
                    flexShrink: 0,
                  }}
                >
                  {(m.displayName || "M").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#141C6E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.displayName}
                  </div>
                  <div style={{ fontSize: "10.5px", color: m.isUnitHead ? "#D97706" : "#64748B", fontWeight: m.isUnitHead ? 700 : 500 }}>
                    {m.isUnitHead ? "Unit Head" : "Active Member"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "#747CA1", fontStyle: "italic", margin: 0 }}>
            Member directory is loading. Check back shortly.
          </p>
        )}
      </div>
    </div>
  );
}
