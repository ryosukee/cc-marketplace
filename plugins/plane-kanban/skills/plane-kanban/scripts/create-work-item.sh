#!/bin/bash
# いまの repo の project に work item を 1 件作る。いまのセッションの label を付ける
#
# 使い方: create-work-item.sh --name <題名> [--description-file <path> | --description <text>]
#                             [--parent <work item id>] [--state <名前>] [--label <名前>]...
#                             [--session <id> | --no-session] [--project <project id>]
#   --description-file  プレーンテキストのファイル。空行で段落を分ける。description_html に変換して送る
#   --state             省略時は project の既定の state（Backlog）
#   --session           セッション id。省略時は環境変数から取る。--no-session で label を付けない
# 出力: {"id","sequence_id","name","state","labels":[名前],"parent"}
# exit 1 = project が無い、2 = 前提条件エラー

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/plane.sh
source "$SCRIPT_DIR/lib/plane.sh"

name=""
desc=""
desc_file=""
parent=""
state=""
labels_extra=()
session=""
no_session=0
project=""
while [ $# -gt 0 ]; do
  case "$1" in
    --name) name="$2"; shift 2 ;;
    --description) desc="$2"; shift 2 ;;
    --description-file) desc_file="$2"; shift 2 ;;
    --parent) parent="$2"; shift 2 ;;
    --state) state="$2"; shift 2 ;;
    --label) labels_extra+=("$2"); shift 2 ;;
    --session) session="$2"; shift 2 ;;
    --no-session) no_session=1; shift ;;
    --project) project="$2"; shift 2 ;;
    *) plane_err "不明な引数: $1"; exit 2 ;;
  esac
done
if [ -z "$name" ]; then
  plane_err "--name が要る"
  exit 2
fi
if [ -n "$desc_file" ]; then
  [ -f "$desc_file" ] || { plane_err "ファイルが無い: $desc_file"; exit 2; }
  desc=$(cat "$desc_file")
fi

plane_require_env
plane_load_workspace || exit 1
project="${project:-$(plane_project_id)}" || exit 1

label_ids='[]'
if [ "$no_session" -eq 0 ]; then
  sid=$(plane_session_id "$session")
  if [ -n "$sid" ]; then
    lid=$(plane_label_id_or_create "$project" "$(plane_session_label_name "$sid")") || exit 1
    label_ids=$(jq -c --arg l "$lid" '. + [$l]' <<<"$label_ids")
  else
    plane_err "セッション id が無いので session の label を付けない"
  fi
fi
for ln in "${labels_extra[@]+"${labels_extra[@]}"}"; do
  lid=$(plane_label_id_or_create "$project" "$ln") || exit 1
  label_ids=$(jq -c --arg l "$lid" '. + [$l]' <<<"$label_ids")
done

body=$(jq -n --arg n "$name" '{name: $n}')
if [ -n "$desc" ]; then
  html=$(printf '%s' "$desc" | plane_html_from_text)
  body=$(jq -c --argjson h "$html" '.description_html = $h' <<<"$body")
fi
if [ -n "$parent" ]; then
  body=$(jq -c --arg p "$parent" '.parent = $p' <<<"$body")
fi
if [ -n "$state" ]; then
  state_id=$(plane_state_id "$project" "$state") || exit 1
  body=$(jq -c --arg s "$state_id" '.state = $s' <<<"$body")
fi
if [ "$(jq 'length' <<<"$label_ids")" -gt 0 ]; then
  body=$(jq -c --argjson l "$label_ids" '.labels = $l' <<<"$body")
fi

created=$(plane_api POST "/projects/${project}/work-items/" "$body") || exit 1
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
    }' <<<"$created"
