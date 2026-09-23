

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getEvents, type EventItem } from "@/lib/firebase";

export const revalidate = 60; // ISR — refresh every 60 seconds

// Shared style constants
const S = {
  Navy: "#151A54",
  Slate600: "#4A62A0",
  Blue500: "#2090FF",
  Blue700: "#0140C1",
  Blue300: "#6496EF",
  Paper100: "#F4F6FB",
  Paper200: "#E8ECF7",
  Paper300: "#D3DAEC",
  Paper400: "#C0C9E0",
  Slate500: "#747CA1",
  White: "#FFFFFF",
  
  DisplayXL: { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "clamp(48px,6vw,72px)", lineHeight: "0.98em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  DisplayS: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "clamp(18px,2vw,21px)", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  DisplayM: { fontFamily: "var(--font-poppins)", fontWeight: 700, fontSize: "clamp(24px,3vw,30px)", lineHeight: "1.14em", letterSpacing: "-0.015em", textTransform: "uppercase" as const },
  ReadLede: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
  ReadSmall: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "14.5px", lineHeight: "1.5em" },
  ReadBody: { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "17px", lineHeight: "1.68em" },
  UIEyebrow: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  UIScripture: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  UIButton: { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
  UIColophon: { fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  Button: { height: "48px", padding: "0 26px", borderRadius: "2px", display: "inline-flex", alignItems: "center", justifyContent: "center" },
};

function EventRow({ event }: { event: EventItem }) {
  // Parse ISO datetime (e.g. "2026-08-10T09:00")
  const dateObj = new Date(event.startAt);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const monthStr = dateObj.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
  const timeStr = dateObj.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false });

  // Use URL if present, otherwise just a default fallback label
  const buttonLabel = event.registrationUrl ? "Register now" : "View Details";

  // Attempt to map event title to a known logo (fallback to standard logo)
  let logoUrl = "";
  const t = event.title.toLowerCase();
  if (t.includes("festival of light")) logoUrl = "/images/Festival of Light logo (white).png";
  else if (t.includes("merismos")) logoUrl = "/images/Merismos black.png";
  else if (t.includes("jesus convention")) logoUrl = "/images/Jesus Convention logo white.png";
  else if (t.includes("forge")) logoUrl = "/images/THE FORGE 1.png";
  else if (t.includes("abuja")) logoUrl = "/images/TPH ABUJA.png";
  else logoUrl = "/images/MAIN TPH LOGO (W).png";
  
  // Use event photo or fallback to a standard event photo
  const photoUrl = event.imageUrl || "/images/event-1.jpg";

  return (
    <div className="tph-event-row">
      {/* Date mark */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ ...S.DisplayM, color: S.Blue500 }}>{day}</div>
        <div style={{ ...S.UIEyebrow, color: S.Slate500 }}>{monthStr}</div>
      </div>

      {/* Photo with Logo Overlay */}
      <div 
        className="tph-event-photo"
        style={{
          backgroundImage: `url('${photoUrl}')`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(21, 26, 84, 0.4)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
           <img 
             src={logoUrl} 
             alt={event.title} 
             style={{ 
               maxHeight: "60%", 
               maxWidth: "80%", 
               objectFit: "contain", 
               filter: logoUrl.includes("black") ? "brightness(0) invert(1)" : "drop-shadow(0px 4px 12px rgba(0,0,0,0.3))" 
             }} 
           />
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h3 style={{ ...S.DisplayS, color: S.Navy, margin: 0 }}>{event.title}</h3>
        <p style={{ ...S.ReadSmall, color: S.Slate600, maxWidth: "600px", margin: 0 }}>
          {event.summary || event.description}
        </p>
        
        {/* Colophon */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          <span style={{ ...S.UIColophon, color: S.Slate600 }}>{timeStr}</span>
          <span style={{ ...S.UIColophon, color: S.Paper400 }}>·</span>
          <span style={{ ...S.UIColophon, color: S.Slate600 }}>{event.location}</span>
        </div>
      </div>

      {/* Button */}
      {event.registrationUrl ? (
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...S.Button,
            ...S.UIButton,
            backgroundColor: S.Blue700,
            color: S.White,
            border: "none",
            textDecoration: "none"
          }}
        >
          {buttonLabel}
        </a>
      ) : (
        <span
          style={{
            ...S.Button,
            ...S.UIButton,
            backgroundColor: "transparent",
            color: S.Navy,
            border: `1px solid ${S.Paper300}`,
          }}
        >
          {buttonLabel}
        </span>
      )}
    </div>
  );
}

export default async function EventsPage() {
  let events: EventItem[] = [];
  try {
    events = await getEvents(20);
  } catch (e) {
    console.error("Failed to fetch events:", e);
  }

  return (
    <div style={{ backgroundColor: S.Paper100, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, paddingTop: "70px" }}>
        {/* Hero */}
        <section
          className="tph-section"
          style={{
            backgroundColor: S.Paper200,
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <h1 style={{ ...S.DisplayXL, color: S.Navy, margin: 0 }}>Events and gatherings</h1>
          <p style={{ ...S.ReadLede, color: S.Slate600, maxWidth: "720px", margin: 0 }}>
            Every gathering in Jos and Abuja, with the weekly services and the flagship programmes in one list.
          </p>
        </section>

        {/* List */}
        <section
          className="tph-section"
          style={{
            backgroundColor: S.White,
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}
        >
          {events.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ ...S.UIEyebrow, color: S.Slate500, marginBottom: "16px" }}>Coming Soon</div>
              <h2 style={{ ...S.DisplayM, color: S.Navy, margin: "0 0 12px" }}>No upcoming events</h2>
              <p style={{ ...S.ReadBody, color: S.Slate600, margin: 0 }}>Events are being scheduled in the CMS. Check back soon.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {events.map((ev) => (
                <EventRow key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
