#!/bin/bash
# SessionStart hook: バージョンチェック & additionalContext 注入
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"

# shellcheck source=../lib/resolve-last-version.sh
source "$PLUGIN_ROOT/scripts/lib/resolve-last-version.sh"

# 現在のバージョンを取得
CURRENT_VERSION=$(claude --version 2>/dev/null | awk '{print $1}')
if [ -z "$CURRENT_VERSION" ]; then
  exit 0
fi

# 前回バージョンを解決
CLAUDE_PLUGIN_ROOT="$PLUGIN_ROOT" resolve_last_version

VERSION_FILE="$PLUGIN_ROOT/internal/version/last-version"

# 初回実行時
if [ -z "$LAST_VERSION" ]; then
  mkdir -p "$(dirname "$VERSION_FILE")"
  echo "$CURRENT_VERSION" > "$VERSION_FILE"
  exit 0
fi

# バージョンが同じなら何もしない
if [ "$CURRENT_VERSION" = "$LAST_VERSION" ]; then
  exit 0
fi

# バージョンが変わっている → systemMessage で通知 + additionalContext を注入
cat <<EOF
{
  "systemMessage": "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⚡ Claude Code v${LAST_VERSION} → v${CURRENT_VERSION}\n→ /version-check:check で changelog を確認\n→ /release-notes で公式リリースノートを確認\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "{\"trigger\":\"version-check:check\",\"has_update\":true,\"current_version\":\"${CURRENT_VERSION}\",\"last_version\":\"${LAST_VERSION}\"}"
  }
}
EOF
