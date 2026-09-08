#!/usr/bin/env node
// 受領した回答をページの生成元 JSON に記録し、閲覧用 HTML・index.html・archive.html を揃える。
//
// usage:
//   node record-answer.mjs <src/{file}.json> --answer <貼り付けを保存したファイル | -> [--date YYYY-MM-DD] [--replace]
//   node record-answer.mjs <src/{file}.json> --confirm "<ユーザーの確認の発言（逐語）>" [--date YYYY-MM-DD] [--replace]
//
// form は --answer で「## HTML フォーム回答」の貼り付けを渡す（- は stdin）。全文を answers.raw に逐語で残し、
// 行の形式 `- Q1（ラベル）: 回答  ※ 補足` に合う行だけを items に解釈する。
// `- Q<数字>` で始まるのに形が合わない行が 1 行でもあれば、黙って未回答にせず step 1 で止める。
// report は --confirm でユーザーの確認の発言を渡す。
//
// 4 つの手順を順に行い、手順ごとに done / skip を stdout に出す。
//   1. answers を JSON に書く（同じ内容が既にあれば skip。別の内容があれば --replace が無い限り止まる）
//   2. 閲覧用 HTML を組み立て直す（回答済みの状態で組む）
//   3. index.html の当該エントリの status を answered / confirmed にし、statusChanged を受領日にする
//   4. build-archive.mjs で archive.html を作り直す
// 途中で失敗したら、もう 1 度回す。済んだ手順は skip になるので、2 度回しても壊れない。
//
// Exit: 0 = 4 手順まで到達, 1 = 手順のどれかで止まった（どこで止まったかは stdout）, 2 = 前提条件エラー
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadSource, parseAnswerText } from "./lib/page-source.mjs";
import { assemblePage, pagePaths } from "./lib/assemble.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = {};
const positional = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--answer") opt.answer = args[++i];
  else if (a === "--confirm") opt.confirm = args[++i];
  else if (a === "--date") opt.date = args[++i];
  else if (a === "--replace") opt.replace = true;
  else positional.push(a);
}
const [jsonPath] = positional;
if (!jsonPath || (opt.answer == null) === (opt.confirm == null)) {
  console.error("usage: record-answer.mjs <src/{file}.json> (--answer <file|-> | --confirm <text>) [--date YYYY-MM-DD] [--replace]");
  process.exit(2);
}
// 既定は実行した端末のローカル日付。受領日は人が読む日付なので UTC に寄せない
const today = () => { const d = new Date(); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
const date = opt.date || today();
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { console.error(`--date は YYYY-MM-DD: ${date}`); process.exit(2); }

const p = pagePaths(jsonPath);
const loaded = loadSource(p.jsonPath);
if (!loaded.source) { console.error(JSON.stringify(loaded.findings, null, 2)); process.exit(2); }
const src = loaded.source;
if (opt.answer != null && src.type !== "form") { console.error("--answer は form のページに使う"); process.exit(2); }
if (opt.confirm != null && src.type !== "report") { console.error("--confirm は report のページに使う"); process.exit(2); }

function step(n, name, result) { console.log(`step ${n}/4 ${name}: ${result}`); }
function stop(n, name, why) { step(n, name, `FAILED ${why}`); process.exit(1); }

// 1. answers
let answers;
if (opt.answer != null) {
  const text = opt.answer === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(opt.answer, "utf8");
  if (!text.trim()) stop(1, "answers", "貼り付けが空");
  const parsed = parseAnswerText(text, src, date);
  // 設問の行に見えるのに形が合わない行は、黙って未回答にせず止める
  if (parsed.unparsed.length) {
    stop(1, "answers", `設問の行として解釈できない行が ${parsed.unparsed.length} 行ある。貼り付けを直してもう 1 度回す:\n  ` + parsed.unparsed.join("\n  "));
  }
  const { unparsed, ...rest } = parsed;
  answers = rest;
} else {
  if (!opt.confirm.trim()) stop(1, "answers", "確認の発言が空");
  answers = { received: date, confirmed: opt.confirm };
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
if (src.answers && same({ ...src.answers, received: null }, { ...answers, received: null })) {
  step(1, "answers", "skip（同じ回答が既にある）");
} else if (src.answers && !opt.replace) {
  stop(1, "answers", "別の回答が既にある。上書きするなら --replace");
} else {
  const next = { ...src, answers };
  fs.writeFileSync(p.jsonPath, JSON.stringify(next, null, 2) + "\n");
  step(1, "answers", `done（${p.jsonPath}）`);
}

// 2. HTML
const r = assemblePage(p.jsonPath, { force: true });
if (!r.ok) stop(2, "html", JSON.stringify(r.findings));
step(2, "html", `done（${r.out}）`);

// 3. index.html
const indexPath = path.join(p.dir, "index.html");
if (!fs.existsSync(indexPath)) stop(3, "index", `index.html が無い: ${indexPath}`);
const target = src.type === "form" ? "answered" : "confirmed";
let idx = fs.readFileSync(indexPath, "utf8");
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const entryRe = new RegExp(`\\{[^{}]*?file:\\s*"${reEsc(p.stem)}\\.html"[^{}]*\\}`);
const found = idx.match(entryRe);
if (!found) stop(3, "index", `index.html にエントリが無い: ${p.stem}.html`);
const STATUS_RE = /status:\s*"[^"]*"/;
const cur = found[0].match(/status:\s*"([^"]*)"/)?.[1];
if (cur == null) stop(3, "index", `index.html のエントリに status が無い: ${p.stem}.html`);
if (cur === target) {
  step(3, "index", `skip（既に ${target}）`);
} else {
  let entry = found[0].replace(STATUS_RE, `status: "${target}"`);
  if (/statusChanged:\s*"[^"]*"/.test(entry)) {
    entry = entry.replace(/statusChanged:\s*"[^"]*"/, `statusChanged: "${date}"`);
  } else {
    // status の直後へ挿す。status の後ろにカンマが無いエントリでも効かせるため、位置で切って繋ぐ
    const sm = STATUS_RE.exec(entry);
    const at = sm.index + sm[0].length;
    entry = entry.slice(0, at) + `,\n    statusChanged: "${date}"` + entry.slice(at);
  }
  if (!/statusChanged:\s*"[^"]*"/.test(entry)) stop(3, "index", "statusChanged を入れられなかった");
  // 文字列パターンの replace は entry の $& や $' を置換パターンとして解釈するので、位置で切って繋ぐ
  idx = idx.slice(0, found.index) + entry + idx.slice(found.index + found[0].length);
  fs.writeFileSync(indexPath, idx);
  step(3, "index", `done（${cur} → ${target}, statusChanged ${date}）`);
}

// 4. archive.html
try {
  const out = execFileSync(process.execPath, [path.join(here, "build-archive.mjs"), p.dir], { encoding: "utf8" });
  step(4, "archive", `done（${out.trim()}）`);
} catch (e) {
  stop(4, "archive", e.stderr || e.message);
}
