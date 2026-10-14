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

    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const mode = body?.mode === "online" ? "online" : "in_person";
    const location = typeof body?.location === "string" ? body.location.trim() : "Jos (House of Bread)";
    const streamChannel = typeof body?.streamChannel === "string" ? body.streamChannel.trim() : "none";
    const serviceCode = typeof body?.serviceCode === "string" ? body.serviceCode.trim().toUpperCase() : "";
    const checkedInBy = typeof body?.checkedInBy === "string" ? body.checkedInBy.trim() : "";
    const type = "weekend_service";

    if (!fullName) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }

    const db = getAdminDb();

    // Verify stream code if worshipping online
    if (mode === "online") {
      try {
        const streamSettingSnap = await db.collection("homeSettings").doc("attendance").get();
        if (streamSettingSnap.exists) {
          const config = streamSettingSnap.data();
          if (config?.streamCodeActive && config?.streamCode) {
            const expectedCode = String(config.streamCode).trim().toUpperCase();
            if (!serviceCode) {
              return NextResponse.json(
                { error: "Please enter the Stream Check-In Code announced during the service." },
                { status: 400 }
              );
            }
            if (serviceCode !== expectedCode) {
              return NextResponse.json(
                { error: "Invalid stream check-in code. Please check the code shown on the stream." },
                { status: 400 }
              );
            }
          }
        }
      } catch (err) {
        console.warn("Could not check streamCode settings:", err);
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

    const record: Record<string, any> = {
      fullName,
      phone: phone || "Not Provided",
      mode,
      location: mode === "in_person" ? location : "Online Stream",
      streamChannel: mode === "online" ? streamChannel : "none",
      type,
      date: todayDate,
      timestamp: new Date(),
      isGuest: !userId,
    };

    if (serviceCode) {
      record.serviceCode = serviceCode;
    }

    if (userId && !checkedInBy) {
      record.userId = userId;
    }

    if (checkedInBy) {
      record.checkedInBy = checkedInBy;
    }

    const docRef = await db.collection("attendance").add(record);

    return NextResponse.json({
      ok: true,
      id: docRef.id,
      message: "Attendance confirmed successfully.",
    });
  } catch (error: any) {
    console.error("Attendance submission API error:", error);
    return NextResponse.json(
      { error: "Could not record attendance on server. Please try again." },
      { status: 500 }
    );
  }
}
