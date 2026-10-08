import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { assemblePage } from "../skills/html-communication/scripts/lib/assemble.mjs";

export const source = {
  format: 1, file: "test-r031", type: "report", presentation: "slides", title: "計画の説明", project: "test",
  context: ["調査結果を共有する。"], summary: ["次の工程を決める。"],
  sections: [
    { kind: "explain", heading: "小さく検証する", blocks: ["工程を順に進める。[^source]", { ul: ["仮説を確かめる"], step: 1 }, { ul: ["結果を比較する"], step: 2 }, { detail: { label: "詳しい根拠", title: "調査の記録", blocks: ["根拠の全文。[^source]", { pre: "長い詳細。".repeat(100) }] } }] },
    { kind: "explain", heading: "工程を比べる", blocks: [{ table: { caption: "工程の比較", columns: ["工程", "期間"], rows: [["調査", "一日"], ["検証", "二日"]] } }, { fig: { id: "flow", caption: "工程の流れ", notes: [{ label: "図の補足", text: "段階的に進める。[^source]" }] } }] },
  ], footnotes: { source: "検証の出典。" }, reference: { lead: "参考になる資料。", blocks: ["資料の全文。"] }, generation: "生成した資料。",
};
export function createFixture(t, sources = [source]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-slides-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, "src"));
  for (const src of sources) {
    const json = path.join(dir, "src", src.file + ".json");
    fs.writeFileSync(json, JSON.stringify(src));
    fs.writeFileSync(path.join(dir, "src", src.file + ".figures.html"), '<template data-fig="flow"><p>調査 → 検証</p></template>');
    assert.equal(assemblePage(json).ok, true);
  }
  return dir;
}
