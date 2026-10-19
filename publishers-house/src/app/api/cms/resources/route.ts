import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const doc = await getAdminDb().collection("settings").doc("resources_tracks").get();
    let tracks = doc.exists ? doc.data()?.tracks || {} : {};

    // Fallback: check individual documents if settings doc is empty
    if (Object.keys(tracks).length === 0) {
      const snap = await getAdminDb().collection("resource_tracks").get();
      if (!snap.empty) {
        tracks = {};
        snap.forEach((d) => {
          tracks[d.id] = d.data();
        });
      }
    }

    const hubDoc = await getAdminDb().collection("settings").doc("resources_hub").get();
    const hub = hubDoc.exists
      ? hubDoc.data()
      : {
          heroEyebrow: "Equipping the Saints · Psalm 68:11",
          heroHeadline: "Resources & Study Guides",
          heroDescription:
            "Systematic teaching series, prayer class manuals, devotionals, and foundational apostolic courses designed to establish believers in Christ.",
          heroImage: "/images/teaching-and-resources.jpg",
          downloadables: [],
        };

    return NextResponse.json({ tracks, hub });
  } catch {
    return NextResponse.json({ tracks: {}, hub: {} });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tracks = body.tracks || {};
    const hub = body.hub || null;
    const updatedAt = new Date().toISOString();

    const batch = getAdminDb().batch();

    // 1. Write unified tracks map to settings/resources_tracks if provided
    if (body.tracks) {
      const settingsRef = getAdminDb().collection("settings").doc("resources_tracks");
      batch.set(settingsRef, { tracks, updatedAt }, { merge: true });

      // 2. Also write each track document directly to resource_tracks/[slug]
      for (const [slug, trackData] of Object.entries(tracks)) {
        if (slug && trackData && typeof trackData === "object") {
          const trackRef = getAdminDb().collection("resource_tracks").doc(slug);
          batch.set(trackRef, { ...(trackData as object), slug, updatedAt }, { merge: true });
        }
      }
    }

    // 3. Write main /resources hub settings if provided
    if (hub) {
      const hubRef = getAdminDb().collection("settings").doc("resources_hub");
      batch.set(hubRef, { ...hub, updatedAt }, { merge: true });
    }

    await batch.commit();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
