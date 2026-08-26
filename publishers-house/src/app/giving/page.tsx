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

// GTB account details from Figma: #27:1806 Bank transfer panel
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

// Giving categories from Figma: #27:1782 Cats
const categories = ["Tithe", "Offering", "Special projects", "Thanksgiving"];

export default function GivingPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>

        {/* ══════════════════════════════════════════════════════════
            HERO — Figma: #27:1776 — layout_56aa83c5, navy+image bg
            "Your giving publishes the Word"
        ══════════════════════════════════════════════════════════ */}
        <section
          style={{
            background: "#151A54",
            padding: "90px 100px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div style={{ maxWidth: "1440px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "18px" }}>
            <h1 style={{ ...S.displayXL, color: "#FFFFFF", maxWidth: "1000px" }}>
              Your giving publishes the Word
            </h1>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            GIVE FORM — Figma: #27:1779
            padding 72px 100px 96px, center, bg Paper/300 (#D3DAEC)
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: "#D3DAEC" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "72px 100px 96px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "28px",
            }}
          >
            {/* Two-panel row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "40px",
                alignItems: "flex-start",
                flexWrap: "wrap" as const,
                width: "100%",
                justifyContent: "center",
              }}
            >
              {/* ── Give panel — Figma: #27:1780 ── */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "32px",
                  gap: "20px",
                  background: "#FFFFFF",
                  border: "1px solid #D3DAEC",
                  borderRadius: "4px",
                  width: "640px",
                  maxWidth: "100%",
                }}
              >
                <span style={{ ...S.eyebrow, color: "#0140C1" }}>Giving to</span>

                {/* Category tabs — Figma: Cats row with Tithe selected */}
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" as const, gap: "8px" }}>
                  {categories.map((cat, i) => (
                    <div
                      key={cat}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "64px",
                        padding: "0 20px",
                        background: i === 1 ? "#0140C1" : "#FFFFFF",
                        border: `1px solid ${i === 1 ? "#0140C1" : "#C0C9E0"}`,
                        borderRadius: "2px",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ ...S.label, color: i === 1 ? "#FFFFFF" : "#151A54" }}>{cat}</span>
                    </div>
                  ))}
                </div>

                {/* Why we ask — Figma: #27:1811 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h3 style={{ ...S.displayM, color: "#151A54" }}>Why we ask</h3>
                  <p style={{ ...S.readBody, color: "#4A62A0", maxWidth: "640px" }}>
                    Everything taught in this house is recorded, transcribed and published, and none of that is free. Your giving pays for the room, the recording, the transcription, and the conferences that carry the Word beyond Jos and into Abuja.
                  </p>
                  <span style={{ ...S.eyebrow, color: "#0140C1" }}>Where it goes</span>
                  <p style={{ ...S.readSmall, color: "#4A62A0", maxWidth: "640px" }}>
                    Weekly gatherings and venue · Recording, editing and transcription · Flagship conferences and camps · Outreach and benevolence
                  </p>
                </div>
              </div>

              {/* ── Bank transfer panel — Figma: #27:1806 ── */}
              <div
                id="bank-transfer"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "26px 28px",
                  gap: "20px",
                  background: "#E8ECF7",
                  borderRadius: "4px",
                  width: "640px",
                  maxWidth: "100%",
                }}
              >
                <span style={{ ...S.eyebrow, color: "#0140C1" }}>Prefer a bank transfer?</span>

                {/* GTB */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ ...S.label, color: "#151A54" }}>Guaranty Trust Bank (GTB)</span>
                    <p style={{ ...S.readSmall, color: "#4A62A0" }}>
                      Name: THE PUBLISHERS HOUSE MINISTRY<br />
                      Sort Code: 058-203312<br />
                      Swift Code: GTBINGLA<br />
                      Bank Address: Jos 1-Jengre Road
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {gtbAccounts.map((acc) => (
                      <div
                        key={acc.currency}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          background: "#FFFFFF",
                          border: "1px solid #D3DAEC",
                          borderRadius: "2px",
                        }}
                      >
                        <span style={{ ...S.label, color: "#4A62A0", width: "100px" }}>{acc.currency}</span>
                        <span
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 700,
                            fontSize: "17px",
                            lineHeight: "1.5em",
                            letterSpacing: "0.05em",
                            color: "#151A54",
                          }}
                        >
                          {acc.number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "#C0C9E0" }} />

                {/* Sterling Bank */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <span style={{ ...S.label, color: "#151A54" }}>Sterling Bank</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {sterlingAccounts.map((acc) => (
                      <div
                        key={acc.currency}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          background: "#FFFFFF",
                          border: "1px solid #D3DAEC",
                          borderRadius: "2px",
                        }}
                      >
                        <span style={{ ...S.label, color: "#4A62A0", flex: 1, fontSize: "9px" }}>{acc.currency}</span>
                        <span
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 700,
                            fontSize: "17px",
                            lineHeight: "1.5em",
                            letterSpacing: "0.05em",
                            color: "#151A54",
                          }}
                        >
                          {acc.number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Building project CTA */}
            <div
              style={{
                width: "100%",
                maxWidth: "1310px",
                background: "#151A54",
                borderRadius: "4px",
                padding: "40px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <span style={{ ...S.eyebrow, color: "#6496EF" }}>Our Building Project</span>
              <h3 style={{ ...S.displayM, color: "#FFFFFF" }}>Partner with us as we build</h3>
              <p style={{ ...S.readSmall, color: "#E8ECF7", maxWidth: "600px" }}>
                Use the Sterling Bank Projects Account (NAIRA: 0086985670) specifically for the building fund, or fill in our partnership form.
              </p>
              <a
                href="https://forms.gle/4Gimdh1WcUerMQvVA"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...S.button,
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 26px",
                  height: "48px",
                  background: "#2090FF",
                  border: "1px solid #2090FF",
                  borderRadius: "2px",
                  color: "#151A54",
                  textDecoration: "none",
                  alignSelf: "flex-start",
                }}
              >
                Fill partnership form
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
