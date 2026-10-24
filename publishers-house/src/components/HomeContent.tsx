"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import LatestTeachingCarousel from "@/components/LatestTeachingCarousel";
const ArticleCarousel = dynamic(() => import("@/components/ArticleCarousel"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "360px", backgroundColor: "#0B0E14" }} />,
});

/* ─── Design tokens ─── */
const Navy    = "#151A54";
const Slate600= "#4A62A0";
const Blue500 = "#2090FF";
const Blue700 = "#0140C1";
const Blue300 = "#6496EF";
const Paper100= "#F4F6FB";
const Paper200= "#E8ECF7";
const Paper300= "#D3DAEC";
const Paper400= "#C0C9E0";
const Slate500= "#747CA1";
const White   = "#FFFFFF";

const T = {
  displayXL: { fontFamily:"'Poppins', sans-serif", fontWeight:700, fontSize:"clamp(42px,6vw,72px)", lineHeight:"0.98em", letterSpacing:"-0.01em", textTransform:"uppercase" as const },
  displayL:  { fontFamily:"'Poppins', sans-serif", fontWeight:700, fontSize:"clamp(32px,4.5vw,48px)", lineHeight:"1.04em", letterSpacing:"-0.01em", textTransform:"uppercase" as const },
  displayM:  { fontFamily:"'Poppins', sans-serif", fontWeight:700, fontSize:"28px", lineHeight:"1.14em", letterSpacing:"-0.01em", textTransform:"uppercase" as const },
  displayS:  { fontFamily:"'Poppins', sans-serif", fontWeight:700, fontSize:"21px", lineHeight:"1.2em", letterSpacing:"-0.01em", textTransform:"uppercase" as const },
  epigraph:  { fontFamily:"'Playfair Display', serif", fontWeight:400, fontStyle:"italic" as const, fontSize:"clamp(24px,3vw,36px)", lineHeight:"1.3em" },
  readLede:  { fontFamily:"'Playfair Display', serif", fontWeight:400, fontSize:"20px", lineHeight:"1.55em" },
  readBody:  { fontFamily:"var(--font-serif, 'Playfair Display', Georgia, serif)", fontWeight:400, fontSize:"17px", lineHeight:"1.68em" },
  readSmall: { fontFamily:"'Poppins', sans-serif", fontWeight:400, fontSize:"14.5px", lineHeight:"1.5em" },
  eyebrow:   { fontFamily:"'Poppins', sans-serif", fontWeight:600, fontSize: "10px", lineHeight:"1.6em", letterSpacing:"0.2em", textTransform:"uppercase" as const },
  label:     { fontFamily:"'Poppins', sans-serif", fontWeight:600, fontSize: "11px", lineHeight:"1.6em", letterSpacing:"0.16em", textTransform:"uppercase" as const },
  scripture: { fontFamily:"'Poppins', sans-serif", fontWeight:600, fontSize: "11px", lineHeight:"1.6em", letterSpacing:"0.14em", textTransform:"uppercase" as const },
  button:    { fontFamily:"'Poppins', sans-serif", fontWeight:600, fontSize: "12px", lineHeight:"1em", letterSpacing:"0.14em", textTransform:"uppercase" as const },
  colophon:  { fontFamily:"'Poppins', sans-serif", fontWeight:500, fontSize: "10.5px", lineHeight:"1.6em", letterSpacing:"0.1em", textTransform:"uppercase" as const },
};

