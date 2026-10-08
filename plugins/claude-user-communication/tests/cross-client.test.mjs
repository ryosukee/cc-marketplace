import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { assemblePage, pluginVersion, SKILL_ROOT } from "../skills/html-communication/scripts/lib/assemble.mjs";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = path.join(pluginRoot, "skills", "html-communication");

const environmentVariableFiles = [
  path.join(pluginRoot, "README.md"),
  path.join(skillRoot, "SKILL.md"),
  path.join(skillRoot, "references", "page-format.md"),
  path.join(skillRoot, "scripts", "build-archive.mjs"),
];

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
  const escapedVersion = pluginVersion().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(html, new RegExp(`claude-html-communication ${escapedVersion}`));
  const backHref = html.match(/<a id="back" href="([^"]+)"/)?.[1];
  assert.ok(backHref);
  assert.equal(fileURLToPath(new URL(backHref, pathToFileURL(path.join(dir, "test-r001.html")))), path.join(dir, "index.html"));
});

test("共通雛形が fig 内の画像に拡大 viewer を提供する", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-communication-image-viewer-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const srcDir = path.join(dir, "src");
  fs.mkdirSync(srcDir);
  const jsonPath = path.join(srcDir, "test-r002.json");
  fs.writeFileSync(jsonPath, JSON.stringify({
    format: 1,
    file: "test-r002",
    type: "report",
    title: "画像 viewer の試験",
    project: "test",
    context: ["画像の拡大操作を検証する。"],
    summary: ["共通雛形が操作を提供する。"],
    sections: [{
      kind: "explain",
      heading: "画像を拡大できる",
      blocks: [{ fig: { id: "sample", caption: "拡大対象の画像" } }],
    }],
  }));
  fs.writeFileSync(path.join(srcDir, "test-r002.figures.html"), [
    '<template data-fig="sample">',
    '  <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="試験画像">',
    '</template>',
  ].join("\n"));

  const result = assemblePage(jsonPath);
  assert.equal(result.ok, true, JSON.stringify(result.findings));
  const html = fs.readFileSync(path.join(dir, "test-r002.html"), "utf8");
  assert.equal((html.match(/<dialog id="image-viewer"/g) || []).length, 1);
  assert.match(html, /document\.querySelectorAll\('\.fig img'\)/);
  assert.match(html, /event\.key !== 'Enter' && event\.key !== ' '/);
  assert.match(html, /viewer\.src = img\.currentSrc \|\| img\.src/);
  assert.match(html, /dialog\.addEventListener\('close'/);
  assert.match(html, /<img src="data:image\/gif;base64,[^"]+" alt="試験画像">/);
});

