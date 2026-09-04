#!/usr/bin/env bash
# 共通ページの連番を取り、同じ操作でそのファイル名を占有する。
#
# usage:
#   claim-page-number.sh <共通ページディレクトリ> <略号> <f|r>
#
# ディレクトリ内の {略号}-{種別}{NNN}.html の最大連番 + 1 から順に、
# noclobber の > で 0 バイトのファイルを作れるまで試す。noclobber の > は
# 既存ファイルがあると失敗するので、走査してから書くまでの隙間で
# 別セッションが同じ番号を取ることがない。
#
# 確保したファイルの絶対パスを stdout に出す。中身は 0 バイトで、
# assemble-page.mjs はこの予約に対してだけ上書きを許す。
#
# Exit: 0 = 確保した, 1 = 空き番号が見つからない, 2 = 前提条件エラー
set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "usage: claim-page-number.sh <共通ページディレクトリ> <略号> <f|r>" >&2
  exit 2
fi

dir=$1
slug=$2
kind=$3

if [ ! -d "$dir" ]; then
  echo "共通ページディレクトリが無い: $dir" >&2
  exit 2
fi
case "$kind" in
  f | r) ;;
  *)
    echo "種別は f (form) か r (report): $kind" >&2
    exit 2
    ;;
esac
case "$slug" in
  *[!a-z0-9]*)
    echo "略号は英小文字と数字だけ: $slug" >&2
    exit 2
    ;;
esac

# 既存の最大連番を読む。{略号}-{種別}NNN.html だけを数え、
# ccm-f072-v6.html のようなサブページは 3 桁 + .html に一致しないので入らない
max=0
for f in "$dir/$slug-$kind"[0-9][0-9][0-9].html; do
  [ -e "$f" ] || continue
  n=${f##*/}
  n=${n#"$slug-$kind"}
  n=${n%.html}
  n=$((10#$n))
  if [ "$n" -gt "$max" ]; then
    max=$n
  fi
done

# ここから先は「作れたら自分のもの」。失敗したら次の番号へ回る
set -o noclobber
n=$((max + 1))
limit=$((max + 100))
while [ "$n" -le "$limit" ]; do
  path=$(printf '%s/%s-%s%03d.html' "$dir" "$slug" "$kind" "$n")
  # リダイレクトは左から順に処理される。noclobber の失敗はシェルが出すので、
  # 2> /dev/null を > より先に置かないと「cannot overwrite existing file」が漏れる
  if : 2> /dev/null > "$path"; then
    printf '%s\n' "$path"
    exit 0
  fi
  n=$((n + 1))
done

echo "空き番号が見つからない ($((max + 1)) から $limit まで試した)" >&2
exit 1
