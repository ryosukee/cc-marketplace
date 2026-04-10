#!/bin/bash
# SessionStart hook: check for plugin updates (check only, no auto-update)
set -euo pipefail

MARKETPLACES_DIR="$HOME/.claude/plugins/marketplaces"

# 1. Update all marketplaces to get latest info
claude plugin marketplace update >/dev/null 2>&1 || true

# 2. Compare installed vs marketplace versions
updatable=()
total=0

while IFS=$'\t' read -r id installed_version; do
  total=$((total + 1))
  plugin_name="${id%%@*}"
  marketplace="${id#*@}"

  # Find latest version from marketplace plugin.json
  plugin_json="$MARKETPLACES_DIR/$marketplace/plugins/$plugin_name/.claude-plugin/plugin.json"
  # Also check root-level plugin (e.g. omnis-blueprints)
  if [ ! -f "$plugin_json" ]; then
    plugin_json="$MARKETPLACES_DIR/$marketplace/.claude-plugin/plugin.json"
  fi
  [ -f "$plugin_json" ] || continue

  latest_version=$(jq -r '.version // empty' "$plugin_json" 2>/dev/null) || continue
  [ -n "$latest_version" ] || continue

  if [ "$installed_version" != "$latest_version" ]; then
    updatable+=("$id ($installed_version → $latest_version)")
  fi
done < <(claude plugin list --json 2>/dev/null | jq -r '.[] | [.id, .version] | @tsv')

# 3. Output result
if [ ${#updatable[@]} -eq 0 ]; then
  exit 0
fi

update_lines=""
update_cmds=""
for item in "${updatable[@]}"; do
  plugin_id="${item%% (*}"
  update_lines="${update_lines}\n  ${item}"
  update_cmds="${update_cmds}\n  claude plugin update ${plugin_id}"
done

cat <<EOF
{
  "systemMessage": "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⬆ ${#updatable[@]}/${total} plugins have updates:${update_lines}\n\nRun to update:${update_cmds}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}
EOF
