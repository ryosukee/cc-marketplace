#!/bin/bash
# いまの repo に設定された Plane の workspace と project を、repo の git の設定から引いて JSON で出す
#
# 使い方: resolve-project.sh
# 出力: {"workspace": ..., "id": ..., "name": ..., "identifier": ...}
# exit 1 = workspace と project が設定されていないか、設定された project を読めない、2 = 前提条件エラー

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/setup.sh
source "$SCRIPT_DIR/lib/setup.sh"

setup_require_env
setup_require_git

workspace=$(git config --local --get "$SETUP_GIT_CONFIG_WORKSPACE" || true)
id=$(git config --local --get "$SETUP_GIT_CONFIG_PROJECT" || true)
if [ -z "$workspace" ] || [ -z "$id" ]; then
  setup_err "この repo に Plane の workspace と project が設定されていない。init-project.sh --workspace <slug> で設定する"
  exit 1
fi
if ! project=$(setup_api "$workspace" GET "/projects/${id}/"); then
  setup_err "git の設定の project（${id}）を workspace '${workspace}' から読めない。git config --local --remove-section plane-kanban で消してから init-project.sh で設定し直す"
  exit 1
fi
jq -c --arg w "$workspace" '{workspace: $w, id: .id, name: .name, identifier: .identifier}' <<<"$project"
