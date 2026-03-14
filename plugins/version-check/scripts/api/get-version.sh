#!/bin/bash
# 現在の Claude Code バージョンを取得する API
# stdout: JSON {"current_version": "X.Y.Z"}
# exit 0: 成功, exit 1: 取得失敗
set -euo pipefail

CURRENT_VERSION=$(claude --version 2>/dev/null | awk '{print $1}')

if [ -z "$CURRENT_VERSION" ]; then
  echo '{"current_version": ""}' >&2
  exit 1
fi

echo "{\"current_version\": \"${CURRENT_VERSION}\"}"
