import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const revalidate = 0;

export const TRACK_DETAILS: Record<
  string,
  {
    title: string;
    scripture: string;
    eyebrow: string;
    lede: string;
    description: string;
    materials: {
      part: string;
      title: string;
      speaker: string;
      duration: string;
      youtubeUrl?: string;
      pdfUrl?: string;
      notesUrl?: string;
    }[];
  }
> = {
  "how-to-preach-the-gospel": {
    title: "How to Preach the Gospel",
    scripture: "Romans 1:16 · 1 Corinthians 15:1-4 · 2 Timothy 4:2",
    eyebrow: "Apostolic Evangelism & Kerygma",
    lede: "Foundational training and biblical conviction for evangelism and proclaiming Christ unashamedly across our generation.",
    description: "The gospel is not advice on how to live; it is news about what has already been accomplished by Jesus Christ. In this training course, Dr. Joshua Agunbiade unpacks the theology of the proclamation (Kerygma), how to preach Christ from all of Scripture, and the supernatural boldness required to witness in contemporary culture.",
    materials: [
      { part: "Part 1", title: "The Heart of the Kerygma: Christ Crucified", speaker: "Dr. Joshua Agunbiade", duration: "54:12" },
      { part: "Part 2", title: "Confronting the Wisdom of the Age with Truth", speaker: "Dr. Joshua Agunbiade", duration: "58:30" },
      { part: "Part 3", title: "Signs, Wonders, and the Demonstration of Power", speaker: "Dr. Joshua Agunbiade", duration: "1:02:15" },
      { part: "Part 4", title: "Following Up and Discipling New Converts", speaker: "Pastor Damilare Agunbiade", duration: "48:50" },
    ],
  },
  "basic-prayer-classes": {
    title: "Basic Prayer Classes",
    scripture: "Luke 11:1 · Jude 1:20 · 1 Thessalonians 5:17",
    eyebrow: "Spiritual Disciplines & Communion",
    lede: "A systematic spiritual guide to answered prayer, communion with the Father, and prevailing in the Spirit.",
    description: "Prayer is both the breath of the believer and the engine of Kingdom advancement. This class moves beyond ritualistic praying into deep fellowship with the Holy Ghost, intercession, travailing for the lost, and building spiritual stamina.",
    materials: [
      { part: "Module 1", title: "The Fatherhood of God and the Confidence of Prayer", speaker: "Dr. Joshua Agunbiade", duration: "50:20" },
      { part: "Module 2", title: "Praying in the Holy Ghost: Edification & Mysteries", speaker: "Dr. Joshua Agunbiade", duration: "1:05:00" },
      { part: "Module 3", title: "Intercession: Standing in the Gap for Nations and Families", speaker: "Dr. Joshua Agunbiade", duration: "56:40" },
      { part: "Module 4", title: "Hindrances to Answered Prayer and Spiritual Warfare", speaker: "Pastor Damilare Agunbiade", duration: "52:10" },
    ],
  },
  "40-days-prayer-and-fasting": {
    title: "40 DAYS PRAYER & FASTING: DEVOTIONAL",
    scripture: "Matthew 6:16-18 · Isaiah 58:6-12 · Psalm 68:11",
    eyebrow: "Annual Consecration & Revival",
    lede: "Annual church-wide consecrated devotional, spiritual warfare prayers, and corporate fasting guide for breakthrough.",
    description: "Consecration is the doorway to fresh anointing and divine direction. The 40 Days of Prayer & Fasting Devotional provides daily scripture readings, prophetic confessions, and targeted prayer focuses for spiritual revival in your personal walk and church family.",
    materials: [
      { part: "Day 1-10", title: "Consecration, Repentance & Purity of Heart", speaker: "Dr. Joshua Agunbiade", duration: "Devotional Guide" },
      { part: "Day 11-20", title: "Supernatural Health, Healing & Divine Preservation", speaker: "Dr. Joshua Agunbiade", duration: "Devotional Guide" },
      { part: "Day 21-30", title: "Financial Increase, Open Doors & Kingdom Labour", speaker: "Dr. Joshua Agunbiade", duration: "Devotional Guide" },
      { part: "Day 31-40", title: "Revival in Jos, Territorial Anointing & Global Commission", speaker: "Dr. Joshua Agunbiade", duration: "Devotional Guide" },
    ],
  },
  "the-doctrine-of-christ": {
    title: "The doctrine of Christ",
    scripture: "Hebrews 6:1-2 · John 7:16-17 · 2 John 1:9",
    eyebrow: "Apostolic Foundations",
    lede: "Exposition of Hebrews 6:1-2 and the apostolic core of the Christian faith, repentance from dead works, and eternal judgment.",
    description: "Without deep biblical roots in the doctrine of Christ, believers remain susceptible to false teachings and theological wind. This series systematically breaks down the six foundational pillars of Christianity recorded in Hebrews 6, anchoring every student in Christology and New Testament truth.",
    materials: [
      { part: "Pillar 1", title: "Repentance from Dead Works and Faith Toward God", speaker: "Dr. Joshua Agunbiade", duration: "1:10:00" },
      { part: "Pillar 2", title: "The Doctrine of Baptisms: Water and the Holy Ghost", speaker: "Dr. Joshua Agunbiade", duration: "59:45" },
      { part: "Pillar 3", title: "Laying on of Hands: Impartation and Ministry Order", speaker: "Dr. Joshua Agunbiade", duration: "55:18" },
      { part: "Pillar 4", title: "Resurrection of the Dead and Eternal Judgment", speaker: "Dr. Joshua Agunbiade", duration: "1:15:20" },
    ],
  },
  "work-and-increase": {
    title: "Work & Increase",
    scripture: "Genesis 2:15 · Proverbs 10:4 · Ephesians 4:28 · 2 Thessalonians 3:10",
    eyebrow: "Kingdom Marketplace & Diligence",
    lede: "The theology of labour, biblical stewardship, workplace excellence, and Kingdom economic increase.",
    description: "God is a worker, and labour is a divine institution given before the fall. Work & Increase equips believers to view their vocation, business, and daily craft as a pulpit for righteousness, while unleashing the biblical principles of diligence, covenant seedtime and harvest, and multi-generational increase.",
    materials: [
      { part: "Session 1", title: "The Dignity of Work and Marketplace Calling", speaker: "Dr. Joshua Agunbiade", duration: "52:40" },
      { part: "Session 2", title: "Wisdom for Financial Increase & Overcoming Debt", speaker: "Dr. Joshua Agunbiade", duration: "1:04:10" },
      { part: "Session 3", title: "Biblical Diligence: The Cure for Poverty and Entitlement", speaker: "Dr. Joshua Agunbiade", duration: "49:30" },
      { part: "Session 4", title: "Partnership with the Gospel: The True Goal of Wealth", speaker: "Dr. Joshua Agunbiade", duration: "58:00" },
    ],
  },
  "grace-for-grace": {
    title: "Grace for Grace",
    scripture: "John 1:16-17 · Romans 5:17 · 2 Corinthians 12:9",
    eyebrow: "The Abundance of Divine Provision",
    lede: "Understanding the fullness of Christ, unearned righteousness, and the dynamic covenant of divine enabling.",
    description: "Grace is not a license for passivity; it is the divine influence upon the heart and its reflection in the life. In Grace for Grace, believers explore the distinction between Law and Gospel, how to reign in life through righteousness, and receiving daily strength for every trial.",
    materials: [
      { part: "Chapter 1", title: "Out of His Fullness: From Law to Truth", speaker: "Dr. Joshua Agunbiade", duration: "56:20" },
      { part: "Chapter 2", title: "Justification by Faith: Free from Condemnation", speaker: "Dr. Joshua Agunbiade", duration: "1:01:00" },
      { part: "Chapter 3", title: "Sufficiency in Weakness: Grace for Hard Seasons", speaker: "Dr. Joshua Agunbiade", duration: "54:15" },
      { part: "Chapter 4", title: "Grace That Teaches: Holy Living and Kingdom Service", speaker: "Dr. Joshua Agunbiade", duration: "50:45" },
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const track = TRACK_DETAILS[slug];
  if (!track) return { title: "Resource Track Not Found | The Publishers House" };
  return {
    title: `${track.title} | Resources | The Publishers House`,
    description: track.lede,
  };
}

export default async function ResourceSubpage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let track = TRACK_DETAILS[slug];

  // Try fetching custom overrides from Firestore
  try {
    const docSnap = await getAdminDb().collection("resource_tracks").doc(slug).get();
    if (docSnap.exists) {
      const custom = docSnap.data();
      if (custom) {
        track = {
          ...track,
          ...custom,
          materials: custom.materials?.length ? custom.materials : track?.materials,
        };
      }
    }
  } catch (err) {
    // Fall back to static track details
  }

  if (!track) notFound();

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px", backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
        
        {/* Hero Section */}
        <section
          style={{
            backgroundColor: "#151A54",
            padding: "80px 100px 96px",
            position: "relative",
            overflow: "hidden",
            borderBottom: "4px solid #2090FF",
          }}
          className="tph-hero"
        >
          <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            {/* Breadcrumbs */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Link href="/resources" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.6)", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                ← Resources Hub
              </Link>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, color: "#2090FF", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                {track.eyebrow}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(30px, 4.5vw, 54px)",
                lineHeight: "1.08em",
                letterSpacing: "-0.025em",
                color: "#FFFFFF",
                margin: "0 0 16px",
                textTransform: "uppercase",
              }}
            >
              {track.title}
            </h1>

            <div
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#D97706",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              {track.scripture}
            </div>

            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(18px, 2.2vw, 22px)",
                lineHeight: "1.55em",
                color: "rgba(255,255,255,0.88)",
                margin: "0 0 32px",
                maxWidth: "840px",
              }}
            >
              {track.lede}
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
              <a
                href="#curriculum"
                style={{
                  backgroundColor: "#2090FF",
                  color: "#FFFFFF",
                  padding: "14px 28px",
                  borderRadius: "4px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: "12px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(32, 144, 255, 0.35)",
                }}
              >
                Access Course Materials ↓
              </a>
              <Link
                href="/sermons"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.25)",
                  padding: "14px 24px",
                  borderRadius: "4px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "12px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                Browse All Sermons
              </Link>
            </div>
          </div>
        </section>

        {/* Overview Exposition */}
        <section style={{ padding: "72px 100px", backgroundColor: "#F4F6FB", borderBottom: "1px solid #D3DAEC" }} className="tph-section">
          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#0140C1", marginBottom: "12px" }}>
              Theological Focus & Context
            </div>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "28px", fontWeight: 800, color: "#151A54", margin: "0 0 20px", textTransform: "uppercase" }}>
              About This Resource
            </h2>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", lineHeight: "1.75em", color: "#4A62A0", margin: 0 }}>
              {track.description}
            </p>
          </div>
        </section>

        {/* Curriculum / Materials List */}
        <section id="curriculum" style={{ padding: "80px 100px 100px", backgroundColor: "#FFFFFF" }} className="tph-section">
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "36px" }}>
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#0140C1", marginBottom: "8px" }}>
                  Curriculum & Sessions
                </div>
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "30px", fontWeight: 800, color: "#151A54", margin: 0, textTransform: "uppercase" }}>
                  Course Teachings & Downloads
                </h2>
              </div>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: 600, color: "#747CA1" }}>
                {track.materials.length} Materials Available
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {track.materials.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#F4F6FB",
                    border: "1px solid #D3DAEC",
                    borderRadius: "8px",
                    padding: "24px 28px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "20px",
                    transition: "border-color 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "8px",
                        backgroundColor: "#151A54",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 800,
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, color: "#0140C1", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {m.part} · {m.speaker}
                      </div>
                      <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "17px", fontWeight: 700, color: "#151A54", margin: "4px 0 0" }}>
                        {m.title}
                      </h3>
                      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11.5px", color: "#747CA1", marginTop: "4px" }}>
                        Duration: {m.duration}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <Link
                      href="/sermons"
                      style={{
                        padding: "10px 18px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #D3DAEC",
                        borderRadius: "4px",
                        color: "#151A54",
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>▶</span>
                      <span>Listen & Watch</span>
                    </Link>

                    <button
                      onClick={() => alert(`Downloading study notes for ${m.title}...`)}
                      style={{
                        padding: "10px 18px",
                        backgroundColor: "#0140C1",
                        border: "none",
                        borderRadius: "4px",
                        color: "#FFFFFF",
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>📥</span>
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Other Resources Carousel link */}
            <div style={{ marginTop: "60px", padding: "32px", backgroundColor: "#E8ECF7", borderRadius: "12px", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "18px", fontWeight: 800, color: "#151A54", margin: "0 0 8px", textTransform: "uppercase" }}>
                Explore Other Categorized Studies
              </h3>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: "#4A62A0", margin: "0 0 20px" }}>
                Deepen your spiritual understanding with other courses in this curriculum.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                {Object.entries(TRACK_DETAILS).filter(([s]) => s !== slug).slice(0, 4).map(([s, t]) => (
                  <Link
                    key={s}
                    href={`/resources/${s}`}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#FFFFFF",
                      borderRadius: "20px",
                      border: "1px solid #D3DAEC",
                      color: "#0140C1",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {t.title} →
                  </Link>
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
