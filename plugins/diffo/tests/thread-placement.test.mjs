import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';

import { HOOK, patchAssetsDir, patchPlacement } from '../bin/diffo-patch-placement.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ui = readFileSync(path.join(root, 'assets/diffo-ui.js'), 'utf8');
const fixture = readFileSync(path.join(root, 'tests/fixtures/diffo-0.26.0-placement.js'), 'utf8');

// diffo 0.26.0 の配置関数（Qu・od・sd など）
const diffo = vm.createContext({});
vm.runInContext(fixture, diffo);

// diffo-ui.js が定義する globalThis.__diffoPlaceThreads。DOMContentLoaded 前の状態で読み込む
const loadPlaceThreads = () => {
  const context = vm.createContext({
    console: { warn() {} },
    document: { readyState: 'loading', addEventListener() {} },
  });
  vm.runInContext(ui, context);
  return context.__diffoPlaceThreads;
};
const placeThreads = loadPlaceThreads();

// spec の各行は diff の接頭辞（' ' '+' '-'）付き。行番号は oldStart・newStart から振る
const makeHunk = (id, oldStart, newStart, spec) => {
  let oldNo = oldStart;
  let newNo = newStart;
  const lines = spec.map((row) => {
    const text = row.slice(1);
    if (row[0] === '+') return { kind: 'add', text, oldNo: null, newNo: newNo++ };
    if (row[0] === '-') return { kind: 'del', text, oldNo: oldNo++, newNo: null };
    return { kind: 'context', text, oldNo: oldNo++, newNo: newNo++ };
  });
  return { id, lines };
};

// diffo の captureAnchor と同じ形の snapshot を持つスレッドを作る
const makeThread = (id, path, hunk, side, line, endLine, options = {}) => {
  const marker = { add: '+', del: '-', context: ' ' };
  const rows = hunk.lines.map((l) => marker[l.kind] + l.text);
  const last = endLine ?? line;
  const covered = hunk.lines
    .map((l, row) => ({ no: side === 'old' ? l.oldNo : l.newNo, row }))
    .filter((r) => r.no !== null && r.no >= line && r.no <= last);
  const start = covered[0].row;
  const end = covered.at(-1).row;
  return {
    id,
    state: options.resolved ? 'resolved' : 'open',
    anchor: {
      kind: 'hunk',
      hunkId: hunk.id,
      path,
      side,
      line,
      ...(endLine === undefined ? {} : { endLine }),
      ...(options.commit ? { commit: options.commit } : {}),
    },
    codeContext: options.resolved ? null : rows.join('\n'),
    anchored: { start, end, text: rows.slice(start, Math.min(end + 1, start + 10)).join('\n') },
    ...(options.github ? { github: options.github } : {}),
    messages: [],
  };
};

const file = (path, hunks) => ({ path, hunks });

// 振り分けた結果を、diffo の hunk の描画と同じ od でスレッドごとの描かれる行にする
const drawnLines = (files, partition) => {
  const drawn = new Map();
  for (const f of files) {
    for (const hunk of f.hunks) {
      const groups = diffo.od(hunk.lines, partition.byHunk.get(hunk.id) ?? []);
      for (const [index, threads] of groups) {
        for (const thread of threads) {
          drawn.set(thread.id, { hunkId: hunk.id, text: hunk.lines[index]?.text ?? null, thread });
        }
      }
    }
  }
  return drawn;
};

// vm の中で作った配列は別の realm の Array なので、比べる前にこちらの配列へ写す
const fileThreadIds = (partition, path) => Array.from(partition.byFile.get(path) ?? [], (t) => t.id);

const before = [' a1', ' a2', ' a3', '+TARGET', '+second', ' z1', ' z2', ' z3'];
const original = makeHunk('h-target', 10, 10, before);

test('regression: diffo 0.26.0 alone draws a moved hunk thread on the stale line number', () => {
  const thread = makeThread('t1', 'doc.md', original, 'new', 13);
  // 内容は同じまま、hunk が 2 行下へずれた（hunkId は同じ）。新しい 13 行目は a2
  const moved = makeHunk('h-target', 12, 12, [' x', ' a1', ...before.slice(1)]);
  const files = [file('doc.md', [moved])];
  const drawn = drawnLines(files, diffo.Qu(files, [thread]));
  assert.notEqual(drawn.get('t1').text, 'TARGET');
});

