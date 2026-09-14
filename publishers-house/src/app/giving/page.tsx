import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Giving | The Publishers House",
  description:
    "Your giving publishes the Word. Support The Publishers House through tithe, offering, or bank transfer.",
};

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

import CopyableAccount from "@/components/CopyableAccount";

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

export default function GivingPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px", background: "#F4F6FB" }}>
        {/* HERO SECTION */}
        <section
          style={{
            position: "relative",
            padding: "100px 100px 160px",
            borderBottom: "4px solid #2090FF",
          }}
        >
          {/* Background image & overlay */}
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
        <section style={{ position: "relative", zIndex: 3, marginTop: "-80px", paddingBottom: "100px" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "0 100px",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: "40px",
              flexWrap: "wrap" as const,
            }}
          >
            {/* ── Give panel — Mockup Form ── */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "48px",
                background: "#FFFFFF",
                boxShadow: "0px 12px 32px rgba(21, 26, 84, 0.08)",
                borderRadius: "4px",
                width: "600px",
                maxWidth: "100%",
                border: "1px solid #E8ECF7",
              }}
            >
              <span style={{ ...S.eyebrow, color: "#0140C1", marginBottom: "16px" }}>Giving to</span>

              {/* Category tabs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "24px" }}>
                <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #D3DAEC", borderRadius: "2px", color: "#151A54", ...S.label }}>Tithe</div>
                <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center", background: "#0140C1", border: "1px solid #0140C1", borderRadius: "2px", color: "#FFFFFF", ...S.label }}>Offering</div>
                <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #D3DAEC", borderRadius: "2px", color: "#151A54", ...S.label }}>Special Projects</div>
                <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #D3DAEC", borderRadius: "2px", color: "#151A54", ...S.label }}>Thanksgiving</div>
              </div>

              {/* Frequency tabs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", marginBottom: "24px", width: "240px" }}>
                <div style={{ height: "40px", display: "flex", alignItems: "center", justifyContent: "center", background: "#151A54", border: "1px solid #151A54", borderRadius: "2px 0 0 2px", color: "#FFFFFF", ...S.label, fontSize: "9px" }}>Give Once</div>
                <div style={{ height: "40px", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF", border: "1px solid #151A54", borderLeft: "none", borderRadius: "0 2px 2px 0", color: "#151A54", ...S.label, fontSize: "9px" }}>Give Monthly</div>
              </div>

              {/* Amounts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "32px" }}>
                <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #D3DAEC", borderRadius: "2px", color: "#151A54", ...S.label }}>N5,000</div>
                <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center", background: "#151A54", border: "1px solid #151A54", borderRadius: "2px", color: "#FFFFFF", ...S.label }}>N10,000</div>
                <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #D3DAEC", borderRadius: "2px", color: "#151A54", ...S.label }}>N25,000</div>
                <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #D3DAEC", borderRadius: "2px", color: "#151A54", ...S.label }}>Other</div>
              </div>

              {/* Inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ ...S.eyebrow, color: "#4A62A0" }}>Full Name</span>
                  <input type="text" placeholder="Your name" style={{ height: "48px", padding: "0 16px", border: "1px solid #D3DAEC", borderRadius: "2px", fontFamily: "'Playfair Display', serif", fontSize: "16px", outline: "none", width: "100%" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ ...S.eyebrow, color: "#4A62A0" }}>Email Address</span>
                  <input type="email" placeholder="you@example.com" style={{ height: "48px", padding: "0 16px", border: "1px solid #D3DAEC", borderRadius: "2px", fontFamily: "'Playfair Display', serif", fontSize: "16px", outline: "none", width: "100%" }} />
                  <span style={{ ...S.readSmall, color: "#4A62A0", fontSize: "12px", marginTop: "4px" }}>We send your receipt here. Nothing else, unless you ask.</span>
                </div>
              </div>

              <button
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
                }}
              >
                Give N10,000
              </button>
              
              <span style={{ ...S.readSmall, color: "#4A62A0", fontSize: "12px", textAlign: "center" }}>
                Card, bank transfer, USSD or wallet. Secured by Paystack.
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
