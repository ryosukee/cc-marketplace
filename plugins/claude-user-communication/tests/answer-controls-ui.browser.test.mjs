import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { assemblePage } from "../skills/html-communication/scripts/lib/assemble.mjs";
import { parseAnswerText } from "../skills/html-communication/scripts/lib/page-source.mjs";

let playwright;
try { playwright = await import(process.env.HTML_COMMUNICATION_PLAYWRIGHT_MODULE || "playwright"); }
catch (error) { if (error.code !== "ERR_MODULE_NOT_FOUND") throw error; }
const source = JSON.parse(fs.readFileSync(new URL("../docs/features/demo-f003.json", import.meta.url), "utf8"));
const order = source.sections[1].question.options.map(o => o.label);
const skip = !playwright && "Playwright 未導入。HTML_COMMUNICATION_PLAYWRIGHT_MODULE で導入先を指定する";

async function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-answer-controls-ui-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, "src"));
  const json = path.join(dir, "src", `${source.file}.json`);
  const write = data => {
    fs.writeFileSync(json, JSON.stringify(data));
    const result = assemblePage(json, { force: true });
    assert.equal(result.ok, true, JSON.stringify(result.findings));
  };
  write(source);
  const server = http.createServer((_req, res) => { res.setHeader("Content-Type", "text/html; charset=utf-8"); res.end(fs.readFileSync(path.join(dir, `${source.file}.html`))); });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const browser = await playwright.chromium.launch(process.env.HTML_COMMUNICATION_BROWSER_EXECUTABLE ? { executablePath: process.env.HTML_COMMUNICATION_BROWSER_EXECUTABLE } : {});
  t.after(() => browser.close());
  return { browser, write, url: `http://127.0.0.1:${server.address().port}/${source.file}.html` };
}
async function open(page, id) {
  const card = page.locator(`.qd[data-for="${id}"]`);
  if (!await card.evaluate(el => el.open)) await card.locator("summary").click();
}
const rankOrder = page => page.locator("#q2 .rank-list > li").evaluateAll(rows => rows.map(row => row.dataset.rankValue));
const remaining = (page, n) => page.locator("#remaining").textContent().then(text => assert.equal(text, `残り ${n} / 3 問`));
const initClipboard = context => context.addInitScript(() => {
  window.copied = [];
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText(text) { window.copied.push(text); return Promise.resolve(); } } });
});

