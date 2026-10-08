import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { assemblePage } from "../skills/html-communication/scripts/lib/assemble.mjs";
import { loadSource } from "../skills/html-communication/scripts/lib/page-source.mjs";

const source = {
  format: 1, file: "test-r020", type: "report", title: "詳細表示の検証", project: "test",
  context: ["詳細を必要なときに読む。"], summary: ["概要を読む。"],
  sections: [{ kind: "explain", heading: "実装の内訳", blocks: [
    { detail: { label: "詳細を開く", title: "実装の詳細", blocks: ["長い説明。[^detail]", { pre: "<source>" }] } },
    { tree: [{ text: "親", children: [{ text: "子", blocks: ["子の説明。[^tree]"] }] }] },
    { fig: { id: "flow", caption: "工程", notes: [{ label: "図の補足", text: "補足の全文。[^figure]" }] } },
  ] }], footnotes: { detail: "詳細の出典。", tree: "階層の出典。", figure: "図の出典。" },
};

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-detail-source-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, "src"));
  const json = path.join(dir, "src", "test-r020.json");
  fs.writeFileSync(path.join(dir, "src", "test-r020.figures.html"), '<template data-fig="flow"><p>工程の図</p></template>');
  const write = (data) => fs.writeFileSync(json, JSON.stringify(data));
  write(source);
  return { dir, json, write };
}

test("詳細・階層・図補足の原文と参照を共通生成器が保持する", (t) => {
  const { dir, json } = fixture(t);
  assert.deepEqual(loadSource(json).findings, []);
  const result = assemblePage(json);
  assert.equal(result.ok, true, JSON.stringify(result.findings));
  const html = fs.readFileSync(path.join(dir, "test-r020.html"), "utf8");
  assert.match(html, /class="detail-link" href="#detail-1"/);
  assert.match(html, /class="detail-content" id="detail-1"/);
  assert.match(html, /&lt;source&gt;/);
  assert.match(html, /class="tree-branch" open/);
  assert.match(html, /class="figure-note" open/);
  for (const n of [1, 2, 3]) {
    assert.match(html, new RegExp(`id="fn-${n}"`));
    assert.match(html, new RegExp(`id="fnref-${n}-1"`));
  }
  assert.match(html, /id="reading-tools"/);
  assert.doesNotMatch(html, /id="answer-progress"/);
  assert.doesNotMatch(html, /\{\{[^}]+\}\}/);
});

test("未定義キー・空の内容・起動点のリンク・入れ子detailを拒否する", (t) => {
  const { json, write } = fixture(t);
  for (const invalid of [
    { detail: { label: "開く", title: "詳細", blocks: [], html: "<script>" } },
    { detail: { label: "[^x]", title: "詳細", blocks: ["説明"] } },
    { detail: { label: "[開く](https://example.com)", title: "詳細", blocks: ["説明"] } },
    { detail: { label: "開く", title: "詳細", blocks: [{ tree: [{ text: "枝", blocks: [{ detail: { label: "開く", title: "内側", blocks: ["説明"] } }] }] }] } },
    { tree: [] }, { tree: [{ text: "枝", children: [] }] }, { tree: [{ text: "", open: true }] },
    { fig: { id: "flow", caption: "工程", notes: [{ label: "[^x]", text: "説明" }] } },
    { fig: { id: "flow", caption: "工程", notes: [{ label: "補足", text: "", html: "<b>" }] } },
  ]) {
    write({ ...source, footnotes: {}, sections: [{ kind: "explain", heading: "説明", blocks: [invalid] }] });
    assert.ok(loadSource(json).findings.length, JSON.stringify(invalid));
    assert.equal(assemblePage(json, { force: true }).ok, false);
  }
});

test("detail/tree/図補足の深い本文も脚注とタグの検査対象になる", (t) => {
  const { json, write } = fixture(t);
  for (const invalid of [
    { detail: { label: "開く", title: "詳細", blocks: ["説明。[^missing]"] } },
    { tree: [{ text: "親", children: [{ text: "子", blocks: ["<b>本文</b>"] }] }] },
    { fig: { id: "flow", caption: "工程", notes: [{ label: "補足", text: "説明。[^missing]" }] } },
  ]) {
    write({ ...source, footnotes: {}, sections: [{ kind: "explain", heading: "説明", blocks: [invalid] }] });
    assert.ok(loadSource(json).findings.some((f) => /missing|HTML/.test(f.message)));
  }
});
