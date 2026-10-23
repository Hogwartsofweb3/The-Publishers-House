import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAILS = [
  "joshuaagunbiade@gmail.com",
  "thepublishershouse007@gmail.com",
];

const ADMIN_ROLES = ["admin", "super_admin", "portal_manager"];

async function getRequester(req?: Request): Promise<{ uid: string; email: string; role: string; isAdmin: boolean }> {
  let uid = "";
  let email = "";
  let role = "";

  // 1. Try session cookie first
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;
    if (session) {
      const decoded = await getAdminAuth().verifySessionCookie(session, false);
      uid = decoded.uid || "";
      email = (decoded.email || "").toLowerCase();
    }
  } catch {}

  // 2. Try Authorization: Bearer <idToken> if no session cookie
  if (!uid && req) {
    try {
      const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const idToken = authHeader.substring(7).trim();
        const decoded = await getAdminAuth().verifyIdToken(idToken);
        uid = decoded.uid || "";
        email = (decoded.email || "").toLowerCase();
      }
    } catch {}
  }

  // 3. Resolve role from Firestore
  if (uid) {
    try {
      const userSnap = await getAdminDb().collection("users").doc(uid).get();
      if (userSnap.exists) {
        const data = userSnap.data();
        role = String(data?.role || "");
        if (!email && data?.email) {
          email = String(data.email).toLowerCase();
        }
      }
    } catch {}
  }

  const isAdmin =
    ADMIN_ROLES.includes(role) ||
    ADMIN_EMAILS.includes(email);

  return { uid, email, role, isAdmin };
}

/**
 * GET /api/attendance/config
 * Public endpoint: Returns whether service validation code is active.
 * Automatically checks timer expiration.
 * Only authenticated admins/managers receive the actual secret code.
 */
export async function GET(req: Request) {
  try {
    const snap = await getAdminDb().collection("homeSettings").doc("attendance").get();
    const data = snap.exists ? snap.data() || {} : {};

    let active = Boolean(data.streamCodeActive && data.streamCode);
    let remainingSeconds: number | null = null;

    if (active && data.expiresAt) {
      const expiresTime = new Date(data.expiresAt).getTime();
      const nowTime = Date.now();
      if (nowTime >= expiresTime) {
        // Expired!
        active = false;
        // Asynchronously clear active status in background
        getAdminDb()
          .collection("homeSettings")
          .doc("attendance")
          .set({ streamCodeActive: false }, { merge: true })
          .catch(() => {});
      } else {
        remainingSeconds = Math.max(0, Math.floor((expiresTime - nowTime) / 1000));
      }
    }

    const requester = await getRequester(req);

    return NextResponse.json({
      active,
      // Only admins/managers see the actual code in GET response
      code: requester.isAdmin && active ? String(data.streamCode || "") : "",
      expiresAt: active ? data.expiresAt || null : null,
      remainingSeconds,
      durationMinutes: data.durationMinutes || null,
      updatedAt: data.updatedAt || null,
    });
  } catch (err: any) {
    console.error("Failed to read attendance config:", err);
    return NextResponse.json({ active: false, code: "" }, { status: 500 });
  }
}

/**
 * POST /api/attendance/config
 * Admin-only endpoint: Update service code, duration timer and activation status.
 * Allows admin, super_admin, portal_manager, and canonical admin emails.
 */
export async function POST(req: Request) {
  try {
    const requester = await getRequester(req);

    if (!requester.uid) {
      return NextResponse.json({ error: "Unauthorized: Please sign in to the portal." }, { status: 401 });
    }

    if (!requester.isAdmin) {
      return NextResponse.json(
        { error: "Admin role required (current role: " + (requester.role || "member") + ")" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const streamCode = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
    const active = Boolean(body?.active && streamCode);

    // Duration timer handling (in minutes)
    const durationMinutes = Number(body?.durationMinutes) > 0 ? Number(body.durationMinutes) : 15;
    const now = Date.now();
    const expiresAt = active ? new Date(now + durationMinutes * 60 * 1000).toISOString() : null;

    const updatePayload: Record<string, any> = {
      streamCode: active ? streamCode : "",
      streamCodeActive: active,
      durationMinutes: active ? durationMinutes : null,
      expiresAt,
      activatedAt: active ? new Date(now).toISOString() : null,
      updatedAt: new Date(now).toISOString(),
      updatedBy: requester.email || requester.uid,
    };

    await getAdminDb().collection("homeSettings").doc("attendance").set(updatePayload, { merge: true });

    return NextResponse.json({
      ok: true,
      active,
      code: updatePayload.streamCode,
      durationMinutes,
      expiresAt,
      message: active
        ? `Service Code "${streamCode}" is active for ${durationMinutes} minute${durationMinutes > 1 ? "s" : ""}.`
        : "Service Code requirement has been deactivated.",
    });
  } catch (err: any) {
    console.error("Failed to update attendance config:", err);
    return NextResponse.json({ error: err.message || "Failed to update config" }, { status: 500 });
  }
}
