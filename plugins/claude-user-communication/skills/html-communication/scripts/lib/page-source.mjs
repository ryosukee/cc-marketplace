// 共通ページの生成元 JSON（src/{file}.json）を読み、本文の HTML を組み立てる。
// 書式の定義は references/page-format.md。ここが実装の正で、文書はそれを写す。
//
// 提供する関数
//   loadSource(jsonPath)                 JSON を読んで構造を検査し、findings と一緒に返す
//   loadFigures(figuresPath)             図の markup ファイルを読んで template / style / 先頭断片に分ける
//   renderPage(source, opts)             本文（<main> から下部バーまで）と head に足すものを返す
//   parseAnswerText(text, src, received) 「## HTML フォーム回答」の貼り付けを answers の形にする
//                                        （戻り値は answers + unparsed。unparsed は JSON に書かない）
//   sha256(text)                         生成元の同一性を HTML の meta に残すためのハッシュ
//
// 番号（説明 n / M、設問 n / N、表 n、図 n、脚注 1..、補足 a..）はすべてここで並び順から付ける。
// JSON には番号を書かない。
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const FORMAT = 1;
export const BLOCK_KINDS = ["note", "h3", "ul", "ol", "table", "quote", "pre", "fig", "custom"];

export function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

// ---------------------------------------------------------------------------
// インライン記法。6 種だけ。それ以外の文字はすべてエスケープする
//   `code`  **強調**  *斜体*  ==要点==  [文字](URL)  [^キー]
//   改行は <br>。記法の文字をそのまま出すときはバックスラッシュを前に置く（\\ \` \* \= \[ \] の 6 つ）
// 強調と斜体は英数字の語の途中では効かない（前後が英数字・/ なら記法にしない）。
// 180*180*180 や docs/** のような地の文の記号を強調にしないため。日本語の文の途中では効く
// ---------------------------------------------------------------------------
const INLINE_SRC = [
  "\\\\([\\\\`*=\\[\\]])",                                          // 1 escape
  "(`+)([\\s\\S]+?)\\2(?!`)",                                       // 2,3 code
  "\\[\\^([^\\]\\s]+)\\]",                                          // 4 ref
  "\\[([^\\]]+)\\]\\(([^)\\s]+)\\)",                                // 5,6 link
  "(?<![A-Za-z0-9/*])\\*\\*(?=[^\\s*])([^*\\n]+?)(?<=[^\\s*])\\*\\*(?![A-Za-z0-9/*])", // 7 strong
  "==(?=[^\\s=])([^=\\n]+?)(?<=[^\\s=])==",                         // 8 mark
  "(?<![A-Za-z0-9/*])\\*(?=[^\\s*])([^*\\n]+?)(?<=[^\\s*])\\*(?![A-Za-z0-9/*])", // 9 em
  "\\n",                                                            // br
].join("|");
const inlineRe = () => new RegExp(INLINE_SRC, "g");

// code span の中身。両端に空白があるときだけ 1 つずつ外す（中身をバッククォートで始めたいときの逃げ道）
function codeText(code) {
  return code.length > 2 && code.startsWith(" ") && code.endsWith(" ") && code.trim() ? code.slice(1, -1) : code;
}

// 記法を外した素の文字列（radio の value や QS のラベルに使う）
export function plain(text) {
  return String(text).replace(inlineRe(), (m, escd, _q, code, ref, ltext, _url, strong, mark, em) => {
    if (escd != null) return escd;
    if (code != null) return codeText(code);
    if (ref != null) return "";
    if (ltext != null) return ltext;
    if (strong != null) return plain(strong);
    if (mark != null) return plain(mark);
    if (em != null) return plain(em);
    return " ";
  }).trim();
}

// ctx.ref(key) が参照マーカーの HTML を返す。ctx が無ければ参照は素の記法のまま残す。
// 強調の中でも記法を解釈するので再帰する。正規表現は呼び出しごとに作る
// （g フラグの lastIndex を共有すると、入れ子の呼び出しが外側の位置を巻き戻して止まらなくなる）
export function inline(text, ctx) {
  const s = String(text);
  const re = inlineRe();
  let out = "", last = 0;
  let m;
  while ((m = re.exec(s)) !== null) {
    out += esc(s.slice(last, m.index));
    last = m.index + m[0].length;
    const [, escd, , code, ref, ltext, url, strong, mark, em] = m;
    if (escd != null) out += esc(escd);
    else if (code != null) out += `<code>${esc(codeText(code))}</code>`;
    else if (ref != null) out += ctx && ctx.ref ? ctx.ref(ref) : esc(m[0]);
    else if (ltext != null) out += `<a href="${esc(url)}">${esc(ltext)}</a>`;
    else if (strong != null) out += `<strong>${inline(strong, ctx)}</strong>`;
    else if (mark != null) out += `<mark>${inline(mark, ctx)}</mark>`;
    else if (em != null) out += `<em>${inline(em, ctx)}</em>`;
    else out += "<br>\n";
  }
  out += esc(s.slice(last));
  return out;
}

