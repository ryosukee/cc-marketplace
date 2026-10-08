#!/usr/bin/env node
// README の画像を、現行実装と機能紹介用の生成元から撮り直す。開発時だけ Playwright が必要。
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assemblePage } from "../skills/html-communication/scripts/lib/assemble.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = await import(process.env.HTML_COMMUNICATION_PLAYWRIGHT_MODULE || "playwright");
const output = path.join(root, "docs", "images");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "html-features-"));
let browser;
try {
  fs.mkdirSync(path.join(temp, "src"));
  for (const name of fs.readdirSync(path.join(root, "docs/features"))) {
    fs.copyFileSync(path.join(root, "docs/features", name), path.join(temp, "src", name));
  }
  for (const file of ["demo-r001", "demo-f001"]) {
    const result = assemblePage(path.join(temp, "src", `${file}.json`));
    assert.equal(result.ok, true, JSON.stringify(result.findings));
  }
  fs.mkdirSync(output, { recursive: true });
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, colorScheme: "light", reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const go = async (file) => {
    await page.goto(`file://${path.join(temp, `${file}.html`)}`);
    await page.evaluate(() => document.fonts.ready);
  };
  const shot = async (name, locator) => {
    await page.mouse.move(0, 0);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (locator) await locator.screenshot({ path: path.join(output, `${name}.png`) });
    else await page.screenshot({ path: path.join(output, `${name}.png`) });
  };
  await go("demo-r001");
  await shot("report");
  await page.locator(".detail-link").first().click();
  await shot("detail", page.locator("#detail-viewer[open]"));
  await page.keyboard.press("Escape");
  const hierarchy = page.locator(".detail-tree").first();
  await hierarchy.locator("summary").first().click();
  await hierarchy.locator("summary").nth(1).click();
  await shot("hierarchy", hierarchy);
  await page.locator(".figure-note > summary").first().click();
  await shot("diagram-note");
  await page.keyboard.press("Escape");
  await page.locator(".fnref a").last().click();
  await shot("footnote");
  await page.keyboard.press("Escape");
  await page.locator("#fn-toggle").click();
  await shot("footnote-pane");
  await go("demo-f001");
  const card = page.locator('.qd[data-for="q1"]');
  if (!await card.evaluate((el) => el.open)) await card.locator("summary").click();
  await page.locator('#q1 input[value="公開資料から調べる"]').check();
  await page.locator("#answer-menu-toggle").click();
  await page.locator("#free").fill("機能紹介用の回答例です。狭い画面でも操作を確認します。");
  await shot("answers");
  assert.deepEqual(errors, []);
  console.log(`README images: ${output}`);
} finally {
  await browser?.close();
  fs.rmSync(temp, { recursive: true, force: true });
}
