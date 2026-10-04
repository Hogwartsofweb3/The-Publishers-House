import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import TextToSpeech from "@/components/TextToSpeech";
import { getArticleBySlug, getArticles } from "@/lib/firebase";

export const revalidate = 0;

// Static cover image fallbacks keyed by lowercase title
const COVER_IMAGES: Record<string, string> = {
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

export async function generateStaticParams() {
  const articles = await getArticles(50);
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  const cover = article.coverImageUrl || COVER_IMAGES[article.title?.toLowerCase().trim()] || "";
  return {
    title: `${article.title} | The Publishers House`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: cover ? [cover] : [],
    },
  };
}

const Navy = "#151A54";
const Blue700 = "#0140C1";
const Blue500 = "#2090FF";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const White = "#FFFFFF";
const Paper200 = "#E8ECF7";

const T = {
  displayXL: { fontFamily: "var(--font-poppins)", fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", lineHeight: "1.05em", letterSpacing: "-0.02em", textTransform: "uppercase" as const },
  eyebrow:   { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "10px", lineHeight: "1.6em", letterSpacing: "0.2em", textTransform: "uppercase" as const },
  readLede:  { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "20px", lineHeight: "1.55em" },
  readBody:  { fontFamily: "var(--font-playfair)", fontWeight: 400, fontSize: "17px", lineHeight: "1.75em" },
  colophon:  { fontFamily: "var(--font-poppins)", fontWeight: 500, fontSize: "11px", lineHeight: "1.6em", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  button:    { fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: "12px", lineHeight: "1em", letterSpacing: "0.14em", textTransform: "uppercase" as const },
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Resolve cover image — CMS field takes priority, then static fallback
  const coverImage =
    article.coverImageUrl ||
    COVER_IMAGES[article.title?.toLowerCase().trim()] ||
    "";

  const dateLabel = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>

        {/* ── HERO ── */}
        <section
          style={{
            position: "relative",
            backgroundColor: Navy,
            overflow: "hidden",
            padding: "100px 100px 80px",
          }}
        >
          {/* Background image — positioned center-top to show faces/congregation */}
          {coverImage && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                zIndex: 0,
              }}
            />
          )}
          {/* Blue overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: coverImage
                ? "rgba(1,64,193,0.72)"
                : "rgba(21,26,84,0.96)",
              zIndex: 1,
            }}
          />

          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: "900px",
              margin: "0 auto",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <Link
              href="/articles"
              style={{
                ...T.eyebrow,
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
              }}
            >
              ← Articles and Essays
            </Link>

            {article.categories?.[0] && (
              <div style={{ ...T.eyebrow, color: "#90C4FF" }}>
                {article.categories[0]}
              </div>
            )}

            <h1 style={{ ...T.displayXL, color: White, margin: 0 }}>
              {article.title}
            </h1>

            {article.excerpt && (
              <p
                style={{
                  ...T.readLede,
                  color: "rgba(255,255,255,0.82)",
                  margin: 0,
                  maxWidth: "700px",
                }}
              >
                {article.excerpt}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                marginTop: "8px",
                paddingTop: "20px",
                borderTop: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              {article.author && (
                <span style={{ ...T.colophon, color: "rgba(255,255,255,0.80)" }}>
                  {article.author}
                </span>
              )}
              {dateLabel && (
                <>
                  <span style={{ ...T.colophon, color: "rgba(255,255,255,0.3)" }}>·</span>
                  <span style={{ ...T.colophon, color: "rgba(255,255,255,0.58)" }}>
                    {dateLabel}
                  </span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── ARTICLE BODY ── */}
        <section style={{ backgroundColor: White, padding: "72px 100px 96px" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            {/* ── COVER IMAGE (before body) ── */}
            {coverImage && (
              <div
                style={{
                  width: "100%",
                  marginBottom: "40px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#F4F6FB",
                }}
              >
                <img
                  src={coverImage}
                  alt={article.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </div>
            )}

            <TextToSpeech title={article.title} htmlContent={article.body} />

            {article.body ? (
              <div
                style={{ ...T.readBody, color: Slate600 }}
                className="tiptap"
                dangerouslySetInnerHTML={{ __html: article.body }}
              />
            ) : (
              <p
                style={{
                  ...T.readBody,
                  color: Slate500,
                  textAlign: "center",
                  padding: "60px 0",
                }}
              >
                Full article content coming soon.
              </p>
            )}

            {/* ── Q&A SECTION ── */}
            {article.qa && article.qa.length > 0 && (
              <div style={{ marginTop: "48px", paddingTop: "48px", borderTop: `1px solid ${Paper200}` }}>
                <h2 style={{ ...T.displayXL, fontSize: "28px", color: Navy, marginBottom: "32px" }}>Questions & Reflections</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {article.qa.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: "#F4F6FB", padding: "24px", borderRadius: "8px" }}>
                      <h4 style={{ ...T.displayXL, fontSize: "18px", color: Navy, margin: "0 0 12px", textTransform: "none" }}>{item.question}</h4>
                      <p style={{ ...T.readBody, color: Slate600, margin: 0, fontSize: "15px" }}>{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: "40px" }}>
              <ShareButtons title={article.title} />
            </div>

            <div
              style={{
                marginTop: "32px",
                paddingTop: "32px",
                borderTop: `1px solid ${Paper200}`,
              }}
            >
              <Link
                href="/articles"
                style={{ ...T.button, color: Blue700, textDecoration: "none" }}
              >
                ← Back to Articles
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
