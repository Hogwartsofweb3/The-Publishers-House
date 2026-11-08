"use client";

import React, { useState } from "react";
import { UNITS } from "@/lib/portalAuth";

export interface AttendeeAccountConfig {
  attendanceId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  campus: "jos" | "abuja";
  assignedUnitId: string;
}

interface BatchCreateAccountsModalProps {
  showBatchModal: boolean;
  onCloseBatchModal: () => void;
  attendeesConfigs: AttendeeAccountConfig[];
  setAttendeesConfigs: React.Dispatch<React.SetStateAction<AttendeeAccountConfig[]>>;
  batchSendEmail: boolean;
  setBatchSendEmail: React.Dispatch<React.SetStateAction<boolean>>;
  batchCreating: boolean;
  onConfirmBatchCreate: () => void;
  quickRole: string;
  setQuickRole: (r: string) => void;
  quickCampus: "keep" | "jos" | "abuja";
  setQuickCampus: (c: "keep" | "jos" | "abuja") => void;
  quickUnit: string;
  setQuickUnit: (u: string) => void;
  onApplyQuickConfig: () => void;
  onUpdateAttendeeConfig: (id: string, field: keyof AttendeeAccountConfig, value: string) => void;
  batchResults: any;
  onCloseResults: () => void;
}

