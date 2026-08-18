#!/usr/bin/env node
// 見せ方のパターン集を HTML に起こす。
//
// 出力は 2 種類。
//   一覧: 引数で指定したパス（例 gallery.html）。2 pane で、左にグループ別のリンク集、
//         本文に全パターンを並べる。リンクは同一ページ内のアンカー
//   個別: 同じディレクトリに <stem>-<pattern-name>.html。1 パターンだけを載せる
// 個別ページを残すのは、全パターンの CSS を連結するとセレクタが衝突しうるため。
// 単体の見え方を確実に確認できる場所が要る。
// 共通ページディレクトリはサブディレクトリを作らない規定なので、接頭辞で並べる。
//
// グループは各パターンの README の front matter の group から取る。
// 無ければ「その他」。グループの並び順はパターン名昇順で最初に現れた順。
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
  "  .g-body { min-width: 0; }",
  "  .pattern { margin: 0 0 3.4em; scroll-margin-top: 24px; }",
  "  .pattern > h2 { margin-top: 0; }",
  "  .stage { border: 1px dashed var(--rule); border-radius: 8px; padding: 18px; margin: 12px 0; }",
  "  details { margin: 8px 0; font-size: 0.875em; }",
  "  summary { cursor: pointer; color: var(--sub); }",
  "  .navback { display: inline-block; font-size: 0.875em; margin-bottom: 18px; }",
  "  /* リンク集。パターンが増えるほど本文に埋もれるので、独立した pane に置く */",
  "  .g-nav { font-size: 0.875em; margin: 0 0 2em; }",
  "  .g-nav ul { list-style: none; padding: 0; margin: 0 0 14px; }",
  "  .g-nav li { margin: 0; }",
  "  .g-nav a { display: block; text-decoration: none; padding: 3px 0 3px 10px;",
  "             border-left: 2px solid transparent; }",
  "  .g-nav a:hover { text-decoration: underline; }",
  "  /* 現在地は青の縦罫。雛形と同じ役割の当て方にする */",
  "  .g-nav a.on { border-left-color: var(--link); font-weight: 700; }",
  "  .g-group { font-weight: 700; color: var(--sub); letter-spacing: 0.04em;",
  "             margin: 0 0 4px; }",
  "  /* 2 pane。左にリンク集、右に本文。狭幅では 1 列にしてリンク集を先頭へ置く */",
  "  @media screen and (min-width: 1100px) {",
  "    .gallery { max-width: 1024px; display: grid; grid-template-columns: 240px 704px;",
  "               column-gap: 40px; align-items: start; }",
  "    .g-head { grid-column: 1 / -1; }",
  "    .g-nav { position: sticky; top: 24px; max-height: calc(100vh - 48px); overflow-y: auto;",
  "             margin-bottom: 0; }",
  "  }",
].join("\n");

const SPY_JS = [
  "(function () {",
  "  var links = [].slice.call(document.querySelectorAll('.g-nav a'));",
  "  if (!links.length) return;",
  "  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });",
  "  function spy() {",
  "    /* 読み位置は画面の上から 30%。その線を最後に越えたセクションを現在地にする */",
  "    var line = window.innerHeight * 0.3, cur = 0;",
  "    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) cur = i; });",
  "    links.forEach(function (a, i) {",
  "      a.classList.toggle('on', i === cur);",
  "      if (i === cur) a.setAttribute('aria-current', 'true');",
  "      else a.removeAttribute('aria-current');",
  "    });",
  "  }",
  "  window.addEventListener('scroll', spy, { passive: true });",
  "  window.addEventListener('resize', spy);",
  "  spy();",
  "})();",
].join("\n");

function page(title, css, body, withSpy) {
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
    withSpy ? "<script>\n" + SPY_JS + "\n</script>" : "",
    "</body>",
    "</html>",
    "",
  ].filter(function (l) { return l !== ""; }).join("\n");
}

