import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeContent from "@/components/HomeContent";
import FloatingAttendance from "@/components/FloatingAttendance";

export const metadata: Metadata = {
  title: "The Publishers House",
  description:
    "The Publishers House — a teaching-focused apostolic church in Jos, Plateau State. Led by Dr. Joshua Agunbiade.",
};

// ── Programs data (still static — managed from CMS Programs page) ─────────
const programs = [
  { slug: "festival-of-light", name: "Festival of Light", schedule: "Annual Homecoming Conference", desc: "Believers from across the world gather for worship, sound teaching, Holy Ghost expressions and fellowship.", scripture: "Isaiah 60:1", freq: "Annual", city: "Jos", logoImage: "/images/Festival of Light logo (white).png" },
  { slug: "merismos", name: "Merismos", schedule: "Annual Conference", desc: "A power-packed encounter where the Word is rightly taught and the Holy Spirit moves tangibly to transform lives.", scripture: "Hebrews 4:12", freq: "Annual", city: "Jos", logoImage: "/images/Merismos black.png" },
  { slug: "jesus-convention", name: "Jesus Convention", schedule: "Annual · Easter", desc: "Unveiling the person, finished work and lordship of Jesus Christ through sound teaching, prayer and worship.", scripture: "Philippians 2:10", freq: "Easter", city: "Jos", logoImage: "/images/Jesus Convention logo white.png" },
  { slug: "the-forge", name: "The Forge", schedule: "Monthly · End of Month", desc: "An intensive prayer gathering running Wednesday to Friday and culminating in an overnight vigil.", scripture: "Jeremiah 23:20", freq: "Monthly", city: "Jos", logoImage: "/images/THE FORGE 1.png" },
  { slug: "abuja-apostolic-camp", name: "Abuja Apostolic Camp", schedule: "Monthly · Abuja", desc: "A close spiritual camp focused on equipping believers, prophetic words and deep spiritual alignment.", scripture: "Ephesians 4:11", freq: "Monthly", city: "Abuja", logoImage: "/images/TPH ABUJA.png" },
  { slug: "sunday-midweek", name: "Sunday & Midweek", schedule: "Every Week", desc: "Sunday worship at 9:00 AM is the core weekly gathering. Thursday at 5:00 PM is doctrine and corporate prayer.", scripture: "Acts 2:42", freq: "Weekly", city: "Jos", logoImage: "/images/MAIN TPH LOGO (W).png" },
];

const Navy    = "#151A54";
const Blue500 = "#2090FF";
const Blue700 = "#0140C1";
const Paper100= "#F4F6FB";
const Paper200= "#E8ECF7";
const Paper300= "#D3DAEC";
const Paper400= "#C0C9E0";
const Slate500= "#747CA1";
const Slate600= "#4A62A0";
const White   = "#FFFFFF";

const T = {
  displayL:  { fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"clamp(32px,4.5vw,48px)", lineHeight:"1.04em", letterSpacing:"-0.02em", textTransform:"uppercase" as const },
  displayS:  { fontFamily:"var(--font-poppins)", fontWeight:700, fontSize:"21px", lineHeight:"1.2em", letterSpacing:"-0.01em", textTransform:"uppercase" as const },
  readSmall: { fontFamily:"var(--font-playfair)", fontWeight:400, fontSize:"14.5px", lineHeight:"1.5em" },
  eyebrow:   { fontFamily:"var(--font-poppins)", fontWeight:600, fontSize:"10px", lineHeight:"1.6em", letterSpacing:"0.2em", textTransform:"uppercase" as const },
  button:    { fontFamily:"var(--font-poppins)", fontWeight:600, fontSize:"12px", lineHeight:"1em", letterSpacing:"0.14em", textTransform:"uppercase" as const },
  colophon:  { fontFamily:"var(--font-poppins)", fontWeight:500, fontSize:"10.5px", lineHeight:"1.6em", letterSpacing:"0.1em", textTransform:"uppercase" as const },
};

import { db } from "@/lib/firebase"; import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore"; export const revalidate = 60; export default async function HomePage() { let initialSettings = {}; let initialGatherings: any[] = []; try { const snap = await getDoc(doc(db, "homeSettings", "main")); if (snap.exists()) initialSettings = snap.data(); } catch (e) {} try { const snap = await getDocs(query(collection(db, "gatherings"), orderBy("order", "asc"))); initialGatherings = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((g: any) => g.published !== false); } catch (e) {}
  return (
    <>
      <Navbar />
      <main>
        {/* All editable dynamic sections — fetched live from Firestore */}
        <HomeContent initialSettings={initialSettings} initialGatherings={initialGatherings} />

        {/* Flagship Programs — static (managed via CMS Programs) */}
        <section className="tph-section" style={{ backgroundColor: Paper100 }}>
          <div className="tph-inner">
            <div style={{ ...T.eyebrow, color: Blue500, marginBottom: "10px" }}>Flagship Programs</div>
            <h2 style={{ ...T.displayL, color: Navy, marginBottom: "48px" }}>Where the Word Is Published</h2>
            <div className="tph-grid-3">
              {programs.map((prog) => (
                <a key={prog.slug} href="/programs" style={{ textDecoration: "none" }}>
                  <div style={{ border: `1px solid ${Paper300}`, borderRadius: "4px", overflow: "hidden", backgroundColor: White, cursor: "pointer" }}>
                    <div style={{ height: "160px", overflow: "hidden", borderBottom: `1px solid ${Paper300}`, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: Paper100 }}>
                      <img src={prog.logoImage} alt={prog.name} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", padding: "32px", filter: (prog.slug === "abuja-apostolic-camp" || prog.slug === "sunday-midweek") ? "brightness(0)" : "none" }} />
                    </div>
                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ ...T.eyebrow, color: Blue500 }}>{prog.schedule}</div>
                      <h3 style={{ ...T.displayS, color: Navy, margin: 0 }}>{prog.name}</h3>
                      <p style={{ ...T.readSmall, color: Slate600, margin: 0 }}>{prog.desc}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "12px", borderTop: `1px solid ${Paper200}`, flexWrap: "wrap" }}>
                        <span style={{ ...T.colophon, color: Blue700 }}>{prog.scripture}</span>
                        <span style={{ ...T.colophon, color: Paper400 }}>·</span>
                        <span style={{ ...T.colophon, color: Slate500 }}>{prog.freq}</span>
                        <span style={{ ...T.colophon, color: Paper400 }}>·</span>
                        <span style={{ ...T.colophon, color: Slate500 }}>{prog.city}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
        <FloatingAttendance />
      </main>
      <Footer />
    </>
  );
}
