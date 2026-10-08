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
  for (const file of ["demo-r001", "demo-f001", "demo-r002", "demo-f002"]) {
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
  await go("demo-f002");
  const code = page.locator('#rich-reservation-code');
  await shot("code", code);
  await code.locator('[data-code-note="42"]').click();
  // The annotation is positioned outside the code block. Include both without
  // taking the entire, vertically long form.
  await page.mouse.move(0, 0);
  const noteClip = await page.evaluate(() => {
    const code = document.querySelector('#rich-reservation-code').getBoundingClientRect();
    const note = document.querySelector('.code-note.is-code-popup').getBoundingClientRect();
    const x = Math.max(0, Math.min(code.left, note.left) - 12);
    const y = Math.max(0, Math.min(code.top, note.top) - 12);
    return { x, y, width: Math.min(innerWidth - x, Math.max(code.right, note.right) - x + 12), height: Math.min(innerHeight - y, Math.max(code.bottom, note.bottom) - y + 12) };
  });
  await page.screenshot({ path: path.join(output, 'code-note.png'), clip: noteClip });
  await page.locator('.code-note.is-code-popup [data-code-note-close]').click();
  await page.setViewportSize({ width: 1700, height: 960 });
  await shot("code-diff", page.locator('#rich-reservation-diff'));
  await page.setViewportSize({ width: 1440, height: 1600 });
  const proposals = page.locator('#rich-schedule-proposal');
  const reserve = proposals.locator('[data-node="reserve"] > .call-card');
  await reserve.locator('[data-proposal-toggle]').click();
  await reserve.locator('[data-feedback-note]').fill('保存に失敗したら、予約済みと表示しないでください。');
  const existing = proposals.locator('[data-node="validate"] > .call-card');
  await existing.locator('[data-proposal-toggle]').click();
  await existing.locator('[data-feedback-note]').fill('空白だけの本文も検査で拒否してください。');
  await shot("call-proposal", proposals);
  const rejection = page.locator('#rich-schedule-rejection');
  const reject = rejection.locator('[data-node="reserve"] > .call-card');
  await reject.locator('[data-reject-toggle]').click();
  await reject.locator('[data-feedback-note]').fill('まず即時送信を維持し、予約送信は別に検討します。');
  assert.equal(await rejection.locator('[data-call-count]').textContent(), '0');
  assert.equal(await rejection.locator('[data-file-count]').textContent(), '0');
  await shot("call-rejection", rejection);
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await go("demo-r002");
  await page.waitForSelector(".slide-frame.is-current");
  await shot("slides");
  await page.locator("#slide-next").click();
  await page.waitForTimeout(350);
  await page.locator(".slide-frame.is-current .detail-link").click();
  await shot("slide-detail", page.locator("#detail-viewer[open]"));
  await page.keyboard.press("Escape");
  await page.locator("#slide-next").click();
  await page.waitForTimeout(350);
  assert.equal(await page.locator('.slide-frame.is-current .slide-step[data-unrevealed]').count(), 2);
  await shot("slide-steps-before");
  await page.locator("#slide-next").click();
  await page.waitForTimeout(350);
  assert.equal(await page.locator('.slide-frame.is-current .slide-step[data-unrevealed]').count(), 1);
  await shot("slide-steps-after");
  assert.equal(await page.locator(".slide[data-overflow]").count(), 0, "機能紹介の全枚が固定の枠に収まる");
  assert.deepEqual(errors, []);
  console.log(`README images: ${output}`);
} finally {
  await browser?.close();
  fs.rmSync(temp, { recursive: true, force: true });
}
