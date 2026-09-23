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

      <main style={{ flex: 1, backgroundColor: S.Paper100, paddingTop: "70px" }}>
        {/* Hero */}
        <section
          className="tph-hero"
          style={{
            position: "relative",
            overflow: "hidden",
            borderBottom: "none"
          }}
        >
          {/* Background Image */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/images/contact-hero-v2.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: 0
            }}
          />
          {/* Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(21, 26, 84, 0.85)",
              zIndex: 1
            }}
          />
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "16px", maxWidth: "1440px", margin: "0 auto" }}>
            <div style={{ ...S.UIEyebrow, color: S.Paper300 }}>Get In Touch</div>
            <h1 style={{ ...S.DisplayXL, color: S.White }}>Contact Us</h1>
            <p style={{ ...S.ReadBody, color: S.Paper200, margin: 0, maxWidth: "600px" }}>
              Most people arriving here want a phone number, not a form. The details come first.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section
          className="tph-section"
          style={{ background: "#FFFFFF" }}
        >
          <div className="tph-inner">
          <div className="tph-two-col">
          {/* Left Column: Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* WhatsApp */}
              <div style={{ display: "flex", flexDirection: "row", padding: "16px 0", borderBottom: `1px solid ${S.Paper200}`, alignItems: "flex-start", gap: "12px" }}>
                <div style={{ ...S.UIEyebrow, color: S.Slate500, width: "100px", minWidth: "100px", flexShrink: 0 }}>WhatsApp</div>
                <a href="https://api.whatsapp.com/send?phone=2348167976888&text=Hi%2C%20I%20want%20to%20reach%20the%20WhatsApp%20representative%20of%20The%20Publishers%20House." target="_blank" rel="noopener noreferrer" style={{ ...S.ReadBody, color: S.Navy, textDecoration: "underline", wordBreak: "break-word" }}>wa.link/xr46nk</a>
              </div>
              
              {/* Phone */}
              <div style={{ display: "flex", flexDirection: "row", padding: "16px 0", borderBottom: `1px solid ${S.Paper200}`, alignItems: "flex-start", gap: "12px" }}>
                <div style={{ ...S.UIEyebrow, color: S.Slate500, width: "100px", minWidth: "100px", flexShrink: 0 }}>Phone</div>
                <a href="tel:+2348167976888" style={{ ...S.ReadBody, color: S.Navy, textDecoration: "none" }}>+234 816 797 6888</a>
              </div>

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "row", padding: "16px 0", borderBottom: `1px solid ${S.Paper200}`, alignItems: "flex-start", gap: "12px" }}>
                <div style={{ ...S.UIEyebrow, color: S.Slate500, width: "100px", minWidth: "100px", flexShrink: 0 }}>Email</div>
                <a href="mailto:thepublishershouse1@gmail.com" style={{ ...S.ReadBody, color: S.Navy, textDecoration: "underline", wordBreak: "break-all" }}>thepublishershouse1@gmail.com</a>
              </div>

              {/* Address */}
              <div style={{ display: "flex", flexDirection: "row", padding: "16px 0", borderBottom: `1px solid ${S.Paper200}`, alignItems: "flex-start", gap: "12px" }}>
                <div style={{ ...S.UIEyebrow, color: S.Slate500, width: "100px", minWidth: "100px", flexShrink: 0 }}>Address</div>
                <div style={{ ...S.ReadBody, color: S.Navy }}>The House of Bread, Korinjoh House, British, Jos, Plateau State</div>
              </div>

              {/* Services */}
              <div style={{ display: "flex", flexDirection: "row", padding: "16px 0", borderBottom: `1px solid ${S.Paper200}`, alignItems: "flex-start", gap: "12px" }}>
                <div style={{ ...S.UIEyebrow, color: S.Slate500, width: "100px", minWidth: "100px", flexShrink: 0 }}>Services</div>
                <div style={{ ...S.ReadBody, color: S.Navy }}>
                  Sunday 9:00 AM WAT<br />
                  Thursday 5:00 PM WAT
                </div>
              </div>

              {/* Abuja */}
              <div style={{ display: "flex", flexDirection: "row", padding: "16px 0", borderBottom: `1px solid ${S.Paper200}`, alignItems: "flex-start", gap: "12px" }}>
                <div style={{ ...S.UIEyebrow, color: S.Slate500, width: "100px", minWidth: "100px", flexShrink: 0 }}>Abuja</div>
                <div style={{ ...S.ReadBody, color: S.Navy }}>Abuja Apostolic Camp, monthly. Venue to be supplied.</div>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Korinjoh+House+British+Jos+Plateau+State+Nigeria"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...S.Button,
                ...S.UIButton,
                color: S.White,
                backgroundColor: S.Blue700,
                border: "none",
                alignSelf: "flex-start",
                cursor: "pointer",
                marginTop: "8px",
                textDecoration: "none",
              }}
            >
              Open in Maps
            </a>

            {/* Static Map — clicking opens Google Maps */}
            <a
              href="https://maps.google.com/?q=Korinjoh+House+British+Jos+Plateau+State+Nigeria"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", marginTop: "16px", borderRadius: "4px", overflow: "hidden", border: `1px solid ${S.Paper300}` }}
            >
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=Jos,Plateau+State,Nigeria&zoom=14&size=600x240&markers=color:blue%7CJos,Plateau+State,Nigeria&key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY`}
                alt="Map showing The Publishers House location"
                style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }}
              />
            </a>
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
              gap: "24px",
              boxShadow: "0px 12px 32px rgba(21, 26, 84, 0.04)"
            }}
          >
            <h2 style={{ ...S.DisplayM, color: S.Navy }}>Send a message</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Field: Full Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ ...S.UILabel, color: S.Slate600 }}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="Your name"
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

              {/* Field: Email Address */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ ...S.UILabel, color: S.Slate600 }}>Email address</label>
                <input 
                  type="email" 
                  placeholder="you@example.com"
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

              {/* Field: What is this about */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ ...S.UILabel, color: S.Slate600 }}>What is this about?</label>
                <input 
                  type="text" 
                  placeholder="Planning a first visit"
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

              {/* Field: Message */}
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
                width: "100%",
                cursor: "pointer",
                marginTop: "8px"
              }}
            >
              Send message
            </button>
            <div style={{ ...S.ReadSmall, color: S.Slate500, marginTop: "8px", textAlign: "center", fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <span>We reply within two working days.</span>
              <span>NB: Your message can be a prayer request, a testimony, an enquiry.<br/>You're free to share anything at all.</span>
            </div>
          </div>
          </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
