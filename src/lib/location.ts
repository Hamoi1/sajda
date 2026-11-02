import cities from "../data/cities.json";
import type { Place } from "./types";

export type Region = "kurdistan" | "iraq" | "world";

export interface City {
  id: string;
  region: Region;
  en: string;
  ckb: string;
  ar: string;
  lat: number;
  lng: number;
  tz: string;
}

export const CITIES = cities as City[];

export function cityToPlace(city: City): Place {
  return {
    id: city.id,
    names: { en: city.en, ckb: city.ckb, ar: city.ar },
    lat: city.lat,
    lng: city.lng,
    tz: city.tz,
  };
}

export const DEFAULT_PLACE = cityToPlace(CITIES[0]);

/** Matches any of the three names, ignoring case and Arabic-script letter variants. */
export function searchCities(query: string): City[] {
  const q = normalize(query);
  if (!q) return CITIES;
  return CITIES.filter((c) => [c.en, c.ckb, c.ar].some((name) => normalize(name).includes(q)));
}

/** [name, province, country, lat, lng, tz], from scripts/build-world-cities.mjs. */
type WorldRow = [string, string, string, number, number, string];

export interface WorldCity {
  name: string;
  province: string;
  country: string;
  lat: number;
  lng: number;
  tz: string;
}

let worldRows: Promise<WorldRow[]> | null = null;

/** The ~7,000-city world list is loaded on first search only, so startup stays light. */
function loadWorld(): Promise<WorldRow[]> {
  worldRows ??= import("../data/world-cities.json").then((m) => m.default as WorldRow[]);
  return worldRows;
}

/** World matches, minus any that duplicate a hand-curated city (those carry Kurdish/Arabic names). */
export async function searchWorld(query: string, limit = 40): Promise<WorldCity[]> {
  const q = normalize(query);
  if (q.length < 2) return [];
  const rows = await loadWorld();
  const out: WorldCity[] = [];
  for (const [name, province, country, lat, lng, tz] of rows) {
    if (!normalize(name).includes(q) && !normalize(country).startsWith(q)) continue;
    if (CITIES.some((c) => Math.abs(c.lat - lat) < 0.15 && Math.abs(c.lng - lng) < 0.15)) continue;
    out.push({ name, province, country, lat, lng, tz });
    if (out.length >= limit) break;
  }
  return out;
}

export function worldCityToPlace(city: WorldCity): Place {
  return {
    id: `world:${city.name}|${city.country}`,
    names: { en: city.name },
    lat: city.lat,
    lng: city.lng,
    tz: city.tz,
  };
}

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ًͯ-ٟ]/g, "")
    .replace(/[يی]/g, "ی")
    .replace(/[كک]/g, "ک")
    .replace(/[ةە]/g, "ە")
    .replace(/[أإآا]/g, "ا");
}

export function isValidCoords(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

export function systemTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function allTimeZones(): string[] {
  const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
  return supported ? supported("timeZone") : [systemTimeZone()];
}
