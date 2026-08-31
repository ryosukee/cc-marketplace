#!/usr/bin/env bash
# claude-html-communication で生成したページの検証エントリ。
# 3 層の検査を順に実行し、指摘を JSON で stdout に集約する。
#   1. html-validate@11 (構文・a11y・document。ルールは同梱の htmlvalidate.json)
#   2. linkinator@8 --check-fragments (リンク・同一ページ fragment の存在)
#   3. check-page.mjs (雛形固有の検査 18 種: フォント段階・セル長・caption 対応・脚注対応・
#      Readability・文長・参照マーカーの器・参照の初出順・識別子の補足・図番号の連番・
#      見出しの系統・設問数の突合・回答済みマーカー・一括承認・設問見出しの形・
#      列見出しの器の語・既定 checked・前景色の opacity)
#      + grep (div/span onclick)
# Exit: 0=指摘なし, 1=指摘あり, 2=前提条件エラー
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: validate-page.sh <page.html>..." >&2
  exit 2
fi
command -v node >/dev/null 2>&1 || { echo "node が見つからない" >&2; exit 2; }
command -v npx >/dev/null 2>&1 || { echo "npx が見つからない" >&2; exit 2; }
for f in "$@"; do
  [ -f "$f" ] || { echo "ファイルが無い: $f" >&2; exit 2; }
done

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG="$SCRIPT_DIR/htmlvalidate.json"
CHECKER="$SCRIPT_DIR/check-page.mjs"
# キャッシュ済みならネットワークに出ない。初回のみダウンロードが走る
NPX=(npx --prefer-offline --yes)

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# 1. html-validate。exit 1 は「指摘あり」なので握りつぶして JSON を回収する
"${NPX[@]}" html-validate@11 --config "$CONFIG" --formatter json "$@" \
  > "$tmp/hv.json" 2> "$tmp/hv.err" || true
if ! jq -e . "$tmp/hv.json" >/dev/null 2>&1; then
  echo "html-validate が JSON を返さなかった:" >&2
  cat "$tmp/hv.err" >&2
  exit 2
fi

# 2. linkinator (ページ単位。--format json で回収)
# exit 1 は「破損リンクあり」なので失敗扱いにしない。JSON が壊れているときだけ前提条件エラー
: > "$tmp/links.jsonl"
for f in "$@"; do
  "${NPX[@]}" linkinator@8 "$f" --check-fragments --format json > "$tmp/link.json" 2> "$tmp/link.err" || true
  if ! jq -e .links "$tmp/link.json" >/dev/null 2>&1; then
    echo "linkinator が JSON を返さなかった: $f" >&2
    cat "$tmp/link.err" >&2
    exit 2
  fi
  jq -c --arg f "$f" '{file: $f, broken: [.links[] | select(.state == "BROKEN") | {url, status}]}' \
    "$tmp/link.json" >> "$tmp/links.jsonl"
done

# 3. 雛形固有の検査 + onclick grep
rc=0; node "$CHECKER" "$@" > "$tmp/custom.json" || rc=$?
if [ "$rc" -ge 2 ]; then
  echo "check-page.mjs が失敗 (exit $rc)" >&2
  exit 2
fi
: > "$tmp/onclick.jsonl"
for f in "$@"; do
  hits=$(grep -nEo '<(div|span)[^>]*onclick' "$f" || true)
  [ -n "$hits" ] && jq -nc --arg f "$f" --arg h "$hits" '{file: $f, hits: ($h | split("\n"))}' >> "$tmp/onclick.jsonl"
done

# 集約
jq -n \
  --slurpfile hv "$tmp/hv.json" \
  --slurpfile custom "$tmp/custom.json" \
  --slurpfile links <(jq -s . "$tmp/links.jsonl") \
  --slurpfile onclick <(jq -s . "$tmp/onclick.jsonl") '
  {
    htmlValidate: [$hv[0][] | select(.messages | length > 0)
      | {file: .filePath, messages: [.messages[] | {line, rule: .ruleId, message}]}],
    brokenLinks: [$links[0][] | select(.broken | length > 0)],
    custom: $custom[0].results,
    onclick: $onclick[0],
    total: (
      ([$hv[0][].messages | length] | add // 0)
      + ([$links[0][].broken | length] | add // 0)
      + $custom[0].total
      + ([$onclick[0][].hits | length] | add // 0)
    )
  }' > "$tmp/out.json"

cat "$tmp/out.json"
[ "$(jq -r '.total' "$tmp/out.json")" -eq 0 ] || exit 1
