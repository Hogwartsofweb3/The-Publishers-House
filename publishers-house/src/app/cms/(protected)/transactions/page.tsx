"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function TransactionsCMS() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/cms/transactions");
      if (!res.ok) throw new Error("Permission denied or server error");
      const data = await res.json();
      setTxs(data.transactions || []);
      setLastSync(new Date());
      setError("");
    } catch (e: any) {
      if (!silent) setError(e.message || "Failed to load transactions");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Initial load
    load(false);

    // 2. Real-time Firestore onSnapshot listener
    let unsubscribe: (() => void) | null = null;
    try {
      const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"), limit(100));
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            setTxs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setLastSync(new Date());
            setLoading(false);
          }
        },
        () => {
          // Fallback to polling
        }
      );
    } catch {
      // Fallback to polling
    }

    // 3. Fast 5s background poll
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        load(true);
      }
    }, 5000);

    // 4. Re-fetch immediately when window gains focus
    const onFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        load(true);
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [load]);

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <Link href="/cms" style={{ color: "#0140C1", textDecoration: "none", fontSize: "14px", fontFamily: "'Poppins', sans-serif" }}>← Back to Dashboard</Link>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "32px", color: "#151A54", margin: "8px 0 0" }}>Transactions</h1>
        </div>

        {/* Live Indicator & Quick Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#E6F4EA", padding: "6px 14px", borderRadius: "20px", border: "1px solid #CEEAD6" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#137333", boxShadow: "0 0 0 2px rgba(19, 115, 51, 0.2)" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#137333", fontFamily: "'Poppins', sans-serif" }}>
              Live Sync
            </span>
            <span style={{ fontSize: "11px", color: "#5F6368", marginLeft: "4px" }}>
              {lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>

          <button
            onClick={() => load(false)}
            title="Refresh now"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D3DAEC",
              borderRadius: "8px",
              padding: "7px 14px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#0140C1",
              cursor: "pointer",
              fontFamily: "'Poppins', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #D3DAEC", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#4A62A0", fontFamily: "'Poppins', sans-serif" }}>Loading transactions...</div>
        ) : error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#DC2626", fontFamily: "'Poppins', sans-serif" }}>Error: {error}</div>
        ) : txs.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#4A62A0", fontFamily: "'Poppins', sans-serif" }}>No transactions found yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Poppins', sans-serif", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F4F6FB", color: "#747CA1", borderBottom: "1px solid #D3DAEC" }}>
                <th style={{ padding: "16px 24px", fontWeight: 600 }}>Date</th>
                <th style={{ padding: "16px 24px", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "16px 24px", fontWeight: 600 }}>Email</th>
                <th style={{ padding: "16px 24px", fontWeight: 600 }}>Amount</th>
                <th style={{ padding: "16px 24px", fontWeight: 600 }}>Category</th>
                <th style={{ padding: "16px 24px", fontWeight: 600 }}>Method</th>
                <th style={{ padding: "16px 24px", fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid #E8ECF7" }}>
                  <td style={{ padding: "16px 24px", color: "#151A54" }}>
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: "16px 24px", color: "#151A54", fontWeight: 600 }}>{tx.name || "Anonymous"}</td>
                  <td style={{ padding: "16px 24px", color: "#4A62A0" }}>{tx.email || "-"}</td>
                  <td style={{ padding: "16px 24px", color: "#151A54", fontWeight: 700 }}>
                    NGN {Number(tx.amountNGN || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "16px 24px", color: "#4A62A0" }}>{tx.category}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      backgroundColor: "#E8ECF7", color: "#0140C1", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 500 
                    }}>
                      {(tx.method || "").toUpperCase()} {tx.network ? `(${tx.network})` : ""}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      backgroundColor: tx.status === "success" ? "#E6F4EA" : tx.status === "failed" ? "#FCE8E6" : "#FEF7E0", 
                       color: tx.status === "success" ? "#137333" : tx.status === "failed" ? "#C5221F" : "#B06000",
                      padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600, textTransform: "capitalize"
                    }}>
                      {tx.status === "success" ? "Confirmed" : tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
