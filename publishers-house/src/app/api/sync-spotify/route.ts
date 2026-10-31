import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SHOW_ID = "0FELkmsjm7yVoytlwCXXDG";

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

async function scrapeSpotifyShow(showId: string) {
  const res = await fetch(`https://open.spotify.com/show/${showId}`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify show fetch failed with status ${res.status}`);
  const html = await res.text();

  const segments = html.split('<a href="/episode/');
  const basicEpisodes: Array<{ id: string; title: string; desc: string; date: string }> = [];

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const id = seg.slice(0, seg.indexOf('"'));

    // Title
    const titleMatch = seg.match(/data-testid="episodeTitle"[^>]*>([\s\S]*?)<\/h4>/);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    // Description / summary
    const descMatch =
      seg.match(/data-testid="episodeDescription"[^>]*>([\s\S]*?)<\/p>/) ||
      seg.match(/<p[^>]*class="[^"]*encore-text-body-small[^"]*"[^>]*>([\s\S]*?)<\/p>/);
    const desc = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    // Date
    const dateMatch =
      seg.match(/<span[^>]*data-encore-id="text"[^>]*>([A-Za-z]{3}\s+\d{1,2}(?:,\s+\d{4})?)<\/span>/) ||
      seg.match(/([A-Za-z]{3}\s+\d{1,2})/);
    const date = dateMatch ? dateMatch[1].trim() : "";

    if (id && title && !basicEpisodes.some((r) => r.id === id)) {
      basicEpisodes.push({ id, title, desc, date });
    }
  }

  // Fetch individual episode embeds concurrently (chunks of 4 to be polite to Spotify)
  const fullEpisodes: any[] = [];
  for (let i = 0; i < basicEpisodes.length; i += 4) {
    const chunk = basicEpisodes.slice(i, i + 4);
    const chunkResults = await Promise.all(
      chunk.map(async (ep) => {
        try {
          const epRes = await fetch(`https://open.spotify.com/embed/episode/${ep.id}`, {
            headers: { "User-Agent": "Mozilla/5.0" },
            cache: "no-store",
          });
          if (epRes.ok) {
            const epHtml = await epRes.text();
            const nextData = epHtml.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
            if (nextData) {
              const parsed = JSON.parse(nextData[1]);
              const entity = parsed.props?.pageProps?.state?.data?.entity;

              let durationFormatted = "45:00";
              if (entity?.duration) {
                const totalSec = Math.round(entity.duration / 1000);
                const m = Math.floor(totalSec / 60);
                const s = totalSec % 60;
                durationFormatted = `${m}:${String(s).padStart(2, "0")}`;
              }

              let isoDate = entity?.releaseDate?.isoString ? entity.releaseDate.isoString.split("T")[0] : "";
              if (!isoDate && ep.date) {
                const parsedDate = new Date(`${ep.date} ${new Date().getFullYear()}`);
                if (!isNaN(parsedDate.getTime())) {
                  isoDate = parsedDate.toISOString().split("T")[0];
                }
              }
              if (!isoDate) isoDate = new Date().toISOString().split("T")[0];

              const coverImage =
                entity?.relatedEntityCoverArt?.[1]?.url ||
                entity?.relatedEntityCoverArt?.[0]?.url ||
                entity?.visualIdentity?.image?.[0]?.url ||
                "/images/giving-bg.webp";

              const { series, speaker } = parseSummary(ep.desc);

              return {
                spotifyEpisodeId: ep.id,
                title: entity?.title || entity?.name || ep.title,
                summary: ep.desc || entity?.subtitle || "",
                date: isoDate,
                duration: durationFormatted,
                coverImageUrl: coverImage,
                audioUrl: `https://open.spotify.com/episode/${ep.id}`,
                speaker: speaker || "Dr. Joshua Agunbiade",
                series: series || "",
                published: true,
                source: "spotify",
              };
            }
          }
        } catch (e: any) {
          console.warn(`Failed metadata for ${ep.id}:`, e.message);
        }

        const { series, speaker } = parseSummary(ep.desc);
        return {
          spotifyEpisodeId: ep.id,
          title: ep.title,
          summary: ep.desc,
          date: new Date().toISOString().split("T")[0],
          duration: "45:00",
          coverImageUrl: "/images/giving-bg.webp",
          audioUrl: `https://open.spotify.com/episode/${ep.id}`,
          speaker: speaker || "Dr. Joshua Agunbiade",
          series: series || "",
          published: true,
          source: "spotify",
        };
      })
    );
    fullEpisodes.push(...chunkResults);
  }

  return fullEpisodes;
}

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  try {
    const showId = req.nextUrl.searchParams.get("showId") || DEFAULT_SHOW_ID;
    const episodes = await scrapeSpotifyShow(showId);

    const db = getAdminDb();
    const existingSnap = await db.collection("sermons").get();
    const firestoreDocs = existingSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));

    function normalizeText(str: string) {
      return (str || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    let added = 0;
    let updated = 0;
    const now = new Date().toISOString();

    for (const ep of episodes) {
      const epNorm = normalizeText(ep.title);

      // 1. By Spotify Episode ID
      let existing = firestoreDocs.find(
        (s) => s.spotifyEpisodeId === ep.spotifyEpisodeId
      );

      // 2. By Normalized Title or Substring / Prefix match
      if (!existing) {
        existing = firestoreDocs.find((s) => {
          const sNorm = normalizeText(s.title);
          if (sNorm === epNorm) return true;
          if (sNorm.startsWith(epNorm)) return true;
          if (epNorm.startsWith(sNorm)) return true;
          if (epNorm.includes("pre fol intervention") && sNorm.includes("pre fol intervention")) return true;
          if (epNorm.includes("preparing for a visitation") && sNorm.includes("preparing for a visitation")) return true;
          if (epNorm.includes("water for the thirsty") && sNorm.includes("water for the thirsty")) return true;
          if (epNorm.includes("and he prayed again") && sNorm.includes("and he prayed again")) return true;
          return false;
        });
      }

      if (existing) {
        // Update existing sermon with Spotify episode details
        await db
          .collection("sermons")
          .doc(existing.id)
          .set(
            {
              spotifyEpisodeId: ep.spotifyEpisodeId,
              audioUrl: ep.audioUrl,
              duration: existing.duration || ep.duration,
              coverImageUrl: existing.coverImageUrl || ep.coverImageUrl,
              updatedAt: now,
            },
            { merge: true }
          );
        updated++;
      } else {
        // Add new sermon from Spotify
        await db.collection("sermons").add({
          title: ep.title,
          speaker: ep.speaker,
          date: ep.date,
          series: ep.series,
          scripture: "",
          duration: ep.duration,
          videoUrl: "",
          audioUrl: ep.audioUrl,
          spotifyEpisodeId: ep.spotifyEpisodeId,
          studyGuideUrl: "",
          tags: ["Spotify", "Audio Message", ep.series].filter(Boolean),
          coverImageUrl: ep.coverImageUrl,
          summary: ep.summary,
          published: true,
          source: "spotify",
          createdAt: now,
          updatedAt: now,
        });
        added++;
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully synced ${episodes.length} Spotify episodes (${added} added, ${updated} updated) ✓`,
      total: episodes.length,
      added,
      updated,
      episodes: episodes.map((e) => ({
        id: e.spotifyEpisodeId,
        title: e.title,
        speaker: e.speaker,
        date: e.date,
        duration: e.duration,
      })),
    });
  } catch (err: any) {
    console.error("Spotify sync failed:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to sync Spotify episodes" },
      { status: 500 }
    );
  }
}
