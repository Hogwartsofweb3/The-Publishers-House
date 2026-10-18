"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DEFAULT_GIVING_DATA } from "@/app/api/cms/giving/route";

const S = {
  Navy: "#151A54",
  Blue700: "#0140C1",
  Blue500: "#2090FF",
  Paper100: "#F4F6FB",
  Paper200: "#E8ECF7",
  Paper300: "#D3DAEC",
  White: "#FFFFFF",
  Slate500: "#747CA1",
  Slate600: "#4A62A0",
  Red: "#DC2626",
  Green: "#16A34A",
  label: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: "6px",
    color: "#4A62A0",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #D3DAEC",
    borderRadius: "4px",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13px",
    outline: "none",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box" as const,
  },
  btn: (bg: string, color: string) => ({
    padding: "8px 18px",
    backgroundColor: bg,
    color,
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
  }),
};

export default function GivingEditor() {
  const [data, setData] = useState({ ...DEFAULT_GIVING_DATA });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/cms/giving")
      .then((r) => r.json())
      .then((res) => {
        if (res) setData({ ...DEFAULT_GIVING_DATA, ...res });
      })
      .catch((e) => console.error("Error loading giving details:", e))
      .finally(() => setFetching(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/cms/giving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save giving settings");
      setMsg("Bank accounts and donation settings saved successfully ✓");
      setTimeout(() => setMsg(""), 3500);
    } catch (err: any) {
      setMsg("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSterling = (index: number, field: string, val: string) => {
    const next = [...data.sterlingAccounts];
    next[index] = { ...next[index], [field]: val };
    setData({ ...data, sterlingAccounts: next });
  };

  const addSterling = () => {
    setData({
      ...data,
      sterlingAccounts: [...data.sterlingAccounts, { currency: "NAIRA", number: "", label: "Account Purpose" }],
    });
  };

  const removeSterling = (index: number) => {
    setData({
      ...data,
      sterlingAccounts: data.sterlingAccounts.filter((_, i) => i !== index),
    });
  };

  const updateGtb = (index: number, field: string, val: string) => {
    const next = [...data.gtbAccounts];
    next[index] = { ...next[index], [field]: val };
    setData({ ...data, gtbAccounts: next });
  };

  const addGtb = () => {
    setData({
      ...data,
      gtbAccounts: [...data.gtbAccounts, { currency: "NAIRA", number: "", label: "Account Purpose" }],
    });
  };

  const removeGtb = (index: number) => {
    setData({
      ...data,
      gtbAccounts: data.gtbAccounts.filter((_, i) => i !== index),
    });
  };

  if (fetching) {
    return <div style={{ padding: "40px", textAlign: "center", fontFamily: "'Poppins', sans-serif" }}>Loading giving configuration...</div>;
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/cms" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: S.Blue700, textDecoration: "none", display: "block", marginBottom: "24px" }}>
        ← Dashboard
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", color: S.Navy, margin: 0 }}>
            Giving & Bank Accounts Editor
          </h1>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: S.Slate600, marginTop: "6px" }}>
            Update official church bank accounts, crypto wallets, and giving categories.
          </p>
        </div>
        {msg && <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: msg.includes("Error") ? S.Red : S.Green, fontWeight: 700 }}>{msg}</span>}
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* General Account Details */}
        <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "28px" }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "17px", color: S.Navy, marginTop: 0, marginBottom: "16px" }}>
            Official Account Name
          </h2>
          <div>
            <label style={S.label}>Beneficiary Account Name</label>
            <input
              style={S.input}
              value={data.accountName}
              onChange={(e) => setData({ ...data, accountName: e.target.value })}
              placeholder="The Publishers House"
            />
          </div>
        </div>

        {/* Sterling Bank Accounts */}
        <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "17px", color: S.Navy, margin: 0 }}>
              Sterling Bank Accounts
            </h2>
            <button type="button" onClick={addSterling} style={S.btn(S.Paper200, S.Navy)}>+ Add Account</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.sterlingAccounts.map((acc, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr auto", gap: "12px", alignItems: "center" }}>
                <div>
                  <label style={S.label}>Currency / Type</label>
                  <input style={S.input} value={acc.currency} onChange={(e) => updateSterling(i, "currency", e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Account Number</label>
                  <input style={S.input} value={acc.number} onChange={(e) => updateSterling(i, "number", e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Label / Purpose</label>
                  <input style={S.input} value={acc.label || ""} onChange={(e) => updateSterling(i, "label", e.target.value)} />
                </div>
                <div style={{ paddingTop: "20px" }}>
                  <button type="button" onClick={() => removeSterling(i)} style={S.btn("#FEE2E2", S.Red)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GTBank Accounts */}
        <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "17px", color: S.Navy, margin: 0 }}>
              Guaranty Trust Bank (GTBank) Accounts
            </h2>
            <button type="button" onClick={addGtb} style={S.btn(S.Paper200, S.Navy)}>+ Add Account</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.gtbAccounts.map((acc, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr auto", gap: "12px", alignItems: "center" }}>
                <div>
                  <label style={S.label}>Currency / Type</label>
                  <input style={S.input} value={acc.currency} onChange={(e) => updateGtb(i, "currency", e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Account Number</label>
                  <input style={S.input} value={acc.number} onChange={(e) => updateGtb(i, "number", e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Label / Purpose</label>
                  <input style={S.input} value={acc.label || ""} onChange={(e) => updateGtb(i, "label", e.target.value)} />
                </div>
                <div style={{ paddingTop: "20px" }}>
                  <button type="button" onClick={() => removeGtb(i)} style={S.btn("#FEE2E2", S.Red)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crypto Wallet Addresses (Privy Church Account) */}
        <div style={{ backgroundColor: S.White, border: `1px solid ${S.Paper300}`, borderRadius: "8px", padding: "28px" }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "17px", color: S.Navy, marginTop: 0, marginBottom: "8px" }}>
            Crypto Donation Wallet Addresses (Privy Church Account)
          </h2>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", color: S.Slate500, margin: "0 0 20px" }}>
            These addresses receive tithes and offerings in SOL, ETH, USDT, USDC, and SUI.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={S.label}>Solana (SOL / SPL Tokens)</label>
              <input
                style={{ ...S.input, fontFamily: "monospace" }}
                value={data.solAddress}
                onChange={(e) => setData({ ...data, solAddress: e.target.value })}
                placeholder="54CnBrza7uivgHvXCa7ym9LNi9KLwxkXR1vT77mbBxVk"
              />
            </div>

            <div>
              <label style={S.label}>Ethereum & EVM Chains (ETH, Arbitrum, Base, USDT/USDC)</label>
              <input
                style={{ ...S.input, fontFamily: "monospace" }}
                value={data.evmAddress}
                onChange={(e) => setData({ ...data, evmAddress: e.target.value })}
                placeholder="0x063F4fa58078f6c2F1cbCb0D9EA15962Af5BBDaE"
              />
            </div>

            <div>
              <label style={S.label}>Sui Network (SUI)</label>
              <input
                style={{ ...S.input, fontFamily: "monospace" }}
                value={data.suiAddress}
                onChange={(e) => setData({ ...data, suiAddress: e.target.value })}
                placeholder="0xaaa4e6301a452139d1b93bd72dda49ddde76f64d253163a19c827f11b8cec63c"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button type="submit" disabled={loading} style={{ ...S.btn(S.Blue700, S.White), padding: "14px 28px", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Saving..." : "Save Giving & Bank Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
