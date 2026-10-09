"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getArticles } from "@/lib/firebase";
import type { Article } from "@/lib/firebase";

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Static cover image fallbacks keyed by lowercase title
const COVER_FALLBACKS: Record<string, string> = {
  "serving god without losing god": "https://i.postimg.cc/bvxcvJLK/whatsapp-image-2026-07-18-at-12-47-59-pm-(1).webp",
  "ambition and the kingdom; can they co-exist?": "https://i.postimg.cc/TYV4mSnQ/whatsapp-image-2026-06-29-at-9-57-31-am.webp",
  "instant gratification: the enemy of spiritual maturity": "https://i.postimg.cc/pTQFkDCJ/dr-1-jpg.webp",
  "feminism and gender equality": "https://i.postimg.cc/GpwtN44w/whatsapp-image-2026-04-10-at-10-58-56-am.webp",
  "set apart; what biblical holiness demands": "https://i.postimg.cc/y8zzCcyg/set-apart.webp",
  "god or the idea of god: the dangers of romanticizing your relationship with god": "https://i.postimg.cc/DZt7WD1h/whatsapp-image-2026-03-13-at-9-40-33-am.webp",
  "hustle culture and success: biblical perspective on grinding non-stop or \"you're a failure\".": "https://i.postimg.cc/PJz0tF48/hustle-culture.webp",
  "pronouns and identity: is identity fluid and self-defined?": "https://i.postimg.cc/MKLmnmFb/pronouns-and-identity.png",
  "mental health and the \"vibes only\" mindset: if it doesn't feel good, is it toxic to avoid it?": "https://i.postimg.cc/BnxPJ59Q/image-2.webp",
  "social media challenges and risk-taking: are dangerous trends just fun and attention grabbing?": "https://i.postimg.cc/k5TNWrJF/image-1.webp",
  "hookup culture and relationships: is casual sex liberating and harmless?": "https://i.postimg.cc/QN193GLs/image.webp",
  "influencer culture and self-worth: do fame and followers define value from a biblical perspective?": "https://i.postimg.cc/0NSxwv0x/d9a11-1hdvqaknzmb0fi-qhqrew7a.jpg",
  "comfort in grief – how god sustains the brokenhearted.": "https://i.postimg.cc/C1NjSWt3/whatsapp-image-2026-09-28-at-10-03-29-am.webp",
};

function getCoverImage(article: Article): string {
  if (article.coverImageUrl) return article.coverImageUrl;
  return COVER_FALLBACKS[article.title?.toLowerCase().trim()] || "";
}

const Navy = "#151A54";
const Blue500 = "#2090FF";
const Blue700 = "#0140C1";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const Paper200 = "#E8ECF7";
const Paper300 = "#D3DAEC";
const Paper400 = "#C0C9E0";
const White = "#FFFFFF";

const INITIAL_ARTICLES: Article[] = [
  {
    id: "art-influencer",
    title: "INFLUENCER CULTURE AND SELF-WORTH: DO FAME AND FOLLOWERS DEFINE VALUE FROM A BIBLICAL PERSPECTIVE?",
    slug: "influencer-culture-and-self-worth",
    excerpt: "Does God assess worth the same way the world does? Many Christians have been blinded to a deep truth by the unrelenting need for acceptance and an orphan spirit, which is characterized by emotions of abandonment, rejection, loneliness, and a lack of belonging.",
    coverImageUrl: "https://i.postimg.cc/0NSxwv0x/d9a11-1hdvqaknzmb0fi-qhqrew7a.jpg",
    author: "OYEWOLE PRECIOUS IBUKUNOLUWA",
    categories: ["INFLUENCER CULTURE"],
    publishedAt: "2025-07-23T00:00:00.000Z",
    body: "",
    createdAt: null,
    updatedAt: null,
    published: true,
  },
  {
    id: "art-grief",
    title: "COMFORT IN GRIEF – HOW GOD SUSTAINS THE BROKENHEARTED.",
    slug: "comfort-in-grief",
    excerpt: "Grief, they say, has five stages: denial, anger, bargaining, depression, and acceptance. The reality, however, is that it is seldom neat or linear.",
    coverImageUrl: "https://i.postimg.cc/C1NjSWt3/whatsapp-image-2026-09-28-at-10-03-29-am.webp",
    author: "THE PUBLISHERS HOUSE EDITORIAL TEAM",
    categories: ["FAITH"],
    publishedAt: "2026-09-28T00:00:00.000Z",
    body: "",
    createdAt: null,
    updatedAt: null,
    published: true,
  },
  {
    id: "art-serving",
    title: "SERVING GOD WITHOUT LOSING GOD",
    slug: "serving-god-without-losing-god",
    excerpt: "Activity in the house of God is not the same as communion with the God of the house. We must learn to minister from His presence, not for His approval.",
    coverImageUrl: "https://i.postimg.cc/bvxcvJLK/whatsapp-image-2026-07-18-at-12-47-59-pm-(1).webp",
    author: "THE PUBLISHERS HOUSE",
    categories: ["DISCIPLESHIP"],
    publishedAt: "2026-07-18T00:00:00.000Z",
    body: "",
    createdAt: null,
    updatedAt: null,
    published: true,
  }
];

