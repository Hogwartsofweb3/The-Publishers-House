import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await getAdminDb()
      .collection("articles")
      .orderBy("publishedAt", "desc")
      .get();
    const articles = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ ok: true, articles });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, articles: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, article, published, items } = body;
    const db = getAdminDb();
    const now = new Date().toISOString();

    if (action === "save") {
      if (!article || typeof article !== "object") {
        return NextResponse.json({ error: "Missing article payload" }, { status: 400 });
      }

      const categoriesArray = Array.isArray(article.categories)
        ? article.categories
        : typeof article.categories === "string"
        ? article.categories.split(",").map((c: string) => c.trim()).filter(Boolean)
        : ["Christian Living"];

      const cleanData: Record<string, any> = {
        title: article.title || "",
        slug: article.slug || "",
        excerpt: article.excerpt || "",
        body: article.body || "",
        coverImageUrl: article.coverImageUrl || "",
        audioUrl: article.audioUrl || "",
        author: article.author || "The Publishers House",
        categories: categoriesArray,
        qa: Array.isArray(article.qa) ? article.qa : [],
        publishedAt: article.publishedAt || now.split("T")[0],
        published: article.published !== false,
        updatedAt: now,
      };

      if (id) {
        await db.collection("articles").doc(id).set(cleanData, { merge: true });
        return NextResponse.json({ ok: true, id, message: "Article saved successfully ✓" });
      } else {
        const docRef = await db.collection("articles").add({
          ...cleanData,
          createdAt: now,
        });
        return NextResponse.json({ ok: true, id: docRef.id, message: "Article published successfully ✓" });
      }
    }

    if (action === "delete") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await db.collection("articles").doc(id).delete();
      return NextResponse.json({ ok: true });
    }

    if (action === "toggle_publish") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await db.collection("articles").doc(id).set(
        { published: Boolean(published), updatedAt: now },
        { merge: true }
      );
      return NextResponse.json({ ok: true });
    }

    if (action === "batch_sync") {
      if (!Array.isArray(items)) {
        return NextResponse.json({ error: "Missing items array" }, { status: 400 });
      }
      const batch = db.batch();
      let count = 0;
      for (const item of items) {
        if (!item || !item.title) continue;
        const ref = item.id
          ? db.collection("articles").doc(item.id)
          : db.collection("articles").doc();
        batch.set(ref, { ...item, updatedAt: now }, { merge: true });
        count++;
      }
      await batch.commit();
      return NextResponse.json({ ok: true, count });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("CMS articles API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
