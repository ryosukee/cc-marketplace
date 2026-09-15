#!/bin/bash
# Plane Cloud の REST API を呼ぶ共通ヘルパ。エントリスクリプトが source して使う
#
# 前提の環境変数
#   PLANE_API_KEY        必須。Plane の Personal Access Token
#   PLANE_WORKSPACE_SLUG 必須。workspace の slug（https://app.plane.so/{slug}/ の部分）
#   PLANE_API_BASE       任意。既定 https://api.plane.so/api/v1
#   PLANE_KANBAN_DATA_DIR 任意。repo と project の対応を保存する場所。
#                        無ければ CLAUDE_PLUGIN_DATA、それも無ければ
#                        ~/.claude/plugins/data/plane-kanban-cc-tools
#
# 出力は JSON を stdout、エラーは stderr。exit 0 = 成功、1 = 該当なし、2 = 前提条件エラー

set -euo pipefail

PLANE_API_BASE="${PLANE_API_BASE:-https://api.plane.so/api/v1}"
PLANE_RETRY_MAX="${PLANE_RETRY_MAX:-3}"

plane_err() {
  echo "plane-kanban: $*" >&2
}

# 必須の環境変数を確かめる。無ければ exit 2
plane_require_env() {
  if [ -z "${PLANE_API_KEY:-}" ]; then
    plane_err "PLANE_API_KEY が未設定。Plane の Profile Settings で Personal Access Token を発行し、settings.json の env に置く"
    exit 2
  fi
  if [ -z "${PLANE_WORKSPACE_SLUG:-}" ]; then
    plane_err "PLANE_WORKSPACE_SLUG が未設定。https://app.plane.so/{slug}/ の slug を settings.json の env に置く"
    exit 2
  fi
  for cmd in curl jq; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
      plane_err "$cmd が無い"
      exit 2
    fi
  done
}

# 対応の保存先ディレクトリ。無ければ作る
plane_data_dir() {
  local dir="${PLANE_KANBAN_DATA_DIR:-${CLAUDE_PLUGIN_DATA:-$HOME/.claude/plugins/data/plane-kanban-cc-tools}}"
  mkdir -p "$dir"
  echo "$dir"
}

# API を 1 回呼ぶ。429 のときは X-RateLimit-Reset まで待って PLANE_RETRY_MAX 回まで再試行する
# 引数: $1 = メソッド, $2 = パス（/workspaces/{slug} より後ろ。先頭の / を含む）, $3 = JSON body（任意）
# 出力: レスポンス body。2xx 以外は stderr に body を出して return 1
plane_api() {
  local method="$1" path="$2" body="${3:-}"
  local url="${PLANE_API_BASE}/workspaces/${PLANE_WORKSPACE_SLUG}${path}"
  local attempt=0 code hdr out
  hdr=$(mktemp)
  out=$(mktemp)
  while :; do
    attempt=$((attempt + 1))
    if [ -n "$body" ]; then
      code=$(curl -sS -X "$method" "$url" \
        -H "X-API-Key: ${PLANE_API_KEY}" -H "Content-Type: application/json" \
        -D "$hdr" -o "$out" -w '%{http_code}' --data "$body")
    else
      code=$(curl -sS -X "$method" "$url" \
        -H "X-API-Key: ${PLANE_API_KEY}" \
        -D "$hdr" -o "$out" -w '%{http_code}')
    fi
    case "$code" in
      2*)
        cat "$out"
        rm -f "$hdr" "$out"
        return 0
        ;;
      429)
        if [ "$attempt" -ge "$PLANE_RETRY_MAX" ]; then
          plane_err "429 が $attempt 回続いた: $method $path"
          rm -f "$hdr" "$out"
          return 1
        fi
        local reset now wait
        reset=$(tr -d '\r' < "$hdr" | awk -F': ' 'tolower($1)=="x-ratelimit-reset"{print $2}' | tail -1)
        now=$(date +%s)
        if [ -n "$reset" ] && [ "$reset" -gt "$now" ] 2>/dev/null; then
          wait=$((reset - now + 1))
        else
          wait=10
        fi
        [ "$wait" -gt 70 ] && wait=70
        plane_err "429。${wait} 秒待って再試行する（${attempt}/${PLANE_RETRY_MAX}）"
        sleep "$wait"
        ;;
      *)
        plane_err "HTTP $code: $method $path"
        cat "$out" >&2
        echo >&2
        rm -f "$hdr" "$out"
        return 1
        ;;
    esac
  done
}

