import fs from "fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { fileURLToPath } from "url";
import path from "path";

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

async function main() {
  const snap = await db.collection("sermons").get();
  const sermons = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const searchWords = ["spare", "ditch", "bone", "migration", "supplicat", "laugh", "visit", "fol", "rain"];
  for (const w of searchWords) {
    const matches = sermons.filter(s => {
      const text = `${s.title} ${s.series || ''} ${s.summary || ''}`.toLowerCase();
      return text.includes(w);
    });
    console.log(`\nKeyword "${w}": found ${matches.length} sermons:`);
    matches.forEach(m => console.log(`  [${m.id}] (${m.date}) "${m.title}" (Series: "${m.series || ''}")`));
  }
}
main();
