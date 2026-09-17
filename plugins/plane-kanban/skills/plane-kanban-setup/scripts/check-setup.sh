#!/bin/bash
# plane-kanban を使う前提のうち、足りないものを確かめて JSON で出す。API key の値は読まない
#
# 使い方: check-setup.sh（セットアップする repo の作業ツリーの中で実行する）
# 出力: {"macos": bool, "curl": bool, "jq": bool, "api_key": bool, "git_worktree": bool,
#        "workspace": "<slug>"|null, "project": "<id>"|null, "ready": bool}
# exit 0 = すべて揃っている、1 = 足りないものがある

set -euo pipefail

has_command() {
  if command -v "$1" >/dev/null 2>&1; then echo true; else echo false; fi
}

json_string_or_null() {
  if [ -n "$1" ]; then printf '"%s"' "$1"; else printf 'null'; fi
}

macos=false
[ "$(uname -s)" = "Darwin" ] && macos=true
curl_ok=$(has_command curl)
jq_ok=$(has_command jq)

api_key=false
if [ "$(has_command security)" = true ] && security find-generic-password -s plane-kanban-api-key >/dev/null 2>&1; then
  api_key=true
fi

git_worktree=false
workspace=""
project=""
if git rev-parse --git-dir >/dev/null 2>&1; then
  git_worktree=true
  workspace=$(git config --local --get plane-kanban.workspaceSlug || true)
  project=$(git config --local --get plane-kanban.projectId || true)
fi

ready=false
if [ "$macos" = true ] && [ "$curl_ok" = true ] && [ "$jq_ok" = true ] && [ "$api_key" = true ] \
  && [ "$git_worktree" = true ] && [ -n "$workspace" ] && [ -n "$project" ]; then
  ready=true
fi

printf '{"macos": %s, "curl": %s, "jq": %s, "api_key": %s, "git_worktree": %s, "workspace": %s, "project": %s, "ready": %s}\n' \
  "$macos" "$curl_ok" "$jq_ok" "$api_key" "$git_worktree" \
  "$(json_string_or_null "$workspace")" "$(json_string_or_null "$project")" "$ready"

[ "$ready" = true ]
