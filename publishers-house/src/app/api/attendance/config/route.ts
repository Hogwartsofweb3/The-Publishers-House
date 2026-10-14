import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/attendance/config
 * Public endpoint: Returns whether online stream code is active.
 * Does NOT expose the secret code to unauthorized clients to prevent cheating.
 */
export async function GET() {
  try {
    const snap = await getAdminDb().collection("homeSettings").doc("attendance").get();
    if (!snap.exists) {
      return NextResponse.json({ active: false, code: "" });
    }

    const data = snap.data() || {};
    const active = Boolean(data.streamCodeActive && data.streamCode);

    // Check if requester is admin
    let isAdmin = false;
    try {
      const cookieStore = await cookies();
      const session = cookieStore.get(SESSION_COOKIE)?.value;
      if (session) {
        const decoded = await getAdminAuth().verifySessionCookie(session, false);
        const userSnap = await getAdminDb().collection("users").doc(decoded.uid).get();
        if (userSnap.exists && userSnap.data()?.role === "admin") {
          isAdmin = true;
        }
      }
    } catch {
      // not admin
    }

    return NextResponse.json({
      active,
      // Only admins see the actual code in GET response
      code: isAdmin ? String(data.streamCode || "") : "",
      updatedAt: data.updatedAt || null,
    });
  } catch (err: any) {
    console.error("Failed to read attendance config:", err);
    return NextResponse.json({ active: false, code: "" }, { status: 500 });
  }
}

/**
 * POST /api/attendance/config
 * Admin-only endpoint: Update stream code and activation status.
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifySessionCookie(session, false);
    const userSnap = await getAdminDb().collection("users").doc(decoded.uid).get();
    if (!userSnap.exists || userSnap.data()?.role !== "admin") {
      return NextResponse.json({ error: "Admin role required" }, { status: 403 });
    }

    const body = await req.json();
    const streamCode = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
    const active = Boolean(body?.active && streamCode);

    const updatePayload = {
      streamCode: active ? streamCode : "",
      streamCodeActive: active,
      updatedAt: new Date().toISOString(),
      updatedBy: decoded.email || decoded.uid,
    };

    await getAdminDb().collection("homeSettings").doc("attendance").set(updatePayload, { merge: true });

    return NextResponse.json({
      ok: true,
      active,
      code: updatePayload.streamCode,
      message: active
        ? `Stream Code "${streamCode}" is now active and required for online check-in.`
        : "Stream Code requirement has been deactivated.",
    });
  } catch (err: any) {
    console.error("Failed to update attendance config:", err);
    return NextResponse.json({ error: err.message || "Failed to update config" }, { status: 500 });
  }
}
