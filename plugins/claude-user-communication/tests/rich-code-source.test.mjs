import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { esc, inline, loadSource } from "../skills/html-communication/scripts/lib/page-source.mjs";
import { collectRichStrings, renderRichBlock, richTargets, validateRichBlock } from "../skills/html-communication/scripts/lib/rich-code.mjs";
import { createFixture, source } from "./rich-code-fixture.mjs";

const options = { esc, inline, renderDetail: (title) => `<a class="detail-link">${inline(title)}</a>` };
const render = (kind, value, extra = {}) => renderRichBlock(kind, value, { ...options, ...extra });
const decode = (s) => s.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
const textRows = (html, view = "split") => {
  const section = html.match(new RegExp(`<div data-diff-view="${view}"[\\s\\S]+?</div>`))?.[0] || "";
  return [...section.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].filter((m) => m[1].includes("<td")).map((m) => [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((x) => decode(x[1])));
};
const diff = (before, after, extra = {}) => render("diff", { id: "test-diff", before, after, ...extra });
function validate(kind, value, extra = {}) {
  const findings = [], strings = [], details = [];
  validateRichBlock(kind, value, "block", { add: (where, message) => findings.push({ where, message }), strings, ids: new Set(), isForm: true, inDetail: false, walkBlocks: (...args) => details.push(args), ...extra });
  return { findings, strings, details };
}

test("rich blocks validate stable ids, line coordinates, exact keys and call controls", () => {
  const code = { id: "code-a", startLine: 8, text: "one\ntwo\n", annotations: [{ line: 10, title: "末尾", text: "空行" }] };
  assert.deepEqual(validate("code", code).findings, []);
  const node = { id: "load", name: "load()", status: "modified", file: "a.js" };
  const calls = { id: "calls-a", title: "呼び出し", nodes: [node] };
  assert.deepEqual(validate("calls", calls).findings, []);
  for (const [kind, value, context] of [
    ["code", { ...code, id: 'bad"id' }], ["code", { ...code, startLine: 0 }],
    ["code", { ...code, text: null }], ["code", { ...code, annotations: [{ line: 7, title: "前", text: "本文" }] }],
    ["code", { ...code, annotations: [...code.annotations, ...code.annotations] }],
    ["code", { ...code, html: "<script>" }], ["code", { ...code, annotations: [{ line: 8, title: "注", text: "本文", html: "<b>" }] }],
    ["diff", { id: "diff-a", before: "", after: [] }], ["diff", { id: "diff-a", before: "", after: "", afterStart: -1 }],
    ["calls", { ...calls, nodes: [] }], ["calls", { ...calls, nodes: [node, node] }],
    ["calls", { ...calls, nodes: [{ ...node, status: "unchanged" }] }],
    ["calls", { ...calls, interaction: "reject" }, { isForm: false }],
    ["calls", calls, { inDetail: true }], ["calls", { ...calls, interaction: "edit" }],
    ["calls", { ...calls, nodes: [{ ...node, children: [] }] }],
    ["calls", { ...calls, nodes: [{ ...node, detail: { title: "詳細", blocks: [], html: "x" } }] }],
  ]) assert.ok(validate(kind, value, context).findings.length, JSON.stringify(value));
  assert.ok(validate("code", code, { ids: new Set(["code-a"]) }).findings.some((f) => /重複/.test(f.message)));
  const detailed = validate("calls", { ...calls, nodes: [{ ...node, detail: { title: "詳細", blocks: [{ code }] } }] });
  assert.deepEqual(detailed.details, [[[{ code }], "block.nodes[0].detail.blocks", true]]);
});

test("code source is escaped verbatim; annotation prose alone interprets references", () => {
  const sourceText = 'const x = "<script>evil()</script>";\n// [^source] `raw` **raw**\n\treturn x;\n';
  const value = { id: "safe-code", title: "題名", file: 'a" onclick="evil.js', language: "js", startLine: 40, text: sourceText, annotations: [{ line: 41, title: "**注釈**", text: "本文。[^note]" }] };
  const html = render("code", value);
  assert.doesNotMatch(html, /<script>| onclick="evil/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /tok-keyword/);
  const codeRows = [...html.matchAll(/class="code-line" data-code-line="(\d+)"[\s\S]*?<code>([\s\S]*?)<\/code>/g)];
  assert.deepEqual(codeRows.map((r) => Number(r[1])), [40, 41, 42, 43]);
  assert.equal(codeRows.map((r) => decode(r[2])).join("\n"), sourceText);
  assert.match(html, /<h4>行 41 <strong>注釈<\/strong>/);
  assert.match(html, /data-code-note="41" aria-expanded="true" aria-controls="rich-safe-code__note-41"/);
  assert.match(html, /class="code-notes"><section class="code-note"/);
  assert.doesNotMatch(html, /class="code-note"[^>]*hidden/);
  assert.match(html, /data-code-note-close="41"/);
  assert.match(html, /data-wrap="false"/);
  assert.doesNotMatch(render("code", { id: "empty-code", text: "" }), /class="code-line"/);
  for (const language of ["typescript", "json", "python", "shell", "unknown"]) {
    const raw = '# raw\n{"value": "<&>"}\n';
    const colored = render("code", { id: "language-code", text: raw, language });
    assert.equal([...colored.matchAll(/<code>([\s\S]*?)<\/code>/g)].map((m) => decode(m[1])).join("\n"), raw);
  }
});

test("generated annotation and editor ids cannot collide with authored block ids", () => {
  const blocks = [
    render("code", { id: "source-code", text: "line", annotations: [{ line: 1, title: "注釈", text: "説明" }] }),
    render("code", { id: "source-code-note-1", text: "other" }),
    render("code", { id: "tree-proposal-node", text: "other" }),
    render("calls", { id: "tree", title: "関係", interaction: "propose", nodes: [{ id: "node", name: "fn()", status: "added" }] }),
    render("calls", { id: "tree-proposal", title: "別の関係", interaction: "propose", nodes: [{ id: "node", name: "other()", status: "existing" }] }),
  ].join("\n");
  const ids = [...blocks.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  const controls = [...blocks.matchAll(/aria-controls="([^"]+)"/g)].map((m) => m[1]);
  for (const target of controls) assert.equal(ids.filter((id) => id === target).length, 1);
});

test("diff aligns replacement runs and highlights only differing words", () => {
  const html = diff("const value = 3;\nreturn value;", "const value = 5;\nconst extra = 1;\nreturn value;", { beforeStart: 7, afterStart: 12 });
  const rows = textRows(html);
  assert.deepEqual(rows, [["7", "−const value = 3;", "12", "+const value = 5;"], ["", " ", "13", "+const extra = 1;"], ["8", " return value;", "14", " return value;"]]);
  assert.match(html, /const value = <mark class="diff-word-delete">3<\/mark>;/);
  assert.match(html, /const value = <mark class="diff-word-add">5<\/mark>;/);
  assert.doesNotMatch(html, /<mark[^>]*>const/);
  assert.match(html, /data-diff-mode="split" aria-pressed="true"/);
  assert.match(html, /data-diff-view="unified"[^>]* hidden/);
  assert.deepEqual(textRows(html, "unified"), [["7", "", "−const value = 3;"], ["", "12", "+const value = 5;"], ["", "13", "+const extra = 1;"], ["8", "14", " return value;"]]);
});

test("diff preserves insertion, deletion, empty inputs, repeated lines and terminal newline", () => {
  for (const [before, after] of [
    ["", "first\nsecond"], ["first\nsecond", ""], ["", ""],
    ["line\n", "line"], ["line", "line\n"], ["a\na\nb", "a\nb"],
    ["a\nb\nc", "x\ny\nc"], ["<script>x</script>", '<img src="x" onerror="evil()">'],
  ]) {
    const html = diff(before, after), rows = textRows(html);
    const recover = (column) => rows.filter((r) => r[column] !== "").map((r) => r[column + 1].slice(1)).join("\n");
    assert.equal(recover(0), before, `before ${JSON.stringify(before)}`);
    assert.equal(recover(2), after, `after ${JSON.stringify(after)}`);
    assert.doesNotMatch(html, /<script>|<img| onerror="evil/);
  }
});

test("large disjoint diffs use bounded alignment without losing lines", () => {
  const before = Array.from({ length: 1200 }, (_, i) => `before item ${i}`).join("\n");
  const after = Array.from({ length: 1300 }, (_, i) => `after item ${i}`).join("\n");
  const html = diff(before, after), rows = textRows(html);
  assert.equal(rows.length, 1300);
  assert.equal(rows.filter((r) => r[0]).map((r) => r[1].slice(1)).join("\n"), before);
  assert.equal(rows.filter((r) => r[2]).map((r) => r[3].slice(1)).join("\n"), after);
});

test("call controls distinguish existing proposals and changed-node rejection; file counts are unique", () => {
  const propose = source.sections[1].blocks[0].calls, reject = source.sections[2].blocks[0].calls;
  const proposals = render("calls", propose), rejections = render("calls", reject);
  assert.equal((proposals.match(/data-proposal-toggle/g) || []).length, 4);
  assert.equal((proposals.match(/この既存実装へ変更提案/g) || []).length, 1);
  assert.equal((proposals.match(/この変更に修正提案/g) || []).length, 3);
  assert.match(proposals, /data-call-count>3<\/span>/); assert.match(proposals, /data-file-count>2<\/span>/);
  assert.equal((rejections.match(/data-reject-toggle/g) || []).length, 4);
  assert.match(rejections, /data-call-count>4<\/span>/); assert.match(rejections, /data-file-count>3<\/span>/);
  const targets = richTargets(source);
  assert.equal(targets.length, 10);
  assert.deepEqual(targets.find((n) => n.tree === "proposal-tree" && n.node === "cache"), { tree: "proposal-tree", node: "cache", status: "added", file: "src/settings.ts", parent: "load", interaction: "propose", name: "cacheSettings()" });
  assert.doesNotMatch(render("calls", { ...propose, interaction: undefined }), /data-proposal-toggle|data-reject-toggle|textarea/);
});

test("received call feedback is escaped and rejection propagates to descendants", () => {
  const reject = source.sections[2].blocks[0].calls;
  const html = render("calls", reject, { answered: true, feedback: [{ tree: reject.id, node: "load", action: "reject", text: '<script>request</script>', affected: ["cache", "old-cache", "existing-helper"] }] });
  assert.match(html, /data-answered="true"/);
  assert.match(html, /data-call-count>1<\/span>/); assert.match(html, /data-file-count>1<\/span>/);
  for (const id of ["load", "cache", "old-cache", "existing-helper"]) assert.match(html, new RegExp(`data-node="${id}"[^>]*data-rejected="true"`));
  assert.match(html, /data-feedback-action="reject" data-feedback-text="&lt;script&gt;request&lt;\/script&gt;"/);
  assert.match(html, /親の棄却を継承/);
  assert.doesNotMatch(html, /<script>|data-reject-toggle|data-proposal-toggle|textarea/);
  const propose = source.sections[1].blocks[0].calls;
  const proposal = render("calls", propose, { answered: true, feedback: [{ tree: propose.id, node: "entry", action: "change", text: "入口を確認" }] });
  assert.match(proposal, /data-call-count>3<\/span>/);
  assert.match(proposal, /既存実装への変更提案: 入口を確認/);
});

test("only explanation strings are collected, including node details", () => {
  const collected = [], blocks = [];
  collectRichStrings("code", { id: "code", title: "題名", text: "[^raw]", annotations: [{ line: 1, title: "注", text: "[^note]" }] }, (s) => collected.push(s), (bs) => blocks.push(bs));
  collectRichStrings("calls", { id: "calls", title: "呼び出し", nodes: [{ id: "a", name: "a()", status: "existing", summary: "[^summary]", detail: { title: "詳細", blocks: ["[^detail]"] } }] }, (s) => collected.push(s), (bs) => blocks.push(bs));
  assert.deepEqual(collected, ["題名", "注", "[^note]", "呼び出し", "a()", "[^summary]", "詳細"]);
  assert.deepEqual(blocks, [["[^detail]"]]);
});

test("shared generation validates code details and preserves source references", (t) => {
  const dir = createFixture(t), json = path.join(dir, "src", source.file + ".json");
  assert.deepEqual(loadSource(json).findings, []);
  const html = fs.readFileSync(path.join(dir, source.file + ".html"), "utf8");
  for (const id of ["source-code", "settings-diff", "proposal-tree", "rejection-tree", "detail-code"]) assert.match(html, new RegExp(`id="rich-${id}"`));
  assert.match(html, /class="detail-link"/); assert.match(html, /id="fn-1"/);
  assert.match(html, /id="fnref-1-1"/); assert.doesNotMatch(html, /\{\{[^}]+\}\}/);
  const regions = [...html.matchAll(/role="region" aria-label="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(regions).size, regions.length);
  assert.match(html, /<th scope="colgroup" colspan="2">変更前<\/th>/);
});

test("loader rejects nested calls in node details and tag/reference contamination in explanations", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-rich-invalid-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const json = path.join(dir, source.file + ".json");
  const base = source.sections[1].blocks[0].calls;
  for (const block of [
    { calls: { ...base, nodes: [{ id: "a", name: "a()", status: "added", detail: { title: "詳細", blocks: [{ tree: [{ text: "枝", blocks: [{ calls: { ...base, id: "nested-calls" } }] }] }] } }] } },
    { code: { id: "code-a", text: "[^source]", annotations: [{ line: 1, title: "注", text: "[^missing]" }] } },
    { calls: { ...base, nodes: [{ id: "a", name: "a()", status: "added", summary: "<b>本文</b>" }] } },
  ]) {
    fs.writeFileSync(json, JSON.stringify({ ...source, sections: [{ kind: "explain", heading: "検証", blocks: [block] }, source.sections[3]] }));
    assert.ok(loadSource(json).findings.length, JSON.stringify(block));
  }
});
