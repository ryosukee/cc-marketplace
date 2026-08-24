#!/bin/bash
# SessionStart hook: Claude Code の更新を検知し、未突合なら台帳突合を促す
#
# 判定ロジックは持たない。バージョンが前回突合時から変わったか (または前回の
# 突合が完了していないか) だけを見る。実際に台帳と changelog を突き合わせるのは
# known-issues-reviewer agent の仕事。
#
# 更新を検知したときだけ JSON を stdout に出す。additionalContext がモデルの
# コンテキストに注入され、systemMessage がユーザーに見えるバナーになる。
# 該当なしのときは何も出力せず exit 0 する。
#
# one-shot 検知なので monitor (persistent stream 前提) ではなく hook を使う。
# 経緯は .claude/rules/plugin-design.md の「監視機構の選択」を参照。
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"

# shellcheck source=../lib/state.sh
source "$PLUGIN_ROOT/scripts/lib/state.sh"

# jq が無ければ状態管理ができないので黙って終了する
command -v jq >/dev/null 2>&1 || exit 0

CURRENT_VERSION=$(claude --version 2>/dev/null | awk '{print $1}')
[ -n "$CURRENT_VERSION" ] || exit 0

REVIEWED=$(state_get reviewed_version)
PENDING=$(state_get pending_version)

# 更新を検知したときに JSON を出力して終了する。
# $1 = ユーザー向けバナー文, $2 = モデルへの指示文
emit_and_exit() {
  local banner="$1" instruction="$2"
  jq -n --arg banner "$banner" --arg instruction "$instruction" \
    '{systemMessage: $banner,
      hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: $instruction}}'
  exit 0
}

# 初回: 現在バージョンを突合済みとして記録し、全件突合を促す
# (差分突合は過去分を遡らないので、既存エントリは全件突合で確かめる)
if [ -z "$REVIEWED" ] && [ -z "$PENDING" ]; then
  state_set "reviewed_version=$CURRENT_VERSION" "last_result=initialized" \
    "last_review_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  emit_and_exit \
    "既知バグ一覧: 導入直後です。全件突合 (review full) を 1 回回してください" \
    "[known-issues] claude-known-issues を導入した直後です。review skill を full で実行し、一覧の全エントリの how_to_verify を確かめてください。"
fi

# 未完了の突合が残っている場合は再通知する
# (前回セッションで agent が起動されなかった / 失敗した場合の救済)
if [ -n "$PENDING" ]; then
  emit_and_exit \
    "⚠ 既知バグ一覧: v${REVIEWED:-?} → v${PENDING} の突合が未完了です" \
    "[known-issues] Claude Code の更新 (v${REVIEWED:-?} → v${PENDING}) が未突合です。known-issues-reviewer agent を background で起動し、一覧のエントリと changelog を突合してください。"
fi

# 更新を検知: pending に記録して通知する
if [ "$CURRENT_VERSION" != "$REVIEWED" ]; then
  state_set "pending_version=$CURRENT_VERSION"
  emit_and_exit \
    "⚠ 既知バグ一覧: Claude Code が v${REVIEWED} → v${CURRENT_VERSION} に更新されました" \
    "[known-issues] Claude Code が v${REVIEWED} → v${CURRENT_VERSION} に更新されました。known-issues-reviewer agent を background で起動し、一覧のエントリと changelog を突合してください。"
fi

# 全件突合の時期: 未実施 (null) か、前回から 180 日を超えていたら促す
LAST_FULL=$(state_get last_full_review_at)
if [ -z "$LAST_FULL" ]; then
  emit_and_exit \
    "既知バグ一覧: 全件突合 (review full) が未実施です" \
    "[known-issues] 全件突合が未実施です。review skill を full で実行し、一覧の全エントリの how_to_verify を確かめてください。"
fi
LAST_FULL_EPOCH=$(date -u -j -f '%Y-%m-%dT%H:%M:%SZ' "$LAST_FULL" +%s 2>/dev/null \
  || date -u -d "$LAST_FULL" +%s 2>/dev/null || echo 0)
NOW_EPOCH=$(date -u +%s)
if [ "$LAST_FULL_EPOCH" -gt 0 ] && [ $((NOW_EPOCH - LAST_FULL_EPOCH)) -gt $((180 * 86400)) ]; then
  emit_and_exit \
    "既知バグ一覧: 前回の全件突合 (${LAST_FULL}) から 180 日を超えました" \
    "[known-issues] 前回の全件突合から 180 日を超えました。review skill を full で実行し、一覧の全エントリの how_to_verify を確かめてください。"
fi
