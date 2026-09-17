#!/bin/bash
# plane-kanban-setup のスクリプトが source する共通ヘルパ。セットアップに要る部分だけを持つ
#
# API key は macOS の Keychain（service plane-kanban-api-key）から読み、stdout・stderr に出さない
# repo が使う workspace と project は、repo の git の設定（git config --local）に対で書く
#   plane-kanban.workspaceSlug  workspace の slug
#   plane-kanban.projectId      project の id
#
# 任意の環境変数
#   PLANE_API_BASE  既定 https://api.plane.so/api/v1

set -euo pipefail

SETUP_API_BASE="${PLANE_API_BASE:-https://api.plane.so/api/v1}"
SETUP_KEYCHAIN_SERVICE="plane-kanban-api-key"
SETUP_GIT_CONFIG_WORKSPACE="plane-kanban.workspaceSlug"
SETUP_GIT_CONFIG_PROJECT="plane-kanban.projectId"

setup_err() {
  echo "plane-kanban-setup: $*" >&2
}

# curl・jq・security と Keychain の API key を確かめ、API key を SETUP_API_KEY に持つ。足りなければ exit 2
setup_require_env() {
  local cmd
  for cmd in curl jq security; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
      setup_err "$cmd が無い"
      exit 2
    fi
  done
  if ! SETUP_API_KEY=$(security find-generic-password -s "$SETUP_KEYCHAIN_SERVICE" -w 2>/dev/null) || [ -z "$SETUP_API_KEY" ]; then
    setup_err "Keychain に service '${SETUP_KEYCHAIN_SERVICE}' が無いか読めない"
    exit 2
  fi
}

# cwd が git の作業ツリーの中かを確かめる。外なら exit 2
setup_require_git() {
  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    setup_err "git の作業ツリーの外で実行された。セットアップする repo の作業ツリーの中で実行する"
    exit 2
  fi
}

# repo の名前。worktree の中でも、元の repo のディレクトリ名を返す（git の共通ディレクトリの親の名前）
setup_repo_name() {
  local common
  common=$(git rev-parse --path-format=absolute --git-common-dir) || return $?
  basename "$(dirname "$common")"
}

# API を 1 回呼ぶ。2xx 以外は stderr に body を出して return 1
# 引数: $1 = workspace の slug, $2 = メソッド, $3 = パス（先頭の / を含む）, $4 = JSON body（任意）
setup_api() {
  local workspace="$1" method="$2" path="$3" body="${4:-}"
  local url="${SETUP_API_BASE}/workspaces/${workspace}${path}"
  local out code
  out=$(mktemp)
  if [ -n "$body" ]; then
    code=$(curl -sS -X "$method" "$url" -H "X-API-Key: ${SETUP_API_KEY}" -H "Content-Type: application/json" \
      -D /dev/null -o "$out" -w '%{http_code}' --data "$body") || { rm -f "$out"; return 1; }
  else
    code=$(curl -sS -X "$method" "$url" -H "X-API-Key: ${SETUP_API_KEY}" \
      -D /dev/null -o "$out" -w '%{http_code}') || { rm -f "$out"; return 1; }
  fi
  case "$code" in
    2*)
      cat "$out"
      rm -f "$out"
      ;;
    *)
      setup_err "HTTP $code: $method $path"
      cat "$out" >&2
      echo >&2
      rm -f "$out"
      return 1
      ;;
  esac
}

# workspace の project を、ページを辿って全件 JSON の配列で出す。引数: $1 = workspace の slug
setup_list_projects() {
  local workspace="$1" cursor="" page all
  all='[]'
  while :; do
    if [ -n "$cursor" ]; then
      page=$(setup_api "$workspace" GET "/projects/?per_page=100&cursor=${cursor}") || return 1
    else
      page=$(setup_api "$workspace" GET "/projects/?per_page=100") || return 1
    fi
    all=$(jq -n --argjson a "$all" --argjson p "$page" '$a + ($p.results // [])')
    if [ "$(jq -r '.next_page_results // false' <<<"$page")" != "true" ]; then
      break
    fi
    cursor=$(jq -r '.next_cursor' <<<"$page")
    { [ -z "$cursor" ] || [ "$cursor" = "null" ]; } && break
  done
  echo "$all"
}

# repo の git の設定に、workspace の slug と project の id を対で書く。引数: $1 = slug, $2 = project id
setup_save_repo_config() {
  git config --local "$SETUP_GIT_CONFIG_WORKSPACE" "$1"
  git config --local "$SETUP_GIT_CONFIG_PROJECT" "$2"
}