// README の front matter・見出し・要約を取り出す
function meta(readme) {
  var group = "その他";
  var body = readme;
  var fm = readme.match(/^---\n([\s\S]*?)\n---\n/);
  if (fm) {
    var g = fm[1].match(/^group:\s*(.+)$/m);
    if (g) group = g[1].trim();
    body = readme.slice(fm[0].length);
  }
  var lines = body.split("\n");
  var i = lines.findIndex(function (l) { return l.startsWith("# "); });
  var title = i < 0 ? "" : lines[i].slice(2).trim();
  var rest = lines.slice(i + 1).join("\n").trim();
  var summary = rest.split("\n\n")[0].replace(/\n/g, " ");
  return { group: group, title: title, summary: summary };
}

const loaded = names.map(function (name) {
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
  const info = meta(readFileSync(paths.readme, "utf8"));
  return {
    name: name,
    css: readFileSync(paths.css, "utf8"),
    example: readFileSync(paths.example, "utf8"),
    group: info.group,
    title: info.title || name,
    summary: info.summary,
    file: stem + "-" + name + ".html",
    anchor: "p-" + name,
  };
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

for (const p of loaded) {
  const body = [
    '<a class="navback" href="./' + esc(stem) + '.html">← 見せ方のパターン集</a>',
    "<h1>" + esc(p.title) + "</h1>",
    '<p class="d">' + esc(p.summary) + "</p>",
    '<p class="d">' + esc(p.group) + " ／ 条件と出典は <code>references/patterns/" +
      esc(p.name) + "/README.md</code></p>",
    '<div class="stage">',
    p.example + "</div>",
    sourceBlocks(p),
  ].join("\n");
  const dest = join(outDir, p.file);
  writeFileSync(dest, page(p.title, baseCss + "\n" + p.css, body, false), "utf8");
  written.push(dest);
}

// グループの並び順は、パターン名昇順で最初に現れた順
const groups = [];
for (const p of loaded) if (!groups.includes(p.group)) groups.push(p.group);

const nav = groups
  .map(function (g) {
    const items = loaded
      .filter(function (p) { return p.group === g; })
      .map(function (p) {
        return '<li><a href="#' + esc(p.anchor) + '">' + esc(p.title) + "</a></li>";
      })
      .join("\n");
    return '<p class="g-group">' + esc(g) + "</p>\n<ul>\n" + items + "\n</ul>";
  })
  .join("\n");

const sections = loaded.map(function (p) {
  return [
    '<section class="pattern" id="' + esc(p.anchor) + '">',
    "<h2>" + esc(p.title) + "</h2>",
    '<p class="d">' + esc(p.summary) + "</p>",
    '<p class="d"><a href="./' + esc(p.file) + '">単体で開く</a>' +
      " ／ 条件と出典は <code>references/patterns/" + esc(p.name) + "/README.md</code></p>",
    '<div class="stage">',
    p.example + "</div>",
    sourceBlocks(p),
    "</section>",
  ].join("\n");
});

const indexBody = [
  '<div class="g-head">',
  "<h1>見せ方のパターン集</h1>",
  '<p class="d">html-communication の雛形が持たない一点物の見せ方。' +
    loaded.length + " 件 / " + groups.length +
    " グループ。このページと個別ページは build-gallery.mjs が生成する。手で編集しない。</p>",
  "</div>",
  '<nav class="g-nav" aria-label="パターン一覧">',
  nav,
  "</nav>",
  '<div class="g-body">',
  sections.join("\n"),
  "</div>",
].join("\n");

const allCss =
  baseCss + "\n" +
  loaded.map(function (p) { return "/* ===== " + p.name + " ===== */\n" + p.css; }).join("\n");
writeFileSync(resolve(out), page("見せ方のパターン集", allCss, indexBody, true), "utf8");
written.push(resolve(out));

console.log(JSON.stringify({ groups: groups, patterns: names, written: written }, null, 2));
