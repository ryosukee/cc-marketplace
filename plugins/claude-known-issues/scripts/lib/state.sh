#!/bin/bash
# 一覧と状態ファイルのパス解決・読み書きヘルパ
#
# 使い方: source して各関数を呼ぶ
# 前提: CLAUDE_PLUGIN_DATA と CLAUDE_PLUGIN_ROOT が設定されていること
#       hook プロセスには env として自動で渡る。
#       skill から呼ぶ場合は呼び出し側で渡す

set -euo pipefail

# 一覧のパスを解決する。無ければ空で作る
# config/ の 2 つの yml はエントリの書き方の例で、ここへは入れない
# 出力: LEDGER_PATH
resolve_ledger() {
  local data_dir="${CLAUDE_PLUGIN_DATA:-}"

  if [ -z "$data_dir" ]; then
    echo "CLAUDE_PLUGIN_DATA が未設定" >&2
    return 2
  fi

  LEDGER_PATH="$data_dir/known-issues.yml"

  if [ ! -f "$LEDGER_PATH" ]; then
    mkdir -p "$data_dir"
    printf -- '---\nentries: []\n' > "$LEDGER_PATH"
  fi
}

# 状態ファイルのパスを解決する。無ければ初期状態で作る
# 出力: STATE_PATH
resolve_state() {
  local data_dir="${CLAUDE_PLUGIN_DATA:-}"

  if [ -z "$data_dir" ]; then
    echo "CLAUDE_PLUGIN_DATA が未設定" >&2
    return 2
  fi

  STATE_PATH="$data_dir/state.json"

  if [ ! -f "$STATE_PATH" ]; then
    mkdir -p "$data_dir"
    cat > "$STATE_PATH" <<'JSON'
{
  "reviewed_version": null,
  "pending_version": null,
  "last_review_at": null,
  "last_full_review_at": null,
  "last_result": null,
  "last_error": null
}
JSON
  fi
}

# 状態ファイルの 1 フィールドを読む
# 引数: $1 = フィールド名
state_get() {
  # コマンド置換の中では errexit が効かないため、失敗を明示的に伝播させる
  resolve_state || return $?
  jq -r --arg k "$1" '.[$k] // empty' "$STATE_PATH"
}

# --- claim: 突合の多重起動を止める排他ファイル ---
#
# 取得は review skill が agent 起動の直前に行い、解除は結果の反映と同時に行う。
# hook は claim が生きているあいだ通知を出さない。
# TTL を超えた claim は放置された（セッションが死んだ・反映されなかった）ものとして
# 無効扱いし、見つけた側が消す。TTL は agent の実行時間（実測 40 分強）を確実に超える値
CLAIM_TTL_SECONDS=7200

# claim ファイルのパスを解決する
# 出力: CLAIM_PATH
resolve_claim() {
  local data_dir="${CLAUDE_PLUGIN_DATA:-}"

  if [ -z "$data_dir" ]; then
    echo "CLAUDE_PLUGIN_DATA が未設定" >&2
    return 2
  fi

  CLAIM_PATH="$data_dir/review.claim"
}

# 生きている claim があるか。0 = ある、1 = ない
# TTL 超過の claim はここで消して「ない」扱いにする
claim_alive() {
  resolve_claim || return $?
  [ -f "$CLAIM_PATH" ] || return 1
  local mtime now
  mtime=$(stat -f %m "$CLAIM_PATH" 2>/dev/null || stat -c %Y "$CLAIM_PATH" 2>/dev/null) || return 1
  now=$(date +%s)
  if [ $((now - mtime)) -gt "$CLAIM_TTL_SECONDS" ]; then
    rm -f "$CLAIM_PATH"
    return 1
  fi
  return 0
}

# claim を取る。引数: $1 = mode (diff|full), $2 = FROM (full では "-"), $3 = TO
# 0 = 取れた、1 = 別の claim が生きている (中身を stderr へ出す)
# 作成は noclobber (set -C) で原子的に行い、同時に取りに来た側は失敗する
claim_acquire() {
  resolve_claim || return $?
  local session_id="${CLAUDE_CODE_SESSION_ID:-unknown}"
  if claim_alive; then
    { echo "別の claim が生きている:"; cat "$CLAIM_PATH"; } >&2
    return 1
  fi
  mkdir -p "$(dirname "$CLAIM_PATH")"
  if (set -C; jq -n \
        --arg session_id "$session_id" \
        --arg claimed_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --arg mode "${1:-diff}" --arg from "${2:--}" --arg to "${3:--}" \
        '{session_id: $session_id, claimed_at: $claimed_at, mode: $mode, from: $from, to: $to}' \
        > "$CLAIM_PATH") 2>/dev/null; then
    return 0
  fi
  { echo "claim の作成に競り負けた:"; cat "$CLAIM_PATH" 2>/dev/null; } >&2
  return 1
}

# 自分の claim を解除する。0 = 消した (または元々無い)、1 = 別セッションの claim なので残した
claim_release() {
  resolve_claim || return $?
  [ -f "$CLAIM_PATH" ] || return 0
  local owner session_id="${CLAUDE_CODE_SESSION_ID:-unknown}"
  owner=$(jq -r '.session_id // empty' "$CLAIM_PATH" 2>/dev/null) || owner=""
  if [ -n "$owner" ] && [ "$owner" != "$session_id" ]; then
    echo "claim は別のセッション ($owner) のもの。消さずに残す" >&2
    return 1
  fi
  rm -f "$CLAIM_PATH"
}

# 状態ファイルの複数フィールドを更新する
# 引数: key=value の並び。value が "null" のときは JSON の null にする
state_set() {
  resolve_state || return $?
  local tmp
  tmp=$(mktemp)
  local filter='.'
  local args=()
  local i=0
  for kv in "$@"; do
    local k="${kv%%=*}"
    local v="${kv#*=}"
    if [ "$v" = "null" ]; then
      filter="$filter | .[\$k$i] = null"
      args+=(--arg "k$i" "$k")
    else
      filter="$filter | .[\$k$i] = \$v$i"
      args+=(--arg "k$i" "$k" --arg "v$i" "$v")
    fi
    i=$((i + 1))
  done
  jq "${args[@]}" "$filter" "$STATE_PATH" > "$tmp" && mv "$tmp" "$STATE_PATH"
}
