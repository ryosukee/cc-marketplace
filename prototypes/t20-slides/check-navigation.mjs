import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.HTML_COMMUNICATION_PLAYWRIGHT_MODULE || '/Users/ryosuke/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs');
const base = process.env.T20_NAV_BASE || 'https://mac-mini.hake-tarpon.ts.net/';
const results = [];
const browser = await chromium.launch();
try {
  for (const engine of ['native']) for (const colorScheme of ['light', 'dark']) for (const initialWidth of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width: initialWidth, height: 900 }, colorScheme });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL(engine === 'native' ? 'ccm-r017.html' : 'ccm-r019.html', base).href);
    const index = () => page.evaluate(engine => engine === 'native'
      ? Number(document.querySelector('#native-page').textContent.split('/')[0]) - 1
      : Reveal.getIndices().h, engine);
    let desktopVisits = 0;
    for (const width of [initialWidth, 1440, 390, 1440, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForFunction(reading => document.documentElement.classList.contains('reading-mode') === reading, width <= 700);
      if (width <= 700) {
        for (let i = 0; i < 4; i++) {
          const slide = page.locator('section.canvas').nth(i);
          assert.equal(await slide.isVisible(), true);
          assert.equal(await slide.evaluate(el => el.hasAttribute('inert') || el.getAttribute('aria-hidden') === 'true'), false);
        }
        if (engine === 'reveal') assert.equal(await page.locator('.navigate-right').count(), 0);
        continue;
      }
      if (engine === 'reveal') await page.waitForFunction(() => Reveal.isReady());
      await page.waitForTimeout(300);
      assert.equal(await index(), 0, '戻した画面でも選択ページを保持する');
      const next = page.locator(engine === 'native' ? '#native-next' : '.navigate-right');
      const prev = page.locator(engine === 'native' ? '#native-prev' : '.navigate-left');
      await next.click();
      await page.waitForTimeout(300);
      assert.equal(await index(), 1, '実ボタンで2枚目へ進む');
      assert.equal(await page.locator('section.canvas').nth(1).isVisible(), true);
      if (engine === 'native') assert.equal(await page.locator('section.canvas').nth(0).isVisible(), false);
      await prev.click();
      await page.waitForTimeout(300);
      assert.equal(await index(), 0, '実ボタンで1枚目へ戻る');
      await next.focus();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);
      assert.equal(await index(), 1, 'ボタンにフォーカスがあっても右キーで進む');
      await page.locator('section.canvas').nth(1).locator('.detail-open').click();
      assert.equal(await page.locator('#detail-dialog').evaluate(el => el.open), true);
      await page.keyboard.press('ArrowRight');
      assert.equal(await index(), 1, '詳細の表示中にはページを送らない');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#detail-dialog').evaluate(el => el.open), false);
      await prev.click();
      await page.waitForTimeout(300);
      assert.equal(await index(), 0);
      desktopVisits++;
    }
    assert.deepEqual(errors, []);
    results.push({ engine, colorScheme, initialWidth, desktopVisits, buttons: true, keyboard: true, dialog: true, resizeBothWays: true, errors });
    await page.close();
  }
} finally { await browser.close(); }
fs.writeFileSync(fileURLToPath(new URL('./navigation-verification.json', import.meta.url)), JSON.stringify({ base, results }, null, 2) + '\n');
console.log(JSON.stringify({ success: true, groups: results.length, base }));
