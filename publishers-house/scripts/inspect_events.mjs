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

async function check() {
  const gSnap = await db.collection("gatherings").get();
  console.log(`=== GATHERINGS (${gSnap.size}) ===`);
  gSnap.forEach(d => console.log(d.id, JSON.stringify(d.data())));

  const eSnap = await db.collection("events").get();
  console.log(`=== EVENTS (${eSnap.size}) ===`);
  eSnap.forEach(d => console.log(d.id, "Title:", d.data().title, "| Date:", d.data().date, "| startAt:", d.data().startAt, "| published:", d.data().published));

  const hDoc = await db.collection("homeSettings").doc("main").get();
  console.log("=== HOMESETTINGS/MAIN ===");
  if (hDoc.exists) console.log(JSON.stringify(hDoc.data()));
}

check().catch(console.error);
