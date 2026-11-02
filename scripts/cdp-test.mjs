import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const OUT = "C:/Users/ihama/AppData/Local/Temp/sajda-shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.connectOverCDP("http://localhost:9223");
const pages = browser.contexts().flatMap((c) => c.pages());
let main = null, widget = null;
for (const p of pages) {
  const isWidget = await p.evaluate(() => document.documentElement.dataset.window === "widget").catch(() => false);
  const nav = await p.getByRole("navigation", { name: "بەشەکان" }).count();
  if (isWidget) widget = p;
  else if (nav > 0) main = p;
}
if (!main) { console.log("main window not found"); process.exit(1); }
const errors = [];

// close any dialog left open from a previous run
const openDlg = main.getByRole("dialog", { name: "ڕێکخستنەکان" });
if ((await openDlg.count()) > 0 && (await openDlg.getAttribute("open")) !== null) {
  await main.keyboard.press("Escape");
  await main.waitForTimeout(300);
}
main.on("pageerror", (e) => errors.push(e.message));

// 1. azkar categories still fine after text polish
await main.getByRole("button", { name: "ئەذکار" }).click();
await main.waitForTimeout(300);
for (const cat of ["ئێواران", "گشتی", "بەیانیان"]) {
  await main.getByRole("button", { name: cat }).click();
  await main.waitForTimeout(200);
}
console.log("azkar categories OK");

// 2. home (new band) — currently light theme from last test run
await main.getByRole("button", { name: "سەرەکی" }).click();
await main.waitForTimeout(400);
await main.screenshot({ path: `${OUT}/v2-home-light.png` });

// 3. settings — sound page with the adhan voice picker + switch toggles
await main.getByRole("button", { name: "ڕێکخستنەکان" }).click();
await main.waitForTimeout(300);
const dlg = main.getByRole("dialog", { name: "ڕێکخستنەکان" });
await dlg.getByRole("button", { name: "دەنگ" }).click();
await main.waitForTimeout(300);
await main.screenshot({ path: `${OUT}/v2-settings-sound.png` });
await dlg.getByRole("button", { name: "سیستەم" }).click();
await main.waitForTimeout(200);
await main.screenshot({ path: `${OUT}/v2-settings-system.png` });
await main.keyboard.press("Escape");
await main.waitForTimeout(200);

// 4. dark mode with the new band
await main.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
await main.waitForTimeout(400);
await main.screenshot({ path: `${OUT}/v2-home-dark.png` });
await main.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
await main.waitForTimeout(200);

if (widget) await widget.screenshot({ path: `${OUT}/v2-widget.png` });
console.log("errors:", errors.length ? errors : "none");
await browser.close();
