import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";

export const revalidate = 300; // cache for 5 minutes

export async function GET() {
  let settings = {};
  let gatherings: any[] = [];

  try {
    const snap = await getDoc(doc(db, "homeSettings", "main"));
    if (snap.exists()) settings = snap.data();
  } catch (e) {}

  try {
    const snap = await getDocs(query(collection(db, "gatherings"), orderBy("order", "asc")));
    gatherings = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((g: any) => g.published !== false);
  } catch (e) {}

  return NextResponse.json({ settings, gatherings }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
