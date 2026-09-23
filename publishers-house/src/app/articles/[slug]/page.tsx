import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import { getArticleBySlug, getArticles } from "@/lib/firebase";

export const revalidate = 0;

export async function generateStaticParams() {
  const articles = await getArticles(50);
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: `${article.title} | The Publishers House`,
    description: article.excerpt,
  };
}

const Navy = "#151A54";
const Blue700 = "#0140C1";
const Blue500 = "#2090FF";
const Slate500 = "#747CA1";
const Slate600 = "#4A62A0";
const White = "#FFFFFF";

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

  const dateLabel = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px" }}>

        {/* Hero */}
        <section style={{ position: "relative", backgroundColor: Navy, padding: "80px 100px", overflow: "hidden" }}>
          {article.coverImageUrl && (
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${article.coverImageUrl})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.12 }} />
          )}
          <div style={{ position: "relative", maxWidth: "900px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
            <Link href="/articles" style={{ ...T.eyebrow, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
              ← Articles and Essays
            </Link>
            {article.categories?.[0] && (
              <div style={{ ...T.eyebrow, color: Blue500 }}>{article.categories[0]}</div>
            )}
            <h1 style={{ ...T.displayXL, color: White, margin: 0 }}>{article.title}</h1>
            {article.excerpt && (
              <p style={{ ...T.readLede, color: "rgba(255,255,255,0.80)", margin: 0, maxWidth: "700px" }}>{article.excerpt}</p>
            )}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "8px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              {article.author && (
                <span style={{ ...T.colophon, color: "rgba(255,255,255,0.75)" }}>{article.author}</span>
              )}
              {dateLabel && (
                <>
                  <span style={{ ...T.colophon, color: "rgba(255,255,255,0.3)" }}>·</span>
                  <span style={{ ...T.colophon, color: "rgba(255,255,255,0.55)" }}>{dateLabel}</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Body */}
        <section style={{ backgroundColor: White, padding: "72px 100px 96px" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            {article.body ? (
              <div
                style={{ ...T.readBody, color: Slate600 }}
                className="tiptap" // Use the class to apply Tiptap styles if any
                dangerouslySetInnerHTML={{ __html: article.body }} // Removed replace \n so HTML renders properly
              />
            ) : (
              <p style={{ ...T.readBody, color: Slate500, textAlign: "center", padding: "60px 0" }}>
                Full article content coming soon.
              </p>
            )}

            <ShareButtons title={article.title} />

            <div style={{ marginTop: "32px", paddingTop: "32px", borderTop: "1px solid #E8ECF7" }}>
              <Link href="/articles" style={{ ...T.button, color: Blue700, textDecoration: "none" }}>
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
