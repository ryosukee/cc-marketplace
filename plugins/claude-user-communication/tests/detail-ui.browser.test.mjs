import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { assemblePage } from "../skills/html-communication/scripts/lib/assemble.mjs";

let playwright;
try { playwright = await import(process.env.HTML_COMMUNICATION_PLAYWRIGHT_MODULE || "playwright"); }
catch (error) { if (error.code !== "ERR_MODULE_NOT_FOUND") throw error; }
const skip = !playwright && "Playwright 未導入。HTML_COMMUNICATION_PLAYWRIGHT_MODULE で導入先を指定する";
const blocks = [
  { detail: { label: "詳細を開く", title: "長い説明", blocks: ["詳細の全文。[^detail]", { pre: "const source = '<value>';" }, { fig: { id: "image", caption: "詳細の画像" } }] } },
  { tree: [{ text: "親の工程", children: [{ text: "子の工程", children: [{ text: "末端の工程", blocks: ["階層の全文。[^tree]"] }] }] }] },
  { fig: { id: "diagram", caption: "工程の図", notes: [{ label: "図の補足", text: "図の補足の全文。[資料](https://example.com/source)[^figure]" }] } },
  "本文から脚注を読む。[^main]",
];
const report = {
  format: 1, file: "test-r021", type: "report", title: "詳細操作の見本", project: "test",
  context: ["必要な内容をその場で読む。"], summary: ["操作を確認する。"],
  sections: [{ kind: "explain", heading: "工程の内訳", blocks }],
  footnotes: { detail: "詳細の出典。別の出典。[^figure]", tree: "階層の出典。", figure: "図の出典。", main: "脚注の全文。[公式資料](https://example.com/source) 別の出典。[^figure] " + "長い説明。".repeat(180) },
};
const form = { ...report, file: "test-f021", type: "form", sections: [{ kind: "question", heading: "どの工程を選ぶか", blocks, question: { label: "工程", text: "工程を選ぶ。", options: [{ label: "先に調査" }, { label: "先に試作" }] } }] };
delete form.summary;

