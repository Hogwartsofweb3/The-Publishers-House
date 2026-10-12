import { NextResponse } from "next/server";
import crypto from "crypto";
import { logTransaction } from "@/lib/logTransaction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function signaturesMatch(secret: string, rawBody: string, signature: string): boolean {
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  const expected = Buffer.from(hash);
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

export async function POST(req: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("PAYSTACK_SECRET_KEY is not set");
      return NextResponse.json({ error: "Webhook is not configured" }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    if (!signature || !signaturesMatch(secret, rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as {
      event?: string;
      data?: {
        amount?: number;
        reference?: string;
        currency?: string;
        status?: string;
        customer?: { email?: string };
        metadata?: { name?: string; category?: string };
      };
    };

    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const data = event.data;
    const reference = data?.reference;
    const amountKobo = Number(data?.amount);
    if (!reference || !Number.isFinite(amountKobo)) {
      return NextResponse.json({ error: "Invalid charge payload" }, { status: 400 });
    }

    await logTransaction({
      name: data?.metadata?.name || "Anonymous",
      email: data?.customer?.email || "",
      amountNGN: amountKobo / 100,
      category: data?.metadata?.category || "General",
      method: "paystack",
      network: "fiat",
      status: "success",
      reference,
      currency: data?.currency || "NGN",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
