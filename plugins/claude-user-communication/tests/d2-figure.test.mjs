import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { assemblePage } from "../skills/html-communication/scripts/lib/assemble.mjs";
import { checkD2Figures, loadSource, sha256 } from "../skills/html-communication/scripts/lib/page-source.mjs";

// render-d2.mjs は npm registry から D2 を取るので、試験では描画済みの SVG を手で置く
const D2_TEXT = "a -> b\n";
function svgFor(text, width = 200, height = 120) {
  return `<!-- d2-source sha256:${sha256(text)} @terrastruct/d2@0.1.33 -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}"/></svg>\n`;
}

function setup(t, { fig = {}, d2 = D2_TEXT, svg = svgFor(D2_TEXT) } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-communication-d2-test-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const srcDir = path.join(dir, "src");
  fs.mkdirSync(srcDir);
  const jsonPath = path.join(srcDir, "test-r001.json");
  fs.writeFileSync(jsonPath, JSON.stringify({
    format: 1,
    file: "test-r001",
    type: "report",
    title: "D2 の図の試験",
    project: "test",
    context: ["D2 の図を組み立てる。"],
    summary: ["図を 1 つ置く。"],
    sections: [{ kind: "explain", heading: "a から b へ流れる", blocks: [{ fig: { id: "flow", caption: "a から b への流れ", d2: true, alt: "a から b へ矢印が向かう図", ...fig } }] }],
  }));
  if (d2 != null) fs.writeFileSync(path.join(srcDir, "test-r001.flow.d2"), d2);
  if (svg != null) fs.writeFileSync(path.join(srcDir, "test-r001.flow.svg"), svg);
  return { dir, srcDir, jsonPath };
}

test("D2 の図を data URI の img として、viewBox の幅と高さを付けて埋め込む", (t) => {
  const { dir, jsonPath } = setup(t);
  const r = assemblePage(jsonPath);
  assert.equal(r.ok, true, JSON.stringify(r.findings));
  const html = fs.readFileSync(path.join(dir, "test-r001.html"), "utf8");
  const img = html.match(/<img class="d2"[^>]*>/)?.[0];
  assert.ok(img);
  assert.match(img, /width="200" height="120"/);
  assert.match(img, /alt="a から b へ矢印が向かう図"/);
  assert.match(img, /src="data:image\/svg\+xml;base64,/);
  assert.match(html, /<p class="cap">図 1 a から b への流れ<\/p>/);
});

test("figures ファイルが無くても D2 の図だけのページは組み立てられる", (t) => {
  const { srcDir, jsonPath } = setup(t);
  assert.equal(fs.existsSync(path.join(srcDir, "test-r001.figures.html")), false);
  assert.equal(assemblePage(jsonPath).ok, true);
});

test("SVG が無いと組み立ては止まる", (t) => {
  const { jsonPath } = setup(t, { svg: null });
  const r = assemblePage(jsonPath);
  assert.equal(r.ok, false);
  assert.match(JSON.stringify(r.findings), /render-d2\.mjs で描画する/);
});

test("D2 の図に alt が無いと書式の指摘になる", (t) => {
  const { jsonPath } = setup(t, { fig: { alt: undefined } });
  assert.match(JSON.stringify(loadSource(jsonPath).findings), /alt が要る/);
});

test("原文を直して描画し直していないと検査が指摘する", (t) => {
  const { srcDir, jsonPath } = setup(t, { d2: "a -> b -> c\n" });
  const findings = checkD2Figures(srcDir, "test-r001", loadSource(jsonPath).figIds);
  assert.equal(findings.length, 1);
  assert.match(findings[0].message, /原文と食い違う/);
});

test("幅が 560px を超える D2 の図を検査が指摘し、560px ちょうどは通す", (t) => {
  const wide = setup(t, { svg: svgFor(D2_TEXT, 561) });
  const f1 = checkD2Figures(wide.srcDir, "test-r001", loadSource(wide.jsonPath).figIds);
  assert.equal(f1.length, 1);
  assert.match(f1[0].message, /561px が上限 560px を超える/);
  const edge = setup(t, { svg: svgFor(D2_TEXT, 560) });
  assert.deepEqual(checkD2Figures(edge.srcDir, "test-r001", loadSource(edge.jsonPath).figIds), []);
});

test("D2 の原文が無いと検査が指摘する", (t) => {
  const { srcDir, jsonPath } = setup(t, { d2: null });
  assert.match(JSON.stringify(checkD2Figures(srcDir, "test-r001", loadSource(jsonPath).figIds)), /原文が無い/);
});
