import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('the first poll sets the title, timeouts retry without it, and one notification ends the poller', (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'diffo-poll-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const bin = path.join(dir, 'bin');
  mkdirSync(bin);
  const stub = (name, code) => writeFileSync(path.join(bin, name), `#!/usr/bin/env node\n${code}`, { mode: 0o755 });
  stub('codex', `import fs from 'node:fs';\nfs.appendFileSync(process.env.POLL_TEST_LOG, JSON.stringify({command:'codex',args:process.argv.slice(2)})+'\\n');`);
  stub('npx', `import fs from 'node:fs';
const rows=fs.existsSync(process.env.POLL_TEST_LOG)?fs.readFileSync(process.env.POLL_TEST_LOG,'utf8').split('\\n').filter(Boolean).map(JSON.parse):[];
fs.appendFileSync(process.env.POLL_TEST_LOG,JSON.stringify({command:'npx',args:process.argv.slice(2)})+'\\n');
console.log(JSON.stringify(rows.some(r=>r.command==='npx')?{status:'feedback',kind:'finish',threadIds:['t-1'],prompt:'Finished'}:{status:'timeout'}));`);
  const log = path.join(dir, 'calls.jsonl');
  const state = path.join(dir, 'state');
  const result = spawnSync('/bin/bash', [path.join(root, 'bin/diffo-codex-poll'), '01a11848-2e04-7150-893b-c998ea3e0b5c', 'ref-diffo 読み込み'], {
    cwd: dir, encoding: 'utf8', timeout: 10000,
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, XDG_STATE_HOME: state, POLL_TEST_LOG: log },
  });
  assert.equal(result.status, 0, result.stderr);
  const rows = readFileSync(log, 'utf8').split('\n').filter(Boolean).map(JSON.parse);
  const polls = rows.filter(row => row.command === 'npx');
  assert.deepEqual(polls.map(row => row.args), [
    ['-y', '--prefer-online', '@diffohq/diffo@latest', 'poll', '--title', 'ref-diffo 読み込み'],
    ['-y', '--prefer-online', '@diffohq/diffo@latest', 'poll'],
  ]);
  const queued = rows.filter(row => row.command === 'codex' && row.args[0] === 'queue' && row.args.includes('--thread'));
  assert.equal(queued.length, 1);
  assert.equal(queued[0].args[2], '01a11848-2e04-7150-893b-c998ea3e0b5c');
  assert.ok(queued[0].args[4].includes('ref-diffo'));
  assert.ok(queued[0].args[4].includes('t-1'));
  assert.deepEqual(readdirSync(path.join(state, 'diffo-codex-poll')), []);
});
