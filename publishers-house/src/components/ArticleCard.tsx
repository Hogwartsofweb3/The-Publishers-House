/**
 * ArticleCard — displays a single blog/article entry.
 * Used on: Homepage articles row, Articles page grid.
 * Props match the Article type from lib/strapi.ts.
 */

import type { Article } from "@/lib/strapi";
import { getStrapiMediaUrl } from "@/lib/strapi";

interface ArticleCardProps {
  article: Article;
}

const categoryColors: Record<Article["category"], { bg: string; text: string }> = {
  Faith:          { bg: "#1A1A2E", text: "#C9A84C" },
  Devotionals:    { bg: "#2D1A4E", text: "#B98FE0" },
  Family:         { bg: "#1A3A2E", text: "#5EC98C" },
  Leadership:     { bg: "#1A2A4E", text: "#5EA8E0" },
  Announcements:  { bg: "#3A2A1A", text: "#E0A85E" },
};

export default function ArticleCard({ article }: ArticleCardProps) {
  const imageUrl = getStrapiMediaUrl(article.coverImage?.url);
  const catStyle = categoryColors[article.category] ?? { bg: "#1A1A2E", text: "#C9A84C" };

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <article
      className="card"
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "transform var(--transition-normal), box-shadow var(--transition-normal)",
      }}
    >
      {/* Cover Image */}
      <a
        href={`/articles/${article.slug}`}
        style={{ display: "block", textDecoration: "none" }}
        aria-label={article.title}
      >
        <div
          style={{
            height: "210px",
            position: "relative",
            background: `linear-gradient(135deg, ${catStyle.bg} 0%, var(--color-primary) 100%)`,
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
              transition: "transform var(--transition-slow)",
            }}
          />
          {/* Category badge */}
          <span
            style={{
              position: "absolute",
              top: "var(--space-4)",
              left: "var(--space-4)",
              background: catStyle.bg,
              color: catStyle.text,
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              letterSpacing: "var(--tracking-wide)",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              border: `1px solid ${catStyle.text}40`,
            }}
          >
            {article.category}
          </span>
        </div>
      </a>

      {/* Body */}
      <div
        className="card__body"
        style={{ display: "flex", flexDirection: "column", flex: 1 }}
      >
        {/* Meta: author + date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            marginBottom: "var(--space-3)",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              color: "var(--color-accent)",
              maxWidth: "none",
            }}
          >
            {article.author}
          </span>
          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>·</span>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", maxWidth: "none" }}>
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <a href={`/articles/${article.slug}`} style={{ textDecoration: "none" }}>
          <h4
            className="card__title"
            style={{
              fontSize: "var(--text-lg)",
              lineHeight: "var(--leading-snug)",
              transition: "color var(--transition-fast)",
            }}
          >
            {article.title}
          </h4>
        </a>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="card__excerpt" style={{ flex: 1 }}>
            {article.excerpt}
          </p>
        )}

        {/* Read more */}
        <a
          href={`/articles/${article.slug}`}
          style={{
            marginTop: "var(--space-4)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--color-accent)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-1)",
          }}
        >
          Read More
          <span style={{ transition: "transform var(--transition-fast)" }}>&rarr;</span>
        </a>
      </div>
    </article>
  );
}
