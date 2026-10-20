import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_COLLECTIONS = ["testimonies", "prayers"];
const ALLOWED_STATUSES = ["pending", "approved", "rejected", "responded"];

export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update pastoral records
    const adminRoles = ["admin", "super_admin", "portal_manager"];
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { action, collection: colName, id, status, notes } = body;
    const db = getAdminDb();

    if (action === "update_status") {
      if (!ALLOWED_COLLECTIONS.includes(colName)) {
        return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
      }
      if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      if (!id) {
        return NextResponse.json({ error: "Missing document id" }, { status: 400 });
      }

      await db.collection(colName).doc(id).set(
        {
          status,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
          ...(notes ? { adminNotes: notes } : {}),
        },
        { merge: true }
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Portal pastoral API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
