import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SermonDoc {
  title: string;
  speaker: string;
  date: string;
  series: string;
  videoUrl: string;
  audioUrl: string;
  coverImageUrl: string;
  summary: string;
  duration: string;
  tags: string[];
  published: boolean;
  source: "youtube" | "spotify" | "manual";
  youtubeVideoId?: string;
  spotifyEpisodeId?: string;
  studyGuideUrl: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ytThumb(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Parse "PT1H5M30S" or "PT45M" ISO 8601 duration from YouTube into "1:05:30"
function parseDuration(isoDuration: string): string {
  const match = isoDuration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── YouTube Fetcher ──────────────────────────────────────────────────────────
async function fetchYouTubePlaylists(apiKey: string, playlistIds: string[]) {
  const sermons: Partial<SermonDoc>[] = [];

  for (const playlistId of playlistIds) {
    try {
      // 1. Get playlist metadata (to tag series accurately)
      let playlistTitle = "";
      try {
        const plRes = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`);
        if (plRes.ok) {
          const plData = await plRes.json();
          playlistTitle = plData.items?.[0]?.snippet?.title || "";
        }
      } catch (e) {
        console.warn(`Could not fetch title for playlist ${playlistId}:`, e);
      }

      let pageToken = "";
      let pageCount = 0;

      do {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(`YouTube playlist ${playlistId} failed with status: ${res.status}`);
          break;
        }
        const data = await res.json();

        if (data.error) {
          console.warn(`YouTube API error for ${playlistId}:`, data.error.message);
          break;
        }

        const videoIds: string[] = (data.items || [])
          .map((item: any) => item.snippet?.resourceId?.videoId)
          .filter(Boolean);

        if (videoIds.length === 0) break;

        // Fetch video details (duration, clean snippet)
        const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`;
        const detailRes = await fetch(detailUrl);
        const detailData = detailRes.ok ? await detailRes.json() : { items: [] };

        const detailMap = new Map<string, any>();
        for (const item of detailData.items || []) {
          detailMap.set(item.id, item);
        }

        for (const item of data.items || []) {
          const snippet = item.snippet;
          const videoId = snippet?.resourceId?.videoId;
          if (!videoId) continue;

          // Skip private or deleted videos
          if (snippet.title === "Private video" || snippet.title === "Deleted video") continue;

          const detail = detailMap.get(videoId);
          const publishedAt = snippet.publishedAt?.split("T")[0] || new Date().toISOString().split("T")[0];
          const duration = parseDuration(detail?.contentDetails?.duration || "");

          sermons.push({
            title: snippet.title || "Untitled Sermon",
            speaker: "Rev. Joshua Agunbiade",
            date: publishedAt,
            series: playlistTitle || "",
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            audioUrl: "",
            coverImageUrl: ytThumb(videoId),
            summary: snippet.description?.slice(0, 400) || "",
            duration,
            tags: (snippet.tags || []).slice(0, 5),
            published: true,
            source: "youtube" as const,
            youtubeVideoId: videoId,
            studyGuideUrl: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        pageToken = data.nextPageToken || "";
        pageCount++;
      } while (pageToken && pageCount < 10);
    } catch (plErr) {
      console.warn(`Error processing playlist ${playlistId}:`, plErr);
    }
  }

  return sermons;
}

// ─── Spotify Fetcher (Safely handles subscription requirements) ───────────────
async function getSpotifyToken(clientId: string, clientSecret: string): Promise<string | null> {
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.warn("Spotify token request failed:", err);
    return null;
  }
}

async function fetchSpotifyEpisodes(clientId: string, clientSecret: string, showId: string) {
  const sermons: Partial<SermonDoc>[] = [];
  try {
    const token = await getSpotifyToken(clientId, clientSecret);
    if (!token) return sermons;

    let url: string | null = `https://api.spotify.com/v1/shows/${showId}/episodes?limit=50&market=US`;

    while (url) {
      const res: Response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        console.warn(`Spotify episodes fetch returned ${res.status}:`, text);
        break;
      }
      const data: any = await res.json();

      for (const ep of data.items || []) {
        const durationMs = ep.duration_ms || 0;
        const totalSec = Math.round(durationMs / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        const duration = `${m}:${String(s).padStart(2, "0")}`;

        sermons.push({
          title: ep.name,
          speaker: "Rev. Joshua Agunbiade",
          date: ep.release_date || new Date().toISOString().split("T")[0],
          series: "",
          videoUrl: "",
          audioUrl: ep.audio_preview_url || ep.external_urls?.spotify || "",
          coverImageUrl: ep.images?.[0]?.url || "",
          summary: ep.description?.slice(0, 400) || "",
          duration,
          tags: [],
          published: true,
          source: "spotify" as const,
          spotifyEpisodeId: ep.id,
          studyGuideUrl: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      url = data.next || null;
    }
  } catch (err) {
    console.warn("Spotify fetch error (non-fatal):", err);
  }

  return sermons;
}

// ─── Firestore Upsert ─────────────────────────────────────────────────────────
async function upsertSermons(sermons: Partial<SermonDoc>[]): Promise<{ added: number; skipped: number }> {
  const col = adminDb.collection("sermons");

  // Load existing videoIds and spotifyIds to avoid duplicates
  const existingSnap = await col.select("youtubeVideoId", "spotifyEpisodeId").get();
  const existingYtIds = new Set<string>();
  const existingSpIds = new Set<string>();
  existingSnap.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
    const d = doc.data();
    if (d.youtubeVideoId) existingYtIds.add(d.youtubeVideoId);
    if (d.spotifyEpisodeId) existingSpIds.add(d.spotifyEpisodeId);
  });

  let added = 0;
  let skipped = 0;
  let batch = adminDb.batch();
  let batchCount = 0;

  for (const sermon of sermons) {
    // Skip duplicates
    if (sermon.youtubeVideoId && existingYtIds.has(sermon.youtubeVideoId)) {
      skipped++;
      continue;
    }
    if (sermon.spotifyEpisodeId && existingSpIds.has(sermon.spotifyEpisodeId)) {
      skipped++;
      continue;
    }

    const ref = col.doc();
    batch.set(ref, sermon);
    if (sermon.youtubeVideoId) existingYtIds.add(sermon.youtubeVideoId);
    if (sermon.spotifyEpisodeId) existingSpIds.add(sermon.spotifyEpisodeId);

    added++;
    batchCount++;

    // Firestore batch limit is 500 writes
    if (batchCount >= 490) {
      await batch.commit();
      batch = adminDb.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  return { added, skipped };
}

// ─── Telegram Notifier ────────────────────────────────────────────────────────
async function sendTelegramNotification(count: number) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !chatId || count === 0) return;

  try {
    const msg = `📖 *${count} new sermon${count > 1 ? "s" : ""} synced* to The Publishers House website!\n\nVisit: https://thepublishershouse.org/sermons`;
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "Markdown" }),
    });
  } catch (err) {
    console.warn("Telegram notification error:", err);
  }
}

// ─── API Route Handler ────────────────────────────────────────────────────────
export async function handleSync(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "tph-cron-2026-secure";
  const keyParam = req.nextUrl.searchParams.get("key");

  // Allow authorization via Bearer token (Vercel Cron) or query param ?key=...
  const isAuthorized = !cronSecret || authHeader === `Bearer ${cronSecret}` || keyParam === cronSecret;
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ytApiKey = process.env.YOUTUBE_API_KEY;
  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
  const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const spotifyShowId = process.env.SPOTIFY_SHOW_ID;

  const playlistIds = (process.env.YOUTUBE_PLAYLIST_IDS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  try {
    const results = { youtube: 0, spotify: 0, added: 0, skipped: 0 };
    const allSermons: Partial<SermonDoc>[] = [];

    // 1. Fetch YouTube
    if (ytApiKey && playlistIds.length > 0) {
      const ytSermons = await fetchYouTubePlaylists(ytApiKey, playlistIds);
      results.youtube = ytSermons.length;
      allSermons.push(...ytSermons);
    }

    // 2. Fetch Spotify (graceful fallback)
    if (spotifyClientId && spotifyClientSecret && spotifyShowId) {
      const spSermons = await fetchSpotifyEpisodes(spotifyClientId, spotifyClientSecret, spotifyShowId);
      results.spotify = spSermons.length;
      allSermons.push(...spSermons);
    }

    // 3. Upsert to Firestore
    const { added, skipped } = await upsertSermons(allSermons);
    results.added = added;
    results.skipped = skipped;

    // 4. Send Telegram notification if new sermons were added
    if (added > 0) {
      await sendTelegramNotification(added);
    }

    console.log("Sermon sync finished:", results);
    return NextResponse.json({ success: true, ...results });
  } catch (err: any) {
    console.error("Sermon sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}
