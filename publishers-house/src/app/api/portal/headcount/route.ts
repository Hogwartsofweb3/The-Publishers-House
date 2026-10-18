import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const doc = await getAdminDb().collection("attendance_headcounts").doc(date).get();
    if (!doc.exists) {
      return NextResponse.json({ exists: false, data: null });
    }

    return NextResponse.json({ exists: true, data: doc.data() });
  } catch (err: any) {
    console.error("Error fetching headcount:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, men, women, children, notes, serviceType, campus } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const total = Number(men || 0) + Number(women || 0) + Number(children || 0);

    const record = {
      date,
      men: Number(men || 0),
      women: Number(women || 0),
      children: Number(children || 0),
      total,
      notes: notes || "",
      serviceType: serviceType || "Sunday Service",
      campus: campus || "jos",
      updatedAt: new Date().toISOString(),
    };

    await getAdminDb()
      .collection("attendance_headcounts")
      .doc(date)
      .set(record, { merge: true });

    return NextResponse.json({ ok: true, data: record });
  } catch (err: any) {
    console.error("Error saving headcount via adminDb:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
