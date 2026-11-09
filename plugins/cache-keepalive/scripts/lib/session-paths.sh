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
