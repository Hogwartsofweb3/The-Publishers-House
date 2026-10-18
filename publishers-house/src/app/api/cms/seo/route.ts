import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const DEFAULT_SEO_DATA = {
  siteTitle: "The Publishers House",
  siteTagline: "Raising Believers Whose Lives Publish Christ",
  siteDescription: "The Publishers House is an apostolic ministry in Jos, Nigeria, committed to proclaiming God's Word and equipping believers to publish Christ across every sphere of society.",
  siteUrl: "https://www.thepublishershouse.org",
  ogImageUrl: "/og-image.jpg",
  twitterHandle: "",
  googleVerification: "",
};

export async function GET() {
  try {
    const doc = await getAdminDb().collection("settings").doc("church_seo").get();
    if (!doc.exists) return NextResponse.json(DEFAULT_SEO_DATA);
    return NextResponse.json({ ...DEFAULT_SEO_DATA, ...doc.data() });
  } catch {
    return NextResponse.json(DEFAULT_SEO_DATA);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await getAdminDb().collection("settings").doc("church_seo").set(
      { ...body, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
