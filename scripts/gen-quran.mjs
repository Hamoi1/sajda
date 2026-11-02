/**
 * Generates src/data/quran.json from the quran-json dev dependency (Tanzil Uthmani text).
 * Arabic-only, compact: one ayah array per surah. Run: node scripts/gen-quran.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const chaptersDir = join(root, "node_modules", "quran-json", "dist", "chapters");

const surahs = [];
for (let id = 1; id <= 114; id++) {
  const raw = JSON.parse(readFileSync(join(chaptersDir, `${id}.json`), "utf8"));
  surahs.push({
    id: raw.id,
    name: raw.name,
    latin: raw.transliteration,
    verses: raw.total_verses,
    meccan: raw.type === "meccan",
    ayahs: raw.verses.map((v) => v.text),
  });
}

const out = JSON.stringify({ surahs });
writeFileSync(join(root, "src", "data", "quran.json"), out);
console.log(`quran.json written: ${surahs.length} surahs, ${(out.length / 1024 / 1024).toFixed(2)} MB`);
