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
# 確認待ちの work item を置く state。既定の 5 つに加えて setup が足す
SETUP_NEEDS_INPUT_STATE="Needs Input"
SETUP_NEEDS_INPUT_COLOR="#8B5CF6"

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

# 一覧 API をページを辿って全件 JSON の配列で出す。引数: $1 = workspace の slug, $2 = パス（query 無し）
setup_get_all() {
  local workspace="$1" path="$2" cursor="" page all
  all='[]'
  while :; do
    if [ -n "$cursor" ]; then
      page=$(setup_api "$workspace" GET "${path}?per_page=100&cursor=${cursor}") || return 1
    else
      page=$(setup_api "$workspace" GET "${path}?per_page=100") || return 1
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

# workspace の project を全件 JSON の配列で出す。引数: $1 = workspace の slug
setup_list_projects() {
  setup_get_all "$1" "/projects/"
}

# project に Needs Input の state（group started）が無ければ作り、board の列で In Progress と Done の間に並べる
# 引数: $1 = workspace の slug, $2 = project id
# 出力: {"name", "id", "created": true|false, "placed": true|false|null}。placed は作ったときだけ、間へ動かせたか
setup_ensure_needs_input_state() {
  local workspace="$1" project="$2" states existing body created id seq placed
  states=$(setup_get_all "$workspace" "/projects/${project}/states/") || return 1
  existing=$(jq -c --arg n "$SETUP_NEEDS_INPUT_STATE" '[.[] | select(.name == $n)] | first // empty' <<<"$states")
  if [ -n "$existing" ]; then
    jq -c '{name: .name, id: .id, created: false, placed: null}' <<<"$existing"
    return 0
  fi
  body=$(jq -n --arg n "$SETUP_NEEDS_INPUT_STATE" --arg c "$SETUP_NEEDS_INPUT_COLOR" '{name: $n, color: $c, group: "started"}')
  created=$(setup_api "$workspace" POST "/projects/${project}/states/" "$body") || return 1
  id=$(jq -r '.id' <<<"$created")
  # 作成の API は sequence を既存の最大値 + 15000 にするので、作った state は列の末尾に並ぶ
  seq=$(jq -r '(map(select(.name == "In Progress")) | first | .sequence) as $a
    | (map(select(.name == "Done")) | first | .sequence) as $b
    | if ($a | type) == "number" and ($b | type) == "number" and $a < $b then (($a + $b) / 2 | floor) else empty end' <<<"$states")
  if [ -n "$seq" ] && setup_api "$workspace" PATCH "/projects/${project}/states/${id}/" "{\"sequence\": ${seq}}" >/dev/null; then
    placed=true
  else
    setup_err "Needs Input を In Progress と Done の間へ動かせなかった。board の列の末尾に並んでいる"
    placed=false
  fi
  jq -c --argjson p "$placed" '{name: .name, id: .id, created: true, placed: $p}' <<<"$created"
}

# repo の git の設定に、workspace の slug と project の id を対で書く。引数: $1 = slug, $2 = project id
setup_save_repo_config() {
  git config --local "$SETUP_GIT_CONFIG_WORKSPACE" "$1"
  git config --local "$SETUP_GIT_CONFIG_PROJECT" "$2"
}
