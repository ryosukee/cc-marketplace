#!/bin/bash
# work item を更新する。state の変更と、いまのセッションの label の追加が主な用途
#
# 使い方: update-work-item.sh <work item id> [--state <名前>] [--name <題名>] [--parent <id> | --no-parent]
#                             [--description-file <path>] [--label <名前>]...
#                             [--session <id> | --no-session] [--project <project id>]
#   --session   セッション id。省略時は環境変数から取る。label は既存に足す（置き換えない）。
#               --no-session で session の label を触らない
# 出力: {"id","sequence_id","name","state","labels":[名前],"parent"}
# exit 1 = project か work item が無い、2 = 前提条件エラー

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/plane.sh
source "$SCRIPT_DIR/lib/plane.sh"

if [ $# -lt 1 ] || [ "${1#--}" != "$1" ]; then
  plane_err "先頭に work item id が要る"
  exit 2
fi
item_id="$1"; shift

state=""
name=""
parent=""
no_parent=0
desc_file=""
labels_extra=()
session=""
no_session=0
project=""
while [ $# -gt 0 ]; do
  case "$1" in
    --state) state="$2"; shift 2 ;;
    --name) name="$2"; shift 2 ;;
    --parent) parent="$2"; shift 2 ;;
    --no-parent) no_parent=1; shift ;;
    --description-file) desc_file="$2"; shift 2 ;;
    --label) labels_extra+=("$2"); shift 2 ;;
    --session) session="$2"; shift 2 ;;
    --no-session) no_session=1; shift ;;
    --project) project="$2"; shift 2 ;;
    *) plane_err "不明な引数: $1"; exit 2 ;;
  esac
done

plane_require_env
plane_load_workspace || exit 1
project="${project:-$(plane_project_id)}" || exit 1

current=$(plane_api GET "/projects/${project}/work-items/${item_id}/") || exit 1
# work item 1 件の GET は label をオブジェクトで返すが、PATCH は label の id しか受け付けない
label_ids=$(jq -c '(.labels // .label_ids // []) | map(if type == "object" then .id else . end)' <<<"$current")

if [ "$no_session" -eq 0 ]; then
  sid=$(plane_session_id "$session")
  if [ -n "$sid" ]; then
    lid=$(plane_label_id_or_create "$project" "$(plane_session_label_name "$sid")") || exit 1
    label_ids=$(jq -c --arg l "$lid" 'if index($l) then . else . + [$l] end' <<<"$label_ids")
  fi
fi
for ln in "${labels_extra[@]+"${labels_extra[@]}"}"; do
  lid=$(plane_label_id_or_create "$project" "$ln") || exit 1
  label_ids=$(jq -c --arg l "$lid" 'if index($l) then . else . + [$l] end' <<<"$label_ids")
done

body=$(jq -n --argjson l "$label_ids" '{labels: $l}')
if [ -n "$state" ]; then
  state_id=$(plane_state_id "$project" "$state") || exit 1
  body=$(jq -c --arg s "$state_id" '.state = $s' <<<"$body")
fi
[ -n "$name" ] && body=$(jq -c --arg n "$name" '.name = $n' <<<"$body")
[ -n "$parent" ] && body=$(jq -c --arg p "$parent" '.parent = $p' <<<"$body")
[ "$no_parent" -eq 1 ] && body=$(jq -c '.parent = null' <<<"$body")
if [ -n "$desc_file" ]; then
  [ -f "$desc_file" ] || { plane_err "ファイルが無い: $desc_file"; exit 2; }
  html=$(plane_html_from_text < "$desc_file")
  body=$(jq -c --argjson h "$html" '.description_html = $h' <<<"$body")
fi

updated=$(plane_api PATCH "/projects/${project}/work-items/${item_id}/" "$body") || exit 1
states=$(plane_states "$project") || exit 1
labels=$(plane_labels "$project") || exit 1
jq -c --argjson states "$states" --argjson labels "$labels" '
  ($states | map({key: .id, value: .name}) | from_entries) as $sm
  | ($labels | map({key: .id, value: .name}) | from_entries) as $lm
  | {
      id: .id,
      sequence_id: .sequence_id,
      name: .name,
      state: ($sm[(.state // .state_id)] // (.state // .state_id)),
      labels: ((.labels // .label_ids // []) | map($lm[.] // .)),
      parent: .parent
    }' <<<"$updated"
