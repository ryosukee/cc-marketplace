#!/bin/bash
# changelog 取得スクリプト
# 引数: $1 = LAST_VERSION, $2 = CURRENT_VERSION
# 結果は標準出力に出力（ファイルへの書き込みなし）

LAST_VERSION="$1"
CURRENT_VERSION="$2"

if [ -z "$LAST_VERSION" ] || [ -z "$CURRENT_VERSION" ]; then
  echo "Usage: $0 LAST_VERSION CURRENT_VERSION"
  exit 1
fi

# バージョンソート関数（macOS 互換）
# gsort -V があれば使い、なければ sort -t. -k1,1n -k2,2n -k3,3n で代替
version_sort() {
  if command -v gsort &>/dev/null; then
    gsort -V
  else
    sort -t. -k1,1n -k2,2n -k3,3n
  fi
}

# gh コマンドが使えるか確認
if ! command -v gh &>/dev/null; then
  echo "changelog 取得には gh CLI が必要です"
  exit 0
fi

# LAST_VERSION より新しく CURRENT_VERSION 以下のタグを収集する関数
collect_versions() {
  local REPO="$1"
  local RELEASES
  RELEASES=$(gh release list --repo "$REPO" --limit 30 --json tagName -q '.[].tagName' 2>&1)
  if [ $? -ne 0 ]; then
    echo "[changelog-fetch] gh release list failed for $REPO: $RELEASES" >&2
    return
  fi
  if [ -z "$RELEASES" ]; then
    return
  fi
  for TAG in $RELEASES; do
    VER="${TAG#v}"
    if [ "$(printf '%s\n%s' "$LAST_VERSION" "$VER" | version_sort | head -1)" = "$LAST_VERSION" ] && \
       [ "$VER" != "$LAST_VERSION" ] && \
       [ "$(printf '%s\n%s' "$VER" "$CURRENT_VERSION" | version_sort | tail -1)" = "$CURRENT_VERSION" ]; then
      echo "$TAG"
    fi
  done
}

# --- 公式 changelog ---
OFFICIAL_VERSIONS=$(collect_versions "anthropics/claude-code")
OFFICIAL_BODY=""
if [ -n "$OFFICIAL_VERSIONS" ]; then
  for TAG in $OFFICIAL_VERSIONS; do
    BODY=$(gh release view "$TAG" --repo anthropics/claude-code --json body -q '.body' 2>&1)
    if [ $? -ne 0 ]; then
      echo "[changelog-fetch] gh release view failed for $TAG (anthropics/claude-code): $BODY" >&2
      BODY=""
    fi
    if [ -n "$BODY" ]; then
      OFFICIAL_BODY="${OFFICIAL_BODY}#### ${TAG}
${BODY}

"
    fi
  done
fi

# --- コミュニティ changelog (marckrenn/claude-code-changelog) ---
COMMUNITY_VERSIONS=$(collect_versions "marckrenn/claude-code-changelog")
COMMUNITY_BODY=""
if [ -n "$COMMUNITY_VERSIONS" ]; then
  for TAG in $COMMUNITY_VERSIONS; do
    BODY=$(gh release view "$TAG" --repo marckrenn/claude-code-changelog --json body -q '.body' 2>&1)
    if [ $? -ne 0 ]; then
      echo "[changelog-fetch] gh release view failed for $TAG (marckrenn/claude-code-changelog): $BODY" >&2
      BODY=""
    fi
    if [ -n "$BODY" ]; then
      COMMUNITY_BODY="${COMMUNITY_BODY}#### ${TAG}
${BODY}

"
    fi
  done
fi

# --- コミュニティ commit diff ---
# メタデータ・インデックス系を除外し、意味のある変更ファイルの diff を取得
# 除外: indices/, meta/metadata.md, meta/prompt-stats.md, README.md
# 各ファイルの patch が 5000 bytes 以上の場合もスキップ（巨大な変更はリリースノートで十分）
COMMUNITY_DIFF=""
DIFF_ERR=$(mktemp)
DIFF_DATA=$(gh api "repos/marckrenn/claude-code-changelog/compare/v${LAST_VERSION}...v${CURRENT_VERSION}" \
  --jq '[.files[] | select(
    (.filename | startswith("indices/") | not) and
    (.filename != "README.md") and
    (.filename != "meta/metadata.md") and
    (.filename != "meta/prompt-stats.md")
  ) | select(.patch != null)
    | select(.patch | length > 0)
    | select(.patch | length < 5000)
    | {filename, patch}]' 2>"$DIFF_ERR")
if [ $? -ne 0 ]; then
  echo "[changelog-fetch] gh api compare failed: $(cat "$DIFF_ERR")" >&2
  DIFF_DATA=""
fi
rm -f "$DIFF_ERR"

if [ -n "$DIFF_DATA" ] && [ "$DIFF_DATA" != "[]" ]; then
  COMMUNITY_DIFF=$(echo "$DIFF_DATA" | jq -r '.[] | "**\(.filename)**\n```diff\n\(.patch)\n```\n"' 2>/dev/null)
fi

# 出力を組み立て
OUTPUT="Claude Code が v${LAST_VERSION} → v${CURRENT_VERSION} にアップデートされました

"

if [ -n "$OFFICIAL_BODY" ]; then
  OUTPUT="${OUTPUT}### 公式 changelog (anthropics/claude-code)
${OFFICIAL_BODY}"
fi

if [ -n "$COMMUNITY_BODY" ]; then
  OUTPUT="${OUTPUT}### コミュニティ changelog (marckrenn/claude-code-changelog)
${COMMUNITY_BODY}"
fi

if [ -n "$COMMUNITY_DIFF" ]; then
  OUTPUT="${OUTPUT}### 変更 diff
${COMMUNITY_DIFF}
"
fi

# どちらも取得できなかった場合
if [ -z "$OFFICIAL_BODY" ] && [ -z "$COMMUNITY_BODY" ] && [ -z "$COMMUNITY_DIFF" ]; then
  OUTPUT="${OUTPUT}（changelog の取得に失敗しました）
"
fi

echo "$OUTPUT"
