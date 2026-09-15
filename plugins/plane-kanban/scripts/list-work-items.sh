#!/bin/bash
# いまの repo の project の work item を一覧する。絞り込みは取得後にこのスクリプトが行う
#
# 使い方: list-work-items.sh [--state <名前>]... [--label <名前>] [--session <id>] [--parent <work item id>] [--all]
#   --state    state 名で絞る（複数可）。省略時は Done と Cancelled を除く
#   --all      Done と Cancelled も出す
#   --label    label 名で絞る
#   --session  そのセッションの label が付いたものだけ出す。値を省くと環境変数から取る
#   --parent   その work item の sub work item だけ出す
#   --project  project id。省略時は repo から引く
# 出力: [{"id","sequence_id","name","state","labels":[名前],"parent","sub_work_items","updated_at"}]
# exit 1 = project が無い、2 = 前提条件エラー

set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
# shellcheck source=lib/plane.sh
source "$PLUGIN_ROOT/scripts/lib/plane.sh"

states_filter='[]'
label_filter=""
session=""
use_session=0
parent_filter=""
project=""
all=0
while [ $# -gt 0 ]; do
  case "$1" in
    --state) states_filter=$(jq -c --arg s "$2" '. + [$s]' <<<"$states_filter"); shift 2 ;;
    --all) all=1; shift ;;
    --label) label_filter="$2"; shift 2 ;;
    --session)
      use_session=1
      if [ $# -ge 2 ] && [ "${2#--}" = "$2" ]; then session="$2"; shift 2; else shift; fi
      ;;
    --parent) parent_filter="$2"; shift 2 ;;
    --project) project="$2"; shift 2 ;;
    *) plane_err "不明な引数: $1"; exit 2 ;;
  esac
done

plane_require_env
project="${project:-$(plane_project_id)}" || exit 1

if [ "$use_session" -eq 1 ]; then
  sid=$(plane_session_id "$session")
  if [ -z "$sid" ]; then
    plane_err "セッション id が無い。--session <id> で渡す"
    exit 1
  fi
  label_filter=$(plane_session_label_name "$sid")
fi

states=$(plane_states "$project") || exit 1
labels=$(plane_labels "$project") || exit 1
items=$(plane_get_all "/projects/${project}/work-items/") || exit 1

jq -c --argjson states "$states" --argjson labels "$labels" \
  --argjson state_filter "$states_filter" --arg label_filter "$label_filter" \
  --arg parent_filter "$parent_filter" --argjson all "$all" '
  ($states | map({key: .id, value: {name: .name, group: .group}}) | from_entries) as $sm
  | ($labels | map({key: .id, value: .name}) | from_entries) as $lm
  | map(
      (.state // .state_id) as $sid
      | ((.labels // .label_ids // []) | map($lm[.] // .)) as $lnames
      | {
          id: .id,
          sequence_id: .sequence_id,
          name: .name,
          state: ($sm[$sid].name // $sid),
          state_group: (($sm[$sid].group // "") | ascii_downcase),
          labels: $lnames,
          parent: .parent,
          sub_work_items: (.sub_issues_count // 0),
          updated_at: .updated_at
        })
  | map(select(
      (($state_filter | length) == 0 or (.state as $s | $state_filter | index($s) != null))
      and ($all == 1 or ($state_filter | length) > 0 or (.state_group != "completed" and .state_group != "cancelled"))
      and ($label_filter == "" or (.labels | index($label_filter) != null))
      and ($parent_filter == "" or .parent == $parent_filter)
    ))
  | sort_by(.sequence_id)
' <<<"$items"
