import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface AttendanceDetail {
  attended: boolean;
  mode?: "in_person" | "online" | string;
  location?: string;
  time?: string;
  codeUsed?: string;
}

export interface ComparedAttendee {
  key: string;
  name: string;
  phone: string;
  email: string;
  isMember: boolean;
  memberUserId?: string;
  memberRole?: string;
  memberUnit?: string;
  statusTag: "Member" | "Walk-in";
  campus: string;
  date1Detail: AttendanceDetail;
  date2Detail: AttendanceDetail;
  date3Detail: AttendanceDetail;
  totalAttendedOutOf3: number;
  consistencyRate: number;
  isCandidateForMembership: boolean;
  recommendationNote: string;
}

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
    return "Online Stream";
  }
  if (!location) return "Jos (House of Bread)";
  const locLower = location.toLowerCase();
  if (locLower.includes("abuja")) return "Abuja Campus";
  if (locLower.includes("jos") || locLower.includes("house of bread")) return "Jos (House of Bread)";
  return "Jos (House of Bread)";
}

export async function GET(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paramDate1 = searchParams.get("date1");
    const paramDate2 = searchParams.get("date2");
    const paramDate3 = searchParams.get("date3");
    const campusFilter = (searchParams.get("campus") || "all").toLowerCase();
    const statusFilter = searchParams.get("filter") || "all"; // all | candidates | walk_ins | members
    const searchQuery = (searchParams.get("q") || "").trim().toLowerCase();

    const db = getAdminDb();

    // 1. Fetch official registered members from 'users' collection
    const usersSnap = await db.collection("users").get();
    const memberEmails = new Map<string, any>();
    const memberPhones = new Map<string, any>();
    const memberNames = new Map<string, any>();

    usersSnap.docs.forEach((doc) => {
      const u = { id: doc.id, ...doc.data() } as any;
      const em = (u.email || "").trim().toLowerCase();
      if (em) memberEmails.set(em, u);

      const normPh = normalizePhone(u.phone);
      if (normPh && normPh.length >= 7) memberPhones.set(normPh, u);

      const nm = (u.displayName || u.fullName || u.name || "").trim().toLowerCase();
      if (nm) memberNames.set(nm, u);
    });

    // 2. Discover available service dates
    let attendanceSnap;
    try {
      attendanceSnap = await db
        .collection("attendance")
        .orderBy("date", "desc")
        .limit(2000)
        .get();
    } catch {
      attendanceSnap = await db.collection("attendance").limit(2000).get();
    }

    const rawDocs = attendanceSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
    const allUniqueDates = Array.from(
      new Set(rawDocs.map((r) => r.date).filter(Boolean))
    ).sort((a: any, b: any) => (a < b ? 1 : -1));

    // Determine the three comparison dates
    // Default to the 3 most recent available dates
    const d1 = paramDate1 || allUniqueDates[0] || new Date().toISOString().split("T")[0];
    const d2 = paramDate2 || allUniqueDates[1] || (allUniqueDates[0] ? allUniqueDates[0] : d1);
    const d3 = paramDate3 || allUniqueDates[2] || (allUniqueDates[1] ? allUniqueDates[1] : d2);
    const selectedDates = [d1, d2, d3];

    // Filter docs to only the selected 3 dates
    const filteredDocs = rawDocs.filter((r) => r.date && selectedDates.includes(r.date));

    // 3. Group attendance records by attendee
    const attendeesMap = new Map<
      string,
      {
        name: string;
        phone: string;
        email: string;
        campus: string;
        dateMap: Record<string, { mode?: string; location?: string; time?: string; codeUsed?: string }>;
      }
    >();

    for (const r of filteredDocs) {
      const name = (r.fullName || r.name || "").trim();
      const rawPhone = (r.phone || "").trim();
      const normPhone = normalizePhone(rawPhone);
      const email = (r.email || "").trim().toLowerCase();

      // Key by normalized phone if valid, otherwise email, otherwise normalized name
      const key = (normPhone && normPhone.length >= 7 ? normPhone : "") || email || name.toLowerCase();
      if (!key) continue;

      if (!attendeesMap.has(key)) {
        attendeesMap.set(key, {
          name: name || "Anonymous Attendee",
          phone: rawPhone,
          email,
          campus: resolveCampus(r.location, r.mode),
          dateMap: {},
        });
      }

      const entry = attendeesMap.get(key)!;
      if (name && (!entry.name || entry.name === "Anonymous Attendee")) entry.name = name;
      if (rawPhone && !entry.phone) entry.phone = rawPhone;
      if (email && !entry.email) entry.email = email;

      const dateStr = r.date;
      if (dateStr) {
        let timeStr = "";
        if (r.timestamp) {
          if (typeof r.timestamp.toDate === "function") {
            timeStr = r.timestamp.toDate().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
          } else if (typeof r.timestamp === "string") {
            try {
              timeStr = new Date(r.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
            } catch {}
          }
        }
        entry.dateMap[dateStr] = {
          mode: r.mode === "online" ? "online" : "in_person",
          location: r.location || (r.mode === "online" ? "Online Stream" : "Jos (House of Bread)"),
          time: timeStr || r.time || "",
          codeUsed: r.serviceCode || "",
        };
      }
    }

    // 4. Transform into ComparedAttendee list with membership resolution
    const attendees: ComparedAttendee[] = [];

    for (const [key, p] of attendeesMap.entries()) {
      // Check if user is in official members directory
      const normP = normalizePhone(p.phone);
      const memberMatch =
        (p.email && memberEmails.get(p.email)) ||
        (normP && normP.length >= 7 && memberPhones.get(normP)) ||
        (p.name && memberNames.get(p.name.toLowerCase()));

      const isMember = Boolean(memberMatch);
      const statusTag: "Member" | "Walk-in" = isMember ? "Member" : "Walk-in";

      // Details for the 3 dates
      const date1Record = p.dateMap[d1];
      const date2Record = p.dateMap[d2];
      const date3Record = p.dateMap[d3];

      const d1Detail: AttendanceDetail = {
        attended: Boolean(date1Record),
        mode: date1Record?.mode,
        location: date1Record?.location,
        time: date1Record?.time,
        codeUsed: date1Record?.codeUsed,
      };

      const d2Detail: AttendanceDetail = {
        attended: Boolean(date2Record),
        mode: date2Record?.mode,
        location: date2Record?.location,
        time: date2Record?.time,
        codeUsed: date2Record?.codeUsed,
      };

      const d3Detail: AttendanceDetail = {
        attended: Boolean(date3Record),
        mode: date3Record?.mode,
        location: date3Record?.location,
        time: date3Record?.time,
        codeUsed: date3Record?.codeUsed,
      };

      let count = 0;
      if (d1Detail.attended) count++;
      if (d2Detail.attended) count++;
      if (d3Detail.attended) count++;

      const consistencyRate = Math.round((count / 3) * 100);
      const isCandidateForMembership = !isMember && count >= 2;

      let recommendationNote = "";
      if (isMember) {
        recommendationNote = count === 3 ? "Consistent Official Member (3/3 services)" : count === 2 ? "Official Member (2/3 services)" : "Official Member (Missed recent services)";
      } else {
        if (count === 3) {
          recommendationNote = "⭐ High Priority Candidate: 100% Attendance (Attended all 3 services). Ready for Member Profile!";
        } else if (count === 2) {
          recommendationNote = "👍 Prime Candidate: 67% Attendance (Attended 2 of 3 services). Recommend creating Member Profile.";
        } else {
          recommendationNote = "Single Service Attendee (1/3 services). First-time/casual visitor.";
        }
      }

      // Apply campus filter
      if (campusFilter !== "all") {
        const cLower = p.campus.toLowerCase();
        if (campusFilter === "jos" && !cLower.includes("jos")) continue;
        if (campusFilter === "abuja" && !cLower.includes("abuja")) continue;
        if (campusFilter === "online" && !cLower.includes("online")) continue;
      }

      // Apply status filter
      if (statusFilter === "candidates" && !isCandidateForMembership) continue;
      if (statusFilter === "walk_ins" && isMember) continue;
      if (statusFilter === "members" && !isMember) continue;

      // Apply search filter
      if (searchQuery) {
        const matchesName = p.name.toLowerCase().includes(searchQuery);
        const matchesPhone = p.phone.toLowerCase().includes(searchQuery);
        const matchesEmail = p.email.toLowerCase().includes(searchQuery);
        if (!matchesName && !matchesPhone && !matchesEmail) continue;
      }

      attendees.push({
        key,
        name: p.name,
        phone: p.phone,
        email: p.email,
        isMember,
        memberUserId: memberMatch?.id,
        memberRole: memberMatch?.role,
        memberUnit: memberMatch?.assignedUnitId,
        statusTag,
        campus: p.campus,
        date1Detail: d1Detail,
        date2Detail: d2Detail,
        date3Detail: d3Detail,
        totalAttendedOutOf3: count,
        consistencyRate,
        isCandidateForMembership,
        recommendationNote,
      });
    }

    // Sort: Candidates first, then higher attendance, then walk-ins before members
    attendees.sort((a, b) => {
      // Priority 1: Candidate for membership (walk-in with 2+ attendances)
      if (a.isCandidateForMembership !== b.isCandidateForMembership) {
        return a.isCandidateForMembership ? -1 : 1;
      }
      // Priority 2: Higher total attendance out of 3
      if (b.totalAttendedOutOf3 !== a.totalAttendedOutOf3) {
        return b.totalAttendedOutOf3 - a.totalAttendedOutOf3;
      }
      // Priority 3: Walk-ins before existing members (so pastors see who to act on)
      if (a.isMember !== b.isMember) {
        return a.isMember ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });

    // Summary counters
    const totalAttendees = attendees.length;
    const candidatesCount = attendees.filter((a) => a.isCandidateForMembership).length;
    const perfectAttendanceCount = attendees.filter((a) => a.totalAttendedOutOf3 === 3).length;
    const walkInsCount = attendees.filter((a) => !a.isMember).length;
    const membersCount = attendees.filter((a) => a.isMember).length;

    return NextResponse.json({
      ok: true,
      availableDates: allUniqueDates,
      selectedDates: [d1, d2, d3],
      summary: {
        totalAttendees,
        candidatesCount,
        perfectAttendanceCount,
        walkInsCount,
        membersCount,
      },
      attendees,
    });
  } catch (err: any) {
    console.error("Error in GET /api/portal/attendance/compare:", err);
    return NextResponse.json(
      { error: err.message || "Failed to compare attendance dates" },
      { status: 500 }
    );
  }
}
