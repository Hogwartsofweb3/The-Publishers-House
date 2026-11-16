import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";
import { UNIT_SCHEDULES_DEFAULT, UNIT_OVERSIGHT_DEFAULT, MULTI_UNIT_HEADS_DEFAULT } from "@/lib/portalAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SETTINGS_COLLECTION = "settings";
const SETTINGS_DOC = "church_units_metadata";

/**
 * GET /api/portal/units
 * Returns all custom unit metadata (meeting schedules, prep times, venues, oversight clusters, multi-unit heads)
 */
export async function GET() {
  try {
    const adminDb = getAdminDb();
    const docSnap = await adminDb.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC).get();

    if (!docSnap.exists) {
      return NextResponse.json({
        ok: true,
        schedules: UNIT_SCHEDULES_DEFAULT,
        oversight: UNIT_OVERSIGHT_DEFAULT,
        multiHeads: MULTI_UNIT_HEADS_DEFAULT,
        venues: {},
        descriptions: {},
        updatedAt: null,
      });
    }

    const data = docSnap.data() || {};
    return NextResponse.json({
      ok: true,
      schedules: { ...UNIT_SCHEDULES_DEFAULT, ...(data.schedules || {}) },
      oversight: { ...UNIT_OVERSIGHT_DEFAULT, ...(data.oversight || {}) },
      multiHeads: { ...MULTI_UNIT_HEADS_DEFAULT, ...(data.multiHeads || {}) },
      venues: data.venues || {},
      descriptions: data.descriptions || {},
      updatedAt: data.updatedAt || null,
    });
  } catch (err: any) {
    console.error("Error fetching units metadata:", err);
    return NextResponse.json({
      ok: true,
      schedules: UNIT_SCHEDULES_DEFAULT,
      oversight: UNIT_OVERSIGHT_DEFAULT,
      multiHeads: MULTI_UNIT_HEADS_DEFAULT,
      venues: {},
      descriptions: {},
      updatedAt: null,
    });
  }
}

/**
 * POST /api/portal/units
 * Saves or updates custom unit details (meeting schedules, venues, descriptions)
 * Stamped check: Writes directly to Firestore Admin DB so changes never get lost!
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { unitId, meetingTime, venue, description, schedules, oversight, multiHeads } = body;

    const adminDb = getAdminDb();
    const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC);
    const existingSnap = await docRef.get();
    const existingData = existingSnap.exists ? existingSnap.data() || {} : {};

    const now = new Date().toISOString();
    const updatedBy = user.email || user.displayName || user.uid;

    const updatedData: Record<string, any> = {
      ...existingData,
      updatedAt: now,
      updatedBy,
    };

    // Single unit update
    if (unitId) {
      if (typeof meetingTime === "string") {
        updatedData.schedules = {
          ...UNIT_SCHEDULES_DEFAULT,
          ...(existingData.schedules || {}),
          [unitId]: meetingTime.trim(),
        };
      }
      if (typeof venue === "string") {
        updatedData.venues = {
          ...(existingData.venues || {}),
          [unitId]: venue.trim(),
        };
      }
      if (typeof description === "string") {
        updatedData.descriptions = {
          ...(existingData.descriptions || {}),
          [unitId]: description.trim(),
        };
      }
    }

    // Bulk updates
    if (schedules && typeof schedules === "object") {
      updatedData.schedules = {
        ...UNIT_SCHEDULES_DEFAULT,
        ...(existingData.schedules || {}),
        ...schedules,
      };
    }
    if (oversight && typeof oversight === "object") {
      updatedData.oversight = {
        ...UNIT_OVERSIGHT_DEFAULT,
        ...(existingData.oversight || {}),
        ...oversight,
      };
    }
    if (multiHeads && typeof multiHeads === "object") {
      updatedData.multiHeads = {
        ...MULTI_UNIT_HEADS_DEFAULT,
        ...(existingData.multiHeads || {}),
        ...multiHeads,
      };
    }

    await docRef.set(updatedData, { merge: true });

    return NextResponse.json({
      ok: true,
      message: "Unit details updated and permanently stamped in Firestore.",
      unitId,
      updatedAt: now,
      schedules: updatedData.schedules,
    });
  } catch (err: any) {
    console.error("Error updating unit details:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
