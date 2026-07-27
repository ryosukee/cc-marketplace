#!/bin/bash
# statusline が書き出した JSON から、残量を 1 行に整形して出力する。
#
# 引数:
#   $1 = session_id (省略時は $CLAUDE_CODE_SESSION_ID)
# 環境変数:
#   CLAUDE_USAGE_LINE_DIR = JSON の置き場 (既定 /tmp/claude-status)
# Exit codes:
#   0 = 成功 / 1 = 該当セッションの JSON なし / 2 = 前提条件エラー
set -euo pipefail

DIR="${CLAUDE_USAGE_LINE_DIR:-/tmp/claude-status}"
SID="${1:-${CLAUDE_CODE_SESSION_ID:-}}"

command -v jq >/dev/null 2>&1 || { echo "jq がありません" >&2; exit 2; }

# session_id が取れないときは最新ファイルへフォールバックしない。
# 別セッションの残量を自分のものとして出すほうが、出さないより悪い。
if [ -z "$SID" ]; then
  echo "session_id を特定できません (CLAUDE_CODE_SESSION_ID 未設定)" >&2
  exit 2
fi

FILE="$DIR/$SID.json"
if [ ! -f "$FILE" ]; then
  echo "このセッションの残量データがありません ($FILE)" >&2
  exit 1
fi

NOW=$(date +%s)
MTIME=$(stat -f %m "$FILE" 2>/dev/null || stat -c %Y "$FILE" 2>/dev/null || echo "$NOW")
AGE=$(( NOW - MTIME ))

jq -r --argjson age "$AGE" '
  def rem($u): if $u == null then "?" else ((100 - ($u | floor)) | tostring) end;
  def val($v): if $v == null then "?" else ($v | tostring) end;
  "ctx \(rem(.contextWindowPercent))%"
  + " | 5h \(rem(.sessionUsagePercent))% 残\(val(.sessionRemaining))→\(val(.sessionReset))"
  + " | 週 \(rem(.weeklyUsagePercent))% 残\(val(.weeklyRemaining))→\(val(.weeklyReset))"
  + " | 今日 \(val(.todayUsed))/\(val(.weeklyPerDay))pp"
  + (if $age > 120 then "  (\(($age / 60) | floor) 分前の値)" else "" end)
' "$FILE"
