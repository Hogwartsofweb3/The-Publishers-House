import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// VAPID keys — these are used to authenticate push messages from your server.
// Generate once with: npx web-push generate-vapid-keys
// Then add to .env.local:
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
//   VAPID_PRIVATE_KEY=...
//   VAPID_EMAIL=mailto:thepublishershouse007@gmail.com
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:thepublishershouse007@gmail.com";

// ─── POST /api/portal/push ─────────────────────────────────────────────────
// Two modes:
//   action: "subscribe"  → save a push subscription for a user
//   action: "send"       → send a push to one user (by uid or email) or broadcast
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "subscribe") {
      return handleSubscribe(body);
    }

    if (action === "send") {
      return handleSend(body);
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("Push API error:", err);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}

// Save/update a push subscription for a user
async function handleSubscribe(body: any) {
  const { uid, email, subscription } = body;

  if (!subscription || !subscription.endpoint) {
    return NextResponse.json({ ok: false, error: "No subscription provided" }, { status: 400 });
  }

  const adminDb = getAdminDb();
  const docId = uid || email?.replace(/[^a-zA-Z0-9]/g, "_") || "anon";

  await adminDb.collection("push_subscriptions").doc(docId).set(
    {
      uid: uid || "",
      email: email || "",
      subscription,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return NextResponse.json({ ok: true });
}

// Send a push notification to a specific user or everyone
async function handleSend(body: any) {
  const {
    targetUid,
    targetEmail,
    broadcast = false,
    title = "The Publishers House",
    message,
    link = "/portal/member",
    tag = "tph-notification",
  } = body;

  if (!message) {
    return NextResponse.json({ ok: false, error: "message is required" }, { status: 400 });
  }

  // Lazy-load web-push dynamically so Webpack does not statically analyze the package at build time
  let webpush: any = null;
  try {
    const dynamicRequire =
      typeof (globalThis as any).__non_webpack_require__ !== "undefined"
        ? (globalThis as any).__non_webpack_require__
        // eslint-disable-next-line no-eval
        : eval("require");
    webpush = dynamicRequire("web-push");
    if (webpush && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    }
  } catch (e: any) {
    console.warn("web-push not available — push skipped:", e?.message);
    return NextResponse.json({ ok: true, skipped: true, reason: "web-push not installed" });
  }

  if (!webpush) {
    return NextResponse.json({ ok: true, skipped: true, reason: "web-push not available" });
  }

  const adminDb = getAdminDb();
  let snap;

  if (broadcast) {
    snap = await adminDb.collection("push_subscriptions").get();
  } else if (targetUid) {
    snap = await adminDb.collection("push_subscriptions").where("uid", "==", targetUid).get();
  } else if (targetEmail) {
    snap = await adminDb.collection("push_subscriptions").where("email", "==", targetEmail).get();
  } else {
    return NextResponse.json({ ok: false, error: "Provide targetUid, targetEmail, or broadcast:true" }, { status: 400 });
  }

  const payload = JSON.stringify({ title, body: message, link, tag });
  let sent = 0;
  let failed = 0;

  for (const doc of snap.docs) {
    const { subscription } = doc.data();
    if (!subscription) continue;
    try {
      await webpush.sendNotification(subscription, payload);
      sent++;
    } catch (err: any) {
      console.warn("Push send failed for", doc.id, err.message);
      // If subscription is expired/invalid, remove it
      if (err.statusCode === 410 || err.statusCode === 404) {
        await doc.ref.delete();
      }
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed });
}

// ─── DELETE /api/portal/push?uid=... ──────────────────────────────────────
// Remove a push subscription (unsubscribe)
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
