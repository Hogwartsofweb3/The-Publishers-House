import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { TRACK_DETAILS } from "@/lib/cmsDefaults";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory cache for resources & tracks to withstand Firestore quota exhaustion
let cachedTracks: Record<string, any> | null = null;
let cachedHub: any = null;

export async function GET() {
  try {
    // Always read individual resource_tracks docs first — they are the source of truth
    // for user-entered materials. The settings/resources_tracks doc is a mirror that
    // can lag or be overwritten with defaults; individual docs survive independently.
    const [settingsDoc, individualSnap] = await Promise.all([
      getAdminDb().collection("settings").doc("resources_tracks").get(),
      getAdminDb().collection("resource_tracks").get(),
    ]);

    // Build a map from individual docs (most authoritative)
    const fromIndividual: Record<string, any> = {};
    if (!individualSnap.empty) {
      individualSnap.forEach((d) => {
        fromIndividual[d.id] = d.data();
      });
    }

    // Build a map from the unified settings doc
    const fromSettings: Record<string, any> = settingsDoc.exists
      ? settingsDoc.data()?.tracks || {}
      : {};

    // Merge: prefer whichever source has more materials for each slug
    const tracks: Record<string, any> = {};
    const allSlugs = new Set([
      ...Object.keys(fromSettings),
      ...Object.keys(fromIndividual),
    ]);
    for (const slug of allSlugs) {
      const s = fromSettings[slug];
      const i = fromIndividual[slug];
      if (!s && !i) continue;
      if (!s) { tracks[slug] = i; continue; }
      if (!i) { tracks[slug] = s; continue; }
      // Both exist — pick the one with more materials (the richer record)
      const sMats = Array.isArray(s.materials) ? s.materials : [];
      const iMats = Array.isArray(i.materials) ? i.materials : [];
      tracks[slug] = iMats.length >= sMats.length ? i : s;
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

    // Update memory cache
    cachedTracks = tracks;
    cachedHub = hub;

    return NextResponse.json({ tracks, hub, error: null, quotaBlocked: false });
  } catch (err: any) {
    console.error("Error reading resources from Firestore (serving cached tracks):", err?.message);
    const isQuota = err?.code === 8 || String(err?.message || "").includes("RESOURCE_EXHAUSTED") || String(err?.message || "").includes("Quota exceeded");
    
    // Use in-memory cache if available, or fall back to TRACK_DETAILS default courses
    const fallbackTracks = (cachedTracks && Object.keys(cachedTracks).length > 0)
      ? cachedTracks
      : TRACK_DETAILS;
    const fallbackHub = cachedHub || {
      heroEyebrow: "Equipping the Saints · Psalm 68:11",
      heroHeadline: "Resources & Study Guides",
      heroDescription:
        "Systematic teaching series, prayer class manuals, devotionals, and foundational apostolic courses designed to establish believers in Christ.",
      heroImage: "/images/teaching-and-resources.jpg",
      downloadables: [],
    };

    return NextResponse.json({
      tracks: fallbackTracks,
      hub: fallbackHub,
      error: err?.message || "Failed to load from database",
      quotaBlocked: isQuota,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tracks = body.tracks || {};
    const hub = body.hub || null;
    const updatedAt = new Date().toISOString();

    // Optimistically update memory cache
    if (body.tracks) {
      cachedTracks = { ...(cachedTracks || {}), ...tracks };
    }
    if (hub) {
      cachedHub = { ...(cachedHub || {}), ...hub };
    }

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
