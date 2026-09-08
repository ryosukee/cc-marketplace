// 生成元 JSON から閲覧用 HTML を組み立てる本体。assemble-page.mjs と record-answer.mjs が使う。
//
// 入力は src/{file}.json と、あれば src/{file}.figures.html。出力は <src の親>/{file}.html。
// 出力先に中身のあるファイルがあるときは、force を付けたときだけ上書きする
// （claim-page-number.sh が作った 0 バイトの予約は通す）。
// 出力した HTML は読み取り専用（0444）にする。閲覧用 HTML は script でしか書かない。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSource, loadFigures, renderPage, sha256, esc } from "./page-source.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
export const SKILL_ROOT = path.resolve(here, "..", "..");
export const TEMPLATE_PATH = path.join(SKILL_ROOT, "templates", "page.html");
export const PATTERNS_DIR = path.join(SKILL_ROOT, "references", "patterns");
export const PLUGIN_JSON = path.resolve(SKILL_ROOT, "..", "..", ".claude-plugin", "plugin.json");

export function pluginVersion() {
  return JSON.parse(fs.readFileSync(PLUGIN_JSON, "utf8")).version;
}

// src/{file}.json → { dir, stem, htmlPath, figuresPath }
export function pagePaths(jsonPath) {
  const abs = path.resolve(jsonPath);
  const srcDir = path.dirname(abs);
  const stem = path.basename(abs).replace(/\.json$/, "");
  return {
    jsonPath: abs,
    srcDir,
    dir: path.dirname(srcDir),
    stem,
    htmlPath: path.join(path.dirname(srcDir), `${stem}.html`),
    figuresPath: path.join(srcDir, `${stem}.figures.html`),
  };
}

// 読み取り専用のファイルへ書く。書いたあと 0444 に戻す
export function writeReadOnly(file, content) {
  if (fs.existsSync(file)) fs.chmodSync(file, 0o644);
  fs.writeFileSync(file, content);
  fs.chmodSync(file, 0o444);
}

// 戻り値: { ok, out, findings, counts, version }
export function assemblePage(jsonPath, { force = false, out = null } = {}) {
  const p = pagePaths(jsonPath);
  const outPath = out ? path.resolve(out) : p.htmlPath;
  const loaded = loadSource(p.jsonPath);
  if (loaded.findings.length) return { ok: false, out: outPath, findings: loaded.findings };
  if (path.basename(p.srcDir) !== "src") {
    return { ok: false, out: outPath, findings: [{ check: "source", where: p.jsonPath, message: "生成元は配信ディレクトリの src/ に置く" }] };
  }
  if (fs.existsSync(outPath) && !force && fs.statSync(outPath).size > 0) {
    return { ok: false, out: outPath, findings: [{ check: "output", where: outPath, message: "出力先に中身のあるファイルがある。回答前の同名上書きの改稿なら --force を付ける。別のページなら claim-page-number.sh で番号を取り直す" }] };
  }
  if (!fs.existsSync(TEMPLATE_PATH)) return { ok: false, out: outPath, findings: [{ check: "template", where: TEMPLATE_PATH, message: "雛形が無い" }] };

  const version = pluginVersion();
  const figures = loadFigures(p.figuresPath);
  const src = loaded.source;
  const r = renderPage(src, { version, figures, patternsDir: PATTERNS_DIR });
  if (r.findings.length) return { ok: false, out: outPath, findings: r.findings };

  let html = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const isForm = src.type === "form";
  if (!isForm) {
    // report は下部バーの操作が無いので script ごと落とす。雛形の末尾にある 1 つだけが対象なので後ろから探す
    const a = html.lastIndexOf("<script>"), b = html.lastIndexOf("</script>");
    if (a < 0 || b < 0) return { ok: false, out: outPath, findings: [{ check: "template", where: TEMPLATE_PATH, message: "雛形に <script> が無い" }] };
    html = html.slice(0, a) + html.slice(b + "</script>".length).replace(/^\n/, "");
  }
  const rep = (from, to) => { html = html.split(from).join(to); };
  rep("{{タイトル}}", esc(src.title));
  rep("{{skill のバージョン}}", version);
  rep("{{生成元}}", `src/${p.stem}.json sha256:${sha256(loaded.text)}`);
  rep("{{追加 CSS}}", r.extraCss ? r.extraCss + "\n" : "");
  rep("{{図の CSS}}", r.figureStyle ? r.figureStyle + "\n" : "");
  rep("{{アイコン}}", r.lead ? r.lead + "\n" : "");
  rep("{{本文}}", r.body.replace(/\n$/, ""));
  if (isForm) {
    rep("{{テーマ}}", JSON.stringify(src.title));
    rep("{{下書きキー}}", JSON.stringify(`draft:${p.stem}`));
    rep("{{設問一覧}}", "[\n" + r.qs.map((q) => `    { id: ${JSON.stringify(q.id)}, label: ${JSON.stringify(q.label)} }`).join(",\n") + "\n  ]");
    rep("{{回答済み}}", r.answered ? "true" : "false");
  }
  const left = [...html.matchAll(/\{\{[^}]+\}\}/g)].map((m) => m[0]).filter((x) => x !== "{{...}}");
  if (left.length) return { ok: false, out: outPath, findings: [{ check: "template", where: TEMPLATE_PATH, message: `placeholder が残っている: ${[...new Set(left)].join(" ")}` }] };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  writeReadOnly(outPath, html);
  return { ok: true, out: outPath, findings: [], counts: r.counts, version, type: src.type, lines: html.split("\n").length, answered: r.answered };
}
