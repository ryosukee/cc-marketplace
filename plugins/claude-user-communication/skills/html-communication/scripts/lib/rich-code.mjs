// Structured code, textual diffs, and call trees. No source string becomes markup.
// Lexical coloring is deliberately limited; it is not a language parser.
const ID = /^[A-Za-z][A-Za-z0-9-]*$/;
const STATUS = new Set(["existing", "added", "modified", "removed"]);
const record = (v) => v && typeof v === "object" && !Array.isArray(v);
const lines = (text) => text === "" ? [] : text.split("\n");

export function validateRichBlock(kind, v, where, { add, strings, walkBlocks, inDetail, isForm, ids }) {
  if (!record(v)) { add(where, `${kind} はオブジェクト`); return; }
  const keys = (o, allowed, w) => { for (const k of Object.keys(o)) if (!allowed.includes(k)) add(w, `${kind} に ${k} は使えない`); };
  const str = (o, k, w, required = false, prose = true) => {
    if (o[k] == null && !required) return;
    if (typeof o[k] !== "string" || (required && !o[k].trim())) add(`${w}.${k}`, `${k} は${required ? "空でない" : ""}文字列`);
    else if (prose) strings.push({ where: `${w}.${k}`, text: o[k] });
  };
  const stable = (id, w, seen) => {
    if (typeof id !== "string" || !ID.test(id)) add(w, "id は英字で始め、英数字とハイフンだけを使う");
    else if (seen.has(id)) add(w, `id "${id}" が重複している`);
    else seen.add(id);
  };
  const positive = (o, k, w) => { if (o[k] != null && (!Number.isSafeInteger(o[k]) || o[k] < 1)) add(`${w}.${k}`, `${k} は 1 以上の整数`); };
  stable(v.id, `${where}.id`, ids);
  str(v, "title", where, kind === "calls");
  if (kind === "code") {
    keys(v, ["id", "title", "file", "language", "startLine", "text", "annotations"], where);
    str(v, "file", where, false, false); str(v, "language", where, false, false); positive(v, "startLine", where);
    if (typeof v.text !== "string") add(`${where}.text`, "text は文字列（空文字も可）");
    if (v.annotations != null) {
      if (!Array.isArray(v.annotations)) add(`${where}.annotations`, "annotations は配列");
      else {
        const used = new Set(), start = v.startLine ?? 1, end = start + (typeof v.text === "string" ? lines(v.text).length : 0);
        v.annotations.forEach((n, i) => {
          const w = `${where}.annotations[${i}]`;
          if (!record(n)) { add(w, "注釈は { line, title, text }"); return; }
          keys(n, ["line", "title", "text"], w);
          if (!Number.isSafeInteger(n.line) || n.line < start || n.line >= end) add(`${w}.line`, "line は表示される絶対行番号");
          else if (used.has(n.line)) add(`${w}.line`, "同じ行の注釈が重複している");
          used.add(n.line); str(n, "title", w, true); str(n, "text", w, true);
        });
      }
    }
  } else if (kind === "diff") {
    keys(v, ["id", "title", "file", "before", "after", "beforeStart", "afterStart"], where);
    str(v, "file", where, false, false); positive(v, "beforeStart", where); positive(v, "afterStart", where);
    for (const k of ["before", "after"]) if (typeof v[k] !== "string") add(`${where}.${k}`, `${k} は文字列（空文字も可）`);
  } else if (kind === "calls") {
    keys(v, ["id", "title", "interaction", "nodes"], where);
    if (inDetail) add(where, "detail の中に calls は置けない");
    if (v.interaction != null && !["propose", "reject"].includes(v.interaction)) add(`${where}.interaction`, "interaction は propose / reject");
    if (v.interaction != null && !isForm) add(`${where}.interaction`, "interaction は form にだけ指定する");
    const nodeIds = new Set();
    const walk = (nodes, w, depth = 0) => {
      if (!Array.isArray(nodes) || !nodes.length) { add(w, "nodes / children は空でない配列"); return; }
      if (depth > 100) { add(w, "calls の階層は 100 段まで"); return; }
      nodes.forEach((n, i) => {
        const nw = `${w}[${i}]`;
        if (!record(n)) { add(nw, "node はオブジェクト"); return; }
        keys(n, ["id", "name", "status", "file", "line", "summary", "detail", "children"], nw);
        stable(n.id, `${nw}.id`, nodeIds); str(n, "name", nw, true); str(n, "file", nw, false, false); str(n, "summary", nw); positive(n, "line", nw);
        if (!STATUS.has(n.status)) add(`${nw}.status`, "status は existing / added / modified / removed");
        if (n.detail != null) {
          if (!record(n.detail)) add(`${nw}.detail`, "detail は { title, blocks }");
          else {
            keys(n.detail, ["title", "blocks"], `${nw}.detail`); str(n.detail, "title", `${nw}.detail`, true);
            if (!Array.isArray(n.detail.blocks) || !n.detail.blocks.length) add(`${nw}.detail.blocks`, "detail の blocks は空でない配列");
            else walkBlocks(n.detail.blocks, `${nw}.detail.blocks`, true);
          }
        }
        if (n.children != null) walk(n.children, `${nw}.children`, depth + 1);
      });
    };
    walk(v.nodes, `${where}.nodes`);
  }
}

