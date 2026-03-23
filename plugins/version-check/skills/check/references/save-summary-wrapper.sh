#!/bin/bash
# SKILL.md から呼ばれるラッパー
# 引数: $1 = version, $2 = previous_version
# stdin: 要約テキスト
set -euo pipefail

VERSION="$1"
PREVIOUS_VERSION="${2:-}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# references/ → check/ → skills/ → version-check/ (plugin root)
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

CLAUDE_PLUGIN_ROOT="$PLUGIN_ROOT" exec bash "$PLUGIN_ROOT/scripts/api/save-changelog-summary.sh" "$VERSION" "$PREVIOUS_VERSION"
