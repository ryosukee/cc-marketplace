#!/bin/bash
# いまのセッションを表す label を project に用意し、その id と名前を JSON で出す
#
# 使い方: ensure-session-label.sh [--session <id>] [--project <project id>]
#   --session  セッション id。省略時は環境変数（PLANE_SESSION_ID / CLAUDE_CODE_SESSION_ID /
#              CLAUDE_SESSION_ID / CODEX_THREAD_ID の順）から取る
#   --project  project id。省略時は repo から引く
# 出力: {"id": ..., "name": "session:YYYY-MM-DD-xxxxxxxx"}
# exit 1 = セッション id が無い、または project が無い。2 = 前提条件エラー

set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
# shellcheck source=lib/plane.sh
source "$PLUGIN_ROOT/scripts/lib/plane.sh"

session=""
project=""
while [ $# -gt 0 ]; do
  case "$1" in
    --session) session="$2"; shift 2 ;;
    --project) project="$2"; shift 2 ;;
    *) plane_err "不明な引数: $1"; exit 2 ;;
  esac
done

plane_require_env
session=$(plane_session_id "$session")
if [ -z "$session" ]; then
  plane_err "セッション id が無い。--session で渡すか、CLAUDE_CODE_SESSION_ID / CODEX_THREAD_ID を環境に置く"
  exit 1
fi
project="${project:-$(plane_project_id)}" || exit 1
label_name=$(plane_session_label_name "$session")
id=$(plane_label_id_or_create "$project" "$label_name") || exit 1
jq -n --arg id "$id" --arg n "$label_name" '{id: $id, name: $n}'
