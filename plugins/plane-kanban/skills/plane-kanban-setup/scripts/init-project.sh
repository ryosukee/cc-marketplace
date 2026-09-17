#!/bin/bash
# いまの repo に Plane の workspace と project を対応させ、repo の git の設定
# （plane-kanban.workspaceSlug と plane-kanban.projectId）に対で書く
# 既に設定されていれば project はそのまま使う。workspace に同じ name の project があればそれを使い、無ければ作る
# どの場合も、project に Needs Input の state が無ければ足す
#
# 使い方: init-project.sh [--workspace <slug>] [--name <project の name>] [--identifier <IDENT>]
#   --workspace   workspace の slug（https://app.plane.so/{slug}/ の部分）。未設定の repo では必須
#   --name        project の name。省略時は repo のディレクトリ名（worktree の中でも元の repo の名前）
#   --identifier  work item の番号の接頭辞（例: CCM）。project を新しく作るときだけ要る
# 出力: {"workspace": ..., "id": ..., "name": ..., "identifier": ..., "created": true|false,
#        "needs_input_state": {"name", "id", "created": true|false, "placed": true|false|null}}
# exit 1 = API の呼び出しに失敗、2 = 前提条件エラー（git の作業ツリーの外、--workspace が無い、作るのに --identifier が無い）

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/setup.sh
source "$SCRIPT_DIR/lib/setup.sh"

workspace=""
identifier=""
name=""
while [ $# -gt 0 ]; do
  case "$1" in
    --workspace) workspace="$2"; shift 2 ;;
    --identifier) identifier="$2"; shift 2 ;;
    --name) name="$2"; shift 2 ;;
    *) setup_err "不明な引数: $1"; exit 2 ;;
  esac
done

setup_require_env
setup_require_git

existing_workspace=$(git config --local --get "$SETUP_GIT_CONFIG_WORKSPACE" || true)
existing_project=$(git config --local --get "$SETUP_GIT_CONFIG_PROJECT" || true)
if [ -n "$existing_workspace" ] && [ -n "$existing_project" ]; then
  if [ -n "$workspace" ] && [ "$workspace" != "$existing_workspace" ]; then
    setup_err "この repo には workspace '${existing_workspace}' が設定済み。変えるなら git config --local --remove-section plane-kanban で消してから実行し直す"
    exit 2
  fi
  workspace="$existing_workspace"
  if ! project=$(setup_api "$workspace" GET "/projects/${existing_project}/"); then
    setup_err "git の設定の project（${existing_project}）を読めない。git config --local --remove-section plane-kanban で消してから実行し直す"
    exit 1
  fi
  project_created=false
else
  if [ -z "$workspace" ]; then
    setup_err "--workspace が要る（https://app.plane.so/{slug}/ の slug）"
    exit 2
  fi
  name="${name:-$(setup_repo_name)}"
  projects=$(setup_list_projects "$workspace") || exit 1
  project=$(jq -c --arg n "$name" '[.[] | select(.name == $n)] | first // empty' <<<"$projects")
  if [ -n "$project" ]; then
    project_created=false
  else
    if [ -z "$identifier" ]; then
      setup_err "workspace '${workspace}' に name が '${name}' の project が無い。作るには --identifier が要る（work item の番号の接頭辞。例: CCM）"
      exit 2
    fi
    body=$(jq -n --arg n "$name" --arg i "$identifier" '{name: $n, identifier: $i}')
    project=$(setup_api "$workspace" POST "/projects/" "$body") || exit 1
    project_created=true
  fi
  setup_save_repo_config "$workspace" "$(jq -r '.id' <<<"$project")"
fi

state=$(setup_ensure_needs_input_state "$workspace" "$(jq -r '.id' <<<"$project")") || exit 1
jq -c --arg w "$workspace" --argjson c "$project_created" --argjson s "$state" \
  '{workspace: $w, id: .id, name: .name, identifier: .identifier, created: $c, needs_input_state: $s}' <<<"$project"
