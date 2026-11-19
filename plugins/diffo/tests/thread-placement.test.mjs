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
const loadUi = () => {
  const context = vm.createContext({
    console: { warn() {} },
    document: { readyState: 'loading', addEventListener() {} },
  });
  vm.runInContext(ui, context);
  return context;
};
const uiContext = loadUi();
const rawPlaceThreads = uiContext.__diffoPlaceThreads;

// スレッドを書いた hunk（base のファイルを組み立てるのに使う）
const snapshotHunks = new WeakMap();

// snapshot と今の差分の old 側の行（base の行番号と本文）から、ファイルごとの base を組み立てる。
// 行番号が同じなのに本文が違う（base として矛盾する）ファイルは、base を取れなかったことにする
const buildBases = (files, threads) => {
  const hunksByPath = new Map();
  const add = (path, hunk) => {
    if (!hunksByPath.has(path)) hunksByPath.set(path, []);
    hunksByPath.get(path).push(hunk);
  };
  for (const f of files) for (const h of Array.isArray(f.hunks) ? f.hunks : []) add(f.path, h);
  for (const t of threads) {
    const h = snapshotHunks.get(t);
    if (h) add(t.anchor.path, h);
  }
  const bases = {};
  for (const [path, hunks] of hunksByPath) {
    const lines = new Map();
    let consistent = true;
    for (const h of hunks) {
      for (const l of h.lines ?? []) {
        if (l.kind === 'add' || l.oldNo == null) continue;
        if (lines.has(l.oldNo) && lines.get(l.oldNo) !== l.text) consistent = false;
        lines.set(l.oldNo, l.text);
      }
    }
    if (!consistent) {
      bases[path] = null;
      continue;
    }
    const max = Math.max(0, ...lines.keys());
    bases[path] = `${Array.from({ length: max + 5 }, (_, i) => lines.get(i + 1) ?? `base filler ${i + 1}`).join('\n')}\n`;
  }
  return bases;
};

