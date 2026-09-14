import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checker = path.join(root, 'scripts', 'check-handover.mjs');
const sections = [
  '背景',
  'ゴール・原則',
  '決定事項',
  '現在地と再開手順',
  '完了したこと',
  '現在の作業状態',
  '参照すべき資料',
  '復元タスク',
  '却下と決めたこと',
];

function runWithSection(body, draftOnly = false) {
  const directory = mkdtempSync(path.join(tmpdir(), 'session-handover-test-'));
  try {
    const file = path.join(directory, 'handover.md');
    const content = sections.map((section) => {
      if (section === '復元タスク') {
        return `${draftOnly ? '## セッション内タスク\n\nなし\n\n' : ''}## ${section}\n\n${body}`;
      }
      return `## ${section}\n\n記録なし`;
    }).join('\n\n');
    writeFileSync(file, `${content}\n`);
    const result = spawnSync(process.execPath, [checker, file], { encoding: 'utf8' });
    return { status: result.status, output: JSON.parse(result.stdout) };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('final handover accepts no restoration tasks', () => {
  const result = runWithSection('なし');
  assert.equal(result.status, 0);
  assert.equal(result.output.total, 0);
});

test('final handover rejects a draft-only task section', () => {
  const result = runWithSection('なし', true);
  assert.equal(result.status, 1);
  assert.ok(result.output.results[0].findings.some((finding) =>
    finding.check === 'required-sections' && finding.message.includes('セッション内タスク')));
});
