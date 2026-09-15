#!/usr/bin/env bash
# セッション JSONL の mtime を監視し、無操作が閾値を超えたときだけ stdout に 1 行出す。
# stdout の 1 行が Claude への keepalive 通知になるので、それ以外を stdout へ書かない。
#
# セッション JSONL は、セッションに最初の入力が入るまで作られない。それまでは cache も
# 無く keepalive の出番も無いので、「JSONL が無い」はエラーではなく正常な待機として扱う。
# 見つかるまで発火せずに探し続け、待ちに上限を設けない (ccm-f088 / ccm-f090 の決定)。
# 起動と検出をログに残し、status が「本体が起動していない」と「JSONL 待ち」を区別できるようにする。
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
# shellcheck source=./lib/session-paths.sh
. "$PLUGIN_ROOT/scripts/lib/session-paths.sh"

launcher=""
session_arg=""
data_arg=""
jsonl=""
threshold="${CACHE_KEEPALIVE_THRESHOLD_SECONDS:-3000}"
log_retention_days=30
jsonl_search_seconds=60

while [ $# -gt 0 ]; do
  case "$1" in
    --launcher) launcher="$(ck_resolve "${2:-}")"; shift 2 ;;
    --session-id) session_arg="${2:-}"; shift 2 ;;
    --data-dir) data_arg="${2:-}"; shift 2 ;;
    --jsonl) jsonl="$(ck_resolve "${2:-}")"; shift 2 ;;
    --threshold) threshold="$(ck_resolve "${2:-}")"; shift 2 ;;
    *) ck_die "unknown argument: $1" ;;
  esac
done

[ -n "$launcher" ] || launcher="unknown"
[ -n "$threshold" ] || threshold=3000
data_dir="$(ck_data_dir "$data_arg")"

# data dir が無いと、失敗したことを残す先が無い
[ -n "$data_dir" ] || ck_die "data dir が解決できない (--data-dir と CLAUDE_PLUGIN_DATA のどちらも空)"
mkdir -p "$data_dir"

# 前提 (session id・明示された jsonl) を満たせず動けないことを残す。これが無いと、
# 動けなかったのか Claude Code 本体がそもそも起動しなかったのかを status が区別できない
fail() {
  printf '%s %s launcher=%s %s\n' "$(date +%Y-%m-%dT%H:%M:%S%z)" "failed" "$launcher" "$1" \
    >> "$data_dir/keepalive-error.log"
  ck_die "$1"
}

session_id="$(ck_session_id "$session_arg")"
[ -n "$session_id" ] || fail "session id が解決できない (--session-id と CLAUDE_CODE_SESSION_ID のどちらも空)"

log_file="$(ck_log_file "$data_dir" "$session_id")"
pid_file="$(ck_pid_file "$data_dir" "$session_id")"

# 古いセッションの記録を落とす (data dir が無制限に増えるのを防ぐ)
find "$data_dir" -maxdepth 1 \( -name 'keepalive-*.log' -o -name 'keepalive-*.pid' \) \
  ! -name 'keepalive-error.log' -mtime "+${log_retention_days}" -delete 2>/dev/null || true

log() {
  printf '%s %s\n' "$(date +%Y-%m-%dT%H:%M:%S%z)" "$1" >> "$log_file"
}

# pid と起動ログは JSONL の解決より前に書く。JSONL 待ちの間も stop / status が
# このプロセスを扱えるようにし、「起動したが JSONL がまだ無い」を記録で示す
echo "$$" > "$pid_file"

# sleep は子プロセスなので、親を kill しただけでは残る。
# 残った sleep は継承した stdout を掴み続け、読み手が EOF を受け取れなくなる。
# 変数に控えた pid では取りこぼす (wait が中断された後、トラップが走る前に
# 後続の代入が実行される) ので、実際の子プロセスを OS に問い合わせて落とす。
cleanup() {
  rm -f "$pid_file"
  pkill -P $$ >/dev/null 2>&1 || true
  return 0
}
trap cleanup EXIT
trap 'exit 143' TERM INT

# sleep を前面で実行するとトラップが sleep の終了まで走らない。
# 子プロセスにして wait すると、シグナルで即座に起きる。
nap() {
  sleep "$1" &
  wait $! || true
}

resolve_jsonl() {
  find "$HOME/.claude/projects" -name "${session_id}.jsonl" 2>/dev/null | head -1
}

log "started launcher=${launcher} session=${session_id} threshold=${threshold}"

# --jsonl で明示されたパスは待たない。存在しなければ指定の誤りなので、その場で落とす
if [ -n "$jsonl" ] && [ ! -f "$jsonl" ]; then
  fail "JSONL が存在しない: $jsonl"
fi

# 最初の入力で JSONL が作られるまで、発火せずに探し続ける
while [ -z "$jsonl" ]; do
  jsonl="$(resolve_jsonl)"
  [ -n "$jsonl" ] || nap "$jsonl_search_seconds"
done

# jsonl はパスに空白が入りうるので行末に置く (status のパースが行末まで取る)
log "detected mtime=$(stat -f %m "$jsonl" 2>/dev/null || echo unknown) jsonl=${jsonl}"

while true; do
  if ! mtime="$(stat -f %m "$jsonl" 2>/dev/null)"; then
    # JSONL が消えた・移動した場合は探し直す。見つかるまでは発火しない
    found="$(resolve_jsonl)"
    if [ -n "$found" ] && [ "$found" != "$jsonl" ]; then
      jsonl="$found"
      log "redetected jsonl=${jsonl}"
      continue
    fi
    nap "$jsonl_search_seconds"
    continue
  fi
  now="$(date +%s)"
  elapsed=$((now - mtime))
  if [ "$elapsed" -ge "$threshold" ]; then
    echo "[cache-keepalive] キャッシュキープアライブです。OK とだけ返答してください。"
    log "fired elapsed=${elapsed}"
    nap "$threshold"
  else
    nap $((threshold - elapsed))
  fi
done
