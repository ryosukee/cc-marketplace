import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import test from "node:test";
import { source, createFixture } from "./rich-code-fixture.mjs";
import { parseAnswerText } from "../skills/html-communication/scripts/lib/page-source.mjs";

let playwright;
try { playwright = await import(process.env.HTML_COMMUNICATION_PLAYWRIGHT_MODULE || "playwright"); }
catch (error) { if (error.code !== "ERR_MODULE_NOT_FOUND") throw error; }
const skip = !playwright && "Playwright 未導入。HTML_COMMUNICATION_PLAYWRIGHT_MODULE で導入先を指定する";
const richSource = structuredClone(source);
richSource.sections[0].blocks[0].code.text += "const long = '" + "a".repeat(260) + "';";
richSource.sections[0].blocks[0].code.annotations.push({ line: 14, title: "長い行", text: "横スクロール前にも注釈を見つける。" });
richSource.sections[0].blocks[0].code.annotations[0].text += "長い注釈の全文。".repeat(200);
richSource.sections[0].blocks[1].diff.before += "const long = '" + "before".repeat(50) + "';";
richSource.sections[0].blocks[1].diff.after += "const long = '" + "after".repeat(50) + "';";
const received = structuredClone(richSource);
received.file = "test-f022";
received.answers = { received: "2026-10-09", raw: "受領済み", items: [], free: "", feedback: [
  { tree: "proposal-tree", node: "entry", action: "change", text: "入口にも変更を加える。" },
  { tree: "rejection-tree", node: "load", action: "reject", text: "子の変更も採用しない。", affected: ["cache", "old-cache", "existing-helper"] },
] };

