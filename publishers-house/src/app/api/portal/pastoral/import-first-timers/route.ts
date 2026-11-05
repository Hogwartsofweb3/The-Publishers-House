import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/portal/pastoral/import-first-timers
 * Reads first_timers collection (status == "new") via Admin SDK,
 * inserts each as a visitor in the pastoral pipeline, then marks them as "imported".
 * Uses Admin SDK → not subject to Firestore client security rules.
 */
export async function POST() {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and pastoral staff can import
    const allowed =
      user.role === "super_admin" ||
      user.role === "admin" ||
      user.role === "portal_manager";
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden — admin access required" }, { status: 403 });
    }

    const db = getAdminDb();

    // Fetch new first timers
    const ftSnap = await db
      .collection("first_timers")
      .where("status", "==", "new")
      .get();

    if (ftSnap.empty) {
      return NextResponse.json({ ok: true, imported: 0, message: "No new first-timers to import." });
    }

    // Fetch current visitors to avoid duplicates
    const visitorsSnap = await db.collection("visitors").get();
    const existingPhones = new Set(
      visitorsSnap.docs
        .map((d: any) => (d.data().phone || "").replace(/\s/g, ""))
        .filter(Boolean)
    );

    let importCount = 0;
    const batch = db.batch();

    for (const docSnap of ftSnap.docs) {
      const ft = docSnap.data();
      const normalizedPhone = (ft.phone || "").replace(/\s/g, "");

      // Skip if phone already in visitors
      if (normalizedPhone && existingPhones.has(normalizedPhone)) continue;

      const newVisitorRef = db.collection("visitors").doc();
      batch.set(newVisitorRef, {
        name: ft.fullName || ft.name || "Unknown",
        phone: ft.phone || "",
        email: ft.email || "",
        firstVisitDate: ft.date || new Date().toISOString().split("T")[0],
        assignedTo: "Pastoral Team",
        notes:
          `Imported from attendance sign-in. Mode: ${ft.mode || "in-person"}.${ft.hearAboutUs ? " Heard about us: " + ft.hearAboutUs : ""}`.trim(),
        status: "new",
        createdAt: new Date().toISOString(),
      });

      // Mark first_timer as imported
      batch.update(docSnap.ref, { status: "imported" });

      importCount++;
    }

    await batch.commit();

    // Audit log
    try {
      await db.collection("audit_logs").add({
        action: `Pastoral: imported ${importCount} first-timer${importCount !== 1 ? "s" : ""} from attendance into visitor pipeline`,
        actor: user.email,
        category: "pastoral",
        timestamp: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({
      ok: true,
      imported: importCount,
      message:
        importCount > 0
          ? `${importCount} first-timer${importCount !== 1 ? "s" : ""} imported into the pastoral pipeline ✓`
          : "No new first-timers to import (all may already be in the pipeline).",
    });
  } catch (err: any) {
    console.error("Pastoral import error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
