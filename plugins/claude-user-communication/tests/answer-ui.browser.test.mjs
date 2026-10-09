import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { assemblePage } from "../skills/html-communication/scripts/lib/assemble.mjs";
import { parseAnswerText } from "../skills/html-communication/scripts/lib/page-source.mjs";

// 開発時のブラウザ検証。別の場所に導入した Playwright は module の絶対パスで渡せる。
const moduleName = process.env.HTML_COMMUNICATION_PLAYWRIGHT_MODULE || "playwright";
let playwright;
try { playwright = await import(moduleName); } catch (error) {
  if (error.code !== "ERR_MODULE_NOT_FOUND") throw error;
}
const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = {
  format: 1, file: "test-f010", type: "form", title: "回答操作の見本", project: "test",
  context: ["操作の試験用の見本。"], sections: [
    { kind: "question", heading: "どの順に進めるか", blocks: ["作業順を選ぶ。"], question: {
      label: "順序", text: "順序を選ぶ。", options: [{ label: "調査から" }, { label: "試作から" }],
    } },
    { kind: "question", heading: "何を確認するか", blocks: ["複数選べる。"], question: {
      label: "確認対象", text: "対象を選ぶ。", multiple: true, options: [{ label: "本文" }, { label: "図" }],
    } },
    { kind: "question", heading: "処理をどちらが担当するか", blocks: [], question: {
      label: "処理ごとの担当", text: "担当を選ぶ。", options: [{ label: "React" }, { label: "Go server" }],
      items: [{ id: "path", label: "path" }, { id: "filter", label: "filter" }],
    } },
  ],
};

