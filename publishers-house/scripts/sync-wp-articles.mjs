import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBuveFHpMOPwCnCYLvoHaEEy42bedoMfmM",
  authDomain: "thepublishershouse-6d1cf.firebaseapp.com",
  projectId: "thepublishershouse-6d1cf",
  storageBucket: "thepublishershouse-6d1cf.appspot.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

function extractAuthor(content, fallback = "Editorial Unit") {
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

async function sync() {
  console.log("Fetching posts from WordPress REST API...");
  const res = await fetch("https://public-api.wordpress.com/wp/v2/sites/thepublisherspen.wordpress.com/posts?_embed&per_page=50");
  const posts = await res.json();
  console.log(`Fetched ${posts.length} posts from WordPress.`);

  const snap = await getDocs(collection(db, "articles"));
  const existingArticles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Found ${existingArticles.length} existing articles in Firestore.`);

  for (const p of posts) {
    const rawTitle = p.title?.rendered || "";
    const title = decodeHtml(rawTitle);
    const slug = p.slug === "hello-world" 
      ? "influencer-culture-and-self-worth-do-fame-and-followers-define-value-from-a-biblical-perspective"
      : p.slug;

    // Extract image
    const featured = p.jetpack_featured_media_url || p._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    const imgMatch = p.content?.rendered?.match(/<img[^>]+src=["']([^"']+)["']/i);
    const coverImageUrl = featured || (imgMatch ? imgMatch[1] : "");

    // Clean excerpt
    const rawExcerpt = p.excerpt?.rendered || "";
    const cleanExcerpt = decodeHtml(rawExcerpt.replace(/<[^>]+>/g, " ").replace(/\[&hellip;\]/g, "...").trim()).slice(0, 240);

    // Full body
    const body = cleanHtmlBody(p.content?.rendered || "");

    // Author
    const author = extractAuthor(p.content?.rendered || "", "Pastor Ngbede Odeh");

    // Categories
    const categories = CATEGORY_MAP[p.slug] || ["Faith & Living"];

    const publishedAt = p.date ? p.date.split("T")[0] : new Date().toISOString().split("T")[0];

    // Find match in Firestore
    const match = existingArticles.find(a => a.slug === slug || a.title?.toLowerCase().trim() === title.toLowerCase().trim());

    const articleData = {
      title,
      slug,
      coverImageUrl,
      excerpt: cleanExcerpt,
      body,
      author,
      categories,
      publishedAt,
      published: true,
      updatedAt: new Date(),
    };

    if (match) {
      console.log(`Updating existing article: "${title}" (${match.id})`);
      await updateDoc(doc(db, "articles", match.id), articleData);
    } else {
      console.log(`Creating new article: "${title}"`);
      await addDoc(collection(db, "articles"), {
        ...articleData,
        createdAt: new Date(),
      });
    }
  }

  console.log("Sync completed successfully!");
}

sync().catch(console.error);
