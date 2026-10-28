import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { getEvents, type EventItem } from "@/lib/firebase";
import { parseStartAndEnd } from "@/lib/eventTiming";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Schedule & Gatherings | The Publishers House",
  description:
    "Upcoming services, conferences, and special events at The Publishers House. Find dates, register, and stay connected.",
  openGraph: {
    siteName: "The Publishers House",
    title: "Schedule & Gatherings | The Publishers House",
    description:
      "Upcoming services, conferences, and special events at The Publishers House. Find dates and register.",
    url: "https://www.thepublishershouse.org/schedule",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Schedule – The Publishers House" }],
  },
};

const Navy = "#151A54";
const Blue500 = "#2090FF";
const Blue300 = "#6496EF";
const Paper100 = "#F4F6FB";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const White = "#FFFFFF";

const T = {
  displayXL: {
    fontFamily: "var(--font-poppins)",
    fontWeight: 800,
    fontSize: "clamp(40px,6vw,72px)",
    lineHeight: "0.98em",
    letterSpacing: "-0.02em",
    textTransform: "uppercase" as const,
  },
  displayM: {
    fontFamily: "var(--font-poppins)",
    fontWeight: 700,
    fontSize: "clamp(20px,2.5vw,28px)",
    lineHeight: "1.1em",
    letterSpacing: "-0.015em",
    textTransform: "uppercase" as const,
  },
  eyebrow: {
    fontFamily: "var(--font-poppins)",
    fontWeight: 600,
    fontSize: "10px",
    lineHeight: "1.6em",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
  },
  readLede: {
    fontFamily: "var(--font-playfair)",
    fontWeight: 400,
    fontSize: "20px",
    lineHeight: "1.55em",
  },
  readSmall: {
    fontFamily: "var(--font-poppins)",
    fontWeight: 400,
    fontSize: "14.5px",
    lineHeight: "1.5em",
  },
};

export default async function EventsPage() {
  let events: EventItem[] = [];
  try {
    events = await getEvents(50);
  } catch (e) {
    console.error("Failed to fetch events:", e);
  }

  // Fallback defaults if no events are returned
  if (events.length === 0) {
    events = [
      {
        id: "fol-2026",
        title: "The Shout of a King",
        summary:
          "Festival of Light 2026 — The annual homecoming conference of The Publishers House. Believers from across the world gather in Jos.",
        description:
          "Festival of Light brings together believers from across the world for a season of worship, sound teaching, Holy Ghost expressions, fellowship and divine encounters.\n\nIt is a celebration of God's faithfulness, of spiritual renewal, and of the shared mission of raising a great company of publishers.",
        startAt: "2026-10-28T16:00",
        endAt: "2026-11-01T23:00",
        location: "Jos, Nigeria",
        imageUrl: "https://i.postimg.cc/vTf49Wsz/FOL.-26.jpg",
        registrationUrl: "https://bit.ly/Fol.2026",
        published: true,
        createdAt: null,
        updatedAt: null,
      },
      {
        id: "merismos-2026",
        title: "Merismos",
        summary: "Annual Word & Power Conference in Jos.",
        description:
          "A power-packed encounter where the Word of God is rightly taught and the Holy Spirit moves tangibly to transform lives.",
        startAt: "2026-12-10T16:45",
        endAt: "2026-12-13T22:00",
        location: "The House of Bread, Jos",
        imageUrl: "/images/programs/merismos-2024.jpg",
        registrationUrl: "",
        published: true,
        createdAt: null,
        updatedAt: null,
      },
    ] as any;
  }

  // Strict chronological sorting: closest in time comes first
  events.sort((a, b) => {
    const aMs = parseStartAndEnd(a).startMs;
    const bMs = parseStartAndEnd(b).startMs;
    return aMs - bMs;
  });

  return (
    <div style={{ backgroundColor: Paper100, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, paddingTop: "70px" }}>
        {/* Hero */}
        <section
          className="tph-hero"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            minHeight: "420px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/images/events-hero.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center 20%",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(21, 26, 84, 0.85) 0%, rgba(1, 64, 193, 0.65) 100%)",
              zIndex: 1,
            }}
          />

          <div
            className="tph-inner"
            style={{
              position: "relative",
              zIndex: 2,
              paddingLeft: "clamp(16px, 4vw, 24px)",
              paddingRight: "clamp(16px, 4vw, 24px)",
            }}
          >
            <div style={{ ...T.eyebrow, color: Blue300, marginBottom: "16px" }}>Acts 2:42</div>
            <h1 style={{ ...T.displayXL, color: White, margin: "0 0 16px" }}>Schedule &amp; Gatherings</h1>
            <p style={{ ...T.readLede, color: "rgba(255,255,255,0.9)", maxWidth: "720px", margin: 0 }}>
              Every gathering, weekly service, and flagship programme in one list.
            </p>
          </div>
        </section>

        {/* Events grid */}
        <section
          className="tph-section"
          style={{
            backgroundColor: White,
            paddingLeft: "clamp(16px, 4vw, 24px)",
            paddingRight: "clamp(16px, 4vw, 24px)",
          }}
        >
          <div className="tph-inner">
            {events.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ ...T.eyebrow, color: Slate500, marginBottom: "16px" }}>Coming Soon</div>
                <h2 style={{ ...T.displayM, color: Navy, margin: "0 0 12px" }}>No Upcoming Events</h2>
                <p style={{ ...T.readSmall, color: Slate600, margin: 0 }}>Events are being scheduled. Check back soon.</p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "40px",
                  }}
                >
                  <div style={{ ...T.eyebrow, color: Blue500 }}>
                    {events.length} Upcoming Event{events.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="tph-grid-3">
                  {events.map((ev) => (
                    <EventCard key={ev.id} event={ev} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
