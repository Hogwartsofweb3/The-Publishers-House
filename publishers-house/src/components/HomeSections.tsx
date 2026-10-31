"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";

/* ── Tokens ── */
const Navy   = "#151A54";
const Slate600 = "#4A62A0";
const Blue500 = "#2090FF";
const Blue700 = "#0140C1";
const Paper100 = "#F4F6FB";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const Paper400 = "#C0C9E0";
const Slate500 = "#747CA1";
const White   = "#FFFFFF";

const T = {
  displayL:  { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(32px,4.5vw,48px)", lineHeight: "1.04em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  displayM:  { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "28px", lineHeight: "1.14em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  displayS:  { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "21px", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  readSmall: { fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: "14px", lineHeight: "1.5em" },
  readBody:  { fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: "16px", lineHeight: "1.68em" },
  eyebrow:   { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  label:     { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  button:    { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  colophon:  { fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
};

/* ── Static fallback (shown until Firestore loads) ── */
const FALLBACK_GATHERINGS = [
  { day: "SUN", date: "04", month: "OCT", title: "The Time of the Word", desc: "A continuation of our ongoing series — come ready for an encounter with the Word.", scripture: "2 Timothy 2:15", time: "9:00 AM WAT", city: "Jos", speaker: "Rev. Joshua Agunbiade", theme: "The Time of the Word — Part 6", published: true },
  { day: "SUN", date: "04", month: "OCT", title: "FYB Prayer — The Arm of the Lord", desc: "Final Year Brethren gather in prayer, trusting in the strength and mighty hand of God.", scripture: "Isaiah 59:1", time: "3:00 PM WAT", city: "Jos", speaker: "Rev. Joshua Agunbiade", theme: "The Arm of the Lord", published: true },
  { day: "THU", date: "08", month: "OCT", title: "Midweek Service", desc: "Doctrine, spiritual re-alignment and corporate prayer.", scripture: "Acts 2:42", time: "4:30 PM WAT", city: "Jos", speaker: "", theme: "", published: true },
];

const DEFAULT_SETTINGS = {
  setmanHeading: "WELCOME MESSAGE\nFROM THE SETMAN",
  setmanSubtext: "The Publishers House is an Apostolic community devoted to sound biblical teaching, prayer, and equipping believers to reflect Christ in their generation. Inspired by Psalm 68:11, we welcome you to the Company of the Great.",
  setmanButtonLabel: "READ MORE ABOUT US",
  setmanButtonUrl: "/about",
  setmanPhotoUrl: "/images/rja-setman.jpg",
  gatheringsHeading: "This Week at the House",
  gatheringsLabel: "Next Gatherings",
};

interface HomeSectionProps {
  photoStrip?: string[];
}

export default function HomeSections({ photoStrip = ["event-1.jpg", "event-2.jpg", "event-3.jpg"] }: HomeSectionProps) {
  const [gatherings, setGatherings] = useState<any[]>(FALLBACK_GATHERINGS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    /* Fetch gatherings */
    getDocs(query(collection(db, "gatherings"), orderBy("order", "asc")))
      .then((snap) => {
        const live = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((g: any) => g.published !== false);
        if (live.length > 0) setGatherings(live);
      })
      .catch(() => { /* keep fallback */ });

    /* Fetch homepage settings */
    getDoc(doc(db, "homeSettings", "main"))
      .then((snap) => {
        if (snap.exists()) setSettings({ ...DEFAULT_SETTINGS, ...snap.data() });
      })
      .catch(() => { /* keep defaults */ });
  }, []);

  /* ── Welcome section ── */
  const headingLines = settings.setmanHeading.split("\n");

  return (
    <>
      {/* ── WELCOME FROM THE SETMAN ── */}
      <section className="tph-section" style={{ backgroundColor: Paper100 }}>
        <div className="tph-inner">
          <div className="tph-two-col" style={{ alignItems: "center", gap: "80px" }}>
            {/* Photo */}
            <div
              className="tph-setman-photo"
              style={{
                width: "100%", maxWidth: "480px", height: "360px",
                backgroundImage: `url('${settings.setmanPhotoUrl}')`,
                backgroundSize: "cover", backgroundPosition: "center top", borderRadius: "2px",
              }}
            />
            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
              <h2 style={{ ...T.displayL, color: Navy, margin: 0, textTransform: "uppercase" }}>
                {headingLines.map((line, i) => (
                  <span key={i}>{line}{i < headingLines.length - 1 && <br />}</span>
                ))}
              </h2>
              <p style={{ ...T.readBody, color: Slate600, margin: 0, lineHeight: "1.75em" }}>
                {settings.setmanSubtext}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                <span style={{ fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "16px", color: Navy }}>Rev. Joshua Agunbiade</span>
                <span style={{ fontFamily: "var(--font-poppins)", fontWeight: 400, fontSize: "14px", color: Slate600 }}>Lead Pastor, The Publishers House</span>
              </div>
              <div style={{ marginTop: "8px" }}>
                <Link
                  href={settings.setmanButtonUrl}
                  style={{
                    ...T.button,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    height: "44px", padding: "0 24px", borderRadius: "2px",
                    backgroundColor: Blue700, color: White, textDecoration: "none",
                  }}
                >
                  {settings.setmanButtonLabel || "READ MORE ABOUT US"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THIS WEEK AT THE HOUSE ── */}
      <section className="tph-section" style={{ backgroundColor: White }}>
        <div className="tph-inner">
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "40px" }}>
            <div>
              <div style={{ ...T.eyebrow, color: Blue500, marginBottom: "10px" }}>{settings.gatheringsLabel}</div>
              <h2 style={{ ...T.displayL, color: Navy, margin: 0 }}>{settings.gatheringsHeading}</h2>
            </div>
            <Link href="/schedule" style={{ ...T.label, color: Blue700, textDecoration: "none" }}>All Events →</Link>
          </div>

          {/* Event cards — clicking opens TPH YouTube channel */}
          <div className="tph-grid-auto" style={{ marginBottom: "40px" }}>
            {gatherings.map((ev, i) => (
              <a
                key={i}
                href={ev.youtubeUrl || "https://www.youtube.com/@ThePublishersHouse"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: White, border: `1px solid ${Paper300}`,
                  borderRadius: "4px", padding: "20px",
                  display: "flex", flexDirection: "column", gap: "12px",
                  textDecoration: "none", color: "inherit",
                  transition: "border-color 0.18s, box-shadow 0.18s, transform 0.18s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.borderColor = "#FF0000";
                  el.style.boxShadow = "0 4px 24px rgba(255,0,0,0.10)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.borderColor = Paper300;
                  el.style.boxShadow = "none";
                  el.style.transform = "translateY(0)";
                }}
              >
                {/* Date badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ textAlign: "center", minWidth: "44px" }}>
                    <div style={{ ...T.label, color: Slate500, fontSize: "9px" }}>{ev.day}</div>
                    <div style={{ ...T.displayM, color: Navy, fontSize: "28px" }}>{ev.date}</div>
                    <div style={{ ...T.label, color: Slate500, fontSize: "9px" }}>{ev.month}</div>
                  </div>
                  <div>
                    <h3 style={{ ...T.displayS, color: Navy, margin: 0, fontSize: "16px" }}>{ev.title}</h3>
                    {ev.theme && (
                      <div style={{ ...T.eyebrow, color: Blue500, marginTop: "4px" }}>{ev.theme}</div>
                    )}
                  </div>
                </div>

                <p style={{ ...T.readSmall, color: Slate600, margin: 0, flex: 1 }}>{ev.desc}</p>

                {/* Colophon + YouTube CTA chip */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", paddingTop: "12px", borderTop: `1px solid ${Paper200}`, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    {ev.scripture && <>
                      <span style={{ ...T.colophon, color: Blue700 }}>{ev.scripture}</span>
                      <span style={{ ...T.colophon, color: Paper400 }}>·</span>
                    </>}
                    <span style={{ ...T.colophon, color: Slate500 }}>{ev.time}</span>
                    <span style={{ ...T.colophon, color: Paper400 }}>·</span>
                    <span style={{ ...T.colophon, color: Slate500 }}>{ev.city}</span>
                  </div>
                  {/* YouTube "Watch Live" badge */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    padding: "3px 9px", borderRadius: "20px",
                    backgroundColor: "rgba(255,0,0,0.07)",
                    border: "1px solid rgba(255,0,0,0.20)",
                    ...T.colophon, color: "#CC0000", fontSize: "9px", flexShrink: 0,
                  }}>
                    <svg width="11" height="8" viewBox="0 0 24 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.5 2.7a3 3 0 0 0-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.6A3 3 0 0 0 .5 2.7C0 4.6 0 8.5 0 8.5s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1C4.5 17 12 17 12 17s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 12.4 24 8.5 24 8.5s0-3.9-.5-5.8z" fill="#FF0000"/>
                      <path d="M9.5 12.1V4.9l6.3 3.6-6.3 3.6z" fill="#fff"/>
                    </svg>
                    Watch Live
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* 3 photo strip */}
          <div className="tph-grid-3 tph-mobile-hide" style={{ height: "300px" }}>
            {photoStrip.map((img, i) => (
              <div
                key={i}
                style={{
                  backgroundImage: `url('/images/${img}')`,
                  backgroundSize: "cover", backgroundPosition: "center", borderRadius: "4px",
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
