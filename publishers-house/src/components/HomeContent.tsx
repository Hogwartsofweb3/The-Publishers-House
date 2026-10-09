"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ArticleCarousel from "@/components/ArticleCarousel";

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
  displayXL: { fontFamily:"'Poppins',sans-serif", fontWeight:800, fontSize:"clamp(42px,6vw,72px)", lineHeight:"0.98em", letterSpacing:"-0.02em", textTransform:"uppercase" as const },
  displayL:  { fontFamily:"'Poppins',sans-serif", fontWeight:800, fontSize:"clamp(32px,4.5vw,48px)", lineHeight:"1.04em", letterSpacing:"-0.02em", textTransform:"uppercase" as const },
  displayM:  { fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"30px", lineHeight:"1.14em", letterSpacing:"-0.015em", textTransform:"uppercase" as const },
  displayS:  { fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"21px", lineHeight:"1.2em", letterSpacing:"-0.01em", textTransform:"uppercase" as const },
  epigraph:  { fontFamily:"'Playfair Display',serif", fontWeight:400, fontStyle:"italic" as const, fontSize:"clamp(24px,3vw,36px)", lineHeight:"1.3em" },
  readLede:  { fontFamily:"'Playfair Display',serif", fontWeight:400, fontSize:"20px", lineHeight:"1.55em" },
  readBody:  { fontFamily:"'Playfair Display',serif", fontWeight:400, fontSize:"17px", lineHeight:"1.68em" },
  readSmall: { fontFamily:"'Playfair Display',serif", fontWeight:400, fontSize:"14.5px", lineHeight:"1.5em" },
  eyebrow:   { fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:"10px", lineHeight:"1.6em", letterSpacing:"0.2em", textTransform:"uppercase" as const },
  label:     { fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:"11px", lineHeight:"1.6em", letterSpacing:"0.16em", textTransform:"uppercase" as const },
  scripture: { fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:"11px", lineHeight:"1.6em", letterSpacing:"0.14em", textTransform:"uppercase" as const },
  button:    { fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:"12px", lineHeight:"1em", letterSpacing:"0.14em", textTransform:"uppercase" as const },
  colophon:  { fontFamily:"'Poppins',sans-serif", fontWeight:500, fontSize:"10.5px", lineHeight:"1.6em", letterSpacing:"0.1em", textTransform:"uppercase" as const },
};

/* ─── Default / fallback content ─── */
const D = {
  // Hero
  heroEyebrow: "Psalm 68:11",
  heroHeadline: "Company of the Great",
  heroSubtitle: "An apostolic and scriptural ministry in Jos, raising believers whose lives become living publications of Christ.",
  heroBtn1Label: "Plan Your Visit",    heroBtn1Url: "/about",
  heroBtn2Label: "Watch the Last Teaching", heroBtn2Url: "/resources",
  heroSundayLabel: "Sunday Worship",   heroSundayTime: "9:00 AM",
  heroMidweekLabel: "Midweek Service", heroMidweekTime: "5:00 PM",
  heroAddress: "The House of Bread, Korinjoh House, British, Jos · West Africa Time",
  heroBgImage: "/images/hero-v2.webp",

  // Setman
  setmanHeading: "Welcome Message\nfrom the Setman",
  setmanSubtext: "What Paul asks of anyone who handles Scripture in public, and why accuracy is a matter of love before it is a matter of scholarship.",
  setmanBtnLabel: "Read More About Us", setmanBtnUrl: "/about",
  setmanPhotoUrl: "/images/rja-setman.jpg",

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
  annBtn1Label: "Give Now",           annBtn1Url: "https://forms.gle/4Gimdh1WcUerMQvVA",
  annBtn2Label: "See More on Our Building Project", annBtn2Url: "https://forms.gle/4Gimdh1WcUerMQvVA",
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
  { day:"SUN", date:"04", month:"OCT", title:"The Time of the Word", desc:"A continuation of our ongoing series — come ready for an encounter.", scripture:"2 Timothy 2:15", time:"9:00 AM", city:"Jos", theme:"The Time of the Word — Part 6", published:true, order:0 },
  { day:"SUN", date:"04", month:"OCT", title:"FYB Prayer — The Arm of the Lord", desc:"Final Year Brethren gather in prayer, trusting in the strength and mighty hand of God.", scripture:"Isaiah 59:1", time:"3:00 PM", city:"Jos", theme:"The Arm of the Lord", published:true, order:1 },
  { day:"THU", date:"08", month:"OCT", title:"Midweek Service", desc:"Doctrine, spiritual re-alignment and corporate prayer.", scripture:"Acts 2:42", time:"5:00 PM", city:"Jos", published:true, order:2 },
];

