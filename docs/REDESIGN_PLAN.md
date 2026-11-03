# Sajda v3: redesign, releases and website

Status (2026-11-03): phases 1, 2, 3, 5, 6 and 7 are implemented; phase 4 waits on your signing key; phase 8 is the release.

Direction: **Indigo Night + Gold, refined.** Same identity as `DESIGN.md`; better hierarchy, flatter surfaces, one gold, fewer boxes.

- Figma file: https://www.figma.com/design/UjDG1oR3dNYusLn4EhEL2p (12 screens, 900×620 main window)
- Clickable prototype: `design/prototype.html` (open in a browser; arrow keys step through screens)
- Download site: `site/` (static, deploys to Vercel as-is)

---

## 1. What changes in the app, and why

| Area | Today | v3 |
| --- | --- | --- |
| Title bar + tabs | Two stacked bars (48 + 50 px) | One 48 px bar: wordmark, centred segmented tabs, window controls. Content gains ~50 px. |
| Home | Countdown and city on opposite edges, a big empty middle, six equal gold-capped tiles at the bottom | Two columns: countdown, kilim progress and dates on one side; a mosque-board timetable on the other (next prayer marked with a gold rule, past prayers muted, bell per row). City and the official-timetable chip sit under the board. |
| Gold | Gradients on pills, toggles, nav items, the next-prayer tile | Flat gold, used only for: countdown, next prayer, primary button, active progress. No `--accent-gradient`. |
| Settings | Modal over the window, gold gradient pill for the active section | Full-window view, active section marked by a surface tint and a gold rule; rows are label + hint + control, separated by hairlines. |
| Azkar | Cards | Same cards, flatter; finished cards get a gold edge and a filled counter; a "3 of 12 done" line by the filter. |
| Tasbih | Ring inside a big grey card | Ring on the page itself, preset chips above, "click or hold Space" hint, reset as a quiet ghost button. |
| First run | Straight into the home screen with defaults | Three-step onboarding: language, city (search + Kurdistan presets first), adhan sound + widget on/off. |
| Widget | 6 themes, 4 sizes | Unchanged themes; type rebalanced so the countdown leads at every size. |

### Figma screens

01 Onboarding: language · 02 Onboarding: city · 03 Onboarding: adhan · 04 Home: dark · 05 Home: light · 06 Azkar · 07 Tasbih · 08 Settings: place · 09 Settings: widget · 10 Reader: Quran lock · 11 Widget: sizes · 12 Home: English (LTR)

### Wire the Figma prototype (5 minutes, by hand)

The Figma MCP on the Starter plan ran out of calls after the import, so the frames are named "Section" and have no links yet. In Figma: rename the frames 01 to 12 in canvas order (left to right), then in **Prototype** mode add *On click → Navigate to* (Smart animate, 200 ms ease-out):

| From | Layer (text on it) | To |
| --- | --- | --- |
| 01 | بەردەوامبە | 02 |
| 02 | بەردەوامبە / گەڕانەوە | 03 / 01 |
| 03 | دەستپێبکە / گەڕانەوە | 04 / 02 |
| 04, 06, 07 | tabs سەرەکی · ئەذکار · تەسبیح | 04 · 06 · 07 |
| 04, 06, 07 | settings icon (sliders) | 08 |
| 04, 06, 07 | widget icon (rectangle) | 11 |
| 08 ↔ 09 | nav شوێن و کات / ویجێت | 08 / 09 |
| 08, 09 | close (×) | 04 |
| 10 | تەواو بوو | 04 |
| 11 | گەڕانەوە بۆ سەرەکی | 04 |

Set frame 01 as the flow's starting point. `design/prototype.html` already has these exact links.

---

## 2. Implementation phases

Each phase is one branch and one PR. Nothing here changes prayer-time maths.

### Phase 1: tokens (½ day)
- `src/index.css`: remove `--accent-gradient` and `--accent-glow`; add `--raised`, `--raised-2` (dark `#161f3d` / `#1d2850`); body text `--ink` to `#f3f1ea`.
- Replace every use of the gradient with flat `bg-gold` (`grep -rn accent-gradient src`).
- Update `DESIGN.md` Rule 1 to say gold is flat.

### Phase 2: shell (1 day)
- `src/components/main/TitleBar.tsx`: absorb `TabBar` from `src/windows/MainWindow.tsx` into the centre of the title bar as a segmented control (`role="tablist"`, arrow-key navigation). Keep `data-tauri-drag-region` on the empty areas only.
- `MainWindow.tsx`: grid becomes `grid-rows-[auto_1fr]`.

### Phase 3: home (1–2 days)
- New `src/components/main/PrayerBoard.tsx` replaces `PrayerRow.tsx`: vertical list, `aria-current="true"` on the next prayer, past rows muted, the existing mute toggle per row.
- Home hero: label, countdown, "at" line, `ProgressBand` (kilim diamonds) directly under it, dates pinned to the bottom of the column.
- Widths: board 330 px fixed, hero takes the rest; below 820 px window width the board drops under the hero.

