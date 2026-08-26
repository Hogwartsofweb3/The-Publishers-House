/**
 * EventCard — displays a single church event.
 * Used on: Homepage events strip, Events page grid.
 * Props match the EventItem type from lib/firebase.ts.
 */

import type { EventItem } from "@/lib/firebase";

interface EventCardProps {
  event: EventItem;
  compact?: boolean; // slim horizontal layout for homepage strip
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const imageUrl = event.imageUrl;

  // Parse date for the date-badge block
  const dateObj = event.startAt ? new Date(event.startAt) : null;
  const day   = dateObj ? dateObj.toLocaleDateString("en-NG", { day: "2-digit" })   : "--";
  const month = dateObj ? dateObj.toLocaleDateString("en-NG", { month: "short" })   : "---";
  const year  = dateObj ? dateObj.toLocaleDateString("en-NG", { year: "numeric" }) : "----";

  if (compact) {
    return (
      <article
        className="card"
        style={{
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          minWidth: "280px",
          maxWidth: "340px",
          flexShrink: 0,
          height: "100%",
        }}
      >
        {/* Date badge sidebar */}
        <div
          style={{
            width: "72px",
            flexShrink: 0,
            background: "var(--color-primary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-4) var(--space-2)",
            gap: "2px",
          }}
        >
          <span style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--color-accent)", lineHeight: 1 }}>
            {day}
          </span>
          <span style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" }}>
            {month}
          </span>
          <span style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.5)" }}>
            {year}
          </span>
        </div>

        {/* Body */}
        <div className="card__body" style={{ flex: 1 }}>
          <h4 style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-2)", lineHeight: "var(--leading-snug)" }}>
            {event.title}
          </h4>
          {event.startAt && (
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", maxWidth: "none", marginBottom: "var(--space-1)" }}>
              ⏰ {new Date(event.startAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
              {event.endAt ? ` – ${new Date(event.endAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}` : ""}
            </p>
          )}
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", maxWidth: "none" }}>
            📍 {event.location}
          </p>
          {event.registrationUrl && (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{ marginTop: "var(--space-3)", display: "inline-flex" }}
            >
              Register
            </a>
          )}
        </div>
      </article>
    );
  }

  // Default full card
  return (
    <article className="card" style={{ overflow: "hidden", height: "100%" }}>
      {/* Cover image */}
      <div
        style={{
          height: "200px",
          position: "relative",
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
          overflow: "hidden",
        }}
      >
        <div
          className="skeleton"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('${imageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Date badge */}
        <div
          style={{
            position: "absolute",
            top: "var(--space-4)",
            left: "var(--space-4)",
            background: "var(--color-primary)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-3)",
            textAlign: "center",
            minWidth: "52px",
          }}
        >
          <span style={{ display: "block", fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-accent)", lineHeight: 1 }}>
            {day}
          </span>
          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.75)", textTransform: "uppercase" }}>
            {month}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="card__body" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <h4 className="card__title">{event.title}</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", marginBottom: "var(--space-3)" }}>
          {event.startAt && (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", maxWidth: "none" }}>
              ⏰ {new Date(event.startAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
              {event.endAt ? ` – ${new Date(event.endAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}` : ""}
            </p>
          )}
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", maxWidth: "none" }}>
            📍 {event.location}
          </p>
        </div>
        <p className="card__excerpt" style={{ flex: 1 }}>{event.description}</p>
        {event.registrationUrl && (
          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ marginTop: "var(--space-4)", display: "inline-flex", alignSelf: "flex-start" }}
          >
            Register Now
          </a>
        )}
      </div>
    </article>
  );
}
