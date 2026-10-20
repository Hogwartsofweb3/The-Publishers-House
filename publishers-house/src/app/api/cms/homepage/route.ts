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
