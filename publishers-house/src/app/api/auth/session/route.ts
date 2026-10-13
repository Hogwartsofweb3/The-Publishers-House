import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES = ["admin", "unit_head", "member"];

export async function POST(req: Request) {
  if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
    return NextResponse.json(
      { error: "Sign-in is not configured on the server yet. Add the Firebase Admin credentials." },
      { status: 500 }
    );
  }

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
    const host = req.headers.get("host") || "";
    const isApexOrSub = host.includes("thepublishershouse.org");
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: isApexOrSub ? ".thepublishershouse.org" : undefined,
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });
    return res;
  } catch (error: any) {
    console.error("Failed to create session:", error);
    const detail = error?.message ? `: ${error.message}` : "";
    return NextResponse.json({ error: `Could not start a secure session${detail}` }, { status: 401 });
  }
}
