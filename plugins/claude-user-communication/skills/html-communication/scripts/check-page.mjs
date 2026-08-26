#!/usr/bin/env node
// claude-html-communication ページの自作検査。
// html-validate / linkinator が見ない点を検査する:
//   1. フォントサイズの段階数 (許可: 16px 基底 + 1.4em / 1.15em / 1em / 0.875em)
//   2. 40 字超のセル (td のテキスト)
//   3. aria-labelledby と caption id の対応
//   4. 脚注の双方向対応 (fn-N と fnref-N-M のペアリング。リンク先の存在は linkinator が見る)
//   5. main 内の class / id が Readability の削除・減点正規表現に当たらないか
//      (当たると Firefox Reader View 等で本文が削られる。main 外の固定バーは対象外)
//   6. 本文の 1 文が 100 字を超える
//   7. 参照マーカーの器が sup 以外
//   8. 脚注番号・補足英字が本文の初出順になっていない
//   9. 識別子 (Q1 / PR 3 / foo.md) が本文に出るのに、その段落から補足へ飛べない
//  10. 見出しの系統 (説明 N / 設問 N/M / 参考資料 / 付録)、設問の分母と QS 配列長、
//      index の questions との突合
//  11. チェックボックスの既定 checked
//  12. 前景色に opacity を重ねている (コントラストが下がる。値はトークンで決める)
//
// 6〜12 は op-review の facet が繰り返し指摘していたものを機械へ移したもの
// (2026-08-18。ih-f007 の実測で clarity facet の指摘 58 件の大半がこの形だった)。
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


  // ---- ここから 6〜12。本文 (#bd) を対象にする ----
  // #bd は入れ子の div を含むので、非貪欲マッチだと最初の </div> で切れる。
  // 開始位置から最初の <aside までを取り、末尾の </div> を落とす
  const bd = (() => {
    const open = src.indexOf('<div id="bd">');
    if (open < 0) return "";
    const from = open + '<div id="bd">'.length;
    const stop = src.indexOf("<aside", from);
    const seg = src.slice(from, stop < 0 ? undefined : stop);
    return seg.replace(/\s*<\/div>\s*$/, "");
  })();

  // 6. 1 文 100 字超。code / pre の中は数えない
  const SENTENCE_LIMIT = 100;
  const proseSrc = bd.replace(/<(pre|code)\b[\s\S]*?<\/\1>/g, " ");
  let longSentences = 0, worstS = { len: 0, text: "" };
  for (const m of proseSrc.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)) {
    for (const sent of stripTags(m[1]).split(/(?<=。)/)) {
      const t = sent.trim();
      if (t.length > SENTENCE_LIMIT) {
        longSentences++;
        if (t.length > worstS.len) worstS = { len: t.length, text: t.slice(0, 34) };
      }
    }
  }
  if (longSentences > 0) {
    findings.push({ check: "long-sentence", line: null,
      message: `${SENTENCE_LIMIT} 字超の文 ${longSentences} 個 (最長 ${worstS.len} 字 「${worstS.text}…」)` });
  }

  // 7. 参照マーカーの器は sup に固定
  for (const m of src.matchAll(/<(?!sup\b)([a-z]+)\b[^>]*class="[^"]*\b(fnref|suref)\b[^"]*"/g)) {
    findings.push({ check: "ref-marker-tag", line: lineOf(src, m.index),
      message: `${m[2]} の器が <${m[1]}>。sup にする` });
  }

  // 8. 脚注番号・補足英字は本文の初出順。起点は最初の説明節 (.secnum) か設問の範囲 (section.rng) で、
  //    前提・冒頭のまとめブロックは対象外（renumber-refs.mjs と同じ起点）
  const orderStart = (() => {
    const a = bd.indexOf('<p class="secnum">'); const b = bd.indexOf('<section class="rng"');
    const c = [a, b].filter((x) => x >= 0); return c.length ? Math.min(...c) : 0;
  })();
  const orderSrc = bd.slice(orderStart);
  const fnOrder = [...orderSrc.matchAll(/id="fnref-(\d+)-\d+"/g)].map((m) => Number(m[1]));
  const fnFirst = [...new Set(fnOrder)];
  for (let i = 0; i < fnFirst.length; i++) {
    if (fnFirst[i] !== i + 1) {
      findings.push({ check: "ref-order", line: null,
        message: `脚注番号が本文の初出順でない (${fnFirst.join(", ")})` });
      break;
    }
  }
  // 同じ補足を複数箇所から参照する suref-x-2 の形も初出として数える（renumber-refs.mjs と同じ数え方）
  const suOrder = [...orderSrc.matchAll(/id="suref-([a-z])(?:-\d+)?"/g)].map((m) => m[1]);
  const suFirst = [...new Set(suOrder)];
  for (let i = 0; i < suFirst.length; i++) {
    if (suFirst[i] !== String.fromCharCode(97 + i)) {
      findings.push({ check: "ref-order", line: null,
        message: `補足の英字が本文の初出順でない (${suFirst.join(", ")})` });
      break;
    }
  }

  // 9. 識別子が本文に出るのに、その段落から補足へ飛べない
  const ID_PAT = /(?<![\w-])(Q\d+|PR \d+|[a-z][a-z0-9-]*\.md)(?![\w-])/;
  for (const m of proseSrc.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)) {
    const inner = m[1];
    if (/class="[^"]*\bd\b[^"]*"/.test(m[0])) continue;   // 参考資料の注記は対象外
    if (/suref/.test(inner)) continue;
    const bare = inner.replace(/<code\b[\s\S]*?<\/code>/g, " ");
    const hit = stripTags(bare).match(ID_PAT);
    if (hit) {
      findings.push({ check: "identifier-gloss", line: null,
        message: `識別子「${hit[1]}」が本文に出るが、その段落から補足へ飛べない` });
    }
  }

  // 10. 見出しの系統と設問数の突合
  // 番号は見出しの中に書かない。説明は直前の .secnum、設問は範囲の .rlabel が持つ。
  // 末尾の参考資料と付録だけは見出しがラベルを持ち、番号を持たない
  const secnums = [...bd.matchAll(/<p class="secnum">([\s\S]*?)<\/p>/g)].map((m) => stripTags(m[1]));
  for (const n of secnums) {
    if (!/^説明 \d+ \/ \d+$/.test(n.trim())) {
      findings.push({ check: "heading-series", line: null,
        message: `説明の番号「${n.trim().slice(0, 24)}」が「説明 N / M」の形になっていない` });
    }
  }
  const rlabels = [...bd.matchAll(/<p class="rlabel"[^>]*>([\s\S]*?)<\/p>/g)].map((m) => stripTags(m[1]));
  // 素の「設問 N / M」か、グループ付き「{グループ名} n / N（設問 N / M）」のどちらか
  for (const n of rlabels) {
    if (!/^設問 \d+ \/ \d+$/.test(n.trim()) &&
        !/^.+ \d+ \/ \d+（設問 \d+ \/ \d+）$/.test(n.trim())) {
      findings.push({ check: "heading-series", line: null,
        message: `範囲のラベル「${n.trim().slice(0, 24)}」が「設問 N / M」または「{グループ名} n / N（設問 N / M）」の形になっていない` });
    }
  }
  const h2blocks = [...bd.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/g)];
  for (const m of h2blocks) {
    const id = /id="([^"]*)"/.exec(m[1])?.[1] ?? "";
    const text = stripTags(m[2]).trim();
    if (id === "s-ref" || id === "s-gen" || id === "s-preview") {
      if (!/^(参考資料|生成に関する補足|付録)/.test(text)) {
        findings.push({ check: "heading-series", line: null,
          message: `末尾の見出し「${text.slice(0, 24)}」が参考資料 / 生成に関する補足 / 付録 で始まっていない` });
      }
      continue;
    }
    if (/^(説明|設問)\s*\d/.test(text)) {
      findings.push({ check: "heading-series", line: null,
        message: `見出し「${text.slice(0, 24)}」に番号が入っている。番号は .secnum か .rlabel に置く` });
    }
  }
  // 説明の分母と実数、設問の分母と実数を突き合わせる
  for (const [kind, list] of [["説明", secnums], ["設問", rlabels]]) {
    // 設問はグループ付きラベルがあるので、通し番号側（設問 N / M）の分母を取る
    const dens = new Set(list.map((n) =>
      (kind === "設問" ? /設問\s*\d+\s*\/\s*(\d+)/ : /\/\s*(\d+)/).exec(n)?.[1]).filter(Boolean));
    if (dens.size > 1) {
      findings.push({ check: "heading-series", line: null,
        message: `${kind}の分母が揃っていない (${[...dens].join(" / ")})` });
    } else if (dens.size === 1 && Number([...dens][0]) !== list.length) {
      findings.push({ check: "heading-series", line: null,
        message: `${kind}の分母 ${[...dens][0]} が実数 ${list.length} と合わない` });
    }
  }
  // form 型のページだけを対象にする。回答の preview があるかで判定する
  // （gallery のようにパターンの実例として設問カードを含むだけのページを除く）
  const isForm = /id="preview"/.test(src);
  const qCards = isForm ? [...src.matchAll(/<details class="qd"/g)].length : 0;
  const qsLen = (src.match(/var QS = \[([\s\S]*?)\];/)?.[1].match(/\{\s*id:/g) ?? []).length;
  if (qCards > 0 && qsLen !== qCards) {
    findings.push({ check: "question-count", line: null,
      message: `設問カード ${qCards} 件に対し JS の QS は ${qsLen} 件` });
  }
  for (const n of rlabels) {
    const d = n.match(/設問 \d+ \/ (\d+)/);
    if (d && qCards > 0 && Number(d[1]) !== qCards) {
      findings.push({ check: "question-count", line: null,
        message: `範囲のラベル「${n.trim().slice(0, 20)}」の分母 ${d[1]} が設問カード数 ${qCards} と違う` });
    }
  }
  // 14. 一括承認の設問（複数の判断を 1 つの設問で承認させる形）
  for (const card of src.matchAll(/<details class="qd"[\s\S]*?<\/details>/g)) {
    const qtext = /<p class="qtext">([\s\S]*?)<\/p>/.exec(card[0])?.[1] ?? "";
    const t = stripTags(qtext);
    const optVals = [...card[0].matchAll(/value="([^"]*)"/g)].map((m) => m[1]);
    const bulkText = /[0-9０-９]+\s*件[^。]*(よいです|承認)/.test(t);
    const bulkOpt = optVals.some((v) => /(明細|一覧|全部)どおり/.test(v));
    if (bulkText || bulkOpt) {
      findings.push({ check: "bulk-approval", line: null,
        message: `一括承認の設問「${t.trim().slice(0, 30)}」。判断 1 件につき設問 1 つに分ける` });
    }
  }

  // 15. 設問を含む節の見出しが問いの形か（推奨する答えを見出しにしていないか）
  //     判定は末尾が「か」で終わるかだけ。「〜をどこに書くか」「〜を採用するか」は通り、
  //     「範囲は dotclaude-writer 側に書き、台帳ごと直す」のような主張型は落ちる
  for (const sec of src.matchAll(/<section class="rng"[\s\S]*?<\/section>/g)) {
    const h2 = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(sec[0])?.[1];
    if (h2 == null) continue;
    const t = stripTags(h2).trim();
    if (!/か[）)]?$/.test(t)) {
      findings.push({ check: "question-heading", line: null,
        message: `設問の節の見出し「${t.slice(0, 30)}」が問いの形でない。何を決めるかを疑問形で書く` });
    }
  }

  // 13. 表の列見出しが器の語になっていないか（並列列挙の一次スクリーニング）
  const VESSEL = ["内容", "意味", "理由", "説明", "備考", "詳細", "概要", "コメント"];
  for (const t of src.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)) {
    const head = /<thead\b[^>]*>([\s\S]*?)<\/thead>/.exec(t[1])?.[1] ?? "";
    const ths = [...head.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map((m) => stripTags(m[1]).trim());
    // 完全一致だけだと「確定した内容」を逃す。末尾一致まで見る
    const hit = ths.slice(1).filter((h) => VESSEL.some((v) => h === v || h.endsWith(v)));
    if (hit.length) {
      const cap = /<caption\b[^>]*>([\s\S]*?)<\/caption>/.exec(t[1])?.[1] ?? "";
      findings.push({ check: "vessel-column", line: null,
        message: `列見出し「${hit.join("」「")}」は何でも入る器の語 (${stripTags(cap).trim().slice(0, 20) || "caption なし"})。並列列挙なら箇条書きにする` });
    }
  }

  // index.html が同じディレクトリにあれば questions を突合する。
  // 設問カードが 1 つも無いページは記法が違う旧版なので対象外
  try {
    if (qCards === 0) throw new Error("skip");
    const dir = path.replace(/[^/]+$/, "");
    const base = path.replace(/^.*\//, "");
    const idx = readFileSync(dir + "index.html", "utf8");
    const entry = idx.match(new RegExp(`file:\\s*"${base}"[\\s\\S]*?\\},`));
    if (entry) {
      const q = entry[0].match(/questions:\s*(\d+)/);
      if (q && Number(q[1]) !== qCards) {
        findings.push({ check: "question-count", line: null,
          message: `index の questions ${q[1]} が設問カード数 ${qCards} と違う` });
      }
    }
  } catch { /* index が無いページは対象外 */ }

  // 11. チェックボックスの既定 checked
  for (const m of src.matchAll(/<input\b[^>]*type="checkbox"[^>]*\bchecked\b/g)) {
    findings.push({ check: "default-checked", line: lineOf(src, m.index),
      message: "チェックボックスが既定でチェック済み。読み飛ばしが承認として記録される" });
  }

  // 12. 前景色に opacity を重ねている
  //     実効コントラストの計算は var() の解決が要るのでここではやらない。
  //     色を決めるのはトークンの役目なので、重ねていること自体を指摘する
  for (const m of maskFigureStyles(src).matchAll(/\{[^{}]*\}/g)) {
    const block = m[0];
    if (/\bcolor:/.test(block) && /\bopacity:\s*0?\.\d+/.test(block)) {
      findings.push({ check: "opacity-on-text", line: lineOf(src, m.index),
        message: "前景色に opacity を重ねている。コントラストが下がるのでトークンで色を決める" });
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
