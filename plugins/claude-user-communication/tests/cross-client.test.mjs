import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { assemblePage, pluginVersion, SKILL_ROOT } from "../skills/html-communication/scripts/lib/assemble.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = path.join(pluginRoot, "skills", "html-communication");

test("両 manifest が同じ共有 skill と版を指す", () => {
  const claude = JSON.parse(fs.readFileSync(path.join(pluginRoot, ".claude-plugin", "plugin.json"), "utf8"));
  const codex = JSON.parse(fs.readFileSync(path.join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8"));
  assert.equal(SKILL_ROOT, skillRoot);
  assert.equal(pluginVersion(), claude.version);
  assert.equal(codex.version, claude.version);
  assert.equal(codex.skills, "./skills/");
  assert.ok(fs.existsSync(path.join(skillRoot, "SKILL.md")));
  for (const name of ["sentence-review", "page-review"]) {
    assert.ok(fs.existsSync(path.join(pluginRoot, "references", `${name}.md`)));
  }
});

test("共有 script が report を生成し、同じ版を記録する", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-communication-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const srcDir = path.join(dir, "src");
  fs.mkdirSync(srcDir);
  const jsonPath = path.join(srcDir, "test-r001.json");
  fs.writeFileSync(jsonPath, JSON.stringify({
    format: 1,
    file: "test-r001",
    type: "report",
    title: "共有ページの試験",
    project: "test",
    context: ["生成したページを検証する。"],
    summary: ["同じスクリプトを両方で使う。"],
    sections: [{ kind: "explain", heading: "生成結果を確認する", blocks: ["本文を組み立てる。"] }],
  }));
  const result = assemblePage(jsonPath);
  assert.equal(result.ok, true, JSON.stringify(result.findings));
  const html = fs.readFileSync(path.join(dir, "test-r001.html"), "utf8");
  assert.match(html, /共有ページの試験/);
  assert.match(html, new RegExp(`claude-html-communication ${pluginVersion().replaceAll(".", "\\.")}`));
  const backHref = html.match(/<a id="back" href="([^"]+)"/)?.[1];
  assert.ok(backHref);
  assert.equal(fileURLToPath(new URL(backHref, pathToFileURL(path.join(dir, "test-r001.html")))), path.join(dir, "index.html"));
});
