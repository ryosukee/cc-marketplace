#!/usr/bin/env node
// 生成元 JSON（src/{file}.json）から閲覧用 HTML を組み立てる。
//
// usage:
//   node assemble-page.mjs <src/{file}.json> [--out <出力.html>] [--force]
//
// 出力先は既定で <src の親>/{file}.html。claim-page-number.sh が作った 0 バイトの予約か、
// --force を付けたときだけ中身のあるファイルを上書きする。--force を使ってよいのは、
// 回答前の同名上書きの改稿と、record-answer.mjs による回答の反映だけ。
// 図があるページは src/{file}.figures.html の <template data-fig="…"> を取り込む。
// 出力した HTML は読み取り専用（0444）にする。閲覧用 HTML は手で編集せず、JSON を直してこの script を回す。
// 書式は references/page-format.md。版は plugin.json の version を読んで埋める。
//
// Exit: 0 = 成功, 1 = 生成元に指摘あり（組み立てない。指摘は JSON で stdout）, 2 = 前提条件エラー
import { assemblePage } from "./lib/assemble.mjs";

const args = process.argv.slice(2);
const opt = {};
const positional = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--force") opt.force = true;
  else if (a === "--out") opt.out = args[++i];
  else positional.push(a);
}
const [jsonPath] = positional;
if (!jsonPath) {
  console.error("usage: assemble-page.mjs <src/{file}.json> [--out <出力.html>] [--force]");
  process.exit(2);
}

const r = assemblePage(jsonPath, opt);
if (!r.ok) {
  console.log(JSON.stringify({ total: r.findings.length, results: [{ file: jsonPath, findings: r.findings }] }, null, 2));
  process.exit(r.findings.some((f) => f.check === "template") ? 2 : 1);
}
console.log(`assembled ${r.out} (${r.lines} lines, v${r.version}, ${r.type}${r.answered ? ", answered" : ""}; 説明 ${r.counts.explains} / 設問 ${r.counts.questions} / 表 ${r.counts.tables} / 図 ${r.counts.figures})`);
