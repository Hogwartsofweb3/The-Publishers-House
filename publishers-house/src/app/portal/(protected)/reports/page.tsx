"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePortal } from "@/lib/portalContext";
import { canAccessExecutiveReports, normalizeUnitId } from "@/lib/portalAuth";

interface Volunteer {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  role?: string;
}

interface UnitDetail {
  id: string;
  name: string;
  headName: string;
  headEmail: string;
  headPhone: string;
  oversightGroup?: string;
  schedule: string;
  venue: string;
  volunteerCount: number;
  volunteers: Volunteer[];
  status: "active" | "unassigned" | "cluster_managed";
  notes?: string;
}

interface ServiceRecord {
  date: string;
  serviceType: string;
  inPersonCount: number;
  onlineCount: number;
  total: number;
  firstTimers: number;
  workers: number;
}

interface NewMember {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  campus: string;
  assignedUnit: string;
  createdAt: string;
}

interface MonthlyReport {
  meta: {
    reportId: string;
    monthParam: string;
    monthLabel: string;
    prevMonthLabel: string;
    generatedAt: string;
    generatedBy: {
      name: string;
      email: string;
      role: string;
    };
    signatories: {
      secretariatHead: {
        name: string;
        title: string;
        status: string;
      };
      pastoralCouncil: {
        name: string;
        title: string;
        status: string;
      };
    };
  };
  kpiSummary: {
    totalRegisteredMembers: number;
    newMembersThisMonth: number;
    monthlyGivingTotal: number;
    prevMonthGivingTotal: number;
    givingDeltaPct: number;
    givingCurrency: string;
    activeUnitsCount: number;
    activeVolunteersCount: number;
    totalServicesHeld: number;
    totalAttendance: number;
    avgAttendancePerService: number;
    openPastoralInquiries: number;
    resolvedPastoralInquiries: number;
    prayerRequestsReceived: number;
    testimoniesApproved: number;
  };
  membershipGrowth: {
    totalMembers: number;
    newThisMonthCount: number;
    campusSplit: {
      jos: number;
      abuja: number;
      onlineGlobal: number;
    };
    newMembersSample: NewMember[];
  };
  unitsHealth: {
    totalUnits: number;
    assignedHeadsCount: number;
    totalRosteredVolunteers: number;
    units: UnitDetail[];
  };
  servicesAttendance: {
    servicesHeld: number;
    totalCumulativeAttendance: number;
    averagePerGathering: number;
    services: ServiceRecord[];
  };
  kingdomGiving: {
    totalAmount: number;
    previousMonthAmount: number;
    growthPercentage: number;
    transactionCount: number;
    categoryBreakdown: Record<string, number>;
  };
  pastoralCare: {
    inquiries: {
      total: number;
      pending: number;
      resolved: number;
    };
    prayers: {
      total: number;
      answeredOrInterceded: number;
    };
    testimonies: {
      total: number;
      approved: number;
    };
  };
  discipleshipAcademy: {
    enrolledGrowthTrackCount: number;
    foundationClassCompletions: number;
    activeTheologicalStudents: number;
  };
}

