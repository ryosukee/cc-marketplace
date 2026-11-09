#!/usr/bin/env bash
# このセッションの keepalive 通知をオン・オフし、切り替えた後の状態を JSON で出す。
# オフは off ファイルを置き、オンは消す。監視プロセスは止めない (watch-idle.sh が通知の直前に読む)。
# Usage: set-keepalive.sh on|off [--session-id ID] [--data-dir DIR]
# Exit: 0 = 成功, 2 = 前提条件エラー
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
# shellcheck source=./lib/session-paths.sh
. "$PLUGIN_ROOT/scripts/lib/session-paths.sh"

mode="${1:-}"
case "$mode" in
  on|off) shift ;;
  *) ck_die "第 1 引数は on か off: ${mode:-<空>}" ;;
esac

session_arg=""
data_arg=""

while [ $# -gt 0 ]; do
  case "$1" in
    --session-id) session_arg="${2:-}"; shift 2 ;;
    --data-dir) data_arg="${2:-}"; shift 2 ;;
    *) ck_die "unknown argument: $1" ;;
  esac
done

session_id="$(ck_session_id "$session_arg")"
data_dir="$(ck_data_dir "$data_arg")"

[ -n "$data_dir" ] || ck_die "data dir が解決できない (--data-dir と CLAUDE_PLUGIN_DATA のどちらも空)"
[ -n "$session_id" ] || ck_die "session id が解決できない (--session-id と CLAUDE_CODE_SESSION_ID のどちらも空)"
command -v jq >/dev/null 2>&1 || ck_die "jq が見つからない"

off_file="$(ck_off_file "$data_dir" "$session_id")"

if [ "$mode" = off ]; then
  mkdir -p "$data_dir"
  : > "$off_file"
else
  rm -f "$off_file"
fi

jq -n \
  --arg keepalive "$(ck_keepalive_state "$off_file")" \
  --arg session "$session_id" \
  --arg off_file "$off_file" \
  '{keepalive: $keepalive, session_id: $session, off_file: $off_file}'
