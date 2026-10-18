import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const DEFAULT_GIVING_DATA = {
  accountName: "The Publishers House",
  sterlingAccounts: [
    { currency: "NAIRA", number: "0082457106", label: "General Offering / Tithe" },
    { currency: "DOLLAR", number: "0083163086", label: "Domiciliary (USD)" },
    { currency: "PROJECTS ACCOUNT (NAIRA)", number: "0086985670", label: "Building & Projects" },
  ],
  gtbAccounts: [
    { currency: "NAIRA", number: "0869912273", label: "General Offering / Tithe" },
    { currency: "DOLLAR", number: "0885570536", label: "Domiciliary (USD)" },
    { currency: "EUROS", number: "0885570550", label: "Domiciliary (EUR)" },
    { currency: "POUNDS", number: "0885570543", label: "Domiciliary (GBP)" },
  ],
  zenithAccounts: [
    { currency: "NAIRA", number: "1228493012", label: "Festival of Light / Missions" },
  ],
  evmAddress: "0x063F4fa58078f6c2F1cbCb0D9EA15962Af5BBDaE",
  solAddress: "54CnBrza7uivgHvXCa7ym9LNi9KLwxkXR1vT77mbBxVk",
  suiAddress: "0xaaa4e6301a452139d1b93bd72dda49ddde76f64d253163a19c827f11b8cec63c",
  categories: ["Tithe", "Offering", "Special Projects", "Thanksgiving", "First Fruit", "Missions"],
};

export async function GET() {
  try {
    const doc = await getAdminDb().collection("settings").doc("church_giving").get();
    if (!doc.exists) {
      return NextResponse.json(DEFAULT_GIVING_DATA);
    }
    return NextResponse.json({ ...DEFAULT_GIVING_DATA, ...doc.data() });
  } catch (err: any) {
    return NextResponse.json(DEFAULT_GIVING_DATA);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cleanData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await getAdminDb().collection("settings").doc("church_giving").set(cleanData, { merge: true });
    return NextResponse.json({ ok: true, data: cleanData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
