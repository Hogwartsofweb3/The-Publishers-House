import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/youtube-latest?limit=5
 *
 * Fetches the N most recent public videos uploaded to
 * The Publishers House YouTube channel.
 *
 * Channel ID  : UCftePCYyyP3s6HmxipOi9VQ
 * Uploads playlist: UUftePCYyyP3s6HmxipOi9VQ
 *   (YouTube auto-uploads playlist = "UU" + channelId.slice(2))
 */

const UPLOADS_PLAYLIST =
  process.env.YOUTUBE_CHANNEL_UPLOADS_PLAYLIST || "UUftePCYyyP3s6HmxipOi9VQ";

function parseDuration(iso: string): string {
  const m = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const h = parseInt(m[1] || "0");
  const min = parseInt(m[2] || "0");
  const s = parseInt(m[3] || "0");
  if (h > 0) return `${h}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${min}:${String(s).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 });
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "5"), 10);

  try {
    // 1. Get latest N video IDs from the uploads playlist
    const plRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems` +
      `?part=snippet&maxResults=${limit}&playlistId=${UPLOADS_PLAYLIST}&key=${apiKey}`
    );
    if (!plRes.ok) {
      const errText = await plRes.text();
      console.error("YouTube playlist fetch failed:", plRes.status, errText);
      return NextResponse.json({ error: "YouTube API error", status: plRes.status }, { status: 502 });
    }
    const plData = await plRes.json();

    if (plData.error) {
      return NextResponse.json({ error: plData.error.message }, { status: 502 });
    }

    const items: any[] = (plData.items || []).filter(
      (item: any) =>
        item.snippet?.title !== "Private video" &&
        item.snippet?.title !== "Deleted video"
    );

    if (items.length === 0) {
      return NextResponse.json({ videos: [] }, {
        headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
      });
    }

    const videoIds = items.map((item: any) => item.snippet?.resourceId?.videoId).filter(Boolean);

    // 2. Fetch video details (duration, high-res thumbnail)
    const detRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos` +
      `?part=snippet,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`
    );
    const detData = detRes.ok ? await detRes.json() : { items: [] };
    const detMap = new Map<string, any>();
    for (const v of detData.items || []) detMap.set(v.id, v);

    const videos = items.map((item: any) => {
      const videoId = item.snippet?.resourceId?.videoId;
      const det = detMap.get(videoId);
      const snippet = det?.snippet || item.snippet || {};
      const thumb =
        snippet.thumbnails?.maxres?.url ||
        snippet.thumbnails?.high?.url ||
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      return {
        videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        title: snippet.title || "Untitled",
        publishedAt: snippet.publishedAt?.split("T")[0] || "",
        description: (snippet.description || "").slice(0, 300),
        thumbnailUrl: thumb,
        duration: parseDuration(det?.contentDetails?.duration || ""),
        channelTitle: snippet.channelTitle || "The Publishers House",
      };
    });

    return NextResponse.json({ videos }, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (err: any) {
    console.error("youtube-latest error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
