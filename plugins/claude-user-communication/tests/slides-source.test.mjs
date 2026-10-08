import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadSource } from "../skills/html-communication/scripts/lib/page-source.mjs";

import { createFixture, source } from "./slides-fixture.mjs";

test("slides は共通reportを再利用し、通常report/formへruntimeを加えない", (t) => {
  const report = { ...source, file: "test-r032" }; delete report.presentation;
  report.sections = report.sections.map((s) => ({ ...s, blocks: s.blocks.map((b) => { if (typeof b === "string") return b; const copy = { ...b }; delete copy.step; return copy; }) }));
  const form = { ...report, file: "test-f032", type: "form", sections: [{ kind: "question", heading: "進めるか", blocks: report.sections[1].blocks, question: { label: "工程", text: "選択する。", options: [{ label: "進める" }, { label: "待つ" }] } }] };
  const dir = createFixture(t, [source, report, form]);
  const html = fs.readFileSync(path.join(dir, source.file + ".html"), "utf8");
  assert.equal((html.match(/class="slide-frame"/g) || []).length, 5);
  assert.match(html, /data-scope="slides"/); assert.match(html, /data-step="2"/);
  assert.match(html, /表 1 工程の比較/); assert.match(html, /図 1 工程の流れ/);
  assert.match(html, /class="detail-content"/); assert.match(html, /id="fn-1"/);
  for (const src of [report, form]) assert.doesNotMatch(fs.readFileSync(path.join(dir, src.file + ".html"), "utf8"), /data-scope="slides"|slide-tools|class="slide-frame"/);
});

test("段階表示の不正な契約は生成前に落とす", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-slides-source-")); t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const cases = [
    { ...source, presentation: "unknown" },
    { ...source, presentation: undefined },
    { ...source, type: "form" },
    { ...source, summary: [{ ul: ["要点"], step: 2 }] },
    { ...source, summary: [{ ul: ["要点"], step: 1 }, { ul: ["要点"], step: 3 }] },
    { ...source, summary: [{ ul: ["要点"], step: 1.5 }] },
    { ...source, summary: [{ detail: { label: "詳細", title: "根拠", blocks: [{ ul: ["要点"], step: 1 }] } }] },
  ];
  for (const src of cases) { const file = path.join(dir, src.file + ".json"); fs.writeFileSync(file, JSON.stringify(src)); assert.ok(loadSource(file).findings.length); }
});


test("表紙と本文の脚注は表示順で採番する", (t) => {
  const src = { ...source, summary: ["先に要点を読む。[^cover]"], footnotes: { ...source.footnotes, cover: "表紙の出典。" } };
  const dir = createFixture(t, [src]);
  const html = fs.readFileSync(path.join(dir, src.file + ".html"), "utf8");
  assert.match(html, /先に要点を読む。<sup class="fnref" id="fnref-1-1"/);
  assert.match(html, /工程を順に進める。<sup class="fnref" id="fnref-2-1"/);
});
