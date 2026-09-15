#!/usr/bin/env bash
# このセッションの cache-keepalive の状態を JSON で出す。
# プロセスの生死だけでなく、起動した時刻・起動した手段・最後に通知を出した時刻まで出す。
# Exit: 0 = 稼働中, 1 = 稼働していない, 2 = 前提条件エラー
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

log_file="$(ck_log_file "$data_dir" "$session_id")"
pid_file="$(ck_pid_file "$data_dir" "$session_id")"

# "key=value" を取り出す。jsonl だけは値にパス区切り以外も入りうるので行末まで取る
parse_field() {
  local line="$1" key="$2" rest
  case "$line" in
    *" $key="*) rest="${line#*" $key="}" ;;
    *) printf ''; return 0 ;;
  esac
  if [ "$key" = "jsonl" ]; then
    printf '%s' "$rest"
  else
    printf '%s' "${rest%% *}"
  fi
}

armed_line=""
fired_line=""
fired_count=0
if [ -f "$log_file" ]; then
  armed_line="$(grep -F ' armed ' "$log_file" | tail -1 || true)"
  fired_line="$(grep -F ' fired ' "$log_file" | tail -1 || true)"
  fired_count="$(grep -cF ' fired ' "$log_file" || true)"
fi

pid=""
if [ -f "$pid_file" ]; then
  pid="$(head -1 "$pid_file" 2>/dev/null || true)"
fi

# 起動に失敗した記録。never-armed のとき、起動して失敗したのか
# そもそも起動されなかったのかを、これがあるかどうかで分ける
error_file="$data_dir/keepalive-error.log"
last_error=""
if [ -f "$error_file" ]; then
  last_error="$(tail -1 "$error_file" 2>/dev/null || true)"
fi

running=false
if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
  running=true
fi

if [ "$running" = true ]; then
  state="running"
elif [ -n "$armed_line" ]; then
  state="stopped"
else
  state="never-armed"
fi

jq -n \
  --arg state "$state" \
  --arg session "$session_id" \
  --arg pid "$pid" \
  --arg launcher "$(parse_field "$armed_line" launcher)" \
  --arg armed_at "${armed_line%% *}" \
  --arg threshold "$(parse_field "$armed_line" threshold)" \
  --arg jsonl "$(parse_field "$armed_line" jsonl)" \
  --arg last_fired_at "${fired_line%% *}" \
  --arg fired_count "$fired_count" \
  --arg last_error "$last_error" \
  --arg log_file "$log_file" \
  '{
     state: $state,
     session_id: $session,
     pid: (if $pid == "" then null else ($pid | tonumber) end),
     launcher: (if $launcher == "" then null else $launcher end),
     armed_at: (if $armed_at == "" then null else $armed_at end),
     threshold_seconds: (if $threshold == "" then null else ($threshold | tonumber) end),
     jsonl: (if $jsonl == "" then null else $jsonl end),
     last_fired_at: (if $last_fired_at == "" then null else $last_fired_at end),
     fired_count: ($fired_count | tonumber),
     last_error: (if $last_error == "" then null else $last_error end),
     log_file: $log_file
   }'

[ "$running" = true ] || exit 1
