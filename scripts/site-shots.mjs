// Captures the website's screenshots from the running dev server:
//   npm run dev            (in another terminal)
//   node scripts/site-shots.mjs
// Uses the installed Edge (or Chrome) through playwright-core; writes 2x PNGs to site/assets.
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const BASE = process.env.SAJDA_URL ?? "http://localhost:1420/";
const out = (name) => fileURLToPath(new URL(`../site/assets/${name}`, import.meta.url));

const settings = (patch = {}) =>
  JSON.stringify({
    state: { lang: "ckb", theme: "dark", clock: "12", onboarded: true, ...patch },
    version: 2,
  });

const browser = await chromium
  .launch({ channel: "msedge" })
  .catch(() => chromium.launch({ channel: "chrome" }));

async function page(width, height, query = "", patch = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, colorScheme: "dark" });
  await ctx.addInitScript((value) => {
    if (!sessionStorage.getItem("seeded")) {
      localStorage.clear();
      localStorage.setItem("sajda-settings", value);
      sessionStorage.setItem("seeded", "1");
    }
  }, settings(patch));
  const p = await ctx.newPage();
  await p.goto(BASE + query);
  // Let the ambient background and the view fade settle.
  await p.waitForTimeout(2800);
  return p;
}

const tab = (p, name) => p.locator(`[data-tab="${name}"]`).click();

// Home, dark
const main = await page(900, 620);
await main.screenshot({ path: out("main.png") });

// Azkar: count the first card so the done state shows
await tab(main, "azkar");
await main.waitForTimeout(400);
await main.locator("ul button").first().click();
await main.waitForTimeout(300);
await main.screenshot({ path: out("azkar.png") });

// Tasbih after seven taps
await tab(main, "tasbih");
await main.waitForTimeout(300);
const counter = main.locator("button").filter({ has: main.locator("svg circle") });
for (let i = 0; i < 7; i++) await counter.click();
await main.waitForTimeout(400);
await main.screenshot({ path: out("tasbih.png") });

// Settings, widget section
await tab(main, "home");
await main.locator("header button").nth(-3).click();
await main.waitForTimeout(300);
await main.locator("nav button").nth(2).click();
await main.waitForTimeout(500);
await main.screenshot({ path: out("settings-widget.png") });

// Home, light
const light = await page(900, 620, "", { theme: "light" });
await light.screenshot({ path: out("home-light.png") });

// First run
const first = await page(900, 620, "", { onboarded: false });
await first.screenshot({ path: out("onboarding.png") });

// Widget (transparent window, so shoot the card itself)
const widget = await page(340, 160, "?widget");
await widget.evaluate(() => {
  for (const el of [document.documentElement, document.body]) el.style.background = "transparent";
});
await widget.screenshot({ path: out("widget.png"), omitBackground: true });

await browser.close();
console.log("site screenshots written to site/assets");
