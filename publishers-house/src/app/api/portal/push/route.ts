import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { sendPushNotification } from "@/lib/pushUtils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── POST /api/portal/push ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "subscribe") return handleSubscribe(body);
    if (action === "send") return handleSend(body);

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("Push API error:", err);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

async function handleSubscribe(body: any) {
  const { uid, email, subscription } = body;
  if (!subscription?.endpoint) {
    return NextResponse.json({ ok: false, error: "No subscription provided" }, { status: 400 });
  }
  const adminDb = getAdminDb();
  const docId = uid || email?.replace(/[^a-zA-Z0-9]/g, "_") || "anon";
  await adminDb.collection("push_subscriptions").doc(docId).set(
    { uid: uid || "", email: email || "", subscription, updatedAt: new Date().toISOString() },
    { merge: true }
  );
  return NextResponse.json({ ok: true });
}

async function handleSend(body: any) {
  const { targetUid, targetEmail, broadcast, title, message, link, tag } = body;
  if (!message) {
    return NextResponse.json({ ok: false, error: "message is required" }, { status: 400 });
  }
  await sendPushNotification({ targetUid, targetEmail, broadcast, title, message, link, tag });
  return NextResponse.json({ ok: true });
}

// ─── DELETE /api/portal/push?uid=... ───────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const email = searchParams.get("email");
    if (!uid && !email) {
      return NextResponse.json({ ok: false, error: "uid or email required" }, { status: 400 });
    }
    const adminDb = getAdminDb();
    const docId = uid || email?.replace(/[^a-zA-Z0-9]/g, "_") || "";
    await adminDb.collection("push_subscriptions").doc(docId).delete();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
