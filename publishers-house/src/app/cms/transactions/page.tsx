"use client";

import { useEffect, useState } from "react";
import { getTransactions, type Transaction } from "@/lib/firebase";
import Link from "next/link";

export default function TransactionsCMS() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getTransactions(100);
      setTxs(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <Link href="/cms" style={{ color: "#0140C1", textDecoration: "none", fontSize: "14px", fontFamily: "'Poppins', sans-serif" }}>← Back to Dashboard</Link>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "32px", color: "#151A54", margin: "8px 0 0" }}>Transactions</h1>
        </div>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #D3DAEC", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#4A62A0", fontFamily: "'Poppins', sans-serif" }}>Loading transactions...</div>
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
                  <td style={{ padding: "16px 24px", color: "#151A54" }}>{tx.name || "Anonymous"}</td>
                  <td style={{ padding: "16px 24px", color: "#4A62A0" }}>{tx.email || "-"}</td>
                  <td style={{ padding: "16px 24px", color: "#151A54", fontWeight: 600 }}>
                    NGN {tx.amountNGN.toLocaleString()}
                  </td>
                  <td style={{ padding: "16px 24px", color: "#4A62A0" }}>{tx.category}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      backgroundColor: "#E8ECF7", color: "#0140C1", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 500 
                    }}>
                      {tx.method.toUpperCase()} {tx.network ? `(${tx.network})` : ""}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      backgroundColor: tx.status === "success" ? "#E6F4EA" : tx.status === "failed" ? "#FCE8E6" : "#FEF7E0", 
                      color: tx.status === "success" ? "#137333" : tx.status === "failed" ? "#C5221F" : "#B06000",
                      padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 500, textTransform: "capitalize"
                    }}>
                      {tx.status}
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
