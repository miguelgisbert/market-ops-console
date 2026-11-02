import fs from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.WALKTHROUGH_URL ?? "https://market-ops-console.vercel.app";
const output = "public/walkthrough.webm";

fs.mkdirSync("public", { recursive: true });
fs.rmSync(output, { force: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: "/tmp/opencode/walkthrough-recording", size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
const video = page.video();

async function caption(text) {
  await page.evaluate((value) => {
    let element = document.getElementById("walkthrough-caption");
    if (!element) {
      element = document.createElement("div");
      element.id = "walkthrough-caption";
      document.body.appendChild(element);
    }
    element.textContent = value;
    Object.assign(element.style, {
      position: "fixed",
      left: "24px",
      bottom: "24px",
      zIndex: "99999",
      maxWidth: "720px",
      background: "oklch(0.19 0.025 255)",
      color: "oklch(0.985 0.004 245)",
      fontFamily: "Bricolage Grotesque, sans-serif",
      fontSize: "17px",
      fontWeight: "600",
      lineHeight: "1.35",
      padding: "12px 16px",
      border: "1px solid oklch(1 0 0 / 15%)",
      boxShadow: "0 10px 30px oklch(0 0 0 / 20%)",
    });
  }, text);
}

async function wait(ms) {
  await page.waitForTimeout(ms);
}

await page.goto(baseUrl);
await wait(800);
await caption("Market Ops — portfolio health at a glance");
await wait(3200);

await page.locator('a[href="/analyst?market=de"]').first().click();
await wait(1200);
await caption("Drill from portfolio to a market without losing context");
await wait(2600);

await page.evaluate(() =>
  document.querySelector("#timeseries-heading")?.scrollIntoView({ behavior: "smooth" }),
);
await wait(2800);
await caption("Actual vs forecast vs prior year, with an accessible data table");
await wait(2200);

await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
await wait(1400);
const live = page.getByRole("button", { name: /Go live/ });
if (await live.count()) {
  await live.click();
  await wait(7000);
  await caption("Live mode — six-second updates, selected scope preserved");
  await wait(2200);
}

await page.keyboard.press("Control+k");
await wait(900);
await caption("Command palette — jump to any market, product or page");
await wait(2400);
await page.keyboard.press("Escape");

await page.goto(`${baseUrl}/analyst?market=de&period=2026-05`);
await wait(1200);
const ask = page.getByRole("link", { name: "Ask about this view" });
if (await ask.count()) {
  await ask.click();
  await wait(1200);
  await caption("The assistant carries the dashboard context into the conversation");
  await wait(2200);
  await page.getByRole("button", { name: "What is driving this view?" }).click();
  await wait(4200);
  await caption("Streaming answers with citations, confidence and abstention");
  await wait(2400);
}

await page.goto(`${baseUrl}/alerts`);
await wait(1000);
await page.getByLabel("Rule name").fill("Europe growth floor");
await page.getByRole("button", { name: "Save rule" }).click();
await wait(1600);
await caption("Alert rules — Zod validation, optimistic save and rollback");
await wait(2600);

await caption("Market Ops — React, Next.js, TypeScript, accessible data visualisation");
await wait(3000);

await context.close();
const videoPath = await video.path();
await browser.close();
fs.copyFileSync(videoPath, output);
const size = fs.statSync(output).size;
console.log(`Saved ${output} (${(size / 1024 / 1024).toFixed(1)} MB)`);
