#!/usr/bin/env node
// 脚注番号 (fn-N / fnref-N-k) と補足英字 (su-x / suref-x[-k]) を本文の初出順に振り直し、
// 脚注 pane 内の並びも揃える。機械検査 (check-page.mjs) の ref-order で落ちたときに使う。
//
// usage: node renumber-refs.mjs <page.html>
//
// 初出順の起点は最初の説明節 (.secnum) か、無ければ最初の設問の範囲 (section.rng)。
// 結論ブロックは初出順の対象外 (検査と同じ)。同じ脚注・補足を複数箇所から参照している
// (fnref-N-1, fnref-N-2 / suref-x-1, suref-x-2) 形もそのまま振り直す。
// Exit: 0 = 成功, 2 = 前提条件エラー
import fs from "node:fs";

const path = process.argv[2];
if (!path) { console.error("usage: renumber-refs.mjs <page.html>"); process.exit(2); }
let s = fs.readFileSync(path, "utf8");

let bodyStart = s.indexOf('<p class="secnum">');
if (bodyStart < 0) bodyStart = s.indexOf('<section class="rng"');
const paneStart = s.indexOf('<aside id="fn-pane"');
if (bodyStart < 0 || paneStart < 0) { console.error("本文 (.secnum / section.rng) か脚注 pane (#fn-pane) が見つからない"); process.exit(2); }
const body = s.slice(bodyStart, paneStart);

const fnOrder = [];
for (const m of body.matchAll(/href="#fn-(\d+)"/g)) if (!fnOrder.includes(m[1])) fnOrder.push(m[1]);
const fnMap = new Map(fnOrder.map((old, i) => [old, String(i + 1)]));
const suOrder = [];
for (const m of body.matchAll(/href="#su-([a-z])"/g)) if (!suOrder.includes(m[1])) suOrder.push(m[1]);
const suMap = new Map(suOrder.map((old, i) => [old, String.fromCharCode(97 + i)]));

// 一時トークンを挟んでから確定値へ (a→b, b→a のような入れ替えで衝突しないように)。
// 区切りは本文に現れない制御文字にする。空白で区切ると、外すときの置換が本文の
// " class=" や " core " にも当たって文字を削る
const SEP = "\u0001";
const T = (k) => `${SEP}${k}${SEP}`;
s = s.replace(/fn-(\d+)/g, (_, n) => fnMap.has(n) ? `fn-${T("n" + fnMap.get(n))}` : _);
s = s.replace(/fnref-(\d+)-/g, (_, n) => fnMap.has(n) ? `fnref-${T("n" + fnMap.get(n))}-` : _);
s = s.replace(/(<sup class="fnref"[^>]*><a href="#fn-\u0001n(\d+)\u0001">)(\d+)(<\/a>)/g, (_, a, n, _o, b) => `${a}${n}${b}`);
s = s.replace(/(<a class="fnnum" href="#fnref-\u0001n(\d+)\u0001-\d+">)(\d+)\./g, (_, a, n) => `${a}${n}.`);
s = s.replace(/su-([a-z])\b/g, (_, c) => suMap.has(c) ? `su-${T("c" + suMap.get(c))}` : _);
s = s.replace(/suref-([a-z])\b/g, (_, c) => suMap.has(c) ? `suref-${T("c" + suMap.get(c))}` : _);
s = s.replace(/(<sup class="suref"[^>]*><a href="#su-\u0001c([a-z])\u0001">)([a-z])(<\/a>)/g, (_, a, c, _o, b) => `${a}${c}${b}`);
s = s.replace(/(<a class="sunum" href="#suref-\u0001c([a-z])\u0001(?:-\d+)?">)([a-z])\./g, (_, a, c) => `${a}${c}.`);
s = s.replace(/\u0001[nc]([^\u0001]+)\u0001/g, "$1");

// pane 内の脚注・補足の段落を番号・英字順に並べ替える
function sortBlock(cls, keyOf) {
  const re = new RegExp(`<p class="${cls}" id="[^"]+">[\\s\\S]*?<\\/p>\\n`, "g");
  const blocks = s.match(re);
  if (!blocks || blocks.length < 2) return;
  const sorted = [...blocks].sort((a, b) => keyOf(a) - keyOf(b));
  const start = s.indexOf(blocks[0]);
  const last = blocks[blocks.length - 1];
  const end = s.lastIndexOf(last) + last.length;
  s = s.slice(0, start) + sorted.join("") + s.slice(end);
}
sortBlock("fn", (b) => parseInt(b.match(/id="fn-(\d+)"/)[1], 10));
sortBlock("su", (b) => b.match(/id="su-([a-z])"/)[1].charCodeAt(0));

fs.writeFileSync(path, s);
console.log(`fn: ${[...fnMap].map(([a, b]) => `${a}->${b}`).join(" ") || "(none)"}`);
console.log(`su: ${[...suMap].map(([a, b]) => `${a}->${b}`).join(" ") || "(none)"}`);
