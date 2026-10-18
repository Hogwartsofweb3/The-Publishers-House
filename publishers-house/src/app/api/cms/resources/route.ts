import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const doc = await getAdminDb().collection("settings").doc("resources_tracks").get();
    const tracks = doc.exists ? doc.data()?.tracks || {} : {};
    return NextResponse.json({ tracks });
  } catch {
    return NextResponse.json({ tracks: {} });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await getAdminDb()
      .collection("settings")
      .doc("resources_tracks")
      .set({ tracks: body.tracks, updatedAt: new Date().toISOString() }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