/* ─── Default / fallback content ─── */
const D = {
  // Hero
  heroEyebrow: "Psalm 68:11",
  heroHeadline: "Company of the Great",
  heroSubtitle: "An apostolic and scriptural ministry in Jos, raising believers whose lives become living publications of Christ.",
  heroBtn1Label: "Plan Your Visit",    heroBtn1Url: "/contact",
  heroBtn2Label: "Watch the Last Teaching", heroBtn2Url: "/sermons",
  heroSundayLabel: "Sunday Worship",   heroSundayTime: "9:00 AM WAT",
  heroMidweekLabel: "Midweek Service", heroMidweekTime: "4:30 PM WAT",
  heroAddress: "The House of Bread, Korinjoh House, British, Jos",
  heroBgImage: "/images/hero-v2.webp",

  // Setman
  setmanHeading: "WELCOME MESSAGE\nFROM THE SETMAN",
  setmanSubtext: "The Publishers House is an Apostolic community devoted to sound biblical teaching, prayer, and equipping believers to reflect Christ in their generation. Inspired by Psalm 68:11, we welcome you to the Company of the Great.",
  setmanBtnLabel: "READ MORE ABOUT US", setmanBtnUrl: "/about",
  setmanPhotoUrl: "/images/rja-setman.webp",

  // Gatherings heading
  gatheringsLabel: "Next Gatherings",
  gatheringsHeading: "This Week at the House",

  // Latest Teaching
  teachingEyebrow: "The Latest Teaching",
  teachingHeading: "Published This Week",
  teachingSeriesEyebrow: "Foundations · Part Eight",
  teachingTitle: "A Workman Unashamed",
  teachingDesc: "What Paul asks of anyone who handles Scripture in public, and why accuracy is a matter of love before it is a matter of scholarship.",
  teachingBtn1Label: "Listen — 48:12",    teachingBtn1Url: "/resources",
  teachingBtn2Label: "Read the Transcript", teachingBtn2Url: "/resources",
  teachingColophon: "2 Timothy 2:15,Foundations,Dr. Joshua Agunbiade,Jos,48:12",
  teachingImageUrl: "/images/sermon-v2.webp",

  // Who We Are
  whoEyebrow: "Who We Are",
  whoQuote: "Every believer is commissioned to become a publisher of God's message.",
  whoBody: "Established in 2020 under the leadership of Dr. Joshua Agunbiade, the ministry exists to equip believers, strengthen the Church and advance the Kingdom through biblical teaching, revival and apologetics.",
  whoBtnLabel: "Read What We Believe", whoBtnUrl: "/about",
  whoBgImage: "/images/who-we-are-v2.webp",

  // Announcement
  annShow: true,
  annHeading: "Special Announcement",
  annSubheading: "We Are Building",
  annBody: "After five years of meeting in rented spaces, we have successfully acquired land for a permanent ministry home. Our next step is to build \"The Publishers House,\" a multi-purpose facility that will include an auditorium, lecture halls, offices, and a media studio. We prayerfully invite you to partner with us in this exciting building phase.",
  annBtn1Label: "Give Now",           annBtn1Url: "/giving",
  annBtn2Label: "",                   annBtn2Url: "",
  annImageUrl: "/images/9528ca88db079ef5fecf726b4f42a332798a6fcc.jpg",

  // Giving
  givingEyebrow: "Giving",
  givingHeading: "Your Giving Publishes the Word",
  givingBody: "Gifts to this house pay for the gatherings, the recording and transcription of every teaching, and the programmes that carry the Word beyond Jos.",
  givingBtnLabel: "Give Now", givingBtnUrl: "/giving",
  givingBgImage: "/images/giving-bg.webp",
  givingCategories: "Tithe,Offering,Special Projects,Thanksgiving",
};

const FALLBACK_GATHERINGS = [
  { day:"SUN", date:"04", month:"OCT", title:"The Time of the Word", desc:"A continuation of our ongoing series — come ready for an encounter.", scripture:"2 Timothy 2:15", time:"9:00 AM WAT", city:"Jos", theme:"The Time of the Word — Part 6", published:true, order:0 },
  { day:"SUN", date:"04", month:"OCT", title:"FYB Prayer — The Arm of the Lord", desc:"Final Year Brethren gather in prayer, trusting in the strength and mighty hand of God.", scripture:"Isaiah 59:1", time:"3:00 PM WAT", city:"Jos", theme:"The Arm of the Lord", published:true, order:1 },
  { day:"THU", date:"08", month:"OCT", title:"Midweek Service", desc:"Doctrine, spiritual re-alignment and corporate prayer.", scripture:"Acts 2:42", time:"4:30 PM WAT", city:"Jos", published:true, order:2 },
];

