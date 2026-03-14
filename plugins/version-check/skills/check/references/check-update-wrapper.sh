#!/bin/bash
# SKILL.md から呼ばれるラッパー
# CLAUDE_PLUGIN_ROOT を使って api/check-update.sh を実行する
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# references/ → check/ → skills/ → version-check/ (plugin root)
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

CLAUDE_PLUGIN_ROOT="$PLUGIN_ROOT" exec bash "$PLUGIN_ROOT/scripts/api/check-update.sh"
