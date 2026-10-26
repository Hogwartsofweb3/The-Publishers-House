"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEvents, EventItem } from "@/lib/firebase";

export default function MemberEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getEvents(12);
        setEvents(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#1F46C8", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "8px" }}>
          Church Calendar · Jos &amp; Abuja Campuses
        </div>
        <h1 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 32px)", color: "#141C6E", margin: 0 }}>
          Upcoming Fellowship &amp; Church Events
        </h1>
        <p style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)", fontStyle: "italic", fontSize: "14.5px", color: "#4A5490", marginTop: "6px" }}>
          Join the assembly in spirit and truth across our weekly encounters, flagship annual convocations, and special ministry workshops.
        </p>
      </div>

      {/* Regular Weekly Encounters Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        <div style={{ padding: "22px", borderRadius: "12px", backgroundColor: "#0E1556", color: "#FFFFFF" }}>
          <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#2090FF", textTransform: "uppercase", letterSpacing: "0.14em" }}>
            Every Sunday
          </span>
          <div style={{ fontSize: "18px", fontWeight: 800, marginTop: "4px" }}>
            Word &amp; Worship Celebration
          </div>
          <div style={{ fontSize: "12.5px", color: "#A9C2FF", marginTop: "6px" }}>
            09:00 AM • Main Sanctuary Jos &amp; Abuja Center
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "10px 0 0", lineHeight: "1.5em" }}>
            A deep encounter in the prophetic scriptures, apostolic teaching, and corporate worship.
          </p>
        </div>

        <div style={{ padding: "22px", borderRadius: "12px", backgroundColor: "#1F46C8", color: "#FFFFFF" }}>
          <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#A9C2FF", textTransform: "uppercase", letterSpacing: "0.14em" }}>
            Every Wednesday
          </span>
          <div style={{ fontSize: "18px", fontWeight: 800, marginTop: "4px" }}>
            Believers Bible Study &amp; Prayer
          </div>
          <div style={{ fontSize: "12.5px", color: "#A9C2FF", marginTop: "6px" }}>
            05:30 PM • Sanctuary &amp; Online Stream
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "10px 0 0", lineHeight: "1.5em" }}>
            Verse-by-verse scriptural exposition, prayer intercession, and personal edification.
          </p>
        </div>

        <div style={{ padding: "22px", borderRadius: "12px", backgroundColor: "#0F6B38", color: "#FFFFFF" }}>
          <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#86EFAC", textTransform: "uppercase", letterSpacing: "0.14em" }}>
            Monthly Flagship
          </span>
          <div style={{ fontSize: "18px", fontWeight: 800, marginTop: "4px" }}>
            Prophetic Prayer Conclave
          </div>
          <div style={{ fontSize: "12.5px", color: "#86EFAC", marginTop: "6px" }}>
            Last Friday of Month • 10:00 PM All-Night
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: "10px 0 0", lineHeight: "1.5em" }}>
            Prevailing prayer for revival, territorial transformation, and the glory of God.
          </p>
        </div>
      </div>

      {/* Special Scheduled Events */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #D5DCF2", padding: "28px", boxShadow: "0 2px 8px rgba(20, 28, 110, 0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "18px", fontWeight: 700, color: "#141C6E", margin: 0 }}>
            Special Programs &amp; Conferences
          </h2>
          <Link href="/schedule" style={{ fontSize: "12px", color: "#2090FF", fontWeight: 600, textDecoration: "none" }}>
            Public Events Page →
          </Link>
        </div>

        {loading ? (
          <p style={{ color: "#747CA1", fontSize: "13px" }}>Loading events calendar...</p>
        ) : events.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  borderRadius: "10px",
                  border: "1px solid #E4ECF9",
                  backgroundColor: "#F8FAFD",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#0140C1", textTransform: "uppercase" }}>
                    {event.startAt ? new Date(event.startAt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "Scheduled"}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-montserrat-family, 'Montserrat', sans-serif)", fontSize: "16px", fontWeight: 700, color: "#141C6E", margin: "4px 0 6px" }}>
                    {event.title}
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#4A5490", margin: 0, lineHeight: "1.5em" }}>
                    {event.summary || event.description}
                  </p>
                  {event.location && (
                    <div style={{ fontSize: "11.5px", color: "#747CA1", marginTop: "8px" }}>
                      📍 {event.location}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px", borderTop: "1px solid #E8EDFB", paddingTop: "12px" }}>
                  <Link
                    href={`/schedule/${event.id}`}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "8px 12px",
                      backgroundColor: "#1F46C8",
                      color: "#FFFFFF",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Event Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#747CA1", fontSize: "13px", fontStyle: "italic", margin: 0 }}>
            No special events scheduled right now. Check back soon for announcements.
          </p>
        )}
      </div>
    </div>
  );
}
