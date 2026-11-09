#!/usr/bin/env bash
# このセッションの監視プロセスに、通知のオフ・オン・状態の問い合わせのシグナルを送る。
# 結果 (切り替えた後の状態) は、監視プロセスが stdout に書いた 1 行が Claude への通知として届く。
# このスクリプト自身は、送ったことだけを 1 行の JSON で出す。
# Usage: signal-watcher.sh on|off|status [--session-id ID] [--data-dir DIR]
# Exit: 0 = 送った, 1 = 監視プロセスが動いていない, 2 = 前提条件エラー
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
# shellcheck source=./lib/session-paths.sh
. "$PLUGIN_ROOT/scripts/lib/session-paths.sh"

# 割り当ては watch-idle.sh の trap と揃える
action="${1:-}"
case "$action" in
  off) signal=URG ;;
  on) signal=WINCH ;;
  status) signal=INFO ;;
  *) ck_die "第 1 引数は on・off・status のどれか: ${action:-<空>}" ;;
esac
shift

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

pid="$(ck_running_pid "$data_dir" "$session_id")"

if [ -z "$pid" ]; then
  printf '{"sent":false,"action":"%s","state":"not-running","session_id":"%s"}\n' "$action" "$session_id"
  exit 1
fi

kill -s "$signal" "$pid" || ck_die "pid $pid へ SIG$signal を送れなかった"
printf '{"sent":true,"action":"%s","signal":"SIG%s","pid":%s,"session_id":"%s"}\n' \
  "$action" "$signal" "$pid" "$session_id"
