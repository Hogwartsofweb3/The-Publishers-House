"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CopyableAccount from "@/components/CopyableAccount";

class GivingCryptoErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("Giving crypto error caught by page boundary:", error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const PrivyCryptoGiving = dynamic(() => import("@/components/PrivyCryptoGiving"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: "24px", textAlign: "center", color: "#4A62A0", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>
      Loading Web3 wallet provider...
    </div>
  ),
});

// Extend Window to include PaystackPop
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

const S = {
  eyebrow: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  label: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  scripture: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  button: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  displayXL: { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 58px)", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  displayM: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(20px, 3vw, 30px)", lineHeight: "1.14em", letterSpacing: "-0.015em", textTransform: "uppercase" as const },
  readSmall: { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
  readBody: { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "17px", lineHeight: "1.68em" },
};

// GTB account details
const gtbAccounts = [
  { currency: "NAIRA", number: "0869912273" },
  { currency: "DOLLAR", number: "0885570536" },
  { currency: "EUROS", number: "0885570550" },
  { currency: "POUNDS", number: "0885570543" },
];

const sterlingAccounts = [
  { currency: "NAIRA", number: "0082457106" },
  { currency: "DOLLAR", number: "0083163086" },
  { currency: "PROJECTS ACCOUNT (NAIRA)", number: "0086985670" },
];

const CHURCH_EVM_ADDRESS = "0x063F4fa58078f6c2F1cbCb0D9EA15962Af5BBDaE";
const CHURCH_SOL_ADDRESS = "54CnBrza7uivgHvXCa7ym9LNi9KLwxkXR1vT77mbBxVk";
const CHURCH_SUI_ADDRESS = "0xaaa4e6301a452139d1b93bd72dda49ddde76f64d253163a19c827f11b8cec63c";

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

