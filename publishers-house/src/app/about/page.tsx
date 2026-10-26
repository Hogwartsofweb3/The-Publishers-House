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
    title: "THE SCRIPTURES",
    body: "We hold the sixty-six books of the Old and New Testaments to be the inspired Word of God, entirely trustworthy, and the final authority for what the church believes and how it lives.",
    scripture: "2 TIMOTHY 3:16–17",
  },
  {
    title: "ONE GOD REVEALED AS A TRINITY",
    body: "We firmly believe in one God who has revealed Himself as a Trinity of persons.",
    scripture: "MATTHEW 28:19",
  },
  {
    title: "THE HOLY SPIRIT",
    body: "We believe the Spirit is at work now, illuminating Scripture, sanctifying the believer and empowering the church for witness, and that His gifts have not been withdrawn.",
    scripture: "ACTS 1:8",
  },
  {
    title: "THE CHURCH AND THE APOSTOLIC MANDATE",
    body: "We confess one holy, catholic and apostolic church, gathered by the gospel and sent to publish it.",
    scripture: "EPHESIANS 4:11–13",
  },
  {
    title: "THE BELIEVER AS PUBLISHER",
    body: "Every believer carries a commission to publish the Word, in speech and in life, across nations and generations.",
    scripture: "PSALM 68:11",
  },
];

// Leadership from Figma: EL-31:4426 Leadership section
const hardcodedLeadership = [
  {
    name: "Rev. Joshua Agunbiade",
    role: "Lead Pastor",
    photoUrl: "/images/Rev. Joshua Agunbiade.webp",
    photoUrlMobile: "/images/Rev. Joshua Agunbiade-mobile.webp",
  },
  {
    name: "Pastor Damilare Ayodele",
    role: "Associate Pastor",
    photoUrl: "/images/Pastor Damilare Ayodele.webp",
    photoUrlMobile: "/images/Pastor Damilare Ayodele-mobile.webp",
  },
  {
    name: "Pastor Boniface Onah",
    role: "Associate Pastor",
    photoUrl: "/images/Pastor Boniface Onah.webp",
    photoUrlMobile: "/images/Pastor Boniface Onah-mobile.webp",
  },
  {
    name: "Pastor Ngbede Odeh",
    role: "Associate Pastor",
    photoUrl: "/images/Pastor Ngbede Odeh.webp",
    photoUrlMobile: "/images/Pastor Ngbede Odeh-mobile.webp",
  },
  {
    name: "Pastor Makinde Theophilus",
    role: "Associate Pastor",
    photoUrl: "/images/Pastor Theophilus Makinde.webp",
    photoUrlMobile: "/images/Pastor Theophilus Makinde-mobile.webp",
  },
];