# 一覧 API を cursor で最後まで辿り、results を 1 つの JSON 配列にして出す
# 引数: $1 = パス（query 無し）
plane_get_all() {
  local path="$1" cursor="" page all
  all='[]'
  while :; do
    if [ -n "$cursor" ]; then
      page=$(plane_api GET "${path}?per_page=100&cursor=${cursor}") || return 1
    else
      page=$(plane_api GET "${path}?per_page=100") || return 1
    fi
    all=$(jq -n --argjson a "$all" --argjson p "$page" '$a + ($p.results // [])')
    if [ "$(jq -r '.next_page_results // false' <<<"$page")" != "true" ]; then
      break
    fi
    cursor=$(jq -r '.next_cursor' <<<"$page")
    [ -z "$cursor" ] || [ "$cursor" = "null" ] && break
  done
  echo "$all"
}

# いまの repo の名前（git の作業ツリーのディレクトリ名。git 外なら cwd のディレクトリ名）
plane_repo_name() {
  local top
  top=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
  basename "$top"
}

# repo に対応する project id を返す。保存した対応があればそれを、無ければ API の一覧から name で引いて保存する
# 引数: $1 = repo 名（省略時は plane_repo_name）
# 見つからなければ stderr に案内を出して return 1
plane_project_id() {
  local name="${1:-$(plane_repo_name)}"
  local file key id
  file="$(plane_data_dir)/projects.json"
  key="${PLANE_WORKSPACE_SLUG}/${name}"
  if [ -f "$file" ]; then
    id=$(jq -r --arg k "$key" '.[$k].id // empty' "$file")
    if [ -n "$id" ]; then
      echo "$id"
      return 0
    fi
  fi
  local projects entry
  projects=$(plane_get_all "/projects/") || return 1
  entry=$(jq -c --arg n "$name" '[.[] | select(.name == $n)] | first // empty' <<<"$projects")
  if [ -z "$entry" ]; then
    plane_err "workspace '${PLANE_WORKSPACE_SLUG}' に name が '${name}' の project が無い。init-project.sh で作れる"
    return 1
  fi
  plane_save_project "$key" "$entry"
  jq -r '.id' <<<"$entry"
}

# 対応を保存する。引数: $1 = キー（slug/name）, $2 = project の JSON
plane_save_project() {
  local key="$1" entry="$2" file tmp
  file="$(plane_data_dir)/projects.json"
  [ -f "$file" ] || echo '{}' > "$file"
  tmp=$(mktemp)
  jq --arg k "$key" --argjson e "$entry" \
    '.[$k] = {id: $e.id, identifier: $e.identifier, name: $e.name, saved_at: (now | todate)}' \
    "$file" > "$tmp" && mv "$tmp" "$file"
}

# project の state 一覧（JSON 配列）
plane_states() {
  plane_get_all "/projects/$1/states/"
}

# state 名から id を引く。引数: $1 = project id, $2 = state 名。無ければ return 1
plane_state_id() {
  local id
  id=$(plane_states "$1" | jq -r --arg n "$2" '[.[] | select(.name == $n)] | first | .id // empty') || return 1
  if [ -z "$id" ]; then
    plane_err "state '$2' が project に無い"
    return 1
  fi
  echo "$id"
}

# project の label 一覧（JSON 配列）
plane_labels() {
  plane_get_all "/projects/$1/labels/"
}

# label 名から id を引く。無ければ作る。引数: $1 = project id, $2 = label 名, $3 = 色（任意）
plane_label_id_or_create() {
  local project="$1" name="$2" color="${3:-#6b7280}" id body created
  id=$(plane_labels "$project" | jq -r --arg n "$name" '[.[] | select(.name == $n)] | first | .id // empty') || return 1
  if [ -n "$id" ]; then
    echo "$id"
    return 0
  fi
  body=$(jq -n --arg n "$name" --arg c "$color" '{name: $n, color: $c}')
  created=$(plane_api POST "/projects/${project}/labels/" "$body") || return 1
  jq -r '.id' <<<"$created"
}

# セッション id を決める。引数で渡されなければ環境変数から取る。無ければ空
# 引数: $1 = 明示のセッション id（任意）
plane_session_id() {
  local sid="${1:-}"
  if [ -z "$sid" ]; then
    sid="${PLANE_SESSION_ID:-${CLAUDE_CODE_SESSION_ID:-${CLAUDE_SESSION_ID:-${CODEX_THREAD_ID:-}}}}"
  fi
  echo "$sid"
}

# セッションの label 名。session:<日付>-<id の先頭 8 桁>
plane_session_label_name() {
  local sid="$1"
  echo "session:$(date +%Y-%m-%d)-${sid:0:8}"
}

# プレーンテキストを description_html にする。空行で段落を分け、改行は <br>、& < > はエスケープする
plane_html_from_text() {
  jq -Rs '
    gsub("\r"; "")
    | split("\n\n")
    | map(select(length > 0)
      | gsub("&"; "&amp;") | gsub("<"; "&lt;") | gsub(">"; "&gt;")
      | gsub("\n"; "<br>")
      | "<p>" + . + "</p>")
    | join("")
  '
}
