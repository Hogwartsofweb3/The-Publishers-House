import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await getAdminDb().collection("settings").doc("church_portal").get();
    if (!doc.exists) {
      return NextResponse.json({ exists: false, settings: null });
    }

    return NextResponse.json({ exists: true, settings: doc.data() });
  } catch (err: any) {
    console.error("Error fetching settings:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
    }

    const cleanData = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.email || user.displayName || user.uid,
    };

    await getAdminDb()
      .collection("settings")
      .doc("church_portal")
      .set(cleanData, { merge: true });

    return NextResponse.json({ ok: true, message: "Settings saved successfully" });
  } catch (err: any) {
    console.error("Error saving portal settings via admin API:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
