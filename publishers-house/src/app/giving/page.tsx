"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CopyableAccount from "@/components/CopyableAccount";
import { usePrivy, useSendTransaction } from "@privy-io/react-auth";

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

export default function GivingPage() {
  const { login, authenticated } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  
  const [category, setCategory] = useState("Tithe");
  const [frequency, setFrequency] = useState("Once");
  const [amount, setAmount] = useState<number | "other">(10000);
  const [otherAmount, setOtherAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"paystack" | "flutterwave" | "crypto">("paystack");
  const [cryptoNetwork, setCryptoNetwork] = useState<"EVM" | "SOL" | "SUI">("EVM");

  const categories = ["Tithe", "Offering", "Special Projects", "Thanksgiving"];
  const amounts = [5000, 10000, 25000];

  const displayAmount = amount === "other" ? (Number(otherAmount) || 0) : amount;

  const handleGive = async () => {
    if (method === "crypto") {
      if (cryptoNetwork === "EVM") {
        if (!authenticated) {
          login();
        } else {
          try {
            const usdAmount = displayAmount / 1600;
            const ethAmount = usdAmount / 3000;
            const weiAmount = BigInt(Math.floor(ethAmount * 10**18));
            
            const txRes = await sendTransaction({
              to: CHURCH_EVM_ADDRESS,
              value: `0x${weiAmount.toString(16)}`,
            });
            
            try {
              const { saveTransaction } = await import("@/lib/firebase");
              await saveTransaction({
                name: name || "Anonymous",
                email: email || "No Email",
                amountNGN: displayAmount,
                category,
                method: "crypto",
                network: "EVM",
                status: "success",
                timestamp: new Date().toISOString()
              });
            } catch (err) {
              console.error("Failed to log transaction:", err);
            }

            alert("Crypto transfer initiated successfully! Thank you for your giving.");
          } catch (e: any) {
            console.error(e);
            alert("Transaction failed or was canceled.");
          }
        }
      } else {
        // For SOL and SUI, the user copies the address (handled in UI)
      }
    } else {
      alert(`Ready to integrate ${method}! Need API keys.`);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px", background: "#F4F6FB" }}>
        {/* HERO SECTION */}
        <section
          className="tph-hero"
          style={{
            borderBottom: "4px solid #2090FF",
          }}
        >
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/giving-hero-v2.jpg')", backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(21,26,84,0.85)", zIndex: 1 }} />
          
          <div style={{ position: "relative", zIndex: 2, maxWidth: "1440px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ ...S.scripture, color: "#D3DAEC" }}>2 Corinthians 9:7</span>
            <h1 style={{ ...S.displayXL, color: "#FFFFFF", maxWidth: "1000px" }}>
              Your giving publishes the Word
            </h1>
          </div>
        </section>

        {/* CONTENT SECTION */}
        <section style={{ position: "relative", zIndex: 3 }}>
          <div
            className="tph-giving-row"
            style={{
            }}
          >
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
                      height: "48px", display: "flex", alignItems: "center", justifyContent: "center", 
                      background: category === c ? "#0140C1" : "transparent",
                      border: category === c ? "1px solid #0140C1" : "1px solid #D3DAEC", 
                      borderRadius: "2px", 
                      color: category === c ? "#FFFFFF" : "#151A54", 
                      cursor: "pointer",
                      ...S.label 
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
                      ...S.label 
                    }}
                  >
                    N{a.toLocaleString()}
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
                    ...S.label 
                  }}
                >
                  Other
                </div>
              </div>
              
              {amount === "other" && (
                <div style={{ marginBottom: "32px" }}>
                   <input type="number" placeholder="Enter amount..." value={otherAmount} onChange={e => setOtherAmount(e.target.value)} style={{ height: "48px", padding: "0 16px", border: "1px solid #D3DAEC", borderRadius: "2px", fontFamily: "'Playfair Display', serif", fontSize: "16px", outline: "none", width: "100%" }} />
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
              <span style={{ ...S.eyebrow, color: "#0140C1", marginBottom: "16px" }}>Select Payment Method</span>
              <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                 <div onClick={() => setMethod("paystack")} style={{ flex: 1, padding: "12px", border: method === "paystack" ? "2px solid #0140C1" : "1px solid #D3DAEC", borderRadius: "4px", textAlign: "center", cursor: "pointer", ...S.label }}>Paystack<br/><span style={{fontSize: "9px", color: "#4A62A0", textTransform: "none"}}>Card / Naira</span></div>
                 <div onClick={() => setMethod("flutterwave")} style={{ flex: 1, padding: "12px", border: method === "flutterwave" ? "2px solid #0140C1" : "1px solid #D3DAEC", borderRadius: "4px", textAlign: "center", cursor: "pointer", ...S.label }}>Flutterwave<br/><span style={{fontSize: "9px", color: "#4A62A0", textTransform: "none"}}>International</span></div>
                 <div onClick={() => setMethod("crypto")} style={{ flex: 1, padding: "12px", border: method === "crypto" ? "2px solid #0140C1" : "1px solid #D3DAEC", borderRadius: "4px", textAlign: "center", cursor: "pointer", ...S.label }}>Crypto<br/><span style={{fontSize: "9px", color: "#4A62A0", textTransform: "none"}}>USDT / ETH / SOL</span></div>
              </div>

              {method === "crypto" && (
                <>
                  <span style={{ ...S.eyebrow, color: "#4A62A0", marginBottom: "16px" }}>Select Crypto Network</span>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                    <div onClick={() => setCryptoNetwork("EVM")} style={{ flex: 1, padding: "8px", border: cryptoNetwork === "EVM" ? "2px solid #151A54" : "1px solid #D3DAEC", borderRadius: "4px", textAlign: "center", cursor: "pointer", ...S.label, fontSize: "10px" }}>Ethereum / Base</div>
                    <div onClick={() => setCryptoNetwork("SOL")} style={{ flex: 1, padding: "8px", border: cryptoNetwork === "SOL" ? "2px solid #151A54" : "1px solid #D3DAEC", borderRadius: "4px", textAlign: "center", cursor: "pointer", ...S.label, fontSize: "10px" }}>Solana</div>
                    <div onClick={() => setCryptoNetwork("SUI")} style={{ flex: 1, padding: "8px", border: cryptoNetwork === "SUI" ? "2px solid #151A54" : "1px solid #D3DAEC", borderRadius: "4px", textAlign: "center", cursor: "pointer", ...S.label, fontSize: "10px" }}>SUI</div>
                  </div>
                </>
              )}

              {method === "crypto" && cryptoNetwork !== "EVM" ? (
                <div style={{ padding: "16px", background: "#F4F6FB", border: "1px solid #D3DAEC", borderRadius: "4px", marginBottom: "16px" }}>
                  <span style={{ ...S.eyebrow, color: "#4A62A0", display: "block", marginBottom: "8px" }}>Send {cryptoNetwork === "SOL" ? "SOL / USDC" : "SUI"} to this address:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <code style={{ flex: 1, fontSize: "12px", color: "#151A54", wordBreak: "break-all", fontFamily: "monospace" }}>
                      {cryptoNetwork === "SOL" ? CHURCH_SOL_ADDRESS : CHURCH_SUI_ADDRESS}
                    </code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(cryptoNetwork === "SOL" ? CHURCH_SOL_ADDRESS : CHURCH_SUI_ADDRESS);
                        alert("Address copied!");
                      }}
                      style={{ padding: "6px 12px", background: "#0140C1", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", ...S.label, fontSize: "9px", margin: 0 }}
                    >
                      COPY
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleGive}
                  style={{
                    ...S.button,
                    width: "100%",
                    height: "48px",
                    background: "#0140C1",
                    border: "none",
                    borderRadius: "2px",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    marginBottom: "16px",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "#013091"}
                  onMouseOut={(e) => e.currentTarget.style.background = "#0140C1"}
                >
                  {method === "crypto" && cryptoNetwork === "EVM" ? (authenticated ? "Transfer Crypto via Privy" : "Connect Wallet & Give") : `Give N${displayAmount.toLocaleString()}`}
                </button>
              )}
              
              <span style={{ ...S.readSmall, color: "#4A62A0", fontSize: "12px", textAlign: "center" }}>
                Secured by {method === "paystack" ? "Paystack" : method === "flutterwave" ? "Flutterwave" : "Blockchain"}
              </span>
            </div>

            {/* ── Bank transfer panel ── */}
            <div
              id="bank-transfer"
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
                    Name: THE PUBLISHERS HOUSE MINISTRY<br />
                    Sort Code: 058-203312<br />
                    Swift Code: GTBINGLA<br />
                    Bank Address: Jos 1-Jengre Road
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {gtbAccounts.map((acc) => (
                    <CopyableAccount key={acc.currency} currency={acc.currency} number={acc.number} />
                  ))}
                </div>
              </div>

              {/* Sterling Bank */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                <p style={{ ...S.readSmall, color: "#4A62A0", margin: 0, textTransform: "uppercase" }}>Sterling Bank</p>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {sterlingAccounts.map((acc) => (
                    <CopyableAccount key={acc.currency} currency={acc.currency} number={acc.number} />
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
