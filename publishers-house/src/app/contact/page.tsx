import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Shared style constants (Figma Design Tokens)
const S = {
  // Colors
  Navy: "#151A54",
  Slate600: "#4A62A0",
  Blue500: "#2090FF",
  Blue700: "#0140C1",
  Blue300: "#6496EF",
  Paper100: "#F4F6FB",
  Paper200: "#E8ECF7",
  Paper300: "#D3DAEC",
  Paper400: "#C0C9E0",
  Slate500: "#747CA1",
  Slate400: "#99AFC6",
  White: "#FFFFFF",
  
  // Typography
  DisplayXL: { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "72px", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  DisplayL: { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "48px", lineHeight: "1.04em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  DisplayM: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "30px", lineHeight: "1.14em", letterSpacing: "-0.015em", textTransform: "uppercase" as const },
  DisplayS: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "21px", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  Epigraph: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontStyle: "italic", fontSize: "30px", lineHeight: "1.3em" },
  ReadLede: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
  ReadBody: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "17px", lineHeight: "1.68em" },
  ReadSmall: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
  UIEyebrow: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  UILabel: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  UIScripture: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  UIButton: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  UIColophon: { fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  UIData: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "14px", lineHeight: "1.5em", letterSpacing: "0.02em" },

  // Layout
  SectionPad: "96px 100px",
  Button: { height: "48px", padding: "0 26px", borderRadius: "2px", display: "inline-flex", alignItems: "center", justifyContent: "center" },
};

export default function ContactPage() {
  return (
    <div style={{ backgroundColor: S.Paper100, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section
          style={{
            padding: "88px 100px",
            backgroundColor: S.Navy,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Placeholder Background Image (Figma imageRef: 545014ab...) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: S.Navy, // Fallback
              opacity: 0.8,
              zIndex: 0
            }}
          />
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ ...S.UIEyebrow, color: S.Blue500 }}>Contact</div>
            <h1 style={{ ...S.DisplayXL, color: S.White }}>Contact us</h1>
          </div>
        </section>

        {/* Contact Content */}
        <section
          style={{
            padding: S.SectionPad,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            alignItems: "start",
          }}
        >
          {/* Left Column: Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px 24px" }}>
              
              {/* WhatsApp */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ ...S.UIEyebrow, color: S.Slate500 }}>WhatsApp</div>
                <div style={{ ...S.ReadBody, color: S.Navy }}>+234 816 797 6888</div>
              </div>

              {/* Phone */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ ...S.UIEyebrow, color: S.Slate500 }}>Phone</div>
                <div style={{ ...S.ReadBody, color: S.Navy }}>+234 816 797 6888</div>
              </div>

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ ...S.UIEyebrow, color: S.Slate500 }}>Email</div>
                <div style={{ ...S.ReadBody, color: S.Navy }}>thepublishershouse1@gmail.com</div>
              </div>

              {/* Address */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ ...S.UIEyebrow, color: S.Slate500 }}>Address</div>
                <div style={{ ...S.ReadBody, color: S.Navy }}>
                  The House of Bread, Korinjoh House<br/>
                  Opp. Sharwama & Grills, British<br/>
                  Jos, Plateau, Nigeria
                </div>
              </div>

              {/* Services */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ ...S.UIEyebrow, color: S.Slate500 }}>Services (Jos)</div>
                <div style={{ ...S.ReadBody, color: S.Navy }}>
                  Sundays 8:00am & 9:00am<br/>
                  Thursdays 4:30pm
                </div>
              </div>

              {/* Abuja */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ ...S.UIEyebrow, color: S.Slate500 }}>Abuja Outreach</div>
                <div style={{ ...S.ReadBody, color: S.Navy }}>
                  First two weeks of every month
                </div>
              </div>
            </div>

            <a
              href="https://api.whatsapp.com/send?phone=2347061959833"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...S.Button,
                ...S.UIButton,
                color: S.Navy,
                border: `1px solid ${S.Paper300}`,
                alignSelf: "flex-start",
                textDecoration: "none"
              }}
            >
              Message us on WhatsApp
            </a>

            {/* Static Map Image Placeholder */}
            <div
              style={{
                width: "100%",
                height: "200px",
                backgroundColor: S.Paper200,
                border: `1px solid ${S.Paper300}`,
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                textAlign: "center"
              }}
            >
              <span style={{ ...S.UIEyebrow, color: S.Slate500 }}>
                Map image. Interactive embed loads on tap.
              </span>
            </div>
          </div>

          {/* Right Column: Message form */}
          <div
            style={{
              padding: "48px",
              backgroundColor: S.White,
              border: `1px solid ${S.Paper300}`,
              borderRadius: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "24px"
            }}
          >
            <h2 style={{ ...S.DisplayM, color: S.Navy }}>Send a message</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Field */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ ...S.UILabel, color: S.Slate600 }}>What is this about?</label>
                <div style={{
                  padding: "16px",
                  border: `1px solid ${S.Paper300}`,
                  borderRadius: "2px",
                  ...S.ReadSmall,
                  color: S.Slate600,
                  backgroundColor: S.Paper100
                }}>
                  General enquiry
                </div>
              </div>

              {/* Field */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ ...S.UILabel, color: S.Slate600 }}>Your name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  style={{
                    padding: "16px",
                    border: `1px solid ${S.Paper300}`,
                    borderRadius: "2px",
                    ...S.ReadSmall,
                    color: S.Navy,
                    backgroundColor: S.White,
                    outline: "none"
                  }}
                />
              </div>

              {/* Field */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ ...S.UILabel, color: S.Slate600 }}>Email address</label>
                <input 
                  type="email" 
                  placeholder="john@example.com"
                  style={{
                    padding: "16px",
                    border: `1px solid ${S.Paper300}`,
                    borderRadius: "2px",
                    ...S.ReadSmall,
                    color: S.Navy,
                    backgroundColor: S.White,
                    outline: "none"
                  }}
                />
              </div>

              {/* Field */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ ...S.UILabel, color: S.Slate600 }}>Message</label>
                <textarea 
                  placeholder="How can we help?"
                  rows={5}
                  style={{
                    padding: "16px",
                    border: `1px solid ${S.Paper300}`,
                    borderRadius: "2px",
                    ...S.ReadSmall,
                    color: S.Navy,
                    backgroundColor: S.White,
                    resize: "none",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            <button
              style={{
                ...S.Button,
                ...S.UIButton,
                color: S.White,
                backgroundColor: S.Blue700,
                border: "none",
                alignSelf: "flex-start",
                cursor: "pointer"
              }}
            >
              Send message
            </button>
            <div style={{ ...S.ReadSmall, color: S.Slate500, marginTop: "8px" }}>
              We usually reply within 48 hours.
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
