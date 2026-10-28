import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

export const revalidate = 60; // refresh every minute so new sermons and events appear quickly

function parseEventToGathering(ev: any) {
  try {
    const rawDate = ev.startAt || ev.date;
    if (!rawDate) return null;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return null;

    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    // Format time from Date if available
    let formattedTime = ev.time;
    if (!formattedTime && !isNaN(d.getTime())) {
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      const mStr = minutes > 0 ? `:${String(minutes).padStart(2, "0")}` : ":00";
      formattedTime = `${h12}${mStr} ${ampm} WAT`;
    }

    return {
      id: ev.id,
      eventId: ev.id,
      day: dayNames[d.getDay()] || "GAT",
      date: String(d.getDate()).padStart(2, "0"),
      month: monthNames[d.getMonth()] || "OCT",
      title: ev.title || "Special Gathering",
      theme: ev.summary || ev.theme || "Upcoming Flagship Event",
      desc: ev.description || ev.summary || "Believers gather for sound apostolic doctrine and corporate prayer.",
      scripture: ev.scripture || "Isaiah 60:1",
      time: formattedTime || "4:00 PM WAT",
      city: ev.location || "Jos",
      flierUrl: (ev.imageUrl || ev.coverImageUrl || ev.flierUrl || "").trim(),
      registrationUrl: ev.registrationUrl || "",
      published: true,
      order: ev.order ?? -10,
    };
  } catch {
    return null;
  }
}

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

  // 2. Load upcoming gatherings from gatherings collection
  try {
    const snap = await getDocs(query(collection(db, "gatherings"), orderBy("order", "asc")));
    gatherings = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((g: any) => g.published !== false);
  } catch (e) {}

  // 2b. Check events collection in Firestore for upcoming conferences (e.g. The Shout of a King, Merismos)
  try {
    const eventsSnap = await getDocs(
      query(collection(db, "events"), where("published", "==", true), limit(10))
    );
    if (!eventsSnap.empty) {
      const convertedEvents = eventsSnap.docs
        .map((d) => parseEventToGathering({ id: d.id, ...d.data() }))
        .filter(Boolean);

      // Merge and prioritize events:
      convertedEvents.forEach((ce: any) => {
        const existing = gatherings.find((g) =>
          (g.eventId && g.eventId === ce.eventId) ||
          (g.title && g.title.toLowerCase() === ce.title?.toLowerCase())
        );

        if (existing) {
          // If the gathering in gatherings collection doesn't have a flierUrl yet, use the event's flierUrl
          if (!existing.flierUrl && ce.flierUrl) {
            existing.flierUrl = ce.flierUrl;
          }
          if (!existing.eventId) {
            existing.eventId = ce.eventId;
          }
          if (!existing.registrationUrl && ce.registrationUrl) {
            existing.registrationUrl = ce.registrationUrl;
          }
        } else {
          gatherings.unshift(ce);
        }
      });
    }
  } catch (e) {}

  // Always ensure premier upcoming flagship conference ("The Shout of a King") is presented
  const shoutOfKingGathering = gatherings.find((g) =>
    (g.title || "").toLowerCase().includes("shout of a king") ||
    (g.theme || "").toLowerCase().includes("shout of a king")
  );

  if (!shoutOfKingGathering) {
    gatherings.unshift({
      id: "fol-2026-upcoming",
      day: "WED",
      date: "28",
      month: "OCT",
      title: "The Shout of a King",
      theme: "Festival of Light 2026 — Annual Homecoming",
      desc: "Annual homecoming conference in Jos. Believers from across the world gather for worship, sound teaching and Holy Ghost encounters.",
      scripture: "Numbers 23:21",
      time: "4:00 PM WAT",
      city: "The House of Bread, Jos",
      flierUrl: "https://i.postimg.cc/vTf49Wsz/FOL.-26.jpg",
      published: true,
      order: -20,
    });
  } else if (!shoutOfKingGathering.flierUrl) {
    shoutOfKingGathering.flierUrl = "https://i.postimg.cc/vTf49Wsz/FOL.-26.jpg";
  }

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
          thumbnailUrl:
            data.coverImageUrl ||
            (videoId
              ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              : "/images/sermon-v2.webp"),
        };
      });
      latestSermon = latestSermons[0] || null;
    }
  } catch (e) {}

  return NextResponse.json(
    { settings, gatherings, latestSermon, latestSermons },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