export default function MonthlyExecutiveReportPage() {
  const { effectiveUser } = usePortal();
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);

  // Generate selectable list of past 12 months
  const availableMonths = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    const base = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      list.push({ key, label });
    }
    return list;
  }, []);

  const fetchReport = async (monthKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/reports/monthly?month=${monthKey}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
      } else {
        throw new Error("Invalid report response format");
      }
    } catch (err: any) {
      console.error("Failed to load monthly report:", err);
      setError(err.message || "Failed to compile monthly executive report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedMonth);
  }, [selectedMonth]);

  const hasAccess = canAccessExecutiveReports(effectiveUser);

  const handleCopySummary = () => {
    if (!report) return;
    const summaryText = `THE PUBLISHERS HOUSE — EXECUTIVE MINISTRY SUMMARY
Report Month: ${report.meta.monthLabel}
Report Ref: ${report.meta.reportId}

• Total Congregation: ${report.kpiSummary.totalRegisteredMembers.toLocaleString()} members (+${report.kpiSummary.newMembersThisMonth} this month)
• Monthly Kingdom Giving: ₦${report.kpiSummary.monthlyGivingTotal.toLocaleString()} (${report.kpiSummary.givingDeltaPct >= 0 ? "+" : ""}${report.kpiSummary.givingDeltaPct}% vs ${report.meta.prevMonthLabel})
• Gatherings Held: ${report.kpiSummary.totalServicesHeld} (Cumulative: ${report.kpiSummary.totalAttendance.toLocaleString()} attendees | Avg: ${report.kpiSummary.avgAttendancePerService}/service)
• Active Ministry Units: ${report.kpiSummary.activeUnitsCount} departments (${report.kpiSummary.activeVolunteersCount} rostered workers)
• Pastoral Care & Inquiries: ${report.pastoralCare.inquiries.resolved} resolved, ${report.pastoralCare.inquiries.pending} pending
• Intercession & Altar: ${report.pastoralCare.prayers.total} prayers submitted, ${report.pastoralCare.testimonies.approved} testimonies approved

Compiled by Victoria Ogwuche (Secretariat) for Church Pastoral Board.`;

    navigator.clipboard.writeText(summaryText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  if (!hasAccess) {
    return (
      <div style={{ maxWidth: "700px", margin: "60px auto", padding: "30px", backgroundColor: "#FFFFFF", borderRadius: "16px", textAlign: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔒</div>
        <h2 style={{ fontSize: "22px", color: "#0E1556", fontWeight: 700, marginBottom: "8px" }}>Restricted Leadership Dossier</h2>
        <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
          The Comprehensive Monthly Executive & Secretariat Ministry Report is exclusively restricted to the Super Admin, Pastoral Board, and the Head of Secretariat (Victoria Ogwuche).
        </p>
        <Link
          href="/portal"
          style={{ display: "inline-block", padding: "10px 24px", backgroundColor: "#0E1556", color: "#FFFFFF", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "13px" }}
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Dedicated Print & Screen CSS */}
      <style jsx global>{`
        @media print {
          /* Hide non-report layout elements */
          aside,
          nav,
          .portal-sidebar,
          .portal-header,
          .portal-mobile-bar,
          .impersonation-banner,
          .screen-only-controls,
          .push-prompt-sheet {
            display: none !important;
          }

          body,
          main,
          .portal-main-content {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          .report-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }

          .page-break-before {
            page-break-before: always !important;
            break-before: page !important;
          }

          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: "1140px", margin: "0 auto", paddingBottom: "80px" }}>
        
        {/* Sticky Screen-Only Toolbar */}
        <div
          className="screen-only-controls"
          style={{
            position: "sticky",
            top: "16px",
            zIndex: 30,
            marginBottom: "24px",
            backgroundColor: "#FFFFFF",
            padding: "14px 20px",
            borderRadius: "14px",
            boxShadow: "0 4px 20px rgba(14, 21, 86, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            border: "1px solid #E2E8F0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>📜</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0E1556" }}>
                Monthly Ministry Activity Dossier
              </div>
              <div style={{ fontSize: "11.5px", color: "#64748B" }}>
                Super Admin & Secretariat Executive Portal
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Month Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label htmlFor="report-month" style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                Month:
              </label>
              <select
                id="report-month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  padding: "7px 12px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0E1556",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #CBD5E1",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {availableMonths.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Copy Summary Button */}
            <button
              onClick={handleCopySummary}
              style={{
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B",
                backgroundColor: "#F1F5F9",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              <span>{copySuccess ? "✓ Copied!" : "📋 Copy Summary"}</span>
            </button>

            {/* Print / Export as PDF */}
            <button
              onClick={() => window.print()}
              style={{
                padding: "8px 18px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#FFFFFF",
                backgroundColor: "#0E1556",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 8px rgba(14, 21, 86, 0.25)",
              }}
            >
              <span>🖨️ Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Loading / Error State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: "36px", height: "36px", border: "3px solid #E2E8F0", borderTopColor: "#0E1556", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#0E1556" }}>Compiling Monthly Church Dossier...</div>
            <div style={{ fontSize: "12.5px", color: "#64748B", marginTop: "4px" }}>Aggregating members, units, finances, attendance, and care logs</div>
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: "20px", backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "12px", color: "#991B1B", textAlign: "center", marginBottom: "24px" }}>
            <strong>Error compiling report:</strong> {error}
            <div style={{ marginTop: "12px" }}>
              <button
                onClick={() => fetchReport(selectedMonth)}
                style={{ padding: "6px 14px", backgroundColor: "#991B1B", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Executive Document Paper Container */}
        {report && !loading && (
          <div
            className="report-sheet"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "40px 48px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              border: "1px solid #E2E8F0",
              color: "#0F172A",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
            }}
          >
            {/* Document Header & Crest */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "2px solid #0E1556",
                paddingBottom: "24px",
                marginBottom: "32px",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: "#0E1556",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: 800,
                      letterSpacing: "0.5px",
                    }}
                  >
                    TPH
                  </div>
                  <div>
                    <div style={{ fontSize: "17px", fontWeight: 800, color: "#0E1556", letterSpacing: "1px", textTransform: "uppercase" }}>
                      The Publishers House
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      Office of the Secretariat & Pastoral Board
                    </div>
                  </div>
                </div>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0E1556", marginTop: "14px", marginBottom: "4px" }}>
                  Monthly Executive Ministry Report
                </h1>
                <p style={{ fontSize: "13.5px", color: "#475569", margin: 0 }}>
                  Reporting Period: <strong style={{ color: "#0E1556" }}>{report.meta.monthLabel}</strong> · Stamped Church Activity Dossier
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    backgroundColor: "#EEF2FF",
                    color: "#3730A3",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Official Certified Copy
                </span>
                <div style={{ fontSize: "12px", color: "#64748B" }}>
                  Dossier ID: <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#0F172A" }}>{report.meta.reportId}</span>
                </div>
                <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                  Generated on: {new Date(report.meta.generatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>
            </div>

            {/* ── Executive KPI Summary Ribbon ─────────────────────────── */}
            <div style={{ marginBottom: "36px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>
                1. Executive KPI Summary
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "14px",
                }}
              >
                <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Total Members</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#0E1556", marginTop: "4px" }}>
                    {report.kpiSummary.totalRegisteredMembers.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "11px", color: "#059669", fontWeight: 600, marginTop: "2px" }}>
                    +{report.kpiSummary.newMembersThisMonth} joined this month
                  </div>
                </div>

                <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Monthly Giving</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#0E1556", marginTop: "4px" }}>
                    ₦{report.kpiSummary.monthlyGivingTotal.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "11px", color: report.kpiSummary.givingDeltaPct >= 0 ? "#059669" : "#DC2626", fontWeight: 600, marginTop: "2px" }}>
                    {report.kpiSummary.givingDeltaPct >= 0 ? "▲ +" : "▼ "}{report.kpiSummary.givingDeltaPct}% vs {report.meta.prevMonthLabel}
                  </div>
                </div>

                <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Avg Service Attendance</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#0E1556", marginTop: "4px" }}>
                    {report.kpiSummary.avgAttendancePerService}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                    across {report.kpiSummary.totalServicesHeld} gatherings
                  </div>
                </div>

                <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Active Units & Rostered</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#0E1556", marginTop: "4px" }}>
                    {report.kpiSummary.activeUnitsCount} Units
                  </div>
                  <div style={{ fontSize: "11px", color: "#0284C7", fontWeight: 600, marginTop: "2px" }}>
                    {report.kpiSummary.activeVolunteersCount} rostered workers
                  </div>
                </div>

                <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Pastoral Care & Inquiries</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#0E1556", marginTop: "4px" }}>
                    {report.kpiSummary.resolvedPastoralInquiries + report.kpiSummary.openPastoralInquiries}
                  </div>
                  <div style={{ fontSize: "11px", color: report.kpiSummary.openPastoralInquiries > 0 ? "#D97706" : "#059669", fontWeight: 600, marginTop: "2px" }}>
                    {report.kpiSummary.openPastoralInquiries} pending · {report.kpiSummary.resolvedPastoralInquiries} resolved
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 2: Units & Departmental Health ─────────────────── */}
            <div className="avoid-break" style={{ marginBottom: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0E1556", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  2. Church Units & Departmental Health ({report.unitsHealth.totalUnits} Units)
                </h2>
                <span style={{ fontSize: "12px", color: "#64748B" }}>
                  {report.unitsHealth.assignedHeadsCount} Assigned Heads · {report.unitsHealth.totalRosteredVolunteers} Active Volunteers
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F1F5F9", color: "#334155", fontWeight: 700 }}>
                      <th style={{ padding: "10px 12px", borderBottom: "2px solid #CBD5E1" }}>Ministry Unit</th>
                      <th style={{ padding: "10px 12px", borderBottom: "2px solid #CBD5E1" }}>Designated Unit Head</th>
                      <th style={{ padding: "10px 12px", borderBottom: "2px solid #CBD5E1" }}>Meeting Schedule & Preparation</th>
                      <th style={{ padding: "10px 12px", borderBottom: "2px solid #CBD5E1", textAlign: "center" }}>Rostered</th>
                      <th style={{ padding: "10px 12px", borderBottom: "2px solid #CBD5E1", textAlign: "center" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.unitsHealth.units.map((u, i) => {
                      const isExpanded = expandedUnitId === u.id;
                      return (
                        <tr
                          key={u.id}
                          style={{
                            backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                            borderBottom: "1px solid #E2E8F0",
                          }}
                        >
                          <td style={{ padding: "12px", verticalAlign: "top" }}>
                            <div style={{ fontWeight: 700, color: "#0E1556" }}>{u.name}</div>
                            {u.oversightGroup && (
                              <div style={{ fontSize: "11px", color: "#7C3AED", fontWeight: 600, marginTop: "2px" }}>
                                ↳ {u.oversightGroup}
                              </div>
                            )}
                            {u.notes && (
                              <div style={{ fontSize: "11px", color: "#D97706", fontWeight: 500, marginTop: "2px" }}>
                                ℹ {u.notes}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px", verticalAlign: "top" }}>
                            <div style={{ fontWeight: 600, color: "#1E293B" }}>{u.headName}</div>
                            <div style={{ fontSize: "11px", color: "#64748B" }}>
                              {u.headPhone} · {u.headEmail}
                            </div>
                          </td>
                          <td style={{ padding: "12px", verticalAlign: "top", color: "#475569", fontSize: "12px" }}>
                            <div>{u.schedule}</div>
                            <div style={{ fontSize: "11px", color: "#64748B" }}>📍 {u.venue}</div>
                          </td>
                          <td style={{ padding: "12px", verticalAlign: "top", textAlign: "center" }}>
                            <button
                              onClick={() => setExpandedUnitId(isExpanded ? null : u.id)}
                              className="screen-only-controls"
                              style={{
                                padding: "4px 8px",
                                backgroundColor: isExpanded ? "#0E1556" : "#E2E8F0",
                                color: isExpanded ? "#FFFFFF" : "#0E1556",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "11.5px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {u.volunteerCount} members {isExpanded ? "▲" : "▼"}
                            </button>
                            {/* Static print representation */}
                            <span style={{ display: "none" }} className="print-only">
                              {u.volunteerCount}
                            </span>
                            {isExpanded && u.volunteers.length > 0 && (
                              <div
                                style={{
                                  marginTop: "8px",
                                  padding: "8px 10px",
                                  backgroundColor: "#FFFFFF",
                                  border: "1px solid #CBD5E1",
                                  borderRadius: "6px",
                                  textAlign: "left",
                                  fontSize: "11px",
                                  maxHeight: "150px",
                                  overflowY: "auto",
                                }}
                              >
                                {u.volunteers.map((v) => (
                                  <div key={v.uid} style={{ padding: "2px 0", borderBottom: "1px dashed #F1F5F9" }}>
                                    <strong>{v.displayName}</strong> ({v.phone || v.email})
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px", verticalAlign: "top", textAlign: "center" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                backgroundColor:
                                  u.status === "active"
                                    ? "#ECFDF5"
                                    : u.status === "cluster_managed"
                                    ? "#F5F3FF"
                                    : "#FEF2F2",
                                color:
                                  u.status === "active"
                                    ? "#065F46"
                                    : u.status === "cluster_managed"
                                    ? "#6D28D9"
                                    : "#991B1B",
                              }}
                            >
                              {u.status === "cluster_managed" ? "Cluster Managed" : u.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Section 3: Gatherings, Services & Attendance ─────────── */}
            <div className="avoid-break" style={{ marginBottom: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0E1556", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  3. Worship Services & Attendance Headcount Log
                </h2>
                <span style={{ fontSize: "12px", color: "#64748B" }}>
                  {report.servicesAttendance.totalCumulativeAttendance.toLocaleString()} Total Attendees · {report.servicesAttendance.averagePerGathering} Avg
                </span>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F1F5F9", color: "#334155", fontWeight: 700 }}>
                    <th style={{ padding: "10px 12px", borderBottom: "2px solid #CBD5E1" }}>Service Date</th>
                    <th style={{ padding: "10px 12px", borderBottom: "2px solid #CBD5E1" }}>Gathering Type</th>
                    <th style={{ padding: "10px 12px", borderBottom: "2px solid #CBD5E1", textAlign: "center" }}>In-Person</th>
                    <th style={{ padding: "10px 12px", borderBottom: "2px solid #CBD5E1", textAlign: "center" }}>Online Stream</th>
                    <th style={{ padding: "10px 12px", borderBottom: "2px solid #CBD5E1", textAlign: "center" }}>First Timers</th>
                    <th style={{ padding: "10px 12px", borderBottom: "2px solid #CBD5E1", textAlign: "center" }}>Workers</th>
                    <th style={{ padding: "10px 12px", borderBottom: "2px solid #CBD5E1", textAlign: "right" }}>Total Headcount</th>
                  </tr>
                </thead>
                <tbody>
                  {report.servicesAttendance.services.map((s, idx) => (
                    <tr
                      key={`${s.date}-${idx}`}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                        borderBottom: "1px solid #E2E8F0",
                      }}
                    >
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "#0E1556" }}>
                        {new Date(s.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "10px 12px", color: "#334155" }}>{s.serviceType}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", color: "#475569" }}>{s.inPersonCount}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", color: "#0284C7" }}>{s.onlineCount}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", color: "#059669", fontWeight: 600 }}>{s.firstTimers}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center", color: "#475569" }}>{s.workers}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 800, color: "#0E1556" }}>
                        {s.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Section 4: Kingdom Giving & Financial Stewardship ───── */}
            <div className="avoid-break" style={{ marginBottom: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0E1556", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  4. Kingdom Giving & Financial Stewardship
                </h2>
                <span style={{ fontSize: "12px", color: "#64748B" }}>
                  Total: <strong>₦{report.kingdomGiving.totalAmount.toLocaleString()}</strong> ({report.kingdomGiving.transactionCount} transactions)
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                {Object.entries(report.kingdomGiving.categoryBreakdown).map(([cat, amount]) => {
                  if (amount === 0) return null;
                  const label = cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                  const pct = Math.round((amount / report.kingdomGiving.totalAmount) * 100);
                  return (
                    <div key={cat} style={{ padding: "12px 14px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "#64748B", fontWeight: 600 }}>
                        <span>{label}</span>
                        <span>{pct}%</span>
                      </div>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#0E1556", marginTop: "4px" }}>
                        ₦{amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Section 5: Pastoral Care, Inquiries & Altar Intercession ── */}
            <div className="avoid-break" style={{ marginBottom: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0E1556", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  5. Pastoral Care, Inquiries & Altar Ministry
                </h2>
                <span style={{ fontSize: "12px", color: "#64748B" }}>
                  Discipleship & Shepherd Oversight
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "14px" }}>
                <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0E1556", marginBottom: "6px" }}>
                    Pastoral Inquiries & Counseling
                  </div>
                  <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                    • Total inquiries logged: <strong>{report.pastoralCare.inquiries.total}</strong><br />
                    • Resolved / Answered: <strong style={{ color: "#059669" }}>{report.pastoralCare.inquiries.resolved}</strong><br />
                    • Pending pastoral attention: <strong style={{ color: report.pastoralCare.inquiries.pending > 0 ? "#D97706" : "#059669" }}>{report.pastoralCare.inquiries.pending}</strong>
                  </div>
                </div>

                <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0E1556", marginBottom: "6px" }}>
                    Altar Intercession & Prayer Requests
                  </div>
                  <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                    • Petitions submitted: <strong>{report.pastoralCare.prayers.total}</strong><br />
                    • Forwarded to Prayer Unit: <strong>{report.pastoralCare.prayers.total}</strong><br />
                    • Interceded & Ministered: <strong style={{ color: "#059669" }}>{report.pastoralCare.prayers.answeredOrInterceded}</strong>
                  </div>
                </div>

                <div style={{ padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0E1556", marginBottom: "6px" }}>
                    Testimonies & Praise Reports
                  </div>
                  <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                    • Praise reports submitted: <strong>{report.pastoralCare.testimonies.total}</strong><br />
                    • Approved for Sanctuary bulletin: <strong style={{ color: "#059669" }}>{report.pastoralCare.testimonies.approved}</strong><br />
                    • Under review: <strong>{Math.max(0, report.pastoralCare.testimonies.total - report.pastoralCare.testimonies.approved)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 6: Official Sign-Off & Verification Block ───── */}
            <div
              className="avoid-break"
              style={{
                marginTop: "48px",
                paddingTop: "24px",
                borderTop: "2px solid #0E1556",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "32px",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                  Prepared & Compiled By:
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#0E1556" }}>
                  {report.meta.signatories.secretariatHead.name}
                </div>
                <div style={{ fontSize: "12px", color: "#475569" }}>
                  {report.meta.signatories.secretariatHead.title}
                </div>
                <div style={{ fontSize: "11px", color: "#059669", fontWeight: 600, marginTop: "6px" }}>
                  ✓ {report.meta.signatories.secretariatHead.status}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                  Executive Review & Oversight:
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#0E1556" }}>
                  {report.meta.signatories.pastoralCouncil.name}
                </div>
                <div style={{ fontSize: "12px", color: "#475569" }}>
                  {report.meta.signatories.pastoralCouncil.title}
                </div>
                <div style={{ fontSize: "11px", color: "#059669", fontWeight: 600, marginTop: "6px" }}>
                  ✓ {report.meta.signatories.pastoralCouncil.status}
                </div>
              </div>
            </div>

            {/* Footer Cryptographic Hash Note */}
            <div style={{ marginTop: "24px", paddingTop: "12px", borderTop: "1px dashed #E2E8F0", textAlign: "center", fontSize: "10.5px", color: "#94A3B8" }}>
              The Publishers House Portal · Stamped Governance Document · Reference: {report.meta.reportId} · Confidential to Leadership
            </div>
          </div>
        )}
      </div>
    </>
  );
}