test("順位・数値・条件説明は幅とテーマを跨いで回答、下書き、reset、受領表示を保つ", { skip }, async t => {
  const { browser, write, url } = await fixture(t);
  for (const width of [320, 390, 1024, 1440]) for (const colorScheme of ["light", "dark"]) {
    await t.test(`${width}px ${colorScheme}`, async () => {
      write(source);
      const context = await browser.newContext({ viewport: { width, height: 960 }, colorScheme, reducedMotion: "reduce" });
      await initClipboard(context);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(url);
      await remaining(page, 3);
      assert.deepEqual(await rankOrder(page), order);
      assert.equal(await page.locator("[data-number-input]").inputValue(), "2");
      assert.equal(await page.locator(".conditional[open]").count(), 0);
      await page.locator(".conditional summary").nth(1).click();
      assert.equal(await page.locator(".conditional[open]").count(), 1);
      // 補足欄だけでは回答にならず、手動で開いた非該当説明も閉じない。
      await open(page, "q2");
      await page.locator('#q2 .note').fill("順位への補足");
      await remaining(page, 3);
      assert.equal(await page.locator(".conditional[open]").count(), 1);
      await open(page, "q1");
      await page.locator('#q1 input[value="調査から"]').check();
      await remaining(page, 2);
      assert.equal(await page.locator(".conditional").first().evaluate(el => el.open), true);
      assert.match(await page.locator(".condition-state").first().textContent(), /該当する/);
      await page.locator('#q1 input[value="試作から"]').check();
      assert.equal(await page.locator(".conditional").first().evaluate(el => el.open), false);
      assert.equal(await page.locator(".conditional").nth(1).evaluate(el => el.open), true);
      // 初期順序の明示回答と、キーボードでの上下移動。
      await open(page, "q2");
      await page.locator('#q2 [data-answer-confirm]').click();
      await remaining(page, 1);
      const down = page.locator('#q2 [data-rank-down]').first();
      await down.focus(); await page.keyboard.press("Enter");
      assert.deepEqual(await rankOrder(page), [order[1], order[0], order[2]]);
      assert.equal(await page.locator('#q2 .rank-list > li').nth(1).locator('[data-rank-down]').evaluate(el => el === document.activeElement), true);
      assert.match(await page.locator('#q2 .answer-control-status').textContent(), /2位へ移動/);
      await page.keyboard.press("Enter");
      assert.deepEqual(await rankOrder(page), [order[1], order[2], order[0]]);
      assert.equal(await page.locator('#q2 .rank-list > li').last().locator('[data-rank-up]').evaluate(el => el === document.activeElement), true);
      // 0 は回答になる。初期値だけでは未回答、入力を変えたら同期する。
      await open(page, "q3");
      await page.locator('[data-number-input]').fill("0");
      assert.equal(await page.locator('[data-number-range]').inputValue(), "0");
      await remaining(page, 0);
      await page.locator('[data-number-range]').focus(); await page.keyboard.press("ArrowRight");
      assert.equal(await page.locator('[data-number-input]').inputValue(), "0.5");
      await page.locator('[data-number-input]').fill("8");
      assert.equal(await page.locator('[data-number-range]').inputValue(), "8");
      // 無効な値を丸めず下書きへ保存し、確定とコピーを止める。
      for (const invalid of ["8.5", "0.25", "-0.5", ""]) {
        await page.locator('[data-number-input]').fill(invalid);
        await remaining(page, 1);
        assert.equal(await page.locator('#q3 [data-answer-confirm]').isDisabled(), true);
        assert.equal(await page.locator('[data-number-input]').getAttribute('aria-invalid'), 'true');
        await page.locator('#copy').click();
        assert.equal(await page.evaluate(() => window.copied.length), 0);
        assert.match(await page.locator('#res').textContent(), /数値の入力を直して/);
        await page.reload();
        assert.equal(await page.locator('[data-number-input]').inputValue(), invalid);
        await open(page, "q3");
      }
      await page.locator('[data-number-input]').fill("2.5");
      await page.locator('#q3 .note').fill("数値への補足");
      await page.reload();
      await remaining(page, 0);
      assert.deepEqual(await rankOrder(page), [order[1], order[2], order[0]]);
      assert.equal(await page.locator('[data-number-input]').inputValue(), "2.5");
      // 同じノードを narrow/wide へ移し、入力と回答を維持する。
      await page.evaluate(() => { window.rankNode = document.getElementById('q2'); window.numberNode = document.querySelector('[data-number-input]'); });
      await page.setViewportSize({ width: width >= 1024 ? 390 : 1440, height: 960 });
      assert.equal(await page.evaluate(() => window.rankNode === document.getElementById('q2') && window.numberNode === document.querySelector('[data-number-input]')), true);
      await remaining(page, 0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator('#copy').click();
      const raw = await page.evaluate(() => window.copied.at(-1));
      const parsed = parseAnswerText(raw, source, "2026-10-10");
      assert.deepEqual(parsed.unparsed, []);
      assert.deepEqual(parsed.items[1].order, [order[1], order[2], order[0]]);
      assert.equal(parsed.items[1].note, "順位への補足");
      assert.equal(parsed.items[2].number, 2.5);
      assert.equal(parsed.items[2].note, "数値への補足");
      await page.locator('#answer-menu-toggle').click();
      await page.locator('#reset').click();
      await remaining(page, 3);
      assert.deepEqual(await rankOrder(page), order);
      assert.equal(await page.locator('[data-number-input]').inputValue(), "2");
      assert.equal(await page.locator('.conditional[open]').count(), 0);
      await page.reload(); await remaining(page, 3);
      await open(page, "q3"); await page.locator('#q3 [data-answer-confirm]').click();
      await remaining(page, 2);
      assert.match(await page.locator('#preview').inputValue(), /数値: \{"value":2\}/);
      // 受領した回答が、reset前後のlocalStorageより優先される。
      delete parsed.unparsed;
      write({ ...source, answers: parsed });
      await page.reload(); await remaining(page, 0);
      assert.equal(await page.locator('[data-number-input]').isDisabled(), true);
      assert.equal(await page.locator('[data-number-range]').isDisabled(), true);
      assert.equal(await page.locator('#q2 [data-answer-confirm]').isDisabled(), true);
      assert.equal(await page.locator('#q3 [data-answer-confirm]').isDisabled(), true);
      assert.equal(await page.locator('[data-number-input]').inputValue(), "2.5");
      assert.deepEqual(await rankOrder(page), [order[1], order[2], order[0]]);
      await page.locator('#copy').click();
      const received = await page.evaluate(() => window.copied.at(-1));
      assert.equal(received, raw);
      assert.deepEqual(errors, []);
      await context.close();
    });
  }
});

test("pointer/touchで全項目を残してドラッグし、取消しでは回答を変えない", { skip }, async t => {
  const { browser, url } = await fixture(t);
  for (const touch of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 960 }, hasTouch: touch, isMobile: touch });
    const page = await context.newPage();
    await page.goto(url); await open(page, "q2");
    await page.locator('#q2').scrollIntoViewIfNeeded();
    const handle = await page.locator('[data-rank-drag]').first().boundingBox();
    const target = await page.locator('.rank-list > li').last().boundingBox();
    const x = handle.x + handle.width / 2, y = handle.y + handle.height / 2;
    if (touch) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: target.y + target.height / 2 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await page.mouse.move(x, y); await page.mouse.down();
      await page.mouse.move(x, target.y + target.height / 2, { steps: 8 }); await page.mouse.up();
    }
    assert.deepEqual(await rankOrder(page), [order[1], order[2], order[0]], touch ? 'touch' : 'mouse');
    await remaining(page, 2);
    const next = await page.locator('[data-rank-drag]').first().boundingBox();
    await page.mouse.move(next.x + 10, next.y + 10); await page.mouse.down();
    await page.mouse.move(next.x + 10, next.y + 120); await page.keyboard.press('Escape'); await page.mouse.up();
    assert.deepEqual(await rankOrder(page), [order[1], order[2], order[0]]);
    assert.equal(await page.locator('.is-dragging, .rank-drop-target').count(), 0);
    await context.close();
  }
});

