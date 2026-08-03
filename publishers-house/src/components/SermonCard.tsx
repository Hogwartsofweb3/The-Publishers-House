/**
 * SermonCard — displays a single sermon entry.
 * Used on: Homepage (latest sermon), Resources/Sermons tab, sermon grid.
 * Props match the Sermon type from lib/strapi.ts.
 * TODO: Wire `sermon.youtubeUrl` to actual video player once AVO delivers thumbnails.
 */

import type { Sermon } from "@/lib/strapi";
import { getStrapiMediaUrl } from "@/lib/strapi";

interface SermonCardProps {
  sermon: Sermon;
  featured?: boolean; // larger display for homepage "latest sermon" slot
}

export default function SermonCard({ sermon, featured = false }: SermonCardProps) {
  const thumbnailUrl = getStrapiMediaUrl(sermon.thumbnail?.url);
  const formattedDate = sermon.date
    ? new Date(sermon.date).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date TBC";

  return (
    <article
      className="card"
      style={{
        display: "flex",
        flexDirection: featured ? "row" : "column",
        overflow: "hidden",
        transition: "transform var(--transition-normal), box-shadow var(--transition-normal)",
        height: "100%",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          position: "relative",
          flexShrink: 0,
          width: featured ? "260px" : "100%",
          height: featured ? "100%" : "200px",
          minHeight: featured ? "220px" : undefined,
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
          overflow: "hidden",
        }}
      >
        {/* Thumbnail image — shows skeleton gradient until AVO provides real images */}
        <div
          className="skeleton"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('${thumbnailUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Play button overlay */}
        <a
          href={sermon.youtubeUrl || "#"}
          target={sermon.youtubeUrl ? "_blank" : undefined}
          rel="noopener noreferrer"
          aria-label={`Watch sermon: ${sermon.title}`}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.35)",
            transition: "background var(--transition-normal)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.55)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.35)")}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              transition: "transform var(--transition-normal)",
            }}
          >
            {/* Triangle play icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-primary)">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </a>

        {/* Series tag */}
        {sermon.series && (
          <span
            style={{
              position: "absolute",
              bottom: "var(--space-3)",
              left: "var(--space-3)",
              background: "var(--color-accent)",
              color: "var(--color-primary)",
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              letterSpacing: "var(--tracking-wide)",
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: "var(--radius-full)",
            }}
          >
            {sermon.series}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="card__body" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Meta */}
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", marginBottom: "var(--space-3)", flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", maxWidth: "none" }}>
            {formattedDate}
          </span>
          {sermon.speaker && (
            <>
              <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>·</span>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-accent)", fontWeight: 600, maxWidth: "none" }}>
                {sermon.speaker}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h4
          className="card__title"
          style={{ fontSize: featured ? "var(--text-xl)" : "var(--text-lg)", lineHeight: "var(--leading-snug)" }}
        >
          {sermon.title}
        </h4>

        {/* Description */}
        {sermon.description && (
          <p className="card__excerpt" style={{ flex: 1 }}>
            {sermon.description}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)", flexWrap: "wrap" }}>
          {sermon.youtubeUrl && (
            <a
              href={sermon.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              ▶ Watch
            </a>
          )}
          {sermon.audioUrl && (
            <a href={sermon.audioUrl} className="btn btn-outline btn-sm" download>
              ↓ Audio
            </a>
          )}
          {sermon.studyGuideUrl && (
            <a href={sermon.studyGuideUrl} className="btn btn-outline btn-sm" download>
              ↓ Study Guide
            </a>
          )}
          {!sermon.youtubeUrl && !sermon.audioUrl && (
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Recording coming soon
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
