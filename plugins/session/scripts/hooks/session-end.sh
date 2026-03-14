#!/bin/bash
# SessionEnd hook: マッピングファイルを削除
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"

command -v jq >/dev/null 2>&1 || { echo "jq is required" >&2; exit 0; }

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id')

# session_id が取得できなければ何もしない
if [ -z "$SESSION_ID" ] || [ "$SESSION_ID" = "null" ]; then
  exit 0
fi

SESSIONS_DIR="$PLUGIN_ROOT/internal/sessions"
TARGET="$SESSIONS_DIR/$SESSION_ID.json"

rm -f "$TARGET"

exit 0
