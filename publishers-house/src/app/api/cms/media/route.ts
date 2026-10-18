import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await getAdminDb()
      .collection("media_library")
      .orderBy("uploadedAt", "desc")
      .limit(200)
      .get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ items: [], error: err.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, data } = body;

    const db = getAdminDb();

    if (action === "add") {
      const docRef = await db.collection("media_library").add({
        ...data,
        uploadedAt: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true, id: docRef.id });
    }

    if (action === "delete" && id) {
      await db.collection("media_library").doc(id).delete();
      return NextResponse.json({ ok: true });
    }

    if (action === "update" && id) {
      await db.collection("media_library").doc(id).update(data);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
