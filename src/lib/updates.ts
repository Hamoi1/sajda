import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import { inTauri } from "./tauri";

/** Where update notifications point. */
export const REPO_URL = "https://github.com/Hamoi1/sajda";
const RELEASES_API = "https://api.github.com/repos/Hamoi1/sajda/releases/latest";

export interface UpdateInfo {
  version: string;
  url: string;
}

/** Compares dotted versions: "2.1.0" > "2.0.12". */
export function isNewerVersion(candidate: string, current: string): boolean {
  const parse = (v: string) => v.replace(/^v/, "").split(".").map((n) => Number(n) || 0);
  const a = parse(candidate);
  const b = parse(current);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
  }
  return false;
}

/**
 * Asks GitHub whether a newer release exists. The app's only network call:
 * runs at most once a day, is opt-out in settings, and fails silently offline.
 */
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  if (!inTauri) return null;
  try {
    const [current, res] = await Promise.all([getVersion(), fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } })]);
    if (!res.ok) return null;
    const data = (await res.json()) as { tag_name?: string; html_url?: string };
    if (!data.tag_name) return null;
    if (!isNewerVersion(data.tag_name, current)) return null;
    // Never hand a foreign URL to the opener: only this repo's release page.
    const url =
      data.html_url && data.html_url.startsWith(`${REPO_URL}/releases`)
        ? data.html_url
        : `${REPO_URL}/releases/latest`;
    return { version: data.tag_name.replace(/^v/, ""), url };
  } catch (err) {
    console.error("update check skipped", err);
    return null;
  }
}

export async function openReleases(url: string): Promise<void> {
  try {
    await openUrl(url);
  } catch (err) {
    console.error("opening releases page failed", err);
  }
}
