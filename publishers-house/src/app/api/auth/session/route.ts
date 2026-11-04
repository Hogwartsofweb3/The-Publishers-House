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
    const userEmail = (decoded.email || "").trim().toLowerCase();
    const isJoshua = userEmail === "joshuaagunbiade@gmail.com";
    const isPortalManager = userEmail === "thepublishershouse007@gmail.com";

    let userData: any = null;
    let userDocId: string | null = null;
    try {
      const snap = await getAdminDb().collection("users").doc(decoded.uid).get();
      if (snap.exists) {
        userData = snap.data();
        userDocId = snap.id;
      }

      // Fallback: If not found by UID, search by email to link pre-created member records
      if (!userData && userEmail) {
        let emailQuery = await getAdminDb()
          .collection("users")
          .where("email", "==", userEmail)
          .limit(1)
          .get();

        if (emailQuery.empty && decoded.email && decoded.email !== userEmail) {
          emailQuery = await getAdminDb()
            .collection("users")
            .where("email", "==", decoded.email)
            .limit(1)
            .get();
        }

        if (!emailQuery.empty) {
          const docSnap = emailQuery.docs[0];
          userData = docSnap.data();
          userDocId = docSnap.id;
        } else {
          // Fallback scan in case an admin stored the email with different casing/whitespace
          const allUsersSnap = await getAdminDb().collection("users").get();
          for (const d of allUsersSnap.docs) {
            const data = d.data();
            if ((data?.email || "").trim().toLowerCase() === userEmail) {
              userData = data;
              userDocId = d.id;
              break;
            }
          }
        }

        // If found by email, link Firebase Auth UID and mark hasAccount = true
        if (userData && userDocId) {
          const linkPayload = {
            uid: decoded.uid,
            email: userEmail,
            hasAccount: true,
            lastLogin: new Date().toISOString(),
            photoURL: decoded.picture || userData.photoURL || null,
          };
          await getAdminDb().collection("users").doc(userDocId).set(linkPayload, { merge: true }).catch(() => {});

          // If doc ID was not decoded.uid (e.g. member-173...), mirror to decoded.uid for fast subsequent lookups
          if (userDocId !== decoded.uid) {
            await getAdminDb().collection("users").doc(decoded.uid).set(
              {
                ...userData,
                ...linkPayload,
              },
              { merge: true }
            ).catch(() => {});
          }
        }
      }
    } catch (dbErr) {
      console.warn("Firestore lookup error during session creation:", dbErr);
    }

    // STRICT ACCESS CONTROL:
    // If the account was not registered in Firestore by an admin, and is not a seeded super admin,
    // REJECT ACCESS, delete the unauthorized Firebase Auth record, and do NOT create a session.
    if (!userData && !isJoshua && !isPortalManager) {
      try {
        await auth.deleteUser(decoded.uid);
      } catch (delErr) {
        console.warn("Could not delete unauthorized Firebase Auth user:", delErr);
      }

      return NextResponse.json(
        {
          error: `Access Denied: The email "${userEmail}" has not been registered by a church administrator. Member portal access is by invitation only. Please contact the church office to set up your account.`,
          code: "NOT_REGISTERED",
        },
        { status: 403 }
      );
    }

    let role = userData?.role;

    if (!userData) {
      if (isJoshua || isPortalManager) {
        role = isJoshua ? "super_admin" : "portal_manager";
        try {
          const now = new Date().toISOString();
          const autoData = {
            uid: decoded.uid,
            email: decoded.email || userEmail,
            displayName: isJoshua
              ? "Rev. Joshua Agunbiade"
              : (decoded.name || "Project Manager"),
            role,
            activityTier: "leader",
            campus: "jos",
            createdAt: now,
            lastLogin: now,
            photoURL: decoded.picture || null,
          };
          await getAdminDb().collection("users").doc(decoded.uid).set(autoData, { merge: true }).catch(() => {});
        } catch {}
      }
    } else {
      // Sync canonical roles for leadership
      if (isJoshua && role !== "super_admin") {
        role = "super_admin";
        getAdminDb().collection("users").doc(decoded.uid).set({ role: "super_admin" }, { merge: true }).catch(() => {});
      } else if (isPortalManager && role !== "portal_manager") {
        role = "portal_manager";
        getAdminDb().collection("users").doc(decoded.uid).set({ role: "portal_manager" }, { merge: true }).catch(() => {});
      }
    }

    if (typeof role !== "string" || !ROLES.includes(role)) {
      role = isJoshua ? "super_admin" : (isPortalManager ? "portal_manager" : "member");
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
