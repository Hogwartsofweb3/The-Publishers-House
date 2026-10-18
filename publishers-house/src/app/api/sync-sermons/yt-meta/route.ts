import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseDuration(isoDuration: string): string {
  const match = isoDuration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 });
  }

  try {
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
    );
    const ytData = await ytRes.json();

    if (!ytData.items || ytData.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const item = ytData.items[0];
    const snippet = item.snippet;
    const contentDetails = item.contentDetails;

    const thumbnailUrl =
      snippet.thumbnails?.maxres?.url ||
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return NextResponse.json({
      title: snippet.title || "",
      description: snippet.description || "",
      thumbnailUrl,
      publishedAt: snippet.publishedAt || "",
      channelTitle: snippet.channelTitle || "",
      duration: parseDuration(contentDetails?.duration || ""),
      videoId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
