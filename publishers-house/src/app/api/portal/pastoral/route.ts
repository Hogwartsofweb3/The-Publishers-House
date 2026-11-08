import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_COLLECTIONS = ["testimonies", "prayers"];
const ALLOWED_STATUSES = ["pending", "approved", "rejected", "responded", "prayed"];

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

      const docRef = db.collection(colName).doc(id);
      const docSnap = await docRef.get();
      const docData = docSnap.exists ? docSnap.data() || {} : {};

      await docRef.set(
        {
          status,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
          ...(notes ? { adminNotes: notes } : {}),
        },
        { merge: true }
      );

      // Create member in-portal notification if prayer was prayed or testimony approved
      try {
        const targetEmail = docData.email || "";
        const targetUserId = docData.userId || docData.uid || "";

        if (targetEmail || targetUserId) {
          if (colName === "prayers" && status === "prayed") {
            const previewText = (docData.content || docData.request || "Your prayer request").substring(0, 50);
            await db.collection("portal_notifications").add({
              userId: targetUserId,
              userEmail: targetEmail ? targetEmail.toLowerCase().trim() : "",
              title: "Prayer Request Lifted Up 🙏",
              message: `The pastorate has prayed over your petition: "${previewText}..."`,
              type: "prayer_prayed",
              link: "/portal/member/prayers",
              read: false,
              createdAt: new Date().toISOString(),
            });
          } else if (colName === "testimonies" && status === "approved") {
            const previewText = (docData.title || docData.content || "Your testimony").substring(0, 50);
            await db.collection("portal_notifications").add({
              userId: targetUserId,
              userEmail: targetEmail ? targetEmail.toLowerCase().trim() : "",
              title: "Testimony Approved ✨",
              message: `Your testimony "${previewText}..." has been approved and published to encourage the brethren.`,
              type: "testimony_approved",
              link: "/portal/testimonies",
              read: false,
              createdAt: new Date().toISOString(),
            });
          }
        }
      } catch (notifErr) {
        console.warn("Could not dispatch member notification:", notifErr);
      }

      // Audit log
      try {
        await db.collection("audit_logs").add({
          action: `${colName === "testimonies" ? "Testimony" : "Prayer"} ${id} marked as "${status}"`,
          actor: user.email,
          category: colName,
          timestamp: new Date().toISOString(),
        });
      } catch {}

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Portal pastoral API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
