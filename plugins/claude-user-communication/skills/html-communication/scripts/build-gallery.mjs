#!/usr/bin/env node
// 見せ方のパターン集を 1 枚の HTML に並べる。
// 雛形の基盤 CSS + 全パターンの style.css を連結し、各パターンの example.html を並べる。
// 生成物は self-contained（外部ファイルを参照しない）。
//
// usage: node build-gallery.mjs <出力先パス>

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..");
const templatePath = join(skillRoot, "templates", "page.html");
const patternsDir = join(skillRoot, "references", "patterns");

const out = process.argv[2];
if (!out) {
  console.error("usage: node build-gallery.mjs <出力先パス>");
  process.exit(2);
}

// 雛形から基盤 CSS を取り出す。パターンの CSS はここのトークンを参照している
const template = readFileSync(templatePath, "utf8");
const m = template.match(/<style>([\s\S]*?)<\/style>/);
if (!m) {
  console.error("雛形に style 要素が見つからない: " + templatePath);
  process.exit(2);
}
const baseCss = m[1];

const names = readdirSync(patternsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

if (names.length === 0) {
  console.error("パターンが 1 つも無い: " + patternsDir);
  process.exit(1);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const parts = [];
const css = [];
for (const name of names) {
  const dir = join(patternsDir, name);
  const cssPath = join(dir, "style.css");
  const examplePath = join(dir, "example.html");
  const readmePath = join(dir, "README.md");
  for (const p of [cssPath, examplePath, readmePath]) {
    if (!existsSync(p)) {
      console.error("必須ファイルが無い: " + p);
      process.exit(1);
    }
  }
  css.push("/* ===== " + name + " ===== */\n" + readFileSync(cssPath, "utf8"));

  // README の 1 行目の見出しと、その次の段落を要約として使う
  const readme = readFileSync(readmePath, "utf8").split("\n");
  const title = (readme.find((l) => l.startsWith("# ")) || "# " + name).slice(2).trim();
  const start = readme.findIndex((l) => l.startsWith("# ")) + 1;
  const summary = readme.slice(start).join("\n").trim().split("\n\n")[0].replace(/\n/g, " ");

  parts.push(
    '<section class="pattern">\n' +
      '<h2>' + esc(title) + '</h2>\n' +
      '<p class="d">' + esc(summary) + '</p>\n' +
      '<p class="d">条件と出典は <code>references/patterns/' + esc(name) + '/README.md</code></p>\n' +
      '<div class="stage">\n' + readFileSync(examplePath, "utf8") + '</div>\n' +
      '<details><summary>style.css</summary>\n<pre><code>' +
      esc(readFileSync(cssPath, "utf8")) + '</code></pre></details>\n' +
      '<details><summary>example.html</summary>\n<pre><code>' +
      esc(readFileSync(examplePath, "utf8")) + '</code></pre></details>\n' +
      '</section>'
  );
}

const html = [
  '<!DOCTYPE html>',
  '<html lang="ja">',
  '<head>',
  '<meta charset="UTF-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  '<meta name="color-scheme" content="light dark">',
  '<title>見せ方のパターン集</title>',
  '<style>',
  baseCss,
  css.join("\n"),
  '  main { max-width: 720px; padding-bottom: 40px; }',
  '  .pattern { margin: 0 0 3em; }',
  '  .stage { border: 1px dashed var(--rule); border-radius: 8px; padding: 18px; margin: 12px 0; }',
  '  details { margin: 8px 0; font-size: 0.875em; }',
  '  summary { cursor: pointer; color: var(--sub); }',
  '</style>',
  '</head>',
  '<body>',
  '<main>',
  '<h1>見せ方のパターン集</h1>',
  '<p class="d">html-communication の雛形が持たない一点物の見せ方。' + names.length + ' 件。' +
    'このページは build-gallery.mjs が生成する。手で編集しない。</p>',
  parts.join("\n"),
  '</main>',
  '</body>',
  '</html>',
  '',
].join("\n");

writeFileSync(out, html, "utf8");
console.log(JSON.stringify({ patterns: names, out: resolve(out) }, null, 2));