async function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-detail-ui-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, "src"));
  for (const src of [report, form]) {
    const json = path.join(dir, "src", `${src.file}.json`);
    fs.writeFileSync(json, JSON.stringify(src));
    fs.writeFileSync(path.join(dir, "src", `${src.file}.figures.html`), '<template data-fig="diagram"><p>調査 → 実装 → 検証</p></template>\n<template data-fig="image"><img alt="確認用の画像" width="40" height="40" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="></template>');
    const result = assemblePage(json);
    assert.equal(result.ok, true, JSON.stringify(result.findings));
  }
  const server = http.createServer((req, res) => {
    const name = path.basename(new URL(req.url, "http://localhost").pathname);
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
    res.setHeader("Content-Type", "text/html; charset=utf-8"); res.end(fs.readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const browser = await playwright.chromium.launch();
  t.after(() => browser.close());
  return { browser, url: (src) => `http://127.0.0.1:${server.address().port}/${src.file}.html` };
}

test("共通詳細操作は明暗・狭幅・pane幅で原文とフォーカスを保つ", { skip }, async (t) => {
  const { browser, url } = await fixture(t);
  for (const src of [report, form]) for (const width of [320, 390, 1440, 1700]) for (const colorScheme of ["light", "dark"]) {
    await t.test(`${src.type} ${width}px ${colorScheme}`, async () => {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme, reducedMotion: "reduce" });
      context.setDefaultTimeout(5000);
      const page = await context.newPage();
      const errors = []; page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(url(src));
      assert.equal(await page.locator("#fn-pane").isVisible(), false);
      assert.equal(await page.locator("#fn-toggle").getAttribute("aria-expanded"), "false");
      assert.equal(await page.locator("#answer-progress").count(), src.type === "form" ? 1 : 0);
      const toggle = await page.locator("#fn-toggle").boundingBox();
      assert.ok(toggle.x + toggle.width <= width && toggle.y >= 0 && toggle.y < 10);
      if (src.type === "form") {
        const count = await page.locator("#remaining").boundingBox();
        assert.equal(count.x + count.width / 2, width / 2);
        assert.ok(toggle.x >= width / 2 + 45, "toggle は中央counterの右に置く");
      }
      const closedWidth = (await page.locator("#bd").boundingBox()).width;
      await page.locator("#fn-toggle").click();
      assert.equal(await page.locator("#fn-pane").isVisible(), true);
      if (width >= 1024) assert.ok(closedWidth > (await page.locator("#bd").boundingBox()).width + 200, "閉じた脚注列は本文へ渡す");
      await page.locator("#fn-toggle").click();
      const link = page.locator(".detail-link");
      await link.focus(); await page.keyboard.press("Enter");
      assert.equal(await page.locator("#detail-viewer").evaluate((el) => el.open), true);
      assert.equal(await page.locator("#detail-close").evaluate((el) => el === document.activeElement), true);
      assert.match(await page.locator("#detail-viewer-body").textContent(), /詳細の全文/);
      const detail = await page.locator("#detail-viewer").boundingBox();
      assert.ok(detail.x >= 0 && detail.x + detail.width <= width && detail.width > Math.min(300, width - 1));
      // modal のTabは本文外へ出ず、補足popupはmodal内に置く。
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        assert.equal(await page.evaluate(() => document.activeElement === document.body || document.getElementById("detail-viewer").contains(document.activeElement)), true);
      }
      await page.locator('#detail-viewer-body .fnref a[href="#fn-1"]').click();
      assert.equal(await page.locator("#reading-popup").evaluate((el) => el.parentNode.id), "detail-viewer");
      assert.match(await page.locator("#reading-popup-body").textContent(), /詳細の出典/);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#detail-viewer").evaluate((el) => el.open), true);
      assert.equal(await page.locator("#reading-popup").isVisible(), false);
      // 既存画像viewerを重ねてもEsc/close時のfocusが詳細内へ戻る。
      await page.mouse.move(1, 1);
      const image = page.locator("#detail-viewer-body .fig img");
      await image.focus(); await page.keyboard.press("Enter");
      assert.equal(await page.locator("#image-viewer").evaluate((el) => el.open), true);
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => document.activeElement.matches('#detail-viewer-body .fig img'));
      assert.equal(await image.evaluate((el) => el === document.activeElement), true);
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => document.activeElement.matches('.detail-link') && document.querySelector('#bd #detail-1'));
      assert.equal(await link.evaluate((el) => el === document.activeElement), true);
      assert.equal(await page.locator("#bd #detail-1").count(), 1, "detail原文を本文の位置へ戻す");
      const parents = page.locator(".tree-branch");
      assert.equal(await parents.nth(0).evaluate((el) => el.open), false);
      await parents.nth(0).locator(":scope > summary").click();
      assert.equal(await parents.nth(1).evaluate((el) => el.open), false, "親を開いても子は閉じたまま");
      await parents.nth(1).locator(":scope > summary").click();
      assert.equal(await parents.nth(2).evaluate((el) => el.open), false);
      await parents.nth(2).locator(":scope > summary").click();
      assert.equal(await page.getByText("階層の全文。", { exact: false }).isVisible(), true);
      const note = page.locator(".figure-note > summary");
      await note.hover();
      assert.equal(await note.textContent(), "クリックで固定");
      assert.equal(await page.locator("#reading-popup").getAttribute("data-pinned"), "false");
      await page.locator("#reading-popup-body").hover();
      await page.waitForTimeout(350);
      assert.equal(await page.locator("#reading-popup").isVisible(), true, "pointerを全文へ移して読み続ける");
      await page.locator("#reading-popup-body p").click({ position: { x: 4, y: 12 } });
      assert.equal(await page.locator("#reading-popup").getAttribute("data-pinned"), "true");
      assert.equal(await note.textContent(), "図の補足");
      assert.equal(await page.locator('#reading-popup-body a[href="https://example.com/source"]').count(), 1);
      await page.locator('#reading-popup-body .fnref a').click();
      assert.match(await page.locator("#reading-popup-body").textContent(), /図の出典/);
      await page.keyboard.press("Escape");
      assert.equal(await note.evaluate((el) => el === document.activeElement), true);
      await page.keyboard.press("Space");
      assert.equal(await page.locator("#reading-popup").getAttribute("data-pinned"), "true");
      await page.locator("h1").click();
      assert.equal(await page.locator("#reading-popup").isVisible(), false, "outside clickで固定を閉じる");
      const ref = page.locator('#bd > p .fnref a[href="#fn-4"], .rng > p .fnref a[href="#fn-4"]');
      await ref.click();
      assert.equal(await page.locator("#fn-pane").isVisible(), false, "全文popupはpaneを開かない");
      assert.match(await page.locator("#reading-popup-body").textContent(), /脚注の全文/);
      assert.ok(await page.locator("#reading-popup").evaluate((el) => el.scrollHeight > el.clientHeight), "長い全文は省略せずscrollする");
      const popup = await page.locator("#reading-popup").boundingBox();
      assert.ok(popup.x >= 0 && popup.x + popup.width <= width && popup.y >= 0 && popup.y + popup.height <= 900);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.equal(await page.evaluate(() => {
        const ids = [].map.call(document.querySelectorAll('[id]'), (el) => el.id); return new Set(ids).size === ids.length;
      }), true, "popupで参照IDを複製しない");
      await page.keyboard.press("Escape");
      assert.equal(await ref.evaluate((el) => el === document.activeElement), true);
      assert.deepEqual(errors, []);
      await context.close();
    });
  }
});

