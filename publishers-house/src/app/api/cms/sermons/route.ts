import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await getAdminDb()
      .collection("sermons")
      .orderBy("date", "desc")
      .get();
    const sermons = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ ok: true, sermons });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, sermons: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, sermon, published } = body;
    const db = getAdminDb();

    if (action === "save") {
      if (!sermon || typeof sermon !== "object") {
        return NextResponse.json({ error: "Missing sermon payload" }, { status: 400 });
      }

      const tagsArray = Array.isArray(sermon.tags)
        ? sermon.tags
        : typeof sermon.tags === "string"
        ? sermon.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];

      let spotifyEpisodeId = (sermon.spotifyEpisodeId || "").trim();
      if (!spotifyEpisodeId && sermon.audioUrl) {
        const match = sermon.audioUrl.match(/episode\/([a-zA-Z0-9]+)/);
        if (match) spotifyEpisodeId = match[1];
      }

      const cleanData: Record<string, any> = {
        title: sermon.title || "",
        speaker: sermon.speaker || "Dr. Joshua Agunbiade",
        date: sermon.date || new Date().toISOString().split("T")[0],
        series: sermon.series || "",
        scripture: sermon.scripture || "",
        duration: sermon.duration || "",
        videoUrl: sermon.videoUrl || "",
        audioUrl: sermon.audioUrl || "",
        spotifyEpisodeId: spotifyEpisodeId || "",
        studyGuideUrl: sermon.studyGuideUrl || "",
        tags: tagsArray,
        coverImageUrl: sermon.coverImageUrl || "",
        summary: sermon.summary || "",
        published: sermon.published !== false,
        updatedAt: new Date().toISOString(),
      };

      if (id) {
        await db.collection("sermons").doc(id).set(cleanData, { merge: true });
        return NextResponse.json({ ok: true, id, message: "Sermon updated successfully ✓" });
      } else {
        const docRef = await db.collection("sermons").add({
          ...cleanData,
          createdAt: new Date().toISOString(),
        });
        return NextResponse.json({ ok: true, id: docRef.id, message: "Sermon added successfully ✓" });
      }
    }

    if (action === "delete") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await db.collection("sermons").doc(id).delete();
      return NextResponse.json({ ok: true });
    }

    if (action === "toggle_publish") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await db.collection("sermons").doc(id).set(
        { published: Boolean(published), updatedAt: new Date().toISOString() },
        { merge: true }
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("CMS sermons API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
