#!/usr/bin/env node
// The gate knows whether ref-diffo was loaded, not how a review is polled.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const client = process.argv[2];
if (!['claude', 'codex'].includes(client)) {
  console.error('ref-diffo-gate: expected claude or codex');
  process.exit(2);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const skillPath = path.join(root, `${client}-skills/ref-diffo/SKILL.md`);
const hash = (value) => createHash('sha256').update(value).digest('hex');

// Tokenize just enough shell syntax to distinguish commands from quoted prose.
// This is a workflow guard for ordinary CLI invocations, not a shell sandbox.
function shellParts(source) {
  const parts = [];
  let word = '', quote = '', active = false;
  const flush = () => { if (active) parts.push(word); word = ''; active = false; };
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (c === '\\' && quote !== "'") {
      active = true;
      if (source[i + 1] !== '\n') word += source[++i] ?? '';
      else i++;
    } else if (quote) {
      if (c === quote) quote = '';
      else word += c;
    } else if (c === '"' || c === "'") {
      quote = c; active = true;
    } else if (/\s/.test(c)) {
      flush();
      if (c === '\n') parts.push(';');
    } else if (';|&()'.includes(c)) {
      flush(); parts.push(c);
    } else if (c === '#' && !active) {
      while (i < source.length && source[i] !== '\n') i++;
      flush(); parts.push(';');
    } else {
      word += c; active = true;
    }
  }
  flush();
  return parts;
}

// Literal here-doc bodies are data, not command lines. Expanding bodies still
// execute their substitutions; keep only those for the substitution scan.
function withoutHeredocLines(source) {
  const lines = source.split('\n'), result = [], pending = [];
  for (const line of lines) {
    if (pending.length) {
      const current = pending[0];
      if ((current.tabs ? line.replace(/^\t+/, '') : line) === current.delimiter) pending.shift();
      else if (!current.literal) result.push(...(line.match(/\$\([^]*?\)/g) ?? []));
      result.push('');
      continue;
    }
    let quote = '';
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '\\' && quote !== "'") { i++; continue; }
      if (quote) { if (c === quote) quote = ''; continue; }
      if (c === '"' || c === "'") { quote = c; continue; }
      if (line.slice(i, i + 2) !== '<<' || line[i + 2] === '<') continue;
      const match = line.slice(i).match(/^<<(-?)\s*(?:'([^']+)'|"([^"]+)"|([A-Za-z_][A-Za-z_0-9]*))/);
      if (!match) continue;
      pending.push({ delimiter: match[2] ?? match[3] ?? match[4], tabs: match[1] === '-', literal: Boolean(match[2] || match[3]) });
      i += match[0].length - 1;
    }
    result.push(line);
  }
  return result.join('\n');
}

function invokesDiffo(source, depth = 0) {
  if (depth > 8 || typeof source !== 'string') return false;
  source = withoutHeredocLines(source);
  const tokens = shellParts(source);
  const separators = new Set([';', '|', '&', '(', ')']);
  let start = true;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (separators.has(token)) { start = true; continue; }
    if (!start) continue;
    if (/^[A-Za-z_][A-Za-z_0-9]*=/.test(token) || ['if', 'then', 'elif', 'else', 'do', '!', '{', '}'].includes(token)) continue;
    const command = path.basename(token);
    if (['env', 'command', 'exec', 'sudo', 'timeout'].includes(command)) {
      // Skip options and assignment words before the wrapped command.
      while (tokens[i + 1]?.startsWith('-') || /^[A-Za-z_][A-Za-z_0-9]*=/.test(tokens[i + 1] ?? '')) i++;
      if (command === 'timeout' && /^\d/.test(tokens[i + 1] ?? '')) i++;
      continue;
    }
    start = false;
    if (['diffo', 'diffo-codex-poll', 'diffo-patch'].includes(command)) return true;
    let end = i + 1;
    while (end < tokens.length && !separators.has(tokens[end])) end++;
    const args = tokens.slice(i + 1, end);
    if (command === 'npx' && args.some((arg) => arg === 'diffo' || /^(?:--package=)?@diffohq\/diffo(?:@|$)/.test(arg))) return true;
    if (command === 'npm' && args.includes('exec') && args.some((arg) => /^(?:--package=)?@diffohq\/diffo(?:@|$)/.test(arg))) return true;
    if (command === 'node' && args.some((arg) => /(?:^|\/)@diffohq\/diffo\/.*\.(?:m?js)$/.test(arg))) return true;
    if (['bash', 'sh', 'zsh'].includes(command)) {
      const flag = args.findIndex((arg) => /^-[^-]*c/.test(arg));
      if (flag >= 0 && invokesDiffo(args[flag + 1], depth + 1)) return true;
    }
  }
  // Commands in substitutions are executed even when surrounded by quotes.
  // Only examine substitutions outside single quotes.
  let quote = '';
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\\' && quote !== "'") { i++; continue; }
    if (source[i] === "'" && quote !== '"') { quote = quote === "'" ? '' : "'"; continue; }
    if (source[i] === '"' && quote !== "'") { quote = quote === '"' ? '' : '"'; continue; }
    if (quote !== "'" && source.slice(i, i + 2) === '$(') {
      let end = i + 2, nesting = 1;
      while (end < source.length && nesting) {
        if (source[end] === '(') nesting++;
        if (source[end] === ')') nesting--;
        end++;
      }
      if (invokesDiffo(source.slice(i + 2, end - 1), depth + 1)) return true;
      i = end - 1;
    }
  }
  return false;
}

