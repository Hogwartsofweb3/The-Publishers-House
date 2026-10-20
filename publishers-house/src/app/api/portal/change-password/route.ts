import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Update Firebase Auth password permanently via Admin SDK
    const adminAuth = getAdminAuth();
    await adminAuth.updateUser(user.uid, { password: newPassword });

    // Update user record in Firestore
    const adminDb = getAdminDb();
    await adminDb.collection("users").doc(user.uid).set(
      {
        mustChangePassword: false,
        tempPassword: null,
        passwordChangedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      message: "Password updated successfully.",
    });
  } catch (err: any) {
    console.error("Error changing password:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update password." },
      { status: 500 }
    );
  }
}