async function fixture(t, sources = [richSource]) {
  const dir = createFixture(t, sources);
  const server = http.createServer((req, res) => {
    const name = path.basename(new URL(req.url, "http://localhost").pathname), file = path.join(dir, name);
    if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
    res.setHeader("Content-Type", "text/html; charset=utf-8"); res.end(fs.readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const browser = await playwright.chromium.launch();
  t.after(() => browser.close());
  return { browser, url: (src = richSource) => `http://127.0.0.1:${server.address().port}/${src.file}.html` };
}
const card = (page, tree, node) => page.locator(`#rich-${tree} .call-node[data-node="${node}"] > .call-card`);
const records = (page) => page.evaluate(() => window.HTMLCodeFeedback.export());

test("コードの注釈は行高を変えず明暗・狭幅で読め、差分の二列と原文を保つ", { skip }, async (t) => {
  const { browser, url } = await fixture(t);
  for (const width of [320, 390, 1440]) for (const colorScheme of ["light", "dark"]) await t.test(`${width}px ${colorScheme}`, async () => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme, reducedMotion: "reduce" });
    context.setDefaultTimeout(5000);
    const page = await context.newPage(), errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(url());
    const code = page.locator("#rich-source-code"), lines = code.locator(".code-line");
    assert.match(await code.locator(".code-viewport").textContent(), /<script>alert\(1\)<\/script>/);
    assert.equal(await code.locator("script").count(), 0);
    const heights = await lines.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    assert.ok(heights.every((height) => height === heights[0]));
    assert.equal(await code.locator('.code-note[data-note-line="11"]').isVisible(), false);
    const button = code.locator('[data-code-note="11"]');
    const scrollBox = await code.locator('.code-viewport').boundingBox();
    for (const line of [11, 14]) {
      const annotation = await code.locator(`[data-code-note="${line}"]`).boundingBox();
      assert.ok(annotation.x >= scrollBox.x && annotation.x + annotation.width <= scrollBox.x + scrollBox.width,
        'long-line annotation must be discoverable without horizontal scroll');
    }
    // A horizontally scrolling region must allow reaching the row's annotation.
    await button.focus(); await page.keyboard.press("Enter");
    const note = code.locator('.code-note[data-note-line="11"]');
    assert.equal(await note.isVisible(), true);
    assert.equal(await button.getAttribute("aria-expanded"), "true");
    assert.deepEqual(await lines.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height)), heights);
    const box = await note.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= width && box.y >= 0 && box.y + box.height <= 900);
    assert.ok(await note.evaluate((el) => el.scrollHeight > el.clientHeight));
    assert.equal(await note.locator('[data-code-note-close]').evaluate((el) => el === document.activeElement), true);
    await page.keyboard.press("Escape");
    assert.equal(await note.isVisible(), false);
    assert.equal(await button.evaluate((el) => el === document.activeElement), true);
    await button.click(); await code.locator("h3").click();
    assert.equal(await note.isVisible(), false, "outside dismissal");
    assert.ok(await code.locator(".code-viewport").evaluate((el) => el.scrollWidth > el.clientWidth));
    await code.locator("[data-wrap-toggle]").click();
    assert.equal(await code.getAttribute("data-wrap"), "true");
    assert.equal(await code.locator("[data-wrap-toggle]").textContent(), "横スクロールに戻す");
    assert.ok(await lines.last().evaluate((el) => el.getBoundingClientRect().height > 28));
    assert.ok(await code.locator(".code-viewport").evaluate((el) => el.scrollWidth <= el.clientWidth + 1));
    await code.locator("[data-wrap-toggle]").click();
    assert.equal(await code.locator("[data-wrap-toggle]").textContent(), "折り返す");
    const diff = page.locator("#rich-settings-diff");
    assert.equal(await diff.locator('[data-diff-view="split"]').isVisible(), true);
    assert.equal(await diff.locator('.diff-split tbody tr').first().locator("td").count(), 4);
    assert.match(await diff.locator(".diff-word-delete").first().textContent(), /3/);
    assert.match(await diff.locator(".diff-word-add").first().textContent(), /5/);
    const split = diff.locator('[data-diff-view="split"]');
    assert.ok(await split.evaluate((el) => el.scrollWidth > el.clientWidth));
    await diff.locator('[data-diff-mode="unified"]').click();
    assert.equal(await split.isVisible(), false);
    assert.match(await diff.locator('[data-diff-view="unified"]').textContent(), /const legacy = true/);
    const unified = diff.locator('[data-diff-view="unified"]');
    assert.ok(await unified.evaluate((el) => el.scrollWidth > el.clientWidth), 'long unified lines default to horizontal scroll');
    await diff.locator('[data-wrap-toggle]').click();
    assert.ok(await unified.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), 'wrapped unified content fits its viewport');
    assert.ok(await unified.locator('.diff-unified').evaluate((table) => table.getBoundingClientRect().width <= table.parentElement.clientWidth + 1));
    assert.equal(await unified.locator('tbody tr').first().evaluate((row) => row.children[0].getBoundingClientRect().width < 80 && row.children[1].getBoundingClientRect().width < 80), true,
      'wrapped unified keeps both number columns narrow');
    await diff.locator('[data-wrap-toggle]').click();
    await diff.locator('[data-diff-mode="split"]').click();
    await diff.locator('[data-wrap-toggle]').click();
    assert.equal(await diff.locator('tbody tr').first().evaluate((row) => row.children[1].getBoundingClientRect().height === row.children[3].getBoundingClientRect().height), true);
    assert.equal(await diff.locator('.diff-split tbody tr').first().evaluate((row) => row.children[0].getBoundingClientRect().width < 80 && row.children[1].getBoundingClientRect().width > 200), true,
      'wrapped split reserves narrow line-number columns and useful code width');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    await context.close();
  });
});

