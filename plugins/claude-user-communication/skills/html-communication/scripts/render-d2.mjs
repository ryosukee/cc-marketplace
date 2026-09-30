#!/usr/bin/env node
// D2 の図を描画する。生成元 JSON の fig のうち d2: true のものについて、
// 原文 src/{file}.{id}.d2 を SVG にして src/{file}.{id}.svg へ書く。
// 組み立て（assemble-page.mjs）はこの SVG を data URI の img にしてページへ埋め込む。
//
// D2 は npm の WASM 版を版固定で使い、実行のたびに一時ディレクトリへ入れて、終わったら消す。
// npm のキャッシュにあればそれを使い（--prefer-offline）、無ければ npm registry から取得する。
// SVG の先頭には描画に使った原文の sha256 を注釈で残し、check-source.mjs が原文との食い違いを見る。
//
// usage: node render-d2.mjs <src/{file}.json> [図の id...]
//   図の id を省くと、JSON にある D2 の図をすべて描画する
// 出力: JSON (stdout)。exit 0 = 指摘なし, 1 = 指摘あり（幅の超過など。SVG は書く）, 2 = 前提条件エラー
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { loadSource, d2Paths, svgSize, sha256, D2_MAX_WIDTH } from "./lib/page-source.mjs";
import { pagePaths } from "./lib/assemble.mjs";

const D2_PACKAGE = "@terrastruct/d2";
const D2_VERSION = "0.1.33";
// テーマは番号で指定する。0 = Neutral Default（ライト）、200 = Dark Mauve（ダーク）
const RENDER_OPTIONS = { themeID: 0, darkThemeID: 200, pad: 8, noXMLTag: true };
// レイアウトは指定しない。D2 の既定の dagre になり、原文の vars.d2-config.layout-engine で図ごとに elk へ替えられる

function fail(message) {
  console.error(message);
  process.exit(2);
}

const [jsonArg, ...only] = process.argv.slice(2);
if (!jsonArg) fail("usage: render-d2.mjs <src/{file}.json> [図の id...]");

const p = pagePaths(jsonArg);
const loaded = loadSource(p.jsonPath);
if (!loaded.source) fail(`${p.jsonPath}: ${JSON.stringify(loaded.findings)}`);
const targets = loaded.figIds.filter((f) => f.d2 && (only.length === 0 || only.includes(f.id)));
const unknown = only.filter((id) => !loaded.figIds.some((f) => f.d2 && f.id === id));
if (unknown.length) fail(`JSON に D2 の図（d2: true）として無い id: ${unknown.join(" ")}`);
if (targets.length === 0) fail("JSON に D2 の図（fig の d2: true）が無い");
for (const f of targets) {
  const { d2 } = d2Paths(p.srcDir, p.stem, f.id);
  if (!fs.existsSync(d2)) fail(`D2 の図 "${f.id}" の原文が無い: ${d2}`);
}

const work = fs.mkdtempSync(path.join(os.tmpdir(), "html-communication-d2-"));
const rendered = [];
const findings = [];
let fatal = null;
try {
  try {
    execFileSync("npm", ["install", "--prefix", work, "--prefer-offline", "--no-save","--no-audit", "--no-fund", "--loglevel=error", `${D2_PACKAGE}@${D2_VERSION}`], { stdio: ["ignore", "ignore", "inherit"] });
  } catch (e) {
    throw new Error(`${D2_PACKAGE}@${D2_VERSION} を npm で取得できない（${e.message}）。ネットワークと npm の設定を確かめる`);
  }
  const entry = path.join(work, "node_modules", ...D2_PACKAGE.split("/"), "dist", "node-esm", "index.js");
  const { D2 } = await import(pathToFileURL(entry).href);
  const d2 = new D2();
  for (const f of targets) {
    const paths = d2Paths(p.srcDir, p.stem, f.id);
    const text = fs.readFileSync(paths.d2, "utf8");
    let svg;
    try {
      const compiled = await d2.compile(text);
      svg = await d2.render(compiled.diagram, { ...compiled.renderOptions, ...RENDER_OPTIONS });
    } catch (e) {
      findings.push({ check: "d2", where: paths.d2, message: `描画に失敗した: ${String(e.message || e).slice(0, 500)}` });
      continue;
    }
    const out = `<!-- d2-source sha256:${sha256(text)} ${D2_PACKAGE}@${D2_VERSION} -->\n${svg}\n`;
    fs.writeFileSync(paths.svg, out);
    const size = svgSize(svg);
    rendered.push({ id: f.id, out: paths.svg, ...size });
    if (size && size.width > D2_MAX_WIDTH) findings.push({ check: "d2", where: paths.svg, message: `幅 ${size.width}px が上限 ${D2_MAX_WIDTH}px を超える。縦向きにする・横に並ぶノードを減らす・ラベルを短くする・図を分けるのいずれかで狭める` });
  }
} catch (e) {
  fatal = e;
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
if (fatal) fail(fatal.message);

console.log(JSON.stringify({ rendered, total: findings.length, findings }, null, 2));
// WASM の worker が残ってプロセスが終わらないので、明示的に終える
process.exit(findings.length > 0 ? 1 : 0);
