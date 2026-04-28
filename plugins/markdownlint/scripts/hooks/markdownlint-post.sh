#!/bin/bash
# PostToolUse hook: Write/Edit 後に markdownlint を実行
# Config 探索: repo-local → ~/.markdownlint.jsonc → plugin 同梱 default
#
# Repo-local 設定を見つけたらそのディレクトリに cd してから cli2 を実行する。
# --config 指定だけではルール設定は上書きできるが、.markdownlint-cli2.jsonc の
# customRules は cwd から別系統で auto-discovery されるため、cwd (Claude Code の
# セッション dir) にある設定が意図せず追加適用されてしまう。customRules 解決は
# 実行時の cwd 基準なので、対象リポジトリの外から実行するとモジュール解決が
# 失敗する。cd して cwd を対象リポジトリに切り替えるのが確実。
set -euo pipefail

file=$(jq -r '.tool_response.filePath // .tool_input.file_path')
[[ "$file" == *.md ]] || exit 0

# Walk upward from target looking for repo-local markdownlint config.
# On success, sets LOCAL_CONFIG_PATH to the absolute path of the found config.
LOCAL_CONFIG_PATH=""
find_local_config() {
  local dir
  dir=$(cd "$(dirname "$1")" 2>/dev/null && pwd) || return 1
  while [ -n "$dir" ] && [ "$dir" != "/" ]; do
    for name in .markdownlint-cli2.jsonc .markdownlint-cli2.yaml \
                .markdownlint-cli2.yml .markdownlint-cli2.cjs \
                .markdownlint-cli2.mjs .markdownlint.jsonc \
                .markdownlint.json .markdownlint.yaml .markdownlint.yml; do
      if [ -f "$dir/$name" ]; then
        LOCAL_CONFIG_PATH="$dir/$name"
        return 0
      fi
    done
    dir=$(dirname "$dir")
  done
  return 1
}

# Determine config and execute
if find_local_config "$file"; then
  local_dir="$(dirname "$LOCAL_CONFIG_PATH")"
  result=$(cd "$local_dir" && npx -y markdownlint-cli2 "$file" 2>&1) && exit 0
elif [ -f "$HOME/.markdownlint.jsonc" ]; then
  result=$(npx -y markdownlint-cli2 --config "$HOME/.markdownlint.jsonc" "$file" 2>&1) && exit 0
else
  result=$(npx -y markdownlint-cli2 --config "${CLAUDE_PLUGIN_ROOT}/config/.markdownlint.jsonc" "$file" 2>&1) && exit 0
fi

# Extract error lines
errors=$(echo "$result" | grep -E '^.+:[0-9]+' | head -10)
count=$(echo "$errors" | wc -l | tr -d ' ')

if [ -z "$errors" ]; then
  exit 0
fi

escaped_display=$(echo "$errors" | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}')
escaped_context=$(echo "$errors" | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}')

header="━━━ markdownlint ERROR (${count}件) ━━━"
footer="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

context="markdownlint エラーが ${count} 件検出されました。以下の手順で対応してください。\\n\\n"
context+="1. 全エラーを分類し、修正すべきものとプロジェクトで不要なものに仕分けする\\n"
context+="2. 修正すべきエラーは全て把握した上で、可能な限り少ない Edit で一括修正する。同一ファイルに複数の Edit が必要な場合は並列で送信せず 1 つずつ順に適用する（並列 Edit は各 Edit 直後に hook が中間状態を報告し、最終状態の誤認につながる）\\n"
context+="3. プロジェクトの方針上スルーしてよいエラーがある場合は、理由を添えてユーザーに承認を求める。承認されたら、プロジェクトルートの markdownlint 設定ファイルに該当ルールの無効化を追加することを提案する\\n\\n"
context+="エラー一覧:\\n${escaped_context}"

printf '{"systemMessage":"\\n\\u001b[31m%s\\u001b[0m\\n%s\\u001b[31m%s\\u001b[0m\\n","hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"%s"}}' \
  "$header" "$escaped_display" "$footer" "$context"
