import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export const revalidate = 60; // refresh every minute so new sermons appear quickly

export async function GET() {
  let settings: any = {};
  let gatherings: any[] = [];
  let latestSermon: any = null;

  // 1. Load manual CMS overrides from homeSettings/main
  try {
    const snap = await getDoc(doc(db, "homeSettings", "main"));
    if (snap.exists()) settings = snap.data();
  } catch (e) {}

  // 2. Load upcoming gatherings
  try {
    const snap = await getDocs(query(collection(db, "gatherings"), orderBy("order", "asc")));
    gatherings = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((g: any) => g.published !== false);
  } catch (e) {}

  // 3. Auto-fetch latest published sermon (most recent date)
  // NOTE: No `where("published")` to avoid needing a composite index.
  // We fetch the 5 most recent and filter published in JS.
  try {
    const snap = await getDocs(
      query(
        collection(db, "sermons"),
        orderBy("date", "desc"),
        limit(5)
      )
    );
    const publishedDocs = snap.docs.filter(d => d.data().published !== false);
    if (publishedDocs.length > 0) {
      const d = publishedDocs[0];
      const data = d.data();
      const videoId = (() => {
        const url: string = data.videoUrl || "";
        const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      })();
      latestSermon = {
        id: d.id,
        title: data.title || "",
        speaker: data.speaker || "",
        series: data.series || "",
        date: data.date || "",
        scripture: data.scripture || "",
        duration: data.duration || "",
        summary: data.summary || "",
        videoUrl: data.videoUrl || "",
        audioUrl: data.audioUrl || "",
        thumbnailUrl: videoId
          ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          : "/images/sermon-v2.webp",
      };
    }
  } catch (e) {}

  return NextResponse.json({ settings, gatherings, latestSermon }, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
