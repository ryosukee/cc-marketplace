#!/bin/bash
# バージョンを記録する
# 引数: $1 = 記録するバージョン
set -euo pipefail

VERSION="${1:-}"
if [ -z "$VERSION" ]; then
  echo "Usage: $0 VERSION" >&2
  exit 1
fi

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
VERSION_FILE="$PLUGIN_ROOT/internal/version/last-version"

mkdir -p "$(dirname "$VERSION_FILE")"
echo "$VERSION" > "$VERSION_FILE"
