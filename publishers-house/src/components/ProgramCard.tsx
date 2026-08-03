/**
 * ProgramCard — displays a single church program.
 * Used on: Homepage programs spotlight, Programs page grid.
 * Props match the Program type from lib/strapi.ts.
 * Also accepts a `staticData` override for static/hardcoded programs
 * (before Strapi is wired up).
 */

import type { Program } from "@/lib/strapi";
import { getStrapiMediaUrl } from "@/lib/strapi";

interface ProgramCardProps {
  /** Live Strapi program object */
  program?: Program;
  /** Static override — used for hardcoded programs before CMS is live */
  staticData?: {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    icon?: string;
    accentColor?: string;
    frequency?: string;
  };
  variant?: "default" | "spotlight"; // spotlight = used on homepage
}

export default function ProgramCard({
  program,
  staticData,
  variant = "default",
}: ProgramCardProps) {
  // Prefer live Strapi data, fall back to static
  const name        = program?.name        ?? staticData?.name        ?? "Program";
  const slug        = program?.slug        ?? staticData?.slug        ?? "#";
  const tagline     = program?.tagline     ?? staticData?.tagline     ?? "";
  const description = program?.description ?? staticData?.description ?? "";
  const frequency   = staticData?.frequency;
  const icon        = staticData?.icon;
  const accentColor = staticData?.accentColor ?? "var(--color-accent)";

  const imageUrl = program?.heroImage
    ? getStrapiMediaUrl(program.heroImage.url)
    : null;

  const isSpotlight = variant === "spotlight";

  return (
    <article
      className="card"
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        transition: "transform var(--transition-normal), box-shadow var(--transition-normal)",
      }}
    >
      {/* Hero image / gradient banner */}
      <div
        style={{
          height: isSpotlight ? "200px" : "180px",
          position: "relative",
          background: imageUrl
            ? `url('${imageUrl}') center/cover no-repeat`
            : `linear-gradient(135deg, var(--color-primary) 0%, ${accentColor}55 100%)`,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Icon — shown when no real image */}
        {!imageUrl && icon && (
          <span style={{ fontSize: isSpotlight ? "3.5rem" : "2.5rem", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))" }}>
            {icon}
          </span>
        )}

        {/* Gradient overlay for legibility */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
          }}
        />

        {/* Frequency badge */}
        {frequency && (
          <span
            style={{
              position: "absolute",
              top: "var(--space-3)",
              right: "var(--space-3)",
              background: accentColor,
              color: "var(--color-primary)",
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              letterSpacing: "var(--tracking-wide)",
              textTransform: "uppercase",
              padding: "3px 9px",
              borderRadius: "var(--radius-full)",
            }}
          >
            {frequency}
          </span>
        )}

        {/* Accent line at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: accentColor,
          }}
        />
      </div>

      {/* Body */}
      <div
        className="card__body"
        style={{ display: "flex", flexDirection: "column", flex: 1 }}
      >
        <h3
          className="card__title"
          style={{
            fontSize: isSpotlight ? "var(--text-xl)" : "var(--text-lg)",
            marginBottom: "var(--space-2)",
          }}
        >
          {name}
        </h3>

        {/* Tagline */}
        {tagline && !isSpotlight && (
          <p
            style={{
              fontSize: "var(--text-sm)",
              fontStyle: "italic",
              color: "var(--color-text-secondary)",
              maxWidth: "none",
              marginBottom: "var(--space-3)",
            }}
          >
            {tagline}
          </p>
        )}

        {/* Description */}
        <p className="card__excerpt" style={{ flex: 1 }}>
          {isSpotlight ? tagline || description : description}
        </p>

        {/* CTA */}
        <a
          href={`/programs/${slug}`}
          className={isSpotlight ? "btn btn-outline btn-sm" : "btn btn-primary btn-sm"}
          style={{ marginTop: "var(--space-4)", display: "inline-flex", alignSelf: "flex-start" }}
        >
          Learn More &rarr;
        </a>
      </div>
    </article>
  );
}