test("form は今回の説明を前提と分け、旧 summary は表示しない", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-communication-form-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const srcDir = path.join(dir, "src");
  fs.mkdirSync(srcDir);
  const base = {
    format: 1,
    type: "form",
    title: "フォームの試験",
    project: "test",
    context: ["フォームの構造を検証する。"],
    formIntro: ["このフォームで選択肢を確認する。"],
    sections: [{
      kind: "question",
      heading: "どちらを選ぶか",
      blocks: ["判断材料を示す。"],
      question: { label: "選択", text: "どちらを選ぶか。", options: [{ label: "案 A", recommended: true }, { label: "案 B" }] },
    }],
  };

  for (const [file, extra, hasIntro] of [
    ["test-f001", {}, true],
    ["test-f002", { summary: ["表示してはいけない旧データ"] }, true],
    ["test-f003", { formIntro: undefined }, false],
  ]) {
    const jsonPath = path.join(srcDir, `${file}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify({ ...base, ...extra, file }));
    const result = assemblePage(jsonPath);
    assert.equal(result.ok, true, JSON.stringify(result.findings));
    const html = fs.readFileSync(path.join(dir, `${file}.html`), "utf8");
    const main = html.match(/<main>[\s\S]*<\/main>/)?.[0] || "";
    if (hasIntro) {
      assert.match(main, /このフォームについて/);
      assert.match(main, /このフォームで選択肢を確認する。/);
    } else {
      assert.doesNotMatch(main, /このフォームについて/);
    }
    assert.doesNotMatch(main, /推奨案のまとめ/);
    assert.doesNotMatch(main, /表示してはいけない旧データ/);
    assert.equal((html.match(/<dialog id="image-viewer"/g) || []).length, 1);
  }
});

test("環境変数名が CodingAgent に依存しない", () => {
  const source = environmentVariableFiles
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  assert.match(source, /HTML_COMMUNICATION_DIR/);
  assert.match(source, /HTML_COMMUNICATION_BASE_URL/);
  assert.doesNotMatch(source, /CLAUDE_HTML_COMMUNICATION_(?:DIR|BASE_URL)/);
});

test("build-archive が HTML_COMMUNICATION_DIR を使う", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-communication-archive-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.copyFileSync(path.join(skillRoot, "templates", "index.html"), path.join(dir, "index.html"));
  const result = spawnSync(
    process.execPath,
    [path.join(skillRoot, "scripts", "build-archive.mjs")],
    { env: { ...process.env, HTML_COMMUNICATION_DIR: dir }, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.ok(fs.existsSync(path.join(dir, "archive.html")));
});

test("図の CSS が fallback 無しで参照する未定義 custom property を拒否する", (t) => {
  const htmlPath = path.join(pluginRoot, "tests", "fixtures", "undefined-figure-property.html");
  const result = spawnSync("bash", [path.join(skillRoot, "scripts", "validate-page.sh"), htmlPath], { encoding: "utf8" });
  assert.equal(result.status, 1, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.total, 1);
  assert.equal(output.custom[0].findings[0].check, "custom-property-reference");
  assert.match(output.custom[0].findings[0].message, /--missing/);
  assert.doesNotMatch(result.stdout, /--optional|--nested/);
  assert.doesNotMatch(result.stdout, /--example-in-string/);
});

test("図の CSS は共通定義・図内定義・登録済み property・直接の fallback を許可する", (t) => {
  const htmlPath = path.join(pluginRoot, "tests", "fixtures", "defined-figure-property.html");
  const result = spawnSync(process.execPath, [path.join(skillRoot, "scripts", "check-page.mjs"), htmlPath], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(JSON.parse(result.stdout).total, 0);
});

test("Tailwind の escape を含む selector より後ろの未定義参照を検出する", () => {
  const htmlPath = path.join(pluginRoot, "tests", "fixtures", "tailwind-escaped-selector.html");
  const result = spawnSync(process.execPath, [path.join(skillRoot, "scripts", "check-page.mjs"), htmlPath], { encoding: "utf8" });
  assert.equal(result.status, 1, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.total, 1);
  assert.match(output.results[0].findings[0].message, /--missing-after-selector/);
});

test("10pxの文字は生成元の単独セレクタだけに許可する", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-version-font-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const [name, css, expected] of [
    ["version", "#ver { font-size: 10px; }", 0],
    ["nested", "@media screen { #ver { font-size: 10px; } }", 0],
    ["body", "body { font-size: 10px; }", 1],
    ["combined", "#ver, p { font-size: 10px; }", 1],
    ["nested-body", "#ver { & ~ main { font-size: 10px; } }", 1],
    ["other-size", "#ver { font-size: 9px; }", 1],
  ]) {
    const file = path.join(dir, `${name}.html`);
    fs.writeFileSync(file, `<!DOCTYPE html><html lang="ja"><head><title>検査</title><style>${css}</style></head><body></body></html>`);
    const result = spawnSync(process.execPath, [path.join(skillRoot, "scripts/check-page.mjs"), file], { encoding: "utf8" });
    assert.equal(result.status, expected, result.stderr || result.stdout);
    assert.equal(JSON.parse(result.stdout).results.flatMap((r) => r.findings).filter((f) => f.check === "font-size-steps").length, expected);
  }
});

test("長いコード原文はセル制限から外すが、同じセルの説明文は検査する", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-code-cell-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const [name, cell, expected] of [
    ["code", `<code>${"x".repeat(100)}</code>`, 0],
    ["prose", "説明".repeat(30), 1],
    ["mixed", `<code>${"x".repeat(100)}</code>${"説明".repeat(30)}`, 1],
  ]) {
    const file = path.join(dir, `${name}.html`);
    fs.writeFileSync(file, `<html><body><table><tr><td>${cell}</td></tr></table></body></html>`);
    const result = spawnSync(process.execPath, [path.join(skillRoot, "scripts/check-page.mjs"), file], { encoding: "utf8" });
    const findings = JSON.parse(result.stdout).results.flatMap((r) => r.findings);
    assert.equal(findings.filter((f) => f.check === "long-cells").length, expected, result.stdout);
  }
});
