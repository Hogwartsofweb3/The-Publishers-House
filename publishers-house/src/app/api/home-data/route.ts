import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { parseStartAndEnd } from "@/lib/eventTimingUtils";

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

    let flierUrl = (ev.imageUrl || ev.coverImageUrl || ev.flierUrl || "").trim();
    const titleLower = (ev.title || "").toLowerCase();
    if (!flierUrl || titleLower.includes("merismos")) {
      if (titleLower.includes("merismos")) {
        flierUrl = "https://i.postimg.cc/NMWknRpc/image.png";
      }
    }

    return {
      id: ev.id,
      eventId: ev.id,
      day: dayNames[d.getDay()] || "GAT",
      date: String(d.getDate()).padStart(2, "0"),
      month: monthNames[d.getMonth()] || "DEC",
      title: ev.title || "Special Gathering",
      theme: ev.summary || ev.theme || "Upcoming Flagship Event",
      desc: ev.description || ev.summary || "Believers gather for sound apostolic doctrine and corporate prayer.",
      scripture: ev.scripture || "Hebrews 4:12",
      time: formattedTime || "4:45 PM WAT",
      city: ev.location || "Jos",
      flierUrl,
      registrationUrl: ev.registrationUrl || "",
      published: true,
      order: ev.order ?? 0,
      startAt: ev.startAt || d.toISOString(),
      endAt: ev.endAt || "",
      startDate: ev.startDate || "",
      endDate: ev.endDate || "",
      days: Array.isArray(ev.days) ? ev.days : [],
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

  // 2b. Check events collection in Firestore for linked or upcoming events (e.g. Merismos)
  try {
    const eventsSnap = await getDocs(
      query(collection(db, "events"), where("published", "==", true), limit(10))
    );
    if (!eventsSnap.empty) {
      const convertedEvents = eventsSnap.docs
        .map((d) => parseEventToGathering({ id: d.id, ...d.data() }))
        .filter(Boolean);

      convertedEvents.forEach((ce: any) => {
        const existing = gatherings.find((g) =>
          (g.eventId && g.eventId === ce.eventId) ||
          (g.title && g.title.toLowerCase().trim() === ce.title?.toLowerCase().trim())
        );

        if (existing) {
          if (!existing.flierUrl && ce.flierUrl) existing.flierUrl = ce.flierUrl;
          if (!existing.eventId) existing.eventId = ce.eventId;
          if (!existing.registrationUrl && ce.registrationUrl) existing.registrationUrl = ce.registrationUrl;
          if (!existing.startAt && ce.startAt) existing.startAt = ce.startAt;
          if (!existing.endAt && ce.endAt) existing.endAt = ce.endAt;
          if (!existing.endDate && ce.endDate) existing.endDate = ce.endDate;
          if (!existing.startDate && ce.startDate) existing.startDate = ce.startDate;
          if ((!existing.days || existing.days.length === 0) && ce.days && ce.days.length > 0) {
            existing.days = ce.days;
          }
        }
      });
    }
  } catch (e) {}

  // Ensure Merismos has the updated logo flier
  gatherings.forEach((g) => {
    if ((g.title || "").toLowerCase().includes("merismos")) {
      if (!g.flierUrl || g.flierUrl.includes("merismos-2024")) {
        g.flierUrl = "https://i.postimg.cc/NMWknRpc/image.png";
      }
      if (!g.startAt) g.startAt = "2026-12-10T16:45:00";
      if (!g.endAt) g.endAt = "2026-12-13T23:40:00";
    }
  });

  // Calculate startMs and endMs for all gatherings
  const nowMs = Date.now();
  const gatheringsWithTiming = gatherings.map((g) => {
    const timing = parseStartAndEnd(g);
    return {
      ...g,
      startAt: g.startAt || timing.start.toISOString(),
      endAt: g.endAt || timing.end.toISOString(),
      startMs: timing.startMs,
      endMs: timing.endMs,
    };
  });

  // AUTO-HIDE FULFILLED EVENTS:
  // Strictly filter out any event where the end date/time has passed (nowMs > endMs).
  // Concluded events are NEVER presented to public website visitors.
  const activeGatherings = gatheringsWithTiming.filter((g) => {
    if (g.published === false) return false;
    return g.endMs >= nowMs;
  });

  activeGatherings.sort((a, b) => a.startMs - b.startMs);
  gatherings = activeGatherings;

  // Fallback: If no custom gatherings are currently upcoming in gatherings collection,
  // check if there is an upcoming schedule event (e.g. Merismos) that has not yet concluded
  if (gatherings.length === 0) {
    try {
      const allEventsSnap = await getDocs(
        query(collection(db, "events"), where("published", "==", true), limit(5))
      );
      const futureEvents = allEventsSnap.docs
        .map((d) => parseEventToGathering({ id: d.id, ...d.data() }))
        .filter((ce: any) => ce && parseStartAndEnd(ce).endMs >= nowMs);
      if (futureEvents.length > 0) {
        gatherings = futureEvents
          .map((g: any) => {
            const timing = parseStartAndEnd(g);
            return { ...g, startMs: timing.startMs, endMs: timing.endMs };
          })
          .sort((a: any, b: any) => a.startMs - b.startMs);
      }
    } catch (e) {}
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
