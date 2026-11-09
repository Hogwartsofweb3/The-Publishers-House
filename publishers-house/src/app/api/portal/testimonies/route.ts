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
      let q = db.collection("testimonies");
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
        .collection("testimonies")
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();
    } else {
      // Member sees their own testimonies plus approved ones
      snap = await db
        .collection("testimonies")
        .where("userId", "==", user.uid)
        .orderBy("createdAt", "desc")
        .limit(30)
        .get();
    }

    const testimonies = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ ok: true, testimonies });
  } catch (err: any) {
    console.error("Error fetching testimonies:", err);
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
    const { title, content } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Testimony title is required" }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Testimony details are required" }, { status: 400 });
    }

    const db = getAdminDb();
    const now = new Date().toISOString();

    const docData = {
      title: title.trim(),
      content: content.trim(),
      status: "pending", // pending | approved | archived
      userId: user.uid,
      userName: user.displayName || "Member",
      userEmail: user.email || "",
      campus: user.campus || "jos",
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("testimonies").add(docData);

    return NextResponse.json({
      ok: true,
      id: docRef.id,
      testimony: { id: docRef.id, ...docData },
      message: "Testimony submitted successfully! It will appear after pastoral review.",
    });
  } catch (err: any) {
    console.error("Error submitting testimony:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
