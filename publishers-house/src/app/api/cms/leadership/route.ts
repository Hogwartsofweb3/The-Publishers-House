import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await getAdminDb()
      .collection("leadership")
      .orderBy("order", "asc")
      .get();
    const leadership = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ ok: true, leadership });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, leadership: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, leader, published } = body;
    const db = getAdminDb();
    const now = new Date().toISOString();

    if (action === "save") {
      if (!leader || typeof leader !== "object") {
        return NextResponse.json({ error: "Missing leader payload" }, { status: 400 });
      }

      const cleanData: Record<string, any> = {
        name: leader.name || "",
        role: leader.role || "",
        bio: leader.bio || "",
        photoUrl: leader.photoUrl || "",
        order: Number(leader.order) || 0,
        published: leader.published !== false,
        updatedAt: now,
      };

      if (id) {
        await db.collection("leadership").doc(id).set(cleanData, { merge: true });
        return NextResponse.json({ ok: true, id, message: "Leader updated successfully ✓" });
      } else {
        const docRef = await db.collection("leadership").add({
          ...cleanData,
          createdAt: now,
        });
        return NextResponse.json({ ok: true, id: docRef.id, message: "Leader added successfully ✓" });
      }
    }

    if (action === "delete") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await db.collection("leadership").doc(id).delete();
      return NextResponse.json({ ok: true });
    }

    if (action === "toggle_publish") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await db.collection("leadership").doc(id).set(
        { published: Boolean(published), updatedAt: now },
        { merge: true }
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("CMS leadership API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
