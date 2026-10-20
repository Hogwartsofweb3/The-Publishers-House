import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const snap = await getAdminDb()
      .collection("transactions")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();
    const transactions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ ok: true, transactions });
  } catch (err: any) {
    console.error("CMS transactions fetch error:", err);
    return NextResponse.json({ ok: false, error: err.message, transactions: [] }, { status: 500 });
  }
}
