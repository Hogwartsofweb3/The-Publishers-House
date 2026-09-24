import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getEvents, type EventItem } from "@/lib/firebase";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const events = await getEvents(50);
    return events.map((e) => ({ id: e.id }));
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const events = await getEvents(50);
    const event = events.find((e) => e.id === id);
    if (!event) return { title: "Event Not Found" };
    return {
      title: `${event.title} | The Publishers House`,
      description: event.summary,
    };
  } catch { return { title: "Event | The Publishers House" }; }
}

const Navy    = "#151A54";
const Blue700 = "#0140C1";
const Blue500 = "#2090FF";
const Blue300 = "#6496EF";
const Slate600 = "#4A62A0";
const White   = "#FFFFFF";

const T = {
  displayXL: { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "clamp(36px,6vw,72px)", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  displayL:  { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "clamp(28px,4vw,40px)", lineHeight: "1.05em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  eyebrow:   { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  colophon:  { fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  readBody:  { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "16px", lineHeight: "1.7em" },
  readLede:  { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
  button:    { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
};

function formatDateRange(startAt: string, endAt?: string) {
  if (!startAt) return "";
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  if (!end) return start.toLocaleDateString("en-GB", opts);
  const startStr = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const endStr = end.toLocaleDateString("en-GB", opts);
  return `${startStr} – ${endStr}`;
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let event: EventItem | null = null;
  try {
    const events = await getEvents(50);
    event = events.find((e) => e.id === id) || null;
    
    // Fallback: check mock events
    if (!event && id === "mock-1") {
      event = {
        id: "mock-1", title: "The Shout of a King", summary: "Festival of Light 2026 — The annual homecoming conference of The Publishers House.",
        description: "Festival of Light brings together believers from across the world for a season of worship, sound teaching, Holy Ghost expressions, fellowship and divine encounters.\n\nIt is a celebration of God's faithfulness, of spiritual renewal, and of the shared mission of raising a great company of publishers.\n\nIf you are travelling in, register early. Registration closes when the hall is full rather than on a fixed date.",
        startAt: "2026-10-28T16:00", endAt: "2026-11-01T23:00",
        location: "Jos, Nigeria", imageUrl: "/images/event-1.jpg",
        registrationUrl: "https://bitly.com/FoL2026",
        published: true, createdAt: null, updatedAt: null,
      } as any;
    }
    if (!event && id === "mock-2") {
      event = {
        id: "mock-2", title: "The Forge",
        summary: "Monthly end-of-month prayer and fasting retreat. A time to birth prophetic realities.",
        description: "The Forge is a monthly gathering of intense prayer, fasting, and intercession. It is a time to press in for the things of the Spirit and contend for the advancing of God's Word.",
        startAt: "2026-09-30T17:00", endAt: "", location: "The House of Bread, Jos",
        imageUrl: "/images/event-2.jpg", registrationUrl: "",
        published: true, createdAt: null, updatedAt: null,
      } as any;
    }
  } catch (e) { console.error(e); }

  if (!event) notFound();

  const dateRange = formatDateRange(event.startAt, event.endAt);
  const coverImage = event.imageUrl || "/images/event-1.jpg";
  const ev = event as any;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>

        {/* HERO */}
        <section style={{ position: "relative", minHeight: "420px", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${coverImage}')`, backgroundSize: "cover", backgroundPosition: "center top", zIndex: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(21,26,84,0.45) 0%, rgba(21,26,84,0.92) 100%)", zIndex: 1 }} />

          <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "1440px", margin: "0 auto", padding: "clamp(40px,6vw,96px) clamp(20px,6vw,100px)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <Link href="/events" style={{ ...T.eyebrow, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
              ← All Events
            </Link>

            {ev.scripture && <div style={{ ...T.eyebrow, color: Blue300 }}>{ev.scripture}</div>}

            <h1 style={{ ...T.displayXL, color: White, margin: 0, maxWidth: "900px" }}>{event.title}</h1>

            {event.summary && (
              <p style={{ ...T.readLede, color: "rgba(255,255,255,0.82)", margin: 0, maxWidth: "640px" }}>{event.summary}</p>
            )}

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
              {event.registrationUrl && (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...T.button, display: "inline-flex", alignItems: "center", justifyContent: "center", height: "48px", padding: "0 28px", borderRadius: "2px", border: `1px solid ${White}`, color: White, textDecoration: "none", backgroundColor: "transparent" }}
                >
                  Register Now
                </a>
              )}
              <Link
                href="/resources"
                style={{ ...T.button, display: "inline-flex", alignItems: "center", justifyContent: "center", height: "48px", padding: "0 28px", borderRadius: "2px", border: "1px solid rgba(255,255,255,0.4)", color: White, textDecoration: "none", backgroundColor: "transparent" }}
              >
                Teachings from Last Year
              </Link>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", marginTop: "4px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.18)" }}>
              {ev.scripture && <span style={{ ...T.colophon, color: "rgba(255,255,255,0.7)" }}>{ev.scripture}</span>}
              {ev.scripture && <span style={{ ...T.colophon, color: "rgba(255,255,255,0.3)" }}>·</span>}
              <span style={{ ...T.colophon, color: "rgba(255,255,255,0.7)" }}>{dateRange}</span>
              <span style={{ ...T.colophon, color: "rgba(255,255,255,0.3)" }}>·</span>
              <span style={{ ...T.colophon, color: "rgba(255,255,255,0.7)" }}>{event.location}</span>
              {event.registrationUrl && <>
                <span style={{ ...T.colophon, color: "rgba(255,255,255,0.3)" }}>·</span>
                <span style={{ ...T.colophon, color: Blue300 }}>Registration Open</span>
              </>}
            </div>
          </div>
        </section>

        {/* WHAT THIS IS */}
        {event.description && (
          <section style={{ backgroundColor: White, padding: "clamp(40px,6vw,80px) clamp(20px,6vw,100px)" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div style={{ ...T.eyebrow, color: Blue500, marginBottom: "24px" }}>What This Is</div>
              <div>
                {event.description.split("\n").filter(Boolean).map((para, i) => (
                  <p key={i} style={{ ...T.readBody, color: Slate600, margin: "0 0 16px" }}>{para}</p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* REGISTER CTA */}
        {event.registrationUrl && (
          <section style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${coverImage}')`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(21,26,84,0.88)", zIndex: 1 }} />
            <div style={{ position: "relative", zIndex: 2, maxWidth: "720px", margin: "0 auto", padding: "clamp(48px,6vw,96px) clamp(20px,6vw,100px)", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ ...T.eyebrow, color: Blue300 }}>Registration</div>
              <h2 style={{ ...T.displayL, color: White, margin: 0 }}>Save Your Seat</h2>
              <p style={{ ...T.readBody, color: "rgba(255,255,255,0.75)", margin: 0 }}>
                Registration closes when the hall is full. Confirmation comes by email, and by WhatsApp if you gave us a number.
              </p>
              <div style={{ marginTop: "8px" }}>
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...T.button, display: "inline-flex", alignItems: "center", justifyContent: "center", height: "52px", padding: "0 36px", borderRadius: "2px", backgroundColor: Blue700, color: White, textDecoration: "none" }}
                >
                  Register — {dateRange}
                </a>
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  );
}
