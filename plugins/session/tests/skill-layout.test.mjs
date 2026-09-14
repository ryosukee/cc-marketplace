import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8');
const names = ['start', 'debrief', 'retrospective', 'handover', 'end'];

test('manifests select separate skill directories without default skills', () => {
  for (const name of names) {
    assert.equal(existsSync(path.join(root, 'skills', name, 'SKILL.md')), false);
  }
  assert.deepEqual(JSON.parse(read('.claude-plugin/plugin.json')).skills, ['./claude-skills/']);
  assert.equal(JSON.parse(read('.codex-plugin/plugin.json')).skills, './codex-skills/');
  for (const name of names) {
    assert.ok(existsSync(path.join(root, 'claude-skills', name, 'SKILL.md')));
    assert.ok(existsSync(path.join(root, 'codex-skills', name, 'SKILL.md')));
    for (const directory of ['claude-skills', 'codex-skills']) {
      assert.match(read(`${directory}/${name}/SKILL.md`), /^user-invocable: true$/m);
    }
  }
});

test('Codex skills do not require Claude Code commands or environment variables', () => {
  for (const name of names) {
    const skill = read(`codex-skills/${name}/SKILL.md`);
    assert.doesNotMatch(skill, /\$\{CLAUDE_|\/session:(?!\.\.\.)/);
  }
});

test('both skill sets load one shared workflow per skill', () => {
  for (const name of names) {
    const reference = `references/${name}.md`;
    assert.ok(existsSync(path.join(root, reference)));
    for (const directory of ['claude-skills', 'codex-skills']) {
      assert.match(read(`${directory}/${name}/SKILL.md`), new RegExp(reference.replace('/', '\\/')));
    }
  }
});

test('both handover skills use the same checker and reviewer guidance', () => {
  assert.ok(existsSync(path.join(root, 'scripts/check-handover.mjs')));
  assert.ok(existsSync(path.join(root, 'references/handover-review.md')));
  for (const directory of ['claude-skills', 'codex-skills']) {
    const skill = read(`${directory}/handover/SKILL.md`);
    assert.match(skill, /scripts\/check-handover\.mjs/);
    assert.match(skill, /handover-review/);
  }
  assert.match(read('agents/handover-reviewer.md'), /references\/handover-review\.md/);
});

test('both skill sets use the shared draft task lifecycle', () => {
  assert.ok(existsSync(path.join(root, 'references', 'draft-tasks.md')));
  for (const name of ['start', 'debrief', 'retrospective', 'handover']) {
    assert.match(read(`references/${name}.md`), /draft-tasks\.md/);
  }
});
