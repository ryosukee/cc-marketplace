#!/bin/bash
# changelog 要約を保存する API
# 引数: $1 = version, $2 = previous_version
# stdin: 要約テキスト（Markdown）
# stdout: 保存した JSON
# exit 0: 成功, exit 1: 引数エラー, exit 2: 前提条件エラー
set -euo pipefail

VERSION="$1"
PREVIOUS_VERSION="${2:-}"

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
mkdir -p "$CHANGELOGS_DIR"

# stdin から要約テキストを読み取り
SUMMARY=$(cat)

if [ -z "$SUMMARY" ]; then
  echo '{"error": "summary is empty (stdin)"}' >&2
  exit 1
fi

CREATED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# JSON を組み立てて保存
jq -n \
  --arg version "$VERSION" \
  --arg previous_version "$PREVIOUS_VERSION" \
  --arg created_at "$CREATED_AT" \
  --arg summary "$SUMMARY" \
  '{version: $version, previous_version: $previous_version, created_at: $created_at, summary: $summary}' \
  > "$CHANGELOGS_DIR/${VERSION}.json"

# 保存結果を出力
jq -n \
  --arg version "$VERSION" \
  --arg path "$CHANGELOGS_DIR/${VERSION}.json" \
  '{saved: true, version: $version, path: $path}'