test("壊れたdraftを部分採用せず、条件説明は印刷/noJSでも全文を残す", { skip }, async t => {
  const { browser, url } = await fixture(t);
  const context = await browser.newContext({ viewport: { width: 390, height: 960 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(url);
  for (const bad of [
    { q2: { order: [order[0], order[0], order[2]], confirmed: true } },
    { q2: { order: [order[0]], confirmed: true } },
    { q2: { order: [order[0], order[1], 'unknown'], confirmed: true } },
    { q2: { order, confirmed: 'true' } }, { q2: { order, confirmed: true, extra: 1 } },
    { q3: { raw: 2, confirmed: true } }, { q3: { raw: '2', confirmed: 'true' } },
    { q3: { raw: '2', confirmed: true, extra: 1 } },
  ]) {
    await page.evaluate(controls => localStorage.setItem('draft:demo-f003', JSON.stringify({ controls })), bad);
    await page.reload(); await remaining(page, 3);
    assert.deepEqual(await rankOrder(page), order);
    assert.equal(await page.locator('[data-number-input]').inputValue(), '2');
  }
  await page.locator('.conditional summary').first().click();
  const before = await page.locator('.conditional').evaluateAll(els => els.map(el => el.open));
  await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
  assert.equal(await page.locator('.conditional[open]').count(), 2);
  await page.evaluate(() => dispatchEvent(new Event('afterprint')));
  assert.deepEqual(await page.locator('.conditional').evaluateAll(els => els.map(el => el.open)), before);
  await context.close();
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 960 } });
  const staticPage = await nojs.newPage();
  await staticPage.goto(url);
  assert.equal(await staticPage.locator('.conditional[open]').count(), 2);
  assert.equal(await staticPage.locator('[data-answer-confirm]:visible').count(), 0);
  assert.equal(await staticPage.locator('[data-rank-drag]:visible').count(), 0);
  assert.equal(await staticPage.locator('.rank-list > li').count(), 3);
  assert.match(await staticPage.locator('#q2 noscript').textContent(), /会話に記入/);
  await nojs.close();
});

