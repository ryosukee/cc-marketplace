#!/usr/bin/env node
// 生成元 JSON（src/{file}.json）の検査。validate-page.sh が閲覧用 HTML と一緒に回す。
//
// 見るもの:
//   1. 書式（format の版・必須のキー・節とブロックの形・設問の形・report に設問が無いか）
//   2. 参照の解決（[^キー] が footnotes / supplements にあるか、使われていない脚注・補足が無いか、
//      キーが両方に無いか、補足が 26 個以下か）
//   3. 文字列への HTML タグの混入（6 種の記法だけを使う。引用の段落は対象外）
//   4. 番号の直書き（見出しの「説明 n」「設問 n」、caption の「表 n」「図 n」は組み立て時に付く）
//   5. 図（fig / custom の id が figures ファイルにあるか、figures ファイルの図が全部使われているか）
//   6. パターン集の CSS（css に書いた名前の style.css があるか）
//   7. 閲覧用 HTML との食い違い（HTML の <meta name="source"> のハッシュが JSON の内容と一致するか。
//      一致しなければ HTML が古いか、JSON を直したあと組み立てていない）
//
// usage: node check-source.mjs <src/{file}.json>...
// 出力: JSON (stdout)。exit 0 = 指摘なし, 1 = 指摘あり, 2 = 前提条件エラー
import fs from "node:fs";
import { loadSource, loadFigures, renderPage, sha256 } from "./lib/page-source.mjs";
import { pagePaths, PATTERNS_DIR } from "./lib/assemble.mjs";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: check-source.mjs <src/{file}.json>...");
  process.exit(2);
}

function checkFile(jsonPath) {
  const p = pagePaths(jsonPath);
  const loaded = loadSource(p.jsonPath);
  const findings = [...loaded.findings];
  if (!loaded.source) return findings;
  if (p.srcDir.split("/").pop() !== "src") findings.push({ check: "source", where: p.jsonPath, message: "生成元は共通ページディレクトリの src/ に置く" });
  const figures = loadFigures(p.figuresPath);
  if (!figures.exists && loaded.figIds.length) findings.push({ check: "source", where: p.figuresPath, message: `図のブロックが ${loaded.figIds.length} 個あるのに figures ファイルが無い` });
  if (findings.length === 0) {
    const r = renderPage(loaded.source, { version: "0", figures, patternsDir: PATTERNS_DIR });
    findings.push(...r.findings);
  }
  // 閲覧用 HTML との食い違い
  if (fs.existsSync(p.htmlPath) && fs.statSync(p.htmlPath).size > 0) {
    const html = fs.readFileSync(p.htmlPath, "utf8");
    const m = html.match(/<meta name="source" content="src\/([^" ]+) sha256:([0-9a-f]{64})"/);
    if (!m) findings.push({ check: "stale-html", where: p.htmlPath, message: "閲覧用 HTML に生成元の記録（meta name=\"source\"）が無い。JSON から組み立て直す" });
    else if (m[1] !== `${p.stem}.json`) findings.push({ check: "stale-html", where: p.htmlPath, message: `閲覧用 HTML の生成元が ${m[1]} になっている` });
    else if (m[2] !== sha256(loaded.text)) findings.push({ check: "stale-html", where: p.htmlPath, message: "閲覧用 HTML が生成元の JSON と食い違う。JSON を直したあと assemble-page.mjs --force を回す" });
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
