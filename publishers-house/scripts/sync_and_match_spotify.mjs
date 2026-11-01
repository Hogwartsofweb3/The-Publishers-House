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

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  console.log("Fetching Spotify show: https://open.spotify.com/show/0FELkmsjm7yVoytlwCXXDG ...");
  const res = await fetch("https://open.spotify.com/show/0FELkmsjm7yVoytlwCXXDG", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });
  const html = await res.text();
  const segments = html.split('<a href="/episode/');
  console.log(`Found ${segments.length - 1} episode segments.`);

  const basicEpisodes = [];
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const id = seg.slice(0, seg.indexOf('"'));
    const titleMatch = seg.match(/data-testid="episodeTitle"[^>]*>([\s\S]*?)<\/h4>/);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
    if (id && title && !basicEpisodes.some((e) => e.id === id)) {
      basicEpisodes.push({ id, title });
    }
  }

  console.log(`Extracted ${basicEpisodes.length} unique Spotify episodes.`);

  // Fetch full episode metadata
  const fullEpisodes = [];
  for (const b of basicEpisodes) {
    try {
      const epRes = await fetch(`https://open.spotify.com/embed/episode/${b.id}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (epRes.ok) {
        const epHtml = await epRes.text();
        const nextData = epHtml.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
        if (nextData) {
          const parsed = JSON.parse(nextData[1]);
          const ent = parsed.props?.pageProps?.state?.data?.entity;

          let durationFormatted = "45:00";
          if (ent?.duration) {
            const totalSec = Math.round(ent.duration / 1000);
            const m = Math.floor(totalSec / 60);
            const s = totalSec % 60;
            durationFormatted = `${m}:${String(s).padStart(2, "0")}`;
          }

          let isoDate = ent?.releaseDate?.isoString ? ent.releaseDate.isoString.split("T")[0] : new Date().toISOString().split("T")[0];
          const coverImage = ent?.relatedEntityCoverArt?.[1]?.url || ent?.relatedEntityCoverArt?.[0]?.url || "/images/sermon-hero-bg.jpg";
          const subtitle = ent?.subtitle || "";
          const desc = ent?.description || "";

          // Parse speaker & series
          let series = "";
          let speaker = "Pastor Ngbede Odeh";
          if (desc && desc.includes("~")) {
            const parts = desc.split("~").map(p => p.trim());
            if (parts.length >= 2) {
              series = parts[0];
              speaker = parts[1];
            }
          }

          fullEpisodes.push({
            spotifyEpisodeId: b.id,
            title: b.title,
            speaker: speaker || "Pastor Ngbede Odeh",
            series: series || "The Latter Rain",
            date: isoDate,
            duration: durationFormatted,
            coverImageUrl: coverImage,
            audioUrl: `https://open.spotify.com/episode/${b.id}`,
            summary: desc || `Audio teaching from The Publishers House Spotify show.`,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching embed for", b.id, err);
    }
  }

  console.log(`\nFetched metadata for ${fullEpisodes.length} episodes.`);

  // Load all Firestore sermons
  const snap = await db.collection("sermons").get();
  const firestoreSermons = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Loaded ${firestoreSermons.length} sermons from Firestore.`);

  let updatedCount = 0;
  let addedCount = 0;
  const now = new Date().toISOString();

  for (const ep of fullEpisodes) {
    const epNorm = normalize(ep.title);
    
    // Find matching sermon in Firestore
    const match = firestoreSermons.find(s => {
      const sNorm = normalize(s.title);
      // Exact match
      if (sNorm === epNorm) return true;
      // s starts with ep
      if (sNorm.startsWith(epNorm)) return true;
      // ep starts with s
      if (epNorm.startsWith(sNorm)) return true;
      // Special Latter Rain series matches
      if (epNorm.includes("pre fol intervention") && sNorm.includes("pre fol intervention")) return true;
      if (epNorm.includes("preparing for a visitation") && sNorm.includes("preparing for a visitation")) return true;
      if (epNorm.includes("water for the thirsty") && sNorm.includes("water for the thirsty")) return true;
      if (epNorm.includes("and he prayed again") && sNorm.includes("and he prayed again")) return true;
      return false;
    });

    if (match) {
      console.log(`✓ Linking [${match.id}] "${match.title}" -> Spotify "${ep.title}" (${ep.spotifyEpisodeId})`);
      await db.collection("sermons").doc(match.id).set({
        spotifyEpisodeId: ep.spotifyEpisodeId,
        audioUrl: ep.audioUrl,
        duration: match.duration || ep.duration,
        coverImageUrl: match.coverImageUrl || ep.coverImageUrl,
        updatedAt: now,
      }, { merge: true });
      updatedCount++;
    } else {
      console.log(`+ Adding new sermon: Spotify "${ep.title}" (${ep.spotifyEpisodeId})`);
      await db.collection("sermons").add({
        title: ep.title,
        speaker: ep.speaker,
        date: ep.date,
        series: ep.series,
        scripture: "",
        duration: ep.duration,
        videoUrl: "",
        audioUrl: ep.audioUrl,
        spotifyEpisodeId: ep.spotifyEpisodeId,
        studyGuideUrl: "",
        tags: ["Spotify", "Audio Message", ep.series].filter(Boolean),
        coverImageUrl: ep.coverImageUrl,
        summary: ep.summary,
        published: true,
        source: "spotify",
        createdAt: now,
        updatedAt: now,
      });
      addedCount++;
    }
  }

  // Also clean up any sermons that have invalid audioUrl pointing to the whole show or non-episode spotify
  let cleanedCount = 0;
  for (const doc of snap.docs) {
    const s = doc.data();
    if (s.audioUrl && (s.audioUrl.includes("/show/") || s.audioUrl.includes("0FELkmsjm7yVoytlwCXXDG")) && !s.audioUrl.includes("/episode/")) {
      console.log(`🧹 Cleaning out show audioUrl from doc [${doc.id}] "${s.title}"`);
      await db.collection("sermons").doc(doc.id).set({
        audioUrl: "",
        spotifyEpisodeId: "",
        updatedAt: now,
      }, { merge: true });
      cleanedCount++;
    }
  }

  console.log(`\n🎉 Done! Updated: ${updatedCount}, Added: ${addedCount}, Cleaned: ${cleanedCount}`);
}

main().catch(console.error);
