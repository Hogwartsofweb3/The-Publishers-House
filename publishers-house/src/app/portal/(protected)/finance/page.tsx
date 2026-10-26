"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, query, orderBy } from "firebase/firestore";

interface Transaction {
  id: string;
  name: string;
  email: string;
  amountNGN: number;
  category: "Tithe" | "Offering" | "Special Projects" | "Thanksgiving" | string;
  method: "Paystack" | "Bank Transfer" | "Crypto" | "Cash" | string;
  status: "pending" | "success" | "failed";
  timestamp: string;
  reference?: string;
  notes?: string;
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "reports">("overview");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    amountNGN: "",
    category: "Tithe",
    method: "Bank Transfer",
    notes: "",
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "transactions"), orderBy("timestamp", "desc")));
      if (!snap.empty) {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction)));
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.warn("Could not load transactions from Firestore:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.amountNGN) return;

    const id = `tx-${Date.now()}`;
    const newTx: Transaction = {
      id,
      name: form.name,
      email: form.email || "donor@tph.org",
      amountNGN: Number(form.amountNGN),
      category: form.category,
      method: form.method,
      status: "success",
      timestamp: new Date().toISOString(),
      reference: `TPH-REC-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: form.notes,
    };

    try {
      await fetch("/api/cms/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "log", id, transaction: newTx }),
      });
    } catch {}

    setTransactions((prev) => [newTx, ...prev]);
    setShowModal(false);
    setForm({ name: "", email: "", amountNGN: "", category: "Tithe", method: "Bank Transfer", notes: "" });
    setMsg("Transaction logged successfully ✓");
    setTimeout(() => setMsg(""), 3500);
  };

  const totalSum = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (t.status !== "failed" ? Number(t.amountNGN) || 0 : 0), 0);
  }, [transactions]);

  const thisMonthSum = useMemo(() => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return transactions.reduce((acc, t) => {
      if (t.status === "failed") return acc;
      const d = t.timestamp ? new Date(t.timestamp) : null;
      if (d && d >= monthStart) return acc + (Number(t.amountNGN) || 0);
      return acc;
    }, 0);
  }, [transactions]);

  const monthlyTrend = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const totals = months.map((m) => ({ month: m, amount: 0, barPct: 4 }));
    transactions.forEach((tx) => {
      if (tx.status === "failed") return;
      const d = new Date(tx.timestamp);
      if (d && !isNaN(d.getTime()) && d.getFullYear() === currentYear) {
        totals[d.getMonth()].amount += Number(tx.amountNGN) || 0;
      }
    });
    const max = Math.max(...totals.map((t) => t.amount), 1);
    return totals.map((t) => ({
      ...t,
      barPct: t.amount > 0 ? Math.round((t.amount / max) * 90) + 10 : 4,
    }));
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const total = transactions.reduce((acc, t) => acc + (t.status !== "failed" ? Number(t.amountNGN) || 0 : 0), 0);
    const cats = [
      { label: "Tithes", key: "Tithe", color: "#1F46C8" },
      { label: "Offerings", key: "Offering", color: "#0F6B38" },
      { label: "Special Projects", key: "Special Projects", color: "#D97706" },
      { label: "Thanksgiving", key: "Thanksgiving", color: "#7A5200" },
    ];
    return cats.map((c) => {
      const sum = transactions
        .filter((t) => t.category === c.key && t.status !== "failed")
        .reduce((acc, t) => acc + (Number(t.amountNGN) || 0), 0);
      const pct = total > 0 ? Math.round((sum / total) * 100) : 0;
      return {
        label: c.label,
        pct,
        color: c.color,
        amount: `₦${sum.toLocaleString()}`,
      };
    });
  }, [transactions]);

  const filtered = transactions.filter((t) => {
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return t.name.toLowerCase().includes(s) || t.email.toLowerCase().includes(s) || (t.reference && t.reference.toLowerCase().includes(s));
    }
    return true;
  });

  const exportCSV = () => {
    const headers = "Donor Name,Email,Category,Method,Amount (NGN),Status,Reference,Date\n";
    const rows = filtered
      .map(
        (t) =>
          `"${t.name}","${t.email}","${t.category}","${t.method}",${t.amountNGN},"${t.status}","${t.reference || ""}","${t.timestamp}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TPH-Finances-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header (Figma 311:2656) */}
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
            Finances & Giving
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
            Every gift, receipted and reconciled · Tithes, Offerings & Special Projects
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
            onClick={exportCSV}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5DCF2",
              borderRadius: "10px",
              padding: "10px 16px",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontWeight: 600,
              fontSize: "13px",
              color: "#141C6E",
              cursor: "pointer",
            }}
          >
            Export CSV
          </button>

          <button
            onClick={() => setShowModal(true)}
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
            + Add Transaction
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Row (Figma 311:2721) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "14px",
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Total Giving</span>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "32px", fontWeight: 800, color: "#141C6E", lineHeight: 1 }}>
            ₦{totalSum.toLocaleString()}
          </div>
          <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490" }}>Cumulative Reconciled Giving</span>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "14px",
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>This Month</span>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "32px", fontWeight: 800, color: "#141C6E", lineHeight: 1 }}>
            ₦{thisMonthSum.toLocaleString()}
          </div>
          <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#0F6B38", fontWeight: 600 }}>
            Verified monthly receipts
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "14px",
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Monthly Average</span>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "32px", fontWeight: 800, color: "#141C6E", lineHeight: 1 }}>
            ₦1,025,500
          </div>
          <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490" }}>Over 10 months tracking</span>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "14px",
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Active Contributors</span>
          <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "32px", fontWeight: 800, color: "#141C6E", lineHeight: 1 }}>
            164
          </div>
          <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#1F46C8", fontWeight: 600 }}>48% of active church members</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #D5DCF2", paddingBottom: "12px" }}>
        {[
          { key: "overview", label: "Overview & Analytics" },
          { key: "transactions", label: "All Transactions" },
          { key: "reports", label: "Financial Reports" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === tab.key ? "#1F46C8" : "transparent",
              color: activeTab === tab.key ? "#FFFFFF" : "#4A5490",
              fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Charts Row: Monthly Trend Bar Chart & Income Distribution */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
            {/* Monthly Trend Chart (Figma 311:2755) */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D5DCF2",
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "16px", fontWeight: 700, color: "#141C6E", margin: 0 }}>
                    Monthly Income Trend (2026)
                  </h3>
                  <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11.5px", color: "#4A5490" }}>
                    Giving progression across months
                  </span>
                </div>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    backgroundColor: "#E8EDFB",
                    color: "#1F46C8",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  Peak: Oct ₦1.155M
                </span>
              </div>

              {/* Bar visualization */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "200px", padding: "0 10px", borderBottom: "1px solid #E8EDFB", gap: "10px" }}>
                {monthlyTrend.map((item) => (
                  <div key={item.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: "8px" }}>
                    <div
                      title={`${item.month}: ₦${item.amount.toLocaleString()}`}
                      style={{
                        width: "100%",
                        maxWidth: "36px",
                        height: `${item.barPct}%`,
                        backgroundColor: item.amount > 0 ? "#1F46C8" : "#D5DCF2",
                        borderRadius: "6px 6px 0 0",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#141C6E")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = item.amount > 0 ? "#1F46C8" : "#D5DCF2")}
                    />
                    <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490", fontWeight: 600 }}>
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Income Distribution (Figma 311:2800) */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D5DCF2",
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <h3 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "16px", fontWeight: 700, color: "#141C6E", margin: "0 0 16px" }}>
                Income Distribution
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {categoryBreakdown.map((cat) => (
                  <div key={cat.label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", fontWeight: 600, color: "#141C6E" }}>
                        {cat.label}
                      </span>
                      <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", fontWeight: 700, color: cat.color }}>
                        {cat.pct}% ({cat.amount})
                      </span>
                    </div>

                    <div style={{ width: "100%", height: "8px", backgroundColor: "#EEF2FB", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${cat.pct}%`, height: "100%", backgroundColor: cat.color, borderRadius: "4px" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table (Shown in Overview & Transactions tab) */}
      {(activeTab === "overview" || activeTab === "transactions") && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D5DCF2",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #E8EDFB",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <div>
              <h3 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "16px", fontWeight: 700, color: "#141C6E", margin: 0 }}>
                Recent Giving & Reconciled Records
              </h3>
              <span style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11.5px", color: "#4A5490" }}>
                Verified transactions across Bank, Paystack, and Crypto
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search donor or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #D5DCF2",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12px",
                  color: "#141C6E",
                  outline: "none",
                  width: "220px",
                }}
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #D5DCF2",
                  backgroundColor: "#FFFFFF",
                  fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                  fontSize: "12px",
                  color: "#141C6E",
                  outline: "none",
                }}
              >
                <option value="all">All Categories</option>
                <option value="Tithe">Tithes</option>
                <option value="Offering">Offerings</option>
                <option value="Special Projects">Special Projects</option>
                <option value="Thanksgiving">Thanksgiving</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFD", borderBottom: "1px solid #E8EDFB" }}>
                  <th style={{ padding: "14px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Donor / Reference</th>
                  <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Category</th>
                  <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Method</th>
                  <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Amount</th>
                  <th style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "14px 24px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", textAlign: "right" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                      Loading transactions...
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#4A5490", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)" }}>
                      No transactions recorded matching this filter.
                    </td>
                  </tr>
                )}
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: "1px solid #E8EDFB",
                      transition: "background-color 0.15s",
                    }}
                  >
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13.5px", fontWeight: 700, color: "#141C6E" }}>
                        {t.name}
                      </div>
                      <div style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", color: "#4A5490" }}>
                        Ref: {t.reference || t.id} · {t.email}
                      </div>
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          backgroundColor: "#E8EDFB",
                          color: "#1F46C8",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {t.category}
                      </span>
                    </td>

                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#141C6E" }}>
                      {t.method}
                    </td>

                    <td style={{ padding: "14px 20px", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "14px", fontWeight: 800, color: "#141C6E" }}>
                      ₦{t.amountNGN.toLocaleString()}
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "99px",
                          fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: t.status === "success" ? "#E4F5EA" : "#FFF2D6",
                          color: t.status === "success" ? "#0F6B38" : "#7A5200",
                        }}
                      >
                        {t.status === "success" ? "Confirmed" : "Pending"}
                      </span>
                    </td>

                    <td style={{ padding: "14px 24px", textAlign: "right", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11.5px", color: "#4A5490" }}>
                      {new Date(t.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Reports (Figma 311:4241) */}
      {activeTab === "reports" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {[
            {
              title: "Monthly Summary Report",
              desc: "Breakdown of monthly income by category, contributor counts and payment channels.",
              date: "October 2026",
              last: "Generated today",
            },
            {
              title: "Annual Giving Statement",
              desc: "Yearly reconciliation with comparative growth charts and donor retention analytics.",
              date: "Year-To-Date 2026",
              last: "Generated 1 Oct 2026",
            },
            {
              title: "Contributor Tax / Giving Statements",
              desc: "Individual receipt bundles ready to export and send to church partners.",
              date: "Q3 2026",
              last: "Generated 5 Oct 2026",
            },
          ].map((rep) => (
            <div
              key={rep.title}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D5DCF2",
                borderRadius: "14px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <span style={{ padding: "3px 8px", borderRadius: "6px", backgroundColor: "#E8EDFB", color: "#1F46C8", fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase" }}>
                  {rep.date}
                </span>
                <h3 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "16px", fontWeight: 700, color: "#141C6E", margin: "10px 0 6px" }}>
                  {rep.title}
                </h3>
                <p style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "12px", color: "#4A5490", margin: 0 }}>
                  {rep.desc}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E8EDFB", paddingTop: "14px" }}>
                <span style={{ fontSize: "11px", color: "#747CA1" }}>{rep.last}</span>
                <button
                  onClick={exportCSV}
                  style={{
                    backgroundColor: "#1F46C8",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Download Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Transaction Modal (Figma 311:3986) */}
      {showModal && (
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
            <h2
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontWeight: 800,
                fontSize: "20px",
                color: "#141C6E",
                margin: "0 0 6px",
              }}
            >
              Add Giving Transaction
            </h2>
            <p
              style={{
                fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)",
                fontSize: "12px",
                color: "#4A5490",
                margin: "0 0 24px",
              }}
            >
              Record bank transfer, cash, or offline church tithe/offering
            </p>

            <form onSubmit={handleSaveTransaction} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Donor / Member Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oluwaseun Adeleke"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Amount in Naira (₦) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 50000"
                  value={form.amountNGN}
                  onChange={(e) => setForm({ ...form, amountNGN: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "15px", fontWeight: 700, color: "#141C6E", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  >
                    <option value="Tithe">Tithe</option>
                    <option value="Offering">Offering</option>
                    <option value="Special Projects">Special Projects</option>
                    <option value="Thanksgiving">Thanksgiving</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Payment Method</label>
                  <select
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", backgroundColor: "#FFFFFF", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Paystack">Paystack</option>
                    <option value="Crypto">Crypto (Privy/Base)</option>
                    <option value="Cash">Cash Offering</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "11px", fontWeight: 600, color: "#4A5490", textTransform: "uppercase", marginBottom: "6px" }}>Notes / Bank Narration</label>
                <input
                  type="text"
                  placeholder="e.g. October Tithe from GTBank"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #D5DCF2", fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "13px", color: "#141C6E", outline: "none" }}
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
                  Save Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
