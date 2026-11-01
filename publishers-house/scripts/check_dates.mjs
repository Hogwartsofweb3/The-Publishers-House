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
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const dates = ["2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18", "2026-10-22", "2026-10-23", "2026-10-24", "2026-10-28", "2026-10-29", "2026-10-30"];
  console.log("Sermons matching these dates:");
  const byDate = all.filter(s => dates.includes(s.date)).sort((a,b) => a.date.localeCompare(b.date));
  for (const s of byDate) {
    console.log(`[${s.date}] (${s.id}) "${s.title}"`);
  }
}
main();
