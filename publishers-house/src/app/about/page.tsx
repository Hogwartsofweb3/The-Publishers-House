import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About | The Publishers House",
  description:
    "An apostolic and scriptural ministry committed to proclaiming the unchanging truth of God's Word to every sphere of society.",
};

// Figma text styles (same tokens as homepage)
const S = {
  eyebrow: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  scripture: { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  displayXL: { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 58px)", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  displayL: { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 48px)", lineHeight: "1.04em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  displayM: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(20px, 3vw, 30px)", lineHeight: "1.14em", letterSpacing: "-0.015em", textTransform: "uppercase" as const },
  displayS: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(16px, 2.5vw, 21px)", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  readLede: { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
  readSmall: { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
  readBody: { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "17px", lineHeight: "1.68em" },
};

// Beliefs from Figma: EL-31:4406 Beliefs section
const beliefs = [
  {
    title: "The Scriptures",
    body: "We hold the sixty-six books of the Old and New Testaments to be the inspired Word of God, entirely trustworthy, and the final authority for what the church believes and how it lives.",
    scripture: "2 Timothy 3:16",
  },
  {
    title: "The Trinity",
    body: "We firmly believe in one God who has revealed Himself as a Trinity of persons.",
    scripture: "Matthew 28:19",
  },
  {
    title: "The Holy Spirit",
    body: "We believe the Spirit is at work now, illuminating Scripture, sanctifying the believer and empowering the church for witness, and that His gifts have not been withdrawn.",
    scripture: "1 Corinthians 12:7",
  },
  {
    title: "The Church and the Apostolic Mandate",
    body: "We confess one holy, catholic and apostolic church, gathered by the gospel and sent to publish it, and we hold that the ascension gifts are given for the equipping of the saints.",
    scripture: "Ephesians 4:11-12",
  },
  {
    title: "The Believer as Publisher",
    body: "Every believer carries a commission to publish the Word, in speech and in life, across nations, cultures, industries and generations.",
    scripture: "Psalm 68:11",
  },
];

// Leadership from Figma: EL-31:4426 Leadership section
const leadership = [
  {
    name: "Dr. Joshua Agunbiade",
    role: "Lead Pastor",
    placeholder: "#151A54",
  },
  {
    name: "Pastor Damilare",
    role: "Pastor",
    placeholder: "#1B2168",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>

        {/* ══════════════════════════════════════════════════════════
            HERO — Figma: #31:4363 — layout_56aa83c5, navy+image bg
            "About the Publishers House"
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
            {/* UI/Scripture */}
            <span style={{ ...S.scripture, color: "#D3DAEC" }}>Psalm 68:11</span>

            {/* Display/XL headline */}
            <h1 style={{ ...S.displayXL, color: "#FFFFFF", maxWidth: "1000px" }}>
              About the Publishers House
            </h1>

            {/* Read/Lede */}
            <p style={{ ...S.readLede, color: "#E8ECF7", maxWidth: "760px" }}>
              An apostolic and scriptural ministry committed to proclaiming the unchanging truth of God&apos;s Word to every sphere of society.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            STORY — Figma: #31:4367 — EL-cdaacbb3
            padding 96px 100px, bg Paper/300 (#D3DAEC)
            Two-column: margin notes + body text
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: "#D3DAEC" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "96px 100px",
              display: "flex",
              flexDirection: "column",
              gap: "40px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "56px",
                flexWrap: "wrap" as const,
              }}
            >
              {/* Left margin column — Figma: #31:4369 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "180px", flexShrink: 0 }}>
                <span style={{ ...S.eyebrow, color: "#0140C1" }}>Who we are</span>
                <p style={{ ...S.readSmall, color: "#4A62A0" }}>
                  Established 2020 · Jos, Plateau State · Other branches all over Nigeria
                </p>
              </div>

              {/* Body text — Figma: #31:4372 */}
              <div style={{ flex: 1, maxWidth: "760px" }}>
                <p style={{ ...S.readBody, color: "#151A54" }}>
                  The Publishers House was established in 2020 under the leadership of Dr. Joshua Agunbiade.
                  <br /><br />
                  The ministry exists to equip believers, strengthen the Church, and advance the Kingdom of God through biblical teaching, discipleship, prayer and Christian apologetics.
                  <br /><br />
                  Inspired by Psalm 68:11, we believe that every believer is commissioned to become a publisher of God&apos;s message, declaring His truth with conviction, excellence and global impact.
                  <br /><br />
                  From Jos, Nigeria, the ministry is raising a company of believers whose lives become living publications of Christ.
                  <br /><br />
                  We are given to much prayer, immersed in the word of God and passionate searchers of God&apos;s presence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            WHAT TO EXPECT — Figma: #31:4379 — EL-8f527725
            padding 96px 100px, bg #E8ECF7
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: "#E8ECF7" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "96px 100px",
              display: "flex",
              flexDirection: "column",
              gap: "32px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ ...S.eyebrow, color: "#0140C1" }}>Planning your visit</span>
              <h2 style={{ ...S.displayL, color: "#151A54" }}>What to expect</h2>
            </div>

            {/* Row 1 */}
            <div style={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: "wrap" as const }}>
              {[
                {
                  title: "When we meet",
                  body: "Sunday worship at 9:00 AM. Midweek teaching service Thursday at 5:00 PM. Both run to roughly two hours.",
                },
                {
                  title: "Where to find us",
                  body: "The House of Bread, Korinjoh House, British, Jos. There is parking on the compound.",
                },
                {
                  title: "What to wear",
                  body: "Come as you are, and comfortably dressed as well. You will see everything from traditional dress to jeans, and nobody is counting. All we encourage is modesty.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "22px",
                    gap: "8px",
                    background: "#FFFFFF",
                    border: "1px solid #D3DAEC",
                    borderRadius: "4px",
                    flex: 1,
                    minWidth: "240px",
                    minHeight: "143px",
                  }}
                >
                  <span style={{ ...S.displayS, color: "#151A54" }}>{item.title}</span>
                  <p style={{ ...S.readSmall, color: "#4A62A0" }}>{item.body}</p>
                </div>
              ))}
            </div>

            {/* Row 2 */}
            <div style={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: "wrap" as const }}>
              {[
                {
                  title: "Bring your Bible",
                  body: "This is a teaching ministry. Most people arrive with a Bible and a notebook, and you will want both.",
                },
                {
                  title: "Children",
                  body: "Children are welcome in the service. We do not currently run a separate children's programme during the main service.",
                },
                {
                  title: "Will I be singled out?",
                  body: "No. First-time visitors are not asked to stand, raise hands or do anything that draws attention to them. Come and settle in.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "22px",
                    gap: "8px",
                    background: "#FFFFFF",
                    border: "1px solid #D3DAEC",
                    borderRadius: "4px",
                    flex: 1,
                    minWidth: "240px",
                  }}
                >
                  <span style={{ ...S.displayS, color: "#151A54" }}>{item.title}</span>
                  <p style={{ ...S.readSmall, color: "#4A62A0" }}>{item.body}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" as const }}>
              <Link
                href="/contact"
                style={{
                  fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px",
                  lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase",
                  display: "inline-flex", alignItems: "center", padding: "0 26px", height: "48px",
                  background: "#0140C1", border: "1px solid #0140C1", borderRadius: "2px",
                  color: "#FFFFFF", textDecoration: "none",
                }}
              >
                Plan your visit
              </Link>
              <a
                href="https://api.whatsapp.com/send?phone=2347061959833"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px",
                  lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase",
                  display: "inline-flex", alignItems: "center", padding: "0 26px", height: "48px",
                  background: "transparent", border: "1px solid #151A54", borderRadius: "2px",
                  color: "#151A54", textDecoration: "none",
                }}
              >
                Message us on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            BELIEFS — Figma: #31:4406
            padding 96px 100px, bg Paper/300 (#D3DAEC)
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: "#D3DAEC" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "96px 100px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ ...S.eyebrow, color: "#0140C1" }}>Our beliefs</span>
              <h2 style={{ ...S.displayL, color: "#151A54" }}>What we hold</h2>
            </div>

            {beliefs.map((belief) => (
              <div
                key={belief.title}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "40px",
                  padding: "24px 0",
                  borderBottom: "1px solid #C0C9E0",
                  flexWrap: "wrap" as const,
                }}
              >
                <div style={{ minWidth: "200px", flex: "0 0 200px" }}>
                  <span style={{ ...S.displayS, color: "#151A54" }}>{belief.title}</span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p style={{ ...S.readBody, color: "#4A62A0", maxWidth: "900px" }}>{belief.body}</p>
                  <span style={{ ...S.eyebrow, color: "#0140C1" }}>{belief.scripture}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            LEADERSHIP — Figma: #31:4426
            padding 96px 100px, bg #E8ECF7
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: "#E8ECF7" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "96px 100px",
              display: "flex",
              flexDirection: "column",
              gap: "32px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ ...S.eyebrow, color: "#0140C1" }}>Leadership</span>
              <h2 style={{ ...S.displayL, color: "#151A54" }}>Who leads us</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: "wrap" as const }}>
              {leadership.map((leader) => (
                <div
                  key={leader.name}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid #D3DAEC",
                    borderRadius: "4px",
                    overflow: "hidden",
                    background: "#FFFFFF",
                    flex: "0 0 300px",
                  }}
                >
                  {/* Portrait placeholder — Figma: RECTANGLE 608×497 */}
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "608/497",
                      background: leader.placeholder,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ ...S.eyebrow, color: "rgba(255,255,255,0.4)" }}>Portrait</span>
                  </div>
                  <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ ...S.displayS, color: "#151A54" }}>{leader.name}</span>
                    <span style={{ ...S.readSmall, color: "#4A62A0" }}>{leader.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