import { getLeadership } from "@/lib/firebase";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { DEFAULT_ABOUT_DATA } from "@/lib/cmsDefaults";
import AboutScrollHandler from "@/components/AboutScrollHandler";
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
        role: l.role.toLowerCase().includes("lead") ? "Lead Pastor" : "Associate Pastor",
        photoUrl: l.photoUrl || "/images/event-1.jpg",
        photoUrlMobile: l.photoUrl || "/images/event-1.jpg",
      }))
    : hardcodedLeadership;

  return (
    <>
      <AboutScrollHandler />
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
            <source media="(max-width: 768px)" srcSet={aboutData.heroPhotoUrl || "/images/about-hero-mobile.webp"} type="image/webp" />
            <source srcSet={aboutData.heroPhotoUrl || "/images/about-hero.webp"} type="image/webp" />
            <img
              src={aboutData.heroPhotoUrl || "/images/about-hero.jpg"}
              alt="About The Publishers House"
              fetchPriority="high"
              decoding="sync"
              loading="eager"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />
          </picture>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(21, 26, 84, 0.78) 0%, rgba(1, 64, 193, 0.58) 100%)", zIndex: 1 }} />

          <div style={{ position: "relative", zIndex: 2, maxWidth: "1440px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "18px" }}>
            <span style={{ ...S.eyebrow, color: "#2090FF" }}>{aboutData.heroEyebrow || "PSALM 68:11"}</span>
            <h1 style={{ ...S.displayXL, color: "#FFFFFF", maxWidth: "1000px", margin: 0 }}>
              {aboutData.heroHeadline || "ABOUT THE PUBLISHERS HOUSE"}
            </h1>
            <p style={{ ...S.readLede, color: "#E8ECF7", maxWidth: "760px", margin: 0 }}>
              {aboutData.heroLede || "An apostolic and scriptural ministry committed to proclaiming the unchanging truth of God's Word to every sphere of society."}
            </p>
          </div>
        </section>

        {/* WHO WE ARE */}
        <section className="tph-section" style={{ background: "#D3DAEC" }}>
          <div
            className="tph-inner"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "40px",
            }}
          >
            <div className="tph-two-col">
              {/* Left margin column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ ...S.eyebrow, color: "#0140C1" }}>{aboutData.whoWeAreEyebrow || "Who we are"}</span>
                <p style={{ ...S.readSmall, color: "#4A62A0" }}>
                  {aboutData.whoWeAreMeta || "Established 2020 · Jos, Plateau State"}
                </p>
              </div>
              {/* Body text: 5 exact paragraphs */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                {(aboutData.whoWeAreParagraphs || [
                  "The Publishers House was established in 2020 under the leadership of Dr. Joshua Agunbiade.",
                  "The ministry exists to equip believers, strengthen the Church, and advance the Kingdom of God through biblical teaching, discipleship, prayer and Christian apologetics.",
                  "Inspired by Psalm 68:11, we believe that every believer is commissioned to become a publisher of God's message, declaring His truth with conviction, excellence and global impact.",
                  "From Jos, Nigeria, the ministry is raising a company of believers whose lives become living publications of Christ.",
                  "We are given to much prayer, immersed in the word of God and passionate searchers of God's presence.",
                ]).map((p: string, idx: number) => (
                  <p key={idx} style={{ ...S.readBody, color: "#151A54", margin: 0 }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            WHAT TO EXPECT — Exactly as in Screenshot 2
        ══════════════════════════════════════════════════════════ */}
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
              <span style={{ ...S.eyebrow, color: "#0140C1" }}>{aboutData.planVisitKicker || "Planning your visit"}</span>
              <h2 style={{ ...S.displayL, color: "#151A54" }}>{aboutData.planVisitHeading || "What to expect"}</h2>
            </div>

            {/* Row 1 */}
            <div style={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: "wrap" as const }}>
              {(aboutData.planVisitCards && aboutData.planVisitCards.length > 0
                ? aboutData.planVisitCards
                : [
                    {
                      title: "Where to find us",
                      body: "The House of Bread, Korinjoh House, British, Jos. There is parking on the compound.",
                    },
                    {
                      title: "What to wear",
                      body: "Come as you are, and comfortably dressed as well. You will see everything from traditional dress to jeans, and nobody is counting. All we encourage is modesty.",
                    },
                  ]
              ).map((item: any) => (
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
                  body: "You can enjoy God's presence when you fellowship with us; rest assured that your children are safe and being taught and engaged by trained teachers in a very comfortable environment.",
                },
                {
                  title: "Will I be singled out?",
                  body: "We would usually welcome visitors and have a brief chat with them to shower them with hospitality and give them more information about the church operations.",
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
                href={aboutData.planVisitBtnUrl || "/contact"}
                style={{
                  fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px",
                  lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase",
                  display: "inline-flex", alignItems: "center", padding: "0 26px", height: "48px",
                  background: "#0140C1", border: "1px solid #0140C1", borderRadius: "2px",
                  color: "#FFFFFF", textDecoration: "none",
                }}
              >
                {aboutData.planVisitBtnText || "Plan your visit"}
              </Link>
            </div>
          </div>
        </section>


        {/* OUR BELIEFS / WHAT WE HOLD */}
        <section id="beliefs" className="tph-section" style={{ background: "#F4F6FB", scrollMarginTop: "80px" }}>
          <div
            className="tph-inner"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "28px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ ...S.eyebrow, color: "#0140C1" }}>OUR BELIEFS</span>
              <h2 style={{ ...S.displayL, color: "#151A54" }}>WHAT WE HOLD</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {beliefs.map((b, idx) => (
                <div
                  key={b.title}
                  style={{
                    paddingTop: idx === 0 ? "16px" : "36px",
                    paddingBottom: "36px",
                    borderBottom: "1px solid #D8DFEE",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-poppins)",
                      fontWeight: 700,
                      fontSize: "clamp(16px, 2vw, 19px)",
                      lineHeight: "1.25em",
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      color: "#151A54",
                      margin: 0,
                    }}
                  >
                    {b.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-playfair)",
                      fontWeight: 400,
                      fontSize: "clamp(15px, 1.8vw, 18px)",
                      lineHeight: "1.65em",
                      color: "#3A4668",
                      margin: 0,
                      maxWidth: "1100px",
                    }}
                  >
                    {b.body}
                  </p>
                  <div
                    style={{
                      fontFamily: "var(--font-poppins)",
                      fontWeight: 700,
                      fontSize: "11px",
                      lineHeight: "1.6em",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#0140C1",
                      marginTop: "2px",
                    }}
                  >
                    {b.scripture}
                  </div>
                </div>
              ))}
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
