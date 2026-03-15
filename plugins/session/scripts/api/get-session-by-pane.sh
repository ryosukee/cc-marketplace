#!/bin/bash
# pane ID からセッション情報を取得する API
# 引数: [PANE_ID] (省略時は $TMUX_PANE)
# stdout: JSON (セッション情報 or エラー)
# exit 0: 成功, exit 1: 該当なし, exit 2: 前提条件エラー
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"

PANE_ID="${1:-${TMUX_PANE:-}}"

if [ -z "$PANE_ID" ]; then
  echo '{"error": "no_pane_id"}'
  exit 2
fi

SESSIONS_DIR="$PLUGIN_ROOT/internal/sessions"

if [ ! -d "$SESSIONS_DIR" ]; then
  echo "{\"error\": \"no_session\", \"paneId\": \"${PANE_ID}\"}"
  exit 1
fi

for f in "$SESSIONS_DIR"/*.json; do
  [ -f "$f" ] || continue
  existing_pane=$(jq -r '.paneId' "$f" 2>/dev/null)
  if [ "$existing_pane" = "$PANE_ID" ]; then
    cat "$f"
    exit 0
  fi
done

echo "{\"error\": \"no_session\", \"paneId\": \"${PANE_ID}\"}"
exit 1
