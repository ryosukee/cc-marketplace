#!/bin/bash
# 台帳と状態ファイルのパス解決・読み書きヘルパ
#
# 使い方: source して各関数を呼ぶ
# 前提: CLAUDE_PLUGIN_DATA と CLAUDE_PLUGIN_ROOT が設定されていること
#       (hook / monitor プロセスには自動で渡る。skill から呼ぶ場合は引数で渡す)

set -euo pipefail

# 台帳のパスを解決する。無ければ同梱テンプレートから初期化する
# 出力: LEDGER_PATH
resolve_ledger() {
  local data_dir="${CLAUDE_PLUGIN_DATA:-}"
  local plugin_root="${CLAUDE_PLUGIN_ROOT:-}"

  if [ -z "$data_dir" ]; then
    echo "CLAUDE_PLUGIN_DATA が未設定" >&2
    return 2
  fi

  LEDGER_PATH="$data_dir/known-issues.yml"

  if [ ! -f "$LEDGER_PATH" ]; then
    local template="$plugin_root/config/known-issues.template.yml"
    if [ ! -f "$template" ]; then
      echo "テンプレートが見つからない: $template" >&2
      return 2
    fi
    mkdir -p "$data_dir"
    cp "$template" "$LEDGER_PATH"
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
  "last_result": null,
  "last_error": null
}
JSON
  fi
}

# 状態ファイルの 1 フィールドを読む
# 引数: $1 = フィールド名
state_get() {
  resolve_state
  jq -r --arg k "$1" '.[$k] // empty' "$STATE_PATH"
}

# 状態ファイルの複数フィールドを更新する
# 引数: key=value の並び。value が "null" のときは JSON の null にする
state_set() {
  resolve_state
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
