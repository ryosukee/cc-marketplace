#!/usr/bin/env node
// claude-html-communication ページの自作検査。
// html-validate / linkinator が見ない 4 点を検査する:
//   1. フォントサイズの段階数 (許可: 16px 基底 + 1.4em / 1.15em / 1em / 0.875em)
//   2. 40 字超のセル (td のテキスト)
//   3. aria-labelledby と caption id の対応
//   4. 脚注の双方向対応 (fn-N と fnref-N-M のペアリング。リンク先の存在は linkinator が見る)
//   5. main 内の class / id が Readability の削除・減点正規表現に当たらないか
//      (当たると Firefox Reader View 等で本文が削られる。main 外の固定バーは対象外)
//
// 正規表現ベース。対象は自前の雛形から生成したページに限る (一般の HTML には使えない)。
// 出力: JSON (stdout)。exit 0 = 指摘なし, 1 = 指摘あり, 2 = 前提条件エラー。

import { readFileSync } from "node:fs";

const ALLOWED_FONT_SIZES = new Set(["16px", "1.4em", "1.15em", "1em", "0.875em"]);
const CELL_LIMIT = 40;

// mozilla/readability Readability.js REGEXPS より (2026-07-30 取得、部分一致で効く)。
// unlikelyCandidates に当たる要素は削除、negative は -25 点で実質除外。
// okMaybeItsACandidate に当たれば削除は免れる (減点は免れない)
const READABILITY_UNLIKELY =
  /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i;
const READABILITY_OK_MAYBE = /and|article|body|column|content|main|mathjax|shadow/i;
const READABILITY_NEGATIVE =
  /-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|footer|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|widget/i;

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: check-page.mjs <page.html>...");
  process.exit(2);
}

function stripTags(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#8617;/g, "↩").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function lineOf(src, index) {
  return src.slice(0, index).split("\n").length;
}

/* 図のための CSS は本文の規定の外に置く。<style data-scope="figures"> の中身を
   同じ長さの空白へ潰して、フォント段の検査だけから外す。改行は残すので行番号はずれない。
   Readability の class 検査は図にも効かせる（図が Reader View で消えるのは実害） */
function maskFigureStyles(src) {
  return src.replace(/(<style\b[^>]*\bdata-scope="figures"[^>]*>)([\s\S]*?)(<\/style>)/g,
    (_, open, body, close) => open + body.replace(/[^\n]/g, " ") + close);
}

