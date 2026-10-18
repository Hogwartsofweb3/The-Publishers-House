import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { DEFAULT_GIVING_DATA } from "@/lib/cmsDefaults";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Re-export so existing callers (if any) don't break
export { DEFAULT_GIVING_DATA };

export async function GET() {
  try {
    const doc = await getAdminDb().collection("settings").doc("church_giving").get();
    if (!doc.exists) {
      return NextResponse.json(DEFAULT_GIVING_DATA);
    }
    return NextResponse.json({ ...DEFAULT_GIVING_DATA, ...doc.data() });
  } catch (err: any) {
    return NextResponse.json(DEFAULT_GIVING_DATA);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cleanData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await getAdminDb().collection("settings").doc("church_giving").set(cleanData, { merge: true });
    return NextResponse.json({ ok: true, data: cleanData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
