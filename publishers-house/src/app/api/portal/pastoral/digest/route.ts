import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";
import { compileWeeklyDigest } from "@/lib/pastoralDigest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/portal/pastoral/digest
 * Returns the latest compiled weekly pastoral digests or compiles a fresh live digest.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const historyOnly = searchParams.get("history") === "true";
    const db = getAdminDb();

    if (historyOnly) {
      const snap = await db
        .collection("pastoral_digests")
        .orderBy("generatedAt", "desc")
        .limit(10)
        .get();

      const digests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return NextResponse.json({ ok: true, digests });
    }

    // Compile fresh live digest
    const digestData = await compileWeeklyDigest(user.email || user.displayName || "Pastoral Portal");
    return NextResponse.json({ ok: true, digest: digestData });
  } catch (err: any) {
    console.error("Error in GET /api/portal/pastoral/digest:", err);
    return NextResponse.json({ error: err.message || "Failed to generate digest" }, { status: 500 });
  }
}

/**
 * POST /api/portal/pastoral/digest
 * Explicitly triggers and persists a weekly pastoral digest record.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();
    const digestData = await compileWeeklyDigest(user.email || user.displayName || "Pastoral Portal");

    // Save to Firestore
    const docRef = await db.collection("pastoral_digests").add({
      ...digestData,
      savedAt: new Date().toISOString(),
      savedBy: user.email || user.displayName,
    });

    // Add to audit logs
    try {
      await db.collection("audit_logs").add({
        action: `Pastoral Care: Generated weekly digest #${docRef.id} (${digestData.highRiskCount} high-risk members flagged)`,
        actor: user.email,
        category: "pastoral",
        timestamp: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({
      ok: true,
      id: docRef.id,
      digest: { id: docRef.id, ...digestData },
      message: `Weekly pastoral digest generated with ${digestData.highRiskCount} high-risk members flagged ✓`,
    });
  } catch (err: any) {
    console.error("Error in POST /api/portal/pastoral/digest:", err);
    return NextResponse.json({ error: err.message || "Failed to compile digest" }, { status: 500 });
  }
}
