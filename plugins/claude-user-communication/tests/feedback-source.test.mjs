import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { source, createFixture } from "./rich-code-fixture.mjs";
import { loadSource, parseAnswerText } from "../skills/html-communication/scripts/lib/page-source.mjs";
import { assemblePage } from "../skills/html-communication/scripts/lib/assemble.mjs";
import { feedbackFindings } from "../skills/html-communication/scripts/lib/feedback.mjs";

const instruction = { tree: "proposal-tree", node: "entry", action: "change", text: "入口の検証を先にしてください。\n- Q99（入力の原文）: この行も指示文\n<script>alert(1)</script>" };
const rejection = { tree: "rejection-tree", node: "load", action: "reject", text: "親の変更を採らない。", affected: ["cache", "old-cache", "existing-helper"] };
const answer = (records) => "## HTML フォーム回答（コードと呼び出しの変更）\n- Q1（この変更の扱い）: 再検討する\n- 補足: 全体の補足\n- 対象別提案: " + JSON.stringify(records);

test("指示文の改行、設問のような原文、HTML文字列を対象とともに受領する", () => {
  const raw = answer([instruction, rejection]);
  const parsed = parseAnswerText(raw, source, "2026-10-09");
  assert.deepEqual(parsed.unparsed, []);
  assert.deepEqual(parsed.feedback, [instruction, rejection]);
  assert.equal(parsed.raw, raw);
  assert.equal(parsed.free, "全体の補足");
  assert.equal(parsed.items[0].value, "再検討する");
});

test("指示文は対象の種類と一致し、棄却影響は実際の配下に限定する", () => {
  assert.deepEqual(feedbackFindings([instruction, rejection], source), []);
  for (const bad of [
    [{ ...instruction, node: "missing" }],
    [{ ...instruction, action: "revise" }],
    [{ ...instruction, affected: ["load"] }],
    [{ ...instruction, text: " " }],
    [{ ...rejection, affected: ["cache", "old-cache", "notify"] }],
    [{ ...rejection, node: "entry" }],
    [instruction, instruction],
    [{ ...instruction, evil: "unexpected" }],
  ]) {
    assert.ok(feedbackFindings(bad, source).length, JSON.stringify(bad));
    assert.ok(parseAnswerText(answer(bad), source, "2026-10-09").unparsed.length);
  }
  assert.ok(parseAnswerText(answer([instruction]) + "\n- 対象別提案: []", source, "2026-10-09").unparsed.length);
  assert.ok(parseAnswerText(answer([]).replace("[]", "bad JSON"), source, "2026-10-09").unparsed.length);
});

test("form で表示しない旧 summary のカードへ回答を結び付けない", () => {
  const hiddenTree = { id: "hidden-tree", title: "旧まとめ", interaction: "reject", nodes: [{ id: "hidden", name: "hidden()", status: "added" }] };
  const src = { ...source, summary: [{ calls: hiddenTree }] };
  const feedback = [{ tree: "hidden-tree", node: "hidden", action: "reject", text: "", affected: [] }];
  assert.ok(feedbackFindings(feedback, src).length);
  assert.ok(parseAnswerText(answer(feedback), src, "2026-10-09").unparsed.length);
});

test("指示のない旧回答の書式は変えず、未知の対象を持つ受領済みJSONも拒む", (t) => {
  const old = parseAnswerText("- Q1（この変更の扱い）: 進める\n- 補足: なし", source, "2026-10-09");
  assert.equal(Object.hasOwn(old, "feedback"), false);
  const dir = createFixture(t);
  const json = path.join(dir, "src", source.file + ".json");
  const { unparsed, ...received } = parseAnswerText(answer([instruction, rejection]), source, "2026-10-09");
  fs.writeFileSync(json, JSON.stringify({ ...source, answers: received }));
  assert.equal(loadSource(json).findings.length, 0);
  const result = assemblePage(json, { force: true });
  assert.equal(result.ok, true, JSON.stringify(result.findings));
  const html = fs.readFileSync(result.out, "utf8");
  assert.ok(html.includes("入口の検証を先にしてください。"));
  assert.ok(!html.includes("<script>alert(1)</script>"));
  fs.writeFileSync(json, JSON.stringify({ ...source, answers: { ...received, feedback: [{ ...instruction, node: "absent" }] } }));
  assert.ok(loadSource(json).findings.some((f) => f.where === "answers.feedback"));
});
