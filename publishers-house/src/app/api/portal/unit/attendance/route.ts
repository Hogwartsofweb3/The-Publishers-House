import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { normalizeUnitId } from "@/lib/portalAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = normalizeUnitId(searchParams.get("unitId") || "");
    const date = searchParams.get("date");

    if (!unitId) {
      return NextResponse.json({ ok: false, error: "unitId is required" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    let query = adminDb.collection("unit_attendance").where("unitId", "==", unitId);
    if (date) {
      query = query.where("serviceDate", "==", date);
    }

    const snap = await query.get();
    const records = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort descending by serviceDate
    records.sort((a: any, b: any) => (a.serviceDate > b.serviceDate ? -1 : 1));

    return NextResponse.json({ ok: true, records });
  } catch (err: any) {
    console.error("Error fetching unit attendance:", err);
    return NextResponse.json({ ok: false, error: err?.message || "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      unitId,
      unitName,
      serviceDate,
      serviceName,
      headcount,
      totalMembers,
      presentMembers,
      rosteredPresent = [],
      rosteredAbsent = [],
      presentNotOnDuty = [],
      notes = "",
      recordedBy = "Unit Leadership",
    } = body;

    if (!unitId || !serviceDate) {
      return NextResponse.json(
        { ok: false, error: "unitId and serviceDate are required" },
        { status: 400 }
      );
    }

    const normUnitId = normalizeUnitId(unitId);
    const adminDb = getAdminDb();

    // Payload sanitization — NEVER pass undefined to Firestore
    const cleanDoc = {
      unitId: normUnitId,
      unitName: unitName || normUnitId,
      serviceDate,
      serviceName: serviceName || "Sunday Service",
      presentCount: Number(headcount) || (Array.isArray(presentMembers) ? presentMembers.length : 0),
      totalMembers: Number(totalMembers) || 0,
      presentMembers: Array.isArray(presentMembers) ? presentMembers : [],
      rosteredPresent: Array.isArray(rosteredPresent) ? rosteredPresent : [],
      rosteredAbsent: Array.isArray(rosteredAbsent) ? rosteredAbsent : [],
      presentNotOnDuty: Array.isArray(presentNotOnDuty) ? presentNotOnDuty : [],
      notes: typeof notes === "string" ? notes.trim() : "",
      recordedBy: recordedBy || "Unit Leadership",
      recordedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("unit_attendance").add(cleanDoc);

    return NextResponse.json({
      ok: true,
      id: docRef.id,
      record: { id: docRef.id, ...cleanDoc },
    });
  } catch (err: any) {
    console.error("Error saving unit attendance via Admin SDK:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to record unit attendance" },
      { status: 500 }
    );
  }
}
