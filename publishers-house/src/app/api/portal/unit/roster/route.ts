import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { normalizeUnitId } from "@/lib/portalAuth";
import { sendPushNotification } from "@/lib/pushUtils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const unitId = normalizeUnitId(searchParams.get("unitId") || "");

    if (!all && !unitId) {
      return NextResponse.json({ ok: false, error: "unitId required" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const ref = adminDb.collection("unit_rosters");
    const snap = all ? await ref.get() : await ref.where("unitId", "==", unitId).get();
    const roster = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    roster.sort((a: any, b: any) => (a.serviceDate > b.serviceDate ? -1 : 1));
    return NextResponse.json({ ok: true, roster });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      unitId, serviceName, serviceDate, memberName,
      memberUid = "", dutyRole, notes = "",
    } = body;

    if (!unitId || !serviceName || !serviceDate || !memberName || !dutyRole) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const docData = {
      unitId: normalizeUnitId(unitId),
      serviceName,
      serviceDate,
      memberName,
      memberUid,
      dutyRole,
      notes: notes || "",
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    const ref = await adminDb.collection("unit_rosters").add(docData);

    // Fire push notification directly — no internal HTTP fetch (doesn't work in Vercel serverless)
    sendPushNotification({
      targetUid: memberUid || undefined,
      targetEmail: body.memberEmail || undefined,
      title: "Duty Assignment 📋",
      message: `You've been scheduled for ${dutyRole} duty on ${serviceDate} (${serviceName}).`,
      link: "/portal/unit/roster",
      tag: "duty-assigned",
    }).catch(() => {});

    return NextResponse.json({ ok: true, id: ref.id, assignment: { id: ref.id, ...docData } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

    const adminDb = getAdminDb();
    await adminDb.collection("unit_rosters").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