### Phase 4: in-app updater (½ day + your key)
1. Generate the key on your machine (never commit it):
   ```bash
   npx tauri signer generate -w ~/.tauri/sajda.key
   ```
2. GitHub → Settings → Secrets → Actions: add `TAURI_SIGNING_PRIVATE_KEY` (file contents) and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. The release workflow already passes them.
3. `src-tauri/Cargo.toml`: add `tauri-plugin-updater = "2"` and `tauri-plugin-process = "2"`; register both in `src-tauri/src/lib.rs`.
4. `src-tauri/tauri.conf.json`: `bundle.createUpdaterArtifacts: true` and
   ```json
   "plugins": { "updater": { "pubkey": "<contents of sajda.key.pub>", "endpoints": ["https://github.com/Hamoi1/sajda/releases/latest/download/latest.json"] } }
   ```
5. `capabilities/default.json`: add `updater:default`, `process:allow-restart`.
6. `npm i @tauri-apps/plugin-updater @tauri-apps/plugin-process`; in `src/lib/updates.ts` replace the GitHub-API check with `check()` and add `installUpdate()` that calls `downloadAndInstall()` then `relaunch()`. Keep the daily, opt-out schedule in `useScheduler.ts`. The TitleBar badge becomes "Update to x.y.z", which installs and restarts.
7. `tauri.conf.json` CSP: `connect-src` already allows `api.github.com`; add `https://github.com https://objects.githubusercontent.com`.

Users on 2.0.x keep the old "open GitHub" prompt once, install 2.1 by hand, and get automatic updates from then on.

### Phase 5: settings (1–2 days)
- Split `SettingsDialog.tsx` (35 KB) into `settings/PlaceSection.tsx`, `SoundSection.tsx`, `WidgetSection.tsx`, `ReaderSection.tsx`, `GeneralSection.tsx` plus a shared `SettingRow` (label, hint, control).
- Turn it from a modal into a full-window view with the start-side section nav.

### Phase 6: onboarding (1 day)
- `useSettingsStore.ts`: add `onboarded: boolean` (default `false`; migrate existing installs to `true` so current users never see it).
- New `src/components/onboarding/Onboarding.tsx` with the three steps; reuse the city search from `PlaceSection`.

### Phase 7: azkar, tasbih, widget polish (1 day)
- Azkar "n of m done" line; finished-card gold edge.
- Tasbih ring out of its card; Space-to-count hint.
- Re-shoot `docs/screenshot-*.png` with `scripts/cdp-shots.mjs`, then copy them into `site/assets/` so the site shows v3.

### Phase 8: release 2.1.0
Actions → **Bump version** → `minor`. Review the draft release, then publish.

---

## 3. Releases (already in place)

| File | What it does |
| --- | --- |
| `.github/workflows/bump-version.yml` | Manual. Takes `patch`, `minor`, `major` or `2.1.0`; runs `scripts/bump-version.mjs` over package.json, package-lock.json, tauri.conf.json, Cargo.toml and Cargo.lock; commits `chore: release vX.Y.Z` to main, tags it, and starts the release. Refuses an existing tag. |
| `.github/workflows/release.yml` | On a `v*` tag (or the dispatch above): builds Windows x64, macOS Apple Silicon and macOS Intel into a **draft** release, then a second job uploads `SHA256SUMS.txt` and writes the notes: download guide, `feat`/`fix`/`perf` commits since the last published tag, and GitHub's generated PR list. Signs updater bundles once Phase 4 is on. |
| `scripts/bump-version.mjs` | The same bump, runnable locally: `node scripts/bump-version.mjs patch`. |

Flow: merge work into main → Actions → Bump version → wait ~20 min → open the draft release → Publish. The website and the in-app check only see published releases.

If main has branch protection that blocks the bot's push, either allow GitHub Actions to bypass it or bump locally with the script and push the tag yourself.

Later (not in this plan): code signing (Windows Authenticode certificate, Apple Developer ID + notarization) removes the SmartScreen and Gatekeeper prompts; both need paid certificates.

---

## 4. Website on Vercel

`site/` is plain HTML, CSS and one script, with no build step.

1. vercel.com → Add New → Project → import `Hamoi1/sajda`.
2. **Root Directory:** `site`. Framework preset: **Other**. Leave Build Command and Output Directory empty.
3. Deploy. Every push to main redeploys; PRs get preview links.
4. Optional: Settings → Domains → add your domain.

What the page does:
- English, Kurdish (RTL) and Arabic (RTL) from the language switch; remembers the choice; picks the browser's language on the first visit.
- Detects Windows or macOS for the main button.
- Reads the latest **published** release from the GitHub API and points each button at the exact installer, with file name and size. Until a release is published (or if the API is unreachable) every button links to the releases page.
- `/download` redirects to the latest release, a short link to share.
- Screenshots come from `docs/`; replace `site/assets/*.png` after Phase 7.
