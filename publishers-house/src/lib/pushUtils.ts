// src/lib/pushUtils.ts
// Shared server-side push utility — called directly from API routes (no internal HTTP fetch)
import { getAdminDb } from "@/lib/firebaseAdmin";

export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  process.env.VAPID_PUBLIC_KEY ||
  "ds0gPNLM5jVSbXJMLSi4DWsP-1Nh3uH2cvBtxxdkqNPHFtVkfLGoCuoRUywC3DxTk1RF655GkvvS4fO6LGyY6w";

export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  "L5__XOJAYC9z9DN-m5YBVXIPsZaskhMjfKAQ5HL-5dY";

export const VAPID_EMAIL =
  process.env.VAPID_EMAIL ||
  "mailto:thepublishershouse007@gmail.com";

export interface PushPayload {
  targetUid?: string;
  targetEmail?: string;
  targetUids?: string[];
  targetEmails?: string[];
  broadcast?: boolean;
  title?: string;
  message: string;
  link?: string;
  tag?: string;
}

export async function sendPushNotification({
  targetUid,
  targetEmail,
  targetUids,
  targetEmails,
  broadcast = false,
  title = "The Publishers House",
  message,
  link = "/portal/member",
  tag = "tph-notification",
}: PushPayload): Promise<{ sent: number; failed: number }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not configured — push skipped");
    return { sent: 0, failed: 0 };
  }

  const hasSpecificTarget =
    targetUid ||
    targetEmail ||
    (targetUids && targetUids.length > 0) ||
    (targetEmails && targetEmails.length > 0);

  if (!hasSpecificTarget && !broadcast) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  try {
    const webpush = await import("web-push");
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const adminDb = getAdminDb();
    let subDocs: FirebaseFirestore.DocumentSnapshot[] = [];

    if (broadcast) {
      const snap = await adminDb.collection("push_subscriptions").get();
      subDocs = snap.docs;
    } else {
      const queries: Promise<FirebaseFirestore.QuerySnapshot>[] = [];
      if (targetUid) {
        queries.push(adminDb.collection("push_subscriptions").where("uid", "==", targetUid).get());
      }
      if (targetEmail) {
        queries.push(adminDb.collection("push_subscriptions").where("email", "==", targetEmail.toLowerCase().trim()).get());
      }
      if (targetUids && targetUids.length > 0) {
        // Chunk into groups of 10 for Firestore 'in' query
        for (let i = 0; i < targetUids.length; i += 10) {
          const chunk = targetUids.slice(i, i + 10);
          queries.push(adminDb.collection("push_subscriptions").where("uid", "in", chunk).get());
        }
      }
      if (targetEmails && targetEmails.length > 0) {
        const cleanEmails = targetEmails.map((e) => e.toLowerCase().trim());
        for (let i = 0; i < cleanEmails.length; i += 10) {
          const chunk = cleanEmails.slice(i, i + 10);
          queries.push(adminDb.collection("push_subscriptions").where("email", "in", chunk).get());
        }
      }

      const results = await Promise.all(queries);
      const seen = new Set<string>();
      for (const snap of results) {
        for (const doc of snap.docs) {
          if (!seen.has(doc.id)) {
            seen.add(doc.id);
            subDocs.push(doc);
          }
        }
      }
    }

    if (subDocs.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const payload = JSON.stringify({
      title,
      body: message,
      link,
      url: link,
      tag: `${tag}-${Date.now()}`,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
    });

    for (const doc of subDocs) {
      const { subscription } = doc.data() || {};
      if (!subscription || !subscription.endpoint) continue;

      try {
        await webpush.sendNotification(subscription, payload);
        sent++;
      } catch (err: any) {
        failed++;
        console.warn("Push delivery error for doc", doc.id, err?.statusCode, err?.message);
        // Clean up expired or unregistered subscriptions automatically
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await doc.ref.delete().catch(() => {});
        }
      }
    }
  } catch (err) {
    console.warn("sendPushNotification exception:", err);
  }

  return { sent, failed };
}
