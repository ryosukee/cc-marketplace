#!/bin/bash
# monitor 本体: Claude Code の更新を検知し、未突合なら 1 行だけ通知を出す
#
# 判定ロジックは持たない。バージョンが前回突合時から変わったか (または前回の
# 突合が完了していないか) だけを見る。実際に台帳と changelog を突き合わせるのは
# known-issues-reviewer agent の仕事。
#
# stdout の 1 行がそのまま Claude への通知になる。該当なしのときは何も出力しない。
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"

# shellcheck source=lib/state.sh
source "$PLUGIN_ROOT/scripts/lib/state.sh"

# jq が無ければ状態管理ができないので黙って終了する
command -v jq >/dev/null 2>&1 || exit 0

CURRENT_VERSION=$(claude --version 2>/dev/null | awk '{print $1}')
[ -n "$CURRENT_VERSION" ] || exit 0

REVIEWED=$(state_get reviewed_version)
PENDING=$(state_get pending_version)

# 初回: 現在バージョンを突合済みとして記録するだけ (過去分は遡らない)
if [ -z "$REVIEWED" ] && [ -z "$PENDING" ]; then
  state_set "reviewed_version=$CURRENT_VERSION" "last_result=initialized" \
    "last_review_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  exit 0
fi

# 未完了の突合が残っている場合は再通知する
# (前回セッションで agent が起動されなかった / 失敗した場合の救済)
if [ -n "$PENDING" ]; then
  echo "[known-issues] Claude Code の更新 (v${REVIEWED:-?} → v${PENDING}) が未突合です。known-issues-reviewer agent を background で起動し、台帳の open エントリと changelog を突合してください。"
  exit 0
fi

# 突合済みバージョンと同じなら何も出さない
[ "$CURRENT_VERSION" = "$REVIEWED" ] && exit 0

# 更新を検知: pending に記録して通知する
state_set "pending_version=$CURRENT_VERSION"
echo "[known-issues] Claude Code が v${REVIEWED} → v${CURRENT_VERSION} に更新されました。known-issues-reviewer agent を background で起動し、台帳の open エントリと changelog を突合してください。"
