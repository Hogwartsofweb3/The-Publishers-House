import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { compileWeeklyDigest } from "@/lib/pastoralDigest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/pastoral-digest
 * Vercel Cron or background scheduled automation trigger.
 * Securable via CRON_SECRET or Bearer token if configured.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow local development or unauthorized if no CRON_SECRET is configured
      const url = new URL(req.url);
      const queryKey = url.searchParams.get("key");
      if (queryKey !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
      }
    }

    const digest = await compileWeeklyDigest("Automated Weekly Cron Scheduler");
    const db = getAdminDb();

    // Persist to Firestore
    const docRef = await db.collection("pastoral_digests").add({
      ...digest,
      savedAt: new Date().toISOString(),
      savedBy: "Cron Scheduler",
    });

    // Write audit log
    try {
      await db.collection("audit_logs").add({
        action: `Automated Cron: Pastoral digest #${docRef.id} generated. (${digest.highRiskCount} high-risk members flagged)`,
        actor: "cron-system",
        category: "pastoral",
        timestamp: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({
      ok: true,
      digestId: docRef.id,
      highRiskCount: digest.highRiskCount,
      moderateRiskCount: digest.moderateRiskCount,
      trackedServices: digest.trackedServicesCount,
      period: digest.period,
      message: `Weekly pastoral digest compiled and stored successfully.`,
    });
  } catch (err: any) {
    console.error("Cron pastoral digest error:", err);
    return NextResponse.json({ error: err.message || "Failed to execute cron digest" }, { status: 500 });
  }
}
