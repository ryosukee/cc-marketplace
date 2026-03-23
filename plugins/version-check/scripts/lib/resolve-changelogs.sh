#!/bin/bash
# changelogs を旧キャッシュから解決する共通ライブラリ
# CLAUDE_PLUGIN_ROOT 内の internal/changelogs/ が空なら
# 旧バージョンキャッシュから探索・コピーする
#
# 使い方: source して resolve_changelogs を呼ぶ

set -euo pipefail

resolve_changelogs() {
  local plugin_root="${CLAUDE_PLUGIN_ROOT:-}"
  local changelogs_dir="${plugin_root}/internal/changelogs"

  # 既に changelogs が存在すればスキップ
  if [ -d "$changelogs_dir" ] && [ -n "$(ls -A "$changelogs_dir"/*.json 2>/dev/null)" ]; then
    return 0
  fi

  # 旧バージョンキャッシュから探索
  local cache_base="$HOME/.claude/plugins/cache/mj-tools/version-check"
  if [ ! -d "$cache_base" ]; then
    return 0
  fi

  # バージョンソート関数
  local version_sort_cmd="sort -t. -k1,1n -k2,2n -k3,3n"
  if command -v gsort &>/dev/null; then
    version_sort_cmd="gsort -V"
  fi

  # 旧キャッシュで changelogs を持つ最新バージョンを探す
  local latest
  latest=$(
    for d in "$cache_base"/*/internal/changelogs; do
      [ -d "$d" ] || continue
      # 現在のキャッシュは除外
      [ "$d" = "$changelogs_dir" ] && continue
      # JSON ファイルが 1 つ以上あるか
      ls "$d"/*.json &>/dev/null || continue
      # パスからバージョンを抽出
      echo "$d" | sed "s|$cache_base/||" | cut -d/ -f1
    done | $version_sort_cmd | tail -1
  )

  if [ -n "$latest" ]; then
    local source_dir="$cache_base/$latest/internal/changelogs"
    if [ -d "$source_dir" ]; then
      mkdir -p "$changelogs_dir"
      cp "$source_dir"/*.json "$changelogs_dir/" 2>/dev/null || true
    fi
  fi
}
