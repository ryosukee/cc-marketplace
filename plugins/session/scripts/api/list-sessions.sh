#!/bin/bash
# アクティブセッション一覧を取得する API
# 引数: なし
# stdout: JSON {"sessions": [...]}
# exit 0: 常に成功
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
DATA_ROOT="${CLAUDE_PLUGIN_DATA:-$PLUGIN_ROOT/internal}"

SESSIONS_DIR="$DATA_ROOT/sessions"

if [ ! -d "$SESSIONS_DIR" ]; then
  echo '{"sessions": []}'
  exit 0
fi

# tmux が起動していなければ空配列を返す
if ! command -v tmux >/dev/null 2>&1 || ! tmux list-panes -a -F '#{pane_id}' >/dev/null 2>&1; then
  echo '{"sessions": []}'
  exit 0
fi

# live pane ID の一覧を取得
live_panes=$(tmux list-panes -a -F '#{pane_id}')

# 全 session ファイルから live pane のみを収集
files=()
for f in "$SESSIONS_DIR"/*.json; do
  [ -f "$f" ] || continue
  pane_id=$(jq -r '.paneId' "$f" 2>/dev/null) || continue
  if echo "$live_panes" | grep -qxF "$pane_id"; then
    files+=("$f")
  else
    # stale データを削除
    rm -f "$f"
  fi
done

if [ ${#files[@]} -eq 0 ]; then
  echo '{"sessions": []}'
  exit 0
fi

jq -s '{sessions: .}' "${files[@]}"
