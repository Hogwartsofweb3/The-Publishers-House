import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

export const revalidate = 60; // refresh every minute so new sermons appear quickly

export async function GET() {
  let settings: any = {};
  let gatherings: any[] = [];
  let latestSermon: any = null;
  let latestSermons: any[] = [];

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

  // 3. Top 5 latest published sermons, ordered by date descending
  try {
    const snap = await getDocs(
      query(
        collection(db, "sermons"),
        where("published", "==", true),
        orderBy("date", "desc"),
        limit(5)
      )
    );
    if (!snap.empty) {
      latestSermons = snap.docs.map((d) => {
        const data = d.data();
        const videoId = (() => {
          const url: string = data.videoUrl || "";
          const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
          return m ? m[1] : null;
        })();
        return {
          id: d.id,
          title: data.title || "",
          speaker: data.speaker || "Rev. Joshua Agunbiade",
          series: data.series || "",
          date: data.date || "",
          scripture: data.scripture || "",
          duration: data.duration || "",
          summary: data.summary || "",
          videoUrl: data.videoUrl || "",
          audioUrl: data.audioUrl || "",
          youtubeVideoId: videoId || data.youtubeVideoId || null,
          thumbnailUrl: data.coverImageUrl || (videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : "/images/sermon-v2.webp"),
        };
      });
      latestSermon = latestSermons[0] || null;
    }
  } catch (e) {}

  return NextResponse.json({ settings, gatherings, latestSermon, latestSermons }, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
