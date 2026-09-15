#!/bin/bash
# いまの repo に対応する Plane の project を作る。既にあれば作らずにその id を返す
#
# 使い方: init-project.sh --identifier <IDENT> [--name <repo 名>]
#   --identifier  work item の番号の接頭辞（例: CCM）。必須
#   --name        project の name。省略時は repo のディレクトリ名
# 出力: {"name": ..., "id": ..., "identifier": ..., "created": true|false}
# exit 2 = 前提条件エラー

set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
# shellcheck source=lib/plane.sh
source "$PLUGIN_ROOT/scripts/lib/plane.sh"

identifier=""
name=""
while [ $# -gt 0 ]; do
  case "$1" in
    --identifier) identifier="$2"; shift 2 ;;
    --name) name="$2"; shift 2 ;;
    *) plane_err "不明な引数: $1"; exit 2 ;;
  esac
done
if [ -z "$identifier" ]; then
  plane_err "--identifier が要る（work item の番号の接頭辞。例: CCM）"
  exit 2
fi

plane_require_env
name="${name:-$(plane_repo_name)}"
key="${PLANE_WORKSPACE_SLUG}/${name}"

if id=$(plane_project_id "$name" 2>/dev/null); then
  file="$(plane_data_dir)/projects.json"
  jq -c --arg k "$key" --arg n "$name" --arg id "$id" \
    '{name: $n, id: $id, identifier: (.[$k].identifier // null), created: false}' "$file"
  exit 0
fi

body=$(jq -n --arg n "$name" --arg i "$identifier" '{name: $n, identifier: $i}')
created=$(plane_api POST "/projects/" "$body") || exit 1
plane_save_project "$key" "$created"
jq -c '{name: .name, id: .id, identifier: .identifier, created: true}' <<<"$created"
