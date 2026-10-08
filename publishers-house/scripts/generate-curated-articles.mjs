import fs from "fs";
import path from "path";

function decodeHtml(html) {
  if (!html) return "";
  return html
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8230;/g, "...")
    .trim();
}

function cleanHtmlBody(html) {
  if (!html) return "";
  let clean = html;
  // Remove trailing "Continue reading..." links
  clean = clean.replace(/<a[^>]+class=["'][^"']*more-link[^"']*["'][^>]*>.*?<\/a>/gis, "");
  clean = clean.replace(/<a[^>]+href=["']https?:\/\/thepublisherspen\.wordpress\.com[^"']*["'][^>]*>Continue reading.*?<\/a>/gis, "");
  // Remove first figure/img if it's the top banner image
  clean = clean.replace(/^\s*<figure[^>]*class=["'][^"']*wp-block-image[^"']*["'][^>]*>.*?<\/figure>/is, "");
  clean = clean.replace(/^\s*<div[^>]*class=["'][^"']*wp-block-image[^"']*["'][^>]*>.*?<\/div>/is, "");
  return clean.trim();
}

function extractAuthor(content, fallback = "Pastor Ngbede Odeh") {
  const match = content.match(/Written by\s+([A-Z][a-zA-Z\s]+)/i);
  if (match && match[1]) {
    return match[1].trim().replace(/\s+and\s+/i, " & ");
  }
  return fallback;
}

const CATEGORY_MAP = {
  "comfort-in-grief-how-god-sustains-the-brokenhearted": ["Faith", "Grief & Healing"],
  "serving-god-without-losing-god": ["Christian Living", "Ministry"],
  "ambition-and-the-kingdom-can-they-co-exist": ["Faith", "Christian Living"],
  "instant-gratification-the-enemy-of-spiritual-maturity": ["Spiritual Maturity", "Discipleship"],
  "feminism-and-gender-equality": ["Culture & Society", "Christian Worldview"],
  "set-apart-what-biblical-holiness-demands": ["Holiness", "Faith"],
  "god-or-the-idea-of-god-the-dangers-of-romanticizing-your-relationship-with-god": ["Faith & Doctrine", "Spiritual Maturity"],
  "hustle-culture-and-success-biblical-perspective-on-grinding-nonstop-or-youre-a-failure": ["Culture & Society", "Work & Faith"],
  "pronouns-and-identity-is-identity-fluid-and-self-defined": ["Culture & Society", "Identity"],
  "mental-health-and-the-vibes-only-mindset-if-it-doesnt-feel-good-is-it-toxic-to-avoid-it": ["Mental Health", "Christian Living"],
  "social-media-challenges-and-risk-taking-are-dangerous-trends-just-fun-and-attention-grabbing": ["Culture & Society", "Youth"],
  "hookup-culture-and-relationships-is-casual-sex-liberating-and-harmless": ["Relationships", "Purity"],
  "hello-world": ["Culture & Society", "Identity"],
};

async function buildArticlesData() {
  console.log("Fetching from WordPress REST API...");
  const res = await fetch("https://public-api.wordpress.com/wp/v2/sites/thepublisherspen.wordpress.com/posts?_embed&per_page=50");
  const posts = await res.json();
  console.log(`Fetched ${posts.length} posts.`);

  const curated = posts.map(p => {
    const rawTitle = p.title?.rendered || "";
    const title = decodeHtml(rawTitle);
    const slug = p.slug === "hello-world" 
      ? "influencer-culture-and-self-worth-do-fame-and-followers-define-value-from-a-biblical-perspective"
      : p.slug;

    const featured = p.jetpack_featured_media_url || p._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    const imgMatch = p.content?.rendered?.match(/<img[^>]+src=["']([^"']+)["']/i);
    const coverImageUrl = featured || (imgMatch ? imgMatch[1] : "");

    const rawExcerpt = p.excerpt?.rendered || "";
    const cleanExcerpt = decodeHtml(rawExcerpt.replace(/<[^>]+>/g, " ").replace(/\[&hellip;\]/g, "...").trim()).slice(0, 240);

    const body = cleanHtmlBody(p.content?.rendered || "");
    const author = extractAuthor(p.content?.rendered || "", "Pastor Ngbede Odeh");
    const categories = CATEGORY_MAP[p.slug] || ["Christian Living"];
    const publishedAt = p.date ? p.date.split("T")[0] : "2026-01-01";

    return {
      id: `wp_${p.id}`,
      title,
      slug,
      coverImageUrl,
      excerpt: cleanExcerpt,
      body,
      author,
      categories,
      publishedAt,
      published: true,
      createdAt: null,
      updatedAt: null,
    };
  });

  const fileContent = `// Auto-generated full articles repository with complete content and featured images
import type { Article } from "./firebase";

export const CURATED_ARTICLES: Article[] = ${JSON.stringify(curated, null, 2)};

export function getCuratedArticleBySlug(slug: string): Article | null {
  return CURATED_ARTICLES.find(a => a.slug === slug) || null;
}
`;

  const outPath = path.resolve("src/lib/articlesCurated.ts");
  fs.writeFileSync(outPath, fileContent, "utf-8");
  console.log(`Saved ${curated.length} articles to ${outPath}`);
}

buildArticlesData().catch(console.error);
