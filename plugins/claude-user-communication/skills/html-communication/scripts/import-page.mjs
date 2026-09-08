#!/usr/bin/env node
// 生成元 JSON を持たない既存のページ HTML を、生成元の書式（src/{語幹}.json + src/{語幹}.figures.html）へ写す。
// 0.42.0 以前の雛形で作ったページを、JSON から組み立てる流れに乗せるための変換。
//
// usage: node import-page.mjs <元の page.html> <配信ディレクトリ> [--force]
//   出力: <配信ディレクトリ>/src/{語幹}.json と、図があれば src/{語幹}.figures.html
//   出力先の JSON が既にあるときは止める。上書きするなら --force を付ける
//   （既にある JSON には受領した回答（answers）が入っていることがあり、変換はそれを作れない）。
//   写し方を決めた箇所（現行の書式に無い markup をどう写したか）と、記法の往復が合わない箇所を stderr に出す。
//   変換したら assemble-page.mjs --force で組み直し、validate-page.sh を通す。
//   本文の文言は変えない。地の文にある記法の文字（\ ` * [ ==）はエスケープして写す。
//   元の radio の値が表示（label の素の文字列）と違う選択肢は、値を value キーに保つ（VALUE に出す）。
//   値が変わると、受領済みの回答の突合と、ブラウザの下書きの復元が切れる。
//   引用（quote.paragraphs）は逐語なので、エスケープも記法への変換もせず文字だけを写す
//   （中の <code> や <strong> の markup は落ちる。参照マーカーは落として WARN に出す）。
//   旧い雛形（冒頭ブロックの見出し語「結論」、番号入りの h2 など）は現行の形に揃うので、その分だけ表示が変わる。
//   落ちるもの: answers（回答は写さない。--force で上書きすると元の JSON の answers も消える）、
//   対応する部品が無い markup（訳のラベルなど）、雛形に無い CSS（WARN に出す）。
//   stderr の報告を読んで、必要なら JSON を手で直す。
//   Exit: 0 = 書いた, 1 = 変換できない構造（h1 が無い等）, 2 = 前提条件エラー（引数・出力先の衝突）
import fs from "node:fs";
import path from "node:path";
import { parse, els, cls, hasCls, find, findAll, decode } from "./lib/html-parse.mjs";
import { inline, plain } from "./lib/page-source.mjs";
import { TEMPLATE_PATH } from "./lib/assemble.mjs";

const argv = process.argv.slice(2);
const force = argv.includes("--force");
const [srcHtmlPath, outDir] = argv.filter((a) => a !== "--force");
if (!srcHtmlPath || !outDir) { console.error("usage: import-page.mjs <page.html> <outdir> [--force]"); process.exit(2); }
const outJsonPath = path.join(outDir, "src", `${path.basename(srcHtmlPath).replace(/\.html$/, "")}.json`);
if (fs.existsSync(outJsonPath) && !force) {
  console.error(`出力先が既にある: ${outJsonPath}\n変換は回答（answers）を写さないので、上書きすると記録済みの回答が消える。上書きするなら --force を付ける`);
  process.exit(2);
}
const html = fs.readFileSync(srcHtmlPath, "utf8");
const stem = path.basename(srcHtmlPath).replace(/\.html$/, "");
const doc = parse(html);

const notes = [];   // 写し方を決めた箇所
const warns = [];   // 記法の往復が合わない等
const valueChanges = [];
let tableRowheadTd = false;
const note = (s) => notes.push(s);
const warn = (s) => warns.push(s);

const inner = (n) => html.slice(n.innerStart, n.innerEnd);

