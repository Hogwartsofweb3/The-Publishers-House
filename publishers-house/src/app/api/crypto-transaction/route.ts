import { NextResponse } from "next/server";
import { logTransaction } from "@/lib/logTransaction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORIES = ["Tithe", "Offering", "Special Projects", "Thanksgiving"];
const NETWORKS = ["EVM", "SOL", "SUI"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
    const email = typeof body?.email === "string" ? body.email.trim().slice(0, 200) : "";
    const category = typeof body?.category === "string" ? body.category : "";
    const network = typeof body?.network === "string" ? body.network : "";
    const amountNGN = Number(body?.amountNGN);

    if (!CATEGORIES.includes(category) || !NETWORKS.includes(network)) {
      return NextResponse.json({ error: "Invalid gift details" }, { status: 400 });
    }
    if (!Number.isFinite(amountNGN) || amountNGN < 100 || amountNGN > 100_000_000) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    await logTransaction({
      name: name || "Anonymous",
      email: email || "No Email",
      amountNGN,
      category,
      method: "crypto",
      network,
      status: "success",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Crypto transaction log failed:", error);
    return NextResponse.json({ error: "Could not record gift" }, { status: 500 });
  }
}
