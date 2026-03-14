#!/bin/bash
# SessionStart hook: pane ↔ session ID マッピングを作成
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"

command -v jq >/dev/null 2>&1 || { echo "jq is required" >&2; exit 0; }

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id')
CWD=$(echo "$INPUT" | jq -r '.cwd')
SOURCE=$(echo "$INPUT" | jq -r '.source // "unknown"')

# session_id が取得できなければ何もしない
if [ -z "$SESSION_ID" ] || [ "$SESSION_ID" = "null" ]; then
  exit 0
fi

# tmux 内でなければ何もしない
if [ -z "${TMUX_PANE:-}" ]; then
  exit 0
fi

SESSIONS_DIR="$PLUGIN_ROOT/internal/sessions"
mkdir -p "$SESSIONS_DIR"

TARGET="$SESSIONS_DIR/$SESSION_ID.json"

# 同一 pane の古いマッピングを削除（自分自身は除外）
for f in "$SESSIONS_DIR"/*.json; do
  [ -f "$f" ] || continue
  [ "$f" = "$TARGET" ] && continue
  existing_pane=$(jq -r '.paneId' "$f" 2>/dev/null)
  if [ "$existing_pane" = "$TMUX_PANE" ]; then
    rm -f "$f"
  fi
done

TMPFILE="$TARGET.tmp.$$"

jq -n \
  --arg sid "$SESSION_ID" \
  --arg pid "$TMUX_PANE" \
  --arg cwd "$CWD" \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" \
  '{sessionId: $sid, paneId: $pid, cwd: $cwd, startedAt: $ts}' \
  > "$TMPFILE" && mv "$TMPFILE" "$TARGET"

# resume 後の再クリーンアップ
if [ "$SOURCE" = "resume" ]; then
  sleep 0.3
  for f in "$SESSIONS_DIR"/*.json; do
    [ -f "$f" ] || continue
    [ "$f" = "$TARGET" ] && continue
    existing_pane=$(jq -r '.paneId' "$f" 2>/dev/null)
    if [ "$existing_pane" = "$TMUX_PANE" ]; then
      rm -f "$f"
    fi
  done
fi

exit 0
