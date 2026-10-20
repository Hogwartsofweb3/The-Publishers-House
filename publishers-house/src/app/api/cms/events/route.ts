import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await getAdminDb()
      .collection("events")
      .orderBy("startAt", "asc")
      .get();
    const events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ ok: true, events });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, events: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, event, published } = body;
    const db = getAdminDb();
    const now = new Date().toISOString();

    if (action === "save") {
      if (!event || typeof event !== "object") {
        return NextResponse.json({ error: "Missing event payload" }, { status: 400 });
      }

      const cleanData: Record<string, any> = {
        title: event.title || "",
        location: event.location || "",
        startAt: event.startAt || "",
        endAt: event.endAt || "",
        registrationUrl: event.registrationUrl || "",
        speaker: event.speaker || "",
        scripture: event.scripture || "",
        imageUrl: event.imageUrl || "",
        description: event.description || "",
        published: event.published !== false,
        updatedAt: now,
      };

      if (id) {
        await db.collection("events").doc(id).set(cleanData, { merge: true });
        return NextResponse.json({ ok: true, id, message: "Event updated successfully ✓" });
      } else {
        const docRef = await db.collection("events").add({
          ...cleanData,
          createdAt: now,
        });
        return NextResponse.json({ ok: true, id: docRef.id, message: "Event added successfully ✓" });
      }
    }

    if (action === "delete") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await db.collection("events").doc(id).delete();
      return NextResponse.json({ ok: true });
    }

    if (action === "toggle_publish") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await db.collection("events").doc(id).set(
        { published: Boolean(published), updatedAt: now },
        { merge: true }
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("CMS events API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
