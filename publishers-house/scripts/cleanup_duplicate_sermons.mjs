import fs from "fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const json = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
if (!getApps().length) initializeApp({ credential: cert(json) });
const db = getFirestore();

function getCanonicalSermonKey(title) {
  return (title || "")
    .toLowerCase()
    .replace(/[|/]{1,2}\s*the latter rain[^\n]*/gi, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  console.log("Checking Firestore for duplicate sermons...");
  try {
    const snap = await db.collection("sermons").get();
    console.log(`Loaded ${snap.size} sermons from Firestore.`);

    const byKey = new Map();
    for (const doc of snap.docs) {
      const data = { id: doc.id, ...doc.data() };
      const key = getCanonicalSermonKey(data.title);
      if (!key) continue;
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key).push(data);
    }

    let mergedCount = 0;
    let deletedCount = 0;

    for (const [key, items] of byKey.entries()) {
      if (items.length > 1) {
        console.log(`\nFound ${items.length} records for key: "${key}":`);
        items.forEach((it) => {
          console.log(`  - [${it.id}] "${it.title}" | video: ${Boolean(it.videoUrl)} | spotify: ${Boolean(it.spotifyEpisodeId)}`);
        });

        // Find primary (has videoUrl or older)
        const primary = items.find((i) => i.videoUrl) || items[0];
        const duplicates = items.filter((i) => i.id !== primary.id);

        for (const dup of duplicates) {
          const updates = {};
          if (!primary.spotifyEpisodeId && dup.spotifyEpisodeId) {
            updates.spotifyEpisodeId = dup.spotifyEpisodeId;
          }
          if ((!primary.audioUrl || primary.audioUrl.includes("t.me")) && dup.audioUrl) {
            updates.audioUrl = dup.audioUrl;
          }
          if (!primary.coverImageUrl && dup.coverImageUrl) {
            updates.coverImageUrl = dup.coverImageUrl;
          }

          if (Object.keys(updates).length > 0) {
            console.log(`  -> Merging audio into primary [${primary.id}]:`, updates);
            await db.collection("sermons").doc(primary.id).set(updates, { merge: true });
            mergedCount++;
          }

          // If duplicate was created as standalone spotify sermon without its own video
          if (!dup.videoUrl && (dup.source === "spotify" || dup.spotifyEpisodeId)) {
            console.log(`  -> Deleting duplicate document [${dup.id}] "${dup.title}"`);
            await db.collection("sermons").doc(dup.id).delete();
            deletedCount++;
          }
        }
      }
    }

    console.log(`\n🎉 Done! Merged: ${mergedCount}, Deleted duplicates: ${deletedCount}`);
  } catch (err) {
    if (err.message && err.message.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Firestore quota is currently exhausted. The client-side & API in-memory deduplication is already active and preventing duplicates on the website!");
    } else {
      console.error("Cleanup error:", err);
    }
  }
}

main().catch(console.error);
