import https from "https";
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
if (!getApps().length) {
  initializeApp({ credential: cert(json) });
}
const db = getFirestore();

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
  });
}

async function main() {
  console.log("Fetching Spotify show...");
  const res = await fetch("https://open.spotify.com/show/0FELkmsjm7yVoytlwCXXDG", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });
  const html = await res.text();
  const segments = html.split('<a href="/episode/');
  console.log(`Found ${segments.length - 1} episode segments.`);

  const spotifyEpisodes = [];
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const id = seg.slice(0, seg.indexOf('"'));
    const titleMatch = seg.match(/data-testid="episodeTitle"[^>]*>([\s\S]*?)<\/h4>/);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
    if (id && title && !spotifyEpisodes.some((e) => e.id === id)) {
      spotifyEpisodes.push({ id, title });
    }
  }

  console.log(`Extracted ${spotifyEpisodes.length} unique Spotify episodes:`);
  spotifyEpisodes.forEach((e, idx) => {
    console.log(`[${idx + 1}] ID: ${e.id} | Title: "${e.title}"`);
  });

  console.log("\nFetching Firestore sermons...");
  const snap = await db.collection("sermons").get();
  console.log(`Found ${snap.size} sermons in Firestore.`);

  const sermons = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log("\nAll 'Latter Rain' sermons in Firestore:");
  const latter = sermons.filter(s => s.title.toLowerCase().includes("latter rain"));
  latter.forEach(h => console.log(`  - [${h.id}] "${h.title}" (Date: ${h.date}) | audioUrl: "${h.audioUrl}" | spotifyEpId: "${h.spotifyEpisodeId || ''}"`));

  console.log("\nLet's also look at recent 2026 sermons in Firestore:");
  const recent2026 = sermons.filter(s => s.date && s.date.startsWith("2026-10")).sort((a,b) => b.date.localeCompare(a.date));
  recent2026.slice(0, 15).forEach(h => console.log(`  - [${h.id}] "${h.title}" (Date: ${h.date})`));
}

main().catch(console.error);