test("複数選択・項目別選択・負数と小数の数値も条件説明へ同期する", { skip }, async t => {
  const { browser, write, url } = await fixture(t);
  const data = structuredClone(source);
  data.sections[0].question.multiple = true;
  data.sections[2].question.number = { min: -0.3, max: 0.3, step: 0.1, initial: 0, unit: '度' };
  data.sections[2].blocks.push({ conditional: { title: '0度の補足', when: { question: 'q3', equals: 0 }, blocks: ['数値を回答すると開く。'] } });
  data.sections.push({ kind: 'question', heading: '誰が担当するか', blocks: [{ conditional: { title: '担当の補足', when: { question: 'q4', item: 'owner', equals: '自分' }, blocks: ['選択した担当の説明。'] } }], question: { label: '担当', text: '担当を選ぶ。', options: [{ label: '自分' }, { label: '他の人' }], items: [{ id: 'owner', label: '担当者' }] } });
  write(data);
  const context = await browser.newContext({ viewport: { width: 390, height: 960 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(url);
  await open(page, 'q1');
  await page.locator('#q1 input[value="調査から"]').check();
  await page.locator('#q1 input[value="試作から"]').check();
  assert.equal(await page.locator('.conditional').nth(0).evaluate(el => el.open), true);
  assert.equal(await page.locator('.conditional').nth(1).evaluate(el => el.open), true);
  await page.locator('#q1 input[value="調査から"]').uncheck();
  assert.equal(await page.locator('.conditional').nth(0).evaluate(el => el.open), false);
  // 未回答の初期0は条件を開かない。
  assert.equal(await page.locator('.conditional').nth(2).evaluate(el => el.open), false);
  await open(page, 'q3'); await page.locator('#q3 [data-answer-confirm]').click();
  assert.equal(await page.locator('.conditional').nth(2).evaluate(el => el.open), true);
  for (const number of ['-0.3', '-0.2', '-0.1', '0', '0.1', '0.2', '0.3']) {
    await page.locator('[data-number-input]').fill(number);
    assert.equal(await page.locator('[data-number-input]').getAttribute('aria-invalid'), 'false', number);
    assert.equal(await page.locator('[data-number-range]').inputValue(), number);
    assert.match(await page.locator('#preview').inputValue(), new RegExp(`数値: \\{"value":${number.replace('.', '\\.')}\\}`));
  }
  await page.locator('[data-number-input]').fill('0.15');
  assert.equal(await page.locator('[data-number-input]').getAttribute('aria-invalid'), 'true');
  await page.locator('[data-number-input]').fill('0');
  await open(page, 'q4');
  await page.locator('#q4 input[value="自分"]').check();
  assert.equal(await page.locator('.conditional').nth(3).evaluate(el => el.open), true);
  await page.locator('#q4 input[value="他の人"]').check();
  assert.equal(await page.locator('.conditional').nth(3).evaluate(el => el.open), false);
  assert.equal(await page.locator('.qd').count(), 4);
  await context.close();
});

test("浮動小数の検査と条件は同じ刻みの位置で比較し、入力値をコピーに保つ", { skip }, async t => {
  const { browser, write, url } = await fixture(t);
  const context = await browser.newContext({ viewport: { width: 390, height: 960 }, reducedMotion: 'reduce' });
  await initClipboard(context);
  const page = await context.newPage();
  const data = structuredClone(source);
  data.sections[2].question.number = { min: 0, max: 1, step: 0.1, initial: 0 };
  data.sections[2].blocks.push({ conditional: { title: '0.3の説明', when: { question: 'q3', equals: 0.3 }, blocks: ['同じ刻みの値で開く。'] } });
  write(data);
  await page.goto(url); await open(page, 'q3');
  await page.locator('[data-number-input]').fill('0.30000000000000004');
  assert.equal(await page.locator('[data-number-input]').getAttribute('aria-invalid'), 'false');
  assert.equal(await page.locator('.conditional').last().evaluate(el => el.open), true);
  await page.locator('#copy').click();
  const raw = await page.evaluate(() => window.copied.at(-1));
  assert.match(raw, /数値: \{"value":0.30000000000000004\}/);
  assert.equal(parseAnswerText(raw, data, 'date').items[2].number, 0.30000000000000004);
  await page.locator('[data-number-input]').fill('0.35');
  assert.equal(await page.locator('[data-number-input]').getAttribute('aria-invalid'), 'true');
  assert.equal(await page.locator('.conditional').last().evaluate(el => el.open), false);
  data.sections[2].question.number = { min: 0, max: 0.8, step: 1e-9, initial: 0 };
  data.sections[2].blocks.at(-1).conditional.when.equals = 0.7;
  write(data);
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await open(page, 'q3');
  await page.locator('[data-number-input]').fill('0.7');
  assert.equal(await page.locator('[data-number-input]').getAttribute('aria-invalid'), 'false');
  assert.equal(await page.locator('.conditional').last().evaluate(el => el.open), true);
  assert.equal(await page.locator('[data-number-range]').inputValue(), '0.7');
  await page.locator('#copy').click();
  const tinyRaw = await page.evaluate(() => window.copied.at(-1));
  assert.equal(parseAnswerText(tinyRaw, data, 'date').items[2].number, 0.7);
  for (const value of ['0.0000000005', '0.7000000005', '0.7999999995']) {
    await page.locator('[data-number-input]').fill(value);
    assert.equal(await page.locator('[data-number-input]').getAttribute('aria-invalid'), 'true', value);
    assert.equal(await page.locator('#q3 [data-answer-confirm]').isDisabled(), true);
    const before = await page.evaluate(() => window.copied.length);
    await page.locator('#copy').click();
    assert.equal(await page.evaluate(() => window.copied.length), before);
  }
  await context.close();
});
