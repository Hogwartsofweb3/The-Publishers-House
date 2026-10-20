import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES = ["super_admin", "admin", "portal_manager", "unit_head", "member"];

export async function POST(req: Request) {
  const hasB64 = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  const hasIndividual = Boolean(process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  if (!hasB64 && !hasIndividual) {
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
    const userEmail = (decoded.email || "").toLowerCase();
    const isJoshua = userEmail === "joshuaagunbiade@gmail.com";
    const isPortalManager = userEmail === "thepublishershouse007@gmail.com";

    let snap = await getAdminDb().collection("users").doc(decoded.uid).get();
    let userData = snap.exists ? snap.data() : null;

    // Fallback: If not found by UID, search by email to link pre-created member records
    if (!userData && userEmail) {
      const emailQuery = await getAdminDb()
        .collection("users")
        .where("email", "==", userEmail)
        .limit(1)
        .get();
      if (!emailQuery.empty) {
        userData = emailQuery.docs[0].data();
        await getAdminDb().collection("users").doc(decoded.uid).set(
          { ...userData, uid: decoded.uid },
          { merge: true }
        );
      }
    }

    let role = userData?.role;

    if (!userData) {
      if (isJoshua || isPortalManager) {
        // Auto-provision profile for seamless Google Sign-In & login
        const now = new Date().toISOString();
        const roleToSet = isJoshua ? "super_admin" : "portal_manager";
        const autoData = {
          uid: decoded.uid,
          email: decoded.email || userEmail,
          displayName: isJoshua
            ? "Rev. Joshua Agunbiade"
            : (decoded.name || "Project Manager"),
          role: roleToSet,
          activityTier: "leader",
          campus: "jos",
          createdAt: now,
          lastLogin: now,
          photoURL: decoded.picture || null,
        };
        await getAdminDb().collection("users").doc(decoded.uid).set(autoData, { merge: true });
        role = roleToSet;
      } else {
        return NextResponse.json({ error: "No portal profile" }, { status: 403 });
      }
    } else {
      // Sync canonical roles for leadership
      if (isJoshua && role !== "super_admin") {
        await getAdminDb().collection("users").doc(decoded.uid).set({ role: "super_admin" }, { merge: true });
        role = "super_admin";
      } else if (isPortalManager && role !== "portal_manager") {
        await getAdminDb().collection("users").doc(decoded.uid).set({ role: "portal_manager" }, { merge: true });
        role = "portal_manager";
      }
    }

    if (typeof role !== "string" || !ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
    const res = NextResponse.json({
      ok: true,
      role,
      email: userEmail,
      assignedUnitId: userData?.assignedUnitId || null,
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
