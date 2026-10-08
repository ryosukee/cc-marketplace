import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { createFixture, source } from "./slides-fixture.mjs";
let playwright;
try { playwright = await import(process.env.HTML_COMMUNICATION_PLAYWRIGHT_MODULE || "playwright"); }
catch (error) { if (error.code !== "ERR_MODULE_NOT_FOUND") throw error; }
const skip = !playwright && "Playwright 未導入";
async function fixture(t, sources = [source]) {
  const dir = createFixture(t, sources);
  const browser = await playwright.chromium.launch(); t.after(() => browser.close());
  return { browser, dir, url: (src = source) => pathToFileURL(path.join(dir, src.file + ".html")).href };
}
async function at(page, n) { assert.equal(await page.locator('.slide-frame.is-current .slide').getAttribute('data-slide'), String(n)); }

test("deck は明暗と狭幅で16:9を保ち、前後・端点・全要点を操作できる", { skip }, async (t) => {
  const { browser, url } = await fixture(t);
  for (const width of [320, 390, 1440, 2100]) for (const colorScheme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme });
    const page = await context.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(url()); await page.waitForTimeout(200);
    await at(page, 1);
    const box = await page.locator('.slide-frame.is-current .slide').boundingBox();
    assert.ok(Math.abs(box.width / box.height - 16/9) < .001);
    assert.ok(box.x >= 0 && box.x + box.width <= width);
    assert.equal(await page.locator('#slide-prev').isDisabled(), true);
    assert.equal(await page.locator('#slide-fit-warning').isVisible(), false);
    await page.locator('#back').focus(); await page.keyboard.press('ArrowRight'); await at(page, 2);
    assert.equal(await page.locator('.slide-step[data-unrevealed]').count(), 2);
    await page.keyboard.press('ArrowRight'); await at(page, 2);
    assert.equal(await page.locator('.slide-step[data-unrevealed]').count(), 1);
    await page.keyboard.press('ArrowRight'); await at(page, 2);
    assert.equal(await page.locator('.slide-step[data-unrevealed]').count(), 0);
    await page.keyboard.press('ArrowRight'); await at(page, 3);
    await page.keyboard.press('ArrowLeft'); await at(page, 2);
    await page.keyboard.press('ArrowLeft'); assert.equal(await page.locator('.slide-step[data-unrevealed]').count(), 1);
    await page.locator('#slide-static').click();
    assert.equal(await page.locator('.slide-step[data-unrevealed]').count(), 0);
    assert.equal(await page.locator('body').getAttribute('data-motion'), 'off');
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
    await at(page, 5); assert.equal(await page.locator('#slide-next').isDisabled(), true);
    await page.locator('#slide-reading').click();
    assert.equal(await page.locator('.slide-frame').evaluateAll((els) => els.every((el) => el.getClientRects().length)), true);
    assert.equal(await page.locator('#slide-next').isDisabled(), true);
    await page.locator('#slide-reading').click(); await at(page, 5);
    await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 900 });
    await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth);
    const changed = await page.locator('.slide-frame.is-current .slide').boundingBox();
    assert.ok(Math.abs(changed.width / changed.height - 16/9) < .001);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []); await context.close();
  }
});

test("詳細・脚注・図の補足・入力中のキーはdeckと競合しない", { skip }, async (t) => {
  const { browser, url } = await fixture(t); const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url()); await page.locator('#slide-next').click();
  const detail = page.locator('.detail-link'); await detail.focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('#detail-viewer').evaluate((el) => el.open), true);
  await page.keyboard.press('ArrowRight'); await at(page, 2);
  assert.match(await page.locator('#detail-viewer-body').textContent(), /根拠の全文/);
  await page.locator('#detail-viewer-body .fnref a').click();
  assert.match(await page.locator('#reading-popup-body').textContent(), /検証の出典/);
  await page.keyboard.press('ArrowRight'); await at(page, 2);
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement.matches('.detail-link'));
  await page.keyboard.press('ArrowRight'); assert.equal(await page.locator('.slide-step[data-unrevealed]').count(), 1);
  const ref = page.locator('.slide-frame.is-current .slide > p .fnref a'); await ref.click();
  assert.equal(await page.locator('#reading-popup').isVisible(), true);
  await page.keyboard.press('ArrowRight'); await at(page, 2);
  await page.keyboard.press('Escape');
  await page.evaluate(() => { const input = document.createElement('input'); document.querySelector('.slide-frame.is-current .slide').append(input); input.focus(); });
  await page.keyboard.press('ArrowRight'); assert.equal(await page.locator('.slide-step[data-unrevealed]').count(), 1);
  await page.evaluate(() => document.querySelector('.slide input').remove());
  await page.locator('#slide-static').click(); await page.locator('#slide-next').click(); await at(page, 3);
  const note = page.locator('.figure-note > summary'); await note.focus(); await page.keyboard.press('Space');
  assert.equal(await page.locator('#reading-popup').isVisible(), true); await page.keyboard.press('ArrowRight'); await at(page, 3);
  await page.keyboard.press('Escape');
});

