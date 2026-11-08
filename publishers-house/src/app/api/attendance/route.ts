import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/sessionCookie";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Helper: resolve the caller's uid, email and admin status */
async function getRequester(req?: Request) {
  let uid = "";
  let email = "";
  let role = "";
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;
    if (session) {
      const decoded = await getAdminAuth().verifySessionCookie(session, false);
      uid = decoded.uid || "";
      email = (decoded.email || "").toLowerCase();
    }
  } catch {}
  if (!uid && req) {
    try {
      const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const idToken = authHeader.substring(7).trim();
        const decoded = await getAdminAuth().verifyIdToken(idToken);
        uid = decoded.uid || "";
        email = (decoded.email || "").toLowerCase();
      }
    } catch {}
  }
  if (uid) {
    try {
      const snap = await getAdminDb().collection("users").doc(uid).get();
      if (snap.exists) role = String(snap.data()?.role || "");
    } catch {}
  }
  const ADMIN_EMAILS = [
    "joshuaagunbiade@gmail.com",
    "thepublishershouse007@gmail.com",
    "odehngbes@gmail.com",
    "tmakind@gmail.com",
    "ayodeledare86@gmail.com",
    "onahboniface9@gmail.com",
  ];
  const ADMIN_ROLES = ["admin", "super_admin", "portal_manager"];
  const isAdmin = ADMIN_ROLES.includes(role) || ADMIN_EMAILS.includes(email);
  return { uid, email, role, isAdmin };
}

// In-memory resilient cache by date to survive daily Firestore quota exhaustion on Spark plan
const attendanceCacheByDate = new Map<string, { records: any[]; timestamp: number }>();

/**
 * GET /api/attendance?date=YYYY-MM-DD
 * Admin-only: returns all attendance records for a given date.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];

  try {
    const requester = await getRequester(req);
    if (!requester.uid || !requester.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();
    try {
      const snap = await db.collection("attendance").where("date", "==", date).get();
      let records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Strictly validate member status against official accounts in users collection
      try {
        const usersSnap = await db.collection("users").get();
        const validMemberUids = new Set<string>();
        const emailToUid = new Map<string, string>();
        const phoneToUid = new Map<string, string>();

        usersSnap.docs.forEach((u) => {
          validMemberUids.add(u.id);
          const uData = u.data();
          if (uData.email) {
            const em = String(uData.email).toLowerCase().trim();
            if (em) emailToUid.set(em, u.id);
          }
          if (uData.phone) {
            const clean = String(uData.phone).replace(/[^0-9]/g, "");
            if (clean && clean.length >= 7) {
              phoneToUid.set(clean, u.id);
              if (clean.startsWith("0") && clean.length === 11) {
                phoneToUid.set("234" + clean.slice(1), u.id);
              }
              if (clean.startsWith("234") && clean.length === 13) {
                phoneToUid.set("0" + clean.slice(3), u.id);
              }
            }
          }
        });

        records = records.map((r: any) => {
          // An attendee is ONLY a Member if their account actually exists in the Members Directory
          let memberUid: string | null = null;
          const cleanEmail = (r.email || "").toLowerCase().trim();
          const cleanPhone = (r.phone || "").replace(/[^0-9]/g, "");

          if (r.userId && validMemberUids.has(r.userId)) {
            memberUid = r.userId;
          } else if (cleanEmail && emailToUid.has(cleanEmail)) {
            memberUid = emailToUid.get(cleanEmail)!;
          } else if (cleanPhone && cleanPhone.length >= 7 && phoneToUid.has(cleanPhone)) {
            memberUid = phoneToUid.get(cleanPhone)!;
          }

          const isOfficialMember = Boolean(memberUid);

          return {
            ...r,
            userId: memberUid || undefined,
            isMember: isOfficialMember,
            isRegisteredMember: isOfficialMember,
            isGuest: !isOfficialMember || Boolean(r.checkedInBy) || Boolean(r.isFirstTimer),
          };
        });
      } catch (lookupErr) {
        console.warn("Could not cross-reference users for attendance:", lookupErr);
      }

      // Sort newest first (by timestamp)
      records.sort((a: any, b: any) => {
        const ta = a.timestamp?._seconds ?? a.timestamp?.seconds ?? 0;
        const tb = b.timestamp?._seconds ?? b.timestamp?.seconds ?? 0;
        return tb - ta;
      });
      attendanceCacheByDate.set(date, { records, timestamp: Date.now() });
      return NextResponse.json({ records, quotaBlocked: false });
    } catch (dbErr: any) {
      console.warn("Firestore attendance read error:", dbErr?.message);
      const isQuota = dbErr?.code === 8 || String(dbErr?.message || "").includes("RESOURCE_EXHAUSTED") || String(dbErr?.message || "").includes("Quota exceeded");
      const cached = attendanceCacheByDate.get(date);
      if (cached && cached.records.length > 0) {
        return NextResponse.json({ records: cached.records, quotaBlocked: isQuota });
      }
      return NextResponse.json({
        records: [],
        quotaBlocked: isQuota,
        error: isQuota
          ? "Daily database read quota (50,000 reads) reached on Firebase Spark free plan. Your attendance records are safely stored. Please upgrade project to Blaze (Pay-as-you-go) in Firebase Console to remove this limit."
          : "Failed to fetch records"
      }, { status: 200 });
    }
  } catch (err: any) {
    console.error("GET /api/attendance error:", err);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

/**
 * DELETE /api/attendance
 * Single: DELETE /api/attendance?id=<docId>
 * Mass:   DELETE /api/attendance with JSON { ids: string[] }
 * Admin-only: deletes attendance record(s).
 */
