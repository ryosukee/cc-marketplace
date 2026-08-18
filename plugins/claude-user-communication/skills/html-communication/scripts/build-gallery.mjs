#!/usr/bin/env node
// 見せ方のパターン集を HTML に起こす。
//
// 出力は 2 種類。
//   一覧: 引数で指定したパス（例 gallery.html）。全パターンを 1 枚に並べる
//   個別: 同じディレクトリに <stem>-<pattern-name>.html。1 パターンだけを載せる
// 個別ページを分けるのは、パターンが増えたときに 1 つだけを邪魔なく確認するため。
// 共通ページディレクトリはサブディレクトリを作らない規定なので、接頭辞で並べる。
//
// 生成物は self-contained（外部ファイルを参照しない）。
//
// 本文の器に main を使わない。雛形の CSS は main を 3 pane のグリッドにする
// メディアクエリを持っており、連結するとこのページの本文まで 3 列に割れる。
// 器を .gallery にすれば、雛形のページレイアウト用セレクタ（main / #bar / #q-pane /
// #fn-pane）がどれも一致しない。持ち込みたいのは色トークンと文字組だけ。
//
// usage: node build-gallery.mjs <一覧の出力先パス>

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..");
const templatePath = join(skillRoot, "templates", "page.html");
const patternsDir = join(skillRoot, "references", "patterns");

const out = process.argv[2];
if (!out) {
  console.error("usage: node build-gallery.mjs <一覧の出力先パス>");
  process.exit(2);
}
const outDir = dirname(resolve(out));
const stem = basename(out).replace(/\.html$/, "");

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

const GALLERY_CSS = [
  "  .gallery { max-width: 720px; margin: 0 auto; padding: 24px 20px 60px; }",
  "  .pattern { margin: 0 0 3.4em; }",
  "  .pattern > h2 { margin-top: 0; }",
  "  .stage { border: 1px dashed var(--rule); border-radius: 8px; padding: 18px; margin: 12px 0; }",
  "  details { margin: 8px 0; font-size: 0.875em; }",
  "  summary { cursor: pointer; color: var(--sub); }",
  "  .navback { display: inline-block; font-size: 0.875em; margin-bottom: 18px; }",
].join("\n");

// 1 枚の HTML を組み立てる。css は基盤 + 必要なパターンぶんだけを渡す
function page(title, css, body) {
  return [
    "<!DOCTYPE html>",
    '<html lang="ja">',
    "<head>",
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta name="color-scheme" content="light dark">',
    "<title>" + esc(title) + "</title>",
    "<style>",
    css,
    GALLERY_CSS,
    "</style>",
    "</head>",
    "<body>",
    '<div class="gallery">',
    body,
    "</div>",
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

// README の 1 行目の見出しと、その次の段落を要約として取り出す
function meta(readme) {
  const lines = readme.split("\n");
  const i = lines.findIndex((l) => l.startsWith("# "));
  const title = i < 0 ? "" : lines[i].slice(2).trim();
  const rest = lines.slice(i + 1).join("\n").trim();
  const summary = rest.split("\n\n")[0].replace(/\n/g, " ");
  return { title, summary };
}

const loaded = names.map((name) => {
  const dir = join(patternsDir, name);
  const paths = {
    css: join(dir, "style.css"),
    example: join(dir, "example.html"),
    readme: join(dir, "README.md"),
  };
  for (const p of Object.values(paths)) {
    if (!existsSync(p)) {
      console.error("必須ファイルが無い: " + p);
      process.exit(1);
    }
  }
  const css = readFileSync(paths.css, "utf8");
  const example = readFileSync(paths.example, "utf8");
  const { title, summary } = meta(readFileSync(paths.readme, "utf8"));
  return { name, css, example, title: title || name, summary, file: stem + "-" + name + ".html" };
});

function sourceBlocks(p) {
  return (
    "<details><summary>style.css</summary>\n<pre><code>" +
    esc(p.css) +
    "</code></pre></details>\n" +
    "<details><summary>example.html</summary>\n<pre><code>" +
    esc(p.example) +
    "</code></pre></details>"
  );
}

const written = [];

// 個別ページ。基盤 + そのパターンの CSS だけを載せる
for (const p of loaded) {
  const body = [
    '<a class="navback" href="./' + esc(stem) + '.html">← 見せ方のパターン集</a>',
    "<h1>" + esc(p.title) + "</h1>",
    '<p class="d">' + esc(p.summary) + "</p>",
    '<p class="d">条件と出典は <code>references/patterns/' + esc(p.name) + "/README.md</code></p>",
    '<div class="stage">',
    p.example + "</div>",
    sourceBlocks(p),
  ].join("\n");
  const dest = join(outDir, p.file);
  writeFileSync(dest, page(p.title, baseCss + "\n" + p.css, body), "utf8");
  written.push(dest);
}

// 一覧。全パターンの CSS を載せ、各セクションから個別ページへリンクする
const sections = loaded.map((p) =>
  [
    '<section class="pattern">',
    "<h2>" + esc(p.title) + "</h2>",
    '<p class="d">' + esc(p.summary) + "</p>",
    '<p class="d"><a href="./' + esc(p.file) + '">単体で開く</a>' +
      " ／ 条件と出典は <code>references/patterns/" + esc(p.name) + "/README.md</code></p>",
    '<div class="stage">',
    p.example + "</div>",
    sourceBlocks(p),
    "</section>",
  ].join("\n")
);

const indexBody = [
  "<h1>見せ方のパターン集</h1>",
  '<p class="d">html-communication の雛形が持たない一点物の見せ方。' +
    loaded.length +
    " 件。このページと個別ページは build-gallery.mjs が生成する。手で編集しない。</p>",
  sections.join("\n"),
].join("\n");

const allCss = baseCss + "\n" + loaded.map((p) => "/* ===== " + p.name + " ===== */\n" + p.css).join("\n");
writeFileSync(resolve(out), page("見せ方のパターン集", allCss, indexBody), "utf8");
written.push(resolve(out));

console.log(JSON.stringify({ patterns: names, written }, null, 2));
