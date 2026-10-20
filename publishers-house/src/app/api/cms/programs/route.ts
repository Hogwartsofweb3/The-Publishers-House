import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await getAdminDb()
      .collection("programs")
      .orderBy("name", "asc")
      .get();
    const programs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ ok: true, programs });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, programs: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, program, published } = body;
    const db = getAdminDb();
    const now = new Date().toISOString();

    if (action === "save") {
      if (!program || typeof program !== "object") {
        return NextResponse.json({ error: "Missing program payload" }, { status: 400 });
      }

      const slugify = (str: string) =>
        str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const cleanData: Record<string, any> = {
        name: program.name || "",
        slug: program.slug || slugify(program.name || ""),
        summary: program.summary || "",
        frequency: program.frequency || "",
        imageUrl: program.imageUrl || "",
        detailsUrl: program.detailsUrl || "",
        published: program.published !== false,
        updatedAt: now,
      };

      if (id) {
        await db.collection("programs").doc(id).set(cleanData, { merge: true });
        return NextResponse.json({ ok: true, id, message: "Program updated successfully ✓" });
      } else {
        const docRef = await db.collection("programs").add({
          ...cleanData,
          createdAt: now,
        });
        return NextResponse.json({ ok: true, id: docRef.id, message: "Program added successfully ✓" });
      }
    }

    if (action === "delete") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await db.collection("programs").doc(id).delete();
      return NextResponse.json({ ok: true });
    }

    if (action === "toggle_publish") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await db.collection("programs").doc(id).set(
        { published: Boolean(published), updatedAt: now },
        { merge: true }
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("CMS programs API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
