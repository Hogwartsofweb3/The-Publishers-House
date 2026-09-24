"use client";

import Link from "next/link";
import type { EventItem } from "@/lib/firebase";
import { useState } from "react";

const Navy    = "#151A54";
const Blue700 = "#0140C1";
const Blue300 = "#6496EF";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const Paper400 = "#C0C9E0";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const White   = "#FFFFFF";

const T = {
  displayM:  { fontFamily: "var(--font-poppins)", fontWeight: 700 as const, fontSize: "clamp(20px,2.5vw,28px)", lineHeight: "1.1em", letterSpacing: "-0.015em", textTransform: "uppercase" as const },
  displayS:  { fontFamily: "var(--font-poppins)", fontWeight: 700 as const, fontSize: "18px", lineHeight: "1.2em", letterSpacing: "-0.01em", textTransform: "uppercase" as const },
  eyebrow:   { fontFamily: "var(--font-poppins)", fontWeight: 600 as const, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  colophon:  { fontFamily: "var(--font-poppins)", fontWeight: 500 as const, fontSize: "10.5px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  readSmall: { fontFamily: "var(--font-playfair)", fontWeight: 400 as const, fontSize: "14.5px", lineHeight: "1.5em" },
  button:    { fontFamily: "var(--font-poppins)", fontWeight: 600 as const, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
};

function getLogoUrl(title: string) {
  const t = title.toLowerCase();
  if (t.includes("festival of light") || t.includes("shout of a king")) return "/images/Festival of Light logo (white).png";
  if (t.includes("merismos")) return "/images/Merismos black.png";
  if (t.includes("jesus convention")) return "/images/Jesus Convention logo white.png";
  if (t.includes("forge")) return "/images/THE FORGE 1.png";
  if (t.includes("abuja")) return "/images/TPH ABUJA.png";
  return "/images/MAIN TPH LOGO (W).png";
}

function formatDateRange(startAt: string, endAt?: string) {
  if (!startAt) return "";
  const start = new Date(startAt);
  if (!endAt) return start.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const end = new Date(endAt);
  const startStr = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const endStr = end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return startStr + " \u2013 " + endStr;
}

export default function EventCard({ event }: { event: EventItem }) {
  const [hovered, setHovered] = useState(false);
  const logoUrl = getLogoUrl(event.title);
  const photoUrl = event.imageUrl || "/images/event-1.jpg";
  const dateRange = formatDateRange(event.startAt, event.endAt);
  const dateObj = event.startAt ? new Date(event.startAt) : new Date();
  const day = dateObj.getDate().toString().padStart(2, "0");
  const monthStr = dateObj.toLocaleDateString("en-GB", { month: "short", year: "numeric" }).toUpperCase();

  return (
    <Link href={"/events/" + event.id} style={{ textDecoration: "none", display: "block" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: White,
          border: "1px solid " + Paper300,
          borderRadius: "4px",
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: hovered ? "0 8px 32px rgba(21,26,84,0.13)" : "none",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
          transition: "box-shadow 180ms ease, transform 180ms ease",
        }}
      >
        {/* Photo with logo overlay */}
        <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute", inset: 0,
              backgroundImage: "url('" + photoUrl + "')",
              backgroundSize: "cover", backgroundPosition: "center top",
              transform: hovered ? "scale(1.04)" : "scale(1)",
              transition: "transform 320ms ease",
            }}
          />
          {/* Dark overlay — lighter when a real photo is set so the image shows through better */}
          <div style={{ position: "absolute", inset: 0, backgroundColor: event.imageUrl ? "rgba(21,26,84,0.25)" : "rgba(21,26,84,0.55)" }} />

          {/* Only show logo when no custom image is provided */}
          {!event.imageUrl && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
              <img
                src={logoUrl}
                alt={event.title}
                style={{
                  maxHeight: "55%", maxWidth: "70%", objectFit: "contain",
                  filter: logoUrl.includes("black") ? "brightness(0) invert(1)" : "drop-shadow(0px 4px 16px rgba(0,0,0,0.4))",
                }}
              />
            </div>
          )}

          {/* Date badge */}
          <div style={{ position: "absolute", top: "16px", left: "16px", backgroundColor: "rgba(21,26,84,0.85)", borderRadius: "2px", padding: "8px 12px", textAlign: "center" }}>
            <div style={{ ...T.displayM, color: White, fontSize: "22px" }}>{day}</div>
            <div style={{ ...T.eyebrow, color: Blue300 }}>{monthStr}</div>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "24px" }}>
          <h3 style={{ ...T.displayS, color: Navy, margin: "0 0 8px" }}>{event.title}</h3>
          <p style={{ ...T.readSmall, color: Slate600, margin: "0 0 16px", minHeight: "44px" }}>
            {event.summary || event.description}
          </p>

          {/* Colophon */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", paddingTop: "16px", borderTop: "1px solid " + Paper200 }}>
            <span style={{ ...T.colophon, color: Blue700 }}>{dateRange}</span>
            <span style={{ ...T.colophon, color: Paper400 }}>&middot;</span>
            <span style={{ ...T.colophon, color: Slate500 }}>{event.location}</span>
          </div>

          <div style={{ marginTop: "16px" }}>
            <span style={{ ...T.button, color: Blue700 }}>
              {event.registrationUrl ? "Register Now \u2192" : "View Details \u2192"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
