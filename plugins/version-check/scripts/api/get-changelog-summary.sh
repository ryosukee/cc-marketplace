#!/bin/bash
# 指定バージョンの changelog 要約を返す API
# 引数: $1 = version
# stdout: JSON（summary フィールド含む）
# exit 0: 成功, exit 1: 該当なし
set -euo pipefail

VERSION="$1"

if [ -z "$VERSION" ]; then
  echo '{"error": "version is required"}' >&2
  exit 1
fi

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"

# shellcheck source=../lib/resolve-changelogs.sh
source "$PLUGIN_ROOT/scripts/lib/resolve-changelogs.sh"

# マイグレーション実行（初回のみ実効）
CLAUDE_PLUGIN_ROOT="$PLUGIN_ROOT" resolve_changelogs

CHANGELOGS_DIR="$PLUGIN_ROOT/internal/changelogs"
TARGET="$CHANGELOGS_DIR/${VERSION}.json"

if [ ! -f "$TARGET" ]; then
  jq -n --arg v "$VERSION" '{"error": ("no summary found for version " + $v)}' >&2
  exit 1
fi

cat "$TARGET"
