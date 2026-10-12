import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES = ["admin", "unit_head", "member"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idToken = body?.idToken;
    if (typeof idToken !== "string" || !idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const snap = await getAdminDb().collection("users").doc(decoded.uid).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "No portal profile" }, { status: 403 });
    }

    const role = snap.data()?.role;
    if (typeof role !== "string" || !ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
    const res = NextResponse.json({
      ok: true,
      role,
      assignedUnitId: snap.data()?.assignedUnitId || null,
    });
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });
    return res;
  } catch (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json({ error: "Could not start a secure session." }, { status: 401 });
  }
}
