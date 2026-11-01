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
  console.log(`Total sermons: ${snap.size}`);

  let withSpotify = 0;
  let withAudio = 0;
  for (const doc of snap.docs) {
    const s = doc.data();
    if (s.spotifyEpisodeId) {
      withSpotify++;
      console.log(`[Spotify doc ${doc.id}]: "${s.title}" -> spotifyEpisodeId: "${s.spotifyEpisodeId}"`);
    }
    if (s.audioUrl && s.audioUrl.trim()) {
      withAudio++;
      console.log(`[Audio doc ${doc.id}]: "${s.title}" -> audioUrl: "${s.audioUrl}"`);
    }
  }
  console.log(`Total with spotifyEpisodeId: ${withSpotify}, Total with audioUrl: ${withAudio}`);
}
main();
