#!/usr/bin/env bash
# このセッションの cache-keepalive の監視プロセスが動いているかを JSON で出す。
# 判定は pid ファイル + kill -0 + コマンドライン照合。
# 照合は配置が変わっても安定な 2 点 (plugin 名 cache-keepalive と --session-id の引数) だけで行い、
# 版数ディレクトリを含む絶対パスやスクリプト名には依存しない。kill -0 だけだと、
# 監視プロセスが死んだ後に同じ pid が別プロセスへ再利用されたとき誤って「動いている」と出る。
# Exit: 0 = running, 1 = not-running, 2 = 前提条件エラー
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
command -v jq >/dev/null 2>&1 || ck_die "jq が見つからない"

pid_file="$(ck_pid_file "$data_dir" "$session_id")"

pid=""
if [ -f "$pid_file" ]; then
  pid="$(head -1 "$pid_file" 2>/dev/null || true)"
fi

running=false
if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
  cmd="$(ps -p "$pid" -o command= 2>/dev/null || true)"
  case "$cmd" in
    *cache-keepalive*"--session-id ${session_id}"*) running=true ;;
  esac
fi

if [ "$running" = true ]; then
  state="running"
else
  state="not-running"
fi

jq -n \
  --arg state "$state" \
  --arg session "$session_id" \
  --arg pid "$pid" \
  --arg pid_file "$pid_file" \
  '{
     state: $state,
     session_id: $session,
     pid: (if $pid == "" then null else ($pid | tonumber) end),
     pid_file: $pid_file
   }'

[ "$running" = true ] || exit 1