test('a hunk that moved without changing (same hunkId) keeps the thread on the commented line', () => {
  const thread = makeThread('t1', 'doc.md', original, 'new', 13);
  const moved = makeHunk('h-target', 12, 12, before);
  const files = [file('doc.md', [moved])];
  const partition = placeThreads(files, [thread], diffo.Qu);
  const drawn = drawnLines(files, partition);
  assert.equal(drawn.get('t1').text, 'TARGET');
  assert.equal(drawn.get('t1').thread.anchor.line, 15);
});

test('a moved hunk whose context lines changed is found by searching the commented line', () => {
  const thread = makeThread('t1', 'doc.md', original, 'new', 13);
  const moved = makeHunk('h-target', 20, 20, [' x', ' y', ' a3', '+TARGET', '+second', ' z1']);
  const files = [file('doc.md', [makeHunk('h-other', 1, 1, [' p', '+inserted', ' q']), moved])];
  const drawn = drawnLines(files, placeThreads(files, [thread], diffo.Qu));
  assert.equal(drawn.get('t1').text, 'TARGET');
  assert.equal(drawn.get('t1').hunkId, 'h-target');
});

test('another line of the hunk changed (new hunkId) and the commented line stays drawn on it', () => {
  const thread = makeThread('t1', 'doc.md', original, 'new', 13);
  const edited = makeHunk('h-edited', 10, 11, [' a1', ' a2', ' a3', '+TARGET', '+second changed', '+added', ' z1']);
  const files = [file('doc.md', [edited])];
  const partition = placeThreads(files, [thread], diffo.Qu);
  const drawn = drawnLines(files, partition);
  assert.equal(drawn.get('t1').hunkId, 'h-edited');
  assert.equal(drawn.get('t1').text, 'TARGET');
  // diffo だけだと、保存した 13 行目（今は a3）に描かれる
  const stale = drawnLines(files, diffo.Qu(files, [thread]));
  assert.equal(stale.get('t1').text, 'a3');
});

test('a rewritten commented line is not drawn on another line but listed at file level with its snapshot', () => {
  const thread = makeThread('t1', 'doc.md', original, 'new', 13);
  const rewritten = makeHunk('h-new', 10, 10, [' a1', ' a2', ' a3', '+TARGET (rewritten)', '+second', ' z1']);
  const files = [file('doc.md', [rewritten])];
  const partition = placeThreads(files, [thread], diffo.Qu);
  assert.equal(drawnLines(files, partition).has('t1'), false);
  assert.deepEqual(fileThreadIds(partition, 'doc.md'), ['t1']);
  const listed = partition.byFile.get('doc.md')[0];
  assert.equal(listed.codeContext, '+TARGET');
  assert.equal(listed.anchor.line, 13);
});

test('duplicate lines are told apart by their neighbours, and stay unplaced when the neighbours match too', () => {
  const dupHunk = makeHunk('h-dup', 1, 1, [' head A', '+same', ' tail A']);
  const thread = makeThread('t1', 'doc.md', dupHunk, 'new', 2);
  const twoPlaces = [
    makeHunk('h-1', 1, 1, [' head B', '+same', ' tail B']),
    makeHunk('h-2', 20, 20, [' head A', '+same', ' tail A']),
  ];
  let files = [file('doc.md', twoPlaces)];
  let drawn = drawnLines(files, placeThreads(files, [thread], diffo.Qu));
  assert.equal(drawn.get('t1').hunkId, 'h-2');

  const identical = [
    makeHunk('h-1', 1, 1, [' head A', '+same', ' tail A']),
    makeHunk('h-2', 20, 20, [' head A', '+same', ' tail A']),
  ];
  files = [file('doc.md', identical)];
  const partition = placeThreads(files, [thread], diffo.Qu);
  assert.equal(drawnLines(files, partition).has('t1'), false);
  assert.deepEqual(fileThreadIds(partition, 'doc.md'), ['t1']);
});

test('an old-side comment is searched among the old-side lines', () => {
  const base = makeHunk('h-old', 5, 5, [' c1', '-removed line', '+replacement', ' c2']);
  const thread = makeThread('t1', 'doc.md', base, 'old', 6);
  const shifted = makeHunk('h-old2', 5, 8, [' c1', '-removed line', '+replacement v2', ' c2']);
  const files = [file('doc.md', [shifted])];
  const drawn = drawnLines(files, placeThreads(files, [thread], diffo.Qu));
  assert.equal(drawn.get('t1').text, 'removed line');
  assert.equal(drawn.get('t1').thread.anchor.side, 'old');
});