// ---------------------------------------------------------------------------
// インライン: HTML → 6 種の記法
// ---------------------------------------------------------------------------
function inlineOf(node, stop = () => false) {
  let out = "";
  for (const c of node.children) {
    if (stop(c)) break;
    out += inlineNode(c);
  }
  return tidy(out);
}
function tidy(s) {
  return s.replace(/[ \t\r\n　]*\n[ \t\r\n　]*/g, "\n").replace(/[ \t]+/g, " ").trim();
}
// 地の文にある記法の文字はエスケープして写す（組み立てが記法として解釈しないように）。
// 6 種の記法と同じ並びが元の地の文にあった箇所は報告用に控える
const LITERAL = /`[^`\n]+`|\*\*[^*\n]+\*\*|==[^=\n]+==|\[[^\]\n]+\]\([^)\s]+\)|\[\^[^\]\s]+\]|\*[^*\s][^*\n]*?[^*\s]\*/;
const literals = [];
function escapeNotation(s) {
  return s.replace(/[\\`*\[]/g, (m) => "\\" + m).replace(/==/g, "\\==");
}
function inlineNode(c) {
  if (c.type === "comment") return "";
  if (c.type === "text") {
    const t = decode(c.text).replace(/\s+/g, " ");
    const hit = LITERAL.exec(t);
    if (hit) literals.push({ literal: hit[0], around: t.slice(Math.max(0, hit.index - 20), hit.index + hit[0].length + 20) });
    return escapeNotation(t);
  }
  const t = c.tag;
  if (t === "br") return "\n";
  if (t === "code") return codeSpan(decode(inner(c)));
  if (t === "strong" || t === "b") return `**${inlineOf(c)}**`;
  if (t === "em" || t === "i") return `*${inlineOf(c)}*`;
  if (t === "mark") return `==${inlineOf(c)}==`;
  if (t === "sup" && hasCls(c, "fnref")) return `[^${refKeyOf(c, "fn")}]`;
  if (t === "sup" && hasCls(c, "suref")) return `[^${refKeyOf(c, "su")}]`;
  if (t === "a") return `[${inlineOf(c)}](${c.attrs.href})`;
  if (t === "wbr") return "";
  warn(`未対応のインライン要素 <${t}> を中身だけ写した: ${inner(c).slice(0, 60)}`);
  return inlineOf(c);
}
function codeSpan(s) {
  if (!s.includes("`")) return "`" + s + "`";
  let n = 1; while (s.includes("`".repeat(n + 1))) n++;
  const q = "`".repeat(n + 1);
  // 中身がバッククォートで始まる・終わるときは両端に空白を置く。組み立てがその空白を 1 つずつ外す
  if (s.startsWith("`") || s.endsWith("`")) return q + " " + s + " " + q;
  return q + s + q;
}
function refKeyOf(sup, kind) {
  const a = find(sup, (n) => n.tag === "a");
  const href = a?.attrs?.href || "";
  const m = new RegExp(`#(${kind}-[^"]+)$`).exec(href);
  if (!m) { warn(`参照マーカーの href が読めない: ${inner(sup)}`); return `${kind}-?`; }
  return m[1];
}