test("残回答量とメニューが保存・復元・コピー・リセット・回答済み表示に連動する", {
  skip: !playwright && "Playwright 未導入。HTML_COMMUNICATION_PLAYWRIGHT_MODULE で導入先を指定する",
}, async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-answer-ui-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, "src"));
  const jsonPath = path.join(dir, "src", `${source.file}.json`);
  const write = (data) => {
    fs.writeFileSync(jsonPath, JSON.stringify(data));
    assert.equal(assemblePage(jsonPath, { force: true }).ok, true);
  };
  write(source);
  fs.copyFileSync(path.join(pluginRoot, "skills/html-communication/templates/index.html"), path.join(dir, "index.html"));
  const report = { ...source, file: "test-r010", type: "report", summary: ["操作の説明を読む。"], sections: [{ kind: "explain", heading: "操作の説明", blocks: ["説明を読む。"] }] };
  const reportPath = path.join(dir, "src", "test-r010.json");
  fs.writeFileSync(reportPath, JSON.stringify(report));
  const assembledReport = assemblePage(reportPath);
  assert.equal(assembledReport.ok, true, JSON.stringify(assembledReport.findings));
  const server = http.createServer((req, res) => {
    const name = path.basename(new URL(req.url, "http://localhost").pathname);
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(fs.readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/${source.file}.html`;
  const browser = await playwright.chromium.launch();
  t.after(() => browser.close());
  for (const width of [320, 390, 1024, 1440]) for (const colorScheme of ["light", "dark"]) {
    await t.test(`${width}px ${colorScheme}`, async () => {
      write(source);
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.clock.install();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript(() => {
        window.copied = [];
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: (text) => {
          window.copied.push(text); return Promise.resolve();
        } } });
      });
      await page.goto(url);
      // 2 pane では設問カードが折り畳まれるので、利用者と同じく見出しから開く。
      const choose = async (id, selector) => {
        const card = page.locator(`.qd[data-for="${id}"]`);
        if (!await card.evaluate((el) => el.open)) await card.locator("summary").click();
        await page.locator(selector).check();
      };
      const remaining = async (n) => {
        assert.equal(await page.locator("#remaining").textContent(), `残り ${n} / 3 問`);
        const progress = await page.locator("#remaining-track").evaluate((el) => ({ value: el.value, max: el.max, position: el.position }));
        assert.equal(progress.value, n);
        assert.equal(progress.max, 3);
        assert.equal(progress.position, n / 3);
      };
      await remaining(3);
      const copyRect = await page.locator("#copy").boundingBox();
      const menuRect = await page.locator("#answer-menu-toggle").boundingBox();
      const backRect = await page.locator("#back").boundingBox();
      assert.equal(copyRect.y, menuRect.y, "コピーとその他は同じ行");
      assert.ok(backRect.y >= menuRect.y + menuRect.height, "一覧に戻るは下の行");
      assert.ok(backRect.x > copyRect.x, "一覧に戻るは操作欄の右側");
      if (width >= 1024) {
        assert.equal(await page.locator("#bar").evaluate(el => el.parentNode.id), "q-pane");
        assert.equal(await page.locator("#q1").evaluate(el => el.closest('#question-list')?.id), "question-list");
        assert.ok((await page.locator("#bd").boundingBox()).x > (await page.locator("#q-pane").boundingBox()).x);
      } else assert.equal(await page.locator("#q1").evaluate(el => Boolean(el.closest('.rng'))), true);
      assert.equal(await page.locator("#remaining").evaluate((el) => getComputedStyle(el).textAlign), "center");
      assert.equal(await page.locator("#cnt").count(), 0);
      for (const id of ["back", "copy", "answer-menu-toggle"]) {
        const button = await page.locator(`#${id}`).boundingBox();
        assert.ok(button.x >= 0 && button.x + button.width <= width, `${id}が画面内に収まる`);
      }
      if (process.env.HTML_COMMUNICATION_SCREENSHOTS) {
        fs.mkdirSync(process.env.HTML_COMMUNICATION_SCREENSHOTS, { recursive: true });
        await page.screenshot({ path: path.join(process.env.HTML_COMMUNICATION_SCREENSHOTS, `${width}-${colorScheme}-closed.png`) });
      }
      await choose("q1", '#q1 input[value="調査から"]');
      await remaining(2);
      await choose("q2", '#q2 input[value="本文"]');
      await remaining(1);
      // 項目別選択は一部だけ選んでも1問完了にならない。
      await choose("q3", '#q3 input[name="q3-path"][value="React"]');
      await remaining(1);
      await choose("q3", '#q3 input[name="q3-filter"][value="Go server"]');
      await remaining(0);
      await page.locator("#answer-menu-toggle").focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.locator("#answer-menu-toggle").getAttribute("aria-expanded"), "true");
      assert.equal(await page.locator("#free").evaluate((el) => el === document.activeElement), true);
      await page.locator("#free").fill("全体への補足\n2行目");
      const box = await page.locator("#answer-menu").boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width && box.y >= 0);
      assert.ok((await page.locator("#free").boundingBox()).height >= 144);
      assert.equal(await page.locator("#ver").evaluate((el) => getComputedStyle(el).fontSize), "10px");
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (process.env.HTML_COMMUNICATION_SCREENSHOTS) {
        fs.mkdirSync(process.env.HTML_COMMUNICATION_SCREENSHOTS, { recursive: true });
        await page.screenshot({ path: path.join(process.env.HTML_COMMUNICATION_SCREENSHOTS, `${width}-${colorScheme}-menu.png`) });
      }
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#free").isVisible(), false);
      assert.equal(await page.locator("#answer-menu-toggle").evaluate((el) => el === document.activeElement), true);
      await page.reload();
      await remaining(0);
      const copyLabel = await page.locator("#copy").textContent();
      const barHeight = (await page.locator("#bar").boundingBox()).height;
      await page.locator("#copy").click();
      await page.waitForFunction(() => document.getElementById("copy").textContent === "コピーしました");
      assert.equal(await page.locator("#res").getAttribute("role"), "status");
      assert.equal(await page.locator("#res").textContent(), "コピーしました");
      assert.equal((await page.locator("#res").boundingBox()).height, 1);
      assert.equal((await page.locator("#bar").boundingBox()).height, barHeight);
      await page.clock.fastForward(2000);
      await page.locator("#copy").click();
      await page.clock.fastForward(1500);
      assert.equal(await page.locator("#copy").textContent(), "コピーしました", "連打すると最新の成功から3秒まで表示する");
      await page.clock.fastForward(1500);
      assert.equal(await page.locator("#copy").textContent(), copyLabel);
      assert.equal(await page.locator("#res").textContent(), "");
      const answer = await page.evaluate(() => window.copied.at(-1));
      assert.match(answer, /- 補足: 全体への補足\n2行目/);
      assert.match(answer, /項目別選択/);
      assert.match(answer, /複数選択/);
      await page.locator("#answer-menu-toggle").click();
      assert.equal(await page.locator("#free").inputValue(), "全体への補足\n2行目");
      await page.locator("#reset").click();
      await remaining(3);
      assert.equal(await page.locator("#answer-menu").isVisible(), false);
      await page.reload();
      await remaining(3);
      await page.locator("#answer-menu-toggle").click();
      assert.equal(await page.locator("#free").inputValue(), "");
      await page.locator("h1").click();
      assert.equal(await page.locator("#answer-menu").isVisible(), false);
      // 成功表示中でも、clipboard 非対応の失敗通知は画面に表示する。
      await page.locator("#copy").click();
      await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined }));
      await page.locator("#copy").click();
      assert.equal(await page.locator("#preview").evaluate((el) => el === document.activeElement), true);
      assert.match(await page.locator("#res").textContent(), /手動でコピー/);
      assert.equal(await page.locator("#copy").textContent(), copyLabel);
      assert.equal(await page.locator("#res").evaluate((el) => el.classList.contains("copy-success")), false);
      await page.clock.fastForward(3000);
      assert.match(await page.locator("#res").textContent(), /手動でコピー/, "成功タイマーが失敗通知を消さない");
      // localStorage の未回答下書きがあっても、受領した回答を優先する。
      const parsed = parseAnswerText(answer, source, "2026-10-08");
      assert.deepEqual(parsed.unparsed, []);
      write({ ...source, answers: { received: "2026-10-08", raw: answer, items: parsed.items, free: parsed.free } });
      await page.reload();
      await remaining(0);
      await page.locator("#answer-menu-toggle").click();
      assert.equal(await page.locator("#free").isDisabled(), true);
      assert.equal(await page.locator("#reset").isDisabled(), true);
      assert.equal(await page.locator("#free").inputValue(), "全体への補足\n2行目");
      await page.keyboard.press("Escape");
      await page.locator("#copy").click();
      await page.waitForFunction(() => document.getElementById("res").textContent.includes("受領"));
      assert.equal(await page.locator("input:checked").count(), 4);
      await page.goto(url.replace("test-f010", "test-r010"));
      assert.equal(await page.locator("#answer-progress").count(), 0);
      assert.equal(await page.locator("#answer-menu").count(), 0);
      assert.equal(await page.locator("#back").getAttribute("href"), "./index.html");
      assert.deepEqual(errors, []);
      await context.close();
    });
  }
});
