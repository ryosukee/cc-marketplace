import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeLoads = JSON.parse(readFileSync(path.join(root, 'tests/fixtures/ref-diffo-loads.json'), 'utf8'));
function fixture(t, client) {
  const dir = mkdtempSync(path.join(tmpdir(), 'diffo-gate-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const plugin = path.join(dir, 'plugin with spaces');
  const script = path.join(plugin, 'scripts/hooks/ref-diffo-gate.mjs');
  const skill = path.join(plugin, `${client}-skills/ref-diffo/SKILL.md`);
  mkdirSync(path.dirname(script), { recursive: true });
  mkdirSync(path.dirname(skill), { recursive: true });
  copyFileSync(path.join(root, 'scripts/hooks/ref-diffo-gate.mjs'), script);
  copyFileSync(path.join(root, `${client}-skills/ref-diffo/SKILL.md`), skill);
  const body = () => readFileSync(skill, 'utf8');
  const run = (event, override = {}) => {
    const result = spawnSync(process.execPath, [script, client], {
      input: JSON.stringify({ session_id: 'session-one', transcript_path: '/session-one.jsonl', cwd: dir, ...event, ...override }),
      encoding: 'utf8', env: { ...process.env, PLUGIN_DATA: path.join(dir, 'data'), CLAUDE_PLUGIN_DATA: path.join(dir, 'data') },
    });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout ? JSON.parse(result.stdout).hookSpecificOutput : null;
  };
  const pre = (command, override) => run({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } }, override);
  const read = (content = body(), override) => run({
    hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: `cat '${skill}'` },
    tool_response: { exit_code: 0, output: content },
  }, override);
  return { run, pre, read, body, skill };
}

for (const client of ['claude', 'codex']) {
  test(`${client}: repeated attempts stay blocked until a full successful read`, (t) => {
    const f = fixture(t, client);
    for (let i = 0; i < 2; i++) {
      const denial = f.pre('npx -y --prefer-online @diffohq/diffo@latest poll');
      assert.equal(denial.permissionDecision, 'deny');
      assert.ok(denial.permissionDecisionReason.includes(f.skill));
      assert.ok(!denial.permissionDecisionReason.includes('diffo-codex-poll'));
    }
    f.read('cat: file not found');
    assert.equal(f.pre('diffo poll').permissionDecision, 'deny');
    f.read(f.body().slice(0, 400));
    assert.equal(f.pre('diffo poll').permissionDecision, 'deny');
    f.read();
    assert.equal(f.pre('diffo poll'), null);
    assert.equal(f.pre('diffo reply abc --message ok'), null);
  });

  test(`${client}: successful loading is isolated by session, transcript and agent`, (t) => {
    const f = fixture(t, client);
    f.read();
    assert.equal(f.pre('diffo poll', { session_id: 'session-two' }).permissionDecision, 'deny');
    assert.equal(f.pre('diffo poll', { transcript_path: '/child.jsonl' }).permissionDecision, 'deny');
    assert.equal(f.pre('diffo poll', { agent_id: 'child' }).permissionDecision, 'deny');
    assert.equal(f.pre('diffo poll'), null);
  });

  test(`${client}: the captured native hook payload unlocks a retry`, (t) => {
    const f = fixture(t, client);
    assert.equal(f.pre('diffo status').permissionDecision, 'deny');
    const event = JSON.parse(JSON.stringify(runtimeLoads.events[client])
      .replaceAll('{{SKILL_PATH}}', f.skill));
    if (event.tool_response === '{{SKILL_BODY}}') event.tool_response = f.body();
    f.run(event);
    assert.equal(f.pre('diffo status'), null);
  });

  test(`${client}: resume, compact and end revoke the loading record`, (t) => {
    const f = fixture(t, client);
    for (const source of ['startup', 'resume', 'clear', 'compact']) {
      f.read();
      f.run({ hook_event_name: 'SessionStart', source });
      assert.equal(f.pre('diffo poll').permissionDecision, 'deny');
    }
    f.read();
    f.run({ hook_event_name: 'SessionEnd' });
    assert.equal(f.pre('diffo poll').permissionDecision, 'deny');
  });

  test(`${client}: loading an old skill version cannot unlock changed instructions`, (t) => {
    const f = fixture(t, client);
    f.read();
    writeFileSync(f.skill, `${f.body()}\nUpdated instructions.\n`);
    assert.equal(f.pre('diffo poll').permissionDecision, 'deny');
    f.read();
    assert.equal(f.pre('diffo poll'), null);
  });

  test(`${client}: a path mention and unrelated output cannot mark the skill loaded`, (t) => {
    const f = fixture(t, client);
    f.run({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'git status' }, tool_response: { output: f.body() } });
    assert.equal(f.pre('diffo poll').permissionDecision, 'deny');
    f.run({ hook_event_name: 'PostToolUse', tool_name: 'Read', tool_input: { file_path: f.skill }, tool_response: { file: { content: f.body().slice(0, 100) } } });
    assert.equal(f.pre('diffo poll').permissionDecision, 'deny');
    f.run({ hook_event_name: 'PostToolUse', tool_name: 'Read', tool_input: { file_path: f.skill }, tool_response: { file: { content: f.body() } } });
    assert.equal(f.pre('diffo poll'), null);
  });

  test(`${client}: declared hooks invoke the adapter with the host variables`, (t) => {
    const manifest = JSON.parse(readFileSync(path.join(root, `.${client === 'claude' ? 'claude' : 'codex'}-plugin/plugin.json`), 'utf8'));
    const hooks = JSON.parse(readFileSync(path.resolve(root, manifest.hooks), 'utf8')).hooks;
    const dir = mkdtempSync(path.join(tmpdir(), 'diffo-declaration-'));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    const env = { ...process.env, PLUGIN_ROOT: root, CLAUDE_PLUGIN_ROOT: root, PLUGIN_DATA: dir, CLAUDE_PLUGIN_DATA: dir };
    const call = (hookEvent, input) => {
      const command = hooks[hookEvent][0].hooks[0].command.replace(/\$\{(PLUGIN_ROOT|CLAUDE_PLUGIN_ROOT)\}/g, (_, name) => env[name]);
      return spawnSync('/bin/bash', ['-c', command], { env, input: JSON.stringify({ session_id: 'declaration-test', cwd: root, hook_event_name: hookEvent, ...input }), encoding: 'utf8' });
    };
    const denied = call('PreToolUse', { tool_name: 'Bash', tool_input: { command: 'diffo poll' } });
    assert.equal(denied.status, 0, denied.stderr);
    assert.equal(JSON.parse(denied.stdout).hookSpecificOutput.permissionDecision, 'deny');
    const skill = path.join(root, `${client}-skills/ref-diffo/SKILL.md`);
    const loaded = call('PostToolUse', { tool_name: 'Bash', tool_input: { command: `cat '${skill}'` }, tool_response: { output: readFileSync(skill, 'utf8') } });
    assert.equal(loaded.status, 0, loaded.stderr);
    const allowed = call('PreToolUse', { tool_name: 'Bash', tool_input: { command: 'diffo poll' } });
    assert.equal(allowed.status, 0, allowed.stderr);
    assert.equal(allowed.stdout, '');
  });
}