// テストごとに、渡した差分とスレッドから base を組み立て直してから placeThreads を呼ぶ
const placeThreads = (files, threads, partition) => {
  uiContext.__diffoSetBaseFiles(
    buildBases(Array.isArray(files) ? files : [], Array.isArray(threads) ? threads : []),
  );
  return rawPlaceThreads(files, threads, partition);
};
// 直前の placeThreads で位置未確定・書き換え済みにしたスレッド（こちらの realm の値に写す）
const placementState = () => JSON.parse(JSON.stringify(uiContext.__diffoPlacementState()));

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
  const thread = {
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
  snapshotHunks.set(thread, hunk);
  return thread;
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

test('a rewritten commented line is drawn on the line that replaced it, marked as rewritten', () => {
  const thread = makeThread('t1', 'doc.md', original, 'new', 13);
  const rewritten = makeHunk('h-new', 10, 10, [' a1', ' a2', ' a3', '+TARGET (rewritten)', '+second', ' z1']);
  const files = [file('doc.md', [rewritten])];
  const partition = placeThreads(files, [thread], diffo.Qu);
  assert.equal(drawnLines(files, partition).get('t1').text, 'TARGET (rewritten)');
  assert.deepEqual(fileThreadIds(partition, 'doc.md'), []);
  assert.deepEqual(placementState(), { unplaced: [], rewritten: { t1: 'TARGET' } });
});

test('a commented change that was reverted has no replacing lines and is unplaced with its snapshot', () => {
  const thread = makeThread('t1', 'doc.md', original, 'new', 13);
  const files = [file('doc.md', [makeHunk('h-elsewhere', 40, 40, [' p', '+q', ' r'])])];
  const partition = placeThreads(files, [thread], diffo.Qu);
  assert.equal(drawnLines(files, partition).has('t1'), false);
  assert.deepEqual(fileThreadIds(partition, 'doc.md'), ['t1']);
  const listed = partition.byFile.get('doc.md')[0];
  assert.equal(listed.codeContext, '+TARGET');
  assert.equal(listed.anchor.line, 13);
  assert.deepEqual(placementState(), { unplaced: ['t1'], rewritten: {} });
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

test('a single match elsewhere whose neighbours differ is not taken; the base side finds the rewritten line', () => {
  const base = makeHunk('h-a', 10, 10, [' guard', '+return null;', ' end of a']);
  const thread = makeThread('t1', 'doc.md', base, 'new', 11);
  const files = [
    file('doc.md', [
      makeHunk('h-a2', 10, 10, [' guard', '+return 1;', ' end of a']),
      makeHunk('h-b', 50, 50, [' other', '+return null;', ' end of b']),
    ]),
  ];
  const partition = placeThreads(files, [thread], diffo.Qu);
  const drawn = drawnLines(files, partition).get('t1');
  assert.equal(drawn.hunkId, 'h-a2');
  assert.equal(drawn.text, 'return 1;');
  assert.deepEqual(placementState().rewritten, { t1: 'return null;' });
});

// CCM-T32: EFSO-T28 のレビューの 8 件と同じ形。レビューの指摘でコメントした行を書き換え、
// 同じ hunk の表の説明行のかたまりも取り消したので、hunk 全体での何番目かと行番号がずれる。
// 文書の中身は写さず、形だけを合わせた別の文字列にしている
const bgSnapshot = makeHunk('h-bg', 5, 5, [
  ' | status |',
  ' | scope |',
  ' ',
  '+caption 1',
  '+',
  ' ## background',
  ' ',
  '-when a customer signs in, the ids are linked',
  '-the store is decided in another record',
  '+when a customer signs in, the ids get linked',
  '+the store is decided in a separate record',
  ' ',
  '-the users of the mapping are below.',
  '+the consumers of the mapping are below.',
  ' ',
]);
const tableRows = (suffix) =>
  [
    'trigger of creating the mapping',
    'login notice to the core',
    'who writes the mapping',
    'how the notice is received',
    'how the admin token is taken',
    'shape of the mapping key',
  ].map((name, i) => `| ${name}${suffix} | decision ${i} stays as written | note ${i} |`);
const tableSnapshot = makeHunk('h-table', 40, 38, [
  ' | item | decision | note |',
  ' |---|---|---|',
  ...tableRows('').map((row) => `-${row}`),
  ...tableRows(' (reworded)').map((row) => `+${row}`),
  '+',
  '+caption 2',
  ' ',
  ' ## open issues',
]);
const listSnapshot = makeHunk('h-list', 70, 70, [
  ' ',
  ' ## impact',
  ' ',
  '-- storage record: written by the creator',
  '-- auth record: the app token is used',
  '-- login record: notices are not sent',
  '-- session design: the first login waits',
  '+- storage record: written only by the creator',
  '+- auth record: the app token is used here',
  '+- login record: notices are never sent',
  '+- session design: right after the first login it waits',
  ' ',
  ' ## options',
]);
const eightThreads = () => [
  makeThread('bg-1', 'adr.md', bgSnapshot, 'new', 12),
  makeThread('bg-2', 'adr.md', bgSnapshot, 'new', 13),
  makeThread('bg-3', 'adr.md', bgSnapshot, 'new', 15),
  makeThread('table-1', 'adr.md', tableSnapshot, 'new', 40),
  makeThread('table-2', 'adr.md', tableSnapshot, 'new', 41),
  makeThread('table-6', 'adr.md', tableSnapshot, 'new', 45),
  makeThread('list-1', 'adr.md', listSnapshot, 'new', 73),
  makeThread('list-4', 'adr.md', listSnapshot, 'new', 76),
];
// 指摘への対応後: 表の説明行を取り消し（追加行が減る）、コメントした行を書き換えた
const addressedFiles = () => [
  file('adr.md', [
    makeHunk('h-bg-now', 8, 8, [
      ' ## background',
      ' ',
      '-when a customer signs in, the ids are linked',
      '-the store is decided in another record',
      '+when a customer signs in, the ids are linked together',
      '+the store is decided in a separate record now',
      ' ',
      '-the users of the mapping are below.',
      '+the components that use the mapping are below.',
      ' ',
    ]),
    makeHunk('h-table-now', 40, 38, [
      ' | item | decision | note |',
      ' |---|---|---|',
      ...tableRows('').map((row) => `-${row}`),
      ...tableRows(' (reworded again)').map((row) => `+${row}`),
      ' ',
      ' ## open issues',
    ]),
    makeHunk('h-list-now', 70, 68, [
      ' ',
      ' ## impact',
      ' ',
      '-- storage record: written by the creator',
      '-- auth record: the app token is used',
      '-- login record: notices are not sent',
      '-- session design: the first login waits',
      '+- storage record: written by the creator only',
      '+- auth record: the app token is used here',
      '+- login record: notices are never sent',
      '+- session design: right after the first login, it waits asynchronously',
      ' ',
      ' ## options',
    ]),
  ]),
];

test('the eight addressed threads of the real review land on their rewritten lines', () => {
  const files = addressedFiles();
  const partition = placeThreads(files, eightThreads(), diffo.Qu);
  const drawn = drawnLines(files, partition);
  const expected = {
    'bg-1': 'when a customer signs in, the ids are linked together',
    'bg-2': 'the store is decided in a separate record now',
    'bg-3': 'the components that use the mapping are below.',
    'table-1': tableRows(' (reworded again)')[0],
    'table-2': tableRows(' (reworded again)')[1],
    'table-6': tableRows(' (reworded again)')[5],
    'list-1': '- storage record: written by the creator only',
    'list-4': '- session design: right after the first login, it waits asynchronously',
  };
  for (const [id, text] of Object.entries(expected)) assert.equal(drawn.get(id)?.text, text, id);
  assert.deepEqual(fileThreadIds(partition, 'adr.md'), []);
  const state = placementState();
  assert.deepEqual(state.unplaced, []);
  assert.deepEqual(Object.keys(state.rewritten).sort(), Object.keys(expected).sort());
  assert.equal(state.rewritten['bg-3'], 'the consumers of the mapping are below.');
});

test('a range comment on rewritten lines maps both ends inside the same hunk', () => {
  const thread = makeThread('range', 'adr.md', bgSnapshot, 'new', 12, 13);
  const files = addressedFiles();
  const partition = placeThreads(files, [thread], diffo.Qu);
  const placed = partition.byHunk.get('h-bg-now')[0];
  assert.equal(placed.anchor.line, 10);
  assert.equal(placed.anchor.endLine, 11);
  const hunk = files[0].hunks[0];
  const lit = [...diffo.sd(hunk.lines, [placed])].map((i) => hunk.lines[i].text);
  assert.deepEqual(lit, [
    'when a customer signs in, the ids are linked together',
    'the store is decided in a separate record now',
  ]);
});

test('identical replaced base lines in two changed places leave the thread unplaced', () => {
  const snapshot = makeHunk('h-s', 10, 10, [' x', '-dup', '+new', ' y']);
  const thread = makeThread('t1', 'doc.md', snapshot, 'new', 11);
  const files = [
    file('doc.md', [
      makeHunk('h-1', 10, 10, [' x', '-dup', '+other one', ' y']),
      makeHunk('h-2', 50, 50, [' x', '-dup', '+other two', ' y']),
    ]),
  ];
  const partition = placeThreads(files, [thread], diffo.Qu);
  assert.equal(drawnLines(files, partition).has('t1'), false);
  assert.deepEqual(placementState(), { unplaced: ['t1'], rewritten: {} });
});

test('a commented context line that was rewritten later is found through its base line', () => {
  const snapshot = makeHunk('h-s', 10, 10, [' c1', ' the commented context', ' c3', '+added', ' c4']);
  const thread = makeThread('t1', 'doc.md', snapshot, 'new', 11);
  const files = [
    file('doc.md', [
      makeHunk('h-now', 10, 10, [' c1', '-the commented context', '+the commented context, edited', ' c3', '+added', ' c4']),
    ]),
  ];
  const drawn = drawnLines(files, placeThreads(files, [thread], diffo.Qu));
  assert.equal(drawn.get('t1').text, 'the commented context, edited');
  assert.deepEqual(placementState().rewritten, { t1: 'the commented context' });
});

test('an unchanged commented line whose neighbours were rewritten is placed without the rewritten mark', () => {
  const snapshot = makeHunk('h-s', 10, 10, [' a', ' b', '+keep me', ' c', ' d']);
  const thread = makeThread('t1', 'doc.md', snapshot, 'new', 12);
  const files = [
    file('doc.md', [makeHunk('h-now', 10, 10, [' a', '-b', '+b2', '+keep me', '-c', '+c2', ' d'])]),
  ];
  const drawn = drawnLines(files, placeThreads(files, [thread], diffo.Qu));
  assert.equal(drawn.get('t1').text, 'keep me');
  assert.deepEqual(placementState(), { unplaced: [], rewritten: {} });
});

test('a reverted change is not moved to the same base lines elsewhere that are still changed', () => {
  const snapshot = makeHunk('h-s', 50, 50, [' p', '-A', '+alpha', ' q']);
  const thread = makeThread('t1', 'doc.md', snapshot, 'new', 51);
  // 元の変更（50 行目付近）は取り消し、同じ p / A / q の並びがある 10 行目付近だけが、似た文字列に変わっている
  const files = [file('doc.md', [makeHunk('h-10', 10, 10, [' p', '-A', '+alpha!', ' q'])])];
  const partition = placeThreads(files, [thread], diffo.Qu);
  assert.equal(drawnLines(files, partition).has('t1'), false);
  assert.deepEqual(placementState(), { unplaced: ['t1'], rewritten: {} });

  // 逆の並び（元の変更が前、まだ変わっている同じ並びが後ろ）でも同じ
  const earlier = makeThread('t2', 'doc.md', makeHunk('h-s2', 10, 10, [' p', '-A', '+alpha', ' q']), 'new', 11);
  const laterFiles = [file('doc.md', [makeHunk('h-50', 50, 50, [' p', '-A', '+alpha!', ' q'])])];
  assert.equal(drawnLines(laterFiles, placeThreads(laterFiles, [earlier], diffo.Qu)).has('t2'), false);
});

test('a deleted commented line is not taken over by an older line that slid into its slot', () => {
  const snapshot = makeHunk('h-s', 10, 10, [' p', '+target', '+keep', ' q']);
  const thread = makeThread('t1', 'doc.md', snapshot, 'new', 11);
  const files = [file('doc.md', [makeHunk('h-now', 10, 10, [' p', '+keep', '+brand new', ' q'])])];
  const partition = placeThreads(files, [thread], diffo.Qu);
  assert.equal(drawnLines(files, partition).has('t1'), false);
  assert.deepEqual(placementState(), { unplaced: ['t1'], rewritten: {} });
});

test('a partly reverted change keeps the surviving rewrite and leaves the reverted line unplaced', () => {
  const snapshot = makeHunk('h-s', 10, 10, [' p', '-A', '-B', '+alpha', '+beta', ' q']);
  const onAlpha = makeThread('alpha', 'doc.md', snapshot, 'new', 11);
  const onBeta = makeThread('beta', 'doc.md', snapshot, 'new', 12);
  // B → beta の書き換えだけを取り消した
  const files = [file('doc.md', [makeHunk('h-now', 10, 10, [' p', '-A', '+alpha2', ' B', ' q'])])];
  const partition = placeThreads(files, [onAlpha, onBeta], diffo.Qu);
  const drawn = drawnLines(files, partition);
  assert.equal(drawn.get('alpha').text, 'alpha2');
  assert.equal(drawn.has('beta'), false);
  assert.deepEqual(placementState(), { unplaced: ['beta'], rewritten: { alpha: 'alpha' } });
});

test('a resolved long range starting at the top of its hunk does not break the other threads', () => {
  // 範囲は hunk の先頭の context 行から始まり（anchored.start が 0）、snapshot は先頭 10 diff 行だけ
  const longSpec = [' c0', ...Array.from({ length: 14 }, (_, i) => `+line ${i}`), ' d'];
  const long = makeHunk('h-long', 1, 1, longSpec);
  const resolved = makeThread('resolved', 'other.md', long, 'new', 1, 15, { resolved: true });
  assert.equal(resolved.anchored.start, 0);
  const moving = makeThread('moving', 'doc.md', original, 'new', 13);
  const files = [
    file('doc.md', [makeHunk('h-target', 12, 12, before)]),
    file('other.md', [makeHunk('h-other', 1, 1, [' c0', '+rewritten', ' d'])]),
  ];
  const partition = placeThreads(files, [resolved, moving], diffo.Qu);
  assert.equal(drawnLines(files, partition).get('moving').text, 'TARGET');
  assert.deepEqual(placementState().unplaced, ['resolved']);
});

test('a range whose middle line was rewritten is marked as rewritten', () => {
  const snapshot = makeHunk('h-s', 10, 10, [' p', '-A', '-B', '-C', '+alpha', '+beta', '+gamma', ' q']);
  const thread = makeThread('t1', 'doc.md', snapshot, 'new', 11, 13);
  const files = [
    file('doc.md', [makeHunk('h-now', 10, 10, [' p', '-A', '-B', '-C', '+alpha', '+beta edited', '+gamma', ' q'])]),
  ];
  const partition = placeThreads(files, [thread], diffo.Qu);
  const placed = partition.byHunk.get('h-now')[0];
  assert.equal(placed.anchor.line, 11);
  assert.equal(placed.anchor.endLine, 13);
  assert.deepEqual(placementState().rewritten, { t1: 'alpha\nbeta\ngamma' });
});

test('without the base file the rewritten line is unplaced rather than guessed', () => {
  const thread = makeThread('t1', 'doc.md', original, 'new', 13);
  const files = [file('doc.md', [makeHunk('h-new', 10, 10, [' a1', ' a2', ' a3', '+TARGET (rewritten)', '+second', ' z1'])])];
  uiContext.__diffoSetBaseFiles({});
  const partition = rawPlaceThreads(files, [thread], diffo.Qu);
  assert.equal(drawnLines(files, partition).has('t1'), false);
  assert.deepEqual(placementState(), { unplaced: ['t1'], rewritten: {} });
});

test('the fetch hook loads the base files before handing the review and the changeset to diffo', async () => {
  const requests = [];
  const thread = makeThread('t1', 'doc.md', original, 'new', 13);
  const current = makeHunk('h-new', 10, 10, [' a1', ' a2', ' a3', '+TARGET (rewritten)', '+second', ' z1']);
  const baseText = `${buildBases([file('doc.md', [current])], [thread])['doc.md']}`;
  const respond = (body, type = 'json') => ({
    ok: true,
    clone() {
      return this;
    },
    json: async () => body,
    text: async () => (type === 'json' ? JSON.stringify(body) : body),
  });
  const context = vm.createContext({
    console: { warn() {} },
    URL,
    location: { href: 'http://127.0.0.1:7462/', origin: 'http://127.0.0.1:7462' },
    document: { readyState: 'loading', addEventListener() {} },
    fetch: async (input) => {
      requests.push(input);
      if (input === '/api/review') return respond({ threads: [thread] });
      if (input === '/api/changeset') {
        return respond({ files: [{ path: 'doc.md', oldPath: 'old-doc.md', status: 'renamed', hunks: [current] }] });
      }
      if (input.startsWith('/api/file?')) return respond(baseText, 'text');
      throw new Error(`unexpected ${input}`);
    },
  });
  vm.runInContext(ui, context);
  await context.fetch('/api/changeset');
  await context.fetch('/api/review');
  // review の応答を返した時点で、rename 前の path の base を取り終えている
  assert.deepEqual(requests, [
    '/api/changeset',
    '/api/review',
    `/api/file?path=${encodeURIComponent('old-doc.md')}&side=base`,
  ]);
  vm.runInContext(fixture, context);
  const files = [file('doc.md', [current])];
  const partition = context.__diffoPlaceThreads(files, [thread], context.Qu);
  assert.equal(drawnLines(files, partition).get('t1').text, 'TARGET (rewritten)');
  assert.deepEqual(JSON.parse(JSON.stringify(context.__diffoPlacementState())).rewritten, { t1: 'TARGET' });
});

test('a reverted line is not taken for a similar surviving rewrite in the same block', () => {
  const snapshot = makeHunk('h-s', 10, 10, [' p', '-return A;', '-return B;', '+return alpha;', '+return beta;', ' q']);
  const onAlpha = makeThread('alpha', 'doc.md', snapshot, 'new', 11);
  const onBeta = makeThread('beta', 'doc.md', snapshot, 'new', 12);
  const files = [file('doc.md', [makeHunk('h-now', 10, 10, [' p', '-return A;', '+return alpha2;', ' return B;', ' q'])])];
  const partition = placeThreads(files, [onAlpha, onBeta], diffo.Qu);
  const drawn = drawnLines(files, partition);
  assert.equal(drawn.get('alpha').text, 'return alpha2;');
  assert.equal(drawn.has('beta'), false);
  assert.deepEqual(placementState().unplaced, ['beta']);
});

test('the same slot is taken only when the line there was rewritten from the commented one', () => {
  const snapshot = makeHunk('h-s', 10, 10, [' p', '+target', '+keep', ' q']);
  const onTarget = makeThread('target', 'doc.md', snapshot, 'new', 11);
  const onKeep = makeThread('keep', 'doc.md', snapshot, 'new', 12);
  // target を消し、keep を書き換え、別の行を足した（追加行の数は同じ）
  const files = [file('doc.md', [makeHunk('h-now', 10, 10, [' p', '+keep edited', '+brand new', ' q'])])];
  const partition = placeThreads(files, [onTarget, onKeep], diffo.Qu);
  const drawn = drawnLines(files, partition);
  assert.equal(drawn.has('target'), false);
  assert.equal(drawn.get('keep').text, 'keep edited');
});

test('a deleted line is not given to the rewrite of its neighbour even when the strings are alike', () => {
  const snapshot = makeHunk('h-s', 10, 10, [' p', '+return a;', '+return b;', ' q']);
  const onA = makeThread('a', 'doc.md', snapshot, 'new', 11);
  const onB = makeThread('b', 'doc.md', snapshot, 'new', 12);
  // a を消し、b を b2 に書き換え、c を足した
  const files = [file('doc.md', [makeHunk('h-now', 10, 10, [' p', '+return b2;', '+return c;', ' q'])])];
  const partition = placeThreads(files, [onA, onB], diffo.Qu);
  const drawn = drawnLines(files, partition);
  assert.equal(drawn.has('a'), false);
  assert.equal(drawn.get('b').text, 'return b2;');
});

test('a range whose ends are unchanged context lines is placed when a line inside was rewritten', () => {
  const snapshot = makeHunk('h-s', 10, 10, [' p', '-B', '+beta', ' q']);
  const thread = makeThread('t1', 'doc.md', snapshot, 'new', 10, 12);
  const files = [file('doc.md', [makeHunk('h-now', 10, 10, [' p', '-B', '+beta edited', ' q'])])];
  const partition = placeThreads(files, [thread], diffo.Qu);
  const placed = partition.byHunk.get('h-now')[0];
  assert.equal(placed.anchor.line, 10);
  assert.equal(placed.anchor.endLine, 12);
  assert.deepEqual(placementState().rewritten, { t1: 'p\nbeta\nq' });
});

test('a late failed base request does not overwrite the base a newer request loaded', async () => {
  const thread = makeThread('t1', 'new.md', original, 'new', 13);
  const current = makeHunk('h-new', 10, 10, [' a1', ' a2', ' a3', '+TARGET (rewritten)', '+second', ' z1']);
  const baseText = `${buildBases([file('new.md', [current])], [thread])['new.md']}`;
  const pending = new Map();
  const respond = (body, ok = true) => ({
    ok,
    clone() {
      return this;
    },
    json: async () => body,
    text: async () => body,
  });
  const context = vm.createContext({
    console: { warn() {} },
    URL,
    location: { href: 'http://127.0.0.1:7462/', origin: 'http://127.0.0.1:7462' },
    document: { readyState: 'loading', addEventListener() {} },
    fetch: (input) => {
      if (input === '/api/review') return Promise.resolve(respond({ threads: [thread] }));
      if (input === '/api/changeset') {
        return Promise.resolve(
          respond({ files: [{ path: 'new.md', oldPath: 'old.md', status: 'renamed', hunks: [current] }] }),
        );
      }
      // base の応答は、テストが届く順序を決める
      return new Promise((resolve) => pending.set(input, resolve));
    },
  });
  vm.runInContext(ui, context);
  vm.runInContext(fixture, context);
  const review = context.fetch('/api/review'); // rename を知らないまま new.md の base を取りに行く
  await new Promise((resolve) => setTimeout(resolve, 0));
  const changeset = context.fetch('/api/changeset'); // rename 前の old.md の base を取りに行く
  await new Promise((resolve) => setTimeout(resolve, 0));
  pending.get(`/api/file?path=${encodeURIComponent('old.md')}&side=base`)(respond(baseText));
  await changeset;
  pending.get(`/api/file?path=${encodeURIComponent('new.md')}&side=base`)(respond('', false));
  await review;
  const files = [file('new.md', [current])];
  const partition = context.__diffoPlaceThreads(files, [thread], context.Qu);
  assert.equal(drawnLines(files, partition).get('t1').text, 'TARGET (rewritten)');
});

test('the same slot loses to a clearer rewrite of the commented line elsewhere in the gap', () => {
  const snapshot = makeHunk('h-s', 10, 10, [' p', '+hello world', '+something else', ' q']);
  const thread = makeThread('t1', 'doc.md', snapshot, 'new', 11);
  const files = [file('doc.md', [makeHunk('h-now', 10, 10, [' p', '+hello world? replaced', '+hello world!', ' q'])])];
  const drawn = drawnLines(files, placeThreads(files, [thread], diffo.Qu));
  assert.equal(drawn.get('t1').text, 'hello world!');
});

test('a rewritten insertion at the top of the file is found', () => {
  const snapshot = makeHunk('h-s', 1, 1, ['+target', ' p', ' r']);
  const thread = makeThread('t1', 'doc.md', snapshot, 'new', 1);
  const files = [file('doc.md', [makeHunk('h-now', 1, 1, ['+target edited', ' p', ' r'])])];
  const drawn = drawnLines(files, placeThreads(files, [thread], diffo.Qu));
  assert.equal(drawn.get('t1').text, 'target edited');
});

test('a short line expanded into a sentence in a one-to-one slot is still found', () => {
  const snapshot = makeHunk('h-s', 10, 10, [' p', '+token', ' q']);
  const thread = makeThread('t1', 'doc.md', snapshot, 'new', 11);
  const files = [file('doc.md', [makeHunk('h-now', 10, 10, [' p', '+Require a valid token for every request.', ' q'])])];
  const drawn = drawnLines(files, placeThreads(files, [thread], diffo.Qu));
  assert.equal(drawn.get('t1').text, 'Require a valid token for every request.');
  assert.deepEqual(placementState().rewritten, { t1: 'token' });
});

test('a base request that started before the base changed is not kept for a path that comes back', async () => {
  const thread = makeThread('t1', 'doc.md', original, 'new', 13);
  const current = makeHunk('h-new', 10, 10, [' a1', ' a2', ' a3', '+TARGET (rewritten)', '+second', ' z1']);
  const newBase = `${buildBases([file('doc.md', [current])], [thread])['doc.md']}`;
  const oldBase = 'an older base that does not contain the snapshot\n';
  const pending = [];
  let reviewThreads = [thread];
  const respond = (body, ok = true) => ({
    ok,
    clone() {
      return this;
    },
    json: async () => body,
    text: async () => body,
  });
  const context = vm.createContext({
    console: { warn() {} },
    URL,
    location: { href: 'http://127.0.0.1:7462/', origin: 'http://127.0.0.1:7462' },
    document: { readyState: 'loading', addEventListener() {} },
    fetch: (input) => {
      if (input === '/api/review') return Promise.resolve(respond({ threads: reviewThreads }));
      if (input === '/api/changeset') return Promise.resolve(respond({ files: [{ path: 'doc.md', status: 'modified', hunks: [current] }] }));
      return new Promise((resolve) => pending.push(resolve));
    },
  });
  vm.runInContext(ui, context);
  vm.runInContext(fixture, context);
  const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
  const first = context.fetch('/api/review'); // 古い base の取得が始まる
  await tick();
  reviewThreads = [];
  await context.fetch('/api/review'); // コメントが一覧から消える
  await context.fetch('/api/changeset'); // base が変わる（取得の対象は無い）
  pending.shift()(respond(oldBase)); // 古い取得が遅れて届く
  await first;
  reviewThreads = [thread];
  const third = context.fetch('/api/review'); // コメントが一覧に戻る
  await tick();
  pending.shift()(respond(newBase));
  await third;
  const files = [file('doc.md', [current])];
  const partition = context.__diffoPlaceThreads(files, [thread], context.Qu);
  assert.equal(drawnLines(files, partition).get('t1').text, 'TARGET (rewritten)');
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
