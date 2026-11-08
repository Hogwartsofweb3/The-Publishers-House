import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Baseline date for official multi-day church attendance tracking.
 * November 5th, 2026 marks the first official church gathering (Festival of Light).
 * All test entries prior to this baseline are excluded from failing/at-risk analytics.
 */
export const ATTENDANCE_BASELINE_DATE = "2026-11-05";

function normalizePhone(phone?: string): string {
  if (!phone) return "";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    return "234" + digits.slice(1);
  }
  return digits;
}

function resolveCampus(location?: string, mode?: string): string {
  if (mode === "online" || (location && location.toLowerCase().includes("online"))) {
    return "Online Community";
  }
  if (!location) return "Jos Headquarters";
  const locLower = location.toLowerCase();
  if (locLower.includes("abuja")) return "Abuja Campus";
  if (locLower.includes("jos") || locLower.includes("house of bread")) return "Jos Headquarters";
  return "Jos Headquarters";
}

/**
 * GET /api/portal/pastoral/digest
 * Returns the latest compiled weekly pastoral digests or compiles a fresh live digest.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const historyOnly = searchParams.get("history") === "true";
    const db = getAdminDb();

    if (historyOnly) {
      const snap = await db
        .collection("pastoral_digests")
        .orderBy("generatedAt", "desc")
        .limit(10)
        .get();

      const digests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return NextResponse.json({ ok: true, digests });
    }

    // Compile fresh live digest
    const digestData = await compileWeeklyDigest(user.email || user.displayName || "Pastoral Portal");
    return NextResponse.json({ ok: true, digest: digestData });
  } catch (err: any) {
    console.error("Error in GET /api/portal/pastoral/digest:", err);
    return NextResponse.json({ error: err.message || "Failed to generate digest" }, { status: 500 });
  }
}

/**
 * POST /api/portal/pastoral/digest
 * Explicitly triggers and persists a weekly pastoral digest record.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();
    const digestData = await compileWeeklyDigest(user.email || user.displayName || "Pastoral Portal");

    // Save to Firestore
    const docRef = await db.collection("pastoral_digests").add({
      ...digestData,
      savedAt: new Date().toISOString(),
      savedBy: user.email || user.displayName,
    });

    // Add to audit logs
    try {
      await db.collection("audit_logs").add({
        action: `Pastoral Care: Generated weekly digest #${docRef.id} (${digestData.highRiskCount} high-risk members flagged)`,
        actor: user.email,
        category: "pastoral",
        timestamp: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({
      ok: true,
      id: docRef.id,
      digest: { id: docRef.id, ...digestData },
      message: `Weekly pastoral digest generated with ${digestData.highRiskCount} high-risk members flagged ✓`,
    });
  } catch (err: any) {
    console.error("Error in POST /api/portal/pastoral/digest:", err);
    return NextResponse.json({ error: err.message || "Failed to compile digest" }, { status: 500 });
  }
}

export async function compileWeeklyDigest(triggeredBy: string) {
  const db = getAdminDb();

  let attendanceSnap;
  try {
    attendanceSnap = await db
      .collection("attendance")
      .orderBy("date", "desc")
      .limit(1500)
      .get();
  } catch {
    attendanceSnap = await db.collection("attendance").limit(1500).get();
  }

  // Filter attendance records to those on or after the baseline date (November 5, 2026)
  const rawAttendanceDocs = attendanceSnap.docs
    .map((d) => ({ id: d.id, ...d.data() } as any))
    .filter((r) => (r.date || "") >= ATTENDANCE_BASELINE_DATE);

  const allDates = Array.from(
    new Set(rawAttendanceDocs.map((r) => r.date).filter(Boolean))
  ).sort((a: any, b: any) => (a < b ? 1 : -1));

  const trackedDates = allDates.slice(0, 8);
  const peopleMap = new Map<string, any>();

  for (const r of rawAttendanceDocs) {
    const name = (r.fullName || r.name || "").trim();
    const rawPhone = (r.phone || "").trim();
    const normPhone = normalizePhone(rawPhone);
    const email = (r.email || "").trim().toLowerCase();
    const key = normPhone || email || name.toLowerCase();
    if (!key) continue;

    if (!peopleMap.has(key)) {
      peopleMap.set(key, {
        name: name || "Anonymous Attendee",
        phone: rawPhone,
        email,
        attendedDatesSet: new Set<string>(),
        lastAttendedDate: "",
        campus: resolveCampus(r.location, r.mode),
        mode: r.mode === "online" ? "online" : "in_person",
      });
    }

    const p = peopleMap.get(key);
    if (r.date) {
      p.attendedDatesSet.add(r.date);
      if (!p.lastAttendedDate || r.date > p.lastAttendedDate) {
        p.lastAttendedDate = r.date;
      }
    }
  }

  const highRiskMembers: any[] = [];
  const moderateRiskMembers: any[] = [];
  const campusBreakdown = {
    jos: { total: 0, highRisk: 0 },
    abuja: { total: 0, highRisk: 0 },
    online: { total: 0, highRisk: 0 },
  };

  for (const [, p] of peopleMap.entries()) {
    if (p.attendedDatesSet.size === 0) continue;

    const cLower = p.campus.toLowerCase();
    const campusKey = cLower.includes("abuja") ? "abuja" : cLower.includes("online") ? "online" : "jos";
    campusBreakdown[campusKey].total++;

    let consecutiveMissed = 0;
    for (const d of trackedDates) {
      if (p.attendedDatesSet.has(d)) break;
      consecutiveMissed++;
    }

    if (consecutiveMissed >= 3) {
      highRiskMembers.push({
        name: p.name,
        phone: p.phone,
        email: p.email,
        campus: p.campus,
        totalAttended: p.attendedDatesSet.size,
        lastAttendedDate: p.lastAttendedDate,
        consecutiveMissed,
      });
      campusBreakdown[campusKey].highRisk++;
    } else if (consecutiveMissed === 2) {
      moderateRiskMembers.push({
        name: p.name,
        phone: p.phone,
        email: p.email,
        campus: p.campus,
        totalAttended: p.attendedDatesSet.size,
        lastAttendedDate: p.lastAttendedDate,
        consecutiveMissed,
      });
    }
  }

  // Sort descending by consecutive missed
  highRiskMembers.sort((a, b) => b.consecutiveMissed - a.consecutiveMissed);
  moderateRiskMembers.sort((a, b) => b.consecutiveMissed - a.consecutiveMissed);

  return {
    generatedAt: new Date().toISOString(),
    period: `${trackedDates[trackedDates.length - 1] || "N/A"} to ${trackedDates[0] || "N/A"}`,
    trackedServicesCount: trackedDates.length,
    trackedDates,
    totalTrackedAttendees: peopleMap.size,
    highRiskCount: highRiskMembers.length,
    moderateRiskCount: moderateRiskMembers.length,
    campusBreakdown,
    highRiskMembers: highRiskMembers.slice(0, 50),
    moderateRiskMembers: moderateRiskMembers.slice(0, 50),
    triggeredBy,
  };
}