function strings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

function sameFile(candidate, cwd) {
  if (typeof candidate !== 'string') return false;
  try { return realpathSync(path.resolve(cwd, candidate)) === realpathSync(skillPath); }
  catch { return false; }
}

function loadedSkill(event, body) {
  const input = event.tool_input ?? {}, response = event.tool_response;
  if (response?.isError === true || response?.interrupted === true || (typeof response?.exit_code === 'number' && response.exit_code !== 0)) return false;
  if (client === 'claude' && event.tool_name === 'Skill') {
    return ['diffo:ref-diffo', 'ref-diffo'].includes(input.skill) && response?.success === true;
  }
  if (event.tool_name === 'Read') {
    return sameFile(input.file_path, event.cwd) && strings(response).some((text) => text.includes(body.trimEnd()));
  }
  if (event.tool_name === 'Bash') {
    // Require both the real file path and its complete contents in the result.
    // Failed reads, grep/head output and a mere mention of the path do not count.
    return shellParts(input.command ?? '').some((token) => sameFile(token, event.cwd))
      && strings(response).some((text) => text.includes(body.trimEnd()));
  }
  return false;
}

function deny(reason) {
  console.log(JSON.stringify({ hookSpecificOutput: {
    hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason,
  } }));
}

let event;
try { event = JSON.parse(readFileSync(0, 'utf8')); }
catch (error) { console.error(`ref-diffo-gate: invalid hook input: ${error.message}`); process.exit(2); }
const isDiffo = event.hook_event_name === 'PreToolUse' && event.tool_name === 'Bash'
  && invokesDiffo(event.tool_input?.command);

try {
  if (typeof event.session_id !== 'string' || !event.session_id) throw new Error('session_id is missing');
  const body = readFileSync(skillPath, 'utf8');
  const digest = hash(body);
  const scope = hash(JSON.stringify([event.session_id, event.agent_id ?? null, event.transcript_path ?? null]));
  const data = process.env.PLUGIN_DATA || process.env.CLAUDE_PLUGIN_DATA
    || path.join(process.env.XDG_STATE_HOME || path.join(homedir(), '.local/state'), 'diffo');
  const stateDir = path.join(data, 'ref-diffo-gate', client);
  const record = path.join(stateDir, `${scope}.json`);
  if (['SessionStart', 'SessionEnd'].includes(event.hook_event_name)) {
    try { unlinkSync(record); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  } else if (event.hook_event_name === 'PostToolUse' && loadedSkill(event, body)) {
    mkdirSync(stateDir, { recursive: true, mode: 0o700 });
    writeFileSync(record, JSON.stringify({ digest }), { mode: 0o600 });
  } else if (isDiffo) {
    let loaded = false;
    try { loaded = JSON.parse(readFileSync(record, 'utf8')).digest === digest; }
    catch (error) { if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error; }
    if (!loaded) {
      const instruction = client === 'claude'
        ? 'Skill ツールで diffo:ref-diffo を発動するか、次の SKILL.md を全文読む。'
        : '次の SKILL.md を全文読み、ref-diffo を発動する。';
      deny(`Diffo の実行前に ref-diffo の読み込みが必要。${instruction}\n${skillPath}\n読み込み後、その手順に従って実行し直す。hook は polling 方法を指定しない。`);
    }
  }
} catch (error) {
  const reason = `ref-diffo-gate: ${error.message}。hook の入力と state の保存先を確認する。`;
  if (isDiffo) deny(reason);
  else { console.error(reason); process.exitCode = 1; }
}