function checkFile(path) {
  const src = readFileSync(path, "utf8");
  const findings = [];

  // 1. フォントサイズの段階数（図の CSS は対象外）
  const sizes = new Map(); // value -> [line...]
  for (const m of maskFigureStyles(src).matchAll(/font-size:\s*([0-9.]+(?:px|em|rem|%))/g)) {
    const v = m[1];
    if (!sizes.has(v)) sizes.set(v, []);
    sizes.get(v).push(lineOf(src, m.index));
  }
  for (const [v, lines] of sizes) {
    if (!ALLOWED_FONT_SIZES.has(v)) {
      findings.push({ check: "font-size-steps", line: lines[0],
        message: `許可外の font-size ${v} (${lines.length} 箇所)` });
    }
  }

  // 2. 40 字超のセル
  let longCells = 0, worst = { len: 0, line: 0, text: "" };
  for (const m of src.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)) {
    const text = stripTags(m[1]);
    if (text.length > CELL_LIMIT) {
      longCells++;
      if (text.length > worst.len) worst = { len: text.length, line: lineOf(src, m.index), text: text.slice(0, 30) };
    }
  }
  if (longCells > 0) {
    findings.push({ check: "long-cells", line: worst.line,
      message: `${CELL_LIMIT} 字超のセル ${longCells} 個 (最長 ${worst.len} 字 L${worst.line} 「${worst.text}…」)` });
  }

  // 3. aria-labelledby と caption id の対応
  const captionIds = new Set([...src.matchAll(/<caption\b[^>]*\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of src.matchAll(/<div\b[^>]*class="[^"]*table-wrap[^"]*"[^>]*>/g)) {
    const tag = m[0];
    const line = lineOf(src, m.index);
    const lb = tag.match(/aria-labelledby="([^"]+)"/);
    if (!lb) {
      findings.push({ check: "caption-labelledby", line,
        message: "table-wrap に aria-labelledby が無い" });
    } else if (!captionIds.has(lb[1])) {
      findings.push({ check: "caption-labelledby", line,
        message: `aria-labelledby="${lb[1]}" に対応する caption id が無い` });
    }
  }

  // 4. 脚注の双方向対応
  const fnIds = new Set([...src.matchAll(/\bid="(fn-\d+)"/g)].map((m) => m[1]));
  const fnrefIds = new Set([...src.matchAll(/\bid="(fnref-\d+-\d+)"/g)].map((m) => m[1]));
  // fnref-N-M → 本文側の参照。同じ N の fn-N が要る
  for (const id of fnrefIds) {
    const n = id.match(/^fnref-(\d+)-/)[1];
    if (!fnIds.has(`fn-${n}`)) {
      findings.push({ check: "footnote-pairing", line: null,
        message: `${id} に対応する脚注 fn-${n} が無い` });
    }
  }
  // fn-N → 少なくとも 1 つの fnref-N-M と、fnref への戻りリンクが要る
  for (const id of fnIds) {
    const n = id.match(/^fn-(\d+)$/)[1];
    const hasRef = [...fnrefIds].some((r) => r.startsWith(`fnref-${n}-`));
    if (!hasRef) {
      findings.push({ check: "footnote-pairing", line: null,
        message: `脚注 ${id} を参照する fnref-${n}-* が本文に無い` });
    }
    const fnBlock = src.match(new RegExp(`<p[^>]*id="${id}"[\\s\\S]*?</p>`));
    if (fnBlock && !new RegExp(`href="#fnref-${n}-\\d+"`).test(fnBlock[0])) {
      findings.push({ check: "footnote-pairing", line: null,
        message: `脚注 ${id} に戻りリンク (#fnref-${n}-*) が無い` });
    }
  }

  // 5. Readability に削られる class / id (main 内のみ)
  const mainMatch = src.match(/<main\b[\s\S]*?<\/main>/);
  if (mainMatch) {
    const seen = new Set();
    for (const m of mainMatch[0].matchAll(/<[a-z][^>]*>/g)) {
      const tag = m[0];
      const cls = tag.match(/class="([^"]*)"/)?.[1] ?? "";
      const id = tag.match(/\bid="([^"]*)"/)?.[1] ?? "";
      const matchInfo = `${cls} ${id}`;
      if (seen.has(matchInfo)) continue;
      seen.add(matchInfo);
      const line = lineOf(src, mainMatch.index + m.index);
      if (READABILITY_UNLIKELY.test(matchInfo) && !READABILITY_OK_MAYBE.test(matchInfo)) {
        findings.push({ check: "readability-class", line,
          message: `class/id「${matchInfo.trim()}」が Readability の unlikelyCandidates に当たる (Reader View で要素ごと削除)` });
      } else if (READABILITY_NEGATIVE.test(matchInfo)) {
        findings.push({ check: "readability-class", line,
          message: `class/id「${matchInfo.trim()}」が Readability の negative に当たる (-25 点で本文から実質除外)` });
      }
    }
  }

  return findings;
}

let total = 0;
const results = [];
for (const f of files) {
  let findings;
  try {
    findings = checkFile(f);
  } catch (e) {
    console.error(`${f}: ${e.message}`);
    process.exit(2);
  }
  total += findings.length;
  if (findings.length > 0) results.push({ file: f, findings });
}
console.log(JSON.stringify({ total, results }, null, 2));
process.exit(total > 0 ? 1 : 0);