export default function BatchCreateAccountsModal({
  showBatchModal,
  onCloseBatchModal,
  attendeesConfigs,
  setAttendeesConfigs,
  batchSendEmail,
  setBatchSendEmail,
  batchCreating,
  onConfirmBatchCreate,
  quickRole,
  setQuickRole,
  quickCampus,
  setQuickCampus,
  quickUnit,
  setQuickUnit,
  onApplyQuickConfig,
  onUpdateAttendeeConfig,
  batchResults,
  onCloseResults,
}: BatchCreateAccountsModalProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAllCredentials = () => {
    if (!batchResults || !batchResults.results) return;
    const text = batchResults.results
      .map(
        (r: any) =>
          `Name: ${r.name}\nEmail: ${r.email}\nTemp Password: ${r.tempPassword}\nPortal: https://www.thepublishershouse.org/portal/login\n`
      )
      .join("\n---\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  return (
    <>
      {/* Batch Create Accounts Modal */}
      {showBatchModal && (() => {
        const activeWithEmailCount = attendeesConfigs.filter(
          (c) => c.email && c.email.trim().length > 0 && c.email.includes("@")
        ).length;
        const activeWithoutEmailCount = attendeesConfigs.length - activeWithEmailCount;

        return (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(14, 21, 86, 0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              className="portal-modal"
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                padding: "28px 32px",
                maxWidth: "700px",
                width: "100%",
                maxHeight: "92vh",
                overflowY: "auto",
                boxShadow: "0 10px 30px rgba(14, 21, 86, 0.2)",
                border: "1px solid #D5DCF2",
              }}
            >
              {/* Modal Title */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "19px",
                    fontWeight: 800,
                    color: "#141C6E",
                    margin: 0,
                  }}
                >
                  Create Accounts for Selected Attendees
                </h2>
                <button
                  type="button"
                  onClick={onCloseBatchModal}
                  style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#747CA1" }}
                >
                  ✕
                </button>
              </div>

              <p
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12.5px",
                  color: "#4A5490",
                  margin: "0 0 18px",
                }}
              >
                Provision portal logins for <strong>{attendeesConfigs.length}</strong> selected attendees. Accounts are provisioned with secure temporary passwords and linked to their assigned ministry units.
              </p>

              {/* Quick Bulk-Apply Controls Strip */}
              <div
                style={{
                  backgroundColor: "#F4F6FB",
                  border: "1px solid #D5DCF2",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#141C6E",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "10px",
                  }}
                >
                  ⚡ Bulk Set Defaults (Applies to all selected)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr auto", gap: "10px", alignItems: "flex-end" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "10.5px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "4px" }}>Role</label>
                    <select
                      value={quickRole}
                      onChange={(e) => setQuickRole(e.target.value)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "12px", backgroundColor: "#FFFFFF" }}
                    >
                      <option value="keep">— Keep Current —</option>
                      <option value="member">Member</option>
                      <option value="unit_head">Unit Head</option>
                      <option value="admin">Administrator</option>
                      <option value="pastor">Pastor</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "10.5px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "4px" }}>Campus</label>
                    <select
                      value={quickCampus}
                      onChange={(e) => setQuickCampus(e.target.value as any)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "12px", backgroundColor: "#FFFFFF" }}
                    >
                      <option value="keep">— Keep Current —</option>
                      <option value="jos">Jos Headquarters</option>
                      <option value="abuja">Abuja Campus</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "10.5px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "4px" }}>Church Unit</label>
                    <select
                      value={quickUnit}
                      onChange={(e) => setQuickUnit(e.target.value)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "12px", backgroundColor: "#FFFFFF" }}
                    >
                      <option value="keep">— Keep Current —</option>
                      <option value="none">Unassigned</option>
                      {UNITS.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={onApplyQuickConfig}
                    style={{
                      padding: "7px 14px",
                      backgroundColor: "#1F46C8",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: 700,
                      fontSize: "11.5px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Apply All
                  </button>
                </div>
              </div>

              {/* Attendee Config Table */}
              <div
                style={{
                  border: "1px solid #D5DCF2",
                  borderRadius: "10px",
                  maxHeight: "320px",
                  overflowY: "auto",
                  marginBottom: "16px",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F4F6FB", borderBottom: "1px solid #D5DCF2", textAlign: "left", position: "sticky", top: 0, zIndex: 2 }}>
                      <th style={{ padding: "10px 12px", color: "#4A5490", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Attendee</th>
                      <th style={{ padding: "10px 12px", color: "#4A5490", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Email (Required)</th>
                      <th style={{ padding: "10px 12px", color: "#4A5490", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Role</th>
                      <th style={{ padding: "10px 12px", color: "#4A5490", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Campus</th>
                      <th style={{ padding: "10px 12px", color: "#4A5490", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Church Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendeesConfigs.map((cfg) => {
                      const hasEmail = cfg.email && cfg.email.includes("@");
                      return (
                        <tr key={cfg.attendanceId} style={{ borderBottom: "1px solid #EDF1FA", backgroundColor: hasEmail ? "#FFFFFF" : "#FFF8F0" }}>
                          <td style={{ padding: "10px 12px", fontWeight: 600, color: "#141C6E" }}>
                            {cfg.fullName}
                            {cfg.phone && <div style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 400 }}>{cfg.phone}</div>}
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <input
                              type="email"
                              value={cfg.email}
                              placeholder="Enter email..."
                              onChange={(e) => onUpdateAttendeeConfig(cfg.attendanceId, "email", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "6px 8px",
                                borderRadius: "6px",
                                border: hasEmail ? "1px solid #D5DCF2" : "1.5px solid #F59E0B",
                                fontSize: "11.5px",
                                backgroundColor: hasEmail ? "#FFFFFF" : "#FEF3C7",
                                color: "#141C6E",
                              }}
                            />
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <select
                              value={cfg.role}
                              onChange={(e) => onUpdateAttendeeConfig(cfg.attendanceId, "role", e.target.value)}
                              style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "11px", backgroundColor: "#FFFFFF" }}
                            >
                              <option value="member">Member</option>
                              <option value="unit_head">Unit Head</option>
                              <option value="admin">Administrator</option>
                              <option value="pastor">Pastor</option>
                            </select>
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <select
                              value={cfg.campus}
                              onChange={(e) => onUpdateAttendeeConfig(cfg.attendanceId, "campus", e.target.value)}
                              style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "11px", backgroundColor: "#FFFFFF" }}
                            >
                              <option value="jos">Jos</option>
                              <option value="abuja">Abuja</option>
                            </select>
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <select
                              value={cfg.assignedUnitId}
                              onChange={(e) => onUpdateAttendeeConfig(cfg.attendanceId, "assignedUnitId", e.target.value)}
                              style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #D5DCF2", fontSize: "11px", backgroundColor: "#FFFFFF", maxWidth: "140px" }}
                            >
                              <option value="none">Unassigned</option>
                              {UNITS.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Email Warning if any missing */}
              {activeWithoutEmailCount > 0 && (
                <div
                  style={{
                    backgroundColor: "#FFFBEB",
                    border: "1px solid #FDE68A",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: "#92400E",
                  }}
                >
                  <span>⚠️</span>
                  <span>
                    <strong>{activeWithoutEmailCount}</strong> attendee(s) have no email address. They will be skipped unless you enter an email above.
                  </span>
                </div>
              )}

              {/* Send Welcome Email Toggle */}
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12.5px", color: "#141C6E", marginBottom: "20px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={batchSendEmail}
                  onChange={(e) => setBatchSendEmail(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <span>Send invitation email with portal login link &amp; credentials</span>
              </label>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={onCloseBatchModal}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#F4F6FB",
                    color: "#141C6E",
                    border: "1px solid #D5DCF2",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "12.5px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirmBatchCreate}
                  disabled={batchCreating || activeWithEmailCount === 0}
                  style={{
                    padding: "10px 22px",
                    backgroundColor: activeWithEmailCount === 0 ? "#94A3B8" : "#1F46C8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "12.5px",
                    cursor: batchCreating || activeWithEmailCount === 0 ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 6px rgba(31, 70, 200, 0.25)",
                  }}
                >
                  {batchCreating ? "Provisioning Accounts..." : `Provision ${activeWithEmailCount} Account(s) →`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Batch Results Credentials Modal */}
      {batchResults && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(14, 21, 86, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="portal-modal"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "28px 32px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(14, 21, 86, 0.2)",
              border: "1px solid #D5DCF2",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "36px", marginBottom: "6px" }}>🎉</div>
              <h2
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#141C6E",
                  margin: "0 0 4px",
                }}
              >
                Accounts Successfully Provisioned!
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "13px",
                  color: "#4A5490",
                  margin: 0,
                }}
              >
                {batchResults.createdCount} new account(s) created · {batchResults.alreadyExistedCount} refreshed · {batchResults.skippedCount} skipped
              </p>
            </div>

            {/* Copy All Button */}
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                onClick={handleCopyAllCredentials}
                style={{
                  padding: "10px 20px",
                  backgroundColor: copiedAll ? "#0F6B38" : "#0E1556",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "12.5px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(14, 21, 86, 0.2)",
                  transition: "background-color 0.2s",
                }}
              >
                <span>{copiedAll ? "✓ Copied to Clipboard!" : "📋 Copy All Credentials"}</span>
              </button>
            </div>

            {/* Credentials Table */}
            <div
              style={{
                border: "1px solid #D5DCF2",
                borderRadius: "10px",
                maxHeight: "300px",
                overflowY: "auto",
                marginBottom: "20px",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F4F6FB", borderBottom: "1px solid #D5DCF2", textAlign: "left", position: "sticky", top: 0 }}>
                    <th style={{ padding: "8px 12px", color: "#4A5490", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Member</th>
                    <th style={{ padding: "8px 12px", color: "#4A5490", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Email</th>
                    <th style={{ padding: "8px 12px", color: "#4A5490", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Temp Password</th>
                    <th style={{ padding: "8px 12px", color: "#4A5490", fontWeight: 700, textTransform: "uppercase", fontSize: "10.5px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batchResults.results?.map((item: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #EDF1FA" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600, color: "#141C6E" }}>{item.name}</td>
                      <td style={{ padding: "8px 12px", color: "#4A5490" }}>{item.email}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#0F6B38", fontWeight: 700 }}>
                        {item.tempPassword || "—"}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            backgroundColor:
                              item.status === "created"
                                ? "#E4F5EA"
                                : item.status === "already_existed"
                                ? "#E0F2FE"
                                : item.status === "skipped_no_email"
                                ? "#FFF7ED"
                                : "#FEE2E2",
                            color:
                              item.status === "created"
                                ? "#0F6B38"
                                : item.status === "already_existed"
                                ? "#0284C7"
                                : item.status === "skipped_no_email"
                                ? "#C2410C"
                                : "#991B1B",
                          }}
                        >
                          {item.status === "created"
                            ? "Created"
                            : item.status === "already_existed"
                            ? "Updated"
                            : item.status === "skipped_no_email"
                            ? "Skipped"
                            : "Error"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={onCloseResults}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#1F46C8",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Done &amp; Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
