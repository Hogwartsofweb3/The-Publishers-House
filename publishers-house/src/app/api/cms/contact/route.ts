import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const DEFAULT_CONTACT_DATA = {
  // Jos Campus
  josAddress: "The House of Bread, Korinjoh House, British, Jos, Plateau State",
  josMapUrl: "https://maps.google.com/?q=Korinjoh+House+British+Jos+Plateau+State+Nigeria",
  josPhone: "+234 816 797 6888",
  josWhatsapp: "https://wa.link/xr46nk",
  josEmail: "thepublishershouse1@gmail.com",
  // Service times
  servicesSunday: "Sunday 9:00 AM WAT",
  servicesThursday: "Thursday 5:00 PM WAT",
  // Abuja Campus
  abujaInfo: "Abuja Apostolic Camp, monthly. Venue to be supplied.",
  // Prayer hotlines
  prayerHotline1: "+234 813 063 5386",
  prayerHotline2: "",
  // Social
  socialYoutube: "https://www.youtube.com/@thepublishershouse",
  socialInstagram: "",
  socialFacebook: "",
  socialTwitter: "",
};

export async function GET() {
  try {
    const doc = await getAdminDb().collection("settings").doc("church_contact").get();
    if (!doc.exists) return NextResponse.json(DEFAULT_CONTACT_DATA);
    return NextResponse.json({ ...DEFAULT_CONTACT_DATA, ...doc.data() });
  } catch {
    return NextResponse.json(DEFAULT_CONTACT_DATA);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await getAdminDb().collection("settings").doc("church_contact").set(
      { ...body, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
