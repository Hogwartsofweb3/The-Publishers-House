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
  displayL:  { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(32px,4.5vw,48px)", lineHeight: "1.04em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  displayM:  { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "30px", lineHeight: "1.14em", letterSpacing: "-0.015em", textTransform: "uppercase" as const },
  displayS:  { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "21px", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  readSmall: { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
  readBody:  { fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: "17px", lineHeight: "1.68em" },
  eyebrow:   { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  label:     { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  button:    { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  colophon:  { fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
};

/* ── Static fallback (shown until Firestore loads) ── */
const FALLBACK_GATHERINGS = [
  { day: "SUN", date: "04", month: "OCT", title: "The Time of the Word", desc: "A continuation of our ongoing series — come ready for an encounter with the Word.", scripture: "2 Timothy 2:15", time: "9:00 AM", city: "Jos", speaker: "Rev. Joshua Agunbiade", theme: "The Time of the Word — Part 6", published: true },
  { day: "SUN", date: "04", month: "OCT", title: "FYB Prayer — The Arm of the Lord", desc: "Final Year Brethren gather in prayer, trusting in the strength and mighty hand of God.", scripture: "Isaiah 59:1", time: "3:00 PM", city: "Jos", speaker: "Rev. Joshua Agunbiade", theme: "The Arm of the Lord", published: true },
  { day: "THU", date: "08", month: "OCT", title: "Midweek Service", desc: "Doctrine, spiritual re-alignment and corporate prayer.", scripture: "Acts 2:42", time: "5:00 PM", city: "Jos", speaker: "", theme: "", published: true },
];

const DEFAULT_SETTINGS = {
  setmanHeading: "Welcome Message\nfrom the Setman",
  setmanSubtext: "What Paul asks of anyone who handles Scripture in public, and why accuracy is a matter of love before it is a matter of scholarship.",
  setmanButtonLabel: "Read More About Us",
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
              <h2 style={{ ...T.displayL, color: Navy, margin: 0 }}>
                {headingLines.map((line, i) => (
                  <span key={i}>{line}{i < headingLines.length - 1 && <br />}</span>
                ))}
              </h2>
              <p style={{ ...T.readBody, color: Slate600, margin: 0 }}>
                {settings.setmanSubtext}
              </p>
              <div>
                <Link
                  href={settings.setmanButtonUrl}
                  style={{
                    ...T.button,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    height: "44px", padding: "0 24px", borderRadius: "2px",
                    backgroundColor: Blue700, color: White, textDecoration: "none",
                  }}
                >
                  {settings.setmanButtonLabel}
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
            <Link href="/events" style={{ ...T.label, color: Blue700, textDecoration: "none" }}>All Events →</Link>
          </div>

          {/* Event cards */}
          <div className="tph-grid-auto" style={{ marginBottom: "40px" }}>
            {gatherings.map((ev, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: White, border: `1px solid ${Paper300}`,
                  borderRadius: "4px", padding: "20px",
                  display: "flex", flexDirection: "column", gap: "12px",
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

                {/* Colophon */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "12px", borderTop: `1px solid ${Paper200}`, flexWrap: "wrap" }}>
                  {ev.scripture && <>
                    <span style={{ ...T.colophon, color: Blue700 }}>{ev.scripture}</span>
                    <span style={{ ...T.colophon, color: Paper400 }}>·</span>
                  </>}
                  <span style={{ ...T.colophon, color: Slate500 }}>{ev.time}</span>
                  <span style={{ ...T.colophon, color: Paper400 }}>·</span>
                  <span style={{ ...T.colophon, color: Slate500 }}>{ev.city}</span>
                </div>
              </div>
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
