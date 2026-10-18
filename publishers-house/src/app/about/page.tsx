import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Us | The Publishers House",
  description:
    "The Publishers House is an apostolic ministry in Jos led by Rev. Joshua Agunbiade, raising believers whose lives publish Christ to every sphere of society.",
  openGraph: {
    siteName: "The Publishers House",
    title: "About Us | The Publishers House",
    description:
      "An apostolic ministry in Jos committed to proclaiming the unchanging truth of God's Word. Led by Rev. Joshua Agunbiade.",
    url: "https://www.thepublishershouse.org/about",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "About – The Publishers House" }],
  },
};

// Figma text styles (same tokens as homepage)
const S = {
  eyebrow: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  scripture: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  displayXL: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "clamp(36px, 5vw, 58px)", lineHeight: "0.98em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  displayL: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "clamp(28px, 4vw, 48px)", lineHeight: "1.04em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  displayM: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "clamp(20px, 3vw, 30px)", lineHeight: "1.14em", letterSpacing: "-0.015em", textTransform: "uppercase" as const },
  displayS: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "clamp(16px, 2.5vw, 21px)", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  readLede: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
  readSmall: { fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
  readBody: { fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: "16px", lineHeight: "1.68em" },
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
const hardcodedLeadership = [
  {
    name: "Rev. Joshua Agunbiade",
    role: "Lead Pastor",
    location: "TPH JOS AND ABUJA",
    photoUrl: "/images/Rev. Joshua Agunbiade.webp",
    photoUrlMobile: "/images/Rev. Joshua Agunbiade-mobile.webp",
  },
  {
    name: "Pastor Damilare Ayodele",
    role: "Associate Pastor",
    location: "TPH JOS",
    photoUrl: "/images/Pastor Damilare Ayodele.webp",
    photoUrlMobile: "/images/Pastor Damilare Ayodele-mobile.webp",
  },
  {
    name: "Pastor Boniface Onah",
    role: "Associate Pastor",
    location: "TPH ABUJA",
    photoUrl: "/images/Pastor Boniface Onah.webp",
    photoUrlMobile: "/images/Pastor Boniface Onah-mobile.webp",
  },
  {
    name: "Pastor Ngbede Odeh",
    role: "Associate Pastor",
    location: "TPH JOS",
    photoUrl: "/images/Pastor Ngbede Odeh.webp",
    photoUrlMobile: "/images/Pastor Ngbede Odeh-mobile.webp",
  },
  {
    name: "Pastor Makinde Theophilus",
    role: "Associate Pastor",
    location: "TPH JOS",
    photoUrl: "/images/Pastor Theophilus Makinde.webp",
    photoUrlMobile: "/images/Pastor Theophilus Makinde-mobile.webp",
  },
];

import { getLeadership } from "@/lib/firebase";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { DEFAULT_ABOUT_DATA } from "@/lib/cmsDefaults";
export const revalidate = 60; // Revalidate every 60 seconds

export default async function AboutPage() {
  // Safe fetch with 1.5s timeout so cold starts never hang TTFB
  const cmsLeaders = await Promise.race([
    getLeadership(),
    new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 1500))
  ]).catch(() => []);

  let aboutData = DEFAULT_ABOUT_DATA;
  try {
    const docSnap = await getAdminDb().collection("settings").doc("church_about").get();
    if (docSnap.exists) {
      aboutData = { ...DEFAULT_ABOUT_DATA, ...(docSnap.data() as any) };
    }
  } catch (err) {
    // Fall back to default
  }

  const leadership = cmsLeaders.length > 0 
    ? cmsLeaders.map((l) => ({
        name: l.name,
        role: l.role,
        location: l.role.toLowerCase().includes("lead") ? "TPH JOS AND ABUJA" : "TPH JOS",
        photoUrl: l.photoUrl || "/images/event-1.jpg",
        photoUrlMobile: l.photoUrl || "/images/event-1.jpg",
      }))
    : hardcodedLeadership;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>

        {/* HERO */}
        <section
          className="tph-hero"
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            overflow: "hidden",
          }}
        >
          {/* High-priority responsive LCP image: 51KB on mobile, 224KB on desktop (vs 1.8MB original) */}
          <picture style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
            <source media="(max-width: 768px)" srcSet="/images/about-hero-mobile.webp" type="image/webp" />
            <source srcSet="/images/about-hero.webp" type="image/webp" />
            <img
              src="/images/about-hero.jpg"
              alt="About The Publishers House"
              fetchPriority="high"
              decoding="sync"
              loading="eager"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />
          </picture>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(21,26,84,0.88)", zIndex: 1 }} />

          <div style={{ position: "relative", zIndex: 2, maxWidth: "1440px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "18px" }}>
            <span style={{ ...S.eyebrow, color: "#2090FF" }}>{aboutData.heroEyebrow || "Psalm 68:11 · Company of the Great"}</span>
            <h1 style={{ ...S.displayXL, color: "#FFFFFF", maxWidth: "1000px", margin: 0 }}>
              {aboutData.heroHeadline || "About the Publishers House"}
            </h1>
            <p style={{ ...S.readLede, color: "#E8ECF7", maxWidth: "760px", margin: 0 }}>
              {aboutData.heroLede || "An apostolic and scriptural ministry committed to proclaiming the unchanging truth of God's Word to every sphere of society."}
            </p>
          </div>
        </section>

        {/* STORY & MANDATE */}
        <section className="tph-section" style={{ background: "#D3DAEC" }}>
          <div
            style={{
              maxWidth: "1440px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "40px",
            }}
          >
            <div className="tph-two-col">
              {/* Left margin column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ ...S.eyebrow, color: "#0140C1" }}>Who we are</span>
                <p style={{ ...S.readSmall, color: "#4A62A0" }}>
                  Established 2020 · Jos, Plateau State · Other branches all over Nigeria
                </p>
                {aboutData.vision && (
                  <div style={{ marginTop: "16px", padding: "16px", background: "#FFFFFF", borderRadius: "4px", border: "1px solid #C4CEE5" }}>
                    <span style={{ ...S.eyebrow, color: "#0140C1", display: "block", marginBottom: "6px" }}>Our Vision</span>
                    <p style={{ ...S.readSmall, color: "#151A54", fontSize: "13px", margin: 0 }}>{aboutData.vision}</p>
                  </div>
                )}
                {aboutData.mission && (
                  <div style={{ marginTop: "8px", padding: "16px", background: "#FFFFFF", borderRadius: "4px", border: "1px solid #C4CEE5" }}>
                    <span style={{ ...S.eyebrow, color: "#0140C1", display: "block", marginBottom: "6px" }}>Our Mission</span>
                    <p style={{ ...S.readSmall, color: "#151A54", fontSize: "13px", margin: 0 }}>{aboutData.mission}</p>
                  </div>
                )}
              </div>
              {/* Body text */}
              <div style={{ flex: 1 }}>
                <p style={{ ...S.readBody, color: "#151A54", whiteSpace: "pre-line" }}>
                  {aboutData.history || `The Publishers House was established in 2020 under the leadership of Dr. Joshua Agunbiade.\n\nThe ministry exists to equip believers, strengthen the Church, and advance the Kingdom of God through biblical teaching, discipleship, prayer and Christian apologetics.\n\nInspired by Psalm 68:11, we believe that every believer is commissioned to become a publisher of God's message, declaring His truth with conviction, excellence and global impact.\n\nFrom Jos, Nigeria, the ministry is raising a company of believers whose lives become living publications of Christ.\n\nWe are given to much prayer, immersed in the word of God and passionate searchers of God's presence.`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TENETS OF FAITH (BELIEFS) */}
        <section className="tph-section" style={{ background: "#FFFFFF" }}>
          <div className="tph-inner" style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ ...S.eyebrow, color: "#0140C1" }}>Our Tenets of Faith</span>
              <h2 style={{ ...S.displayL, color: "#151A54" }}>What we believe</h2>
            </div>
            <div className="tph-grid-3">
              {aboutData.beliefs?.map((belief: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    background: "#F4F6FB",
                    border: "1px solid #D3DAEC",
                    borderRadius: "6px",
                    padding: "28px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ ...S.displayS, color: "#151A54", fontSize: "17px" }}>{belief.title}</span>
                    {belief.scripture && (
                      <span style={{ ...S.scripture, color: "#0140C1", background: "#E8ECF7", padding: "3px 8px", borderRadius: "3px", fontSize: "10px" }}>
                        {belief.scripture}
                      </span>
                    )}
                  </div>
                  <p style={{ ...S.readSmall, color: "#4A62A0", margin: 0, lineHeight: "1.6em" }}>
                    {belief.body}
                  </p>
                </div>
              ))}
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


        {/* LEADERSHIP */}
        <section className="tph-section" style={{ background: "#E8ECF7" }}>
          <div
            className="tph-inner"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "32px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ ...S.eyebrow, color: "#0140C1" }}>Leadership</span>
              <h2 style={{ ...S.displayL, color: "#151A54" }}>Who leads us</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Top row: 2 leaders */}
              <div className="tph-grid-2">
                {leadership.slice(0, 2).map((leader) => (
                  <div key={leader.name} style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ width: "100%", aspectRatio: "608/608", overflow: "hidden", marginBottom: "16px" }}>
                      <img
                        src={leader.photoUrl}
                        srcSet={leader.photoUrlMobile ? `${leader.photoUrlMobile} 420w, ${leader.photoUrl} 800w` : undefined}
                        sizes="(max-width: 768px) 372px, 608px"
                        alt={leader.name}
                        loading="lazy"
                        decoding="async"
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                      />
                    </div>
                    <span style={{ ...S.displayS, color: "#151A54", marginBottom: "4px" }}>{leader.name}</span>
                    <span style={{ ...S.eyebrow, color: "#0140C1", marginBottom: "12px" }}>{leader.role}</span>
                    <span style={{ ...S.readSmall, fontSize: "12px", color: "#4A62A0", textTransform: "uppercase" }}>{leader.location}</span>
                  </div>
                ))}
              </div>
              
              {/* Bottom row: 3 leaders */}
              <div className="tph-grid-3">
                {leadership.slice(2, 5).map((leader) => (
                  <div key={leader.name} style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ width: "100%", aspectRatio: "608/700", overflow: "hidden", marginBottom: "16px" }}>
                      <img
                        src={leader.photoUrl}
                        srcSet={leader.photoUrlMobile ? `${leader.photoUrlMobile} 420w, ${leader.photoUrl} 800w` : undefined}
                        sizes="(max-width: 768px) 372px, 400px"
                        alt={leader.name}
                        loading="lazy"
                        decoding="async"
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                      />
                    </div>
                    <span style={{ ...S.displayS, color: "#151A54", fontSize: "16px", marginBottom: "4px" }}>{leader.name}</span>
                    <span style={{ ...S.eyebrow, color: "#0140C1", marginBottom: "12px" }}>{leader.role}</span>
                    <span style={{ ...S.readSmall, fontSize: "12px", color: "#4A62A0", textTransform: "uppercase" }}>{leader.location}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
