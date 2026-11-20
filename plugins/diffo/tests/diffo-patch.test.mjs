// bin/diffo-patch を、偽の diffo の配信ディレクトリに当てて確かめる。
// bundle は tests/fixtures/diffo-0.26.0-placement.js（スレッドの配置処理の写し）に、
// marked の呼び出しと語の差分の定数を足したもの
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixture = readFileSync(path.join(root, 'tests/fixtures/diffo-0.26.0-placement.js'), 'utf8');

const makeDiffo = (wordConstants) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'diffo-patch-test-'));
  const client = path.join(dir, 'dist/client');
  mkdirSync(path.join(client, 'assets'), { recursive: true });
  writeFileSync(
    path.join(client, 'index.html'),
    '<!doctype html>\n<html>\n  <head>\n    <script type="module" src="/assets/index-test.js"></script>\n  </head>\n  <body></body>\n</html>\n',
  );
  writeFileSync(
    path.join(client, 'assets/index-test.js'),
    // 配置のパッチが当てる、commit 別表示の関数と振り分け関数の呼び出し（tests/thread-placement.test.mjs と同じ形）
    `${fixture}\nfunction ed(e,t,n){return Qu(e,n)}\nGt=(0,x.useMemo)(()=>xt?ed(yt,e?.files??rm,Ut):Qu(e?.files??[],Ut),[e,Ut,xt,yt])\nvar md={gfm:!0,breaks:!0};\n${wordConstants}function Yd(e,t){if(e.length>zd||t.length>zd)return null}\n`,
  );
  return dir;
};

const runPatch = (dir) =>
  spawnSync('/bin/bash', [path.join(root, 'bin/diffo-patch')], {
    env: { ...process.env, DIFFO_DIR: dir },
    encoding: 'utf8',
  });

const bundleOf = (dir) => readFileSync(path.join(dir, 'dist/client/assets/index-test.js'), 'utf8');

test('the word diff limit is raised from 400 to 3000 once, and a second run leaves it as is', (t) => {
  const dir = makeDiffo('var zd=400,Bd=.3,Vd=400,Hd=3,Ud=.65;');
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const first = runPatch(dir);
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /word diff: 上限を 3000 文字にした/);
  assert.match(bundleOf(dir), /var zd=3000,Bd=\.3,Vd=400,Hd=3,Ud=\.65;/);
  const second = runPatch(dir);
  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stdout, /word diff: 変更なし/);
  assert.equal((bundleOf(dir).match(/=3000,/g) ?? []).length, 1);
});

test('the patch finds the limit by its value pattern even when the variable names change', (t) => {
  const dir = makeDiffo('var a1=400,b$=.3,c_=400,dd=3,e9=.65;');
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const result = runPatch(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.match(bundleOf(dir), /var a1=3000,b\$=\.3,c_=400,dd=3,e9=\.65;/);
});

test('the patch stops when the word diff constants are not found', (t) => {
  const dir = makeDiffo('var zd=500,Bd=.3,Vd=400,Hd=3,Ud=.65;');
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const result = runPatch(dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /word diff: 当てる先が 1 か所に決まらない/);
});
