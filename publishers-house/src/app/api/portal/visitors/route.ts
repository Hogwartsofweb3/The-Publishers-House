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

    const snap = await getAdminDb()
      .collection("visitors")
      .orderBy("createdAt", "desc")
      .get();

    const visitors = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ ok: true, visitors });
  } catch (err: any) {
    console.error("Error fetching pastoral visitors:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    if (!body?.name || !body?.phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const newVisitor = {
      name: body.name,
      phone: body.phone,
      firstVisitDate: body.firstVisitDate || new Date().toISOString().split("T")[0],
      assignedTo: body.assignedTo || "Pastoral Team",
      notes: body.notes || "",
      status: body.status || "new",
      createdAt: new Date().toISOString(),
      loggedBy: user.email || user.displayName,
    };

    const docRef = await getAdminDb().collection("visitors").add(newVisitor);

    return NextResponse.json({
      ok: true,
      visitor: { id: docRef.id, ...newVisitor },
    });
  } catch (err: any) {
    console.error("Error creating pastoral visitor:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Visitor ID is required" }, { status: 400 });
    }

    await getAdminDb()
      .collection("visitors")
      .doc(id)
      .set(
        {
          ...updates,
          updatedAt: new Date().toISOString(),
          updatedBy: user.email || user.displayName,
        },
        { merge: true }
      );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error updating pastoral visitor:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
