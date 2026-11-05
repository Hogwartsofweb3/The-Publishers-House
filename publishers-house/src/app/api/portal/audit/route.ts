import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/portal/audit
 * Returns recent audit log entries.
 * Query params:
 *   - category: filter by category (optional)
 *   - limit: max results (default 20)
 * Admin / super_admin / portal_manager only.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!["admin", "super_admin", "portal_manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || null;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    let query = getAdminDb()
      .collection("audit_logs")
      .orderBy("timestamp", "desc")
      .limit(limit);

    if (category) {
      query = getAdminDb()
        .collection("audit_logs")
        .where("category", "==", category)
        .orderBy("timestamp", "desc")
        .limit(limit);
    }

    const snap = await query.get();
    const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error("Audit log error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
