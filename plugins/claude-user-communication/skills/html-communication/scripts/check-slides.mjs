#!/usr/bin/env node
// Optional browser layout check for the slide presentation. Existing four-layer validation stays dependency-free.
// HTML_COMMUNICATION_PLAYWRIGHT_MODULE may point to an installed Playwright module.
// Exit 0: fits; 1: layout findings; 2: missing browser/module/file or runtime error.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const files = process.argv.slice(2);
if (!files.length) { console.error("usage: check-slides.mjs <page.html>..."); process.exit(2); }
let browser;
try {
  const module = await import(process.env.HTML_COMMUNICATION_PLAYWRIGHT_MODULE || "playwright");
  browser = await module.chromium.launch();
  const results = [];
  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    if (!html.includes('data-presentation="slides"')) continue;
    const findings = [];
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const errors = []; page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(pathToFileURL(path.resolve(file)).href);
      await page.waitForFunction(() => document.body.dataset.view === "deck");
      await page.evaluate(() => document.fonts.ready);
      // Wait for the layout observer after fonts and images settle.
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const measured = await page.evaluate(() => {
        const frames = Array.from(document.querySelectorAll('.slide-frame'));
        return frames.map((frame) => {
          const current = frame.classList.contains('is-current'); frame.classList.add('is-current');
          const slide = frame.querySelector('.slide'); const rect = slide.getBoundingClientRect();
          const result = { slide: Number(slide.dataset.slide), overflow: slide.hasAttribute('data-overflow'), ratio: rect.width / rect.height, outside: rect.left < -1 || rect.right > innerWidth + 1 };
          if (!current) frame.classList.remove('is-current'); return result;
        });
      });
      for (const item of measured) {
        if (item.overflow) findings.push({ check: "slide-overflow", slide: item.slide, width, message: "内容が1280×720の余白を含む表示領域に収まらない。内容を分割する" });
        if (Math.abs(item.ratio - 16 / 9) > .001 || item.outside) findings.push({ check: "slide-geometry", slide: item.slide, width, message: "16:9または端末幅を保持していない" });
      }
      for (const error of errors) findings.push({ check: "slide-runtime", width, message: error });
      await page.close();
    }
    if (findings.length) results.push({ file, findings });
  }
  const total = results.reduce((sum, result) => sum + result.findings.length, 0);
  console.log(JSON.stringify({ total, results }, null, 2));
  process.exitCode = total ? 1 : 0;
} catch (error) {
  console.error(`スライドのブラウザ検査を実行できない: ${error.message}. Playwright と Chromium を導入し、必要なら HTML_COMMUNICATION_PLAYWRIGHT_MODULE で module を指定する`);
  process.exitCode = 2;
} finally { if (browser) await browser.close(); }
