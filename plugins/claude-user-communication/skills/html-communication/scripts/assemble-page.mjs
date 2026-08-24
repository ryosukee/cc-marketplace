#!/usr/bin/env node
// 雛形 templates/page.html に本文ファイルを差し込み、ページを組み立てる。
//
// usage:
//   node assemble-page.mjs <本文.html> <出力.html> --title "<title>" --file <ファイル名（拡張子なし）> \
//        [--qs "q1=ラベル|q2=ラベル"] [--report] [--css <追加 CSS ファイル>]...
//
// 本文ファイルには <main> から下部バー（form は #bar、report は #footer-nav）までを書く。
// 雛形の <head>（CSS を含む）と、form なら <script>（追従・下書き保存・回答コピー）が付く。
//   --qs      form の設問一覧。id=ラベル を | で区切る。省略時は本文の details.qd から id を拾い、
//             ラベルは summary の設問ラベル部分から取る
//   --report  report 型。<script> を付けない
//   --css     パターン集の style.css など、雛形の <style> の末尾へ追加する CSS
// 版は plugin.json の version を読んで埋める。
// Exit: 0 = 成功, 2 = 前提条件エラー（引数不足・雛形なし・placeholder の残り）
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const positional = [];
const opt = { css: [] };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--title") opt.title = args[++i];
  else if (a === "--file") opt.file = args[++i];
  else if (a === "--qs") opt.qs = args[++i];
  else if (a === "--report") opt.report = true;
  else if (a === "--css") opt.css.push(args[++i]);
  else positional.push(a);
}
const [bodyPath, outPath] = positional;
if (!bodyPath || !outPath || !opt.title || !opt.file) {
  console.error("usage: assemble-page.mjs <本文.html> <出力.html> --title <title> --file <name> [--qs ...] [--report] [--css file]...");
  process.exit(2);
}

const tplPath = path.join(here, "..", "templates", "page.html");
if (!fs.existsSync(tplPath)) { console.error(`雛形が無い: ${tplPath}`); process.exit(2); }
const version = JSON.parse(fs.readFileSync(path.join(here, "..", "..", "..", ".claude-plugin", "plugin.json"), "utf8")).version;

const tpl = fs.readFileSync(tplPath, "utf8");
let body = fs.readFileSync(bodyPath, "utf8");
let head = tpl.slice(0, tpl.indexOf("<body>") + "<body>".length);
head = head.replace("{{タイトル}}", opt.title).replace("{{skill のバージョン}}", version);
if (opt.css.length) {
  const extra = opt.css.map((f) => fs.readFileSync(f, "utf8")).join("\n");
  head = head.replace("</style>\n</head>", extra + "\n</style>\n</head>");
}

let script = "";
if (!opt.report) {
  script = tpl.slice(tpl.indexOf("<script>"));
  script = script.replace("'{{テーマ}}'", `'${opt.title.replace(/'/g, "\\'")}'`)
                 .replace("'draft:{{ファイル名（拡張子なし）}}'", `'draft:${opt.file}'`);
  let items;
  if (opt.qs) {
    items = opt.qs.split("|").map((x) => { const i = x.indexOf("="); return [x.slice(0, i), x.slice(i + 1)]; });
  } else {
    items = [...body.matchAll(/<details class="qd" data-for="([^"]+)"[^>]*>\s*<summary>([^<]*)</g)]
      .map((m) => [m[1], m[2].replace(/^.*?\d+ \/ \d+\s*/, "").trim()]);
  }
  const qs = "  var QS = [\n" + items.map(([id, label]) => `    { id: '${id}', label: '${label.replace(/'/g, "\\'")}' }`).join(",\n") + "\n  ];\n";
  script = script.replace(/  var QS = \[[\s\S]*?\];\n/, qs);
  script = "\n" + script;
} else {
  script = "\n</body>\n</html>\n";
}
if (!body.endsWith("\n")) body += "\n";
const out = head + "\n" + body + script;
const left = [...out.matchAll(/\{\{[^}]+\}\}/g)].map((m) => m[0]).filter((x) => x !== "{{...}}");
if (left.length) { console.error(`placeholder が残っている: ${[...new Set(left)].join(" ")}`); process.exit(2); }
fs.writeFileSync(outPath, out);
console.log(`assembled ${outPath} (${out.split("\n").length} lines, v${version}, ${opt.report ? "report" : "form"})`);
