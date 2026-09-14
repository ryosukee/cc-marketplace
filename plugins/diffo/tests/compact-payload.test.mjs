import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('../bin/diffo-compact-payload.mjs', import.meta.url));

function format(input) {
  const result = spawnSync(process.execPath, [script], { input, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test('latest reviewer messages and the preceding agent reply are kept by thread id', () => {
  const prompt = `The reviewer sent new messages on 2 review threads.

### Thread 1 [question] — docs/a.md:4 (new side)
id: aaaa-1111
Messages:
- reviewer: Original question
- agent: Earlier answer
  with a second line
- reviewer: Follow-up one
- reviewer: Follow-up two

### Thread 2 [issue] — src/b.js:9 (new side)
id: bbbb-2222
Messages:
- reviewer: Fix this

## How to respond
All history is deliberately omitted from the compact result.
`;
  const input = `diffo: waiting for the reviewer\n${JSON.stringify({
    status: 'feedback', kind: 'threads', threadIds: ['bbbb-2222', 'aaaa-1111'], prompt,
  })}\n`;
  const result = JSON.parse(format(input));
  assert.deepEqual(result.threadIds, ['bbbb-2222', 'aaaa-1111']);
  assert.deepEqual(result.threads, [
    {
      id: 'bbbb-2222', location: 'src/b.js:9 (new side)', intent: 'fix',
      reviewerMessages: ['Fix this'],
    },
    {
      id: 'aaaa-1111', location: 'docs/a.md:4 (new side)', intent: 'question',
      lastAgentReply: 'Earlier answer\nwith a second line',
      reviewerMessages: ['Follow-up one', 'Follow-up two'],
    },
  ]);
  assert.equal('prompt' in result, false);
});

test('unlabeled thread keeps null intent', () => {
  const input = JSON.stringify({
    status: 'feedback', kind: 'threads', threadIds: ['aaaa-1111'],
    prompt: '### Thread 1 — README.md:3 (new side)\nid: aaaa-1111\nMessages:\n- reviewer: Why?\n',
  });
  assert.equal(JSON.parse(format(input)).threads[0].intent, null);
});

test('unrecognized and incomplete payloads fall back to the exact input', () => {
  const finish = JSON.stringify({ status: 'feedback', kind: 'finish', threadIds: [], prompt: 'LGTM' });
  const mismatch = JSON.stringify({
    status: 'feedback', kind: 'threads', threadIds: ['missing'],
    prompt: '### Thread 1 — a.md\nid: aaaa-1111\nMessages:\n- reviewer: Fix\n',
  });
  for (const input of [finish, mismatch, 'not JSON']) {
    assert.equal(format(input), input);
  }
});