test("提案・親子の棄却・復元は件数、コピー、下書き再読込、リセットに連動する", { skip }, async (t) => {
  const { browser, url } = await fixture(t);
  const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
  context.setDefaultTimeout(5000);
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.copied = [];
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: (text) => { window.copied.push(text); return Promise.resolve(); } } });
  });
  await page.goto(url());
  const counts = async (calls, files) => {
    assert.equal(await page.locator('#rich-rejection-tree [data-call-count]').textContent(), String(calls));
    assert.equal(await page.locator('#rich-rejection-tree [data-file-count]').textContent(), String(files));
  };
  const remaining = await page.locator("#remaining").textContent();
  await counts(4, 3);
  assert.equal(await card(page, "proposal-tree", "entry").locator('[data-proposal-toggle]').textContent(), "この既存実装へ変更提案");
  const propose = card(page, "proposal-tree", "load");
  assert.equal(await propose.locator('[data-proposal-toggle]').textContent(), "この変更に修正提案");
  await propose.locator('[data-proposal-toggle]').click();
  assert.deepEqual(await records(page), [], "opening an empty editor does not submit a proposal");
  await propose.locator('[data-feedback-note]').fill('line 1\n"quoted" <tag> / 日本語');
  await propose.locator('[data-proposal-toggle]').click();
  assert.equal(await propose.locator('[data-proposal-toggle]').getAttribute('aria-expanded'), 'false');
  assert.equal(await propose.locator('[data-feedback-note]').isVisible(), false);
  await propose.locator('[data-proposal-toggle]').click();
  assert.equal(await propose.locator('[data-feedback-note]').inputValue(), 'line 1\n"quoted" <tag> / 日本語');
  assert.equal(await page.locator("#remaining").textContent(), remaining, "a note does not answer a question");
  assert.equal(await page.locator('#rich-proposal-tree [data-call-count]').textContent(), "3");
  assert.equal(await page.locator('#rich-proposal-tree [data-file-count]').textContent(), "2");
  const child = card(page, "rejection-tree", "cache"), parent = card(page, "rejection-tree", "load");
  assert.equal(await child.locator('[data-feedback-note]').isVisible(), false);
  await child.locator('[data-reject-toggle]').click();
  await child.locator('[data-feedback-note]').fill("子への補足");
  await counts(3, 3);
  await parent.locator('[data-reject-toggle]').click();
  await parent.locator('[data-feedback-note]').fill("親への補足");
  await counts(1, 1);
  assert.equal(await child.locator('[data-reject-toggle]').isDisabled(), true);
  assert.equal(await child.locator('[data-feedback-note]').inputValue(), "子への補足");
  const exported = await records(page);
  assert.deepEqual(exported.find((record) => record.tree === "rejection-tree" && record.node === "load").affected, ["cache", "old-cache", "existing-helper"]);
  await page.locator("#copy").click();
  await page.waitForFunction(() => window.copied.length > 0);
  const copied = await page.evaluate(() => window.copied.at(-1));
  const parsed = parseAnswerText(copied, richSource, "2026-10-09");
  assert.deepEqual(parsed.unparsed, []);
  assert.deepEqual(parsed.feedback, exported);
  await page.reload();
  await counts(1, 1);
  assert.equal(await propose.locator('[data-feedback-note]').inputValue(), 'line 1\n"quoted" <tag> / 日本語');
  await parent.locator('[data-reject-toggle]').click();
  await counts(3, 3);
  assert.equal(await child.locator('[data-reject-toggle]').getAttribute('aria-pressed'), 'true');
  assert.equal(await parent.locator('[data-feedback-note]').isVisible(), false);
  await page.reload();
  await parent.locator('[data-reject-toggle]').click();
  assert.equal(await parent.locator('[data-feedback-note]').inputValue(), "親への補足", "restored draft retains dormant notes");
  await page.locator('#answer-menu-toggle').click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#reset').click();
  assert.deepEqual(await records(page), []);
  await counts(4, 3);
  await page.reload();
  assert.deepEqual(await records(page), []);
  // Untrusted draft entries may not apply a rejection to a proposal or existing node.
  await page.evaluate(() => window.HTMLCodeFeedback.restore([
    { tree: 'rejection-tree', node: 'entry', action: 'reject', text: '' },
    { tree: 'proposal-tree', node: 'load', action: 'reject', text: '' },
    { tree: 'missing', node: 'load', action: 'revise', text: 'bad' },
  ]));
  assert.deepEqual(await records(page), []);
  await context.close();
});

