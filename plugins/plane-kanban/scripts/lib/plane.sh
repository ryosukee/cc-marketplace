#!/bin/bash
# Plane Cloud の REST API を呼ぶ共通ヘルパ。エントリスクリプトが source して使う
#
# 秘密は macOS の Keychain から読む（環境変数では渡さない）
#   service plane-kanban-api-key  Plane の Personal Access Token
#   登録: security add-generic-password -s plane-kanban-api-key -a "$USER" -w '<token>'
#   読めるのは GUI にログインしていて login keychain が開いているときだけ
#
# 必須の環境変数
#   PLANE_WORKSPACE_SLUG  workspace の slug（https://app.plane.so/{slug}/ の部分）。秘密ではない
#                         Claude Code は ~/.claude/settings.json の env、
#                         Codex は ~/.codex/config.toml の [shell_environment_policy] の set に置く
#
# 任意の環境変数
#   PLANE_API_BASE        既定 https://api.plane.so/api/v1
#   PLANE_KANBAN_DATA_DIR repo と project の対応を保存する場所。
#                         無ければ ${XDG_DATA_HOME}/plane-kanban、それも無ければ
#                         ~/.local/share/plane-kanban
#
# 出力は JSON を stdout、エラーは stderr。exit 0 = 成功、1 = 該当なし、2 = 前提条件エラー
# API key は stdout・stderr・ログに出さない

set -euo pipefail

PLANE_API_BASE="${PLANE_API_BASE:-https://api.plane.so/api/v1}"
PLANE_RETRY_MAX="${PLANE_RETRY_MAX:-3}"
PLANE_KEYCHAIN_API_KEY_SERVICE="plane-kanban-api-key"

plane_err() {
  echo "plane-kanban: $*" >&2
}

# Keychain から 1 項目を読む。引数: $1 = service 名。無ければ return 1
plane_keychain_read() {
  security find-generic-password -s "$1" -w 2>/dev/null
}

# 前提（curl・jq・security、Keychain の API key、環境変数 PLANE_WORKSPACE_SLUG）を確かめる。
# API key は PLANE_API_KEY としてこの process の中だけに持つ。足りなければ exit 2
plane_require_env() {
  for cmd in curl jq security; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
      plane_err "$cmd が無い。この plugin は macOS の Keychain（security コマンド）を前提にする"
      exit 2
    fi
  done
  if ! PLANE_API_KEY=$(plane_keychain_read "$PLANE_KEYCHAIN_API_KEY_SERVICE") || [ -z "$PLANE_API_KEY" ]; then
    plane_err "Keychain に service '${PLANE_KEYCHAIN_API_KEY_SERVICE}' が無いか読めない。Plane の Profile Settings で Personal Access Token を発行し、security add-generic-password -s ${PLANE_KEYCHAIN_API_KEY_SERVICE} -a \"\$USER\" -w '<token>' で登録する。GUI にログインしていて login keychain が開いていることが要る"
    exit 2
  fi
  if [ -z "${PLANE_WORKSPACE_SLUG:-}" ]; then
    plane_err "環境変数 PLANE_WORKSPACE_SLUG が空。https://app.plane.so/{slug}/ の slug を入れる。Claude Code は ~/.claude/settings.json の env、Codex は ~/.codex/config.toml の [shell_environment_policy] の set に置く"
    exit 2
  fi
}

# 対応の保存先ディレクトリ。無ければ作る。client 固有の変数は見ない
plane_data_dir() {
  local dir
  if [ -n "${PLANE_KANBAN_DATA_DIR:-}" ]; then
    dir="${PLANE_KANBAN_DATA_DIR}"
  elif [ -n "${XDG_DATA_HOME:-}" ]; then
    dir="${XDG_DATA_HOME}/plane-kanban"
  else
    dir="${HOME}/.local/share/plane-kanban"
  fi
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