export function collectRichStrings(kind, v, collect, collectBlocks) {
  if (v.title) collect(v.title);
  if (kind === "code") for (const note of v.annotations || []) { collect(note.title); collect(note.text); }
  if (kind === "calls") {
    const walk = (nodes) => nodes.forEach((n) => {
      collect(n.name); if (n.summary) collect(n.summary);
      if (n.detail) { collect(n.detail.title); collectBlocks(n.detail.blocks); }
      if (n.children) walk(n.children);
    });
    walk(v.nodes);
  }
}

// Traverse only declared block containers; do not accidentally parse a code string.
export function richTargets(src) {
  const out = [];
  const calls = (nodes, tree, interaction, parent = "") => {
    for (const n of nodes || []) {
      out.push({ tree, node: n.id, status: n.status, file: n.file || "", parent, interaction, name: n.name });
      if (n.children) calls(n.children, tree, interaction, n.id);
    }
  };
  const blocks = (bs) => {
    for (const b of Array.isArray(bs) ? bs : []) {
      if (!record(b)) continue;
      if (b.calls) calls(b.calls.nodes, b.calls.id, b.calls.interaction || "none");
      if (b.detail) blocks(b.detail.blocks);
      if (b.tree) {
        const tree = (items) => { for (const n of items || []) { blocks(n.blocks); if (n.children) tree(n.children); } };
        tree(b.tree);
      }
    }
  };
  if (src.type === "form") blocks(src.formIntro);
  if (src.type === "report") blocks(src.summary);
  for (const s of src.sections || []) blocks(s.blocks);
  blocks(src.reference?.blocks); blocks(src.generation);
  return out;
}

