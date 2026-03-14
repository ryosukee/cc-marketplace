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

  # 2. 旧バージョンキャッシュから探索
  local cache_base="$HOME/.claude/plugins/cache/mj-tools/version-check"
  if [ ! -d "$cache_base" ]; then
    return 0
  fi

  # バージョンソート関数
  local version_sort_cmd="sort -t. -k1,1n -k2,2n -k3,3n"
  if command -v gsort &>/dev/null; then
    version_sort_cmd="gsort -V"
  fi

  # 旧キャッシュの last-version を探し、最新バージョンのものを使う
  local found=""
  for candidate in "$cache_base"/*/internal/version/last-version; do
    [ -f "$candidate" ] || continue
    # 現在のキャッシュは除外（まだファイルがないので基本的にスキップされる）
    if [ "$candidate" = "$version_file" ]; then
      continue
    fi
    found="$candidate"
  done

  # 複数ある場合は最新バージョンのものを選択
  if [ -n "$found" ]; then
    local latest
    latest=$(
      for f in "$cache_base"/*/internal/version/last-version; do
        [ -f "$f" ] || continue
        [ "$f" = "$version_file" ] && continue
        # パスからバージョンを抽出
        echo "$f" | sed "s|$cache_base/||" | cut -d/ -f1
      done | $version_sort_cmd | tail -1
    )

    if [ -n "$latest" ]; then
      local source_file="$cache_base/$latest/internal/version/last-version"
      if [ -f "$source_file" ]; then
        LAST_VERSION=$(cat "$source_file")
        # 新しいキャッシュにコピー
        mkdir -p "$(dirname "$version_file")"
        cp "$source_file" "$version_file"
      fi
    fi
  fi
}
