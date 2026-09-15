#!/bin/bash
# 取り込み一覧のファイルから work item を 1 件ずつ作る。作った id を一覧に書き戻し、再実行では作成済みを飛ばす
#
# 使い方: import-work-items.sh <一覧.json> [--session <id> | --no-session] [--project <project id>]
#
# 一覧の書式:
#   {"items": [
#     {"key": "epic-1", "name": "題名", "description": "本文（空行で段落）", "parent_key": null, "state": "Backlog", "id": null},
#     {"key": "t-1",    "name": "題名", "description": "...", "parent_key": "epic-1", "id": null}
#   ]}
#   key は一覧の中で一意。parent_key はその親の key で、親は一覧の中で先に並べる（先に作られる）。
#   parent_id を直接書いてもよい（既にある work item を親にするとき）。
#   id が入っている行は作成済みとして飛ばす。state を省くと project の既定（Backlog）
# 出力: {"created": n, "skipped": n, "failed": n}。失敗した行は stderr に出し、そこで止まる
# exit 1 = 途中で失敗、2 = 前提条件エラー

set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
# shellcheck source=lib/plane.sh
source "$PLUGIN_ROOT/scripts/lib/plane.sh"

if [ $# -lt 1 ] || [ ! -f "$1" ]; then
  plane_err "一覧の JSON ファイルを先頭に渡す"
  exit 2
fi
manifest="$1"; shift
session=""
no_session=0
project=""
while [ $# -gt 0 ]; do
  case "$1" in
    --session) session="$2"; shift 2 ;;
    --no-session) no_session=1; shift ;;
    --project) project="$2"; shift 2 ;;
    *) plane_err "不明な引数: $1"; exit 2 ;;
  esac
done

plane_require_env
project="${project:-$(plane_project_id)}" || exit 1
jq -e '.items | type == "array"' "$manifest" >/dev/null || { plane_err "一覧に items の配列が無い"; exit 2; }

session_args=()
if [ "$no_session" -eq 1 ]; then
  session_args+=(--no-session)
elif [ -n "$session" ]; then
  session_args+=(--session "$session")
fi

count=$(jq '.items | length' "$manifest")
created=0
skipped=0
i=0
while [ "$i" -lt "$count" ]; do
  item=$(jq -c ".items[$i]" "$manifest")
  key=$(jq -r '.key' <<<"$item")
  if [ "$(jq -r '.id // empty' <<<"$item")" != "" ]; then
    skipped=$((skipped + 1))
    i=$((i + 1))
    continue
  fi
  parent_id=$(jq -r '.parent_id // empty' <<<"$item")
  parent_key=$(jq -r '.parent_key // empty' <<<"$item")
  if [ -z "$parent_id" ] && [ -n "$parent_key" ]; then
    parent_id=$(jq -r --arg k "$parent_key" '[.items[] | select(.key == $k)] | first | .id // empty' "$manifest")
    if [ -z "$parent_id" ]; then
      plane_err "行 ${i}（key=${key}）: 親 '$parent_key' の id がまだ無い。親を先に並べる"
      jq -n --argjson c "$created" --argjson s "$skipped" '{created: $c, skipped: $s, failed: 1}'
      exit 1
    fi
  fi
  args=(--name "$(jq -r '.name' <<<"$item")" --project "$project")
  desc=$(jq -r '.description // empty' <<<"$item")
  if [ -n "$desc" ]; then
    desc_file=$(mktemp)
    printf '%s' "$desc" > "$desc_file"
    args+=(--description-file "$desc_file")
  fi
  [ -n "$parent_id" ] && args+=(--parent "$parent_id")
  state=$(jq -r '.state // empty' <<<"$item")
  [ -n "$state" ] && args+=(--state "$state")
  if ! result=$("$PLUGIN_ROOT/scripts/create-work-item.sh" "${args[@]}" "${session_args[@]+"${session_args[@]}"}"); then
    plane_err "行 ${i}（key=${key}）の作成に失敗。ここまでの id は一覧に書き戻してある"
    jq -n --argjson c "$created" --argjson s "$skipped" '{created: $c, skipped: $s, failed: 1}'
    exit 1
  fi
  new_id=$(jq -r '.id' <<<"$result")
  tmp=$(mktemp)
  jq --argjson i "$i" --arg id "$new_id" '.items[$i].id = $id' "$manifest" > "$tmp" && mv "$tmp" "$manifest"
  created=$((created + 1))
  i=$((i + 1))
done
jq -n --argjson c "$created" --argjson s "$skipped" '{created: $c, skipped: $s, failed: 0}'
