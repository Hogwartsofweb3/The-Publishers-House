// src/lib/pushUtils.ts
// Shared server-side push utility — called directly from API routes (no internal HTTP fetch)
import { getAdminDb } from "@/lib/firebaseAdmin";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:thepublishershouse007@gmail.com";

interface PushPayload {
  targetUid?: string;
  targetEmail?: string;
  broadcast?: boolean;
  title?: string;
  message: string;
  link?: string;
  tag?: string;
}

export async function sendPushNotification({
  targetUid,
  targetEmail,
  broadcast = false,
  title = "The Publishers House",
  message,
  link = "/portal/member",
  tag = "tph-notification",
}: PushPayload): Promise<void> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not configured — push skipped");
    return;
  }
  if (!targetUid && !targetEmail && !broadcast) {
    return;
  }

  try {
    const webpush = await import("web-push");
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const adminDb = getAdminDb();
    let snap;

    if (broadcast) {
      snap = await adminDb.collection("push_subscriptions").get();
    } else if (targetUid) {
      snap = await adminDb.collection("push_subscriptions").where("uid", "==", targetUid).get();
    } else {
      snap = await adminDb.collection("push_subscriptions").where("email", "==", targetEmail).get();
    }

    if (snap.empty) return;

    const payload = JSON.stringify({
      title,
      body: message,
      link,
      tag,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
    });

    for (const doc of snap.docs) {
      const { subscription } = doc.data();
      if (!subscription) continue;
      try {
        await webpush.sendNotification(subscription, payload);
      } catch (err: any) {
        console.warn("Push failed for", doc.id, err?.statusCode, err?.message);
        // Remove expired/invalid subscriptions
        if (err.statusCode === 410 || err.statusCode === 404) {
          await doc.ref.delete();
        }
      }
    }
  } catch (err) {
    console.warn("sendPushNotification error:", err);
  }
}
