#!/bin/bash
# 更新有無チェック API
# stdout: JSON {"has_update": true/false, "current_version": "...", "last_version": "...", "first_run": true/false}
# exit 0: 成功, exit 1: バージョン取得失敗
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"

# shellcheck source=../lib/resolve-last-version.sh
source "$PLUGIN_ROOT/scripts/lib/resolve-last-version.sh"

# 現在のバージョンを取得
CURRENT_VERSION=$(claude --version 2>/dev/null | awk '{print $1}')
if [ -z "$CURRENT_VERSION" ]; then
  echo '{"has_update": false, "current_version": "", "last_version": ""}' >&2
  exit 1
fi

# 前回バージョンを解決
CLAUDE_PLUGIN_ROOT="$PLUGIN_ROOT" resolve_last_version

# 初回実行時
if [ -z "$LAST_VERSION" ]; then
  jq -n --argjson update false --arg cur "$CURRENT_VERSION" --arg last "" --argjson first true \
    '{"has_update": $update, "current_version": $cur, "last_version": $last, "first_run": $first}'
  exit 0
fi

# バージョンが同じ
if [ "$CURRENT_VERSION" = "$LAST_VERSION" ]; then
  jq -n --argjson update false --arg cur "$CURRENT_VERSION" --arg last "$LAST_VERSION" --argjson first false \
    '{"has_update": $update, "current_version": $cur, "last_version": $last, "first_run": $first}'
  exit 0
fi

# バージョンが変わっている
jq -n --argjson update true --arg cur "$CURRENT_VERSION" --arg last "$LAST_VERSION" --argjson first false \
  '{"has_update": $update, "current_version": $cur, "last_version": $last, "first_run": $first}'