// 文字列の中の [^キー] を順に列挙する（採番と検査に使う）。エスケープと code span の中は数えない
export function refKeys(text) {
  const keys = [];
  const t = String(text).replace(/\\[\\`*=\[\]]/g, "  ").replace(/(`+)[\s\S]+?\1(?!`)/g, " ");
  for (const m of t.matchAll(/\[\^([^\]\s]+)\]/g)) keys.push(m[1]);
  return keys;
}

// ---------------------------------------------------------------------------
// 読み込みと構造の検査
// ---------------------------------------------------------------------------
export function loadSource(jsonPath) {
  const findings = [];
  const add = (where, message) => findings.push({ check: "source", where, message });
  let text;
  try { text = fs.readFileSync(jsonPath, "utf8"); }
  catch (e) { return { source: null, text: null, findings: [{ check: "source", where: jsonPath, message: `読めない: ${e.message}` }] }; }
  let src;
  try { src = JSON.parse(text); }
  catch (e) { return { source: null, text, findings: [{ check: "source", where: jsonPath, message: `JSON として読めない: ${e.message}` }] }; }

  if (src.format !== FORMAT) add("format", `format は ${FORMAT} にする（${JSON.stringify(src.format)}）`);
  const stem = path.basename(jsonPath).replace(/\.json$/, "");
  if (src.file !== stem) add("file", `file "${src.file}" がファイル名 ${stem} と違う`);
  if (src.type !== "form" && src.type !== "report") add("type", `type は form か report（${JSON.stringify(src.type)}）`);
  for (const k of ["title", "project"]) if (typeof src[k] !== "string" || !src[k].trim()) add(k, `${k} が無い`);
  if (!Array.isArray(src.context) || !src.context.length || !src.context.every((x) => typeof x === "string")) add("context", "context は文字列の配列（前提の 2〜3 文）");
  if (!Array.isArray(src.summary) || !src.summary.length) add("summary", "summary はブロックの配列（推奨案のまとめ）");
  if (!Array.isArray(src.sections) || !src.sections.length) add("sections", "sections が無い");
  if (src.css != null && !(Array.isArray(src.css) && src.css.every((x) => typeof x === "string"))) add("css", "css はパターン名の配列");
  if (src.groups != null && !(Array.isArray(src.groups) && src.groups.every((g) => g && typeof g.id === "string" && typeof g.name === "string"))) add("groups", "groups は { id, name } の配列");
  for (const k of ["footnotes", "supplements"]) {
    if (src[k] != null && (typeof src[k] !== "object" || Array.isArray(src[k]))) add(k, `${k} はキーを名前にしたオブジェクト`);
  }
  const fnKeys = Object.keys(src.footnotes || {}), suKeys = Object.keys(src.supplements || {});
  for (const k of fnKeys) if (suKeys.includes(k)) add("footnotes", `キー "${k}" が footnotes と supplements の両方にある`);
  if (suKeys.length > 26) add("supplements", `補足は 26 個まで（${suKeys.length} 個）`);
  if (src.reference != null && (typeof src.reference !== "object" || typeof src.reference.lead !== "string")) add("reference", "reference は { lead, blocks }");
  if (src.generation != null && !(typeof src.generation === "string" || Array.isArray(src.generation))) add("generation", "generation は文字列かブロックの配列");

  // ブロックと文字列の検査
  const groupIds = new Set((src.groups || []).map((g) => g.id));
  const usedGroups = new Set();
  const figIds = [];
  const strings = []; // { where, text } 参照の解決とタグ混入の検査に使う
  const AUTO_NUM = /^(説明|設問)\s*\d/;
  const walkBlocks = (blocks, where) => {
    if (!Array.isArray(blocks)) { add(where, "blocks は配列"); return; }
    blocks.forEach((b, i) => {
      const w = `${where}[${i}]`;
      if (typeof b === "string") { strings.push({ where: w, text: b }); return; }
      if (!b || typeof b !== "object") { add(w, "ブロックは文字列かオブジェクト"); return; }
      const kinds = Object.keys(b).filter((k) => BLOCK_KINDS.includes(k));
      if (kinds.length !== 1) { add(w, `ブロックの種類が決まらない（${Object.keys(b).join(", ")}）。使えるのは ${BLOCK_KINDS.join(" / ")}`); return; }
      const kind = kinds[0], v = b[kind];
      if (kind === "note" || kind === "h3") { if (typeof v !== "string") add(w, `${kind} は文字列`); else strings.push({ where: w, text: v }); }
      else if (kind === "ul" || kind === "ol") walkList(v, w);
      else if (kind === "pre") { if (typeof v !== "string") add(w, "pre は文字列"); }
      else if (kind === "quote") {
        if (!v || typeof v !== "object" || typeof v.src !== "string" || !Array.isArray(v.paragraphs) || !v.paragraphs.length) add(w, "quote は { src, url?, paragraphs }。src（出典）は文字列で書く");
        else { strings.push({ where: `${w}.src`, text: v.src }); v.paragraphs.forEach((p, j) => strings.push({ where: `${w}.paragraphs[${j}]`, text: String(p), quoted: true })); }
      } else if (kind === "table") {
        if (!v || typeof v !== "object" || typeof v.caption !== "string" || !Array.isArray(v.columns) || !Array.isArray(v.rows)) { add(w, "table は { caption, columns, rows }"); return; }
        if (/^表\s*\d/.test(v.caption)) add(w, `caption に番号を書かない（「${v.caption.slice(0, 12)}」）。表 n は組み立て時に付く`);
        strings.push({ where: `${w}.caption`, text: v.caption });
        v.columns.forEach((c, j) => strings.push({ where: `${w}.columns[${j}]`, text: typeof c === "string" ? c : String(c?.text ?? "") }));
        v.rows.forEach((r, j) => {
          const cells = Array.isArray(r) ? r : r?.cells;
          if (!Array.isArray(cells)) { add(`${w}.rows[${j}]`, "row はセルの配列か { cells, key }"); return; }
          if (cells.length !== v.columns.length) add(`${w}.rows[${j}]`, `セル数 ${cells.length} が列数 ${v.columns.length} と違う`);
          cells.forEach((c, k) => strings.push({ where: `${w}.rows[${j}][${k}]`, text: typeof c === "string" ? c : String(c?.text ?? "") }));
        });
      } else if (kind === "fig" || kind === "custom") {
        if (!v || typeof v !== "object" || typeof v.id !== "string") { add(w, `${kind} は { id${kind === "fig" ? ", caption" : ""} }`); return; }
        if (kind === "fig") {
          if (typeof v.caption !== "string") add(w, "fig は caption が要る");
          else { if (/^図\s*\d/.test(v.caption)) add(w, "caption に番号を書かない。図 n は組み立て時に付く"); strings.push({ where: `${w}.caption`, text: v.caption }); }
        }
        figIds.push({ id: v.id, where: w });
      }
    });
  };
  const walkList = (items, where) => {
    if (!Array.isArray(items) || !items.length) { add(where, "箇条書きは項目の配列"); return; }
    items.forEach((it, i) => {
      const w = `${where}[${i}]`;
      if (typeof it === "string") strings.push({ where: w, text: it });
      else if (it && typeof it === "object" && typeof it.text === "string") { strings.push({ where: w, text: it.text }); if (it.items != null) walkList(it.items, `${w}.items`); }
      else add(w, "項目は文字列か { text, items }");
    });
  };

  src.context?.forEach?.((c, i) => strings.push({ where: `context[${i}]`, text: String(c) }));
  // グループ名は設問カードの見出しと設問 pane に出るので、タグの混入を見る対象に入れる。
  // 組み立てはグループ名をエスケープするだけで記法を解釈しないため、参照は置けない
  (Array.isArray(src.groups) ? src.groups : []).forEach((g, i) => {
    if (!g || typeof g.name !== "string") return;
    strings.push({ where: `groups[${i}].name`, text: g.name });
    if (refKeys(g.name).length) add(`groups[${i}].name`, "グループ名に [^キー] は置けない。記法は解釈されず、そのまま出る");
  });
  if (Array.isArray(src.summary)) walkBlocks(src.summary, "summary");
  let nq = 0, ne = 0;
  (src.sections || []).forEach((sec, i) => {
    const w = `sections[${i}]`;
    if (!sec || typeof sec !== "object") { add(w, "節はオブジェクト"); return; }
    if (sec.kind !== "explain" && sec.kind !== "question") add(w, `kind は explain か question（${JSON.stringify(sec.kind)}）`);
    if (typeof sec.heading !== "string" || !sec.heading.trim()) add(w, "heading が無い");
    else { strings.push({ where: `${w}.heading`, text: sec.heading }); if (AUTO_NUM.test(sec.heading)) add(w, "見出しに番号を書かない。説明 n / 設問 n は組み立て時に付く"); }
    if (sec.id != null) add(w, "id は書かない。e1 / q1 は並び順から付く");
    walkBlocks(sec.blocks || [], `${w}.blocks`);
    if (sec.kind === "question") {
      nq++;
      const q = sec.question;
      if (!q || typeof q !== "object") { add(w, "設問の節は question が要る"); return; }
      if (typeof q.label !== "string" || !q.label.trim()) add(`${w}.question`, "label が無い"); else strings.push({ where: `${w}.question.label`, text: q.label });
      if (typeof q.text !== "string" || !q.text.trim()) add(`${w}.question`, "text（設問文）が無い"); else strings.push({ where: `${w}.question.text`, text: q.text });
      if (!Array.isArray(q.options) || !q.options.length) add(`${w}.question`, "options が無い");
      else {
        let rec = 0;
        q.options.forEach((o, j) => {
          const ow = `${w}.question.options[${j}]`;
          if (!o || typeof o.label !== "string" || !o.label.trim()) { add(ow, "選択肢は label が要る"); return; }
          strings.push({ where: ow, text: o.label });
          if (o.recommended) rec++;
          if (o.description != null) (Array.isArray(o.description) ? o.description : [o.description]).forEach((d, k) => strings.push({ where: `${ow}.description[${k}]`, text: String(d) }));
          for (const k of ["pros", "cons"]) if (o[k] != null) strings.push({ where: `${ow}.${k}`, text: String(o[k]) });
          if ((o.pros == null) !== (o.cons == null)) add(ow, "pros と cons は両方書くか両方省く");
        });
        if (rec > 1) add(`${w}.question`, `推奨が ${rec} 個ある。1 個にする`);
      }
      if (sec.group != null) { if (!groupIds.has(sec.group)) add(w, `group "${sec.group}" が groups に無い`); usedGroups.add(sec.group); }
    } else if (sec.kind === "explain") {
      ne++;
      if (sec.question != null || sec.group != null) add(w, "説明の節に question / group は置かない");
    }
  });
  if (src.type === "report" && nq > 0) add("sections", `report に設問の節が ${nq} 個ある`);
  if (src.type === "form" && nq === 0) add("sections", "form に設問の節が無い");
  for (const g of src.groups || []) if (!usedGroups.has(g.id)) add("groups", `グループ "${g.id}" を使う設問が無い`);
  if (src.reference) walkBlocks(src.reference.blocks || [], "reference.blocks");
  if (src.reference?.lead) strings.push({ where: "reference.lead", text: src.reference.lead });
  if (typeof src.generation === "string") strings.push({ where: "generation", text: src.generation });
  else if (Array.isArray(src.generation)) walkBlocks(src.generation, "generation");
  for (const [k, v] of Object.entries(src.footnotes || {})) { if (typeof v !== "string") add(`footnotes.${k}`, "本文は文字列"); else strings.push({ where: `footnotes.${k}`, text: v }); }
  for (const [k, v] of Object.entries(src.supplements || {})) { if (typeof v !== "string") add(`supplements.${k}`, "本文は文字列"); else strings.push({ where: `supplements.${k}`, text: v }); }

  // 参照の解決とタグの混入。引用の段落は逐語なので、参照もタグも見ない
  const referenced = new Set();
  for (const s of strings) {
    if (s.quoted) continue;
    for (const k of refKeys(s.text)) {
      referenced.add(k);
      if (!fnKeys.includes(k) && !suKeys.includes(k)) add(s.where, `[^${k}] に対応する脚注も補足も無い`);
    }
    if (/<[a-zA-Z!/]/.test(s.text.replace(/(`+)[\s\S]+?\1(?!`)/g, ""))) add(s.where, `文字列に HTML のタグが入っている（「${s.text.slice(0, 30)}」）。6 種の記法だけを使う`);
  }
  for (const k of fnKeys) if (!referenced.has(k)) add(`footnotes.${k}`, "本文から参照されていない脚注");
  for (const k of suKeys) if (!referenced.has(k)) add(`supplements.${k}`, "本文から参照されていない補足");

  // answers
  if (src.answers != null) {
    const a = src.answers;
    if (typeof a.received !== "string") add("answers", "received（受領日）が無い");
    if (src.type === "form" && (typeof a.raw !== "string" || !Array.isArray(a.items))) add("answers", "form の answers は { received, raw, items, free }");
    if (src.type === "report" && typeof a.confirmed !== "string") add("answers", "report の answers は { received, confirmed }");
    // items の value は選択肢の plain(label) か null。どちらでもない値は radio の checked に一致せず、
    // 回答が入っているのに未選択で表示される
    if (src.type === "form" && Array.isArray(a.items)) {
      const qs = (src.sections || []).filter((s) => s && s.kind === "question");
      const byId = new Map(qs.map((s, i) => [`q${i + 1}`, s]));
      a.items.forEach((it, i) => {
        const w = `answers.items[${i}]`;
        if (!it || typeof it !== "object") { add(w, "回答の項目はオブジェクト"); return; }
        const s = byId.get(it.id);
        if (!s) { add(w, `id "${it.id}" に対応する設問の節が無い`); return; }
        const labels = Array.isArray(s.question?.options) ? s.question.options.map((o) => (o && typeof o.label === "string" ? plain(o.label) : null)) : [];
        if (it.value != null && !labels.includes(it.value)) {
          add(w, `value "${it.value}" がどの選択肢とも一致しない。選択肢は ${labels.map((x) => JSON.stringify(x)).join(" / ")}`);
        }
        if (it.other != null && it.value != null) add(w, "other を持つ項目の value は null にする（「その他」を選んだ回答）");
      });
    }
  }

  return { source: src, text, findings, figIds, counts: { questions: nq, explains: ne } };
}

// 図の markup ファイル。<template data-fig="id"> と <style data-scope="figures"> と、それ以外（body の先頭に置く断片）に分ける
export function loadFigures(figuresPath) {
  if (!figuresPath || !fs.existsSync(figuresPath)) return { templates: new Map(), style: "", lead: "", exists: false };
  let s = fs.readFileSync(figuresPath, "utf8");
  const templates = new Map();
  s = s.replace(/<template\s+data-fig="([^"]+)"\s*>([\s\S]*?)<\/template>/g, (_, id, body) => { templates.set(id, body.trim()); return ""; });
  let style = "";
  s = s.replace(/<style\b[^>]*data-scope="figures"[^>]*>[\s\S]*?<\/style>/g, (m) => { style += (style ? "\n" : "") + m; return ""; });
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  return { templates, style, lead: s.trim(), exists: true };
}

// ---------------------------------------------------------------------------
// 組み立て
// ---------------------------------------------------------------------------
export function renderPage(src, opts = {}) {
  const { version = "", figures = loadFigures(null), patternsDir = null } = opts;
  const findings = [];
  const isForm = src.type === "form";
  const answers = src.answers || null;
  const answered = !!answers;

  // 節に番号を振る
  const sections = src.sections.map((s) => ({ ...s }));
  let qn = 0, en = 0;
  const NQ = sections.filter((s) => s.kind === "question").length;
  const NE = sections.filter((s) => s.kind === "explain").length;
  const groupList = (src.groups || []);
  const groupCount = new Map();
  for (const s of sections) if (s.kind === "question" && s.group) groupCount.set(s.group, (groupCount.get(s.group) || 0) + 1);
  const groupSeen = new Map();
  for (const s of sections) {
    if (s.kind === "question") {
      s.n = ++qn; s.id = `q${qn}`;
      if (s.group) { const g = (groupSeen.get(s.group) || 0) + 1; groupSeen.set(s.group, g); s.gn = g; s.gN = groupCount.get(s.group); s.gname = groupList.find((x) => x.id === s.group)?.name ?? s.group; }
    } else { s.n = ++en; s.id = `e${en}`; }
  }

  // 脚注・補足の採番。本文の並び順（節 → 参考資料 → 生成に関する補足 → 前提・まとめ → 脚注と補足の本文）
  const fnKeys = Object.keys(src.footnotes || {}), suKeys = Object.keys(src.supplements || {});
  const order = [];
  const seen = new Set();
  const collect = (t) => { for (const k of refKeys(t)) if (!seen.has(k)) { seen.add(k); order.push(k); } };
  const collectBlocks = (blocks) => (blocks || []).forEach((b) => {
    if (typeof b === "string") return collect(b);
    const kind = Object.keys(b).find((k) => BLOCK_KINDS.includes(k));
    const v = b[kind];
    if (kind === "note" || kind === "h3") collect(v);
    else if (kind === "ul" || kind === "ol") collectList(v);
    else if (kind === "quote") collect(v.src || "");
    else if (kind === "table") { collect(v.caption); v.columns.forEach((c) => collect(typeof c === "string" ? c : c.text)); v.rows.forEach((r) => (Array.isArray(r) ? r : r.cells).forEach((c) => collect(typeof c === "string" ? c : c.text))); }
    else if (kind === "fig") collect(v.caption);
  });
  const collectList = (items) => items.forEach((it) => { if (typeof it === "string") collect(it); else { collect(it.text); if (it.items) collectList(it.items); } });
  for (const s of sections) {
    collect(s.heading); collectBlocks(s.blocks);
    if (s.kind === "question") {
      // 設問カードは見出し（label）→ 設問文（text）→ 選択肢 の順に出るので、採番もその順で拾う
      collect(s.question.label);
      collect(s.question.text);
      s.question.options.forEach((o) => { collect(o.label); (Array.isArray(o.description) ? o.description : o.description ? [o.description] : []).forEach(collect); collect(o.pros || ""); collect(o.cons || ""); });
    }
  }
  if (src.reference) { collect(src.reference.lead); collectBlocks(src.reference.blocks); }
  if (typeof src.generation === "string") collect(src.generation); else collectBlocks(src.generation || []);
  src.context.forEach(collect); collectBlocks(src.summary);
  for (const k of fnKeys) collect(src.footnotes[k]);
  for (const k of suKeys) collect(src.supplements[k]);
  const fnNum = new Map(), suLetter = new Map();
  for (const k of order) {
    if (fnKeys.includes(k)) fnNum.set(k, fnNum.size + 1);
    else if (suKeys.includes(k)) suLetter.set(k, String.fromCharCode(97 + suLetter.size));
  }
  const refCount = new Map();
  // 解決できない参照をどの文字列で見つけたかを言えるように、組み立て中の位置を控える
  let refWhere = "";
  const at = (w) => { refWhere = w; };
  const ctx = {
    ref(key) {
      const c = (refCount.get(key) || 0) + 1; refCount.set(key, c);
      if (fnNum.has(key)) { const n = fnNum.get(key); return `<sup class="fnref" id="fnref-${n}-${c}"><a href="#fn-${n}">${n}</a></sup>`; }
      if (suLetter.has(key)) { const x = suLetter.get(key); return `<sup class="suref" id="suref-${x}${c > 1 ? "-" + c : ""}"><a href="#su-${x}">${x}</a></sup>`; }
      findings.push({ check: "source", where: refWhere || "ref", message: `[^${key}] が解決できない` });
      return esc(`[^${key}]`);
    },
  };

  // ブロック
  let tableN = 0, figN = 0;
  const usedFigs = new Set();
  const renderList = (tag, items) => `<${tag}>\n` + items.map((it) => {
    if (typeof it === "string") return `<li>${inline(it, ctx)}</li>`;
    return `<li>${inline(it.text, ctx)}${it.items ? "\n" + renderList("ul", it.items) : ""}</li>`;
  }).join("\n") + `\n</${tag}>`;
  const cell = (c, tag) => {
    const o = typeof c === "string" ? { text: c } : c;
    const cls = [o.tone === "ok" ? "ok" : o.tone === "ng" ? "ng" : "", o.num ? "num" : ""].filter(Boolean).join(" ");
    return `<${tag}${tag === "th" ? ' scope="row"' : ""}${cls ? ` class="${cls}"` : ""}>${inline(o.text, ctx)}</${tag}>`;
  };
  const renderBlock = (b) => {
    if (typeof b === "string") return `<p>${inline(b, ctx)}</p>`;
    const kind = Object.keys(b).find((k) => BLOCK_KINDS.includes(k));
    const v = b[kind];
    switch (kind) {
      case "note": return `<p class="d">${inline(v, ctx)}</p>`;
      case "h3": return `<h3>${inline(v, ctx)}</h3>`;
      case "ul": return renderList("ul", v);
      case "ol": return renderList("ol", v);
      case "pre": return `<pre><code>${esc(v)}</code></pre>`;
      case "quote": {
        // 引用の段落は逐語。記法を解釈せず、改行だけ <br> にする
        const srcLine = v.url ? `<a href="${esc(v.url)}">${inline(v.src, ctx)}</a>` : inline(v.src, ctx);
        return `<blockquote>\n<span class="src">引用: ${srcLine}</span>\n` + v.paragraphs.map((p) => `<p>${esc(p).replace(/\n/g, "<br>\n")}</p>`).join("\n") + `\n</blockquote>`;
      }
      case "table": {
        const n = ++tableN;
        const head = v.columns.map((c) => { const o = typeof c === "string" ? { text: c } : c; return `<th scope="col"${o.num ? ' class="num"' : ""}>${inline(o.text, ctx)}</th>`; }).join("");
        const body = v.rows.map((r) => {
          const cells = Array.isArray(r) ? r : r.cells;
          const key = !Array.isArray(r) && r.key;
          return `<tr${key ? ' class="key"' : ""}>` + cells.map((c, i) => cell(c, i === 0 ? "th" : "td")).join("") + `</tr>`;
        }).join("\n");
        return `<div class="table-wrap" role="region" tabindex="0" aria-labelledby="cap-${n}">\n<table>\n<caption id="cap-${n}">表 ${n} ${inline(v.caption, ctx)}</caption>\n<thead>\n<tr>${head}</tr>\n</thead>\n<tbody>\n${body}\n</tbody>\n</table>\n</div>`;
      }
      case "fig": case "custom": {
        const markup = figures.templates.get(v.id);
        usedFigs.add(v.id);
        if (markup == null) { findings.push({ check: "source", where: `${kind}:${v.id}`, message: `図 "${v.id}" の markup が figures ファイルに無い` }); return `<!-- ${kind} ${esc(v.id)} が無い -->`; }
        if (kind === "custom") return markup;
        const n = ++figN;
        return `<div class="fig">\n${markup}\n<p class="cap">図 ${n} ${inline(v.caption, ctx)}</p>\n</div>`;
      }
      default: return "";
    }
  };
  const renderBlocks = (blocks) => (blocks || []).map(renderBlock).join("\n\n");

  // 回答の状態
  const ansItems = new Map();
  if (answered && isForm) for (const it of answers.items || []) ansItems.set(it.id, it);
  const dis = answered ? " disabled" : "";

  const renderCard = (s, where) => {
    at(`${where}.question.label`);
    const q = s.question;
    const label = s.group ? `${esc(s.gname)} ${s.gn} / ${s.gN} ${inline(q.label, ctx)}` : `設問 ${s.n} / ${NQ} ${inline(q.label, ctx)}`;
    const a = ansItems.get(s.id);
    const opts = q.options.map((o) => {
      const value = plain(o.label);
      const checked = a && a.value != null && a.value === value ? " checked" : "";
      const desc = o.description == null ? [] : Array.isArray(o.description) ? o.description : [o.description];
      let h = `  <label class="opt"><input type="radio" name="${s.id}" value="${esc(value)}"${checked}${dis}>\n    ${inline(o.label, ctx)}${o.recommended ? '<span class="rec">推奨</span>' : ""}`;
      if (desc.length) h += `\n    <span class="d">${desc.map((d) => inline(d, ctx)).join("<br>\n      ")}</span>`;
      if (o.pros != null) h += `\n    <span class="proscons">\n      <span><span class="pro">メリット</span>${inline(o.pros, ctx)}</span>\n      <span><span class="con">デメリット</span>${inline(o.cons, ctx)}</span>\n    </span>`;
      return h + `</label>`;
    }).join("\n");
    const otherChecked = a && a.other != null ? " checked" : "";
    const otherVal = a && a.other != null ? ` value="${esc(a.other)}"` : "";
    const note = a && a.note ? esc(a.note) : "";
    return `<details class="qd" data-for="${s.id}"${s.group ? ` data-grp="${esc(s.group)}"` : ""} open>\n<summary>${label}<span class="qstat">未回答</span></summary>\n<p class="qtext">${inline(q.text, ctx)}</p>\n<div class="q" id="${s.id}">\n${opts}\n  <label class="opt"><input type="radio" name="${s.id}" value="__other__"${otherChecked}${dis}>その他\n    <input type="text" class="other" data-for="${s.id}"${otherVal}${dis}></label>\n  <textarea class="note" data-note="${s.id}" aria-label="設問 ${s.n} への補足" placeholder="補足（任意）"${dis}>${note}</textarea>\n</div>\n</details>`;
  };

  const parts = [];
  at("title");
  const titleHtml = inline(src.title, ctx);
  const contextHtml = src.context.map((c, i) => { at(`context[${i}]`); return inline(c, ctx); }).join(" ");
  at("summary");
  const summaryHtml = renderBlocks(src.summary);
  parts.push(`<main>\n\n<div id="bd">\n\n<h1>${titleHtml}</h1>\n\n<div class="vnav">\n${contextHtml}\n</div>\n\n<div class="summary">\n<span class="eyebrow">${isForm ? "推奨案のまとめ" : "まとめ"}</span>\n${summaryHtml}\n</div>`);
  sections.forEach((s, i) => {
    const w = `sections[${i}]`;
    at(w);
    if (s.kind === "explain") {
      parts.push(`<p class="secnum">説明 ${s.n} / ${NE}</p>\n<h2 id="s-${s.id}">${inline(s.heading, ctx)}</h2>\n\n${renderBlocks(s.blocks)}`);
    } else {
      const rlabel = s.group ? `${esc(s.gname)} ${s.gn} / ${s.gN}（設問 ${s.n} / ${NQ}）` : `設問 ${s.n} / ${NQ}`;
      parts.push(`<section class="rng" data-q="${s.id}" aria-labelledby="rl-${s.id}">\n<p class="rlabel" id="rl-${s.id}">${rlabel}</p>\n\n<h2 id="s-${s.id}">${inline(s.heading, ctx)}</h2>\n\n${renderBlocks(s.blocks)}\n\n${renderCard(s, w)}\n\n</section>`);
    }
  });
  if (src.reference) { at("reference"); parts.push(`<h2 id="s-ref">参考資料（判断には不要）</h2>\n<p class="d">${inline(src.reference.lead, ctx)}</p>\n\n${renderBlocks(src.reference.blocks)}`); }
  if (src.generation) {
    at("generation");
    // 先頭の文字列は「読み飛ばしてよい。」に続けて弱い段落に入れ、残りはブロック（文字列は弱い段落、箇条書きはそのまま）
    const g = typeof src.generation === "string" ? [src.generation] : src.generation;
    const first = typeof g[0] === "string" ? inline(g[0], ctx) : "";
    const rest = (typeof g[0] === "string" ? g.slice(1) : g).map((b) => (typeof b === "string" ? { note: b } : b));
    parts.push(`<h2 id="s-gen">生成に関する補足（判断には不要）</h2>\n<p class="d">読み飛ばしてよい。${first}</p>` + (rest.length ? `\n\n${renderBlocks(rest)}` : ""));
  }
  if (isForm) parts.push(`<h2 id="s-preview">付録 回答の preview</h2>\n<p class="d">「回答をコピー」で入る内容。コピーが失敗したらこの欄を全選択して手動コピー。</p>\n<textarea id="preview" aria-label="回答の preview" readonly></textarea>`);
  parts.push(`</div>`);

  if (isForm) {
    const grps = groupList.filter((g) => groupCount.has(g.id)).map((g) => `<div class="qgrp" data-grp="${esc(g.id)}"><p class="qgrp-h" data-grp-name="${esc(g.name)}">${esc(g.name)}</p></div>`).join("\n");
    parts.push(`<aside id="q-pane" aria-label="設問">\n<p class="pane-h">設問 ${NQ} 件（読んでいる範囲のものが開く／見出しで開閉）</p>${grps ? "\n" + grps : ""}\n</aside>`);
  }

  // 脚注と補足の pane。参照の数だけ戻りリンクを並べる
  const backs = (idBase, count, multi) => {
    if (count <= 1) return `<a class="fnback" href="#${idBase}${multi ? "-1" : ""}" aria-label="本文へ戻る">&#8617;</a>`;
    return Array.from({ length: count }, (_, i) => `<a class="fnback" href="#${idBase}${multi ? "-" + (i + 1) : i === 0 ? "" : "-" + (i + 1)}" aria-label="本文へ戻る">&#8617;${i + 1}</a>`).join("\n  ");
  };
  const fnHtml = [...fnNum.entries()].map(([k, n]) => { at(`footnotes.${k}`); return `<p class="fn" id="fn-${n}"><a class="fnnum" href="#fnref-${n}-1">${n}.</a> ${inline(src.footnotes[k], ctx)}\n  ${backs(`fnref-${n}`, refCount.get(k) || 0, true)}</p>`; });
  const suHtml = [...suLetter.entries()].map(([k, x]) => { at(`supplements.${k}`); return `<p class="su" id="su-${x}"><a class="sunum" href="#suref-${x}">${x}.</a> ${inline(src.supplements[k], ctx)}\n  ${backs(`suref-${x}`, refCount.get(k) || 0, false).replace(/class="fnback"/g, 'class="suback"')}</p>`; });
  if (fnHtml.length || suHtml.length) {
    let pane = `<aside id="fn-pane" aria-label="脚注と補足">`;
    if (fnHtml.length) pane += `\n<p class="pane-h">脚注</p>\n${fnHtml.join("\n")}`;
    if (suHtml.length) pane += `\n\n<p class="pane-h"${fnHtml.length ? ' style="margin-top:18px"' : ""}>補足</p>\n${suHtml.join("\n")}`;
    parts.push(pane + `\n</aside>`);
  }
  parts.push(`</main>`);

  const ver = `generated by html-communication v${esc(version)}`;
  if (isForm) {
    const res = answered ? `回答済み（${esc(answers.received)} 受領）` : "";
    const free = answered && answers.free ? esc(answers.free) : "";
    parts.push(`<div id="bar">\n  <div id="bar-in">\n    <div class="bar-info">\n      <span id="proj">${esc(src.project)}</span>\n      <span id="cnt"></span>\n      <span id="res">${res}</span>\n      <span id="ver">${ver}</span>\n    </div>\n    <textarea id="free" aria-label="自由記入" placeholder="気づいた点の自由記入（随時・自動保存）"${dis}>${free}</textarea>\n    <div class="bar-actions">\n      <a id="back" href="./">一覧に戻る</a>\n      <div class="action-cluster">\n        <button type="button" id="reset" class="subbtn"${dis}>リセット</button>\n        <button type="button" id="copy">回答をコピー</button>\n      </div>\n    </div>\n  </div>\n</div>`);
  } else {
    const res = answered ? `\n    <span id="res">確認済み（${esc(answers.received)}）</span>` : "";
    parts.push(`<div id="footer-nav">\n  <div>\n    <a id="back" href="./">一覧に戻る</a>\n    <span id="proj">${esc(src.project)}</span>${res}\n    <span id="ver">${ver}</span>\n  </div>\n</div>`);
  }

  for (const id of figures.templates.keys()) if (!usedFigs.has(id)) findings.push({ check: "source", where: `figures:${id}`, message: `figures ファイルの図 "${id}" を使うブロックが無い` });

  // パターン集の CSS
  let extraCss = "";
  for (const name of src.css || []) {
    const p = patternsDir ? path.join(patternsDir, name, "style.css") : null;
    if (!p || !fs.existsSync(p)) { findings.push({ check: "source", where: "css", message: `パターン "${name}" の style.css が無い` }); continue; }
    extraCss += `\n/* ===== ${name} ===== */\n` + fs.readFileSync(p, "utf8");
  }

  const qs = sections.filter((s) => s.kind === "question").map((s) => ({ id: s.id, label: plain(s.question.label) }));
  return { body: parts.join("\n\n") + "\n", extraCss, figureStyle: figures.style, lead: figures.lead, qs, answered, findings, counts: { questions: NQ, explains: NE, tables: tableN, figures: figN } };
}

// ---------------------------------------------------------------------------
// 回答の貼り付け → answers
//   ## HTML フォーム回答（テーマ）
//   - Q1（ラベル）: 回答  ※ 補足
//   - 補足: 自由記入
// 行の形が崩れていても raw は逐語で残す。解釈できた設問だけ items に入る。
// 「- Q<数字>」で始まるのに形が合わない行は unparsed に入れて返す（呼び出し側が止める材料にする）。
// ラベルに全角の「）」が入っていても読めるように、括弧の中は「）」＋コロンで閉じる位置まで最短で取る
// ---------------------------------------------------------------------------
const ANSWER_LINE = /^-\s*Q(\d+)（(.*?)）\s*[:：]\s*(.*)$/;
const ANSWER_LINE_HEAD = /^-\s*Q\d+/;

export function parseAnswerText(text, src, received) {
  const questions = src.sections.filter((s) => s.kind === "question");
  const items = questions.map((s, i) => ({ id: `q${i + 1}`, label: plain(s.question.label), value: null }));
  const unparsed = [];
  let free = null;
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let cur = null; // 直前の項目（続きの行を足す）
  const setValue = (item, body) => {
    let [v, note] = body.split(/\s+※\s+/, 2);
    v = v.trim();
    if (v === "未回答" || v === "") item.value = null;
    else if (/^その他[:：]\s*/.test(v)) { item.value = null; item.other = v.replace(/^その他[:：]\s*/, ""); }
    else if (v === "その他（記述なし）") { item.value = null; item.other = ""; }
    else item.value = v;
    if (note != null && note.trim()) item.note = note.trim();
  };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    let m;
    if (/^##\s/.test(line)) { cur = null; continue; }
    if ((m = ANSWER_LINE.exec(line))) {
      const item = items[Number(m[1]) - 1];
      if (!item) { unparsed.push(`${line}（設問 Q${m[1]} がページに無い）`); cur = null; continue; }
      setValue(item, m[3]); cur = item; continue;
    }
    if (ANSWER_LINE_HEAD.test(line)) { unparsed.push(line); cur = null; continue; }
    if ((m = /^-\s*補足[:：]\s*(.*)$/.exec(line))) { free = m[1].trim() === "なし" ? null : m[1].trim(); cur = "free"; continue; }
    if (!line.trim()) { continue; }
    if (cur === "free") free = (free || "") + "\n" + line;
    else if (cur) cur.note = (cur.note ? cur.note + "\n" : "") + line.trim();
  }
  return { received, raw: text, items, free, unparsed };
}
