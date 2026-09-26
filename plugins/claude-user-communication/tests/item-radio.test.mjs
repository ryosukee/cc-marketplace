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
  format: 1, file: "test-f002", type: "form", title: "項目別 radio の試験", project: "test",
  context: ["回答を検証する。"], sections: [{
    kind: "question", heading: "処理をどちらが担当するか", blocks: [], question: {
      label: "処理ごとの担当", text: "各処理の担当を選ぶ。",
      options: [{ label: "React" }, { label: "Go server" }],
      items: [
        { id: "path", label: "path の解釈", recommended: "React" },
        { id: "filter", label: "作業項目の絞り込み", recommended: "Go server" },
      ],
    },
  }],
};

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-communication-item-radio-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, "src"));
  const jsonPath = path.join(dir, "src", "test-f002.json");
  const write = (data) => fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n");
  write(source);
  return { dir, jsonPath, write };
}

test("一つの設問に独立した二択 radio を組み立て、回答を再表示する", (t) => {
  const { dir, jsonPath, write } = fixture(t);
  assert.deepEqual(loadSource(jsonPath).findings, []);
  assert.equal(assemblePage(jsonPath).ok, true);
  let html = fs.readFileSync(path.join(dir, "test-f002.html"), "utf8");
  assert.match(html, /<div class="q" id="q1" data-item-radios="true">/);
  assert.match(html, /<fieldset class="radio-item" data-item="path">/);
  assert.match(html, /type="radio" name="q1-path" value="React"/);
  assert.match(html, /type="radio" name="q1-path" value="Go server"/);
  assert.doesNotMatch(html, /value="__other__"/);

  const answer = '## HTML フォーム回答（項目別 radio の試験）\n- Q1（処理ごとの担当）: 項目別選択: {"path":"React","filter":"Go server"}  ※ メモ\n- 補足: なし';
  const parsed = parseAnswerText(answer, source, "2026-09-27");
  assert.deepEqual(parsed.unparsed, []);
  assert.deepEqual(parsed.items[0], {
    id: "q1", label: "処理ごとの担当", value: null,
    selections: { path: "React", filter: "Go server" }, note: "メモ",
  });
  write({ ...source, answers: { received: "2026-09-27", raw: answer, items: parsed.items, free: null } });
  assert.deepEqual(loadSource(jsonPath).findings, []);
  assert.equal(assemblePage(jsonPath, { force: true }).ok, true);
  html = fs.readFileSync(path.join(dir, "test-f002.html"), "utf8");
  assert.match(html, /type="radio" name="q1-path" value="React" checked disabled/);
  assert.match(html, /type="radio" name="q1-filter" value="Go server" checked disabled/);
  const checked = spawnSync(process.execPath, [path.join(skillRoot, "scripts", "check-page.mjs"), path.join(dir, "test-f002.html")], { encoding: "utf8" });
  assert.equal(checked.status, 0, checked.stdout + checked.stderr);
});

test("項目 ID、二択、回答の ID と値を検査する", (t) => {
  const { jsonPath, write } = fixture(t);
  const findings = (data) => { write(data); return loadSource(jsonPath).findings.map((x) => x.message).join("\n"); };
  assert.match(findings({ ...source, sections: [{ ...source.sections[0], question: { ...source.sections[0].question, multiple: true } }] }), /multiple は置かない/);
  assert.match(findings({ ...source, sections: [{ ...source.sections[0], question: { ...source.sections[0].question, items: null } }] }), /items は項目の配列/);
  assert.match(findings({ ...source, sections: [{ ...source.sections[0], question: { ...source.sections[0].question, options: [{ label: "React" }] } }] }), /options は二つ/);
  assert.match(findings({ ...source, sections: [{ ...source.sections[0], question: { ...source.sections[0].question, items: [{ id: "same", label: "A" }, { id: "same", label: "B" }] } }] }), /重複している/);
  const bad = parseAnswerText('## HTML フォーム回答（試験）\n- Q1（処理ごとの担当）: 項目別選択: {"path":"React","unknown":"Go server"}', source, "2026-09-27");
  assert.equal(bad.unparsed.length, 1);
  const partial = parseAnswerText('## HTML フォーム回答（試験）\n- Q1（処理ごとの担当）: 項目別選択: {"path":"React","filter":null}', source, "2026-09-27");
  assert.deepEqual(partial.unparsed, []);
  assert.deepEqual(partial.items[0].selections, { path: "React", filter: null });
});
