import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";
import type { AttendanceRecordItem, AtRiskMember } from "@/lib/types/portal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Baseline date for official multi-day church attendance tracking.
 * November 5th, 2026 marks the first official church gathering (Festival of Light).
 * All test entries prior to this baseline are excluded from failing/at-risk analytics.
 */
const ATTENDANCE_BASELINE_DATE = "2026-11-05";

function normalizePhone(phone?: string): string {
  if (!phone) return "";
  const digits = phone.replace(/[^0-9]/g, "");
  // Normalize Nigerian phone numbers (e.g. 080... -> 23480...)
  if (digits.startsWith("0") && digits.length === 11) {
    return "234" + digits.slice(1);
  }
  return digits;
}

function resolveCampus(location?: string, mode?: string): "Jos Headquarters" | "Abuja Campus" | "Online Community" | "Unknown" {
  if (mode === "online" || (location && location.toLowerCase().includes("online"))) {
    return "Online Community";
  }
  if (!location) return "Jos Headquarters";
  const locLower = location.toLowerCase();
  if (locLower.includes("abuja")) return "Abuja Campus";
  if (locLower.includes("jos") || locLower.includes("house of bread")) return "Jos Headquarters";
  return "Jos Headquarters";
}

export async function GET(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const campusFilter = (searchParams.get("campus") || "all").toLowerCase();
    const minMissed = parseInt(searchParams.get("minMissed") || "3", 10);

    const db = getAdminDb();

    // 1. Fetch recent attendance records (up to 1200 records across recent months)
    let attendanceSnap;
    try {
      attendanceSnap = await db
        .collection("attendance")
        .orderBy("date", "desc")
        .limit(1200)
        .get();
    } catch {
      // Fallback if index isn't built yet
      attendanceSnap = await db.collection("attendance").limit(1200).get();
    }

    // 2. Fetch existing visitors to cross-reference with assimilation pipeline
    const visitorsSnap = await db.collection("visitors").get();
    const visitorByPhone = new Map<string, any>();
    const visitorByName = new Map<string, any>();

    visitorsSnap.docs.forEach((doc) => {
      const vData = { id: doc.id, ...doc.data() } as any;
      const normPhone = normalizePhone(vData.phone);
      if (normPhone) visitorByPhone.set(normPhone, vData);
      if (vData.name) visitorByName.set(vData.name.trim().toLowerCase(), vData);
    });

    // 3. Extract unique service dates starting from the November 5, 2026 baseline
    // All dates prior to this baseline are excluded from failing/at-risk attendance calculation.
    const rawAttendanceDocs = attendanceSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as any))
      .filter((r) => (r.date || "") >= ATTENDANCE_BASELINE_DATE);

    const allDates = Array.from(
      new Set(rawAttendanceDocs.map((r) => r.date).filter(Boolean))
    ).sort((a: any, b: any) => (a < b ? 1 : -1));

    // Focus on recent service dates since the baseline for analysis
    const trackedDates = allDates.slice(0, 8);

    // 4. Group attendance by individual
    const peopleMap = new Map<
      string,
      {
        name: string;
        phone: string;
        email: string;
        records: AttendanceRecordItem[];
        attendedDatesSet: Set<string>;
        campusCounts: Record<string, number>;
        modeCounts: Record<string, number>;
      }
    >();

    for (const r of rawAttendanceDocs) {
      const name = (r.fullName || r.name || "").trim();
      const rawPhone = (r.phone || "").trim();
      const normPhone = normalizePhone(rawPhone);
      const email = (r.email || "").trim().toLowerCase();

      // Key primarily by normalized phone if valid, otherwise email, otherwise name
      const key = normPhone || email || name.toLowerCase();
      if (!key) continue;

      if (!peopleMap.has(key)) {
        peopleMap.set(key, {
          name: name || "Anonymous Attendee",
          phone: rawPhone,
          email,
          records: [],
          attendedDatesSet: new Set<string>(),
          campusCounts: {},
          modeCounts: {},
        });
      }

      const person = peopleMap.get(key)!;
      if (name && (!person.name || person.name === "Anonymous Attendee")) {
        person.name = name;
      }
      if (rawPhone && !person.phone) person.phone = rawPhone;
      if (email && !person.email) person.email = email;

      const dateStr = r.date || "";
      if (dateStr) {
        person.attendedDatesSet.add(dateStr);
      }

      const campus = resolveCampus(r.location, r.mode);
      person.campusCounts[campus] = (person.campusCounts[campus] || 0) + 1;

      const mode = r.mode === "online" ? "online" : "in_person";
      person.modeCounts[mode] = (person.modeCounts[mode] || 0) + 1;

      person.records.push({
        id: r.id,
        date: dateStr,
        mode,
        location: r.location || (mode === "online" ? "Online Stream" : "Jos (House of Bread)"),
        streamChannel: r.streamChannel || "none",
        serviceCode: r.serviceCode || "",
        timestamp: r.timestamp?.toDate ? r.timestamp.toDate().toISOString() : r.timestamp || "",
      });
    }

    // 5. Evaluate fading attendance & consecutive missed services
    const atRiskMembers: AtRiskMember[] = [];

    for (const [key, person] of peopleMap.entries()) {
      if (person.records.length === 0) continue;

      // Sort records newest first
      person.records.sort((a, b) => (a.date < b.date ? 1 : -1));
      const lastAttendedDate = person.records[0].date;

      // Determine consecutive missed services against trackedDates
      let consecutiveMissed = 0;
      for (const serviceDate of trackedDates) {
        if (person.attendedDatesSet.has(serviceDate)) {
          break; // Hit their last attended service
        }
        consecutiveMissed++;
      }

      // Flag if they have missed >= minMissed consecutive services
      // AND have previously attended (total attended >= 1)
      if (consecutiveMissed >= minMissed && person.attendedDatesSet.size >= 1) {
        // Resolve primary campus
        let primaryCampus: "Jos Headquarters" | "Abuja Campus" | "Online Community" | "Unknown" = "Jos Headquarters";
        let maxCampusCount = -1;
        for (const [camp, count] of Object.entries(person.campusCounts)) {
          if (count > maxCampusCount) {
            maxCampusCount = count;
            primaryCampus = camp as any;
          }
        }

        // Apply campus filter if selected
        if (campusFilter !== "all") {
          const cLower = primaryCampus.toLowerCase();
          if (campusFilter === "jos" && !cLower.includes("jos")) continue;
          if (campusFilter === "abuja" && !cLower.includes("abuja")) continue;
          if (campusFilter === "online" && !cLower.includes("online")) continue;
        }

        // Resolve primary mode
        const primaryMode = (person.modeCounts.online || 0) > (person.modeCounts.in_person || 0) ? "online" : "in_person";

        // Check if already in visitors assimilation pipeline
        const normPhone = normalizePhone(person.phone);
        const visitorMatch = (normPhone && visitorByPhone.get(normPhone)) || visitorByName.get(person.name.toLowerCase());

        const recentServiceDates = trackedDates.map((d) => ({
          date: d,
          attended: person.attendedDatesSet.has(d),
        }));

        atRiskMembers.push({
          id: visitorMatch ? visitorMatch.id : `atrisk-${key}`,
          name: person.name,
          phone: person.phone,
          email: person.email,
          totalAttended: person.attendedDatesSet.size,
          lastAttendedDate,
          consecutiveMissed,
          riskLevel: consecutiveMissed >= 3 ? "high" : "moderate",
          primaryCampus,
          primaryMode,
          attendanceHistory: person.records,
          recentServiceDates,
          inPipeline: Boolean(visitorMatch),
          visitorId: visitorMatch?.id,
          pipelineStatus: visitorMatch?.status,
          assignedTo: visitorMatch?.assignedTo || "Pastoral Team",
          notes: visitorMatch?.notes || "",
        });
      }
    }

    // Sort: highest missed first, then most total attended
    atRiskMembers.sort((a, b) => {
      if (b.consecutiveMissed !== a.consecutiveMissed) {
        return b.consecutiveMissed - a.consecutiveMissed;
      }
      return b.totalAttended - a.totalAttended;
    });

    return NextResponse.json({
      ok: true,
      trackedDates,
      totalTrackedDates: trackedDates.length,
      count: atRiskMembers.length,
      highRiskCount: atRiskMembers.filter((m) => m.riskLevel === "high").length,
      moderateRiskCount: atRiskMembers.filter((m) => m.riskLevel === "moderate").length,
      members: atRiskMembers,
    });
  } catch (err: any) {
    console.error("Error in GET /api/portal/pastoral/at-risk:", err);
    return NextResponse.json({ error: err.message || "Failed to analyze attendance" }, { status: 500 });
  }
}

