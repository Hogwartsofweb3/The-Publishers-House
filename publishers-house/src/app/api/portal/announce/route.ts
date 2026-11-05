import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/portal/announce
 * Sends a bulk announcement email to all portal members via Resend.
 * Admin / super_admin / portal_manager only.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "super_admin" && user.role !== "admin" && user.role !== "portal_manager") {
      return NextResponse.json({ error: "Forbidden — admin access only" }, { status: 403 });
    }

    const body = await req.json();
    // Support both `target` (new) and `targetRole` (legacy) fields
    const { subject, message, unitId } = body;
    const target: string = body.target || body.targetRole || "all";

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "subject and message are required" }, { status: 400 });
    }

    // Build query based on target
    let recipientsSnap;
    if (target === "unit" && unitId) {
      recipientsSnap = await getAdminDb()
        .collection("users")
        .where("assignedUnitId", "==", unitId)
        .get();
    } else if (target === "unit_heads") {
      recipientsSnap = await getAdminDb()
        .collection("users")
        .where("role", "==", "unit_head")
        .get();
    } else if (target === "admins") {
      // Fetch admins + super_admins
      const [adminSnap, superSnap] = await Promise.all([
        getAdminDb().collection("users").where("role", "==", "admin").get(),
        getAdminDb().collection("users").where("role", "==", "super_admin").get(),
      ]);
      const combined = [...adminSnap.docs, ...superSnap.docs];
      // Build a fake snapshot-like object
      recipientsSnap = { docs: combined };
    } else {
      // "all" or any unit_head-scoped call with unitId
      if (unitId) {
        recipientsSnap = await getAdminDb()
          .collection("users")
          .where("assignedUnitId", "==", unitId)
          .get();
      } else {
        recipientsSnap = await getAdminDb().collection("users").get();
      }
    }

    const emails: string[] = recipientsSnap.docs
      .map((d: any) => d.data().email as string)
      .filter(Boolean)
      .filter((e: string) => e.includes("@"));

    if (emails.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    // Send via Resend (batch BCC to protect privacy)
    const htmlBody = `
      <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E8EDFB;">
        <div style="background: linear-gradient(135deg, #0E1556, #1F46C8); padding: 28px 32px;">
          <div style="color: rgba(255,255,255,0.65); font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">The Publishers House</div>
          <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.01em;">${subject}</h1>
        </div>
        <div style="padding: 28px 32px;">
          <div style="font-size: 14px; color: #334155; line-height: 1.7; white-space: pre-line;">${message}</div>
          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #E8EDFB; font-size: 11px; color: #94A3B8;">
            This message was sent from The Publishers House Member Portal by ${user.displayName} (${user.email}).<br/>
            Jos Headquarters · The House of Bread, Karinjoh House, British, Jos, Plateau State, Nigeria
          </div>
        </div>
      </div>
    `;

    // Send in batches of 50 BCC to avoid spam filters
    const BATCH_SIZE = 50;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "The Publishers House <noreply@thepublishershouse.org>",
            to: ["noreply@thepublishershouse.org"],
            bcc: batch,
            subject: `[TPH Portal] ${subject}`,
            html: htmlBody,
          }),
        });
        if (res.ok) {
          sent += batch.length;
        } else {
          failed += batch.length;
        }
      } catch {
        failed += batch.length;
      }
    }

    // Audit log
    try {
      await getAdminDb().collection("audit_logs").add({
        action: `Announcement sent: "${subject}" to ${sent} member${sent !== 1 ? "s" : ""} (target: ${target}${unitId ? " / unit: " + unitId : ""})`,
        actor: user.email,
        category: "announcement",
        timestamp: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({ ok: true, sent, failed, total: emails.length });
  } catch (err: any) {
    console.error("Announce error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