export async function DELETE(req: Request) {
  try {
    const requester = await getRequester(req);
    if (!requester.uid || !requester.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const singleId = url.searchParams.get("id");
    let idsToDelete: string[] = [];

    if (singleId) {
      idsToDelete = [singleId];
    } else {
      try {
        const body = await req.json();
        if (Array.isArray(body?.ids)) {
          idsToDelete = body.ids.filter(Boolean);
        }
      } catch {}
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: "Record ID(s) required" }, { status: 400 });
    }

    const db = getAdminDb();
    const batch = db.batch();
    for (const id of idsToDelete) {
      batch.delete(db.collection("attendance").doc(id));
    }
    await batch.commit();

    // Invalidate / update in-memory cache
    const idSet = new Set(idsToDelete);
    for (const [, entry] of attendanceCacheByDate.entries()) {
      entry.records = entry.records.filter((r) => !idSet.has(r.id));
    }

    // Audit log
    try {
      await db.collection("audit_logs").add({
        action: `Attendance records deleted: count=${idsToDelete.length} (ids: ${idsToDelete.slice(0, 5).join(", ")}${idsToDelete.length > 5 ? "..." : ""})`,
        actor: requester.email || requester.uid,
        category: "attendance",
        timestamp: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({ ok: true, deletedCount: idsToDelete.length, message: `${idsToDelete.length} record(s) deleted.` });
  } catch (err: any) {
    console.error("DELETE /api/attendance error:", err);
    return NextResponse.json({ error: "Failed to delete record(s)" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support either single attendee or { attendees: [...] } for group/family check-ins
    const attendeesList: Array<{
      fullName: string;
      phone?: string;
      email?: string;
      mode?: string;
      location?: string;
      streamChannel?: string;
      serviceCode?: string;
      checkedInBy?: string;
      isFirstTimer?: boolean;
      hearAboutUs?: string;
    }> = Array.isArray(body?.attendees) && body.attendees.length > 0
      ? body.attendees
      : [body];

    const validAttendees = attendeesList
      .map((a) => ({
        fullName: typeof a?.fullName === "string" ? a.fullName.trim() : "",
        phone: typeof a?.phone === "string" ? a.phone.trim() : "",
        email: typeof a?.email === "string" ? a.email.trim() : "",
        mode: a?.mode === "online" ? "online" : (body?.mode === "online" ? "online" : "in_person"),
        location: typeof a?.location === "string" ? a.location.trim() : (typeof body?.location === "string" ? body.location.trim() : "Jos (House of Bread)"),
        streamChannel: typeof a?.streamChannel === "string" ? a.streamChannel.trim() : (typeof body?.streamChannel === "string" ? body.streamChannel.trim() : "none"),
        serviceCode: typeof a?.serviceCode === "string" ? a.serviceCode.trim().toUpperCase() : (typeof body?.serviceCode === "string" ? body.serviceCode.trim().toUpperCase() : ""),
        checkedInBy: typeof a?.checkedInBy === "string" ? a.checkedInBy.trim() : (typeof body?.checkedInBy === "string" ? body.checkedInBy.trim() : ""),
        isFirstTimer: Boolean(a?.isFirstTimer ?? body?.isFirstTimer),
        hearAboutUs: typeof a?.hearAboutUs === "string" ? a.hearAboutUs.trim() : (typeof body?.hearAboutUs === "string" ? body.hearAboutUs.trim() : ""),
      }))
      .filter((a) => Boolean(a.fullName));

    if (validAttendees.length === 0) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }

    // Service code is ALWAYS required — no code = no attendance
    const submittedCode = validAttendees[0]?.serviceCode || "";
    if (!submittedCode) {
      return NextResponse.json(
        { error: "Please enter the Service Check-In Code announced during the service. Attendance cannot be confirmed without it." },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Fetch current attendance config from Firestore
    const streamSettingSnap = await db.collection("homeSettings").doc("attendance").get();
    const config = streamSettingSnap.exists ? streamSettingSnap.data() || {} : {};

    let isActive = Boolean(config?.streamCodeActive && config?.streamCode);
    if (isActive && config?.expiresAt) {
      if (Date.now() >= new Date(config.expiresAt).getTime()) {
        isActive = false;
      }
    }

    if (!isActive) {
      // No active code — attendance cannot be accepted
      return NextResponse.json(
        { error: "No active service code is set. An administrator must activate a service code from the portal before attendance can be signed." },
        { status: 403 }
      );
    }

    // Validate code for every attendee
    const expectedCode = String(config?.streamCode ?? "").trim().toUpperCase();
    for (const att of validAttendees) {
      const codeToTest = att.serviceCode || "";
      if (!codeToTest) {
        return NextResponse.json(
          { error: "Please enter the active Service Check-In Code announced during the service." },
          { status: 400 }
        );
      }
      if (codeToTest !== expectedCode) {
        return NextResponse.json(
          { error: "Invalid check-in code. Please verify the code announced during the service and try again." },
          { status: 400 }
        );
      }
    }

    // Check if requester has a logged-in session cookie
    let userId: string | null = null;
    try {
      const cookieStore = await cookies();
      const session = cookieStore.get(SESSION_COOKIE)?.value;
      if (session) {
        const decoded = await getAdminAuth().verifySessionCookie(session, false);
        userId = decoded.uid;
      }
    } catch {
      // Guest check-in
    }

    const todayDate = new Date().toISOString().split("T")[0];
    const createdIds: string[] = [];

    for (const att of validAttendees) {
      // Check if attendee email/phone matches an official account in users directory
      let matchedUserId: string | null = null;
      if (userId) {
        try {
          const userDoc = await db.collection("users").doc(userId).get();
          if (userDoc.exists) {
            matchedUserId = userId;
          }
        } catch {}
      }
      if (!matchedUserId && att.email) {
        try {
          const emailSnap = await db.collection("users").where("email", "==", att.email.toLowerCase().trim()).limit(1).get();
          if (!emailSnap.empty) {
            matchedUserId = emailSnap.docs[0].id;
          }
        } catch {}
      }
      if (!matchedUserId && att.phone) {
        const clean = att.phone.replace(/[^0-9]/g, "");
        if (clean.length >= 7) {
          const variants = [clean];
          if (clean.startsWith("0") && clean.length === 11) variants.push("234" + clean.slice(1));
          if (clean.startsWith("234") && clean.length === 13) variants.push("0" + clean.slice(3));
          for (const p of variants) {
            try {
              const pSnap = await db.collection("users").where("phone", "==", p).limit(1).get();
              if (!pSnap.empty) {
                matchedUserId = pSnap.docs[0].id;
                break;
              }
            } catch {}
          }
        }
      }

      const isRecognizedMember = Boolean(matchedUserId);

      const record: Record<string, any> = {
        fullName: att.fullName,
        phone: att.phone || "Not Provided",
        email: att.email || "",
        mode: att.mode,
        location: att.mode === "in_person" ? att.location : "Online Stream",
        streamChannel: att.mode === "online" ? att.streamChannel : "none",
        serviceCode: att.serviceCode,
        type: "weekend_service",
        date: todayDate,
        timestamp: new Date(),
        isGuest: !isRecognizedMember || Boolean(att.checkedInBy) || Boolean(att.isFirstTimer),
        isRegisteredMember: isRecognizedMember,
      };

      if (att.isFirstTimer) {
        record.isFirstTimer = true;
        if (att.email) record.email = att.email;
        if (att.hearAboutUs) record.hearAboutUs = att.hearAboutUs;

        // Persist into first_timers collection for pastoral directory
        await db.collection("first_timers").add({
          fullName: att.fullName,
          phone: att.phone || "Not Provided",
          email: att.email || "",
          mode: att.mode,
          location: record.location,
          hearAboutUs: att.hearAboutUs || "Not specified",
          date: todayDate,
          timestamp: new Date(),
          status: "new",
        }).catch(() => {});
      }

      if (matchedUserId && !att.checkedInBy) {
        record.userId = matchedUserId;
      }

      if (att.checkedInBy) {
        record.checkedInBy = att.checkedInBy;
      }

      const docRef = await db.collection("attendance").add(record);
      createdIds.push(docRef.id);
    }

    return NextResponse.json({
      ok: true,
      ids: createdIds,
      count: createdIds.length,
      message: `Attendance confirmed successfully for ${createdIds.length} person${createdIds.length > 1 ? "s" : ""}.`,
    });
  } catch (error: any) {
    console.error("Attendance submission API error:", error);
    return NextResponse.json(
      { error: "Could not record attendance on server. Please try again." },
      { status: 500 }
    );
  }
}
