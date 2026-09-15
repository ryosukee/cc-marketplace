#!/usr/bin/env bash
# このセッションの cache-keepalive の状態を JSON で出す。
# プロセスの生死だけでなく、起動した時刻・JSONL を検出したか・最後に通知を出した時刻まで出す。
# Exit: 0 = 稼働中 (running / waiting-jsonl), 1 = 稼働していない, 2 = 前提条件エラー
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

started_line=""
detected_line=""
fired_line=""
fired_count=0
if [ -f "$log_file" ]; then
  started_line="$(grep -F ' started ' "$log_file" | tail -1 || true)"
  detected_line="$(grep -F ' detected ' "$log_file" | tail -1 || true)"
  fired_line="$(grep -F ' fired ' "$log_file" | tail -1 || true)"
  fired_count="$(grep -cF ' fired ' "$log_file" || true)"
fi

pid=""
if [ -f "$pid_file" ]; then
  pid="$(head -1 "$pid_file" 2>/dev/null || true)"
fi

# 動けなかった記録。never-started のとき、動けずに落ちたのか
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

# waiting-jsonl = 起動済みで、セッション JSONL がまだ作られていない (最初の入力より前)。
# 正常な待機で、JSONL が現れると running へ進む
if [ "$running" = true ] && [ -n "$detected_line" ]; then
  state="running"
elif [ "$running" = true ]; then
  state="waiting-jsonl"
elif [ -n "$started_line" ]; then
  state="stopped"
else
  state="never-started"
fi

# detected 行の mtime は epoch。読み手が比べやすいよう ISO でも出す
detected_mtime="$(parse_field "$detected_line" mtime)"
[ "$detected_mtime" != "unknown" ] || detected_mtime=""

jq -n \
  --arg state "$state" \
  --arg session "$session_id" \
  --arg pid "$pid" \
  --arg launcher "$(parse_field "$started_line" launcher)" \
  --arg started_at "${started_line%% *}" \
  --arg detected_at "${detected_line%% *}" \
  --arg threshold "$(parse_field "$started_line" threshold)" \
  --arg jsonl "$(parse_field "$detected_line" jsonl)" \
  --arg jsonl_mtime "$detected_mtime" \
  --arg last_fired_at "${fired_line%% *}" \
  --arg fired_count "$fired_count" \
  --arg last_error "$last_error" \
  --arg log_file "$log_file" \
  '{
     state: $state,
     session_id: $session,
     pid: (if $pid == "" then null else ($pid | tonumber) end),
     launcher: (if $launcher == "" then null else $launcher end),
     started_at: (if $started_at == "" then null else $started_at end),
     detected_at: (if $detected_at == "" then null else $detected_at end),
     threshold_seconds: (if $threshold == "" then null else ($threshold | tonumber) end),
     jsonl: (if $jsonl == "" then null else $jsonl end),
     jsonl_mtime_at_detect: (if $jsonl_mtime == "" then null else ($jsonl_mtime | tonumber) end),
     last_fired_at: (if $last_fired_at == "" then null else $last_fired_at end),
     fired_count: ($fired_count | tonumber),
     last_error: (if $last_error == "" then null else $last_error end),
     log_file: $log_file
   }'

[ "$running" = true ] || exit 1
