#!/bin/bash
# いまの repo に対応する Plane の project を引き、id と identifier を JSON で出す
#
# 使い方: resolve-project.sh [repo 名]
# 出力: {"name": ..., "id": ..., "identifier": ...}
# exit 1 = 対応する project が無い（init-project.sh で作れる）、2 = 前提条件エラー

set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
# shellcheck source=lib/plane.sh
source "$PLUGIN_ROOT/scripts/lib/plane.sh"

plane_require_env
name="${1:-$(plane_repo_name)}"
id=$(plane_project_id "$name") || exit 1
file="$(plane_data_dir)/projects.json"
jq -c --arg k "${PLANE_WORKSPACE_SLUG}/${name}" --arg n "$name" --arg id "$id" \
  '{name: $n, id: $id, identifier: (.[$k].identifier // null)}' "$file"
