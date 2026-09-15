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

ck_log_file() {
  printf '%s/keepalive-%s.log' "$1" "${2:-nosession}"
}

ck_pid_file() {
  printf '%s/keepalive-%s.pid' "$1" "${2:-nosession}"
}