test("OS reduce・JSなし・印刷は全枚と全要点と詳細全文を読める", { skip }, async (t) => {
  const { browser, url } = await fixture(t);
  const reduced = await browser.newContext({ reducedMotion: 'reduce' }); const page = await reduced.newPage();
  await page.goto(url()); await page.locator('#slide-next').click();
  assert.equal(await page.locator('.slide-step[data-unrevealed]').count(), 0);
  assert.equal(await page.locator('body').getAttribute('data-motion'), 'off');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => document.querySelectorAll('.slide-step[data-unrevealed]').length === 2);
  await page.locator('.detail-link').click();
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint'))); await page.emulateMedia({ media: 'print' });
  assert.equal(await page.locator('.slide-frame').evaluateAll((els) => els.every((el) => el.getClientRects().length && !el.inert)), true);
  assert.equal(await page.locator('.slide-step').evaluateAll((els) => els.every((el) => getComputedStyle(el).visibility === 'visible' && !el.inert)), true);
  assert.equal(await page.locator('#bd #detail-1').isVisible(), true);
  assert.equal(await page.locator('#fn-pane').isVisible(), true);
  assert.equal(await page.locator('.figure-note-body').isVisible(), true);
  await page.emulateMedia({ media: 'screen' }); await page.evaluate(() => window.dispatchEvent(new Event('afterprint'))); await at(page, 2);
  assert.equal(await page.locator('.slide-step[data-unrevealed]').count(), 2); await reduced.close();
  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } }); const plain = await noJS.newPage();
  await plain.goto(url());
  assert.equal(await plain.locator('.slide-frame').evaluateAll((els) => els.every((el) => el.getClientRects().length)), true);
  assert.equal(await plain.locator('.slide-step').evaluateAll((els) => els.every((el) => getComputedStyle(el).visibility === 'visible')), true);
  assert.equal(await plain.locator('#detail-1').isVisible(), true); assert.equal(await plain.locator('#fn-pane').isVisible(), true);
  assert.equal(await plain.locator('.slide-tools').isVisible(), false); await noJS.close();
});

test("大量本文・横幅超過・後ろの枚のoverflowを隠さず検知する", { skip }, async (t) => {
  const overflow = { ...source, file: 'test-r033', sections: [{ kind: 'explain', heading: '大きすぎる内容', blocks: Array.from({ length: 20 }, () => '長い説明を分割して確認する。[^source]') }] };
  // Keep the figure in this source so fixture templates all remain used.
  overflow.sections.push(source.sections[1]);
  overflow.sections.push({ kind: 'explain', heading: '横に長い内容', blocks: [{ pre: 'large'.repeat(400), step: 1 }] });
  const { browser, url } = await fixture(t, [overflow]); const page = await browser.newPage(); await page.goto(url(overflow)); await page.waitForTimeout(200);
  assert.equal(await page.locator('#slide-fit-warning').isVisible(), true);
  assert.equal(await page.locator('.slide[data-slide="2"]').getAttribute('data-overflow'), '');
  assert.equal(await page.locator('.slide[data-slide="4"]').getAttribute('data-overflow'), '');
  const checker = new URL('../skills/html-communication/scripts/check-slides.mjs', import.meta.url);
  const checked = spawnSync(process.execPath, [checker.pathname, new URL(url(overflow)).pathname], { encoding: 'utf8', env: process.env });
  assert.equal(checked.status, 1, checked.stderr);
  const result = JSON.parse(checked.stdout);
  assert.ok(result.results[0].findings.some((f) => f.check === 'slide-overflow' && f.slide === 4));
  await page.locator('#slide-reading').click();
  assert.equal(await page.locator('.slide[data-slide="2"] > p').count(), 21);
  assert.equal(await page.locator('.slide[data-slide="2"] > p').last().isVisible(), true);
});


