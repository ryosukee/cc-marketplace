#!/bin/bash
# 公式 CHANGELOG.md の全文を取り、FROM の次の版から TO までの節を stdout に出す
# 引数: $1 = FROM (含まない), $2 = TO (含む)。どちらも "2.1.126" の形
# Exit: 0 = 出力あり, 1 = 範囲に版が無い, 2 = 前提条件エラー (gh が無い・取得失敗)
set -euo pipefail

FROM="${1:-}"
TO="${2:-}"
if [ -z "$FROM" ] || [ -z "$TO" ]; then
  echo "Usage: $0 FROM TO" >&2
  exit 2
fi

command -v gh >/dev/null 2>&1 || { echo "changelog の取得には gh CLI が必要" >&2; exit 2; }

BODY=$(gh api repos/anthropics/claude-code/contents/CHANGELOG.md -H 'Accept: application/vnd.github.raw' 2>&1) \
  || { echo "CHANGELOG.md の取得に失敗: $BODY" >&2; exit 2; }

# 版の見出しは "## 2.1.126"。CHANGELOG は新しい版が上にあるので、
# TO の見出しから FROM の見出しの直前までを切り出す
version_gt() { [ "$(printf '%s\n%s\n' "$1" "$2" | sort -t. -k1,1n -k2,2n -k3,3n | tail -1)" = "$1" ] && [ "$1" != "$2" ]; }

OUT=$(printf '%s\n' "$BODY" | awk -v from="$FROM" -v to="$TO" '
  function gt(a, b,   x, y, i, n, m) {
    n = split(a, x, "."); m = split(b, y, ".");
    for (i = 1; i <= 3; i++) { if (x[i]+0 > y[i]+0) return 1; if (x[i]+0 < y[i]+0) return 0 }
    return 0
  }
  /^## [0-9]+\.[0-9]+\.[0-9]+/ {
    ver = $2
    inrange = (!gt(ver, to)) && gt(ver, from)
  }
  inrange { print }
')

if [ -z "$OUT" ]; then
  echo "v${FROM} より後、v${TO} 以下の版が CHANGELOG.md に無い" >&2
  exit 1
fi

echo "Claude Code の changelog: v${FROM} の次から v${TO} まで（公式 CHANGELOG.md）"
echo
printf '%s\n' "$OUT"
