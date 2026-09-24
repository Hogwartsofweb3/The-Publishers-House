import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { getEvents, type EventItem } from "@/lib/firebase";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Events | The Publishers House",
  description: "Every gathering in Jos and Abuja — weekly services and flagship programmes in one place.",
};

const Navy    = "#151A54";
const Blue700 = "#0140C1";
const Blue500 = "#2090FF";
const Blue300 = "#6496EF";
const Paper100 = "#F4F6FB";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const Paper400 = "#C0C9E0";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const White   = "#FFFFFF";

const T = {
  displayXL: { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "clamp(40px,6vw,72px)", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  displayM:  { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "clamp(20px,2.5vw,28px)", lineHeight: "1.1em", letterSpacing: "-0.015em", textTransform: "uppercase" as const },
  displayS:  { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "18px", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  eyebrow:   { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  colophon:  { fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  readLede:  { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
  readSmall: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
  button:    { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
};




export default async function EventsPage() {
  let events: EventItem[] = [];
  try {
    events = await getEvents(20);
  } catch (e) {
    console.error("Failed to fetch events:", e);
  }

  // MOCK DATA — replaced by real CMS events when available
  if (events.length === 0) {
    events = [
      {
        id: "mock-1",
        title: "The Shout of a King",
        summary: "Festival of Light 2026 — The annual homecoming conference of The Publishers House. Believers from across the world gather in Jos.",
        description: "Festival of Light brings together believers from across the world for a season of worship, sound teaching, Holy Ghost expressions, fellowship and divine encounters.\n\nIt is a celebration of God's faithfulness, of spiritual renewal, and of the shared mission of raising a great company of publishers.\n\nIf you are travelling in, register early. Registration closes when the hall is full rather than on a fixed date.",
        startAt: "2026-10-28T16:00", endAt: "2026-11-01T23:00",
        location: "Jos, Nigeria", imageUrl: "/images/fol-2026-poster.jpg",
        registrationUrl: "https://bitly.com/FoL2026",
        published: true, createdAt: null, updatedAt: null,
      },
      {
        id: "mock-2",
        title: "The Forge",
        summary: "Monthly end-of-month prayer and fasting retreat. A time to birth prophetic realities in Jos.",
        description: "The Forge is a monthly gathering of intense prayer, fasting, and intercession. It is a time to press in for the things of the Spirit and contend for the advancing of God's Word.",
        startAt: "2026-09-30T17:00", endAt: "",
        location: "The House of Bread, Jos", imageUrl: "/images/event-2.jpg",
        registrationUrl: "", published: true, createdAt: null, updatedAt: null,
      },
    ] as any;
  }

  return (
    <div style={{ backgroundColor: Paper100, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, paddingTop: "70px" }}>

        {/* Hero */}
        <section style={{ position: "relative", minHeight: "420px", display: "flex", alignItems: "center", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/events-hero.jpg')", backgroundSize: "cover", backgroundPosition: "center 20%", zIndex: 0 }} />
          {/* Dark blue overlay matching the design */}
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(21,26,84,0.82)", zIndex: 1 }} />
          
          <div className="tph-inner" style={{ position: "relative", zIndex: 2, padding: "clamp(60px,10vw,120px) 0" }}>
            <div style={{ ...T.eyebrow, color: Blue300, marginBottom: "16px" }}>Acts 2:42</div>
            <h1 style={{ ...T.displayXL, color: White, margin: "0 0 16px" }}>Events and Gatherings</h1>
            <p style={{ ...T.readLede, color: "rgba(255,255,255,0.85)", maxWidth: "720px", margin: 0 }}>
              Every gathering in Jos and Abuja, with the weekly services and the flagship programmes in one list.
            </p>
          </div>
        </section>

        {/* Events grid */}
        <section className="tph-section" style={{ backgroundColor: White }}>
          {events.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ ...T.eyebrow, color: Slate500, marginBottom: "16px" }}>Coming Soon</div>
              <h2 style={{ ...T.displayM, color: Navy, margin: "0 0 12px" }}>No Upcoming Events</h2>
              <p style={{ ...T.readSmall, color: Slate600, margin: 0 }}>Events are being scheduled. Check back soon.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
                <div style={{ ...T.eyebrow, color: Blue500 }}>{events.length} Upcoming Event{events.length !== 1 ? "s" : ""}</div>
              </div>
              <div className="tph-grid-3">
                {events.map((ev) => (
                  <EventCard key={ev.id} event={ev} />
                ))}
              </div>
            </>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
