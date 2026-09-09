import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "The Publishers House",
  description:
    "The Publishers House — a teaching-focused apostolic church in Jos, Plateau State. Led by Dr. Joshua Agunbiade.",
};

// ── Design tokens (Figma exact) ─────────────────────────────────────────────
const Navy = "#151A54";
const Slate600 = "#4A62A0";
const Blue500 = "#2090FF";
const Blue700 = "#0140C1";
const Blue300 = "#6496EF";
const Paper100 = "#F4F6FB";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const Paper400 = "#C0C9E0";
const Slate500 = "#747CA1";
const White = "#FFFFFF";

const T = {
  displayXL:  { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "clamp(42px,6vw,72px)", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  displayL:   { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "clamp(32px,4.5vw,48px)", lineHeight: "1.04em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  displayM:   { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "30px", lineHeight: "1.14em", letterSpacing: "-0.015em", textTransform: "uppercase" as const },
  displayS:   { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "21px", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  epigraph:   { fontFamily: "var(--font-playfair)", fontWeight: 400, fontStyle: "italic" as const, fontSize: "clamp(24px,3vw,36px)", lineHeight: "1.3em" },
  readLede:   { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
  readBody:   { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "17px", lineHeight: "1.68em" },
  readSmall:  { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
  eyebrow:    { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  label:      { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  scripture:  { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  button:     { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  colophon:   { fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
};

// ── Programs data ────────────────────────────────────────────────────────────
const programs = [
  {
    slug: "festival-of-light",
    name: "Festival of Light",
    schedule: "Annual Homecoming Conference",
    desc: "Believers from across the world gather for worship, sound teaching, Holy Ghost expressions and fellowship.",
    scripture: "Isaiah 60:1",
    freq: "Annual",
    city: "Jos",
    logoImage: "/images/fol-logo.png",
  },
  {
    slug: "merismos",
    name: "Merismos",
    schedule: "Annual Conference",
    desc: "A power-packed encounter where the Word is rightly taught and the Holy Spirit moves tangibly to transform lives.",
    scripture: "Hebrews 4:12",
    freq: "Annual",
    city: "Jos",
    logoImage: "/images/merismos-logo.png",
  },
  {
    slug: "jesus-convention",
    name: "Jesus Convention",
    schedule: "Annual · Easter",
    desc: "Unveiling the person, finished work and lordship of Jesus Christ through sound teaching, prayer and worship.",
    scripture: "Philippians 2:10",
    freq: "Easter",
    city: "Jos",
    logoImage: "/images/jc-logo.png",
  },
  {
    slug: "the-forge",
    name: "The Forge",
    schedule: "Monthly · End of Month",
    desc: "An intensive prayer gathering running Wednesday to Friday and culminating in an overnight vigil.",
    scripture: "Jeremiah 23:20",
    freq: "Monthly",
    city: "Jos",
    logoImage: "/images/forge-logo.png",
  },
  {
    slug: "abuja-apostolic-camp",
    name: "Abuja Apostolic Camp",
    schedule: "Monthly · Abuja",
    desc: "A close spiritual camp focused on equipping believers, prophetic words and deep spiritual alignment.",
    scripture: "Ephesians 4:11",
    freq: "Monthly",
    city: "Abuja",
    logoImage: "/images/aac-logo.png",
  },
  {
    slug: "sunday-midweek",
    name: "Sunday & Midweek",
    schedule: "Every Week",
    desc: "Sunday worship at 9:00 AM is the core weekly gathering. Thursday at 5:00 PM is doctrine and corporate prayer.",
    scripture: "Acts 2:42",
    freq: "Weekly",
    city: "Jos",
    logoImage: "/images/tph-logo.png",
  },
];

// ── Event data ───────────────────────────────────────────────────────────────
const events = [
  { day: "THU", date: "13", title: "Midweek Service", desc: "Doctrine, spiritual re-alignment and corporate prayer.", scripture: "2 Timothy 3:16", time: "5:00 PM", city: "Jos" },
  { day: "SUN", date: "16", title: "Sunday Worship", desc: "Intense worship and in-depth teaching of the Word.", scripture: "Colossians 3:16", time: "9:00 AM", city: "Jos" },
  { day: "AUG", date: "26", title: "The Forge", desc: "Wednesday to Friday of prayer, closing with the Friday overnight vigil.", scripture: "Jeremiah 23:29", time: "Monthly", city: "Jos" },
  { day: "SEP", date: "05", title: "Abuja Apostolic Camp", desc: "Equipping, prophetic ministry and deep spiritual alignment.", scripture: "Ephesians 4:11", time: "Monthly", city: "Abuja" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ════════════════════════════════════════════════════════════════════
            HERO — Full-bleed congregation photo + navy overlay
            Figma: #27:1481 — centred column, 90px 100px pad
        ════════════════════════════════════════════════════════════════════ */}
        <section
          style={{
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            paddingTop: "70px", // navbar height
          }}
        >
          {/* Background photo */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/images/hero.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              zIndex: 0,
            }}
          />
          {/* Navy overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(21, 26, 84, 0.78)",
              zIndex: 1,
            }}
          />

          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              maxWidth: "1440px",
              margin: "0 auto",
              padding: "90px 100px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "20px",
            }}
          >
            {/* Psalm 68:11 scripture eyebrow */}
            <div style={{ ...T.scripture, color: Blue300 }}>Psalm 68:11</div>

            {/* Main headline */}
            <h1 style={{ ...T.displayXL, color: White, margin: 0 }}>
              A Great Company
            </h1>

            {/* Epigraph */}
            <p style={{ ...T.epigraph, color: White, margin: 0 }}>
              of those that publish
            </p>

            {/* Body */}
            <p style={{ ...T.readLede, color: "rgba(255,255,255,0.82)", maxWidth: "560px", margin: 0 }}>
              An apostolic and scriptural ministry in Jos, raising believers whose lives become living publications of Christ.
            </p>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" }}>
              <Link
                href="/about"
                style={{
                  ...T.button,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  height: "48px", padding: "0 26px", borderRadius: "2px",
                  border: `1px solid ${White}`, color: White, textDecoration: "none",
                  background: "transparent",
                }}
              >
                Plan Your Visit
              </Link>
              <Link
                href="/resources"
                style={{
                  ...T.button,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  height: "48px", padding: "0 26px", borderRadius: "2px",
                  border: `1px solid ${White}`, color: White, textDecoration: "none",
                  background: "transparent",
                }}
              >
                Watch the Last Teaching
              </Link>
            </div>

            {/* Service times strip */}
            <div style={{ display: "flex", gap: "0", marginTop: "16px", border: `1px solid rgba(255,255,255,0.25)`, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ padding: "16px 32px", borderRight: `1px solid rgba(255,255,255,0.25)`, textAlign: "center" }}>
                <div style={{ ...T.eyebrow, color: Blue300, marginBottom: "6px" }}>Sunday Worship</div>
                <div style={{ ...T.displayS, color: White }}>9:00 AM</div>
              </div>
              <div style={{ padding: "16px 32px", textAlign: "center" }}>
                <div style={{ ...T.eyebrow, color: Blue300, marginBottom: "6px" }}>Midweek Service</div>
                <div style={{ ...T.displayS, color: White }}>5:00 PM</div>
              </div>
            </div>

            {/* Address */}
            <div style={{ ...T.colophon, color: "rgba(255,255,255,0.5)", marginTop: "8px" }}>
              The House of Bread, Korinjoh House, British, Jos · West Africa Time
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            THIS WEEK AT THE HOUSE — 4 event cards + 3 photo strip
            Figma: Next Gatherings section
        ════════════════════════════════════════════════════════════════════ */}
        <section style={{ backgroundColor: Paper100, padding: "80px 100px 0" }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "40px" }}>
            <div>
              <div style={{ ...T.eyebrow, color: Blue500, marginBottom: "10px" }}>Next Gatherings</div>
              <h2 style={{ ...T.displayL, color: Navy, margin: 0 }}>This Week at the House</h2>
            </div>
            <Link href="/events" style={{ ...T.label, color: Blue700, textDecoration: "none" }}>
              All Events →
            </Link>
          </div>

          {/* 4 event cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
            {events.map((ev) => (
              <div
                key={ev.title}
                style={{
                  backgroundColor: White,
                  border: `1px solid ${Paper300}`,
                  borderRadius: "4px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Date badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ textAlign: "center", minWidth: "44px" }}>
                    <div style={{ ...T.label, color: Slate500, fontSize: "9px" }}>{ev.day}</div>
                    <div style={{ ...T.displayM, color: Navy, fontSize: "28px" }}>{ev.date}</div>
                  </div>
                  <h3 style={{ ...T.displayS, color: Navy, margin: 0, fontSize: "16px" }}>{ev.title}</h3>
                </div>

                <p style={{ ...T.readSmall, color: Slate600, margin: 0, flex: 1 }}>{ev.desc}</p>

                {/* Colophon */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "12px", borderTop: `1px solid ${Paper200}`, flexWrap: "wrap" }}>
                  <span style={{ ...T.colophon, color: Blue700 }}>{ev.scripture}</span>
                  <span style={{ ...T.colophon, color: Paper400 }}>·</span>
                  <span style={{ ...T.colophon, color: Slate500 }}>{ev.time}</span>
                  <span style={{ ...T.colophon, color: Paper400 }}>·</span>
                  <span style={{ ...T.colophon, color: Slate500 }}>{ev.city}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 3 photo strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0", height: "240px" }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  backgroundImage: "url('/images/hero.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: `center ${i === 1 ? "30%" : i === 2 ? "50%" : "70%"}`,
                }}
              />
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            PUBLISHED THIS WEEK — Latest teaching
            Figma: two-column image + text layout
        ════════════════════════════════════════════════════════════════════ */}
        <section style={{ backgroundColor: White, padding: "80px 100px" }}>
          <div style={{ ...T.eyebrow, color: Slate500, marginBottom: "8px" }}>The Latest Teaching</div>
          <h2 style={{ ...T.displayM, color: Navy, marginBottom: "40px" }}>Published This Week</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0",
              border: `1px solid ${Paper300}`,
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            {/* Left: sermon photo */}
            <div
              style={{
                backgroundImage: "url('/images/hero.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "340px",
              }}
            />

            {/* Right: sermon info */}
            <div style={{ padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" }}>
              <div style={{ ...T.eyebrow, color: Blue500 }}>Foundations · Part Eight</div>
              <h3 style={{ ...T.displayL, color: Navy, margin: 0, fontSize: "clamp(24px,3vw,36px)" }}>
                A Workman Unashamed
              </h3>
              <p style={{ ...T.readBody, color: Slate600, margin: 0 }}>
                What Paul asks of anyone who handles Scripture in public, and why accuracy is a matter of love before it is a matter of scholarship.
              </p>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link
                  href="/resources"
                  style={{
                    ...T.button,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    height: "48px", padding: "0 26px", borderRadius: "2px",
                    backgroundColor: Blue700, color: White, textDecoration: "none",
                  }}
                >
                  Listen — 48:12
                </Link>
                <Link
                  href="/resources"
                  style={{
                    ...T.button,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    height: "48px", padding: "0 26px", borderRadius: "2px",
                    border: `1px solid ${Paper300}`, color: Navy, textDecoration: "none",
                  }}
                >
                  Read the Transcript
                </Link>
              </div>

              {/* Colophon */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", paddingTop: "16px", borderTop: `1px solid ${Paper200}` }}>
                {["2 Timothy 2:15", "Foundations", "Dr. Joshua Agunbiade", "Jos", "48:12"].map((item, i, arr) => (
                  <span key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ ...T.colophon, color: i === 0 ? Blue700 : Slate500 }}>{item}</span>
                    {i < arr.length - 1 && <span style={{ ...T.colophon, color: Paper400 }}>·</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            WHO WE ARE — navy + congregation photo background
            Figma: full-bleed navy section with italic epigraph
        ════════════════════════════════════════════════════════════════════ */}
        <section
          style={{
            position: "relative",
            padding: "96px 100px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "24px",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/who-we-are-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center top", zIndex: 0 }} />
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(21,26,84,0.88)", zIndex: 1 }} />

          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", maxWidth: "700px" }}>
            <div style={{ ...T.eyebrow, color: Blue300 }}>Who We Are</div>
            <p style={{ ...T.epigraph, color: White, margin: 0 }}>
              Every believer is commissioned to become a publisher of God&apos;s message.
            </p>
            <p style={{ ...T.readBody, color: "rgba(255,255,255,0.75)", margin: 0 }}>
              Established in 2020 under the leadership of Dr. Joshua Agunbiade, the ministry exists to equip believers, strengthen the Church and advance the Kingdom through biblical teaching, revival and apologetics.
            </p>
            <Link
              href="/about"
              style={{
                ...T.button,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                height: "48px", padding: "0 26px", borderRadius: "2px",
                border: `1px solid rgba(255,255,255,0.4)`, color: White, textDecoration: "none",
                marginTop: "8px",
              }}
            >
              Read What We Believe
            </Link>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SPECIAL ANNOUNCEMENT — Building Project
            Figma: Centre stage — Pastor Josh's priority
        ════════════════════════════════════════════════════════════════════ */}
        <section style={{ backgroundColor: Paper100, padding: "80px 100px" }}>
          <h2 style={{ ...T.displayM, color: Navy, marginBottom: "32px" }}>Special Announcement</h2>

          {/* Building rendering — real image, cropped to top half only */}
          <div
            style={{
              width: "100%",
              height: "420px",
              borderRadius: "4px",
              marginBottom: "40px",
              overflow: "hidden",
              border: `1px solid ${Paper300}`,
            }}
          >
            <img
              src="/images/building-render.jpg"
              alt="The Publishers House building rendering"
              style={{
                width: "100%",
                height: "840px",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
              }}
            />
          </div>

          <div style={{ maxWidth: "640px" }}>
            <h3 style={{ ...T.displayM, color: Navy, marginBottom: "16px" }}>We Are Building</h3>
            <p style={{ ...T.readBody, color: Slate600, marginBottom: "28px" }}>
              After five years of meeting in rented spaces, we have successfully acquired land for a permanent ministry home. Our next step is to build &ldquo;The Publishers House,&rdquo; a multi-purpose facility that will include an auditorium, lecture halls, offices, and a media studio. We prayerfully invite you to partner with us in this exciting building phase.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a
                href="https://forms.gle/4Gimdh1WcUerMQvVA"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...T.button,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  height: "48px", padding: "0 26px", borderRadius: "2px",
                  backgroundColor: Blue700, color: White, textDecoration: "none",
                }}
              >
                Give Now
              </a>
              <a
                href="https://forms.gle/4Gimdh1WcUerMQvVA"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...T.button,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  height: "48px", padding: "0 26px", borderRadius: "2px",
                  border: `1px solid ${Paper300}`, color: Navy, textDecoration: "none",
                }}
              >
                See More on Our Building Project
              </a>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            FLAGSHIP PROGRAMS — 6-card grid with program logos
            Figma: WHERE THE WORD IS PUBLISHED
        ════════════════════════════════════════════════════════════════════ */}
        <section style={{ backgroundColor: White, padding: "80px 100px" }}>
          <div style={{ ...T.eyebrow, color: Blue500, marginBottom: "10px" }}>Flagship Programs</div>
          <h2 style={{ ...T.displayL, color: Navy, marginBottom: "48px" }}>Where the Word Is Published</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {programs.map((prog) => (
              <Link
                key={prog.slug}
                href={`/programs`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    border: `1px solid ${Paper300}`,
                    borderRadius: "4px",
                    overflow: "hidden",
                    backgroundColor: White,
                    transition: "box-shadow 150ms ease",
                    cursor: "pointer",
                  }}
                >
                  {/* Logo plate — real image, show top half only */}
                  <div
                    style={{
                      height: "160px",
                      overflow: "hidden",
                      borderBottom: `1px solid ${Paper300}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: Paper100,
                    }}
                  >
                    <img
                      src={prog.logoImage}
                      alt={prog.name}
                      style={{
                        width: "100%",
                        height: "220px",
                        objectFit: "contain",
                        objectPosition: "center top",
                        padding: "20px 28px",
                      }}
                    />
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ ...T.eyebrow, color: Blue500 }}>{prog.schedule}</div>
                    <h3 style={{ ...T.displayS, color: Navy, margin: 0 }}>{prog.name}</h3>
                    <p style={{ ...T.readSmall, color: Slate600, margin: 0 }}>{prog.desc}</p>

                    {/* Colophon */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "12px", borderTop: `1px solid ${Paper200}`, flexWrap: "wrap" }}>
                      <span style={{ ...T.colophon, color: Blue700 }}>{prog.scripture}</span>
                      <span style={{ ...T.colophon, color: Paper400 }}>·</span>
                      <span style={{ ...T.colophon, color: Slate500 }}>{prog.freq}</span>
                      <span style={{ ...T.colophon, color: Paper400 }}>·</span>
                      <span style={{ ...T.colophon, color: Slate500 }}>{prog.city}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            GIVING — Navy + congregation photo background
            Figma: YOUR GIVING PUBLISHES THE WORD
        ════════════════════════════════════════════════════════════════════ */}
        <section
          style={{
            position: "relative",
            padding: "96px 100px",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/giving-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center top", zIndex: 0 }} />
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(21,26,84,0.82)", zIndex: 1 }} />

          <div style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ ...T.eyebrow, color: Blue300 }}>Giving</div>
              <h2 style={{ ...T.displayL, color: White, margin: 0 }}>Your Giving Publishes the Word</h2>
              <p style={{ ...T.readBody, color: "rgba(255,255,255,0.75)", margin: 0 }}>
                Gifts to this house pay for the gatherings, the recording and transcription of every teaching, and the programmes that carry the Word beyond Jos.
              </p>
              <Link
                href="/giving"
                style={{
                  ...T.button,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  height: "48px", padding: "0 26px", borderRadius: "2px", alignSelf: "flex-start",
                  border: `1px solid rgba(255,255,255,0.4)`, color: White, textDecoration: "none",
                  marginTop: "8px",
                }}
              >
                Give Now
              </Link>
            </div>

            {/* Right: giving category buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {["Tithe", "Offering", "Special Projects", "Thanksgiving"].map((cat) => (
                <Link
                  key={cat}
                  href="/giving"
                  style={{
                    ...T.button,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "20px", borderRadius: "2px",
                    border: `1px solid rgba(255,255,255,0.3)`, color: White, textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
