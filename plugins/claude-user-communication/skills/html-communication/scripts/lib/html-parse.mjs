// 生成済みの共通ページ HTML を読むための最小の parser。
// 生成物なので整形は規則的。開始・終了タグの位置を持ち、元の markup を切り出せるようにする。

const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
  "param", "source", "track", "wbr",
]);
const RAW = new Set(["script", "style", "textarea"]);

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", mdash: "—", ndash: "–" };
export function decode(s) {
  return String(s).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, b) => {
    if (b[0] === "#") {
      const n = b[1] === "x" || b[1] === "X" ? parseInt(b.slice(2), 16) : parseInt(b.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return NAMED[b] != null ? NAMED[b] : m;
  });
}

// ノード: { type: "el"|"text"|"comment", tag, attrs, children, parent, start, end, innerStart, innerEnd }
export function parse(html) {
  const root = { type: "el", tag: "#root", attrs: {}, children: [], start: 0, innerStart: 0 };
  const stack = [root];
  let i = 0;
  const pushText = (s, e) => {
    if (e <= s) return;
    stack[stack.length - 1].children.push({ type: "text", text: html.slice(s, e), start: s, end: e, parent: stack[stack.length - 1] });
  };
  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt < 0) { pushText(i, html.length); break; }
    pushText(i, lt);
    if (html.startsWith("<!--", lt)) {
      const e = html.indexOf("-->", lt); const end = e < 0 ? html.length : e + 3;
      stack[stack.length - 1].children.push({ type: "comment", text: html.slice(lt + 4, e < 0 ? html.length : e), start: lt, end });
      i = end; continue;
    }
    if (html.startsWith("<!", lt)) { const e = html.indexOf(">", lt); i = e < 0 ? html.length : e + 1; continue; }
    if (html.startsWith("</", lt)) {
      const e = html.indexOf(">", lt);
      const tag = html.slice(lt + 2, e).trim().toLowerCase();
      for (let k = stack.length - 1; k > 0; k--) {
        if (stack[k].tag === tag) {
          stack[k].innerEnd = lt; stack[k].end = e + 1;
          stack.length = k;
          break;
        }
      }
      i = e + 1; continue;
    }
    // 開始タグ
    const m = /^<([a-zA-Z][a-zA-Z0-9:-]*)/.exec(html.slice(lt));
    if (!m) { pushText(lt, lt + 1); i = lt + 1; continue; }
    const tag = m[1].toLowerCase();
    let j = lt + m[0].length;
    const attrs = {};
    let selfClose = false;
    while (j < html.length) {
      while (j < html.length && /\s/.test(html[j])) j++;
      if (html[j] === ">") { j++; break; }
      if (html[j] === "/" && html[j + 1] === ">") { selfClose = true; j += 2; break; }
      const am = /^([^\s=/>]+)(\s*=\s*("([^"]*)"|'([^']*)'|[^\s>]*))?/.exec(html.slice(j));
      if (!am) { j++; continue; }
      attrs[am[1].toLowerCase()] = decode(am[4] ?? am[5] ?? (am[2] ? am[3] : "") ?? "");
      j += am[0].length;
    }
    const node = { type: "el", tag, attrs, children: [], start: lt, innerStart: j, end: j, innerEnd: j, parent: stack[stack.length - 1] };
    stack[stack.length - 1].children.push(node);
    if (selfClose || VOID.has(tag)) { node.end = j; node.innerEnd = j; i = j; continue; }
    if (RAW.has(tag)) {
      const close = html.toLowerCase().indexOf(`</${tag}`, j);
      const e = close < 0 ? html.length : close;
      node.children.push({ type: "text", text: html.slice(j, e), start: j, end: e, parent: node });
      node.innerEnd = e;
      const gt = html.indexOf(">", e); node.end = gt < 0 ? html.length : gt + 1;
      i = node.end; continue;
    }
    stack.push(node);
    i = j;
  }
  return root;
}

export const els = (node) => node.children.filter((c) => c.type === "el");
export const cls = (node) => (node.attrs?.class || "").split(/\s+/).filter(Boolean);
export const hasCls = (node, c) => cls(node).includes(c);

export function find(node, pred) {
  if (pred(node)) return node;
  for (const c of node.children || []) {
    if (c.type !== "el") continue;
    const r = find(c, pred);
    if (r) return r;
  }
  return null;
}
export function findAll(node, pred, out = []) {
  if (node.type === "el" && pred(node)) out.push(node);
  for (const c of node.children || []) if (c.type === "el") findAll(c, pred, out);
  return out;
}
// タグを外して空白をすべて詰めた文字列
export function textOnly(html) {
  return decode(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, "");
}
