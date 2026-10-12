import { getAdminDb } from "@/lib/firebaseAdmin";

export type LoggedTransaction = {
  name: string;
  email: string;
  amountNGN: number;
  category: string;
  method: string;
  network?: string;
  status: "pending" | "success" | "failed";
  reference?: string;
  currency?: string;
  timestamp: string;
};

function referenceDocId(reference: string): string {
  return reference.replace(/\//g, "_").slice(0, 700);
}

/** Writes a gift into `transactions`. Same Paystack reference is stored once. */
export async function logTransaction(tx: LoggedTransaction): Promise<"created" | "exists"> {
  const col = getAdminDb().collection("transactions");

  if (tx.reference) {
    const ref = col.doc(referenceDocId(tx.reference));
    const existing = await ref.get();
    if (existing.exists) return "exists";
    await ref.set(tx);
    return "created";
  }

  await col.add(tx);
  return "created";
}
