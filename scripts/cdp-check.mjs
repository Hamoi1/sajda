import { chromium } from "playwright-core";
const browser = await chromium.connectOverCDP("http://localhost:9223");
const pages = browser.contexts().flatMap((c) => c.pages());
let main = null;
for (const p of pages) {
  const nav = await p.getByRole("navigation", { name: "بەشەکان" }).count();
  if (nav > 0) main = p;
}
await main.getByRole("button", { name: "ڕێکخستنەکان" }).click();
await main.waitForTimeout(250);
const dlg = main.getByRole("dialog", { name: "ڕێکخستنەکان" });
await dlg.getByRole("button", { name: "گشتی" }).click();
await dlg.locator("label", { hasText: "تاریک" }).first().click();
await main.keyboard.press("Escape");
await main.waitForTimeout(2500);
await main.getByRole("button", { name: "سەرەکی" }).click();
await main.waitForTimeout(400);
await main.screenshot({ path: "F:/Projects/company_project/sajda/docs/screenshot-main.png" });
// restore system
await main.getByRole("button", { name: "ڕێکخستنەکان" }).click();
await main.waitForTimeout(250);
const dlg2 = main.getByRole("dialog", { name: "ڕێکخستنەکان" });
await dlg2.getByRole("button", { name: "گشتی" }).click();
await dlg2.locator("label", { hasText: "وەک سیستەم" }).first().click();
await main.keyboard.press("Escape");
console.log("dark hero captured, theme restored to system");
await browser.close();
