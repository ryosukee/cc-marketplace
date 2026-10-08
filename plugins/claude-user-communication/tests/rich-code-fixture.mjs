import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { assemblePage } from "../skills/html-communication/scripts/lib/assemble.mjs";

export const source = {
  format: 1, file: "test-f021", type: "form", title: "コードと呼び出しの変更", project: "test",
  context: ["提案された変更をコードと呼び出し関係から確認する。"],
  sections: [
    { kind: "explain", heading: "原文と差分", blocks: [
      { code: { id: "source-code", title: "設定を読む実装", file: "src/settings.ts", language: "typescript", startLine: 10,
        text: 'export function readSettings() {\n  const label = "<script>alert(1)</script>";\n  return { label, retries: 3 };\n}\n',
        annotations: [{ line: 11, title: "文字列の原文", text: "タグの形をした文字列もコードとして表示する。[^implementation]" }, { line: 12, title: "既定値", text: "再試行の回数を返す。" }] } },
      { diff: { id: "settings-diff", title: "再試行の条件", file: "src/settings.ts", beforeStart: 20, afterStart: 20,
        before: 'const retries = 3;\nconst legacy = true;\nreturn retries;\n', after: 'const retries = 5;\nconst enabled = true;\nconst timeout = 100;\nreturn retries;\n' } },
    ] },
    { kind: "explain", heading: "変更への提案", blocks: [
      { calls: { id: "proposal-tree", title: "呼び出し先へ提案する", interaction: "propose", nodes: [
        { id: "entry", name: "start()", status: "existing", file: "src/main.ts", line: 1, summary: "既存の入口。[^implementation]", children: [
          { id: "load", name: "readSettings()", status: "modified", file: "src/settings.ts", line: 10, summary: "再試行の条件を変える。", detail: { title: "設定の実装", blocks: [{ code: { id: "detail-code", language: "ts", startLine: 10, text: "return { retries: 5 };", annotations: [{ line: 10, title: "戻り値", text: "呼び出し元が利用する設定。" }] } }] }, children: [
            { id: "cache", name: "cacheSettings()", status: "added", file: "src/settings.ts", line: 30, summary: "同じファイルにキャッシュを追加する。" },
            { id: "old-cache", name: "legacyCache()", status: "removed", file: "src/legacy.ts", line: 9 },
          ] },
        ] },
      ] } },
    ] },
    { kind: "explain", heading: "変更の棄却", blocks: [
      { calls: { id: "rejection-tree", title: "親と子の変更を確認する", interaction: "reject", nodes: [
        { id: "entry", name: "start()", status: "existing", file: "src/main.ts", children: [
          { id: "load", name: "readSettings()", status: "modified", file: "src/settings.ts", summary: "この変更を棄却すると子の変更にも及ぶ。", children: [
            { id: "cache", name: "cacheSettings()", status: "added", file: "src/settings.ts" },
            { id: "old-cache", name: "legacyCache()", status: "removed", file: "src/legacy.ts" },
            { id: "existing-helper", name: "parse()", status: "existing", file: "src/parser.ts" },
          ] },
          { id: "notify", name: "notify()", status: "added", file: "src/notify.ts" },
        ] },
      ] } },
    ] },
    { kind: "question", heading: "変更の方針", blocks: ["コードを確認して方針を選ぶ。"], question: {
      label: "この変更の扱い", text: "どの方針で進めるか。", options: [{ label: "進める", description: "提案された変更を採用する。" }, { label: "再検討する", description: "内容を確認し直す。" }],
    } },
  ],
  footnotes: { implementation: "原文と呼び出し関係に基づく説明。" },
};

export function createFixture(t, sources = [source]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "html-rich-code-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, "src"));
  for (const src of sources) {
    const json = path.join(dir, "src", src.file + ".json");
    fs.writeFileSync(json, JSON.stringify(src));
    const result = assemblePage(json);
    assert.equal(result.ok, true, JSON.stringify(result.findings));
  }
  return dir;
}