test("初期fragmentと履歴から該当枚へ移り、参照先の段階要点を開く", { skip }, async (t) => {
  const src = { ...source, file: 'test-r034', sections: [{ ...source.sections[0], blocks: [
    ...source.sections[0].blocks,
    { ul: ['参照先の要点。[^later]'], step: 3 },
  ] }, source.sections[1]], footnotes: { ...source.footnotes, later: '後の要点の出典。' } };
  const { browser, url } = await fixture(t, [src]); const page = await browser.newPage();
  await page.goto(url(src) + '#s-e2'); await at(page, 3);
  await page.evaluate(() => { location.hash = '#fnref-2-1'; });
  await page.waitForFunction(() => document.querySelector('.slide-frame.is-current .slide').dataset.slide === '2');
  assert.equal(await page.locator('.slide-step[data-unrevealed]').count(), 0);
  assert.equal(await page.locator('#fnref-2-1').isVisible(), true);
  await page.goBack(); await at(page, 3);
  await page.goForward(); await at(page, 2);
  await page.locator('#fnref-2-1 a').click();
  assert.equal(await page.locator('#reading-popup').isVisible(), true);
  assert.match(await page.locator('#reading-popup-body').textContent(), /後の要点の出典/);
  assert.equal(new URL(page.url()).hash, '#fnref-2-1'); await at(page, 2);
});

test("階層の開閉・内容変更で収まりを再検査し、詳細と図の補足は競合しない", { skip }, async (t) => {
  const src = { ...source, file: 'test-r035', sections: [{ ...source.sections[0], blocks: [
    { tree: [{ text: '内訳を開く', blocks: Array.from({ length: 15 }, () => '工程の詳しい説明。[^source]') }] },
    source.sections[0].blocks[3],
  ] }, source.sections[1]] };
  const { browser, url } = await fixture(t, [src]); const page = await browser.newPage(); await page.goto(url(src));
  await page.locator('#slide-next').click();
  const tree = page.locator('.slide-frame.is-current .tree-branch');
  assert.equal(await page.locator('#slide-fit-warning').isVisible(), false);
  await tree.locator(':scope > summary').click();
  await page.waitForFunction(() => document.querySelector('.slide[data-slide="2"]').hasAttribute('data-overflow'));
  assert.equal(await page.locator('#slide-fit-warning').isVisible(), true);
  await tree.locator(':scope > summary').click();
  await page.waitForFunction(() => !document.querySelector('.slide[data-slide="2"]').hasAttribute('data-overflow'));
  assert.equal(await page.locator('#slide-fit-warning').isVisible(), false);
  await page.locator('.detail-link').click();
  assert.equal(await page.locator('#detail-viewer').evaluate((el) => el.open), true);
  await page.waitForTimeout(100); assert.equal(await page.locator('#slide-fit-warning').isVisible(), false);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('#detail-viewer').open);
  await page.locator('#slide-next').click();
  await page.locator('.figure-note > summary').click();
  assert.equal(await page.locator('#reading-popup').isVisible(), true);
  await page.waitForTimeout(100); assert.equal(await page.locator('#slide-fit-warning').isVisible(), false);
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    const block = document.createElement('p'); block.id = 'new-content'; block.textContent = '追加の説明。'.repeat(300);
    document.querySelector('.slide-frame.is-current .slide').append(block);
  });
  await page.waitForFunction(() => document.querySelector('.slide[data-slide="3"]').hasAttribute('data-overflow'));
  await page.evaluate(() => document.querySelector('#new-content').remove());
  await page.waitForFunction(() => !document.querySelector('.slide[data-slide="3"]').hasAttribute('data-overflow'));
  assert.equal(await page.locator('#slide-fit-warning').isVisible(), false);
});


test("狭幅で読む表示とfragmentの見出しが折り返した操作バーの下に見える", { skip }, async (t) => {
  const { browser, url } = await fixture(t); const page = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  await page.goto(url() + '#s-e2'); await at(page, 3);
  async function clearHeading(id) {
    await page.waitForFunction((headingId) => {
      const heading = document.getElementById(headingId).getBoundingClientRect();
      const tools = document.querySelector('.slide-tools').getBoundingClientRect();
      return heading.top >= tools.bottom && heading.bottom <= innerHeight;
    }, id);
  }
  await clearHeading('s-e2');
  await page.evaluate(() => { location.hash = '#s-e1'; });
  await page.waitForFunction(() => document.querySelector('.slide-frame.is-current .slide').dataset.slide === '2');
  await page.locator('#slide-reading').click(); await clearHeading('s-e1');
  await page.setViewportSize({ width: 320, height: 844 });
  await page.evaluate(() => { location.hash = '#s-e2'; });
  await clearHeading('s-e2');
  await page.locator('#slide-reading').click(); await at(page, 3); await clearHeading('s-e2');
});