test('a range comment moves as a whole and its highlight covers the same lines', () => {
  const thread = makeThread('t1', 'doc.md', original, 'new', 13, 14);
  const moved = makeHunk('h-new', 30, 33, [' n', ' a1', ' a2', ' a3', '+TARGET', '+second', ' z1']);
  const files = [file('doc.md', [moved])];
  const partition = placeThreads(files, [thread], diffo.Qu);
  const placed = partition.byHunk.get('h-new')[0];
  assert.equal(placed.anchor.line, 37);
  assert.equal(placed.anchor.endLine, 38);
  const lit = [...diffo.sd(moved.lines, [placed])].map((i) => moved.lines[i].text);
  assert.deepEqual(lit, ['TARGET', 'second']);
});

test('a resolved range longer than the 10-row snapshot is unplaced because its end cannot be checked', () => {
  const longSpec = [' c', ...Array.from({ length: 14 }, (_, i) => `+line ${i}`), ' d'];
  const long = makeHunk('h-long', 1, 1, longSpec);
  const thread = makeThread('t1', 'doc.md', long, 'new', 2, 15, { resolved: true });
  // 先頭 10 行は残し、snapshot に無い末尾 4 行を書き換えた
  const rewrittenTail = [' c', ...longSpec.slice(1, 11), '+other a', '+other b', '+other c', '+other d', ' d'];
  const files = [file('doc.md', [makeHunk('h-long2', 41, 51, [' x', ...rewrittenTail])])];
  const partition = placeThreads(files, [thread], diffo.Qu);
  assert.equal(drawnLines(files, partition).has('t1'), false);
  assert.deepEqual(fileThreadIds(partition, 'doc.md'), ['t1']);
});

test('a single match elsewhere whose neighbours differ is not taken for the rewritten line', () => {
  const base = makeHunk('h-a', 10, 10, [' guard', '+return null;', ' end of a']);
  const thread = makeThread('t1', 'doc.md', base, 'new', 11);
  const files = [
    file('doc.md', [
      makeHunk('h-a2', 10, 10, [' guard', '+return 1;', ' end of a']),
      makeHunk('h-b', 50, 50, [' other', '+return null;', ' end of b']),
    ]),
  ];
  const partition = placeThreads(files, [thread], diffo.Qu);
  assert.equal(drawnLines(files, partition).has('t1'), false);
  assert.deepEqual(fileThreadIds(partition, 'doc.md'), ['t1']);
});

test('saved threads are not changed', () => {
  const thread = makeThread('t1', 'doc.md', original, 'new', 13);
  const snapshot = structuredClone(thread);
  const files = [file('doc.md', [makeHunk('h-x', 1, 1, [' a1', '+other'])])];
  placeThreads(files, [thread], diffo.Qu);
  placeThreads([file('doc.md', [makeHunk('h-target', 12, 12, before)])], [thread], diffo.Qu);
  assert.deepEqual(thread, snapshot);
});

test('commit, GitHub and snapshot-less threads are handed to diffo unchanged', () => {
  const commitThread = makeThread('t-commit', 'doc.md', original, 'new', 13, undefined, { commit: 'abc' });
  const githubThread = makeThread('t-gh', 'doc.md', original, 'new', 13, undefined, {
    github: { outdated: false },
  });
  const legacy = { ...makeThread('t-legacy', 'doc.md', original, 'new', 13) };
  delete legacy.anchored;
  const files = [file('doc.md', [makeHunk('h-other', 1, 1, [' a', '+b'])])];
  let received;
  placeThreads(files, [commitThread, githubThread, legacy], (f, threads) => {
    received = threads;
    return diffo.Qu(f, threads);
  });
  assert.equal(received[0], commitThread);
  assert.equal(received[1], githubThread);
  assert.equal(received[2], legacy);
});

test('an error inside the lookup falls back to diffo placement', () => {
  const broken = makeThread('t1', 'doc.md', original, 'new', 13);
  Object.defineProperty(broken, 'anchored', {
    get() {
      throw new Error('boom');
    },
  });
  const files = [file('doc.md', [makeHunk('h-target', 12, 12, before)])];
  const partition = placeThreads(files, [broken], (f, threads) => ({ threads, byFile: new Map() }));
  assert.equal(partition.threads[0], broken);
});

const callSite = 'Gt=(0,x.useMemo)(()=>xt?ed(yt,e?.files??rm,Ut):Qu(e?.files??[],Ut),[e,Ut,xt,yt])';
const bundleLike = `${fixture}\nfunction ed(e,t,n){return Qu(e,n)}\n${callSite}\n`;

