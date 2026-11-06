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
    if (!["super_admin", "admin", "portal_manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

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

export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user || !["super_admin", "admin", "portal_manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { action, id, transaction } = body;
    const db = getAdminDb();
    const now = new Date().toISOString();

    if (action === "log") {
      if (!transaction || typeof transaction !== "object") {
        return NextResponse.json({ error: "Missing transaction payload" }, { status: 400 });
      }
      const docId = id || `tx-${Date.now()}`;
      await db.collection("transactions").doc(docId).set(
        { ...transaction, recordedBy: user.email, loggedAt: now },
        { merge: true }
      );
      return NextResponse.json({ ok: true, id: docId });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("CMS transactions POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
