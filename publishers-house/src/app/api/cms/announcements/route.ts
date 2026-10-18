import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const DEFAULT_ANNOUNCEMENT = {
  enabled: false,
  text: "",
  linkUrl: "",
  linkLabel: "",
  bgColor: "#0140C1",
  textColor: "#FFFFFF",
};

export async function GET() {
  try {
    const doc = await getAdminDb().collection("settings").doc("announcement_bar").get();
    if (!doc.exists) return NextResponse.json(DEFAULT_ANNOUNCEMENT);
    return NextResponse.json({ ...DEFAULT_ANNOUNCEMENT, ...doc.data() });
  } catch {
    return NextResponse.json(DEFAULT_ANNOUNCEMENT);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await getAdminDb().collection("settings").doc("announcement_bar").set(
      { ...body, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
