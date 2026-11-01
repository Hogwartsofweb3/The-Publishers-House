import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const episodeIds = [
  "41OcMcqON7W6PWklxswXKy",
  "7CwGDbzgKT3ACAnaB7jLFA",
  "5lMoocvgJkfa5V7yA62Skz",
  "16tgXZSeFODbG6LbYQp8pG",
  "76B5OavpSKVXzrFeVzeqT0",
  "4jTfqUJRWanEGTe2stSTEj",
  "1hllGNBxC9dTIkzh3Qcs3N",
  "3Mz5SZcYCzaiewVkltcmNK",
  "2HXCMiVai2Wd8saj35tw0u",
  "6TfGOhFxciWAYEa4oUzoun",
  "3VsbaHCpoUPjils2TjJYfY",
  "4zgCEUnDPm8JINooqmYA0s"
];

async function main() {
  for (const id of episodeIds) {
    try {
      const res = await fetch(`https://open.spotify.com/embed/episode/${id}`, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const html = await res.text();
      const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
      if (match) {
        const parsed = JSON.parse(match[1]);
        const ent = parsed.props?.pageProps?.state?.data?.entity;
        console.log(`\n=== Episode ${id} ===`);
        console.log(`Title: ${ent?.name || ent?.title}`);
        console.log(`Release Date: ${ent?.releaseDate?.isoString}`);
        console.log(`Subtitle: ${ent?.subtitle}`);
        console.log(`Description: ${ent?.description?.slice(0, 150)}...`);
      }
    } catch (e) {
      console.error(id, e.message);
    }
  }
}
main();