test("popup内の脚注をEnterで切り替えてもフォーカスと元の戻り先を保つ", { skip }, async (t) => {
  const { browser, url } = await fixture(t);
  const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
  context.setDefaultTimeout(5000);
  const page = await context.newPage(); await page.goto(url(report));
  // 本文 → 脚注 → 別の脚注。Tabで到達した複製内リンクが切替時に削除される経路。
  const mainRef = page.locator('#bd > p .fnref a[href="#fn-4"]');
  await mainRef.focus(); await page.keyboard.press("Enter");
  assert.equal(await page.locator("#reading-popup-close").evaluate((el) => el === document.activeElement), true);
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute("href")), "https://example.com/source");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute("href")), "#fn-3");
  await page.keyboard.press("Enter");
  assert.match(await page.locator("#reading-popup-body").textContent(), /図の出典/);
  assert.equal(await page.locator("#reading-popup-close").evaluate((el) => el === document.activeElement), true,
    "消したcloneのリンクから新しいpopupの閉じるボタンへfocusを移す");
  await page.keyboard.press("Escape");
  assert.equal(await mainRef.evaluate((el) => el === document.activeElement), true);
  assert.equal(await page.locator("#reading-popup").isVisible(), false);
  // 詳細modal内から同じ切替を行っても、focusをmodalの外へ落とさない。
  const detailLink = page.locator(".detail-link");
  await detailLink.focus(); await page.keyboard.press("Enter");
  const detailRef = page.locator('#detail-viewer-body .fnref a[href="#fn-1"]');
  await detailRef.focus(); await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute("href")), "#fn-3");
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#reading-popup").evaluate((el) => el.parentNode.id), "detail-viewer");
  assert.equal(await page.locator("#reading-popup-close").evaluate((el) => el === document.activeElement), true);
  await page.keyboard.press("Escape");
  assert.equal(await detailRef.evaluate((el) => el === document.activeElement), true);
  assert.equal(await page.locator("#detail-viewer").evaluate((el) => el.open), true);
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.activeElement.matches(".detail-link"));
  await context.close();
});

test("touch 1tapの固定、JS無効の全文、印刷の展開を保つ", { skip }, async (t) => {
  const { browser, url } = await fixture(t);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage(); await page.goto(url(report));
  const note = page.locator(".figure-note > summary");
  await note.tap();
  assert.equal(await page.locator("#reading-popup").getAttribute("data-pinned"), "true");
  assert.equal(await note.textContent(), "図の補足");
  await page.locator("#reading-popup-close").tap();
  assert.equal(await page.locator("#reading-popup").isVisible(), false);
  await page.locator(".detail-link").tap();
  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator("#fn-pane").isVisible(), true);
  assert.equal(await page.locator("#bd #detail-1").isVisible(), true);
  assert.equal(await page.getByText("階層の全文。", { exact: false }).isVisible(), true);
  assert.equal(await page.locator(".figure-note-body").isVisible(), true);
  assert.equal(await page.locator("#reading-tools").isVisible(), false);
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  assert.equal(await page.locator("#fn-pane").isVisible(), false);
  assert.equal(await page.locator(".tree-branch").first().evaluate((el) => el.open), false);
  await context.close();
  const plain = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const noJS = await plain.newPage(); await noJS.goto(url(report));
  assert.equal(await noJS.locator("#fn-pane").isVisible(), true);
  assert.equal(await noJS.locator("#detail-1").isVisible(), true);
  assert.equal(await noJS.getByText("階層の全文。", { exact: false }).isVisible(), true);
  assert.equal(await noJS.locator(".figure-note-body").isVisible(), true);
  assert.equal(await noJS.locator("#fn-toggle").isVisible(), false);
  await plain.close();
});
