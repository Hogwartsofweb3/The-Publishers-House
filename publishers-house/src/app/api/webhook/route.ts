import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    
    // In production, compare signature with PAYSTACK_SECRET_KEY
    // const secret = process.env.PAYSTACK_SECRET_KEY || "";
    // const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    // if (hash !== signature) {
    //   return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    // }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const data = event.data;
      
      // Log the transaction to Firestore (CMS)
      await addDoc(collection(db, 'transactions'), {
        reference: data.reference,
        amount: data.amount / 100, // Paystack amounts are in kobo
        currency: data.currency,
        channel: data.channel,
        status: data.status,
        email: data.customer?.email,
        method: "Fiat (Paystack Webhook)",
        date: serverTimestamp(),
      });

      // Email confirmation logic would go here (e.g. Resend, SendGrid)
      console.log([Webhook] Processed successful charge of $ $ from $);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('[Webhook Error]', error);
    return NextResponse.json({ status: 'error', message: "Internal Server Error" }, { status: 500 });
  }
}
