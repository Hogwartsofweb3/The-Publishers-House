import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseSummary(summary: string) {
  let series = "";
  let speaker = "Dr. Joshua Agunbiade";

  if (summary && summary.includes("~")) {
    const parts = summary.split("~").map((p) => p.trim());
    if (parts.length >= 2) {
      series = parts[0];
      speaker = parts[1];
    }
  } else if (summary && summary.toLowerCase().includes("pastor")) {
    const pMatch = summary.match(/Pastor\s+[A-Za-z]+(?:\s+[A-Za-z]+)?/i);
    if (pMatch) speaker = pMatch[0];
  }

  return { series, speaker };
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url") || req.nextUrl.searchParams.get("episodeId") || "";
  const match = urlParam.match(/(?:episode\/|^)([a-zA-Z0-9]{22})/);
  const episodeId = match ? match[1] : urlParam.trim();

  if (!episodeId) {
    return NextResponse.json({ error: "Missing or invalid Spotify episode URL or ID" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://open.spotify.com/embed/episode/${episodeId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Spotify embed returned status ${res.status}` }, { status: 502 });
    }

    const html = await res.text();
    const nextData = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);

    if (!nextData) {
      return NextResponse.json({ error: "Could not parse Spotify episode metadata" }, { status: 502 });
    }

    const parsed = JSON.parse(nextData[1]);
    const entity = parsed.props?.pageProps?.state?.data?.entity;

    if (!entity) {
      return NextResponse.json({ error: "Episode entity not found in Spotify data" }, { status: 404 });
    }

    let durationFormatted = "45:00";
    if (entity.duration) {
      const totalSec = Math.round(entity.duration / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      durationFormatted = `${m}:${String(s).padStart(2, "0")}`;
    }

    let isoDate = entity.releaseDate?.isoString ? entity.releaseDate.isoString.split("T")[0] : new Date().toISOString().split("T")[0];
    const coverImage =
      entity.relatedEntityCoverArt?.[1]?.url ||
      entity.relatedEntityCoverArt?.[0]?.url ||
      entity.visualIdentity?.image?.[0]?.url ||
      "/images/giving-bg.webp";

    const summaryText = entity.subtitle || "";
    const { series, speaker } = parseSummary(summaryText);

    return NextResponse.json({
      ok: true,
      episodeId,
      title: entity.title || entity.name || "",
      summary: summaryText,
      series: series || "",
      speaker: speaker || "Dr. Joshua Agunbiade",
      duration: durationFormatted,
      date: isoDate,
      coverImageUrl: coverImage,
      audioUrl: `https://open.spotify.com/episode/${episodeId}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch Spotify episode metadata" }, { status: 500 });
  }
}
