import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try by uid first, then by email
    let docSnap = await getAdminDb().collection("users").doc(user.uid).get();
    if (!docSnap.exists && user.email) {
      const emailSnap = await getAdminDb()
        .collection("users")
        .where("email", "==", user.email.toLowerCase())
        .limit(1)
        .get();
      if (!emailSnap.empty) {
        docSnap = emailSnap.docs[0] as any;
      }
    }

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, profile: docSnap.data() });
  } catch (err: any) {
    console.error("Error fetching user profile:", err);
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
    const { displayName, phone, campus, photoURL } = body;

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (typeof displayName === "string" && displayName.trim()) {
      updates.displayName = displayName.trim();
    }
    if (typeof phone === "string") {
      updates.phone = phone.trim();
    }
    // Accept any non-empty campus string (jos, abuja, online, etc.)
    if (typeof campus === "string" && campus.trim()) {
      updates.campus = campus.trim();
    }
    if (typeof photoURL === "string") {
      updates.photoURL = photoURL.trim();
    }

    // Find the right Firestore doc — by uid or by email
    const db = getAdminDb();
    let targetDocRef = db.collection("users").doc(user.uid);

    // Check if the uid-based doc exists
    const uidDoc = await targetDocRef.get();
    if (!uidDoc.exists && user.email) {
      // Look up by email
      const emailSnap = await db
        .collection("users")
        .where("email", "==", user.email.toLowerCase())
        .limit(1)
        .get();
      if (!emailSnap.empty) {
        targetDocRef = emailSnap.docs[0].ref;
      }
    }

    await targetDocRef.set(updates, { merge: true });

    // Synchronize with Firebase Auth display name and photo
    try {
      const authUpdates: { displayName?: string; photoURL?: string } = {};
      if (updates.displayName) authUpdates.displayName = updates.displayName;
      if (updates.photoURL) authUpdates.photoURL = updates.photoURL;
      if (Object.keys(authUpdates).length > 0) {
        await getAdminAuth().updateUser(user.uid, authUpdates);
      }
    } catch (e) {
      // Best-effort Auth sync
    }

    return NextResponse.json({ ok: true, message: "Profile updated successfully", updates });
  } catch (err: any) {
    console.error("Error updating user profile:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
