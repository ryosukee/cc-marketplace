#!/bin/bash
# アクティブセッション一覧を取得する API
# 引数: なし
# stdout: JSON {"sessions": [...]}
# exit 0: 常に成功
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"

SESSIONS_DIR="$PLUGIN_ROOT/internal/sessions"

if [ ! -d "$SESSIONS_DIR" ]; then
  echo '{"sessions": []}'
  exit 0
fi

# 全 session ファイルを配列に集めて jq で結合
files=()
for f in "$SESSIONS_DIR"/*.json; do
  [ -f "$f" ] || continue
  files+=("$f")
done

if [ ${#files[@]} -eq 0 ]; then
  echo '{"sessions": []}'
  exit 0
fi

jq -s '{sessions: .}' "${files[@]}"