export default function ArticleCarousel() {
  const [queue, setQueue] = useState<Article[]>(INITIAL_ARTICLES);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [newestSlug, setNewestSlug] = useState<string>("influencer-culture-and-self-worth");

  useEffect(() => {
    getArticles(20).then((fetched) => {
      if (!fetched || !fetched.length) return;
      // Sort by date to find newest
      const sorted = [...fetched].sort(
        (a, b) =>
          new Date(b.publishedAt || 0).getTime() -
          new Date(a.publishedAt || 0).getTime()
      );
      const newest = sorted[0];
      setNewestSlug(newest.slug);
      // Newest first, then shuffle the rest for random order
      const rest = shuffle(sorted.slice(1));
      setQueue([newest, ...rest]);
    }).catch(() => {});
  }, []);

  const advance = useCallback(
    (idx: number) => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => {
          const next = idx !== undefined ? idx : prev + 1;
          return next >= queue.length ? 0 : next;
        });
        setVisible(true);
      }, 350);
    },
    [queue.length]
  );

  // Auto-advance timer — newest article stays 2s longer
  useEffect(() => {
    if (!queue.length) return;
    const isNewest = queue[current]?.slug === newestSlug;
    const delay = isNewest ? 7000 : 5000;
    const timer = setTimeout(() => advance(current + 1 >= queue.length ? 0 : current + 1), delay);
    return () => clearTimeout(timer);
  }, [current, queue, newestSlug, advance]);

  if (!queue.length) return null;

  const article = queue[current];
  const cover = getCoverImage(article);
  const dateLabel = article.publishedAt
    ? new Date(article.publishedAt)
        .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        .toUpperCase()
    : "";

  return (
    <section
      style={{
        backgroundColor: Paper200,
        padding: "72px 100px",
        borderTop: `1px solid ${Paper300}`,
      }}
      className="tph-section"
    >
      <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
        {/* Section label */}
        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: Slate500,
            marginBottom: "8px",
          }}
        >
          From the Articles
        </div>
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: "30px",
            lineHeight: "1.1em",
            letterSpacing: "-0.015em",
            textTransform: "uppercase" as const,
            color: Navy,
            margin: "0 0 32px",
          }}
        >
          Worth Reading
        </h2>

        {/* Card */}
        <Link
          href={`/articles/${article.slug}`}
          style={{ textDecoration: "none", display: "block" }}
        >
          <div
            className="tph-carousel-grid"
            style={{
              border: `1px solid ${Paper300}`,
              borderRadius: "4px",
              overflow: "hidden",
              opacity: visible ? 1 : 0,
              transition: "opacity 350ms ease",
            }}
          >
            {/* Left: cover image */}
            <div
              style={{
                backgroundImage: cover
                  ? `url(${cover})`
                  : "url('/images/who-we-are-v2.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center top",
                minHeight: "280px",
              }}
            />

            {/* Right: text */}
            <div
              style={{
                padding: "48px",
                backgroundColor: White,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              {article.categories?.[0] && (
                <div
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    fontSize: "10px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase" as const,
                    color: Blue500,
                  }}
                >
                  {article.categories[0]}
                </div>
              )}

              <h3
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(18px, 2.2vw, 30px)",
                  lineHeight: "1.1em",
                  letterSpacing: "-0.015em",
                  textTransform: "uppercase" as const,
                  color: Navy,
                  margin: 0,
                }}
              >
                {article.title}
              </h3>

              {article.excerpt && (
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "16px",
                    lineHeight: "1.65em",
                    color: Slate600,
                    margin: 0,
                  }}
                >
                  {article.excerpt}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "8px",
                  paddingTop: "16px",
                  borderTop: `1px solid ${Paper200}`,
                }}
              >
                {article.author && (
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500,
                      fontSize: "10.5px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase" as const,
                      color: Navy,
                    }}
                  >
                    {article.author}
                  </span>
                )}
                {dateLabel && (
                  <>
                    <span style={{ color: Paper400 }}>·</span>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 500,
                        fontSize: "10.5px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase" as const,
                        color: Slate500,
                      }}
                    >
                      {dateLabel}
                    </span>
                  </>
                )}
              </div>

              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase" as const,
                  color: Blue700,
                  marginTop: "8px",
                }}
              >
                Read Article →
              </div>
            </div>
          </div>
        </Link>

        {/* Dot navigation */}
        <div
          style={{
            display: "flex",
            gap: "0px",
            justifyContent: "center",
            marginTop: "24px",
          }}
        >
          {queue.map((_, i) => (
            <button
              key={i}
              onClick={() => advance(i)}
              aria-label={`Go to article ${i + 1}`}
              style={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                style={{
                  width: i === current ? "28px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  backgroundColor: i === current ? Blue700 : Paper300,
                  transition: "all 300ms ease",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