/**
 * POST /api/portal/pastoral/at-risk
 * Quick-action handler to:
 * - move_to_followup: add or update member in the assimilation pipeline
 * - assign_pastor: update assigned pastoral care minister
 * - add_note: record pastoral prayer point / visit outcome
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, member, assignedTo, notes } = body;
    if (!member || !action) {
      return NextResponse.json({ error: "Action and member info required" }, { status: 400 });
    }

    const db = getAdminDb();

    if (action === "move_to_followup") {
      let visitorId = member.visitorId;
      const initialNotes = notes ||
        `Flagged for fading attendance: Missed ${member.consecutiveMissed} consecutive services. Last seen: ${member.lastAttendedDate} (${member.primaryCampus}). Moved to follow-up.`;

      if (visitorId) {
        // Update existing visitor
        await db.collection("visitors").doc(visitorId).set(
          {
            status: "followup",
            assignedTo: assignedTo || member.assignedTo || "Pastoral Team",
            notes: initialNotes,
            updatedAt: new Date().toISOString(),
            updatedBy: user.email || user.displayName,
          },
          { merge: true }
        );
      } else {
        // Create new visitor record in the pipeline
        const newDoc = await db.collection("visitors").add({
          name: member.name,
          phone: member.phone || "Not Provided",
          email: member.email || "",
          firstVisitDate: member.attendanceHistory?.[member.attendanceHistory.length - 1]?.date || member.lastAttendedDate || new Date().toISOString().split("T")[0],
          assignedTo: assignedTo || "Pastoral Team",
          notes: initialNotes,
          status: "followup",
          campus: member.primaryCampus,
          createdAt: new Date().toISOString(),
          loggedBy: user.email || user.displayName,
        });
        visitorId = newDoc.id;
      }

      // Audit log
      try {
        await db.collection("audit_logs").add({
          action: `Pastoral Care: Moved ${member.name} (missed ${member.consecutiveMissed} services) into Shepherding Follow-Up`,
          actor: user.email,
          category: "pastoral",
          timestamp: new Date().toISOString(),
        });
      } catch {}

      return NextResponse.json({ ok: true, visitorId, message: `${member.name} moved to In Shepherding Follow-Up ✓` });
    }

    if (action === "assign_pastor") {
      if (!assignedTo) {
        return NextResponse.json({ error: "Assigned pastor name is required" }, { status: 400 });
      }

      if (member.visitorId) {
        await db.collection("visitors").doc(member.visitorId).set(
          {
            assignedTo,
            updatedAt: new Date().toISOString(),
            updatedBy: user.email,
          },
          { merge: true }
        );
      } else {
        const newDoc = await db.collection("visitors").add({
          name: member.name,
          phone: member.phone || "Not Provided",
          email: member.email || "",
          firstVisitDate: member.lastAttendedDate || new Date().toISOString().split("T")[0],
          assignedTo,
          notes: `Assigned for pastoral follow-up. Last attended: ${member.lastAttendedDate}.`,
          status: "followup",
          campus: member.primaryCampus,
          createdAt: new Date().toISOString(),
          loggedBy: user.email,
        });
        return NextResponse.json({ ok: true, visitorId: newDoc.id, message: `Assigned to ${assignedTo} ✓` });
      }

      return NextResponse.json({ ok: true, message: `Assigned to ${assignedTo} ✓` });
    }

    if (action === "add_note") {
      if (!notes) {
        return NextResponse.json({ error: "Notes content required" }, { status: 400 });
      }

      const timestamp = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      const noteEntry = `[${timestamp} by ${user.displayName || user.email}]: ${notes}`;

      if (member.visitorId) {
        const docSnap = await db.collection("visitors").doc(member.visitorId).get();
        const currentNotes = docSnap.data()?.notes || "";
        const updatedNotes = currentNotes ? `${currentNotes}\n${noteEntry}` : noteEntry;

        await db.collection("visitors").doc(member.visitorId).set(
          {
            notes: updatedNotes,
            updatedAt: new Date().toISOString(),
            updatedBy: user.email,
          },
          { merge: true }
        );
      } else {
        const newDoc = await db.collection("visitors").add({
          name: member.name,
          phone: member.phone || "Not Provided",
          email: member.email || "",
          firstVisitDate: member.lastAttendedDate || new Date().toISOString().split("T")[0],
          assignedTo: member.assignedTo || "Pastoral Team",
          notes: noteEntry,
          status: "followup",
          campus: member.primaryCampus,
          createdAt: new Date().toISOString(),
          loggedBy: user.email,
        });
        return NextResponse.json({ ok: true, visitorId: newDoc.id, message: "Pastoral note recorded ✓" });
      }

      return NextResponse.json({ ok: true, message: "Pastoral note recorded ✓" });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err: any) {
    console.error("Error in POST /api/portal/pastoral/at-risk:", err);
    return NextResponse.json({ error: err.message || "Failed to execute pastoral action" }, { status: 500 });
  }
}
