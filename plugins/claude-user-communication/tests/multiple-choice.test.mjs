import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { assemblePage } from "../skills/html-communication/scripts/lib/assemble.mjs";
import { loadSource, parseAnswerText } from "../skills/html-communication/scripts/lib/page-source.mjs";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "skills", "html-communication");
const source = {
  format: 1, file: "test-f001", type: "form", title: "複数選択の試験", project: "test",
  context: ["回答を検証する。"], sections: [
    { kind: "question", heading: "何を対象にするか", blocks: [], question: {
      label: "対象", text: "対象をすべて選ぶ。", multiple: true,
      options: [{ label: "進捗", recommended: true }, { label: "決定事項", recommended: true }],
    } },
    { kind: "question", heading: "どの方法にするか", blocks: [], question: {
      label: "方法", text: "方法を一つ選ぶ。",
      options: [{ label: "案 A", recommended: true }, { label: "案 B" }],
    } },
  ],
};

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-communication-multiple-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, "src"));
  const jsonPath = path.join(dir, "src", "test-f001.json");
  const write = (data) => fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n");
  write(source);
  return { dir, jsonPath, write };
}

test("checkbox と radio を組み立て、回答を記録して選択済みで固定する", (t) => {
  const { dir, jsonPath } = fixture(t);
  assert.deepEqual(loadSource(jsonPath).findings, []);
  assert.equal(assemblePage(jsonPath).ok, true);
  let html = fs.readFileSync(path.join(dir, "test-f001.html"), "utf8");
  assert.match(html, /<div class="q" id="q1" data-multiple="true">/);
  assert.match(html, /type="checkbox" name="q1" value="進捗"/);
  assert.match(html, /type="checkbox" name="q1" value="__other__"/);
  assert.match(html, /type="radio" name="q2" value="案 A"/);
  const uncheckedPath = path.join(dir, "unchecked.html");
  fs.writeFileSync(uncheckedPath, html.replace('type="checkbox" name="q1" value="進捗"', 'type="checkbox" name="q1" value="進捗" checked'));
  const unchecked = spawnSync(process.execPath, [path.join(skillRoot, "scripts", "check-page.mjs"), uncheckedPath], { encoding: "utf8" });
  assert.equal(unchecked.status, 1);
  assert.ok(JSON.parse(unchecked.stdout).results[0].findings.some((f) => f.check === "default-checked"));

  const index = fs.readFileSync(path.join(skillRoot, "templates", "index.html"), "utf8")
    .replace("const entries = [", 'const entries = [\n  { file: "test-f001.html", status: "awaiting", type: "form", title: "複数選択の試験", project: "test", created: "2026-09-24", questions: 2 },');
  fs.writeFileSync(path.join(dir, "index.html"), index);
  const answer = '## HTML フォーム回答（複数選択の試験）\n- Q1（対象）: 複数選択: {"values":["進捗","決定事項"],"other":"追加 ※ 情報"}  ※ メモ\n- Q2（方法）: 案 B\n- 補足: なし';
  const answerPath = path.join(dir, "answer.txt");
  fs.writeFileSync(answerPath, answer);
  const result = spawnSync(process.execPath, [path.join(skillRoot, "scripts", "record-answer.mjs"), jsonPath, "--answer", answerPath, "--date", "2026-09-24"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const recorded = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  assert.equal(recorded.answers.raw, answer);
  assert.deepEqual(recorded.answers.items[0], { id: "q1", label: "対象", value: null, multiple: ["進捗", "決定事項"], other: "追加 ※ 情報", note: "メモ" });
  assert.deepEqual(recorded.answers.items[1], { id: "q2", label: "方法", value: "案 B" });
  assert.deepEqual(loadSource(jsonPath).findings, []);
  const checkedSource = spawnSync(process.execPath, [path.join(skillRoot, "scripts", "check-source.mjs"), jsonPath], { encoding: "utf8" });
  assert.equal(checkedSource.status, 0, checkedSource.stdout + checkedSource.stderr);
  html = fs.readFileSync(path.join(dir, "test-f001.html"), "utf8");
  assert.match(html, /type="checkbox" name="q1" value="進捗" checked disabled/);
  assert.match(html, /type="checkbox" name="q1" value="決定事項" checked disabled/);
  assert.match(html, /type="checkbox" name="q1" value="__other__" checked disabled/);
  assert.match(html, /type="radio" name="q2" value="案 B" checked disabled/);
  assert.match(fs.readFileSync(path.join(dir, "index.html"), "utf8"), /status: "answered"/);
  const custom = spawnSync(process.execPath, [path.join(skillRoot, "scripts", "check-page.mjs"), path.join(dir, "test-f001.html")], { encoding: "utf8" });
  assert.equal(custom.status, 0, custom.stdout + custom.stderr);
  assert.equal(JSON.parse(custom.stdout).total, 0);

  const tampered = path.join(dir, "tampered.html");
  fs.writeFileSync(tampered, html.replace('type="checkbox" name="q1" value="進捗" checked disabled', 'type="checkbox" name="q1" value="進捗" checked'));
  const rejected = spawnSync(process.execPath, [path.join(skillRoot, "scripts", "check-page.mjs"), tampered], { encoding: "utf8" });
  assert.equal(rejected.status, 1);
  assert.ok(JSON.parse(rejected.stdout).results[0].findings.some((f) => f.check === "default-checked"));
});

test("複数選択の不正値と重複、radio の複数推奨を拒否する", (t) => {
  const { jsonPath, write } = fixture(t);
  const check = (data) => { write(data); return loadSource(jsonPath).findings.map((x) => x.message).join("\n"); };
  assert.match(check({ ...source, sections: [{ ...source.sections[0], question: { ...source.sections[0].question, multiple: "true" } }, source.sections[1]] }), /multiple は真偽値/);
  assert.match(check({ ...source, sections: [{ ...source.sections[0], question: { ...source.sections[0].question, multiple: null } }, source.sections[1]] }), /multiple は真偽値/);
  assert.match(check({ ...source, sections: [source.sections[0], { ...source.sections[1], question: { ...source.sections[1].question, options: [{ label: "案 A", recommended: true }, { label: "案 B", recommended: true }] } }] }), /推奨が 2 個/);
  assert.match(check({ ...source, sections: [{ ...source.sections[0], question: { ...source.sections[0].question, options: [{ label: "同じ" }, { label: "同じ" }] } }, source.sections[1]] }), /同じ設問/);
  const answer = '## HTML フォーム回答（試験）\n- Q1（対象）: 複数選択: {"values":["進捗","進捗"]}';
  assert.equal(parseAnswerText(answer, source, "2026-09-24").unparsed.length, 1);
  const otherOnly = parseAnswerText('## HTML フォーム回答（試験）\n- Q1（対象）: 複数選択: {"values":[],"other":""}\n- Q2（方法）: 未回答', source, "2026-09-24");
  assert.deepEqual(otherOnly.unparsed, []);
  assert.deepEqual(otherOnly.items[0].multiple, []);
  assert.equal(otherOnly.items[0].other, "");
  assert.equal(otherOnly.items[1].value, null);
  const invalid = { ...source, answers: { received: "2026-09-24", raw: answer, free: null, items: [{ id: "q1", label: "対象", value: null, multiple: ["進捗", "進捗"] }] } };
  assert.match(check(invalid), /重複している/);
});
