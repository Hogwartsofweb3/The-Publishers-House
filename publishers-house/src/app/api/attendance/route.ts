import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/sessionCookie";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const db = getAdminDb();

    // Verify service code for all attendees (both in-person and online) when active & not expired
    try {
      const streamSettingSnap = await db.collection("homeSettings").doc("attendance").get();
      if (streamSettingSnap.exists) {
        const config = streamSettingSnap.data();
        let isActive = Boolean(config?.streamCodeActive && config?.streamCode);
        if (isActive && config?.expiresAt) {
          if (Date.now() >= new Date(config.expiresAt).getTime()) {
            isActive = false;
          }
        }

        if (isActive) {
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
                { error: "Invalid check-in code. Please verify the code announced during the service." },
                { status: 400 }
              );
            }
          }
        }
      }
    } catch (err) {
      console.warn("Could not check streamCode settings:", err);
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
      const record: Record<string, any> = {
        fullName: att.fullName,
        phone: att.phone || "Not Provided",
        mode: att.mode,
        location: att.mode === "in_person" ? att.location : "Online Stream",
        streamChannel: att.mode === "online" ? att.streamChannel : "none",
        type: "weekend_service",
        date: todayDate,
        timestamp: new Date(),
        isGuest: !userId || Boolean(att.checkedInBy) || Boolean(att.isFirstTimer),
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

      if (att.serviceCode) {
        record.serviceCode = att.serviceCode;
      }

      if (userId && !att.checkedInBy) {
        record.userId = userId;
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