export default function HomeContent() {
  const [s, setS] = useState<any>({ ...D });
  const [gatherings, setGatherings] = useState<any[]>(FALLBACK_GATHERINGS);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/home-data")
      .then(r => r.json())
      .then(data => {
        if (data.settings) setS((prev: any) => ({ ...prev, ...data.settings }));
        if (data.gatherings?.length > 0) setGatherings(data.gatherings);
      })
      .catch(() => {});
  }, []);

  const headingLines = (s.setmanHeading || D.setmanHeading).split("\n");
  const teachColophon = (s.teachingColophon || D.teachingColophon).split(",").map((x: string) => x.trim()).filter(Boolean);
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
                <Link href={s.heroBtn1Url || D.heroBtn1Url} style={{ ...T.button, display: "inline-flex", alignItems: "center", justifyContent: "center", height: "48px", padding: "0 26px", borderRadius: "2px", border: `1px solid ${White}`, color: White, textDecoration: "none", background: "transparent" }}>{s.heroBtn1Label || D.heroBtn1Label}</Link>
                <Link href="/sermons" style={{ ...T.button, display: "inline-flex", alignItems: "center", justifyContent: "center", height: "48px", padding: "0 26px", borderRadius: "2px", border: `1px solid ${White}`, color: White, textDecoration: "none", background: "transparent" }}>{s.heroBtn2Label || D.heroBtn2Label}</Link>
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
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="none"
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
            {/* Deep blue overlay matching Slide 1 */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(21,26,84,0.88) 0%, rgba(1,64,193,0.55) 100%)", zIndex: 1 }} />
            
            <div className="tph-hero" style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "880px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px", padding: "40px 20px" }}>
              <div style={{ ...T.scripture, color: "#2090FF", backgroundColor: "rgba(32,144,255,0.15)", padding: "4px 16px", borderRadius: "20px", border: "1px solid rgba(32,144,255,0.3)" }}>
                Special Announcement
              </div>
              <h1 style={{ ...T.displayXL, color: White, margin: 0, letterSpacing: "-0.02em" }}>
                We Are Building
              </h1>
              <p style={{ ...T.readLede, color: "rgba(255,255,255,0.9)", maxWidth: "680px", margin: 0, lineHeight: "1.65em" }}>
                After five years of meeting in rented spaces, we have successfully acquired land for a permanent ministry home. Our next step is to build &quot;The Publishers House,&quot; a multi-purpose facility that will include an auditorium, lecture halls, offices, and a media studio. We prayerfully invite you to partner with us in this exciting building phase.
              </p>
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
                    backgroundColor: "#2090FF",
                    color: White,
                    textDecoration: "none",
                    border: "1px solid #2090FF",
                    boxShadow: "0 4px 16px rgba(32,144,255,0.35)"
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
              <h2 style={{ ...T.displayL, color:Navy, margin:0 }}>
                {headingLines.map((line: string, i: number) => <span key={i}>{line}{i < headingLines.length-1 && <br />}</span>)}
              </h2>
              <p style={{ ...T.readBody, color:Slate600, margin:0 }}>{s.setmanSubtext||D.setmanSubtext}</p>
              <div><Link href={s.setmanBtnUrl||D.setmanBtnUrl} style={{ ...T.button, display:"inline-flex", alignItems:"center", justifyContent:"center", height:"44px", padding:"0 24px", borderRadius:"2px", backgroundColor:Blue700, color:White, textDecoration:"none" }}>{s.setmanBtnLabel||D.setmanBtnLabel}</Link></div>
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
            {["event-1.jpg","event-2.jpg","event-3.jpg"].map((img, i) => (
              <div key={i} style={{ backgroundImage:`url('/images/${img}')`, backgroundSize:"cover", backgroundPosition:"center", borderRadius:"4px" }} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ LATEST TEACHING ══════════════ */}
      <section className="tph-section" style={{ backgroundColor:Paper100 }}>
        <div className="tph-inner">
          <div style={{ ...T.eyebrow, color:Slate500, marginBottom:"8px" }}>{s.teachingEyebrow||D.teachingEyebrow}</div>
          <h2 style={{ ...T.displayM, color:Navy, marginBottom:"40px" }}>{s.teachingHeading||D.teachingHeading}</h2>
          <div className="tph-two-col" style={{ gap:"0", border:`1px solid ${Paper300}`, borderRadius:"4px", overflow:"hidden" }}>
            <div style={{ backgroundImage:`url('${s.teachingImageUrl||D.teachingImageUrl}')`, backgroundSize:"cover", backgroundPosition:"center", minHeight:"340px", height:"100%" }} />
            <div style={{ padding:"40px", display:"flex", flexDirection:"column", justifyContent:"center", gap:"16px" }}>
              <div style={{ ...T.eyebrow, color:Blue500 }}>{s.teachingSeriesEyebrow||D.teachingSeriesEyebrow}</div>
              <h3 style={{ ...T.displayL, color:Navy, margin:0, fontSize:"clamp(24px,3vw,36px)" }}>{s.teachingTitle||D.teachingTitle}</h3>
              <p style={{ ...T.readBody, color:Slate600, margin:0 }}>{s.teachingDesc||D.teachingDesc}</p>
              <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                <Link href={s.teachingBtn1Url||D.teachingBtn1Url} style={{ ...T.button, display:"inline-flex", alignItems:"center", justifyContent:"center", height:"48px", padding:"0 26px", borderRadius:"2px", backgroundColor:Blue700, color:White, textDecoration:"none" }}>{s.teachingBtn1Label||D.teachingBtn1Label}</Link>
                <Link href={s.teachingBtn2Url||D.teachingBtn2Url} style={{ ...T.button, display:"inline-flex", alignItems:"center", justifyContent:"center", height:"48px", padding:"0 26px", borderRadius:"2px", border:`1px solid ${Paper300}`, color:Navy, textDecoration:"none" }}>{s.teachingBtn2Label||D.teachingBtn2Label}</Link>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap", paddingTop:"16px", borderTop:`1px solid ${Paper200}` }}>
                {teachColophon.map((item: string, i: number, arr: string[]) => (
                  <span key={i} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <span style={{ ...T.colophon, color: i===0 ? Blue700 : Slate500 }}>{item}</span>
                    {i < arr.length-1 && <span style={{ ...T.colophon, color:Paper400 }}>·</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* ══════════════ SPECIAL ANNOUNCEMENT ══════════════ */}
      {s.annShow !== false && (
        <section className="tph-section" style={{ backgroundColor:White }}>
          <div className="tph-inner">
            <h2 style={{ ...T.displayM, color:Navy, marginBottom:"32px" }}>{s.annHeading||D.annHeading}</h2>
            {(s.annImageUrl||D.annImageUrl) && (
              <div style={{ width:"100%", borderRadius:"4px", marginBottom:"40px", overflow:"hidden", border:`1px solid ${Paper300}` }}>
                <img loading="lazy" src={s.annImageUrl||D.annImageUrl} alt="Announcement" style={{ width:"100%", height:"auto", display:"block" }} />
              </div>
            )}
            <div style={{ maxWidth:"640px" }}>
              <h3 style={{ ...T.displayM, color:Navy, marginBottom:"16px" }}>{s.annSubheading||D.annSubheading}</h3>
              <p style={{ ...T.readBody, color:Slate600, marginBottom:"28px" }}>{s.annBody||D.annBody}</p>
              <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                <a href={s.annBtn1Url||D.annBtn1Url} target="_blank" rel="noopener noreferrer" style={{ ...T.button, display:"inline-flex", alignItems:"center", justifyContent:"center", height:"48px", padding:"0 26px", borderRadius:"2px", backgroundColor:Blue700, color:White, textDecoration:"none" }}>{s.annBtn1Label||D.annBtn1Label}</a>
                <a href={s.annBtn2Url||D.annBtn2Url} target="_blank" rel="noopener noreferrer" style={{ ...T.button, display:"inline-flex", alignItems:"center", justifyContent:"center", height:"48px", padding:"0 26px", borderRadius:"2px", border:`1px solid ${Paper300}`, color:Navy, textDecoration:"none" }}>{s.annBtn2Label||D.annBtn2Label}</a>
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
