// ============================================================
// STRAPI CMS API LAYER
// Replace NEXT_PUBLIC_STRAPI_URL with your actual Strapi URL
// from Uncle Samson once the CMS is deployed.
// ============================================================

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

interface FetchOptions {
  path: string;
  params?: Record<string, string | number | boolean>;
  revalidate?: number;
}

// Generic fetch wrapper with error handling
async function strapiGet<T>({ path, params = {}, revalidate = 60 }: FetchOptions): Promise<T | null> {
  try {
    const searchParams = new URLSearchParams();

    // Build query string from params
    Object.entries(params).forEach(([key, val]) => {
      searchParams.set(key, String(val));
    });

    const queryString = searchParams.toString();
    const url = `${STRAPI_URL}/api${path}${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      next: { revalidate },
    });

    if (!res.ok) {
      console.error(`Strapi fetch failed: ${res.status} on ${url}`);
      return null;
    }

    const json = await res.json();
    return json?.data ?? json;
  } catch (err) {
    console.error(`Strapi error on ${path}:`, err);
    return null;
  }
}

// ---- Type Definitions ---- //
// Adjust these fields once Uncle Samson confirms the Strapi schemas

export interface Sermon {
  id: number;
  title: string;
  speaker: string;
  date: string;
  series?: string;
  youtubeUrl?: string;
  audioUrl?: string;
  studyGuideUrl?: string;
  thumbnail?: { url: string; alternativeText?: string };
  tags?: string[];
  description?: string;
}

export interface ChurchEvent {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  venue: string;
  description: string;
  coverImage?: { url: string; alternativeText?: string };
  registrationLink?: string;
  category: "Conference" | "Special Service" | "Program" | "Community";
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  author: string;
  publishedAt: string;
  coverImage?: { url: string; alternativeText?: string };
  excerpt?: string;
  content: string;
  category: "Faith" | "Devotionals" | "Family" | "Leadership" | "Announcements";
  tags?: string[];
}

export interface Program {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  heroImage?: { url: string; alternativeText?: string };
  gallery?: { url: string; alternativeText?: string }[];
  schedule?: string;
  registrationLink?: string;
}

export interface Leader {
  id: number;
  name: string;
  title: string;
  bio?: string;
  portrait?: { url: string; alternativeText?: string };
  order?: number;
}

// ---- Sermons ---- //
export async function getSermons(limit = 12, page = 1): Promise<Sermon[]> {
  const data = await strapiGet<Sermon[]>({
    path: "/sermons",
    params: {
      "pagination[page]": page,
      "pagination[pageSize]": limit,
      "populate": "*",
      "sort": "date:desc",
    },
    revalidate: 300,
  });
  return data ?? [];
}

export async function getLatestSermon(): Promise<Sermon | null> {
  const data = await strapiGet<Sermon[]>({
    path: "/sermons",
    params: { "pagination[pageSize]": 1, "populate": "*", "sort": "date:desc" },
    revalidate: 300,
  });
  return Array.isArray(data) ? data[0] ?? null : null;
}

// ---- Events ---- //
export async function getUpcomingEvents(limit = 6): Promise<ChurchEvent[]> {
  const today = new Date().toISOString().split("T")[0];
  const data = await strapiGet<ChurchEvent[]>({
    path: "/events",
    params: {
      "filters[date][$gte]": today,
      "pagination[pageSize]": limit,
      "populate": "*",
      "sort": "date:asc",
    },
    revalidate: 300,
  });
  return data ?? [];
}

export async function getEvents(limit = 12): Promise<ChurchEvent[]> {
  const data = await strapiGet<ChurchEvent[]>({
    path: "/events",
    params: { "pagination[pageSize]": limit, "populate": "*", "sort": "date:asc" },
    revalidate: 300,
  });
  return data ?? [];
}

// ---- Articles ---- //
export async function getArticles(limit = 12, page = 1): Promise<Article[]> {
  const data = await strapiGet<Article[]>({
    path: "/articles",
    params: {
      "pagination[page]": page,
      "pagination[pageSize]": limit,
      "populate": "*",
      "sort": "publishedAt:desc",
    },
    revalidate: 600,
  });
  return data ?? [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const data = await strapiGet<Article[]>({
    path: "/articles",
    params: { "filters[slug][$eq]": slug, "populate": "*" },
    revalidate: 600,
  });
  return Array.isArray(data) ? data[0] ?? null : null;
}

// ---- Programs ---- //
export async function getPrograms(): Promise<Program[]> {
  const data = await strapiGet<Program[]>({
    path: "/programs",
    params: { "populate": "*", "sort": "name:asc" },
    revalidate: 3600,
  });
  return data ?? [];
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const data = await strapiGet<Program[]>({
    path: "/programs",
    params: { "filters[slug][$eq]": slug, "populate": "*" },
    revalidate: 3600,
  });
  return Array.isArray(data) ? data[0] ?? null : null;
}

// ---- Leadership ---- //
export async function getLeadership(): Promise<Leader[]> {
  const data = await strapiGet<Leader[]>({
    path: "/leaders",
    params: { "populate": "*", "sort": "order:asc" },
    revalidate: 3600,
  });
  return data ?? [];
}

// ---- Utility: Build media URL ---- //
export function getStrapiMediaUrl(url?: string): string {
  if (!url) return "/placeholder.jpg";
  if (url.startsWith("http")) return url;
  return `${STRAPI_URL}${url}`;
}
