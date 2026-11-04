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
    const db = getAdminDb();

    const isPastorOrAdmin =
      user.role === "super_admin" ||
      user.role === "admin" ||
      user.role === "portal_manager";

    if (countOnly) {
      if (!isPastorOrAdmin) {
        return NextResponse.json({ count: 0 });
      }
      const pendingSnap = await db
        .collection("pastoral_inquiries")
        .where("status", "==", "pending")
        .get();
      return NextResponse.json({ ok: true, count: pendingSnap.size });
    }

    let snap;
    if (isPastorOrAdmin) {
      snap = await db
        .collection("pastoral_inquiries")
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();
    } else {
      // Member only sees their own inquiries
      snap = await db
        .collection("pastoral_inquiries")
        .where("userId", "==", user.uid)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();
    }

    const inquiries = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ ok: true, inquiries });
  } catch (err: any) {
    console.error("Error fetching pastoral inquiries:", err);
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
    const {
      category,
      targetUnit,
      subject,
      message,
      preferredContact,
      phone,
      email,
      name,
    } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Please enter your message or inquiry details." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const now = new Date().toISOString();

    const inquiryDoc = {
      userId: user.uid,
      memberName: name || user.displayName || "Member",
      memberEmail: email || user.email || "",
      memberPhone: phone || user.phone || "",
      category: category || "Join a Ministry Unit",
      targetUnit: targetUnit || "General",
      subject: subject || "Ministry Inquiry",
      message: message.trim(),
      preferredContact: preferredContact || "WhatsApp",
      campus: user.campus || "jos",
      status: "pending", // pending | contacted | resolved
      createdAt: now,
      updatedAt: now,
      pastoralNotes: "",
    };

    const docRef = await db.collection("pastoral_inquiries").add(inquiryDoc);

    return NextResponse.json({
      ok: true,
      id: docRef.id,
      inquiry: { id: docRef.id, ...inquiryDoc },
      message: "Your inquiry has been submitted to the Pastorate successfully.",
    });
  } catch (err: any) {
    console.error("Error creating pastoral inquiry:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPastorOrAdmin =
      user.role === "super_admin" ||
      user.role === "admin" ||
      user.role === "portal_manager";

    if (!isPastorOrAdmin) {
      return NextResponse.json({ error: "Forbidden: Pastors and Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, pastoralNotes } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 });
    }

    const db = getAdminDb();
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
      updatedBy: user.displayName || user.email,
    };
    if (status) updateData.status = status;
    if (typeof pastoralNotes === "string") updateData.pastoralNotes = pastoralNotes;

    await db.collection("pastoral_inquiries").doc(id).update(updateData);

    return NextResponse.json({ ok: true, message: "Inquiry updated successfully" });
  } catch (err: any) {
    console.error("Error updating pastoral inquiry:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
