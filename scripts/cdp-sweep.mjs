import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const OUT = "C:/Users/ihama/AppData/Local/Temp/sajda-shots/final";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.connectOverCDP("http://localhost:9223");
const pages = browser.contexts().flatMap((c) => c.pages());
let main = null, widget = null;
for (const p of pages) {
  const isWidget = await p.evaluate(() => document.documentElement.dataset.window === "widget").catch(() => false);
  const nav = await p.getByRole("navigation", { name: "بەشەکان" }).count();
  if (isWidget) widget = p; else if (nav > 0) main = p;
}
// close leftover dialog
const openDlg = main.getByRole("dialog", { name: "ڕێکخستنەکان" });
if ((await openDlg.count()) > 0) { await main.keyboard.press("Escape"); await main.waitForTimeout(300); }
const errors = [];
main.on("pageerror", (e) => errors.push(e.message));

const setTheme = (t) => main.evaluate((v) => document.documentElement.setAttribute("data-theme", v), t);

for (const theme of ["dark", "light"]) {
  await setTheme(theme);
  await main.waitForTimeout(350);
  await main.getByRole("button", { name: "سەرەکی" }).click();
  await main.waitForTimeout(300);
  await main.screenshot({ path: `${OUT}/home-${theme}.png` });
  await main.getByRole("button", { name: "ئەذکار" }).click();
  await main.waitForTimeout(300);
  await main.screenshot({ path: `${OUT}/azkar-${theme}.png` });
  await main.getByRole("button", { name: "تەسبیح" }).click();
  await main.waitForTimeout(250);
  await main.screenshot({ path: `${OUT}/tasbih-${theme}.png` });
  // settings: widget + reader pages
  await main.getByRole("button", { name: "ڕێکخستنەکان" }).click();
  await main.waitForTimeout(250);
  const dlg = main.getByRole("dialog", { name: "ڕێکخستنەکان" });
  await dlg.getByRole("button", { name: "ویجێت" }).click();
  await main.waitForTimeout(350);
  await main.screenshot({ path: `${OUT}/settings-widget-${theme}.png` });
  await dlg.getByRole("button", { name: "خوێندنەوەی قورئان" }).click();
  await main.waitForTimeout(250);
  await main.screenshot({ path: `${OUT}/settings-reader-${theme}.png` });
  await main.keyboard.press("Escape");
  await main.waitForTimeout(250);
}
if (widget) { await setTheme("dark"); await widget.waitForTimeout(300); await widget.screenshot({ path: `${OUT}/widget-dark.png` }); await setTheme("light"); await widget.waitForTimeout(300); await widget.screenshot({ path: `${OUT}/widget-light.png` }); }
console.log("sweep done. errors:", errors.length ? errors : "none");
await browser.close();