export default function HomeContent() {
  // cmsSettings: only fields the editor has *explicitly* saved in Firestore
  // (starts empty — we never pre-fill it with defaults)
  const [cmsSettings, setCmsSettings] = useState<any>({});
  // s: merged view used by all the non-teaching JSX (hero, setman, giving, etc.)
  const [s, setS] = useState<any>({ ...D });
  const [gatherings, setGatherings] = useState<any[]>(FALLBACK_GATHERINGS);
  const [latestSermon, setLatestSermon] = useState<any>(null);
  const [latestSermons, setLatestSermons] = useState<any[]>([]);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    // Slide 0 ("Company of the Great"): 3 seconds
    // Slide 1 ("We Are Building"): 10 seconds
    const duration = heroSlide === 0 ? 3000 : 10000;
    const timer = setTimeout(() => {
      setHeroSlide((prev) => (prev === 0 ? 1 : 0));
    }, duration);
    return () => clearTimeout(timer);
  }, [heroSlide]);

  useEffect(() => {
    fetch("/api/home-data")
      .then(r => r.json())
      .then(data => {
        if (data.settings) {
          setCmsSettings(data.settings);
          // merge into s for all other sections that still use s.*
          setS((prev: any) => ({ ...prev, ...data.settings }));
        }
        if (data.gatherings?.length > 0) setGatherings(data.gatherings);
        if (data.latestSermons?.length > 0) setLatestSermons(data.latestSermons);
        if (data.latestSermon) setLatestSermon(data.latestSermon);
      })
      .catch(() => {});
  }, []);

  const setmanHeadingText = (!s.setmanHeading || s.setmanHeading.includes("Welcome Message\nfrom the Setman"))
    ? D.setmanHeading
    : s.setmanHeading;
  const headingLines = setmanHeadingText.split("\n");

  const setmanBodyText = (!s.setmanSubtext || s.setmanSubtext.includes("What Paul asks"))
    ? D.setmanSubtext
    : s.setmanSubtext;

  // ── Latest Teaching: CMS explicit save → auto-fetched sermon → static default ──
  // Priority: CMS override → latestSermon YouTube URL → internal sermon page → default
  const latestSermonUrl = latestSermon?.videoUrl || (latestSermon?.youtubeVideoId
    ? `https://www.youtube.com/watch?v=${latestSermon.youtubeVideoId}`
    : latestSermon ? `/sermons/${latestSermon.id}` : null);

  const teach = {
    eyebrow:      cmsSettings.teachingEyebrow      || D.teachingEyebrow,
    heading:      cmsSettings.teachingHeading      || D.teachingHeading,
    seriesEyebrow:cmsSettings.teachingSeriesEyebrow|| latestSermon?.series || D.teachingSeriesEyebrow,
    title:        cmsSettings.teachingTitle        || latestSermon?.title  || D.teachingTitle,
    desc:         cmsSettings.teachingDesc         || latestSermon?.summary|| D.teachingDesc,
    btn1Label:    cmsSettings.teachingBtn1Label    || (latestSermon?.duration ? `Watch — ${latestSermon.duration}` : D.teachingBtn1Label),
    btn1Url:      cmsSettings.teachingBtn1Url      || latestSermonUrl || D.teachingBtn1Url,
    btn2Label:    cmsSettings.teachingBtn2Label    || D.teachingBtn2Label,
    btn2Url:      cmsSettings.teachingBtn2Url      || "/sermons",
    imageUrl:     cmsSettings.teachingImageUrl     || latestSermon?.thumbnailUrl || D.teachingImageUrl,
    colophon: cmsSettings.teachingColophon
      ? cmsSettings.teachingColophon.split(",").map((x: string) => x.trim()).filter(Boolean)
      : latestSermon
      ? [latestSermon.scripture, latestSermon.series, latestSermon.speaker, latestSermon.duration].filter(Boolean)
      : D.teachingColophon.split(",").map((x: string) => x.trim()).filter(Boolean),
  };

  // Hero "Watch the Last Teaching" URL — YouTube video URL of the most recent sermon
  const heroWatchUrl = cmsSettings.heroBtn2Url || latestSermonUrl || "/sermons";

  const givingCats = (s.givingCategories || D.givingCategories).split(",").map((x: string) => x.trim()).filter(Boolean);

  return (
    <>
      {/* ══════════════ HERO CAROUSEL ══════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", overflow: "hidden", paddingTop: "70px", backgroundColor: Navy }}>
        {/* Sliding track container */}
        <div
          style={{
            display: "flex",
            width: "200%",
            transform: heroSlide === 0 ? "translateX(0%)" : "translateX(-50%)",
            transition: "transform 0.75s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          {/* ── SLIDE 1: Company of the Great ── */}
          <div
            style={{
              width: "50%",
              minWidth: "50%",
              position: "relative",
              minHeight: "calc(100vh - 70px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img src={s.heroBgImage || D.heroBgImage} alt="" fetchPriority="high" decoding="sync" loading="eager" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", zIndex: 0 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(21,26,84,0.9) 0%, rgba(1,64,193,0.45) 100%)", zIndex: 1 }} />
            <div className="tph-hero" style={{ position: "relative", zIndex: 2, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px" }}>
              <div style={{ ...T.scripture, color: "rgba(255,255,255,0.7)" }}>{s.heroEyebrow || D.heroEyebrow}</div>
              <h1 style={{ ...T.displayXL, color: White, margin: 0 }}>{s.heroHeadline || D.heroHeadline}</h1>
              <p style={{ ...T.readLede, color: "rgba(255,255,255,0.82)", maxWidth: "560px", margin: 0 }}>{s.heroSubtitle || D.heroSubtitle}</p>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" }}>
                <Link href="/contact" style={{ ...T.button, display: "inline-flex", alignItems: "center", justifyContent: "center", height: "48px", padding: "0 26px", borderRadius: "2px", border: `1px solid ${White}`, color: Navy, textDecoration: "none", background: White }}>{s.heroBtn1Label || D.heroBtn1Label}</Link>
                <Link href={heroWatchUrl} style={{ ...T.button, display: "inline-flex", alignItems: "center", justifyContent: "center", height: "48px", padding: "0 26px", borderRadius: "2px", border: `1px solid ${White}`, color: White, textDecoration: "none", background: "transparent" }}>{s.heroBtn2Label || D.heroBtn2Label}</Link>
              </div>
              <div className="tph-times-strip" style={{ display: "flex", gap: "0", marginTop: "16px", border: `1px solid rgba(255,255,255,0.35)`, borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ padding: "16px 32px", borderRight: `1px solid rgba(255,255,255,0.35)`, textAlign: "center", flex: 1 }}>
                  <div style={{ ...T.eyebrow, color: White, marginBottom: "6px", opacity: 0.75 }}>{s.heroSundayLabel || D.heroSundayLabel}</div>
                  <div style={{ ...T.displayS, color: White }}>{s.heroSundayTime || D.heroSundayTime}</div>
                </div>
                <div style={{ padding: "16px 32px", textAlign: "center", flex: 1 }}>
                  <div style={{ ...T.eyebrow, color: White, marginBottom: "6px", opacity: 0.75 }}>{s.heroMidweekLabel || D.heroMidweekLabel}</div>
                  <div style={{ ...T.displayS, color: White }}>{s.heroMidweekTime || D.heroMidweekTime}</div>
                </div>
              </div>
              <div style={{ ...T.colophon, color: "rgba(255,255,255,0.75)", marginTop: "8px" }}>{s.heroAddress || D.heroAddress}</div>
            </div>
          </div>

          {/* ── SLIDE 2: Building Project Video ── */}
          <div
            style={{
              width: "50%",
              minWidth: "50%",
              position: "relative",
              minHeight: "calc(100vh - 70px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/images/building-render.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                zIndex: 0,
              }}
            />
            {heroSlide === 1 && (
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  zIndex: 0,
                }}
              >
                <source src="/videos/building.mp4" type="video/mp4" />
              </video>
            )}
            {/* Deep blue overlay matching Slide 1 */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(21,26,84,0.88) 0%, rgba(1,64,193,0.55) 100%)", zIndex: 1 }} />
            
            <div className="tph-hero" style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "880px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px", padding: "40px 20px" }}>
              <div style={{ ...T.scripture, color: "#2090FF", backgroundColor: "rgba(32,144,255,0.15)", padding: "4px 16px", borderRadius: "20px", border: "1px solid rgba(32,144,255,0.3)" }}>
                Special Announcement
              </div>
              <h1 style={{ ...T.displayXL, color: White, margin: 0, letterSpacing: "-0.02em" }}>
                We Are Building
              </h1>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  maxWidth: "680px",
                  width: "100%",
                  margin: "0 auto",
                  padding: "0 12px",
                  boxSizing: "border-box",
                }}
              >
                <p style={{ fontFamily: "var(--font-playfair)", fontWeight: 400, fontStyle: "normal", fontSize: "clamp(14.5px, 1.25vw + 10px, 17.5px)", lineHeight: "1.65em", color: "rgba(255,255,255,0.90)", margin: 0, textAlign: "center" }}>
                  After five years in rented spaces, The Publishers House has acquired land for a permanent home! We are now building a multi-purpose center featuring an auditorium, lecture halls, offices, and a media studio to continue publishing the Gospel across the nations.
                </p>
                <p style={{ fontFamily: "var(--font-playfair)", fontWeight: 400, fontStyle: "normal", fontSize: "clamp(14.5px, 1.25vw + 10px, 17.5px)", lineHeight: "1.65em", color: "rgba(255,255,255,0.90)", margin: 0, textAlign: "center" }}>
                  We are at Phase 3 — Raising the walls, columns, and structural framework of the church and the administrative areas to the roofing level. The estimated cost of this is ₦142,000,000 (approx. $95,000).
                </p>
                <p style={{ fontFamily: "var(--font-playfair)", fontWeight: 400, fontStyle: "normal", fontSize: "clamp(14.5px, 1.25vw + 10px, 17.5px)", lineHeight: "1.65em", color: "rgba(255,255,255,0.90)", margin: 0, textAlign: "center" }}>
                  We prayerfully invite you to stand with us in this next phase to help bring this vision to life.
                </p>
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", marginTop: "12px" }}>
                <Link
                  href="/giving"
                  style={{
                    ...T.button,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "48px",
                    padding: "0 32px",
                    borderRadius: "2px",
                    backgroundColor: "#0140C1",
                    color: White,
                    textDecoration: "none",
                    border: "1px solid #0140C1",
                    boxShadow: "0 4px 16px rgba(1,64,193,0.35)"
                  }}
                >
                  Give Toward the Project
                </Link>
                <a
                  href="https://forms.gle/4Gimdh1WcUerMQvVA"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...T.button,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "48px",
                    padding: "0 28px",
                    borderRadius: "2px",
                    border: `1px solid ${White}`,
                    color: White,
                    textDecoration: "none",
                    background: "transparent"
                  }}
                >
                  Partner With Us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicator dots */}
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          {[0, 1].map((index) => (
            <button
              key={index}
              onClick={() => setHeroSlide(index)}
              aria-label={`Slide ${index + 1}`}
              style={{
                width: heroSlide === index ? "28px" : "8px",
                height: "8px",
                borderRadius: "4px",
                backgroundColor: heroSlide === index ? "#2090FF" : "rgba(255,255,255,0.45)",
                border: "none",
                cursor: "pointer",
                transition: "all 300ms ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </section>

      {/* ══════════════ WELCOME FROM SETMAN ══════════════ */}
      <section className="tph-section" style={{ backgroundColor:Paper100 }}>
        <div className="tph-inner">
          <div className="tph-two-col" style={{ alignItems:"center", gap:"80px" }}>
            <div className="tph-setman-photo" style={{ width:"100%", maxWidth:"480px", height:"360px", backgroundImage:`url('${s.setmanPhotoUrl||D.setmanPhotoUrl}')`, backgroundSize:"cover", backgroundPosition:"center top", borderRadius:"2px" }} />
            <div style={{ display:"flex", flexDirection:"column", gap:"20px", flex:1 }}>
              <h2 style={{ ...T.displayL, color:Navy, margin:0, textTransform:"uppercase" }}>
                {headingLines.map((line: string, i: number) => <span key={i}>{line}{i < headingLines.length-1 && <br />}</span>)}
              </h2>
              <p style={{ ...T.readBody, color:Slate600, margin:0, lineHeight:"1.75em" }}>{setmanBodyText}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"2px", marginTop:"4px" }}>
                <span style={{ fontFamily:"var(--font-poppins)", fontWeight:700, fontSize:"16px", color:Navy }}>Rev. Joshua Agunbiade</span>
                <span style={{ fontFamily:"var(--font-poppins)", fontWeight:400, fontSize:"14px", color:Slate600 }}>Lead Pastor, The Publishers House</span>
              </div>
              <div style={{ marginTop:"8px" }}><Link href={s.setmanBtnUrl||D.setmanBtnUrl} style={{ ...T.button, display:"inline-flex", alignItems:"center", justifyContent:"center", height:"44px", padding:"0 24px", borderRadius:"2px", backgroundColor:Blue700, color:White, textDecoration:"none" }}>{s.setmanBtnLabel||"READ MORE ABOUT US"}</Link></div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ THIS WEEK AT THE HOUSE ══════════════ */}
      <section className="tph-section" style={{ backgroundColor:White }}>
        <div className="tph-inner">
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"40px" }}>
            <div>
              <div style={{ ...T.eyebrow, color:Blue500, marginBottom:"10px" }}>{s.gatheringsLabel||D.gatheringsLabel}</div>
              <h2 style={{ ...T.displayL, color:Navy, margin:0 }}>{s.gatheringsHeading||D.gatheringsHeading}</h2>
            </div>
            <Link href="/events" style={{ ...T.label, color:Blue700, textDecoration:"none" }}>All Events →</Link>
          </div>
          <div className="tph-grid-auto" style={{ marginBottom:"40px" }}>
            {gatherings.map((ev: any, i: number) => (
              <div key={i} style={{ backgroundColor:White, border:`1px solid ${Paper300}`, borderRadius:"4px", padding:"20px", display:"flex", flexDirection:"column", gap:"12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                  <div style={{ textAlign:"center", minWidth:"44px" }}>
                    <div style={{ ...T.label, color:Slate500, fontSize:"9px" }}>{ev.day}</div>
                    <div style={{ ...T.displayM, color:Navy, fontSize:"28px" }}>{ev.date}</div>
                    <div style={{ ...T.label, color:Slate500, fontSize:"9px" }}>{ev.month}</div>
                  </div>
                  <div>
                    <h3 style={{ ...T.displayS, color:Navy, margin:0, fontSize:"16px" }}>{ev.title}</h3>
                    {ev.theme && <div style={{ ...T.eyebrow, color:Blue500, marginTop:"4px" }}>{ev.theme}</div>}
                  </div>
                </div>
                <p style={{ ...T.readSmall, color:Slate600, margin:0, flex:1 }}>{ev.desc}</p>
                <div style={{ display:"flex", alignItems:"center", gap:"6px", paddingTop:"12px", borderTop:`1px solid ${Paper200}`, flexWrap:"wrap" }}>
                  {ev.scripture && <><span style={{ ...T.colophon, color:Blue700 }}>{ev.scripture}</span><span style={{ ...T.colophon, color:Paper400 }}>·</span></>}
                  <span style={{ ...T.colophon, color:Slate500 }}>{ev.time}</span>
                  <span style={{ ...T.colophon, color:Paper400 }}>·</span>
                  <span style={{ ...T.colophon, color:Slate500 }}>{ev.city}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="tph-grid-3 tph-mobile-hide" style={{ height:"300px" }}>
            {((s.gatheringsImages as string[] | undefined)?.length
              ? (s.gatheringsImages as string[])
              : ["/images/event-1.webp", "/images/event-2.webp", "/images/event-3.webp"]
            ).map((img: string, i: number) => (
              <div key={i} style={{ backgroundImage:`url('${img}')`, backgroundSize:"cover", backgroundPosition:"center", borderRadius:"4px" }} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ LATEST TEACHING (5-SERMON CAROUSEL) ══════════════ */}
      <LatestTeachingCarousel
        sermons={latestSermons}
        cmsSettings={cmsSettings}
        defaultTeaching={teach}
      />

      {/* ══════════════ FROM THE ARTICLES (WORTH READING) ══════════════ */}
      <ArticleCarousel />

      {/* ══════════════ WHO WE ARE ══════════════ */}
      <section className="tph-hero" style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:"24px", overflow:"hidden", borderBottom:"none" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`url('${s.whoBgImage||D.whoBgImage}')`, backgroundSize:"cover", backgroundPosition:"center top", zIndex:0 }} />
        <div style={{ position:"absolute", inset:0, backgroundColor:"rgba(21,26,84,0.6)", zIndex:1 }} />
        <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:"24px", maxWidth:"700px" }}>
          <div style={{ ...T.eyebrow, color:Blue300 }}>{s.whoEyebrow||D.whoEyebrow}</div>
          <p style={{ ...T.epigraph, color:White, margin:0 }}>{s.whoQuote||D.whoQuote}</p>
          <p style={{ ...T.readBody, color:"rgba(255,255,255,0.75)", margin:0 }}>{s.whoBody||D.whoBody}</p>
          <Link href={s.whoBtnUrl||D.whoBtnUrl} style={{ ...T.button, display:"inline-flex", alignItems:"center", justifyContent:"center", height:"48px", padding:"0 26px", borderRadius:"2px", border:`1px solid rgba(255,255,255,0.4)`, color:White, textDecoration:"none", marginTop:"8px" }}>{s.whoBtnLabel||D.whoBtnLabel}</Link>
        </div>
      </section>

      {/* ══════════════ WE ARE BUILDING (ANNOUNCEMENT) ══════════════ */}
      {s.annShow !== false && (
        <section className="tph-section" style={{ backgroundColor: White, paddingTop: "40px" }}>
          <div className="tph-inner">
            {(s.annImageUrl || D.annImageUrl) && (
              <div style={{ width: "100%", borderRadius: "4px", marginBottom: "36px", overflow: "hidden", border: `1px solid ${Paper300}` }}>
                <img loading="lazy" src={s.annImageUrl || D.annImageUrl} alt="We Are Building" style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
            )}
            <div style={{ maxWidth: "860px" }}>
              <h2 style={{ ...T.displayL, color: Navy, textTransform: "uppercase", marginBottom: "20px" }}>
                {s.annSubheading || "WE ARE BUILDING"}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
                <p style={{ ...T.readBody, color: Slate600, margin: 0, lineHeight: "1.75em" }}>
                  After five years in rented spaces, The Publishers House has acquired land for a permanent home! We are now building a multi-purpose center featuring an auditorium, lecture halls, offices, and a media studio to continue publishing the Gospel across the nations.
                </p>

                <div style={{ marginTop: "8px" }}>
                  <h3 style={{ ...T.eyebrow, color: Blue700, fontSize: "12px", letterSpacing: "0.14em", marginBottom: "16px" }}>
                    Our Progress &amp; Current Phase
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ padding: "14px 18px", backgroundColor: Paper100, borderLeft: `3px solid ${Slate500}`, borderRadius: "2px" }}>
                      <p style={{ ...T.readSmall, color: Slate600, margin: 0, lineHeight: "1.65em" }}>
                        <strong style={{ color: Navy, fontFamily: "var(--font-poppins)" }}>Phase 1: Land Purchase and Govt documentation and approvals (Completed)</strong> — 10 plots of land fully acquired, approvals and documentation with the government done at ₦40 million (approx. $27,000)
                      </p>
                    </div>

                    <div style={{ padding: "14px 18px", backgroundColor: Paper100, borderLeft: `3px solid ${Slate500}`, borderRadius: "2px" }}>
                      <p style={{ ...T.readSmall, color: Slate600, margin: 0, lineHeight: "1.65em" }}>
                        <strong style={{ color: Navy, fontFamily: "var(--font-poppins)" }}>Phase 2: Preliminary Works (Completed)</strong> — Land fenced, foundation laid, and German floor cast at about ₦65 Million (approx. $44,000).
                      </p>
                    </div>

                    <div style={{ padding: "14px 18px", backgroundColor: "#EFF6FF", borderLeft: `3px solid ${Blue700}`, borderRadius: "2px" }}>
                      <p style={{ ...T.readSmall, color: Navy, margin: 0, lineHeight: "1.65em" }}>
                        <strong style={{ color: Blue700, fontFamily: "var(--font-poppins)" }}>Phase 3: Roof Level (Current Focus)</strong> — Raising the walls, columns, and structural framework of the church and the administrative areas to the roofing level. The estimated cost of this is ₦142,000,000 (approx. $95,000)
                      </p>
                    </div>
                  </div>
                </div>

                <p style={{ ...T.readBody, color: Slate600, margin: 0, lineHeight: "1.7em" }}>
                  We prayerfully invite you to stand with us in this next phase to help bring this vision to life.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link
                  href={s.annBtn1Url || "/giving"}
                  style={{
                    ...T.button,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "48px",
                    padding: "0 28px",
                    borderRadius: "2px",
                    backgroundColor: Blue700,
                    color: White,
                    textDecoration: "none"
                  }}
                >
                  {s.annBtn1Label || "GIVE NOW"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ GIVING ══════════════ */}
      <section className="tph-section" style={{ position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`url('${s.givingBgImage||D.givingBgImage}')`, backgroundSize:"cover", backgroundPosition:"center 25%", zIndex:0 }} />
        <div style={{ position:"absolute", inset:0, backgroundColor:"rgba(21,26,84,0.82)", zIndex:1 }} />
        <div className="tph-two-col tph-inner" style={{ position:"relative", zIndex:2, alignItems:"center" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
            <div style={{ ...T.eyebrow, color:Blue300 }}>{s.givingEyebrow||D.givingEyebrow}</div>
            <h2 style={{ ...T.displayL, color:White, margin:0 }}>{s.givingHeading||D.givingHeading}</h2>
            <p style={{ ...T.readBody, color:"rgba(255,255,255,0.75)", margin:0 }}>{s.givingBody||D.givingBody}</p>
            <Link href={s.givingBtnUrl||D.givingBtnUrl} style={{ ...T.button, display:"inline-flex", alignItems:"center", justifyContent:"center", height:"48px", padding:"0 26px", borderRadius:"2px", alignSelf:"flex-start", border:`1px solid rgba(255,255,255,0.4)`, color:White, textDecoration:"none", marginTop:"8px" }}>{s.givingBtnLabel||D.givingBtnLabel}</Link>
          </div>
          <div className="tph-grid-2">
            {givingCats.map((cat: string) => (
              <Link key={cat} href={s.givingBtnUrl||D.givingBtnUrl} style={{ ...T.button, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", borderRadius:"2px", border:`1px solid rgba(255,255,255,0.3)`, color:White, textDecoration:"none", textAlign:"center" }}>{cat}</Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
