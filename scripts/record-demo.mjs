// Records the candidate panel running in the mcp-use Inspector: open the Inspector,
// run show-candidate, switch the View to fullscreen (so it stays top-aligned while
// it grows instead of re-centering), click NeoGuard, then RAISE. Writes the raw video plus
// demo.json with the moments and the panel's on-screen box, which make-gif.sh
// uses to trim and crop.
// Usage: node record-demo.mjs <inspector url> <out dir>
import { mkdirSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const [url = "http://localhost:3000/mcp/inspector", out = "out"] = process.argv.slice(2);
const SIZE = { width: 800, height: 720 };
const PAUSE = { afterRender: 3500, afterDetail: 4500 };

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: SIZE, colorScheme: "dark", recordVideo: { dir: out, size: SIZE } });
const page = await context.newPage();
const t0 = Date.now();
const at = () => (Date.now() - t0) / 1000;
const marks = {};

await page.goto(url);
await page.getByRole("button", { name: /^show-candidate/ }).click({ timeout: 30_000 });
const execute = page.getByTestId("tool-execution-execute-button");
await execute.waitFor();
await page.waitForTimeout(600);
marks.execute = at();
await execute.click();

const view = page.frameLocator('iframe[title="MCP App: show-candidate"]').frameLocator("iframe");
const panel = view.locator(".panel");
await view.getByRole("heading", { level: 1 }).waitFor({ timeout: 30_000 });

// The View toolbar's first button switches the View to fullscreen display mode.
const toolbar = await page.evaluate(() => {
  const all = [...document.querySelectorAll("main button")].map((b) => b.getBoundingClientRect());
  const locale = [...document.querySelectorAll("main button")].find((b) => b.textContent.trim() === "en-US").getBoundingClientRect();
  const first = all.filter((r) => Math.abs(r.top - locale.top) < 4).sort((a, b) => a.left - b.left)[0];
  return { x: first.left + first.width / 2, y: first.top + first.height / 2 };
});
await page.mouse.click(toolbar.x, toolbar.y);
await view.getByRole("heading", { level: 1 }).waitFor({ timeout: 30_000 });
await page.waitForTimeout(800);
marks.rendered = at();
const boxes = [await panel.boundingBox()];
// Where the NeoGuard chip sits: make-gif.sh finds the frame where it turns selected
// and trims around that, since the video clock does not match these timestamps exactly.
const neo = await view.getByRole("button", { name: "NeoGuard", exact: true }).boundingBox();
const chip = { x: Math.round(neo.x + neo.width / 2), y: Math.round(neo.y + neo.height / 2) };
await page.waitForTimeout(PAUSE.afterRender);

for (const name of ["NeoGuard", "RAISE"]) {
  marks[`click${name}`] = at();
  await view.getByRole("button", { name, exact: true }).click();
  await view.locator(".card-title", { hasText: name }).waitFor({ timeout: 15_000 });
  marks[`detail${name}`] = at();
  boxes.push(await panel.boundingBox());
  await page.waitForTimeout(PAUSE.afterDetail);
}
marks.end = at();

// The panel only grows downward, so the union of its boxes frames every moment.
const box = boxes.reduce((a, b) => ({
  x: Math.min(a.x, b.x), y: Math.min(a.y, b.y),
  right: Math.max(a.right, b.x + b.width), bottom: Math.max(a.bottom, b.y + b.height),
}), { x: Infinity, y: Infinity, right: 0, bottom: 0 });
const frameBox = await page.locator('iframe[title="MCP App: show-candidate"]').boundingBox();

await context.close();
await browser.close();
const video = readdirSync(out).find((f) => f.endsWith(".webm"));
renameSync(join(out, video), join(out, "demo.webm"));
writeFileSync(join(out, "demo.json"), JSON.stringify({ marks, panel: box, frame: frameBox, chip, hold: PAUSE.afterRender / 1000, size: SIZE }, null, 2));
console.log(JSON.stringify({ marks, panel: box, frame: frameBox }));
