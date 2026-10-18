import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_ANNOUNCEMENT = {
  active: false,
  badge: "Notice",
  message: "Welcome to The Publishers House — Company of the Great.",
  linkText: "Plan Your Visit →",
  linkUrl: "/about",
  bgColor: "#0140C1",
};

export async function GET() {
  try {
    const doc = await getAdminDb().collection("settings").doc("global_announcement").get();
    if (!doc.exists) {
      return NextResponse.json(DEFAULT_ANNOUNCEMENT);
    }
    return NextResponse.json({ ...DEFAULT_ANNOUNCEMENT, ...doc.data() });
  } catch (err: any) {
    return NextResponse.json(DEFAULT_ANNOUNCEMENT);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dataToSave = {
      active: Boolean(body.active),
      badge: body.badge || "Notice",
      message: body.message || "",
      linkText: body.linkText || "",
      linkUrl: body.linkUrl || "",
      bgColor: body.bgColor || "#0140C1",
      updatedAt: new Date().toISOString(),
    };

    await getAdminDb().collection("settings").doc("global_announcement").set(dataToSave, { merge: true });
    return NextResponse.json({ ok: true, data: dataToSave });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
