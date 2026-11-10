#!/usr/bin/env bash
# セッション JSONL の最後の API 応答の時刻を監視し、無操作が閾値を超えたときだけ stdout に 1 行出す。
# stdout の 1 行が Claude への通知になるので、keepalive と状態の報告以外を stdout へ書かない。
#
# セッション JSONL は、セッションに最初の入力が入るまで作られない。それまでは cache も
# 無く keepalive の出番も無いので、「JSONL が無い」はエラーではなく正常な待機として扱う。
# 見つかるまで発火せずに探し続け、待ちに上限を設けない (ccm-f088 / ccm-f090 の決定)。
# 動いていることの記録は pid ファイルだけが持つ。status はこれを照合する。
#
# 通知のオン・オフはシグナルで切り替え、このプロセスのメモリに持つ (CCM-T29)。
# 別プロセスのステータスラインが表示に使えるよう、pid ファイルの 2 行目にも書き写す。
# pid ファイルを書くのはこのプロセスだけで、終了時に消すので、状態が後に残らない。
# Claude Code は同じセッションで monitor を起動し直せないので、オフの間もプロセスは止めない。
#   SIGURG: オフ / SIGWINCH: オン / SIGINFO: 状態の問い合わせ
# どれも既定の動作が無視なので、trap を持たない旧版のプロセスに届いても終了しない。
# 切り替えと問い合わせの結果は、状態の 1 行を stdout に書いて Claude への通知で返す。
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
# shellcheck source=./lib/session-paths.sh
. "$PLUGIN_ROOT/scripts/lib/session-paths.sh"

launcher=""
session_arg=""
data_arg=""
jsonl=""
threshold="${CACHE_KEEPALIVE_THRESHOLD_SECONDS:-3000}"
retention_days=30
jsonl_search_seconds=60
keepalive=on

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

[ -n "$data_dir" ] || ck_die "data dir が解決できない (--data-dir と CLAUDE_PLUGIN_DATA のどちらも空)"
mkdir -p "$data_dir"

session_id="$(ck_session_id "$session_arg")"
[ -n "$session_id" ] || ck_die "session id が解決できない (--session-id と CLAUDE_CODE_SESSION_ID のどちらも空)"

pid_file="$(ck_pid_file "$data_dir" "$session_id")"

# 古いセッションの pid と、旧版が残したログを落とす (data dir が無制限に増えるのを防ぐ)
find "$data_dir" -maxdepth 1 \( -name 'keepalive-*.log' -o -name 'keepalive-*.pid' \) \
  -mtime "+${retention_days}" -delete 2>/dev/null || true
# v0.11.0 が使っていた off ファイルは、もう読まないので日数を問わず落とす
find "$data_dir" -maxdepth 1 -name 'keepalive-*.off' -delete 2>/dev/null || true

# pid ファイルは 1 行目が pid、2 行目が通知のオン・オフ (on / off)。
# 読み手は 1 行目だけを読む signal-watcher.sh と、2 行目も読むステータスライン。
# 書き換えの途中を読まれないよう、一時ファイルに書いて mv で置き換える
write_pid_file() {
  printf '%s\n%s\n' "$$" "$keepalive" > "${pid_file}.tmp" && mv -f "${pid_file}.tmp" "$pid_file"
}

# pid は JSONL の解決より前に書く。JSONL 待ちの間も status がこのプロセスを扱えるようにする
write_pid_file

# sleep は子プロセスなので、親を kill しただけでは残る。
# 残った sleep は継承した stdout を掴み続け、読み手が EOF を受け取れなくなる。
# 変数に控えた pid では取りこぼす (wait が中断された後、トラップが走る前に
# 後続の代入が実行される) ので、実際の子プロセスを OS に問い合わせて落とす。
cleanup() {
  rm -f "$pid_file" "${pid_file}.tmp"
  pkill -P $$ >/dev/null 2>&1 || true
  return 0
}
trap cleanup EXIT
trap 'exit 143' TERM INT

# 切り替えと問い合わせ。シグナルで wait が中断されると待機中の sleep が残るので落とし、
# ループの先頭から経過時間を測り直させる
report_state() {
  echo "[cache-keepalive:status] このセッションの keepalive 通知は ${keepalive} です。この状態をユーザーに伝えてください。"
}
on_signal() {
  case "$1" in
    off) keepalive=off ;;
    on) keepalive=on ;;
  esac
  # 書けなくても通知の切り替えは効いているので、監視は止めない。表示が古くなるだけ
  write_pid_file 2>/dev/null || true
  report_state
  pkill -P $$ -x sleep >/dev/null 2>&1 || true
}
trap 'on_signal off' URG
trap 'on_signal on' WINCH
trap 'on_signal status' INFO

# sleep を前面で実行するとトラップが sleep の終了まで走らない。
# 子プロセスにして wait すると、シグナルで即座に起きる。
nap() {
  sleep "$1" &
  wait $! || true
}

resolve_jsonl() {
  find "$HOME/.claude/projects" -name "${session_id}.jsonl" 2>/dev/null | head -1
}

# --jsonl で明示されたパスは待たない。存在しなければ指定の誤りなので、その場で落とす
if [ -n "$jsonl" ] && [ ! -f "$jsonl" ]; then
  ck_die "JSONL が存在しない: $jsonl"
fi

# 最初の入力で JSONL が作られるまで、発火せずに探し続ける
while [ -z "$jsonl" ]; do
  jsonl="$(resolve_jsonl)"
  [ -n "$jsonl" ] || nap "$jsonl_search_seconds"
done

while true; do
  if [ ! -f "$jsonl" ]; then
    # JSONL が消えた・移動した場合は探し直す。見つかるまでは発火しない
    found="$(resolve_jsonl)"
    if [ -n "$found" ] && [ "$found" != "$jsonl" ]; then
      jsonl="$found"
      continue
    fi
    nap "$jsonl_search_seconds"
    continue
  fi
  # 無操作は最後の API 応答から数える (理由は ck_last_api_epoch の説明)
  last_api="$(ck_last_api_epoch "$jsonl")"
  if [ -z "$last_api" ]; then
    # API 応答がまだ無いなら cache も無く、発火の出番も無い
    nap "$jsonl_search_seconds"
    continue
  fi
  now="$(date +%s)"
  elapsed=$((now - last_api))
  [ "$elapsed" -ge 0 ] || elapsed=0
  if [ "$elapsed" -ge "$threshold" ]; then
    # オフの間は出さない。切り替えは会話のターンの中で行い API 応答が記録されるので、
    # オンに戻した後の経過時間はその時点から数え直される
    if [ "$keepalive" = on ]; then
      echo "[cache-keepalive] キャッシュキープアライブです。OK とだけ返答してください。"
    fi
    nap "$threshold"
  else
    nap $((threshold - elapsed))
  fi
done