test("touch・共通詳細・受領済み・JS無効・印刷でもコードの全文を読める", { skip }, async (t) => {
  const { browser, url } = await fixture(t, [richSource, received]);
  const context = await browser.newContext({ viewport: { width: 320, height: 844 }, hasTouch: true, isMobile: true });
  context.setDefaultTimeout(5000);
  const page = await context.newPage(); await page.goto(url());
  await page.locator('#rich-source-code [data-code-note="12"]').tap();
  assert.equal(await page.locator('#rich-source-code .code-note[data-note-line="12"]').isVisible(), true);
  await page.locator('#rich-source-code [data-code-note-close="12"]').tap();
  const detailLink = card(page, 'proposal-tree', 'load').locator('.detail-link');
  await detailLink.focus(); await page.keyboard.press('Enter');
  const detailButton = page.locator('#detail-viewer-body [data-code-note="10"]');
  await detailButton.focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('#detail-viewer-body .code-note').isVisible(), true);
  assert.equal(await detailButton.evaluate((button) => {
    const id = button.getAttribute('aria-controls'), note = document.getElementById(id);
    return note.closest('#detail-viewer-body') !== null && Array.from(document.querySelectorAll('[id]')).filter((el) => el.id === id).length === 1;
  }), true, 'aria-controls addresses the visible detail instance only');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#detail-viewer').evaluate((el) => el.open), true);
  assert.equal(await detailButton.evaluate((el) => el === document.activeElement), true);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement.matches('.detail-link'));
  // Reopening a viewer must not duplicate handlers or remove the source note.
  await detailLink.click(); await page.locator('#detail-viewer-body [data-code-note="10"]').click();
  assert.equal(await page.locator('#detail-viewer-body .code-note').isVisible(), true);
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.emulateMedia({ media: 'print' });
  assert.equal(await page.locator('#rich-source-code .code-note[data-note-line="11"]').isVisible(), true);
  assert.equal(await page.locator('#rich-source-code [data-wrap-toggle]').isVisible(), false);
  await context.close();
  const answered = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const receivedPage = await answered.newPage(); await receivedPage.goto(url(received));
  assert.deepEqual(await records(receivedPage), received.answers.feedback);
  assert.equal(await receivedPage.locator('.received-feedback').first().evaluate((el) => getComputedStyle(el).whiteSpace), 'pre-wrap');
  assert.equal(await receivedPage.locator('.rich-calls [data-proposal-toggle], .rich-calls [data-reject-toggle], .rich-calls textarea').count(), 0);
  await receivedPage.evaluate(() => { window.HTMLCodeFeedback.reset(); window.HTMLCodeFeedback.restore([]); });
  assert.deepEqual(await records(receivedPage), received.answers.feedback);
  await receivedPage.locator('#rich-source-code [data-wrap-toggle]').click();
  assert.equal(await receivedPage.locator('#rich-source-code').getAttribute('data-wrap'), 'true');
  await receivedPage.locator('#rich-source-code [data-code-note="12"]').click();
  assert.equal(await receivedPage.locator('#rich-source-code .code-note[data-note-line="12"]').isVisible(), true);
  await answered.close();
  const plain = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const noJS = await plain.newPage(); await noJS.goto(url());
  assert.equal(await noJS.locator('#rich-source-code .code-note[data-note-line="11"]').isVisible(), true);
  assert.equal(await noJS.locator('#rich-detail-code .code-note').isVisible(), true);
  assert.match(await noJS.locator('#rich-source-code .code-viewport').textContent(), /<script>alert\(1\)<\/script>/);
  assert.ok(await noJS.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await plain.close();
});
