import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get("countOnly") === "true";
    const statusFilter = searchParams.get("status");
    const db = getAdminDb();

    const isLeader =
      user.role === "super_admin" ||
      user.role === "admin" ||
      user.role === "portal_manager";

    if (countOnly) {
      let q = db.collection("prayers");
      if (statusFilter) {
        const snap = await q.where("status", "==", statusFilter).get();
        return NextResponse.json({ ok: true, count: snap.size });
      }
      const snap = await q.get();
      return NextResponse.json({ ok: true, count: snap.size });
    }

    let snap;
    if (isLeader) {
      snap = await db
        .collection("prayers")
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();
    } else {
      // Member sees their own prayers
      snap = await db
        .collection("prayers")
        .where("userId", "==", user.uid)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();
    }

    const prayers = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ ok: true, prayers });
  } catch (err: any) {
    console.error("Error fetching prayers:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, category, isConfidential } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Prayer petition details are required" }, { status: 400 });
    }

    const db = getAdminDb();
    const now = new Date().toISOString();

    const docData = {
      content: content.trim(),
      category: category || "general",
      isConfidential: !!isConfidential,
      status: "pending", // pending | prayed | answered
      userId: user.uid,
      userName: user.displayName || "Member",
      userEmail: user.email || "",
      campus: user.campus || "jos",
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("prayers").add(docData);

    return NextResponse.json({
      ok: true,
      id: docRef.id,
      prayer: { id: docRef.id, ...docData },
      message: "Prayer petition submitted successfully to the pastoral care team.",
    });
  } catch (err: any) {
    console.error("Error submitting prayer:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
