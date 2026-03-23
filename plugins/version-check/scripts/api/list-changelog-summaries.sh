#!/bin/bash
# 保存済み changelog 要約の一覧を返す API
# 引数: なし（オプション: $1 = limit, デフォルト全件）
# stdout: JSON 配列（新しい順）[{"version":"...","previous_version":"...","created_at":"..."}]
# exit 0: 成功（0 件でも空配列）
set -euo pipefail

LIMIT="${1:-0}"

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"

# shellcheck source=../lib/resolve-changelogs.sh
source "$PLUGIN_ROOT/scripts/lib/resolve-changelogs.sh"

# マイグレーション実行（初回のみ実効）
CLAUDE_PLUGIN_ROOT="$PLUGIN_ROOT" resolve_changelogs

CHANGELOGS_DIR="$PLUGIN_ROOT/internal/changelogs"

if [ ! -d "$CHANGELOGS_DIR" ]; then
  echo '[]'
  exit 0
fi

# 各 JSON からメタデータを抽出し、created_at の降順でソート
RESULT=$(
  for f in "$CHANGELOGS_DIR"/*.json; do
    [ -f "$f" ] || continue
    jq '{version, previous_version, created_at}' "$f" 2>/dev/null
  done | jq -s 'sort_by(.created_at) | reverse'
)

if [ -z "$RESULT" ]; then
  echo '[]'
  exit 0
fi

if [ "$LIMIT" -gt 0 ] 2>/dev/null; then
  echo "$RESULT" | jq --argjson limit "$LIMIT" '.[:$limit]'
else
  echo "$RESULT"
fi
