#!/bin/bash
set -uo pipefail
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
# セクション別に分離して出力する
# Highlights/CLI changelog → 公式の要約・補足
# Flags/CLI surface → 事実ベース（diff 由来）
# System prompt changes/Other prompt changes → diff からの推測的解釈
# Metadata → 統計情報
COMMUNITY_VERSIONS=$(collect_versions "marckrenn/claude-code-changelog")
COMMUNITY_HIGHLIGHTS=""
COMMUNITY_FLAGS=""
COMMUNITY_CLI_SURFACE=""
COMMUNITY_PROMPT_CHANGES=""
COMMUNITY_METADATA=""
# セクション抽出ヘルパー: 指定ヘッダーから次の ### までを抽出
extract_section() {
  local body="$1"
  local header="$2"
  echo "$body" | awk -v h="### $header" '
    $0 == h { found=1; next }
    found && /^### / { found=0 }
    found { print }
  '
}

if [ -n "$COMMUNITY_VERSIONS" ]; then
  for TAG in $COMMUNITY_VERSIONS; do
    BODY=$(gh release view "$TAG" --repo marckrenn/claude-code-changelog --json body -q '.body' 2>&1)
    if [ $? -ne 0 ]; then
      echo "[changelog-fetch] gh release view failed for $TAG (marckrenn/claude-code-changelog): $BODY" >&2
      BODY=""
    fi
    if [ -n "$BODY" ]; then
      # Highlights: 本文冒頭（最初の ### より前）から抽出
      HIGHLIGHTS=$(echo "$BODY" | awk '
        /^### / { exit }
        /^Highlights:/ { found=1; next }
        found { print }
      ')
      if [ -n "$HIGHLIGHTS" ]; then
        COMMUNITY_HIGHLIGHTS="${COMMUNITY_HIGHLIGHTS}#### ${TAG}
${HIGHLIGHTS}

"
      fi

      # Flags（CLI surface: サブセクションを分離）
      FLAGS_RAW=$(extract_section "$BODY" "Flags")
      if [ -n "$FLAGS_RAW" ]; then
        # CLI surface: 行より前を Flags として抽出
        FLAGS=$(echo "$FLAGS_RAW" | awk '/^CLI surface:/ { exit } { print }')
        # CLI surface: 行以降を CLI surface として抽出
        CLI_SURFACE=$(echo "$FLAGS_RAW" | awk '/^CLI surface:/ { found=1 } found { print }')

        if [ -n "$FLAGS" ]; then
          COMMUNITY_FLAGS="${COMMUNITY_FLAGS}#### ${TAG}
${FLAGS}

"
        fi
        if [ -n "$CLI_SURFACE" ]; then
          COMMUNITY_CLI_SURFACE="${COMMUNITY_CLI_SURFACE}#### ${TAG}
${CLI_SURFACE}

"
        fi
      fi

      # System prompt changes + Other prompt changes
      PROMPT_CHANGES=$(extract_section "$BODY" "System prompt changes")
      OTHER_PROMPT=$(extract_section "$BODY" "Other prompt changes")
      COMBINED_PROMPT=""
      [ -n "$PROMPT_CHANGES" ] && COMBINED_PROMPT="${PROMPT_CHANGES}"
      if [ -n "$OTHER_PROMPT" ]; then
        [ -n "$COMBINED_PROMPT" ] && COMBINED_PROMPT="${COMBINED_PROMPT}
"
        COMBINED_PROMPT="${COMBINED_PROMPT}${OTHER_PROMPT}"
      fi
      if [ -n "$COMBINED_PROMPT" ]; then
        COMMUNITY_PROMPT_CHANGES="${COMMUNITY_PROMPT_CHANGES}#### ${TAG}
${COMBINED_PROMPT}

"
      fi

      # Metadata
      METADATA=$(extract_section "$BODY" "Metadata")
      if [ -n "$METADATA" ]; then
        COMMUNITY_METADATA="${COMMUNITY_METADATA}#### ${TAG}
${METADATA}

"
      fi
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
  OUTPUT="${OUTPUT}### [信頼度: 高] 公式 changelog (anthropics/claude-code)
${OFFICIAL_BODY}"
fi

if [ -n "$COMMUNITY_HIGHLIGHTS" ]; then
  OUTPUT="${OUTPUT}### [信頼度: 中] コミュニティ Highlights (marckrenn)
${COMMUNITY_HIGHLIGHTS}"
fi

if [ -n "$COMMUNITY_FLAGS" ]; then
  OUTPUT="${OUTPUT}### [信頼度: 中] コミュニティ Flags (marckrenn)
${COMMUNITY_FLAGS}"
fi

if [ -n "$COMMUNITY_CLI_SURFACE" ]; then
  OUTPUT="${OUTPUT}### [信頼度: 中] コミュニティ CLI surface (marckrenn)
${COMMUNITY_CLI_SURFACE}"
fi

if [ -n "$COMMUNITY_PROMPT_CHANGES" ]; then
  OUTPUT="${OUTPUT}### [信頼度: 低] コミュニティ プロンプト変更 (marckrenn)
※ diff からの推測的解釈。誤認リスクあり
${COMMUNITY_PROMPT_CHANGES}"
fi

if [ -n "$COMMUNITY_METADATA" ]; then
  OUTPUT="${OUTPUT}### [参考] Metadata (marckrenn)
${COMMUNITY_METADATA}"
fi

if [ -n "$COMMUNITY_DIFF" ]; then
  OUTPUT="${OUTPUT}### [信頼度: 中] 変更 diff
${COMMUNITY_DIFF}
"
fi

# どのソースも取得できなかった場合
HAS_ANY=""
[ -n "$OFFICIAL_BODY" ] && HAS_ANY=1
[ -n "$COMMUNITY_HIGHLIGHTS" ] && HAS_ANY=1
[ -n "$COMMUNITY_FLAGS" ] && HAS_ANY=1
[ -n "$COMMUNITY_PROMPT_CHANGES" ] && HAS_ANY=1
[ -n "$COMMUNITY_DIFF" ] && HAS_ANY=1
if [ -z "$HAS_ANY" ]; then
  OUTPUT="${OUTPUT}（changelog の取得に失敗しました）
"
fi

echo "$OUTPUT"