test('Claude native Skill completion unlocks only ref-diffo', (t) => {
  const f = fixture(t, 'claude');
  for (const [skill, success] of [['diffo', true], ['diffo:ref-diffo', false]]) {
    f.run({ hook_event_name: 'PostToolUse', tool_name: 'Skill', tool_input: { skill }, tool_response: { success } });
    assert.equal(f.pre('diffo poll').permissionDecision, 'deny');
  }
  f.run({ hook_event_name: 'PostToolUse', tool_name: 'Skill', tool_input: { skill: 'diffo:ref-diffo' }, tool_response: { success: true } });
  assert.equal(f.pre('diffo poll'), null);
});

test('ordinary CLI forms and wrappers are guarded without blocking prose or unrelated commands', (t) => {
  const f = fixture(t, 'codex');
  for (const command of [
    'diffo --no-open', '/usr/local/bin/diffo poll',
    'npx -y @diffohq/diffo poll --title "skill loading"',
    'npx --package=@diffohq/diffo@latest diffo poll', 'npx diffo poll',
    'npm exec --package=@diffohq/diffo@latest -- diffo poll',
    'node /tmp/node_modules/@diffohq/diffo/dist/cli.mjs poll',
    'env EXAMPLE=1 npx -y @diffohq/diffo@latest poll',
    'git status && diffo poll',
    'while :; do out=$(npx -y @diffohq/diffo poll); done',
    'bash -lc "npx -y @diffohq/diffo poll"',
    'echo "$(diffo status)"',
    'cat <<EOF\n$(diffo status)\nEOF',
    '/plugin/bin/diffo-codex-poll thread-id', '/plugin/bin/diffo-patch',
  ]) assert.equal(f.pre(command)?.permissionDecision, 'deny', command);
  for (const command of [
    'git status', 'echo "diffo poll"', "printf '%s' 'npx -y @diffohq/diffo poll'",
    'rg "@diffohq/diffo" /tmp/README.md', '# diffo poll\ngit status',
    "echo '$(diffo poll)'", 'cat /tmp/ref-diffo/SKILL.md',
    "cat <<'EOF'\ndiffo poll\n$(diffo poll)\nEOF",
    'cat <<EOF\ndiffo poll\nEOF',
  ]) assert.equal(f.pre(command), null, command);
});

test('interrupted and non-zero full reads leave the gate closed', (t) => {
  const f = fixture(t, 'codex');
  for (const extra of [{ exit_code: 1 }, { interrupted: true }, { isError: true }]) {
    f.run({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: `cat '${f.skill}'` }, tool_response: { output: f.body(), ...extra } });
    assert.equal(f.pre('diffo poll').permissionDecision, 'deny');
  }
});
