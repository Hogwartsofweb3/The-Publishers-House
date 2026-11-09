import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getAdminDb();
    const settingsDoc = await db.collection("homeSettings").doc("main").get();
    const settings = settingsDoc.exists ? settingsDoc.data() : null;

    const gatheringsSnap = await db
      .collection("gatherings")
      .orderBy("order", "asc")
      .get();
    const gatherings = gatheringsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ ok: true, settings, gatherings });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, settings: null, gatherings: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, settings, gathering, published } = body;
    const db = getAdminDb();
    const now = new Date().toISOString();

    if (action === "save_settings") {
      if (!settings || typeof settings !== "object") {
        return NextResponse.json({ error: "Missing settings payload" }, { status: 400 });
      }
      await db.collection("homeSettings").doc("main").set(
        { ...settings, updatedAt: now },
        { merge: true }
      );
      return NextResponse.json({ ok: true, message: "Settings saved successfully ✓" });
    }

    if (action === "save_gathering") {
      if (!gathering || typeof gathering !== "object") {
        return NextResponse.json({ error: "Missing gathering payload" }, { status: 400 });
      }
      const cleanGathering = {
        ...gathering,
        order: Number(gathering.order) || 0,
        published: gathering.published !== false,
        updatedAt: now,
      };

      if (id) {
        await db.collection("gatherings").doc(id).set(cleanGathering, { merge: true });
        return NextResponse.json({ ok: true, id, message: "Gathering updated successfully ✓" });
      } else {
        const docRef = await db.collection("gatherings").add({
          ...cleanGathering,
          createdAt: now,
        });
        return NextResponse.json({ ok: true, id: docRef.id, message: "Gathering added successfully ✓" });
      }
    }

    if (action === "quick_push_event") {
      const { event } = body;
      if (!event || !event.title) {
        return NextResponse.json({ error: "Missing event data" }, { status: 400 });
      }

      const rawDate = event.startAt || event.date;
      const d = rawDate ? new Date(rawDate) : new Date();
      const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

      let formattedTime = event.time || "";
      if (!formattedTime && !isNaN(d.getTime())) {
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const h12 = hours % 12 || 12;
        const mStr = minutes > 0 ? `:${String(minutes).padStart(2, "0")}` : ":00";
        formattedTime = `${h12}${mStr} ${ampm} WAT`;
      }

      let flierUrl = event.imageUrl || event.flierUrl || "";
      if (!flierUrl || (event.title || "").toLowerCase().includes("merismos")) {
        if ((event.title || "").toLowerCase().includes("merismos")) {
          flierUrl = "/images/merismos-logo.png";
        }
      }

      const gatheringData = {
        eventId: event.id || "",
        title: event.title || "",
        theme: event.summary || event.theme || "Upcoming Flagship Gathering",
        desc: event.description || event.summary || "",
        speaker: event.speaker || "Rev. Joshua Agunbiade",
        scripture: event.scripture || "",
        city: event.location ? event.location.split(",")[0].trim() : "Jos",
        flierUrl,
        registrationUrl: event.registrationUrl || "",
        day: !isNaN(d.getTime()) ? dayNames[d.getDay()] : "THU",
        date: !isNaN(d.getTime()) ? String(d.getDate()).padStart(2, "0") : "10",
        month: !isNaN(d.getTime()) ? monthNames[d.getMonth()] : "DEC",
        time: formattedTime || "4:45 PM WAT",
        startAt: event.startAt || d.toISOString(),
        endAt: event.endAt || "",
        published: true,
        order: 0,
        updatedAt: now,
      };

      // Check if gathering already exists for this event
      const existingSnap = await db.collection("gatherings").where("eventId", "==", event.id).get();
      let docId = "";
      if (!existingSnap.empty) {
        docId = existingSnap.docs[0].id;
        await db.collection("gatherings").doc(docId).set(gatheringData, { merge: true });
      } else {
        const ref = await db.collection("gatherings").add({
          ...gatheringData,
          createdAt: now,
        });
        docId = ref.id;
      }

      return NextResponse.json({ ok: true, id: docId, message: `"${event.title}" is now live on Next Gatherings ✓` });
    }

    if (action === "delete_gathering") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await db.collection("gatherings").doc(id).delete();
      return NextResponse.json({ ok: true });
    }

    if (action === "toggle_publish_gathering") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await db.collection("gatherings").doc(id).set(
        { published: Boolean(published), updatedAt: now },
        { merge: true }
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("CMS homepage API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
