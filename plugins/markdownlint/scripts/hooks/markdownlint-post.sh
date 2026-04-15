#!/bin/bash
# PostToolUse hook: Write/Edit 後に markdownlint を実行
# Config 探索: repo-local → ~/.markdownlint.jsonc → plugin 同梱 default
set -euo pipefail

file=$(jq -r '.tool_response.filePath // .tool_input.file_path')
[[ "$file" == *.md ]] || exit 0

# Walk upward from target looking for repo-local markdownlint config
find_local_config() {
  local dir
  dir=$(cd "$(dirname "$1")" 2>/dev/null && pwd) || return 1
  while [ -n "$dir" ] && [ "$dir" != "/" ]; do
    for name in .markdownlint-cli2.jsonc .markdownlint-cli2.yaml \
                .markdownlint-cli2.yml .markdownlint-cli2.cjs \
                .markdownlint-cli2.mjs .markdownlint.jsonc \
                .markdownlint.json .markdownlint.yaml .markdownlint.yml; do
      [ -f "$dir/$name" ] && return 0
    done
    dir=$(dirname "$dir")
  done
  return 1
}

# Determine config and execute
if find_local_config "$file"; then
  # Repo-local config exists - let cli2 auto-discover
  result=$(npx -y markdownlint-cli2 "$file" 2>&1) && exit 0
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

printf '{"systemMessage":"\\n\\u001b[31m%s\\u001b[0m\\n%s\\u001b[31m%s\\u001b[0m\\n","hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"markdownlint エラーが %s 件検出されました。以下のエラーを修正してください:\\n%s"}}' \
  "$header" "$escaped_display" "$footer" "$count" "$escaped_context"
