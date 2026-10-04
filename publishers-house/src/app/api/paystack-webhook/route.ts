import { NextResponse } from "next/server";
import crypto from "crypto";
import { saveTransaction } from "@/lib/firebase"; // You'll need to make sure this is exported from lib/firebase.ts

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY || "";
    
    // Validate event
    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Only process charge.success
    if (event.event === "charge.success") {
      const data = event.data;
      
      const email = data.customer.email;
      const amountNGN = data.amount / 100; // Paystack amount is in kobo
      const reference = data.reference;
      
      // We can pass metadata from the frontend when initializing the transaction
      const name = data.metadata?.name || "Anonymous";
      const category = data.metadata?.category || "General";
      
      try {
        await saveTransaction({
          name,
          email,
          amountNGN,
          category,
          method: "paystack",
          network: "fiat",
          status: "success",
          reference,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to save to Firebase", err);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
