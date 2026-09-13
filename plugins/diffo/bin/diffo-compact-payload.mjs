#!/usr/bin/env node

// poll の prompt だけから今回の指摘を抜き出す。取得できなければ入力をそのまま返す。
import { readFileSync } from 'node:fs';

function readPayload(raw) {
  for (const line of raw.trimEnd().split(/\r?\n/).reverse()) {
    if (!line.startsWith('{')) continue;
    try {
      const value = JSON.parse(line);
      if (value?.status === 'feedback') return value;
    } catch {
      // poll の stderr には人間向けの行もある。JSON だけを対象にする。
    }
  }
  throw new Error('feedback payload not found');
}

function parseMessages(block) {
  const start = block.indexOf('\nMessages:\n');
  if (start < 0) throw new Error('messages not found');
  const messages = [];
  for (const line of block.slice(start + '\nMessages:\n'.length).split('\n')) {
    const match = /^- (reviewer|agent): (.*)$/.exec(line);
    if (match) {
      messages.push({ author: match[1], text: match[2] });
    } else if (line.startsWith('  ') && messages.length > 0) {
      messages.at(-1).text += `\n${line.slice(2)}`;
    } else if (messages.length > 0) {
      break;
    }
  }
  return messages;
}

function parseThreads(prompt) {
  const headings = [...prompt.matchAll(/^### Thread \d+.*$/gm)];
  const result = new Map();
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const end = headings[index + 1]?.index ?? prompt.length;
    const block = prompt.slice(heading.index, end);
    const id = /^id: ([0-9a-fA-F-]+)$/m.exec(block)?.[1];
    if (!id || result.has(id)) throw new Error('invalid thread id');
    const messages = parseMessages(block);
    const lastAgentIndex = messages.findLastIndex((message) => message.author === 'agent');
    const reviewerMessages = messages.slice(lastAgentIndex + 1)
      .filter((message) => message.author === 'reviewer')
      .map((message) => message.text);
    if (reviewerMessages.length === 0) throw new Error('new reviewer message not found');
    const label = heading[0];
    result.set(id, {
      id,
      location: label.replace(/^### Thread \d+(?: \[[^\]]+\])? — /, ''),
      intent: label.includes('[question]') ? 'question' : label.includes('[issue]') ? 'fix' : null,
      ...(lastAgentIndex >= 0 ? { lastAgentReply: messages[lastAgentIndex].text } : {}),
      reviewerMessages,
    });
  }
  return result;
}

function compact(raw) {
  const payload = readPayload(raw);
  if (payload.kind !== 'threads' || !Array.isArray(payload.threadIds)
      || payload.threadIds.length === 0 || typeof payload.prompt !== 'string') {
    throw new Error('unsupported payload');
  }
  const threads = parseThreads(payload.prompt);
  if (new Set(payload.threadIds).size !== payload.threadIds.length) {
    throw new Error('duplicate thread id');
  }
  const selected = payload.threadIds.map((id) => threads.get(id));
  if (selected.some((thread) => !thread)) throw new Error('thread id mismatch');
  return JSON.stringify({
    status: 'feedback',
    kind: 'threads',
    threadIds: payload.threadIds,
    threads: selected,
  });
}

const raw = readFileSync(0, 'utf8');
try {
  process.stdout.write(`${compact(raw)}\n`);
} catch {
  process.stdout.write(raw);
}
