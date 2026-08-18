#!/usr/bin/env node
// handover 引き継ぎ資料の機械検査。
// handover-reviewer agent が突合で確認していた項目を機械へ移したもの:
//   1. テンプレートの必須 9 節の過不足・重複
//   2. 「復元タスク」節が表 1 つで構成され、表の外に項目が落ちていない
//   3. 復元タスクの subject / description が空
//   4. バッククォート内の commit hash が repo に実在する
//   5. バッククォート内のパス (区切りを含むもの) が実在する
//   6. パスに `...` / `…` の省略が混じっている
//   7. git 状態 (branch / HEAD / 未コミット / stash / upstream / worktree) を facts として出し、
//      本文が現 branch と HEAD に言及しているかを検査する
//   8. 「却下と決めたこと」節に先送りの含みを持つ語がある
//   9. 空振りの参照 (存在しない節への参照、名指しの無い 後述 / 前述 / 上記 / 下記)
//
// 4〜9 は 2026-08-18〜19 の実測 (handover-reviewer R1〜R5、5 ラウンド 284.1k トークン・
// ツール 107 回・1,738 秒で収束せず) で、agent がツール 43 回の大半を費やしていた突合と、
// 機械判定できる形の指摘 3 件をそのまま移したもの。
//
// 出力: JSON (stdout)。exit 0 = 指摘なし, 1 = 指摘あり, 2 = 前提条件エラー。

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, resolve, isAbsolute } from "node:path";

const REQUIRED_SECTIONS = [
  "背景",
  "ゴール・原則",
  "決定事項",
  "現在地と再開手順",
  "完了したこと",
  "現在の作業状態",
  "参照すべき資料",
  "復元タスク",
  "却下と決めたこと",
];

// 「却下と決めたこと」に入ってはいけない語。却下はやらないと決めたものだけで、
// 先送りの含みがあるものは復元タスクへ行く
const DEFERRED_WORDS = ["保留", "あとで", "後で", "いずれ", "追って", "TODO", "見送"];

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: check-handover.mjs <handover.md>...");
  process.exit(2);
}

function lineOf(src, index) {
  return src.slice(0, index).split("\n").length;
}

/* fenced code block は検査対象から外す。同じ長さの空白へ潰し、改行は残すので行番号はずれない */
function maskCodeBlocks(src) {
  return src.replace(/^```[\s\S]*?^```/gm, (block) =>
    block.replace(/[^\n]/g, " "),
  );
}

function git(cwd, args) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

const trackedCache = new Map();
/* repo の追跡ファイル一覧。パスの suffix 一致に使う */
function tracked(repoRoot) {
  if (!repoRoot) return [];
  if (!trackedCache.has(repoRoot)) {
    trackedCache.set(repoRoot, (git(repoRoot, ["ls-files"]) || "").split("\n").filter(Boolean));
  }
  return trackedCache.get(repoRoot);
}

