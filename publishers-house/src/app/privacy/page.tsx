import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | The Publishers House",
  description:
    "How The Publishers House collects, handles, stores, and protects your personal information, membership records, and online giving.",
};

const Navy = "#151A54";
const Blue700 = "#0140C1";
const Blue500 = "#2090FF";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const Paper100 = "#F4F6FB";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const White = "#FFFFFF";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px", backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
        
        {/* Hero Section with Mid-Blue Overlay */}
        <section
          style={{
            position: "relative",
            backgroundColor: Navy,
            padding: "80px 24px",
            overflow: "hidden",
            borderBottom: "4px solid #2090FF",
          }}
        >
          {/* Subtle Background Pattern / Ambient Glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(21, 26, 84, 0.90) 0%, rgba(1, 64, 193, 0.65) 100%)",
              zIndex: 1,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: "840px",
              margin: "0 auto",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
            }}
          >
            {/* Breadcrumb */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#A9C2FF",
              }}
            >
              <Link href="/" style={{ color: "#FFFFFF", textDecoration: "none" }}>
                Home
              </Link>
              <span>/</span>
              <span>Legal</span>
              <span>/</span>
              <span style={{ color: Blue500 }}>Privacy Policy</span>
            </div>

            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(32px, 5vw, 48px)",
                color: White,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                margin: 0,
                lineHeight: "1.05em",
              }}
            >
              Privacy Policy
            </h1>

            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "17px",
                color: "rgba(255, 255, 255, 0.9)",
                maxWidth: "620px",
                margin: 0,
                lineHeight: "1.55em",
              }}
            >
              How The Publishers House protects your personal data, membership records, and financial contributions in faithful stewardship.
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#E2E8F0",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: "8px",
              }}
            >
              <span>Effective Date: October 2026</span>
              <span>•</span>
              <span>Jos Headquarters, Nigeria</span>
            </div>
          </div>
        </section>

        {/* Legal Document Content */}
        <section style={{ padding: "64px 24px 100px", maxWidth: "840px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            
            {/* Section 1: Who We Are */}
            <div style={{ paddingBottom: "32px", borderBottom: `1px solid ${Paper200}` }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: Blue700, marginBottom: "8px" }}>
                Section 1
              </div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "24px", color: Navy, margin: "0 0 16px" }}>
                Who We Are
              </h2>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17.5px", lineHeight: "1.8em", color: Slate600, margin: "0 0 16px" }}>
                <strong>The Publishers House</strong> (&ldquo;TPH&rdquo;, &ldquo;the Ministry&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is an apostolic Christian ministry founded under the leadership of Dr. Joshua Agunbiade. Our divine mandate is rooted in Psalm 68:11 &mdash; <em>&ldquo;The Lord gave the word: great was the company of those that published it.&rdquo;</em>
              </p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17.5px", lineHeight: "1.8em", color: Slate600, margin: 0 }}>
                This Privacy Policy explains how we collect, handle, store, and protect your personal information when you visit our website, utilize the Admin & Member Portal, give tithes and offerings online, attend physical gatherings in Jos or Abuja, or access our apostolic study curricula.
              </p>
            </div>

            {/* Section 2: What Personal Data We Collect & Why */}
            <div style={{ paddingBottom: "32px", borderBottom: `1px solid ${Paper200}` }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: Blue700, marginBottom: "8px" }}>
                Section 2
              </div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "24px", color: Navy, margin: "0 0 20px" }}>
                What Personal Data We Collect & Why
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ backgroundColor: Paper100, border: `1px solid ${Paper300}`, borderRadius: "8px", padding: "20px" }}>
                  <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "15px", color: Navy, margin: "0 0 8px" }}>
                    1. Tithes, Offerings & Financial Transactions
                  </h3>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", lineHeight: "1.7em", color: Slate600, margin: "0 0 10px" }}>
                    <strong>Card & Bank Transfers (Paystack):</strong> We collect your name, email address, transaction reference, amount, and designated giving category (e.g. Tithe, Offering, Building Project, Festival of Light). We <strong>never store credit card numbers or bank CVVs</strong>; all transactions are processed through PCI-DSS certified gateways (Paystack).
                  </p>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", lineHeight: "1.7em", color: Slate600, margin: 0 }}>
                    <strong>Cryptocurrency Donations (Privy / Web3):</strong> We log your public wallet address and transaction hash for donor attribution and transparency. Private keys are never accessed or stored.
                  </p>
                </div>

                <div style={{ backgroundColor: Paper100, border: `1px solid ${Paper300}`, borderRadius: "8px", padding: "20px" }}>
                  <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "15px", color: Navy, margin: "0 0 8px" }}>
                    2. Member Portal & Church Directory
                  </h3>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", lineHeight: "1.7em", color: Slate600, margin: 0 }}>
                    When an administrator creates an account for you or you sign in to the Member Portal, we record your full name, email address, phone number, campus location (Jos Headquarters or Abuja Campus), assigned ministry unit (e.g. Media, Ushering, Worship), and spiritual track progression. Credentials are encrypted via Google Firebase Authentication. Passwords are salted, hashed, and inaccessible even to ministry administrators.
                  </p>
                </div>

                <div style={{ backgroundColor: Paper100, border: `1px solid ${Paper300}`, borderRadius: "8px", padding: "20px" }}>
                  <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "15px", color: Navy, margin: "0 0 8px" }}>
                    3. Sunday & Midweek Service Attendance Check-In
                  </h3>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", lineHeight: "1.7em", color: Slate600, margin: 0 }}>
                    When you check in at our physical sanctuaries or register as a first-timer, our ushers and registration teams record your contact name, phone number, and attendance status to support pastoral care, hospitality follow-up, and church administrative records.
                  </p>
                </div>

                <div style={{ backgroundColor: Paper100, border: `1px solid ${Paper300}`, borderRadius: "8px", padding: "20px" }}>
                  <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "15px", color: Navy, margin: "0 0 8px" }}>
                    4. Prayer Requests & Testimonies
                  </h3>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", lineHeight: "1.7em", color: Slate600, margin: "0 0 10px" }}>
                    <strong>Private Pastoral Care Requests:</strong> Shared exclusively with Reverend Joshua Agunbiade and authorized ministerial elders. They remain strictly confidential.
                  </p>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", lineHeight: "1.7em", color: Slate600, margin: 0 }}>
                    <strong>Public Testimonies:</strong> Only published on the website or read during services if you have explicitly selected permission to share.
                  </p>
                </div>

                <div style={{ backgroundColor: Paper100, border: `1px solid ${Paper300}`, borderRadius: "8px", padding: "20px" }}>
                  <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "15px", color: Navy, margin: "0 0 8px" }}>
                    5. Embedded Content & Media
                  </h3>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", lineHeight: "1.7em", color: Slate600, margin: 0 }}>
                    Teachings and audio broadcasts on this website may include embedded streams from YouTube, Mixlr, and Cloudflare. Interacting with embedded media behaves identically to visiting those third-party platforms directly, and they may collect data in accordance with their respective privacy policies.
                  </p>
                </div>

                <div style={{ backgroundColor: Paper100, border: `1px solid ${Paper300}`, borderRadius: "8px", padding: "20px" }}>
                  <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "15px", color: Navy, margin: "0 0 8px" }}>
                    6. Website Analytics
                  </h3>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", lineHeight: "1.7em", color: Slate600, margin: 0 }}>
                    We utilize privacy-respecting, anonymized telemetry (Google Analytics / Vercel Web Analytics) to understand which teachings and curriculum tracks are ministering to believers most. We do not sell, rent, or monetize your browsing history with third-party advertisers.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: How We Protect Your Data */}
            <div style={{ paddingBottom: "32px", borderBottom: `1px solid ${Paper200}` }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: Blue700, marginBottom: "8px" }}>
                Section 3
              </div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "24px", color: Navy, margin: "0 0 16px" }}>
                How We Protect Your Data
              </h2>
              <ul style={{ paddingLeft: "24px", fontFamily: "'Playfair Display', serif", fontSize: "17px", lineHeight: "1.8em", color: Slate600, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <li>All web transmissions are encrypted end-to-end via 256-bit Secure Socket Layer (SSL/TLS).</li>
                <li>Database records in Google Firestore utilize strict server-side role-based access rules. Only authenticated leadership can access ministerial and membership records.</li>
                <li>We never sell, rent, or exchange member rosters with external commercial third parties.</li>
                <li>Administrative access requires multi-factor authenticated pastoral credentials.</li>
              </ul>
            </div>

            {/* Section 4: Your Rights Over Your Data */}
            <div style={{ paddingBottom: "32px", borderBottom: `1px solid ${Paper200}` }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: Blue700, marginBottom: "8px" }}>
                Section 4
              </div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "24px", color: Navy, margin: "0 0 16px" }}>
                Your Rights Over Your Data
              </h2>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17.5px", lineHeight: "1.8em", color: Slate600, margin: "0 0 16px" }}>
                If you have an account on the TPH Portal or have submitted records:
              </p>
              <ul style={{ paddingLeft: "24px", fontFamily: "'Playfair Display', serif", fontSize: "17px", lineHeight: "1.8em", color: Slate600, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <li>You may request an exported copy of the personal information we hold about you.</li>
                <li>You may request the correction of inaccurate contact numbers or postal addresses.</li>
                <li>You may request the deletion of your portal account and attendance records by contacting our administrative team.</li>
              </ul>
            </div>

            {/* Section 5: Contacting Us */}
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: Blue700, marginBottom: "8px" }}>
                Section 5
              </div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "24px", color: Navy, margin: "0 0 16px" }}>
                Contacting Us
              </h2>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17.5px", lineHeight: "1.8em", color: Slate600, margin: "0 0 24px" }}>
                For any questions regarding this Privacy Policy, your personal data, or data protection practices:
              </p>

              <div style={{ backgroundColor: Paper100, border: `1px solid ${Paper300}`, borderRadius: "8px", padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                <div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: Slate500, marginBottom: "4px" }}>
                    Email Correspondence
                  </div>
                  <a href="mailto:privacy@thepublishershouse.org" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: 600, color: Blue700, textDecoration: "none" }}>
                    privacy@thepublishershouse.org
                  </a>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: Slate500, marginTop: "2px" }}>
                    or thepublishershouse007@gmail.com
                  </div>
                </div>

                <div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: Slate500, marginBottom: "4px" }}>
                    Church Secretariat
                  </div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: 600, color: Navy }}>
                    +234 813 063 5386
                  </div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: Slate500, marginTop: "2px" }}>
                    Monday – Friday · 9am to 5pm WAT
                  </div>
                </div>

                <div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: Slate500, marginBottom: "4px" }}>
                    Physical Sanctuary
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", color: Navy, lineHeight: "1.4em" }}>
                    The House of Bread, Korinjoh House, British, Jos, Plateau State, Nigeria
                  </div>
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
