#!/usr/bin/env bash
# このセッションの cache-keepalive の監視プロセスを止める。
# Exit: 0 = 止めた, 1 = 稼働していない, 2 = 前提条件エラー
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
# shellcheck source=./lib/session-paths.sh
. "$PLUGIN_ROOT/scripts/lib/session-paths.sh"

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

log_file="$(ck_log_file "$data_dir" "$session_id")"
pid_file="$(ck_pid_file "$data_dir" "$session_id")"

[ -f "$pid_file" ] || exit 1
pid="$(head -1 "$pid_file" 2>/dev/null || true)"
[ -n "$pid" ] || exit 1
kill -0 "$pid" 2>/dev/null || exit 1

kill "$pid"
printf '%s stopped pid=%s\n' "$(date +%Y-%m-%dT%H:%M:%S%z)" "$pid" >> "$log_file"
echo "$pid"
