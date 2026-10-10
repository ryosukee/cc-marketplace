import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { assemblePage } from "../skills/html-communication/scripts/lib/assemble.mjs";
import { loadSource, parseAnswerText } from "../skills/html-communication/scripts/lib/page-source.mjs";
import { validNumber, numberGridIndex } from "../skills/html-communication/scripts/lib/answer-controls.mjs";

export const source = JSON.parse(fs.readFileSync(new URL("../docs/features/demo-f003.json", import.meta.url), "utf8"));
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-answer-controls-source-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, "src"));
  const json = path.join(dir, "src", `${source.file}.json`);
  const write = data => fs.writeFileSync(json, JSON.stringify(data));
  write(source);
  return { dir, json, write };
}
const copy = () => structuredClone(source);
const text = (rank, number) => `## HTML フォーム回答（見本）\n- Q1（始め方）: 調査から\n- Q2（優先順位）: ${rank}\n- Q3（試作の時間）: ${number}\n- 補足: なし`;
const order = source.sections[1].question.options.map(o => o.label);
const skillRoot = fileURLToPath(new URL("../skills/html-communication/", import.meta.url));

test("条件説明は本文と脚注を残し、順位/数値だけの form に共通 asset を含める", t => {
  const { dir, json, write } = fixture(t);
  const data = copy();
  data.sections[0].blocks[1].conditional.blocks.push("出典。[^fact]");
  data.footnotes = { fact: "条件外でも読む出典。" };
  data.sections.push({ kind: "explain", heading: "該当する場合の手順", when: { question: "q1", equals: "調査から" }, blocks: ["説明の全文。"] });
  write(data);
  assert.deepEqual(loadSource(json).findings, []);
  const result = assemblePage(json);
  assert.equal(result.ok, true, JSON.stringify(result.findings));
  const html = fs.readFileSync(result.out, "utf8");
  assert.match(html, /data-scope="answer-controls"/);
  assert.match(html, /data-when="/);
  assert.match(html, /id="fnref-1-1"/);
  assert.match(html, /id="fn-1"/);
  assert.equal((html.match(/<details class="qd"/g) || []).length, 3);
  assert.equal((html.match(/data-rank-value=/g) || []).length, 3);
  assert.match(html, /data-number-input min="0" max="8" step="0.5" value="2"/);
  assert.match(html, /data-confirmed="false"/);
  // 通常の選択だけなら、条件も外すことで追加 asset が不要になる。
  const basic = copy(); basic.sections = [basic.sections[0]]; basic.sections[0].blocks = ["判断材料。"];
  write(basic);
  assert.equal(assemblePage(json, { force: true }).ok, true);
  assert.doesNotMatch(fs.readFileSync(path.join(dir, `${source.file}.html`), "utf8"), /data-scope="answer-controls"/);
});

test("順位/数値のコピー payload と補足を往復し、受領済みでは入力を固定する", t => {
  const { json, write } = fixture(t);
  const raw = text(`順位: ${JSON.stringify({ order: [...order].reverse() })}  ※ 順位への補足`, '数値: {"value":0}  ※ 0も回答');
  const parsed = parseAnswerText(raw, source, "2026-10-10");
  assert.deepEqual(parsed.unparsed, []);
  assert.deepEqual(parsed.items[1].order, [...order].reverse());
  assert.equal(parsed.items[1].value, null);
  assert.equal(parsed.items[1].note, "順位への補足");
  assert.equal(parsed.items[2].number, 0);
  assert.equal(parsed.items[2].note, "0も回答");
  delete parsed.unparsed;
  write({ ...source, answers: parsed });
  assert.deepEqual(loadSource(json).findings, []);
  const result = assemblePage(json);
  assert.equal(result.ok, true, JSON.stringify(result.findings));
  const html = fs.readFileSync(result.out, "utf8");
  assert.match(html, /data-number-input min="0" max="8" step="0.5" value="0" disabled/);
  assert.match(html, /data-answer-confirm hidden disabled/);
  assert.equal((html.match(/data-confirmed="true"/g) || []).length, 2);
  const empty = parseAnswerText(text("未回答", "未回答"), source, "2026-10-10");
  assert.equal(empty.items[1].order, null);
  assert.equal(empty.items[2].number, null);
});

test("重複/欠落/未知順位、壊れたJSON/数値/余分なkeyの回答を拒否する", () => {
  const invalidRanks = [
    { order: [order[0], order[0], order[2]] }, { order: order.slice(1) }, { order: [...order, "未知"] },
    { order: [order[0], order[1], "未知"] }, { order: order, other: "不正" }, { order: null }, { order: [1, 2, 3] },
  ];
  for (const payload of invalidRanks) assert.ok(parseAnswerText(text(`順位: ${JSON.stringify(payload)}`, "未回答"), source, "date").unparsed.length, JSON.stringify(payload));
  for (const payload of ['{"value":-0.5}', '{"value":8.5}', '{"value":0.25}', '{"value":"2"}', '{"value":null}', '{"value":1e999}', '{"value":2,"extra":1}', '{"value":NaN}', '[2]', '{"value":2', '{"value":2} garbage']) {
    assert.ok(parseAnswerText(text("未回答", `数値: ${payload}`), source, "date").unparsed.length, payload);
  }
  // JSON 内の「※」と波括弧は、行末の補足区切りとして扱わない。
  const data = copy(); data.sections[1].question.options[0].label = '項目  ※ {"内側"}';
  const special = data.sections[1].question.options.map(o => o.label);
  const parsed = parseAnswerText(text(`順位: ${JSON.stringify({ order: special })}  ※ 補足`, "未回答"), data, "date");
  assert.deepEqual(parsed.unparsed, []);
  assert.deepEqual(parsed.items[1].order, special);
  assert.equal(parsed.items[1].note, "補足");
});

test("数値の境界、負数、小数step、非有限値を同じ規則で検査する", () => {
  const spec = { min: -0.3, max: 0.3, step: 0.1 };
  for (const n of [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3]) assert.equal(validNumber(n, spec), true, n);
  for (const n of [NaN, Infinity, -Infinity, -0.31, 0.31, 0.15, "0"]) assert.equal(validNumber(n, spec), false, String(n));
  const tiny = { min: 0, max: 0.8, step: 1e-9 };
  assert.equal(validNumber(0.7, tiny), true);
  for (const n of [0.0000000005, 0.7000000005, 0.7999999995]) assert.equal(validNumber(n, tiny), false, n);
  const decimal = { min: 0, max: 1, step: 0.1 };
  assert.equal(numberGridIndex(0.30000000000000004, decimal), numberGridIndex(0.3, decimal));
  assert.equal(validNumber(0.35, decimal), false);
  // スケールが大きくても、単純な相対誤差の許容で半刻みを通さない。
  assert.equal(validNumber(700000000000000.5, { min: 0, max: 8e14, step: 1 }), false);
});

test("不正な宣言・条件参照・受領payloadを source 検査で拒否する", t => {
  const { json, write } = fixture(t);
  const reject = (mutate) => {
    const data = copy(); mutate(data); write(data);
    assert.ok(loadSource(json).findings.length, JSON.stringify(data));
    assert.equal(assemblePage(json, { force: true }).ok, false);
  };
  for (const change of [
    q => { q.number.step = 0; }, q => { q.number.step = -1; }, q => { q.number.max = q.number.min; },
    q => { q.number.initial = 0.25; }, q => { q.number.initial = 9; }, q => { q.number.max = 8.25; },
    q => { q.number.extra = true; }, q => { q.multiple = false; }, q => { q.options = []; },
  ]) reject(data => change(data.sections[2].question));
  reject(data => { data.sections[1].question.options[1].label = order[0]; });
  reject(data => { data.sections[1].question.items = []; });
  reject(data => { data.sections[1].question.options = [{ label: "一つ" }]; });
  for (const when of [null, { question: "q9", equals: "調査から" }, { question: "q1", equals: "未知" },
    { question: "q1", equals: "調査から", expression: "true" }, { question: "q1", equals: "調査から", item: "unknown" },
    { question: "q2", equals: order[0] }, { question: "q3", equals: "2" }, { question: "q3", equals: 0.25 }]) {
    reject(data => { data.sections[0].blocks[1].conditional.when = when; });
  }
  reject(data => { data.sections[0].when = { question: "q1", equals: "調査から" }; });
  reject(data => { data.sections[0].question.when = { question: "q1", equals: "調査から" }; });
  reject(data => { data.type = "report"; data.summary = ["概要。"]; });
  const parsed = parseAnswerText(text(`順位: ${JSON.stringify({ order })}`, '数値: {"value":2}'), source, "date");
  delete parsed.unparsed;
  for (const change of [a => { a.items[1].order = [order[0]]; }, a => { a.items[1].extra = "bad"; }, a => { a.items[2].number = 0.25; }, a => { delete a.items[2].number; }, a => { a.items[2].note = {}; }]) {
    reject(data => { data.answers = structuredClone(parsed); change(data.answers); });
  }
});

test("条件は複数選択と項目別選択の既知の値を参照できる", t => {
  const { json, write } = fixture(t);
  const data = copy();
  data.sections[0].question.multiple = true;
  data.sections.push({ kind: "question", heading: "誰が担当するか", blocks: [{ conditional: { title: "担当の補足", when: { question: "q4", item: "owner", equals: "自分" }, blocks: ["説明。"] } }], question: { label: "担当", text: "担当を選ぶ。", options: [{ label: "自分" }, { label: "他の人" }], items: [{ id: "owner", label: "担当者" }] } });
  write(data);
  assert.deepEqual(loadSource(json).findings, []);
  assert.equal(assemblePage(json).ok, true);
});

test("共通の受領CLIが順位/数値の全文を保存し、HTML/index/archiveを揃える", t => {
  const { dir, json } = fixture(t);
  const index = fs.readFileSync(path.join(skillRoot, "templates/index.html"), "utf8")
    .replace("const entries = [", `const entries = [\n  { file: "${source.file}.html", status: "awaiting", type: "form", title: "回答操作", project: "test", created: "2026-10-10", questions: 3 },`);
  fs.writeFileSync(path.join(dir, "index.html"), index);
  const raw = text(`順位: ${JSON.stringify({ order })}  ※ 順位への補足`, '数値: {"value":0}  ※ 数値への補足');
  const answerPath = path.join(dir, "answer.txt");
  fs.writeFileSync(answerPath, raw);
  const result = spawnSync(process.execPath, [path.join(skillRoot, "scripts/record-answer.mjs"), json, "--answer", answerPath, "--date", "2026-10-10"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const recorded = JSON.parse(fs.readFileSync(json, "utf8"));
  assert.equal(recorded.answers.raw, raw);
  assert.deepEqual(recorded.answers.items[1].order, order);
  assert.equal(recorded.answers.items[2].number, 0);
  assert.deepEqual(loadSource(json).findings, []);
  const html = fs.readFileSync(path.join(dir, `${source.file}.html`), "utf8");
  assert.match(html, /data-number-input min="0" max="8" step="0.5" value="0" disabled/);
  assert.match(fs.readFileSync(path.join(dir, "index.html"), "utf8"), /status: "answered"/);
  for (const [script, input] of [["check-source.mjs", json], ["check-page.mjs", path.join(dir, `${source.file}.html`)]]) {
    const checked = spawnSync(process.execPath, [path.join(skillRoot, "scripts", script), input], { encoding: "utf8" });
    assert.equal(checked.status, 0, checked.stdout + checked.stderr);
  }
});
