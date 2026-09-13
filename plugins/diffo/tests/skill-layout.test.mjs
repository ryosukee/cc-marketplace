import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8');

test('Codex manifest selects only its host-specific skill directory', () => {
  const manifest = JSON.parse(read('.codex-plugin/plugin.json'));
  assert.equal(manifest.skills, './codex-skills/');
  assert.equal(existsSync(path.join(root, 'skills')), false);
  assert.match(read('codex-skills/ref-diffo/SKILL.md'), /CODEX_THREAD_ID/);
  assert.doesNotMatch(read('codex-skills/ref-diffo/SKILL.md'), /CLAUDE_PLUGIN_ROOT|run_in_background/);
});

test('Claude manifest selects only its host-specific skill directory', () => {
  const manifest = JSON.parse(read('.claude-plugin/plugin.json'));
  assert.deepEqual(manifest.skills, ['./claude-skills/']);
  const skill = read('claude-skills/ref-diffo/SKILL.md');
  assert.match(skill, /CLAUDE_PLUGIN_ROOT|run_in_background/);
  assert.doesNotMatch(skill, /CODEX_THREAD_ID|codex queue/);
});

test('both skills resolve the same shared review protocol', () => {
  for (const directory of ['claude-skills', 'codex-skills']) {
    const skillPath = path.join(root, directory, 'ref-diffo', 'SKILL.md');
    const skill = readFileSync(skillPath, 'utf8');
    const reference = skill.match(/\]\((\.\.\/\.\.\/references\/review-protocol\.md)\)/)?.[1];
    assert.ok(reference);
    assert.match(readFileSync(path.resolve(path.dirname(skillPath), reference), 'utf8'), /threadIds/);
  }
});
