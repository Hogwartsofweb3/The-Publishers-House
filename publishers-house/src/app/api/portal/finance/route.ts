import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/portal/finance
 *  Returns transactions. Admin-only via Admin SDK — no Firestore quota risk.
 *  Query params:
 *   - limit  (default 200)
 *   - email  (filter by donor email, for "my giving" page — members see own only)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limitParam = parseInt(searchParams.get("limit") || "200", 10);
    const emailFilter = searchParams.get("email") || null;

    const isMember = user.role === "member" || user.role === "unit_head";

    // Members can only fetch their own records
    const effectiveEmailFilter = isMember ? user.email : emailFilter;

    let snap;
    if (effectiveEmailFilter) {
      snap = await getAdminDb()
        .collection("transactions")
        .where("email", "==", effectiveEmailFilter)
        .orderBy("timestamp", "desc")
        .limit(limitParam)
        .get();
    } else {
      snap = await getAdminDb()
        .collection("transactions")
        .orderBy("timestamp", "desc")
        .limit(limitParam)
        .get();
    }

    const transactions = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ ok: true, transactions });
  } catch (err: any) {
    console.error("Finance API GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** POST /api/portal/finance — record a manual transaction (admin only) */
export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role === "member" || user.role === "unit_head") {
      return NextResponse.json({ error: "Forbidden — admin access only" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, amountNGN, category, method, notes, reference } = body;

    if (!name || !amountNGN) {
      return NextResponse.json({ error: "name and amountNGN are required" }, { status: 400 });
    }

    const id = `tx-${Date.now()}`;
    const data = {
      id,
      name,
      email: email || "",
      amountNGN: Number(amountNGN),
      category: category || "Offering",
      method: method || "Bank Transfer",
      status: "success",
      timestamp: new Date().toISOString(),
      reference: reference || `TPH-REC-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: notes || "",
      recordedBy: user.email,
    };

    await getAdminDb().collection("transactions").doc(id).set(data);

    // Audit log
    try {
      await getAdminDb().collection("audit_logs").add({
        action: `Finance: recorded ${category || "Offering"} of ₦${Number(amountNGN).toLocaleString()} for ${name}`,
        actor: user.email,
        category: "finance",
        timestamp: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({ ok: true, transaction: data });
  } catch (err: any) {
    console.error("Finance POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
