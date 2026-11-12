import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { requirePortalUser } from "@/lib/serverAuth";
import type { PortalNotification } from "@/lib/types/portal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();
    const notificationsRef = db.collection("portal_notifications");

    // Fetch user-specific notifications
    // Query by userId
    let userDocs: FirebaseFirestore.DocumentSnapshot[] = [];

    try {
      const qUser = await notificationsRef
        .where("userId", "==", user.uid)
        .orderBy("createdAt", "desc")
        .limit(30)
        .get();
      userDocs = qUser.docs;
    } catch {
      // Fallback without composite index if order by fails
      const qUser = await notificationsRef.where("userId", "==", user.uid).limit(40).get();
      userDocs = qUser.docs;
    }

    // Also query by email if available
    if (user.email) {
      try {
        const qEmail = await notificationsRef
          .where("userEmail", "==", user.email.toLowerCase().trim())
          .limit(30)
          .get();
        // Merge without duplicates
        const existingIds = new Set(userDocs.map((d) => d.id));
        for (const doc of qEmail.docs) {
          if (!existingIds.has(doc.id)) {
            userDocs.push(doc);
          }
        }
      } catch {}
    }

    // Sort by createdAt descending
    const items: PortalNotification[] = userDocs.map((doc) => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        userId: data.userId || "",
        userEmail: data.userEmail || "",
        title: data.title || "Notification",
        message: data.message || "",
        type: data.type || "general",
        link: data.link || "",
        read: Boolean(data.read),
        createdAt: data.createdAt || new Date().toISOString(),
      };
    });

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = items.filter((n) => !n.read).length;

    return NextResponse.json({
      ok: true,
      notifications: items,
      unreadCount,
    });
  } catch (err: any) {
    console.error("Notifications GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePortalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, id, all } = body;
    const db = getAdminDb();

    if (action === "mark_read") {
      if (all) {
        // Mark all for this user as read
        const batch = db.batch();
        const userDocs = await db.collection("portal_notifications").where("userId", "==", user.uid).get();
        userDocs.forEach((d) => {
          if (!d.data().read) {
            batch.update(d.ref, { read: true, readAt: new Date().toISOString() });
          }
        });
        await batch.commit();
        return NextResponse.json({ ok: true, markedAll: true });
      }

      if (!id) {
        return NextResponse.json({ error: "Missing notification id" }, { status: 400 });
      }

      const notifRef = db.collection("portal_notifications").doc(id);
      const snap = await notifRef.get();
      if (snap.exists) {
        await notifRef.update({ read: true, readAt: new Date().toISOString() });
      }
      return NextResponse.json({ ok: true, id });
    }

    if (action === "create") {
      // Internal creation route for unit heads / pastors / system
      const { targetUserId, targetEmail, title, message, type, link } = body;
      if (!title || !message) {
        return NextResponse.json({ error: "Missing title or message" }, { status: 400 });
      }

      const newNotif = {
        userId: targetUserId || "",
        userEmail: targetEmail ? targetEmail.toLowerCase().trim() : "",
        title: title.trim(),
        message: message.trim(),
        type: type || "general",
        link: link || "",
        read: false,
        createdAt: new Date().toISOString(),
        createdBy: user.email,
      };

      const docRef = await db.collection("portal_notifications").add(newNotif);
      return NextResponse.json({ ok: true, id: docRef.id });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Notifications POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