export default function GivingPage() {
  const [category, setCategory] = useState("Tithe");
  const [frequency, setFrequency] = useState("Once");
  const [amount, setAmount] = useState<number | "other">(10000);
  const [otherAmount, setOtherAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"paystack" | "crypto">("paystack");
  const [cryptoNetwork, setCryptoNetwork] = useState<"EVM" | "SOL" | "SUI">("EVM");
  const [paystackReady, setPaystackReady] = useState(false);
  const [cryptoCopied, setCryptoCopied] = useState(false);
  const [loggingCrypto, setLoggingCrypto] = useState(false);
  const [cryptoLoggedMsg, setCryptoLoggedMsg] = useState("");

  // Dynamic CMS Giving Data
  const [liveSterling, setLiveSterling] = useState(sterlingAccounts);
  const [liveGtb, setLiveGtb] = useState(gtbAccounts);
  const [liveEvm, setLiveEvm] = useState(CHURCH_EVM_ADDRESS);
  const [liveSol, setLiveSol] = useState(CHURCH_SOL_ADDRESS);
  const [liveSui, setLiveSui] = useState(CHURCH_SUI_ADDRESS);
  const [categories, setCategories] = useState(["Tithe", "Offering", "Special Projects", "Thanksgiving"]);
  const [accountName, setAccountName] = useState("THE PUBLISHERS HOUSE MINISTRY");

  useEffect(() => {
    fetch("/api/cms/giving")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          if (data.sterlingAccounts?.length) setLiveSterling(data.sterlingAccounts);
          if (data.gtbAccounts?.length) setLiveGtb(data.gtbAccounts);
          if (data.evmAddress) setLiveEvm(data.evmAddress);
          if (data.solAddress) setLiveSol(data.solAddress);
          if (data.suiAddress) setLiveSui(data.suiAddress);
          if (data.categories?.length) setCategories(data.categories);
          if (data.accountName) setAccountName(data.accountName);
        }
      })
      .catch(() => {});
  }, []);

  const amounts = [5000, 10000, 25000];

  const displayAmount = amount === "other" ? (Number(otherAmount) || 0) : amount;

  const currentCryptoAddress =
    cryptoNetwork === "SOL"
      ? liveSol
      : cryptoNetwork === "SUI"
      ? liveSui
      : liveEvm;

  const currentCryptoLabel =
    cryptoNetwork === "SOL"
      ? "Send SOL or USDC (Solana Network) to:"
      : cryptoNetwork === "SUI"
      ? "Send SUI or USDC (SUI Network) to:"
      : "Send ETH, USDT, or USDC (Ethereum, Base, Arbitrum) to:";

  const handleCopyCrypto = () => {
    navigator.clipboard.writeText(currentCryptoAddress);
    setCryptoCopied(true);
    setTimeout(() => setCryptoCopied(false), 2500);
  };

  const handleLogCrypto = async () => {
    if (displayAmount < 100) {
      alert("Please enter a valid amount equivalent (min ₦100).");
      return;
    }
    setLoggingCrypto(true);
    try {
      const res = await fetch("/api/crypto-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Anonymous",
          email: email || "No Email",
          amountNGN: displayAmount,
          category,
          network: cryptoNetwork,
        }),
      });
      if (res.ok) {
        setCryptoLoggedMsg("Thank you! Your gift record has been submitted to the treasury.");
      } else {
        setCryptoLoggedMsg("Record submitted. Thank you for your partnership!");
      }
    } catch {
      setCryptoLoggedMsg("Record received. Thank you for giving!");
    } finally {
      setLoggingCrypto(false);
      setTimeout(() => setCryptoLoggedMsg(""), 6000);
    }
  };

  const handlePaystackPayment = () => {
    if (!email) {
      alert("Please enter your email address to proceed with card payment.");
      return;
    }
    if (displayAmount < 100) {
      alert("Please enter a valid amount (minimum ₦100).");
      return;
    }
    if (!PAYSTACK_PUBLIC_KEY) {
      alert("Card payments are not configured yet. Please try another method.");
      return;
    }
    if (!paystackReady || !window.PaystackPop) {
      alert("Payment system is still loading. Please try again in a moment.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: displayAmount * 100, // Paystack uses kobo
      currency: "NGN",
      ref: `tph_${Date.now()}`,
      metadata: {
        name: name || "Anonymous",
        category,
        frequency,
      },
      callback: (response) => {
        alert(`Payment successful! Thank you for giving. Reference: ${response.reference}`);
        setName("");
        setEmail("");
        setOtherAmount("");
      },
      onClose: () => {
        // user closed the modal without paying
      },
    });

    handler.openIframe();
  };

  return (
    <>
      {/* Load Paystack inline JS — no npm package needed */}
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="lazyOnload"
        onLoad={() => setPaystackReady(true)}
      />

      <Navbar />
      <main style={{ paddingTop: "70px", background: "#F4F6FB" }}>
        {/* HERO SECTION */}
        <section
          className="tph-hero"
          style={{ borderBottom: "none", position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/giving-bg.webp')", backgroundSize: "cover", backgroundPosition: "center 25%", zIndex: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(21, 26, 84, 0.78) 0%, rgba(1, 64, 193, 0.58) 100%)", zIndex: 1 }} />

          <div style={{ position: "relative", zIndex: 2, maxWidth: "1440px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ ...S.scripture, color: "#D3DAEC" }}>2 Corinthians 9:7</span>
            <h1 style={{ ...S.displayXL, color: "#FFFFFF", maxWidth: "1000px" }}>
              Your giving publishes the Word
            </h1>
          </div>
        </section>

        {/* CONTENT SECTION */}
        <section style={{ position: "relative", zIndex: 3 }}>
          <div className="tph-giving-row">
            {/* ── Give panel — Interactive Form ── */}
            <div
              className="tph-giving-form"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "48px",
                background: "#FFFFFF",
                boxShadow: "0px 12px 32px rgba(21, 26, 84, 0.08)",
                borderRadius: "4px",
                border: "1px solid #E8ECF7",
              }}
            >
              <span style={{ ...S.eyebrow, color: "#0140C1", marginBottom: "16px" }}>Giving to</span>

              {/* Category tabs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "24px" }}>
                {categories.map((c) => (
                  <div
                    key={c}
                    onClick={() => setCategory(c)}
                    style={{
                      minHeight: "48px", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "center",
                      background: category === c ? "#0140C1" : "transparent",
                      border: category === c ? "1px solid #0140C1" : "1px solid #D3DAEC",
                      borderRadius: "2px",
                      color: category === c ? "#FFFFFF" : "#151A54",
                      cursor: "pointer",
                      textAlign: "center",
                      ...S.label,
                    }}
                  >
                    {c}
                  </div>
                ))}
              </div>

              {/* Frequency tabs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", marginBottom: "24px", width: "240px" }}>
                <div onClick={() => setFrequency("Once")} style={{ height: "40px", display: "flex", alignItems: "center", justifyContent: "center", background: frequency === "Once" ? "#151A54" : "#FFFFFF", border: "1px solid #151A54", borderRadius: "2px 0 0 2px", color: frequency === "Once" ? "#FFFFFF" : "#151A54", cursor: "pointer", ...S.label, fontSize: "9px" }}>Give Once</div>
                <div onClick={() => setFrequency("Monthly")} style={{ height: "40px", display: "flex", alignItems: "center", justifyContent: "center", background: frequency === "Monthly" ? "#151A54" : "#FFFFFF", border: "1px solid #151A54", borderLeft: "none", borderRadius: "0 2px 2px 0", color: frequency === "Monthly" ? "#FFFFFF" : "#151A54", cursor: "pointer", ...S.label, fontSize: "9px" }}>Give Monthly</div>
              </div>

              {/* Amounts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "32px" }}>
                {amounts.map(a => (
                  <div
                    key={a}
                    onClick={() => setAmount(a)}
                    style={{
                      height: "48px", display: "flex", alignItems: "center", justifyContent: "center",
                      background: amount === a ? "#151A54" : "transparent",
                      border: amount === a ? "1px solid #151A54" : "1px solid #D3DAEC",
                      borderRadius: "2px",
                      color: amount === a ? "#FFFFFF" : "#151A54",
                      cursor: "pointer",
                      ...S.label,
                    }}
                  >
                    ₦{a.toLocaleString()}
                  </div>
                ))}
                <div
                  onClick={() => setAmount("other")}
                  style={{
                    height: "48px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: amount === "other" ? "#151A54" : "transparent",
                    border: amount === "other" ? "1px solid #151A54" : "1px solid #D3DAEC",
                    borderRadius: "2px",
                    color: amount === "other" ? "#FFFFFF" : "#151A54",
                    cursor: "pointer",
                    ...S.label,
                  }}
                >
                  Other
                </div>
              </div>

              {amount === "other" && (
                <div style={{ marginBottom: "32px" }}>
                  <input type="number" placeholder="Enter amount (₦)..." value={otherAmount} onChange={e => setOtherAmount(e.target.value)} style={{ height: "48px", padding: "0 16px", border: "1px solid #D3DAEC", borderRadius: "2px", fontFamily: "'Playfair Display', serif", fontSize: "16px", outline: "none", width: "100%" }} />
                </div>
              )}

              {/* Inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ ...S.eyebrow, color: "#4A62A0" }}>Full Name</span>
                  <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} style={{ height: "48px", padding: "0 16px", border: "1px solid #D3DAEC", borderRadius: "2px", fontFamily: "'Playfair Display', serif", fontSize: "16px", outline: "none", width: "100%" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ ...S.eyebrow, color: "#4A62A0" }}>Email Address</span>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ height: "48px", padding: "0 16px", border: "1px solid #D3DAEC", borderRadius: "2px", fontFamily: "'Playfair Display', serif", fontSize: "16px", outline: "none", width: "100%" }} />
                  <span style={{ ...S.readSmall, color: "#4A62A0", fontSize: "12px", marginTop: "4px" }}>We send your receipt here. Nothing else, unless you ask.</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <span style={{ ...S.eyebrow, color: "#0140C1", marginBottom: "16px", display: "block" }}>Select Payment Method</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "24px" }}>
                <div onClick={() => setMethod("paystack")} style={{ padding: "12px 8px", border: method === "paystack" ? "2px solid #0140C1" : "1px solid #D3DAEC", borderRadius: "4px", textAlign: "center", cursor: "pointer", ...S.label }}>
                  Paystack<br /><span style={{ fontSize: "9px", color: "#4A62A0", textTransform: "none", fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>Card / Bank Transfer</span>
                </div>
                <div onClick={() => setMethod("crypto")} style={{ padding: "12px 8px", border: method === "crypto" ? "2px solid #0140C1" : "1px solid #D3DAEC", borderRadius: "4px", textAlign: "center", cursor: "pointer", ...S.label }}>
                  Crypto<br /><span style={{ fontSize: "9px", color: "#4A62A0", textTransform: "none", fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>USDT / ETH / SOL</span>
                </div>
              </div>

              {method === "crypto" && (
                <>
                  <span style={{ ...S.eyebrow, color: "#4A62A0", marginBottom: "12px", display: "block" }}>Select Crypto Network</span>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                    <div
                      onClick={() => setCryptoNetwork("EVM")}
                      style={{
                        flex: 1,
                        padding: "10px 8px",
                        border: cryptoNetwork === "EVM" ? "2px solid #0140C1" : "1px solid #D3DAEC",
                        background: cryptoNetwork === "EVM" ? "#E8ECF7" : "transparent",
                        borderRadius: "4px",
                        textAlign: "center",
                        cursor: "pointer",
                        ...S.label,
                        fontSize: "10px",
                        color: cryptoNetwork === "EVM" ? "#0140C1" : "#151A54",
                      }}
                    >
                      Ethereum / Base
                    </div>
                    <div
                      onClick={() => setCryptoNetwork("SOL")}
                      style={{
                        flex: 1,
                        padding: "10px 8px",
                        border: cryptoNetwork === "SOL" ? "2px solid #0140C1" : "1px solid #D3DAEC",
                        background: cryptoNetwork === "SOL" ? "#E8ECF7" : "transparent",
                        borderRadius: "4px",
                        textAlign: "center",
                        cursor: "pointer",
                        ...S.label,
                        fontSize: "10px",
                        color: cryptoNetwork === "SOL" ? "#0140C1" : "#151A54",
                      }}
                    >
                      Solana
                    </div>
                    <div
                      onClick={() => setCryptoNetwork("SUI")}
                      style={{
                        flex: 1,
                        padding: "10px 8px",
                        border: cryptoNetwork === "SUI" ? "2px solid #0140C1" : "1px solid #D3DAEC",
                        background: cryptoNetwork === "SUI" ? "#E8ECF7" : "transparent",
                        borderRadius: "4px",
                        textAlign: "center",
                        cursor: "pointer",
                        ...S.label,
                        fontSize: "10px",
                        color: cryptoNetwork === "SUI" ? "#0140C1" : "#151A54",
                      }}
                    >
                      SUI
                    </div>
                  </div>

                  {cryptoNetwork === "EVM" ? (
                    <GivingCryptoErrorBoundary
                      fallback={
                        <>
                          <div style={{ padding: "20px", background: "#F4F6FB", border: "1px solid #D3DAEC", borderRadius: "6px", marginBottom: "16px" }}>
                            <span style={{ ...S.eyebrow, color: "#4A62A0", display: "block", marginBottom: "10px" }}>
                              Ethereum / Base / Arbitrum (EVM)
                            </span>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              <code style={{ fontSize: "12px", color: "#151A54", wordBreak: "break-all", fontFamily: "monospace", background: "#FFFFFF", padding: "12px", borderRadius: "4px", border: "1px solid #E8ECF7", lineHeight: "1.5" }}>
                                {CHURCH_EVM_ADDRESS}
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(CHURCH_EVM_ADDRESS);
                                  setCryptoCopied(true);
                                  setTimeout(() => setCryptoCopied(false), 2500);
                                }}
                                style={{
                                  padding: "8px 16px",
                                  background: cryptoCopied ? "#16A34A" : "#0140C1",
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  ...S.label,
                                  fontSize: "10px",
                                  letterSpacing: "0.14em",
                                  transition: "all 0.2s",
                                  alignSelf: "flex-start",
                                }}
                              >
                                {cryptoCopied ? "ADDRESS COPIED! ✓" : "COPY EVM ADDRESS"}
                              </button>
                            </div>
                            <p style={{ ...S.readSmall, color: "#747CA1", fontSize: "11px", margin: "12px 0 0" }}>
                              ⚠️ Please verify the network before sending to avoid token loss.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleLogCrypto}
                            disabled={loggingCrypto}
                            style={{
                              ...S.button,
                              width: "100%",
                              height: "46px",
                              background: "transparent",
                              border: "1px solid #0140C1",
                              borderRadius: "2px",
                              color: "#0140C1",
                              cursor: loggingCrypto ? "not-allowed" : "pointer",
                              marginBottom: "16px",
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = "#0140C1";
                              e.currentTarget.style.color = "#FFFFFF";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "#0140C1";
                            }}
                          >
                            {loggingCrypto ? "Recording..." : "I've Transferred — Confirm Giving"}
                          </button>
                        </>
                      }
                    >
                      <PrivyCryptoGiving
                        displayAmount={displayAmount}
                        name={name}
                        email={email}
                        category={category}
                        churchAddress={CHURCH_EVM_ADDRESS}
                      />
                    </GivingCryptoErrorBoundary>
                  ) : (
                    <>
                      <div style={{ padding: "20px", background: "#F4F6FB", border: "1px solid #D3DAEC", borderRadius: "6px", marginBottom: "16px" }}>
                        <span style={{ ...S.eyebrow, color: "#4A62A0", display: "block", marginBottom: "10px" }}>
                          {currentCryptoLabel}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <code style={{ fontSize: "12px", color: "#151A54", wordBreak: "break-all", fontFamily: "monospace", background: "#FFFFFF", padding: "12px", borderRadius: "4px", border: "1px solid #E8ECF7", lineHeight: "1.5" }}>
                            {currentCryptoAddress}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyCrypto}
                            style={{
                              padding: "8px 16px",
                              background: cryptoCopied ? "#16A34A" : "#0140C1",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              ...S.label,
                              fontSize: "10px",
                              letterSpacing: "0.14em",
                              transition: "all 0.2s",
                              alignSelf: "flex-start",
                            }}
                          >
                            {cryptoCopied ? "ADDRESS COPIED! ✓" : "COPY ADDRESS"}
                          </button>
                        </div>
                        <p style={{ ...S.readSmall, color: "#747CA1", fontSize: "11px", margin: "12px 0 0" }}>
                          ⚠️ Please verify the network before sending to avoid token loss.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleLogCrypto}
                        disabled={loggingCrypto}
                        style={{
                          ...S.button,
                          width: "100%",
                          height: "46px",
                          background: "transparent",
                          border: "1px solid #0140C1",
                          borderRadius: "2px",
                          color: "#0140C1",
                          cursor: loggingCrypto ? "not-allowed" : "pointer",
                          marginBottom: "16px",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "#0140C1";
                          e.currentTarget.style.color = "#FFFFFF";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#0140C1";
                        }}
                      >
                        {loggingCrypto ? "RECORDING GIFT..." : "I'VE TRANSFERRED MY CRYPTO GIFT"}
                      </button>

                      {cryptoLoggedMsg && (
                        <div style={{ padding: "10px 14px", background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: "4px", color: "#166534", fontSize: "12px", fontFamily: "'Poppins', sans-serif", marginBottom: "16px", textAlign: "center" }}>
                          {cryptoLoggedMsg}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {method === "paystack" && (
                <button
                  type="button"
                  onClick={handlePaystackPayment}
                  style={{
                    ...S.button,
                    width: "100%",
                    height: "52px",
                    background: "#0140C1",
                    border: "none",
                    borderRadius: "2px",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    marginBottom: "16px",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#013091")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "#0140C1")}
                >
                  Give ₦{displayAmount.toLocaleString()}
                </button>
              )}

              <span style={{ ...S.readSmall, color: "#4A62A0", fontSize: "12px", textAlign: "center" }}>
                Secured by {method === "paystack" ? "Paystack" : "Blockchain"}
              </span>
            </div>

            {/* ── Bank transfer panel ── */}
            <div
              id="bank-transfer"
              className="tph-giving-bank"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "48px",
                gap: "20px",
                background: "#E8ECF7",
                borderRadius: "4px",
                width: "500px",
                maxWidth: "100%",
              }}
            >
              <span style={{ ...S.eyebrow, color: "#0140C1", marginBottom: "8px" }}>Prefer a bank transfer?</span>

              {/* GTB */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <p style={{ ...S.readSmall, color: "#4A62A0", margin: 0, textTransform: "uppercase" }}>
                    Guaranty Trust Bank<br />
                    Name: {accountName}<br />
                    Sort Code: 058-203312<br />
                    Swift Code: GTBINGLA<br />
                    Bank Address: Jos 1-Jengre Road
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {liveGtb.map((acc) => (
                    <CopyableAccount key={acc.currency + acc.number} currency={acc.currency} number={acc.number} />
                  ))}
                </div>
              </div>

              {/* Sterling Bank */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                <p style={{ ...S.readSmall, color: "#4A62A0", margin: 0, textTransform: "uppercase" }}>Sterling Bank</p>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {liveSterling.map((acc) => (
                    <CopyableAccount key={acc.currency + acc.number} currency={acc.currency} number={acc.number} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
