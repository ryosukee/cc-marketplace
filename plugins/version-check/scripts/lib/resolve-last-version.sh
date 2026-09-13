#!/bin/bash
# last-version を解決する共通ライブラリ
# CLAUDE_PLUGIN_ROOT 内の internal/version/last-version を優先し、
# なければ旧バージョンキャッシュから探索・コピーする
#
# 使い方: source して resolve_last_version を呼ぶ
# 出力: LAST_VERSION 変数にセット（見つからなければ空文字）

set -euo pipefail

resolve_last_version() {
  local plugin_root="${CLAUDE_PLUGIN_ROOT:-}"
  local version_file="${plugin_root}/internal/version/last-version"
  LAST_VERSION=""

  # 1. 現在のキャッシュに last-version があればそれを使う
  if [ -f "$version_file" ]; then
    LAST_VERSION=$(cat "$version_file")
    return 0
  fi

  # バージョンソート関数
  local version_sort_cmd="sort -t. -k1,1n -k2,2n -k3,3n"
  if command -v gsort &>/dev/null; then
    version_sort_cmd="gsort -V"
  fi

  # 現 ID の旧版を優先し、無ければ旧 marketplace ID の cache を移行する
  local cache_root="${VERSION_CHECK_CACHE_ROOT:-$HOME/.claude/plugins/cache}"
  local cache_base latest source_file
  for cache_base in \
    "$cache_root/agent-plugins-marketplace/version-check" \
    "$cache_root/cc-tools/version-check"; do
    [ -d "$cache_base" ] || continue
    latest=$(
      for f in "$cache_base"/*/internal/version/last-version; do
        [ -f "$f" ] || continue
        [ "$f" = "$version_file" ] && continue
        echo "$f" | sed "s|$cache_base/||" | cut -d/ -f1
      done | $version_sort_cmd | tail -1
    )
    if [ -n "$latest" ]; then
      source_file="$cache_base/$latest/internal/version/last-version"
      LAST_VERSION=$(cat "$source_file")
      mkdir -p "$(dirname "$version_file")"
      cp "$source_file" "$version_file"
      return 0
    fi
  done
}