// 記法の往復を確かめる。inline(str) が元の HTML と同じになるか
const MARK = "‹REF›";
// 引用符の実体参照の差（元は生の "、組み立ては &quot;）は描画に出ないので揃える
const norm = (s) => s
  .replace(/<sup class="(fnref|suref)"[^>]*>[\s\S]*?<\/sup>/g, MARK)
  .replace(/<br\s*\/?>/g, "<br>")
  .replace(/&quot;|&#34;/g, '"')
  .replace(/<\/?b>/g, (m) => (m[1] === "/" ? "</strong>" : "<strong>"))
  .replace(/<\/?i>/g, (m) => (m[1] === "/" ? "</em>" : "<em>"))
  .replace(/\s+/g, " ").trim();
function roundTrip(str, node, where, stop = () => false) {
  let orig = "";
  for (const c of node.children) { if (stop(c)) break; orig += c.type === "text" ? c.text : html.slice(c.start, c.end); }
  const got = inline(str, { ref: () => MARK });
  if (norm(got) !== norm(orig)) {
    warn(`記法の往復が一致しない (${where})\n    元: ${norm(orig).slice(0, 200)}\n    新: ${norm(got).slice(0, 200)}`);
  }
  return str;
}
function inlineChecked(node, where, stop = () => false) {
  const s = inlineOf(node, stop);
  roundTrip(s, node, where, stop);
  return s;
}

// 引用の段落は逐語で、組み立ては記法を解釈しない。エスケープも記法への変換もせず、
// 文字だけを写す（<code> や <strong> の markup は落ちる）。改行だけ残す
const isRefMarker = (c) => c.type === "el" && c.tag === "sup" && (hasCls(c, "fnref") || hasCls(c, "suref"));
const stripTags = (s) => decode(String(s).replace(/<sup class="(?:fnref|suref)"[^>]*>[\s\S]*?<\/sup>/g, "").replace(/<[^>]*>/g, "")).replace(/\s+/g, "");
function verbatimOf(node, where) {
  const dropped = new Set();
  let out = "";
  const walk = (n) => {
    for (const c of n.children) {
      if (c.type === "comment") continue;
      if (c.type === "text") { out += decode(c.text).replace(/\s+/g, " "); continue; }
      if (c.tag === "br") { out += "\n"; continue; }
      // 参照マーカーは番号を中に持つので、中身ごと落とす（数字が本文に残らないように）
      if (isRefMarker(c)) { warn(`引用の段落にある参照マーカー（${inner(c).replace(/<[^>]*>/g, "")}）を落とした (${where})。引用の段落は逐語なので参照を置けない。出典（src）へ移すか、引用の外の段落から参照する`); continue; }
      if (c.tag !== "wbr") dropped.add(c.tag);
      walk(c);
    }
  };
  walk(node);
  const text = tidy(out);
  if (dropped.size) {
    note(`${stem}: 引用の段落の <${[...dropped].join("> <")}> を外して文字だけ写した（引用の段落は逐語で、記法も markup も解釈しない）: 「${text.slice(0, 24)}…」`);
  }
  if (stripTags(inner(node)) !== String(text).replace(/\s+/g, "")) {
    warn(`引用の段落の文言が一致しない (${where})\n    元: ${stripTags(inner(node)).slice(0, 200)}\n    新: ${String(text).replace(/\s+/g, "").slice(0, 200)}`);
  }
  return text;
}

// ---------------------------------------------------------------------------
// 図の markup
// ---------------------------------------------------------------------------
const figures = [];      // { id, markup }
let figSeq = 0, customSeq = 0;

// ---------------------------------------------------------------------------
// ブロック
// ---------------------------------------------------------------------------
function blockOf(el, where) {
  const c = cls(el);
  if (el.tag === "p" && c.length === 0) return inlineChecked(el, where);
  if (el.tag === "p" && c.includes("d")) return { note: inlineChecked(el, where) };
  if (el.tag === "p" && c.includes("lead")) {
    note(`${stem}: <p class="lead"> を段落（文字列）に写した: 「${inlineOf(el).slice(0, 30)}…」`);
    return inlineChecked(el, where);
  }
  if (el.tag === "h3") return { h3: inlineChecked(el, where) };
  if (el.tag === "ul" || el.tag === "ol") return { [el.tag]: listOf(el, where) };
  if (el.tag === "blockquote") return quoteOf(el, where);
  if (el.tag === "pre") {
    const code = find(el, (n) => n.tag === "code");
    return { pre: decode(inner(code || el)) };
  }
  if (el.tag === "div" && c.includes("table-wrap")) return tableOf(el, where);
  if (el.tag === "table") return tableOf(el, where);
  if (el.tag === "div" && c.includes("fig")) return figOf(el, where);
  // 現行の書式に無いブロックは custom へ
  const id = `custom-${++customSeq}`;
  figures.push({ id, markup: html.slice(el.start, el.end) });
  note(`${stem}: <${el.tag} class="${c.join(" ")}"> を custom "${id}" に写し、markup を figures ファイルへ置いた`);
  return { custom: { id } };
}

function listOf(el, where) {
  const out = [];
  els(el).forEach((li, i) => {
    if (li.tag !== "li") { warn(`箇条書きの中に <${li.tag}>`); return; }
    const sub = els(li).find((x) => x.tag === "ul" || x.tag === "ol");
    const text = inlineChecked(li, `${where}[${i}]`, (n) => n === sub);
    out.push(sub ? { text, items: listOf(sub, `${where}[${i}].items`) } : text);
  });
  return out;
}

function quoteOf(el, where) {
  const kids = els(el);
  const srcSpan = kids.find((k) => k.tag === "span" && hasCls(k, "src"));
  let src = "", url;
  if (srcSpan) {
    const a = els(srcSpan).find((x) => x.tag === "a");
    if (a) { url = a.attrs.href; src = inlineOf(a); }
    else src = inlineOf(srcSpan).replace(/^引用:\s*/, "");
    if (a) {
      const lead = decode(html.slice(srcSpan.innerStart, a.start)).trim();
      if (lead !== "引用:") warn(`引用の出典の前置きが「引用:」でない: ${lead}`);
    }
  }
  const paragraphs = [];
  kids.forEach((k, i) => {
    if (k === srcSpan) return;
    if (k.tag !== "p") { warn(`引用の中に <${k.tag}>`); return; }
    if (hasCls(k, "tr")) note(`${stem}: 引用の <p class="tr">（訳文）を引用の段落に写した（CSS の「訳」ラベルは落ちる）: 「${inlineOf(k).slice(0, 24)}…」`);
    paragraphs.push(verbatimOf(k, `${where}.paragraphs[${i}]`));
  });
  const q = { src, paragraphs };
  if (url) q.url = url;
  return { quote: q };
}

function tableOf(el, where) {
  const table = el.tag === "table" ? el : find(el, (n) => n.tag === "table");
  const capEl = els(table).find((x) => x.tag === "caption");
  const caption = capEl ? inlineChecked(capEl, `${where}.caption`).replace(/^表\s*\d+\s*/, "") : "";
  const thead = els(table).find((x) => x.tag === "thead");
  const tbody = els(table).find((x) => x.tag === "tbody");
  const headRow = thead ? els(thead)[0] : null;
  const columns = headRow ? els(headRow).map((th, j) => {
    const t = inlineChecked(th, `${where}.columns[${j}]`);
    return hasCls(th, "num") ? { text: t, num: true } : t;
  }) : [];
  const rows = [];
  for (const tr of tbody ? els(tbody) : []) {
    const cells = els(tr).map((td, j) => {
      const t = inlineChecked(td, `${where}.rows[${j}]`);
      const o = { text: t };
      if (hasCls(td, "ok")) o.tone = "ok";
      if (hasCls(td, "ng")) o.tone = "ng";
      if (hasCls(td, "num")) o.num = true;
      if (j === 0 && td.tag !== "th") o.__rowheadWasTd = true;
      return Object.keys(o).length === 1 ? t : o;
    });
    const rowheadWasTd = cells[0] && typeof cells[0] === "object" && cells[0].__rowheadWasTd;
    if (rowheadWasTd) delete cells[0].__rowheadWasTd;
    if (rowheadWasTd && Object.keys(cells[0]).length === 1) cells[0] = cells[0].text;
    if (els(tr)[0] && els(tr)[0].tag !== "th") tableRowheadTd = true;
    rows.push(hasCls(tr, "key") ? { key: true, cells } : cells);
  }
  return { table: { caption, columns, rows } };
}

function figOf(el, where) {
  const cap = els(el).find((x) => x.tag === "p" && hasCls(x, "cap"));
  const markup = html.slice(el.innerStart, cap ? cap.start : el.innerEnd).trim();
  const id = `fig-${++figSeq}`;
  figures.push({ id, markup });
  const caption = cap ? inlineChecked(cap, `${where}.caption`).replace(/^図\s*\d+\s*/, "") : "";
  return { fig: { id, caption } };
}

// ---------------------------------------------------------------------------
// 本文の走査
// ---------------------------------------------------------------------------
const main = find(doc, (n) => n.tag === "main");
const bd = find(main, (n) => n.attrs.id === "bd");
const kids = els(bd);

const src = { format: 1, file: stem, type: "form", title: "", project: "", context: [], summary: [], sections: [] };

// type と project
const bar = find(doc, (n) => n.attrs.id === "bar");
src.type = bar ? "form" : "report";
const proj = find(doc, (n) => n.attrs.id === "proj");
src.project = proj ? decode(inner(proj)).trim() : "";

let idx = 0;
// h1
const h1 = kids[idx];
if (h1?.tag !== "h1") throw new Error("h1 が見つからない");
src.title = inlineChecked(h1, "title");
idx++;

// .vnav
const vnav = kids[idx];
if (vnav && hasCls(vnav, "vnav")) {
  const ps = els(vnav).filter((x) => x.tag === "p");
  if (ps.length) {
    note(`${stem}: .vnav の <p> ${ps.length} 本を context の配列の要素に写した`);
    src.context = ps.map((p, i) => inlineChecked(p, `context[${i}]`));
  } else {
    // 生のテキスト。改行で分ける（組み立てが " " で繋ぐので描画は同じ）
    src.context = splitOnNewline(vnav);
    const got = src.context.map((c) => inline(c, { ref: () => MARK })).join(" ");
    if (norm(got) !== norm(inner(vnav))) {
      warn(`記法の往復が一致しない (context)\n    元: ${norm(inner(vnav)).slice(0, 200)}\n    新: ${norm(got).slice(0, 200)}`);
    }
  }
  idx++;
}

// .summary / .concl
const sum = kids[idx];
if (sum && (hasCls(sum, "summary") || hasCls(sum, "concl"))) {
  if (hasCls(sum, "concl")) {
    const eb = els(sum).find((x) => hasCls(x, "eyebrow"));
    note(`${stem}: <div class="concl">（見出し語「${eb ? inlineOf(eb) : "?"}」）を summary に写した。見出し語は組み立てが「${src.type === "form" ? "推奨案のまとめ" : "まとめ"}」に置き換える`);
  }
  src.summary = els(sum).filter((x) => !hasCls(x, "eyebrow")).map((b, i) => blockOf(b, `summary[${i}]`));
  idx++;
}

// 子ノードを走り、テキストノードの改行で区切る（要素の途中では切らない）
function splitOnNewline(node) {
  const groups = [[]];
  for (const c of node.children) {
    if (c.type === "text" && c.text.includes("\n")) {
      const parts = c.text.split("\n");
      parts.forEach((p, i) => {
        if (i > 0) groups.push([]);
        groups[groups.length - 1].push({ type: "text", text: p });
      });
      continue;
    }
    groups[groups.length - 1].push(c);
  }
  return groups.map((g) => tidy(g.map(inlineNode).join(""))).filter(Boolean);
}

// 節
const stopIds = new Set(["s-ref", "s-gen", "s-preview"]);
let cur = null;
const pushCur = () => { if (cur) { src.sections.push(cur); cur = null; } };

while (idx < kids.length) {
  const el = kids[idx];
  if (el.tag === "h2" && stopIds.has(el.attrs.id)) break;
  if (el.tag === "aside") break;

  if (el.tag === "p" && hasCls(el, "secnum")) { idx++; continue; }
  if (el.tag === "h2" && /^s-/.test(el.attrs.id || "") && !stopIds.has(el.attrs.id)) {
    pushCur();
    let heading = inlineChecked(el, "heading");
    const m = /^説明\s*\d+\s*(?:\/\s*\d+\s*)?/.exec(heading);
    if (m) { heading = heading.slice(m[0].length); note(`${stem}: 見出し「${m[0].trim()}」の番号を外した（組み立てが <p class="secnum"> で付ける）`); }
    cur = { kind: "explain", heading, blocks: [] };
    idx++; continue;
  }
  if (el.tag === "section" && hasCls(el, "rng")) { pushCur(); src.sections.push(questionSection(el)); idx++; continue; }
  if (!cur) { warn(`節の外にブロック <${el.tag} class="${cls(el).join(" ")}">`); idx++; continue; }
  cur.blocks.push(blockOf(el, `${cur.heading}.blocks[${cur.blocks.length}]`));
  idx++;
}
pushCur();

function questionSection(sec) {
  const ks = els(sec);
  const rlabel = ks.find((x) => x.tag === "p" && hasCls(x, "rlabel"));
  const h2 = ks.find((x) => x.tag === "h2");
  const det = ks.find((x) => x.tag === "details" && hasCls(x, "qd"));
  let heading = inlineChecked(h2, "heading");
  const hm = /^設問\s*\d+\s*(?:\/\s*\d+\s*)?/.exec(heading);
  if (hm) { heading = heading.slice(hm[0].length); note(`${stem}: 設問の見出し「${hm[0].trim()}」の番号を外した`); }
  const out = { kind: "question", heading, blocks: [] };
  const grp = det?.attrs?.["data-grp"];
  if (grp) out.group = grp;
  for (const k of ks) {
    if (k === rlabel || k === h2 || k === det) continue;
    out.blocks.push(blockOf(k, `${heading}.blocks[${out.blocks.length}]`));
  }
  // 設問カード
  const summary = els(det).find((x) => x.tag === "summary");
  const qstat = els(summary).find((x) => hasCls(x, "qstat"));
  let label = inlineChecked(summary, "question.label", (n) => n === qstat);
  // 「{グループ名} n / N」か「設問 n / N」の前置きを外す
  const pre = /^(.*?\s*\d+\s*\/\s*\d+)\s*/.exec(label);
  if (pre) label = label.slice(pre[0].length);
  else warn(`設問カードの見出しから番号を外せない: ${label}`);
  const qtext = els(det).find((x) => x.tag === "p" && hasCls(x, "qtext"));
  const qdiv = els(det).find((x) => x.tag === "div" && hasCls(x, "q"));
  const options = [];
  for (const lab of els(qdiv)) {
    if (lab.tag !== "label") continue;
    const input = els(lab).find((x) => x.tag === "input" && x.attrs.type === "radio");
    if (!input) continue;
    if (input.attrs.value === "__other__") continue;
    const rec = els(lab).find((x) => x.tag === "span" && hasCls(x, "rec"));
    const dsp = els(lab).find((x) => x.tag === "span" && hasCls(x, "d"));
    const pc = els(lab).find((x) => x.tag === "span" && hasCls(x, "proscons"));
    const stopAt = (n) => n === rec || n === dsp || n === pc;
    let text = "";
    for (const c of lab.children) { if (c === input) continue; if (stopAt(c)) break; text += inlineNode(c); }
    const olabel = tidy(text);
    const o = { label: olabel };
    // 元の radio の値が表示（label の素の文字列）と違うページは、値を選択肢の value に保つ。
    // 値が変わると、受領済みの回答の突合と、ブラウザの下書き（radio の値で保存する）の復元が切れる
    if (input.attrs.value !== plain(olabel)) {
      o.value = input.attrs.value;
      valueChanges.push({ page: stem, q: label, value: input.attrs.value, shown: plain(olabel) });
    }
    if (rec) o.recommended = true;
    if (dsp) {
      const parts = splitOnBr(dsp);
      o.description = parts.length === 1 ? parts[0] : parts;
    }
    if (pc) {
      const two = els(pc).filter((x) => x.tag === "span");
      const grab = (kind) => {
        const s = two.find((x) => els(x).some((y) => hasCls(y, kind)));
        if (!s) return null;
        const tag = els(s).find((y) => hasCls(y, kind));
        let t = "";
        for (const c of s.children) { if (c === tag) continue; t += inlineNode(c); }
        return tidy(t);
      };
      const pros = grab("pro"), cons = grab("con");
      if (pros != null) o.pros = pros;
      if (cons != null) o.cons = cons;
    }
    options.push(o);
  }
  out.question = { label, text: inlineChecked(qtext, "question.text"), options };
  return out;
}

function splitOnBr(node) {
  const parts = [[]];
  for (const c of node.children) {
    if (c.type === "el" && c.tag === "br") { parts.push([]); continue; }
    parts[parts.length - 1].push(c);
  }
  return parts.map((cs) => tidy(cs.map(inlineNode).join(""))).filter((s) => s !== "");
}

// 参考資料・生成に関する補足
while (idx < kids.length) {
  const el = kids[idx];
  if (el.tag === "aside") break;
  if (el.tag === "h2" && el.attrs.id === "s-ref") {
    idx++;
    const blocks = [];
    let lead = null;
    while (idx < kids.length) {
      const b = kids[idx];
      if (b.tag === "aside" || (b.tag === "h2" && stopIds.has(b.attrs.id))) break;
      if (lead === null && b.tag === "p" && hasCls(b, "d")) { lead = inlineChecked(b, "reference.lead"); idx++; continue; }
      if (lead === null) { lead = ""; note(`${stem}: 参考資料に <p class="d"> の前置きが無いので lead を空にした`); }
      blocks.push(blockOf(b, `reference.blocks[${blocks.length}]`));
      idx++;
    }
    src.reference = { lead: lead ?? "", blocks };
    continue;
  }
  if (el.tag === "h2" && el.attrs.id === "s-gen") {
    idx++;
    const gen = [];
    let first = true;
    while (idx < kids.length) {
      const b = kids[idx];
      if (b.tag === "aside" || (b.tag === "h2" && stopIds.has(b.attrs.id))) break;
      if (first && b.tag === "p" && hasCls(b, "d")) {
        let t = inlineChecked(b, "generation[0]");
        t = t.replace(/^読み飛ばしてよい。/, "");
        gen.push(t); first = false; idx++; continue;
      }
      // generation はブロックの配列。箇条書きも表もそのままブロックとして写す
      gen.push(blockOf(b, `generation[${gen.length}]`));
      idx++;
    }
    src.generation = gen.length === 1 && typeof gen[0] === "string" ? gen[0] : gen;
    continue;
  }
  if (el.tag === "h2" && el.attrs.id === "s-preview") { idx += 1; while (idx < kids.length && kids[idx].tag !== "aside") idx++; continue; }
  idx++;
}

// pane
const qpane = find(main, (n) => n.attrs.id === "q-pane");
if (qpane) {
  const gs = findAll(qpane, (n) => hasCls(n, "qgrp"));
  const groups = gs.map((g) => {
    const h = find(g, (n) => hasCls(n, "qgrp-h"));
    return { id: g.attrs["data-grp"], name: h?.attrs?.["data-grp-name"] ?? decode(inner(h)).trim() };
  });
  if (groups.length) src.groups = groups;
}

const fnpane = find(main, (n) => n.attrs.id === "fn-pane");
if (fnpane) {
  const footnotes = {}, supplements = {};
  for (const p of els(fnpane)) {
    if (p.tag !== "p") continue;
    if (hasCls(p, "pane-h")) continue;
    const isFn = hasCls(p, "fn"), isSu = hasCls(p, "su");
    if (!isFn && !isSu) { warn(`脚注 pane に <p class="${cls(p).join(" ")}">`); continue; }
    const skip = (n) => n.type === "el" && (hasCls(n, "fnnum") || hasCls(n, "sunum") || hasCls(n, "fnback") || hasCls(n, "suback"));
    let t = "";
    for (const c of p.children) { if (skip(c)) continue; t += inlineNode(c); }
    const body = tidy(t);
    // 往復（番号リンクと戻りリンクを除いた部分）
    let orig = "";
    for (const c of p.children) { if (skip(c)) continue; orig += c.type === "text" ? c.text : html.slice(c.start, c.end); }
    if (norm(inline(body, { ref: () => MARK })) !== norm(orig)) {
      warn(`記法の往復が一致しない (${p.attrs.id})\n    元: ${norm(orig).slice(0, 200)}\n    新: ${norm(inline(body, { ref: () => MARK })).slice(0, 200)}`);
    }
    (isFn ? footnotes : supplements)[p.attrs.id] = body;
  }
  if (Object.keys(footnotes).length) src.footnotes = footnotes;
  if (Object.keys(supplements).length) src.supplements = supplements;
}

if (tableRowheadTd) note(`${stem}: 表の 1 列目が <td> の行がある。組み立ては 1 列目を <th scope="row"> にする（文言は変わらない）`);

// キーの並びを書式の順に揃える
const ordered = {};
for (const k of ["format", "file", "type", "title", "project", "context", "summary", "groups", "sections", "footnotes", "supplements", "reference", "generation", "css"]) {
  if (src[k] !== undefined) ordered[k] = src[k];
}

fs.mkdirSync(path.join(outDir, "src"), { recursive: true });
if (fs.existsSync(outJsonPath) && force) note(`${stem}: 既にあった ${outJsonPath} を --force で上書きした（元の answers があれば消えた）`);
fs.writeFileSync(outJsonPath, JSON.stringify(ordered, null, 2) + "\n");

// figures ファイル
const figStyles = [...html.matchAll(/<style\b[^>]*data-scope="figures"[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
// body の先頭にある <svg style="display:none"> 等（main より前の要素）
const body = find(doc, (n) => n.tag === "body");
const leadEls = body ? els(body).filter((n) => n.tag !== "main" && n.tag !== "script" && n.attrs.id !== "bar" && n.attrs.id !== "footer-nav") : [];
const lead = leadEls.map((n) => html.slice(n.start, n.end)).join("\n");

if (figures.length || figStyles.length || lead) {
  let out = "";
  if (figStyles.length) {
    out += `<style data-scope="figures">\n${figStyles.map((s) => s.trim()).join("\n")}\n</style>\n`;
    if (figStyles.length > 1) note(`${stem}: <style data-scope="figures"> が ${figStyles.length} つあったので 1 つにまとめた`);
  }
  if (lead) { out += lead + "\n"; note(`${stem}: <body> の先頭の要素（${leadEls.map((n) => "<" + n.tag + ">").join(" ")}）を figures ファイルの template と style の外に置いた`); }
  for (const f of figures) out += `<template data-fig="${f.id}">\n${f.markup}\n</template>\n`;
  fs.writeFileSync(path.join(outDir, "src", `${stem}.figures.html`), out);
}

// ---------------------------------------------------------------------------
// 雛形に無い CSS
// 旧い assemble-page は --css で渡したパターン集の CSS を雛形の <style> へ連結していた。
// 生成元 JSON は css キーでパターン名を持つが、変換はどのパターンから来た CSS かを復元できない。
// data-scope="figures" が付いていない <style> のうち、現行の雛形に無いセレクタを WARN に出す
// ---------------------------------------------------------------------------
function cssRules(css) {
  const out = [];
  let depth = 0, buf = "";
  for (const c of css.replace(/\/\*[\s\S]*?\*\//g, "")) {
    buf += c;
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { out.push(buf.trim()); buf = ""; } }
  }
  if (buf.trim()) out.push(buf.trim());
  return out.filter(Boolean);
}
const cssSel = (r) => r.slice(0, r.indexOf("{")).replace(/\s+/g, " ").trim();
function cssSelectors(css) {
  const set = new Set();
  for (const r of cssRules(css)) {
    if (r.startsWith("@")) for (const rr of cssRules(r.slice(r.indexOf("{") + 1, r.lastIndexOf("}")))) set.add(cssSel(rr));
    else set.add(cssSel(r));
  }
  return set;
}
const plainStyles = [...html.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style>/g)].filter((m) => !/data-scope=/.test(m[1])).map((m) => m[2]);
if (plainStyles.length) {
  const tplSel = cssSelectors(fs.readFileSync(TEMPLATE_PATH, "utf8").replace(/^[\s\S]*?<style>/, "").replace(/<\/style>[\s\S]*$/, ""));
  const extra = [...cssSelectors(plainStyles.join("\n"))].filter((s) => s && !tplSel.has(s));
  if (extra.length) {
    warn(`雛形に無い CSS のセレクタが ${extra.length} 個ある: ${extra.join(", ")}\n    旧い assemble-page が --css で連結したパターン集の CSS か、旧い雛形の CSS。組み立てはこれを写さない。\n    いま要る CSS なら、JSON の css キーにパターン名を書くか、その宣言を ${stem}.figures.html の <style data-scope="figures"> へ手で移す`);
  }
}

for (const n of notes) console.error("NOTE " + n);
for (const l of literals) console.error(`LITERAL 地の文の「${l.literal}」はエスケープして写した（…${l.around}…）`);
for (const w of warns) console.error("WARN " + w);
for (const v of valueChanges) console.error(`VALUE ${v.page} 「${v.q}」: radio の値 "${v.value}" が表示「${v.shown}」と違うので、選択肢の "value" に保った（受領済みの回答の突合と下書きの復元が切れないように）`);
console.error(`--- ${stem}: 節 ${src.sections.length}（説明 ${src.sections.filter((s) => s.kind === "explain").length} / 設問 ${src.sections.filter((s) => s.kind === "question").length}）, 図 ${figures.length}, 脚注 ${Object.keys(src.footnotes || {}).length}, 補足 ${Object.keys(src.supplements || {}).length}, NOTE ${notes.length}, WARN ${warns.length}`);