/* `## 見出し` で本文を切る。戻り値は 見出し名 -> [{ line, body }] */
function splitSections(src) {
  const sections = new Map();
  const heads = [...src.matchAll(/^##\s+(.+?)\s*$/gm)];
  heads.forEach((h, i) => {
    const name = h[1];
    const start = h.index + h[0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index : src.length;
    if (!sections.has(name)) sections.set(name, []);
    sections.get(name).push({ line: lineOf(src, h.index), body: src.slice(start, end), start });
  });
  return sections;
}

function checkFile(path) {
  const raw = readFileSync(path, "utf8");
  const src = maskCodeBlocks(raw);
  const findings = [];
  const dir = dirname(resolve(path));
  const repoRoot = git(dir, ["rev-parse", "--show-toplevel"]);
  const sections = splitSections(src);

  // 1. 必須 9 節の過不足・重複
  for (const name of REQUIRED_SECTIONS) {
    const hits = sections.get(name);
    if (!hits) {
      findings.push({ check: "required-sections", line: null, message: `必須の節「${name}」が無い` });
    } else if (hits.length > 1) {
      findings.push({
        check: "required-sections",
        line: hits[1].line,
        message: `節「${name}」が ${hits.length} 個ある`,
      });
    }
  }
  for (const name of sections.keys()) {
    if (!REQUIRED_SECTIONS.includes(name)) {
      findings.push({
        check: "required-sections",
        line: sections.get(name)[0].line,
        message: `テンプレートに無い節「${name}」がある。行き先が他にあるなら移す`,
      });
    }
  }

  // 2. 復元タスク節の表構造 / 3. 空セル
  const taskSection = sections.get("復元タスク")?.[0];
  if (taskSection) {
    const baseLine = lineOf(src, taskSection.start);
    const lines = taskSection.body.split("\n");
    let tableStarted = false;
    let tableEnded = false;
    const rows = [];
    lines.forEach((raw, i) => {
      const line = raw.trim();
      const lineNo = baseLine + i;
      if (line.startsWith("|")) {
        if (tableEnded) {
          findings.push({
            check: "task-table",
            line: lineNo,
            message: "復元タスクの表が途中で切れて 2 つに分かれている。空行を挟まず 1 つの表にする",
          });
          tableEnded = false;
        }
        tableStarted = true;
        rows.push({ line: lineNo, cells: line.replace(/^\|/, "").replace(/\|$/, "").split("|") });
        return;
      }
      if (line === "") {
        if (tableStarted) tableEnded = true;
        return;
      }
      if (tableStarted) {
        findings.push({
          check: "task-table",
          line: lineNo,
          message: "復元タスクの表の外に地の文がある。表の行として書くか、他の節へ移す",
        });
      }
    });
    if (!tableStarted) {
      findings.push({
        check: "task-table",
        line: taskSection.line,
        message: "復元タスクの表が無い。復元タスクが無いなら「なし」と明記する",
      });
    }
    for (const row of rows.slice(2)) {
      const subject = (row.cells[0] ?? "").trim();
      const description = (row.cells[1] ?? "").trim();
      if (!subject || !description) {
        findings.push({
          check: "empty-cell",
          line: row.line,
          message: `復元タスクの ${!subject ? "subject" : "description"} が空`,
        });
      }
    }
  }

  // 4. commit hash の実在
  const seenHash = new Set();
  for (const m of src.matchAll(/`([0-9a-f]{7,40})`/g)) {
    const hash = m[1];
    if (seenHash.has(hash)) continue;
    seenHash.add(hash);
    if (!repoRoot) continue;
    if (git(repoRoot, ["cat-file", "-t", hash]) !== "commit") {
      findings.push({
        check: "commit-exists",
        line: lineOf(src, m.index),
        message: `commit ${hash} がこの repo に無い`,
      });
    }
  }

  // 5. パスの実在 / 6. パスの省略
  const seenPath = new Set();
  for (const m of src.matchAll(/`([^`\s]+)`/g)) {
    const token = m[1];
    if (seenPath.has(token)) continue;
    seenPath.add(token);
    if (/^(https?|mailto):/.test(token)) continue;
    if (/[$<>{}*?]/.test(token)) continue; // 変数展開・プレースホルダ・glob
    // 区切りを含むものだけを見る。裸のファイル名は repo 外の生成物 (ページ・図) を
    // 指すことが多く、実在を問えない
    if (!token.includes("/")) continue;
    const line = lineOf(src, m.index);
    if (token.includes("...") || token.includes("…")) {
      findings.push({
        check: "path-ellipsis",
        line,
        message: `パス ${token} が省略されている。次セッションが開けるよう全体を書く`,
      });
      continue;
    }
    const clean = token.replace(/[),.、。]+$/, "");
    const candidates = [];
    if (clean.startsWith("~/")) candidates.push(resolve(homedir(), clean.slice(2)));
    else if (isAbsolute(clean)) candidates.push(clean);
    else {
      if (repoRoot) candidates.push(resolve(repoRoot, clean));
      candidates.push(resolve(dir, clean));
    }
    if (candidates.some((c) => existsSync(c))) continue;
    // repo の基準を省いて書かれたパス (`skills/foo/SKILL.md` 等) は suffix で拾う
    const suffix = "/" + clean.replace(/\/$/, "");
    if (tracked(repoRoot).some((f) => f === clean || f.endsWith(suffix) || f.includes(suffix + "/"))) continue;
    findings.push({ check: "path-exists", line, message: `パス ${token} が実在しない` });
  }

  // 7. git 状態
  let gitFacts = null;
  if (repoRoot) {
    const upstream = git(repoRoot, ["rev-list", "--left-right", "--count", "@{upstream}...HEAD"]);
    const [behind, ahead] = upstream ? upstream.split(/\s+/) : [null, null];
    gitFacts = {
      root: repoRoot,
      branch: git(repoRoot, ["rev-parse", "--abbrev-ref", "HEAD"]),
      head: git(repoRoot, ["rev-parse", "--short", "HEAD"]),
      uncommitted: (git(repoRoot, ["status", "--porcelain"]) || "").split("\n").filter(Boolean).length,
      stashes: (git(repoRoot, ["stash", "list"]) || "").split("\n").filter(Boolean).length,
      behind: behind === null ? null : Number(behind),
      ahead: ahead === null ? null : Number(ahead),
      worktrees: (git(repoRoot, ["worktree", "list"]) || "").split("\n").filter(Boolean).length,
    };
    const stateSection = sections.get("現在の作業状態")?.[0];
    if (stateSection && gitFacts.branch && !stateSection.body.includes(gitFacts.branch)) {
      findings.push({
        check: "git-state",
        line: stateSection.line,
        message: `「現在の作業状態」が現 branch ${gitFacts.branch} に言及していない`,
      });
    }
    if (gitFacts.head && !src.includes(gitFacts.head)) {
      findings.push({
        check: "git-state",
        line: stateSection ? stateSection.line : null,
        message: `HEAD ${gitFacts.head} が本文のどこにも出てこない。到達点を識別子で書く`,
      });
    }
  }

  // 8. 却下節の先送り語
  const rejectSection = sections.get("却下と決めたこと")?.[0];
  if (rejectSection) {
    const baseLine = lineOf(src, rejectSection.start);
    rejectSection.body.split("\n").forEach((line, i) => {
      for (const word of DEFERRED_WORDS) {
        if (line.includes(word)) {
          findings.push({
            check: "deferred-wording",
            line: baseLine + i,
            message: `却下の節に先送りの語「${word}」がある。やると決めたなら復元タスクへ移す`,
          });
        }
      }
    });
  }

  // 9. 空振りの参照
  const headingNames = [...sections.keys()];
  for (const m of src.matchAll(/「([^」\n]{1,40})」(?:の)?(?:節|セクション)/g)) {
    const target = m[1];
    // 同じ行でファイルを名指ししているなら他ファイルの節への参照。実在は問えない
    const eol = src.indexOf("\n", m.index);
    const lineText = src.slice(src.lastIndexOf("\n", m.index) + 1, eol === -1 ? src.length : eol);
    if (/`[^`\s]*\/[^`\s]*`/.test(lineText)) continue;
    if (!headingNames.some((h) => h === target || h.includes(target))) {
      findings.push({
        check: "dangling-reference",
        line: lineOf(src, m.index),
        message: `節「${target}」への参照だが、その見出しが無い`,
      });
    }
  }
  for (const m of src.matchAll(/(後述|前述|上記|下記)(?![のにでは]?\s*[「`])/g)) {
    findings.push({
      check: "dangling-reference",
      line: lineOf(src, m.index),
      message: `「${m[1]}」の参照先が名指しされていない。節名かパスを書く`,
    });
  }

  return { findings, gitFacts };
}

let total = 0;
const results = [];
let git_ = null;
for (const f of files) {
  let out;
  try {
    out = checkFile(f);
  } catch (e) {
    console.error(`${f}: ${e.message}`);
    process.exit(2);
  }
  git_ = git_ ?? out.gitFacts;
  total += out.findings.length;
  results.push({ file: f, findings: out.findings });
}
console.log(JSON.stringify({ total, git: git_, results }, null, 2));
process.exit(total > 0 ? 1 : 0);
