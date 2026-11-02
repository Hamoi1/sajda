import { chromium } from "playwright-core";
const OUT = "F:/Projects/company_project/sajda/docs";
const browser = await chromium.connectOverCDP("http://localhost:9223");
const pages = browser.contexts().flatMap((c) => c.pages());
let main = null, widget = null;
for (const p of pages) {
  const isWidget = await p.evaluate(() => document.documentElement.dataset.window === "widget").catch(() => false);
  const nav = await p.getByRole("navigation", { name: "بەشەکان" }).count();
  if (isWidget) widget = p; else if (nav > 0) main = p;
}
if (!main) { console.log("main not found"); process.exit(1); }
const dlgOpen = main.getByRole("dialog", { name: "ڕێکخستنەکان" });
if ((await dlgOpen.count()) > 0) { await main.keyboard.press("Escape"); await main.waitForTimeout(300); }
const errors = [];
main.on("pageerror", (e) => errors.push(e.message));
const setTheme = (t) => main.evaluate((v) => { /* noop marker */ }, t);

// DARK home (store theme is system → currently dark)
await main.getByRole("button", { name: "سەرەکی" }).click();
await main.waitForTimeout(2600);
await main.screenshot({ path: `${OUT}/screenshot-main.png` });

// AZKAR dark
await main.getByRole("button", { name: "ئەذکار" }).click();
await main.waitForTimeout(400);
await main.screenshot({ path: `${OUT}/screenshot-azkar.png` });

// TASBIH dark + a few taps
await main.getByRole("button", { name: "تەسبیح" }).click();
await main.waitForTimeout(300);
await main.screenshot({ path: `${OUT}/screenshot-tasbih.png` });

// SETTINGS times page
await main.getByRole("button", { name: "ڕێکخستنەکان" }).click();
await main.waitForTimeout(350);
await main.screenshot({ path: `${OUT}/screenshot-settings.png` });
const dlg = main.getByRole("dialog", { name: "ڕێکخستنەکان" });
await dlg.getByRole("button", { name: "ویجێت" }).click();
await main.waitForTimeout(450);
await main.screenshot({ path: `${OUT}/screenshot-settings-widget.png` });
await main.keyboard.press("Escape");
await main.waitForTimeout(250);

// LIGHT home: toggle via settings → general → ڕووناک, then back to system
await main.getByRole("button", { name: "ڕێکخستنەکان" }).click();
await main.waitForTimeout(250);
await dlg.getByRole("button", { name: "گشتی" }).click();
await dlg.locator("label", { hasText: "ڕووناک" }).first().click();
await main.keyboard.press("Escape");
await main.waitForTimeout(2500);
await main.getByRole("button", { name: "سەرەکی" }).click();
await main.waitForTimeout(400);
await main.screenshot({ path: `${OUT}/screenshot-home-light.png` });
// restore system
await main.getByRole("button", { name: "ڕێکخستنەکان" }).click();
await main.waitForTimeout(250);
await dlg.getByRole("button", { name: "گشتی" }).click();
await dlg.locator("label", { hasText: "وەک سیستەم" }).first().click();
await main.keyboard.press("Escape");
await main.waitForTimeout(300);

// WIDGET
if (widget) await widget.screenshot({ path: `${OUT}/screenshot-widget.png` });
console.log("shots done. errors:", errors.length ? errors : "none");
await browser.close();
