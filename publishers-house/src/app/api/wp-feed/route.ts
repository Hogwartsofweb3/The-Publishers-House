import { NextResponse } from "next/server";

function decodeHtml(html: string) {
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

function cleanHtmlBody(html: string) {
  if (!html) return "";
  let clean = html;
  clean = clean.replace(/<a[^>]+class=["'][^"']*more-link[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, "");
  clean = clean.replace(/<a[^>]+href=["']https?:\/\/thepublisherspen\.wordpress\.com[^"']*["'][^>]*>Continue reading[\s\S]*?<\/a>/gi, "");
  clean = clean.replace(/^\s*<figure[^>]*class=["'][^"']*wp-block-image[^"']*["'][^>]*>[\s\S]*?<\/figure>/i, "");
  clean = clean.replace(/^\s*<div[^>]*class=["'][^"']*wp-block-image[^"']*["'][^>]*>[\s\S]*?<\/div>/i, "");
  return clean.trim();
}

function extractAuthor(content: string, fallback = "Pastor Ngbede Odeh") {
  const match = content.match(/Written by\s+([A-Z][a-zA-Z\s]+)/i);
  if (match && match[1]) {
    return match[1].trim().replace(/\s+and\s+/i, " & ");
  }
  return fallback;
}

export async function GET() {
  try {
    const res = await fetch(
      "https://public-api.wordpress.com/wp/v2/sites/thepublisherspen.wordpress.com/posts?_embed&per_page=100",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) {
      throw new Error(`WordPress API returned status ${res.status}`);
    }
    const posts = await res.json();

    const items = posts.map((p: any) => {
      const title = decodeHtml(p.title?.rendered || "");
      const featured = p.jetpack_featured_media_url || p._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
      const imgMatch = p.content?.rendered?.match(/<img[^>]+src=["']([^"']+)["']/i);
      const coverImageUrl = featured || (imgMatch ? imgMatch[1] : "");

      const rawExcerpt = p.excerpt?.rendered || "";
      const excerpt = decodeHtml(rawExcerpt.replace(/<[^>]+>/g, " ").replace(/\[&hellip;\]/g, "...").trim()).slice(0, 240);
      const body = cleanHtmlBody(p.content?.rendered || "");
      const author = extractAuthor(p.content?.rendered || "", "Pastor Ngbede Odeh");
      const categories = (p._embedded?.["wp:term"]?.[0] || []).map((t: any) => t.name).filter((n: string) => n !== "Uncategorized");

      return {
        id: p.id,
        title,
        slug: p.slug === "hello-world" ? "influencer-culture-and-self-worth-do-fame-and-followers-define-value-from-a-biblical-perspective" : p.slug,
        excerpt,
        body,
        coverImageUrl,
        author,
        categories: categories.length > 0 ? categories : ["Christian Living"],
        isoDate: p.date ? p.date.split("T")[0] : new Date().toISOString().split("T")[0],
      };
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
