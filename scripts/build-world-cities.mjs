// Builds src/data/world-cities.json from the `city-timezones` package (~7,300 cities
// with coordinates and IANA time zones). Run with `npm run cities` after upgrading it.
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { cityMapping } = require("city-timezones");

const best = new Map();
for (const c of cityMapping) {
  if (!c.timezone || !Number.isFinite(c.lat) || !Number.isFinite(c.lng)) continue;
  const key = `${c.city}|${c.iso2}`;
  const prev = best.get(key);
  if (!prev || (c.pop ?? 0) > (prev.pop ?? 0)) best.set(key, c);
}

// Compact tuples keep the bundle small: [name, province, country, lat, lng, tz].
// Sorted by population so the largest match is listed first.
const rows = [...best.values()]
  .sort((a, b) => (b.pop ?? 0) - (a.pop ?? 0))
  .map((c) => [
    c.city,
    c.province && c.province !== c.city ? c.province : "",
    c.country,
    Math.round(c.lat * 1e4) / 1e4,
    Math.round(c.lng * 1e4) / 1e4,
    c.timezone,
  ]);

const out = new URL("../src/data/world-cities.json", import.meta.url);
writeFileSync(out, JSON.stringify(rows));
console.log(`wrote ${rows.length} cities to src/data/world-cities.json`);
