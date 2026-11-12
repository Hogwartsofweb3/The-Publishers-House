import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { normalizeUnitId } from "@/lib/portalAuth";
import { sendPushNotification } from "@/lib/pushUtils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = normalizeUnitId(searchParams.get("unitId") || "");
    if (!unitId) return NextResponse.json({ ok: false, error: "unitId required" }, { status: 400 });

    const adminDb = getAdminDb();
    const snap = await adminDb.collection("unit_swaps").where("unitId", "==", unitId).get();
    const swaps = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    swaps.sort((a: any, b: any) => (a.createdAt > b.createdAt ? -1 : 1));
    return NextResponse.json({ ok: true, swaps });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      unitId, requesterName = "Unit Member", requesterUid = "",
      serviceDate, dutyRole, proposedSwapMember, reason,
    } = body;

    if (!unitId || !serviceDate || !dutyRole || !proposedSwapMember || !reason) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const docData = {
      unitId: normalizeUnitId(unitId),
      requesterName,
      requesterUid,
      serviceDate,
      dutyRole,
      proposedSwapMember,
      reason,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const ref = await adminDb.collection("unit_swaps").add(docData);
    return NextResponse.json({ ok: true, id: ref.id, swap: { id: ref.id, ...docData } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { swapId, status } = body;
    if (!swapId || !status) return NextResponse.json({ ok: false, error: "swapId and status required" }, { status: 400 });

    const adminDb = getAdminDb();
    const swapDoc = await adminDb.collection("unit_swaps").doc(swapId).get();
    await adminDb.collection("unit_swaps").doc(swapId).update({ status, updatedAt: new Date().toISOString() });

    // Notify requester when swap is approved or rejected
    if (swapDoc.exists && (status === "approved" || status === "rejected")) {
      const swap = swapDoc.data();
      if (swap?.requesterUid) {
        sendPushNotification({
          targetUid: swap.requesterUid,
          title: status === "approved" ? "Swap Request Approved ✅" : "Swap Request Declined",
          message: status === "approved"
            ? `Your duty swap request for ${swap.serviceDate} has been approved.`
            : `Your duty swap request for ${swap.serviceDate} was not approved.`,
          link: "/portal/unit/swaps",
          tag: "swap-status",
        }).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
