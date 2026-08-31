#!/usr/bin/env node
// 共通ページディレクトリの archive.html を index.html から生成する。
//
// index.html は完了分をプロジェクトごとに直近 RECENT_DONE 件までしか出さない。
// 溢れた分を辿れるようにするのがこのページで、完了分の全件を出す。
// ページのファイル自体は消さない（消すと台帳が出典に引いた実文へ到達できなくなる）。
//
// index.html の複製に対して次の 3 つを差し替えるだけで、entries の配列は触らない。
//   1. const ARCHIVE = false  ->  true（レンダリング側が全件表示へ切り替わる）
//   2. <title> と <h1>
//   3. 未完了の節（アーカイブは完了分だけを扱う）
//
// usage:
//   node build-archive.mjs [共通ページディレクトリ]
//   省略時は $CLAUDE_HTML_COMMUNICATION_DIR、それも無ければ ~/.local/share/claude-html-communication
//
// Exit: 0 = 生成した, 2 = 前提条件エラー（index.html が無い・差し替え対象が見つからない）
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = process.argv[2]
  || process.env.CLAUDE_HTML_COMMUNICATION_DIR
  || path.join(os.homedir(), ".local/share/claude-html-communication");

const indexPath = path.join(dir, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error(`index.html が無い: ${indexPath}`);
  process.exit(2);
}

let s = fs.readFileSync(indexPath, "utf8");

const subs = [
  ["const ARCHIVE = false;", "const ARCHIVE = true;"],
  [/<title>claude-html-communication 一覧([^<]*)<\/title>/,
    "<title>claude-html-communication アーカイブ$1</title>"],
  [/<h1>claude-html-communication 一覧 /, "<h1>claude-html-communication アーカイブ "],
  [/<h2>未完了（回答待ち・確認待ち）<\/h2>\s*<div id="awaiting"><\/div>/,
    '<p class="sub">完了したページの全件。未完了は<a href="./">一覧</a>にある。</p>'],
  [/<h2>プロジェクト別（完了分）<\/h2>/, "<h2>プロジェクト別</h2>"],
];

for (const [from, to] of subs) {
  const before = s;
  s = s.replace(from, to);
  if (s === before) {
    console.error(`差し替え対象が見つからない: ${from}`);
    process.exit(2);
  }
}

// レンダリングは awaiting 要素が無くても動く必要がある
s = s.replace(
  'const awaitingEl = document.getElementById("awaiting");',
  'const awaitingEl = document.getElementById("awaiting") || document.createElement("div");',
);

const outPath = path.join(dir, "archive.html");
fs.writeFileSync(outPath, s);
const n = (s.match(/^    file: "/gm) || []).length;
console.log(`generated ${outPath} (entries ${n})`);
