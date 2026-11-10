#!/usr/bin/env bash
# cache-keepalive の session id・data dir・記録ファイルのパスを解決する。
# 呼び出し側で source する。

# 置換されなかった ${VAR} 形式と空文字を、どちらも未設定として扱う。
# plugin manifest の command に書いた ${ENV_VAR} は、ホストが解決できないと
# 置換されずに字面のまま渡ることがある。
ck_resolve() {
  case "${1:-}" in
    '${'*) printf '' ;;
    *) printf '%s' "${1:-}" ;;
  esac
}

ck_die() {
  echo "cache-keepalive: $1" >&2
  exit 2
}

# $1: 引数で渡された値 (空可)。空なら環境変数へ落ちる
ck_session_id() {
  local value
  value="$(ck_resolve "${1:-}")"
  [ -n "$value" ] || value="${CLAUDE_CODE_SESSION_ID:-}"
  printf '%s' "$value"
}

ck_data_dir() {
  local value
  value="$(ck_resolve "${1:-}")"
  [ -n "$value" ] || value="${CLAUDE_PLUGIN_DATA:-}"
  printf '%s' "$value"
}

ck_pid_file() {
  printf '%s/keepalive-%s.pid' "$1" "${2:-nosession}"
}

# $1: data dir、$2: session id。そのセッションの監視プロセスが生きていれば pid を、無ければ空を返す。
# 判定は pid ファイル + kill -0 + コマンドライン照合。
# 照合は配置が変わっても安定な 2 点 (plugin 名 cache-keepalive と --session-id の引数) だけで行い、
# 版数ディレクトリを含む絶対パスやスクリプト名には依存しない。kill -0 だけだと、
# 監視プロセスが死んだ後に同じ pid が別プロセスへ再利用されたとき誤って「動いている」と出る。
ck_running_pid() {
  local pid_file pid cmd
  pid_file="$(ck_pid_file "$1" "$2")"
  [ -f "$pid_file" ] || return 0
  pid="$(head -1 "$pid_file" 2>/dev/null || true)"
  [ -n "$pid" ] || return 0
  kill -0 "$pid" 2>/dev/null || return 0
  cmd="$(ps -p "$pid" -o command= 2>/dev/null || true)"
  case "$cmd" in
    *cache-keepalive*"--session-id ${2}"*) printf '%s' "$pid" ;;
  esac
  return 0
}

# $1: セッション JSONL。最後の API 応答の時刻を epoch 秒で返す。無ければ空を返す。
# prompt cache の期限は API 呼び出しで延びるので、無操作は JSONL の mtime ではなくこの時刻から数える。
# JSONL には API を呼ばない書き込み (cost-state、last-prompt など) もあり、mtime はそれでも進む。
# API 応答は assistant の記録で、model が <synthetic> のものは API を呼ばずに作られるので除く。
# 数百 MB の JSONL を毎回全部読むと数秒かかるので、末尾 256KB → 4MB → 全体の順に広げて探す。
# 末尾から切り出した範囲の先頭行は途中から始まりうるので捨てる。
# timestamp は assistant の記録のトップレベルのキーで、message より後ろにあり、
# それより後ろに入れ子のオブジェクトを持たないので、行の中の最後の一致を取る。
ck_last_api_epoch() {
  local jsonl="$1" bytes line="" ts
  for bytes in 262144 4194304 all; do
    if [ "$bytes" = all ]; then
      line="$(grep -F '"type":"assistant"' "$jsonl" 2>/dev/null | grep -vF '"model":"<synthetic>"' | tail -1)" || true
    else
      line="$(tail -c "$bytes" "$jsonl" 2>/dev/null | tail -n +2 \
        | grep -F '"type":"assistant"' | grep -vF '"model":"<synthetic>"' | tail -1)" || true
    fi
    [ -z "$line" ] || break
  done
  [ -n "$line" ] || return 0
  ts="$(printf '%s' "$line" | grep -o '"timestamp":"[^"]*"' | tail -1)" || true
  ts="${ts#\"timestamp\":\"}"
  ts="${ts%\"}"
  ts="${ts%Z}"
  ts="${ts%%.*}"
  [ -n "$ts" ] || return 0
  date -j -u -f '%Y-%m-%dT%H:%M:%S' "$ts" +%s 2>/dev/null || true
  return 0
}
