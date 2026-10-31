import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface PlaybackRecord {
  id: string;
  title: string;
  speaker?: string;
  series?: string;
  scripture?: string;
  videoUrl?: string;
  audioUrl?: string;
  spotifyEpisodeId?: string;
  thumbnailUrl?: string;
  progressSeconds: number;
  durationSeconds: number;
  percent: number;
  completed: boolean;
  updatedAt: string;
  type: "sermon" | "resource";
  resourceSlug?: string;
}

export async function GET() {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snap = await getAdminDb()
      .collection("users")
      .doc(user.uid)
      .collection("playback")
      .orderBy("updatedAt", "desc")
      .limit(50)
      .get();

    const items: PlaybackRecord[] = snap.docs.map((d) => d.data() as PlaybackRecord);
    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    console.error("Error fetching playback history:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch playback" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      title,
      speaker,
      series,
      scripture,
      videoUrl,
      audioUrl,
      spotifyEpisodeId,
      thumbnailUrl,
      progressSeconds = 0,
      durationSeconds = 0,
      percent = 0,
      completed = false,
      type = "sermon",
      resourceSlug,
    } = body;

    if (!id || !title) {
      return NextResponse.json({ error: "Missing required fields (id, title)" }, { status: 400 });
    }

    // Clean record
    const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, "_");
    const record: PlaybackRecord = {
      id: String(id),
      title: String(title),
      speaker: speaker ? String(speaker) : "Dr. Joshua Agunbiade",
      series: series ? String(series) : undefined,
      scripture: scripture ? String(scripture) : undefined,
      videoUrl: videoUrl ? String(videoUrl) : undefined,
      audioUrl: audioUrl ? String(audioUrl) : undefined,
      spotifyEpisodeId: spotifyEpisodeId ? String(spotifyEpisodeId) : undefined,
      thumbnailUrl: thumbnailUrl ? String(thumbnailUrl) : undefined,
      progressSeconds: Math.max(0, Math.round(Number(progressSeconds) || 0)),
      durationSeconds: Math.max(0, Math.round(Number(durationSeconds) || 0)),
      percent: Math.min(100, Math.max(0, Math.round(Number(percent) || 0))),
      completed: Boolean(completed) || (Number(percent) >= 90),
      updatedAt: new Date().toISOString(),
      type: type === "resource" ? "resource" : "sermon",
      resourceSlug: resourceSlug ? String(resourceSlug) : undefined,
    };

    await getAdminDb()
      .collection("users")
      .doc(user.uid)
      .collection("playback")
      .doc(safeId)
      .set(record, { merge: true });

    return NextResponse.json({ ok: true, record });
  } catch (err: any) {
    console.error("Error saving playback history:", err);
    return NextResponse.json({ error: err.message || "Failed to save playback" }, { status: 500 });
  }
}