test('diffo-patch-placement hooks only the normal-diff call and is idempotent', () => {
  const first = patchPlacement(bundleLike);
  assert.equal(first.status, 'patched');
  assert.equal(first.name, 'Qu');
  assert.ok(first.source.includes(`:(${HOOK}??Qu)(e?.files??[],Ut,Qu)`));
  assert.ok(first.source.includes('function ed(e,t,n){return Qu(e,n)}'));
  const second = patchPlacement(first.source);
  assert.equal(second.status, 'already');
  assert.equal(second.source, first.source);
});

test('diffo-patch-placement refuses bundles it does not recognise without rewriting them', () => {
  const noCall = `${fixture}\n`;
  const missing = patchPlacement(noCall);
  assert.equal(missing.status, 'error');
  assert.equal(missing.source, noCall);

  const twoCalls = `${bundleLike}${callSite}\n`;
  assert.equal(patchPlacement(twoCalls).status, 'error');

  const renamedShape = bundleLike.replace('byCommit:s', 'byCommitSha:s');
  assert.equal(patchPlacement(renamedShape).status, 'absent');

  // 文字列リテラルの中の呼び出しに似た文字列は当て先にしない
  const literal = `${fixture}\nfunction ed(e,t,n){return Qu(e,n)}\nconst s=":Qu(e?.files??[],Ut)";const r=Qu(e?.files??[],Ut);\n`;
  const literalResult = patchPlacement(literal);
  assert.equal(literalResult.status, 'error');
  assert.equal(literalResult.source, literal);

  // 当て済みでも、未接続の通常差分の呼び出しが増えていれば当て済みとしない
  const patched = patchPlacement(bundleLike).source;
  assert.equal(patchPlacement(`${patched}${callSite}\n`).status, 'error');
});

test('diffo-patch-placement leaves the files untouched when the bundle is not recognised', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'diffo-placement-'));
  try {
    const unknown = `${bundleLike}${callSite}\n`;
    writeFileSync(path.join(dir, 'index-unknown.js'), unknown);
    const result = patchAssetsDir(dir);
    assert.equal(result.ok, false);
    assert.equal(readFileSync(path.join(dir, 'index-unknown.js'), 'utf8'), unknown);

    writeFileSync(path.join(dir, 'index-unknown.js'), bundleLike);
    assert.equal(patchAssetsDir(dir).status, 'patched');
    const once = readFileSync(path.join(dir, 'index-unknown.js'), 'utf8');
    assert.equal(patchAssetsDir(dir).status, 'already');
    assert.equal(readFileSync(path.join(dir, 'index-unknown.js'), 'utf8'), once);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the hooked call runs the lookup and falls back to the original function without diffo-ui.js', () => {
  const patched = patchPlacement(bundleLike).source;
  const expression = patched.match(/\(globalThis\.__diffoPlaceThreads\?\?Qu\)\(e\?\.files\?\?\[\],Ut,Qu\)/)[0];
  const run = (withUi) => {
    const context = vm.createContext({
      console: { warn() {} },
      document: { readyState: 'loading', addEventListener() {} },
    });
    if (withUi) vm.runInContext(ui, context);
    vm.runInContext(fixture, context);
    const files = [file('doc.md', [makeHunk('h-target', 12, 12, before)])];
    context.e = { files };
    context.Ut = [makeThread('t1', 'doc.md', original, 'new', 13)];
    const partition = vm.runInContext(expression, context);
    return drawnLines(files, partition).get('t1').text;
  };
  assert.equal(run(true), 'TARGET');
  assert.notEqual(run(false), 'TARGET');
});

test('the installed diffo bundle (if present in the npx cache) has exactly one hook point', (t) => {
  const npx = path.join(os.homedir(), '.npm/_npx');
  const bundles = existsSync(npx)
    ? readdirSync(npx).flatMap((dir) => {
        const assets = path.join(npx, dir, 'node_modules/@diffohq/diffo/dist/client/assets');
        return existsSync(assets)
          ? readdirSync(assets)
              .filter((f) => /^index-.*\.js$/.test(f))
              .map((f) => path.join(assets, f))
          : [];
      })
    : [];
  const recognised = bundles
    .map((bundle) => patchPlacement(readFileSync(bundle, 'utf8')))
    .filter((result) => result.status === 'patched' || result.status === 'already');
  if (recognised.length === 0) {
    t.skip('npx キャッシュに対応する diffo の bundle が無い');
    return;
  }
  for (const result of recognised) assert.ok(result.source.includes(`(${HOOK}??`));
});