const KEYWORDS = /^(?:const|let|var|function|return|if|else|for|while|class|new|import|export|from|async|await|throw|try|catch|true|false|null|undefined|interface|type|def|in|and|or|not|None|True|False|lambda|with|as|pass|elif|fi|then|do|done|case|esac)$/;
function highlight(text, language, esc) {
  if (!/^(?:js|javascript|jsx|ts|typescript|tsx|json|py|python|sh|bash|shell|zsh)$/i.test(language || "")) return esc(text);
  const hashComments = /^(?:py|python|sh|bash|shell|zsh)$/i.test(language);
  const re = new RegExp('("(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'|`(?:\\\\.|[^`\\\\])*`)|' + (hashComments ? '(#[^\\n]*)' : '(//[^\\n]*|/\\*.*?\\*/)') + '|(\\b\\d+(?:\\.\\d+)?\\b)|(\\b[A-Za-z_$][\\w$]*\\b)', 'g');
  let html = "", last = 0;
  for (const m of text.matchAll(re)) {
    html += esc(text.slice(last, m.index));
    const cls = m[1] ? "string" : m[2] ? "comment" : m[3] ? "number" : KEYWORDS.test(m[0]) ? "keyword" : "";
    html += cls ? `<span class="tok-${cls}">${esc(m[0])}</span>` : esc(m[0]);
    last = m.index + m[0].length;
  }
  return html + esc(text.slice(last));
}

// Prefix/suffix trimming keeps small edits in large files cheap. The quadratic
// middle uses a strict cell budget; large replacement regions degrade to a
// delete/add run, preserving every line rather than performing costly alignment.
function sequenceDiff(a, b, budget) {
  let start = 0, endA = a.length, endB = b.length;
  while (start < endA && start < endB && a[start] === b[start]) start++;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB--; }
  const out = a.slice(0, start).map((text) => ({ kind: "same", text }));
  const n = endA - start, m = endB - start;
  if ((n + 1) * (m + 1) > budget) {
    for (let i = start; i < endA; i++) out.push({ kind: "delete", text: a[i] });
    for (let j = start; j < endB; j++) out.push({ kind: "add", text: b[j] });
  } else {
    const dp = new Uint32Array((n + 1) * (m + 1)), width = m + 1;
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i * width + j] = a[start + i] === b[start + j] ? 1 + dp[(i + 1) * width + j + 1] : Math.max(dp[(i + 1) * width + j], dp[i * width + j + 1]);
    let i = 0, j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && a[start + i] === b[start + j]) { out.push({ kind: "same", text: a[start + i] }); i++; j++; }
      else if (i < n && (j === m || dp[(i + 1) * width + j] >= dp[i * width + j + 1])) out.push({ kind: "delete", text: a[start + i++] });
      else out.push({ kind: "add", text: b[start + j++] });
    }
  }
  for (let i = endA; i < a.length; i++) out.push({ kind: "same", text: a[i] });
  return out;
}

function changedWords(before, after, esc) {
  const tokens = (s) => s.match(/\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu) || [];
  const ops = sequenceDiff(tokens(before), tokens(after), 40000);
  const part = (side) => ops.filter((o) => o.kind === "same" || o.kind === side).map((o) => o.kind === "same" ? esc(o.text) : `<mark class="diff-word-${side}">${esc(o.text)}</mark>`).join("");
  return [part("delete"), part("add")];
}

function diffRows(v, esc) {
  const ops = sequenceDiff(lines(v.before), lines(v.after), 1000000), rows = [], unified = [];
  let left = v.beforeStart ?? 1, right = v.afterStart ?? 1;
  for (let i = 0; i < ops.length;) {
    if (ops[i].kind === "same") {
      const text = esc(ops[i++].text), row = { before: { n: left++, text, kind: "same" }, after: { n: right++, text, kind: "same" } };
      rows.push(row); unified.push({ ...row.before, afterN: row.after.n }); continue;
    }
    const deletes = [], adds = [];
    while (i < ops.length && ops[i].kind !== "same") {
      const op = ops[i++];
      (op.kind === "delete" ? deletes : adds).push({ n: op.kind === "delete" ? left++ : right++, source: op.text, kind: op.kind });
    }
    for (let j = 0; j < Math.max(deletes.length, adds.length); j++) {
      const d = deletes[j], a = adds[j];
      const [dt, at] = d && a ? changedWords(d.source, a.source, esc) : [d ? esc(d.source) : "", a ? esc(a.source) : ""];
      if (d) d.text = dt; if (a) a.text = at;
      rows.push({ before: d, after: a });
    }
    for (const d of deletes) unified.push(d);
    for (const a of adds) unified.push(a);
  }
  return { rows, unified };
}

export function renderRichBlock(kind, v, { esc, inline, renderDetail, answered = false, feedback = [], regionNumber }) {
  const header = `<div class="rich-heading">${v.title ? `<h3>${inline(v.title)}</h3>` : ""}${v.file ? `<span class="rich-file">${esc(v.file)}</span>` : ""}</div>`;
  const wrap = '<button type="button" data-wrap-toggle aria-pressed="false">折り返す</button>';
  const root = `id="rich-${esc(v.id)}" data-rich-id="${esc(v.id)}"`;
  if (kind === "code") {
    const notes = new Map((v.annotations || []).map((n) => [n.line, n]));
    const rows = lines(v.text).map((text, i) => {
      const n = (v.startLine ?? 1) + i, note = notes.get(n);
      return `<div class="code-line" data-code-line="${n}"><span class="code-number">${n}</span><code>${highlight(text, v.language, esc)}</code>${note ? `<button type="button" data-code-note="${n}" aria-expanded="true" aria-controls="rich-${esc(v.id)}__note-${n}" aria-label="行 ${n} の注釈">注釈</button>` : ""}</div>`;
    }).join("\n");
    const annotations = [...notes.values()].map((n) => `<section class="code-note" data-note-line="${n.line}" id="rich-${esc(v.id)}__note-${n.line}"><button type="button" data-code-note-close="${n.line}" aria-label="行 ${n.line} の注釈を閉じる">閉じる</button><h4>行 ${n.line} ${inline(n.title)}</h4><p>${inline(n.text)}</p></section>`).join("\n");
    const regionLabel = `${regionNumber ? `コード ${regionNumber}: ` : ""}${v.title || v.file || "コード"}`;
    return `<div class="rich-code" ${root} data-wrap="false">${header}<div class="rich-tools">${wrap}</div><div class="code-viewport" tabindex="0" role="region" aria-label="${esc(regionLabel)}">${rows}</div><div class="code-notes">${annotations}</div></div>`;
  }
  if (kind === "diff") {
    const { rows, unified } = diffRows(v, esc);
    const side = (x) => `<td class="diff-number">${x?.n ?? ""}</td><td class="diff-${x?.kind || "empty"}"><span class="diff-sign">${x?.kind === "delete" ? "−" : x?.kind === "add" ? "+" : " "}</span><code>${x?.text ?? ""}</code></td>`;
    const split = `<div data-diff-view="split" class="code-viewport" tabindex="0"><table class="diff-split"><colgroup><col class="diff-number-column"><col><col class="diff-number-column"><col></colgroup><thead><tr><th scope="colgroup" colspan="2">変更前</th><th scope="colgroup" colspan="2">変更後</th></tr></thead><tbody>${rows.map((r) => `<tr>${side(r.before)}${side(r.after)}</tr>`).join("\n")}</tbody></table></div>`;
    const joined = `<div data-diff-view="unified" class="code-viewport" tabindex="0" hidden><table class="diff-unified"><colgroup><col class="diff-number-column"><col class="diff-number-column"><col></colgroup><tbody>${unified.map((r) => `<tr><td class="diff-number">${r.kind !== "add" ? r.n : ""}</td><td class="diff-number">${r.kind === "same" ? r.afterN : r.kind === "add" ? r.n : ""}</td><td class="diff-${r.kind}"><span class="diff-sign">${r.kind === "delete" ? "−" : r.kind === "add" ? "+" : " "}</span><code>${r.text}</code></td></tr>`).join("\n")}</tbody></table></div>`;
    return `<div class="rich-diff" ${root} data-wrap="false">${header}<div class="rich-tools"><button type="button" data-diff-mode="split" aria-pressed="true">左右で比較</button><button type="button" data-diff-mode="unified" aria-pressed="false">一列で比較</button>${wrap}</div>${split}${joined}</div>`;
  }
  if (kind === "calls") {
    const mode = v.interaction || "none", changed = [], files = new Set();
    const received = new Map(feedback.filter((f) => f.tree === v.id).map((f) => [f.node, f]));
    const renderNodes = (nodes, parent = "", inherited = false) => `<ul class="call-children">${nodes.map((n) => {
      const f = received.get(n.id), rejected = inherited || f?.action === "reject", isChanged = n.status !== "existing";
      if (isChanged && !rejected) { changed.push(n.id); if (n.file) files.add(n.file); }
      const label = n.status === "existing" ? "既存" : n.status === "added" ? "追加" : n.status === "modified" ? "変更" : "削除";
      const editorId = `rich-${v.id}__proposal-${n.id}`;
      let control = "";
      if (!answered && mode === "propose") control = `<button type="button" data-proposal-toggle aria-expanded="false" aria-controls="${esc(editorId)}">${n.status === "existing" ? "この既存実装へ変更提案" : "この変更に修正提案"}</button><div class="proposal-editor" id="${esc(editorId)}" hidden><label>提案の内容（任意）<textarea class="feedback-text" data-feedback-note aria-label="${esc(n.name)}への提案"></textarea></label></div>`;
      if (!answered && mode === "reject" && isChanged) control = `<button type="button" data-reject-toggle aria-pressed="false">この変更を棄却</button><span class="call-effect"></span><label class="rejection-editor">棄却への補足（任意）<textarea class="feedback-text" data-feedback-note aria-label="${esc(n.name)}の棄却への補足"></textarea></label>`;
      const response = answered && (f || inherited) ? `<p class="received-feedback">${inherited && !f ? "親の棄却を継承" : f.action === "reject" ? "棄却" : f.action === "change" ? "既存実装への変更提案" : "変更への修正提案"}${f?.text ? `: ${esc(f.text)}` : ""}</p>` : "";
      return `<li class="call-node" data-node="${esc(n.id)}" data-name="${esc(n.name)}" data-parent="${esc(parent)}" data-status="${esc(n.status)}" data-file="${esc(n.file || "")}"${f ? ` data-feedback-action="${esc(f.action)}" data-feedback-text="${esc(f.text || "")}"` : ""}${rejected ? ' data-rejected="true"' : ""}><div class="call-card"><div class="call-heading"><span class="call-status">${label}</span><span class="call-name">${inline(n.name)}</span>${n.file ? `<span class="call-file">${esc(n.file)}${n.line ? `:${n.line}` : ""}</span>` : ""}</div>${n.summary ? `<p class="call-summary">${inline(n.summary)}</p>` : ""}${n.detail ? renderDetail(n.detail.title, n.detail.blocks) : ""}<div class="call-actions">${control}${response}</div></div>${n.children ? renderNodes(n.children, n.id, rejected) : ""}</li>`;
    }).join("\n")}</ul>`;
    const body = renderNodes(v.nodes);
    return `<div class="rich-calls" ${root} data-interaction="${mode}" data-answered="${answered}">${header}<p class="call-counts">残る変更 <span data-call-count>${changed.length}</span> 件・変更ファイル <span data-file-count>${files.size}</span> 件</p>${body}</div>`;
  }
  return "";
}
