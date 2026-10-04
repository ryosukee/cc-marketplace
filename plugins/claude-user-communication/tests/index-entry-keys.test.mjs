import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { assemblePage } from "../skills/html-communication/scripts/lib/assemble.mjs";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "skills", "html-communication");
const template = fs.readFileSync(path.join(skillRoot, "templates", "index.html"), "utf8");

function fixture(t, entry) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-communication-index-keys-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, "src"));
  const jsonPath = path.join(dir, "src", "test-r001.json");
  fs.writeFileSync(jsonPath, JSON.stringify({
    format: 1, file: "test-r001", type: "report", title: "引用符つきキーの試験", project: "test",
    context: ["一覧のエントリの書き方を検証する。"], summary: ["どちらの書き方でも状態を更新する。"],
    sections: [{ kind: "explain", heading: "状態を更新する", blocks: ["本文。"] }],
  }));
  assert.equal(assemblePage(jsonPath).ok, true);
  fs.writeFileSync(path.join(dir, "index.html"), template.replace("const entries = [", `const entries = [\n${entry}`));
  return { dir, jsonPath };
}

const confirm = (jsonPath) => spawnSync(process.execPath,
  [path.join(skillRoot, "scripts", "record-answer.mjs"), jsonPath, "--confirm", "読んだ。確認済みにして", "--date", "2026-10-04"],
  { encoding: "utf8" });

test("引用符つきキーの一覧でも report を確認済みにし、同じ書き方で statusChanged を足す", (t) => {
  const { dir, jsonPath } = fixture(t, [
    "  {",
    '    "file": "test-r001.html",',
    '    "project": "test",',
    '    "type": "report",',
    '    "status": "unconfirmed",',
    '    "skillVersion": "0.0.0"',
    "  },",
  ].join("\n"));
  const result = confirm(jsonPath);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const index = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  assert.match(index, /"status": "confirmed",\n {4}"statusChanged": "2026-10-04"/);
  assert.match(result.stdout, /\(entries 1\)/);
});

test("識別子のキーの一覧は従来どおり更新する", (t) => {
  const { dir, jsonPath } = fixture(t,
    '  { file: "test-r001.html", status: "unconfirmed", type: "report", project: "test", statusChanged: "2026-09-01" },');
  const result = confirm(jsonPath);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const index = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  assert.match(index, /status: "confirmed", type: "report", project: "test", statusChanged: "2026-10-04"/);
  assert.match(result.stdout, /\(entries 1\)/);
});
