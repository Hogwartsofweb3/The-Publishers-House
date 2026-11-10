import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizePhone(phone?: string): string {
  if (!phone) return "";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("0") && digits.length === 11) return "234" + digits.slice(1);
  return digits;
}

function normalizeName(name?: string): string {
  return (name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export async function GET(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const myHistory = searchParams.get("myHistory") === "true";
    const syncMode = searchParams.get("syncAttendance") === "true";
    const db = getAdminDb();

    // ── SYNC MODE (admin only) ───────────────────────────────────────────────
    if (syncMode) {
      if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "portal_manager") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Load all users and build lookup maps
      const usersSnap = await db.collection("users").get();
      const emailToUser = new Map<string, any>();
      const nameToUser = new Map<string, any>();
      const phoneToUser = new Map<string, any>();

      usersSnap.docs.forEach((doc) => {
        const u = { id: doc.id, ...doc.data() } as any;
        const em = (u.email || "").trim().toLowerCase();
        if (em) emailToUser.set(em, u);
        const nm = normalizeName(u.displayName || u.fullName || u.name);
        if (nm) nameToUser.set(nm, u);
        const ph = normalizePhone(u.phone);
        if (ph && ph.length >= 7) phoneToUser.set(ph, u);
      });

      // Load all attendance records
      const attSnap = await db.collection("attendance").limit(5000).get();
      const batch = db.batch();
      let synced = 0;

      attSnap.docs.forEach((doc) => {
        const data = doc.data() as any;
        if (data.userId) return; // already linked

        const em = (data.email || "").trim().toLowerCase();
        const nm = normalizeName(data.fullName || data.name);
        const ph = normalizePhone(data.phone);

        const matched =
          (em && emailToUser.get(em)) ||
          (ph && ph.length >= 7 && phoneToUser.get(ph)) ||
          (nm && nameToUser.get(nm));

        if (matched) {
          batch.update(doc.ref, { userId: matched.id, syncedAt: new Date().toISOString() });
          synced++;
        }
      });

      await batch.commit();
      return NextResponse.json({ ok: true, message: `Synced ${synced} attendance records to member profiles` });
    }

    // ── PERSONAL HISTORY (member view) ───────────────────────────────────────
    if (myHistory) {
      const userEmail = (user.email || "").trim().toLowerCase();
      const userName = normalizeName(user.displayName);
      const userPhone = normalizePhone(user.phone);

      let records: any[] = [];

      // 1. Try by userId first (fastest)
      try {
        const snap = await db
          .collection("attendance")
          .where("userId", "==", user.uid)
          .orderBy("date", "desc")
          .limit(200)
          .get();
        if (!snap.empty) {
          records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
      } catch {
        // Index might not exist — fall through
      }

      // 2. Try by email
      if (records.length === 0 && userEmail) {
        try {
          const snap = await db
            .collection("attendance")
            .where("email", "==", userEmail)
            .orderBy("date", "desc")
            .limit(200)
            .get();
          if (!snap.empty) {
            records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          }
        } catch {
          // try without orderBy
          try {
            const snap = await db
              .collection("attendance")
              .where("email", "==", userEmail)
              .limit(200)
              .get();
            if (!snap.empty) {
              records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            }
          } catch {}
        }
      }

      // 3. Full scan fallback: match by name or phone
      if (records.length === 0) {
        try {
          const allSnap = await db.collection("attendance").orderBy("date", "desc").limit(2000).get();
          records = allSnap.docs
            .map((d) => ({ id: d.id, ...d.data() } as any))
            .filter((r) => {
              const rEmail = (r.email || "").trim().toLowerCase();
              const rName = normalizeName(r.fullName || r.name);
              const rPhone = normalizePhone(r.phone);
              if (userEmail && rEmail === userEmail) return true;
              if (userPhone && userPhone.length >= 7 && rPhone === userPhone) return true;
              if (userName && rName === userName) return true;
              return false;
            });
        } catch {
          records = [];
        }
      }

      // Sort by date desc
      records.sort((a, b) => {
        const da = a.date || "";
        const db2 = b.date || "";
        return da < db2 ? 1 : da > db2 ? -1 : 0;
      });

      // Format records for the member portal
      const formatted = records.map((r) => ({
        id: r.id,
        date: r.date || "",
        mode: r.mode || "in_person",
        type: r.serviceType || r.type || "regular",
        location: r.location || (r.mode === "online" ? "Online Stream" : "Jos (House of Bread)"),
        serviceCode: r.serviceCode || r.codeUsed || "",
        timestamp:
          r.timestamp && typeof r.timestamp.toDate === "function"
            ? r.timestamp.toDate().toISOString()
            : r.timestamp || r.date || "",
        fullName: r.fullName || r.name || "",
      }));

      return NextResponse.json({ ok: true, records: formatted, total: formatted.length });
    }

    // ── ADMIN: all attendance (paginated) ────────────────────────────────────
    if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "portal_manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pageSize = 500;
    let snap;
    try {
      snap = await db.collection("attendance").orderBy("date", "desc").limit(pageSize).get();
    } catch {
      snap = await db.collection("attendance").limit(pageSize).get();
    }
    const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ ok: true, records, total: records.length });
  } catch (err: any) {
    console.error("Error in GET /api/portal/attendance:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch attendance" }, { status: 500 });
  }
}
