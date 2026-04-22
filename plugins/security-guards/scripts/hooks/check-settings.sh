#!/bin/bash
set -euo pipefail

SETTINGS_FILE="$HOME/.claude/settings.json"

if [[ ! -f "$SETTINGS_FILE" ]]; then
  printf '{"systemMessage":"[security-guards] WARNING: %s が見つかりません。credentials 保護の settings.json 設定が未適用の可能性があります。詳細は security-guards plugin の README を参照してください。"}\n' "$SETTINGS_FILE"
  exit 0
fi

missing=()

if ! jq -e '.permissions.deny[]? | select(test("netrc"))' "$SETTINGS_FILE" > /dev/null 2>&1; then
  missing+=("permissions.deny に netrc 関連ルールがない")
fi

if ! jq -e '.sandbox.filesystem.denyRead[]? | select(test("netrc"))' "$SETTINGS_FILE" > /dev/null 2>&1; then
  missing+=("sandbox.filesystem.denyRead に netrc がない")
fi

if [[ ${#missing[@]} -gt 0 ]]; then
  msg="[security-guards] WARNING: settings.json に推奨設定が不足しています: ${missing[*]}。詳細は security-guards plugin の README を参照してください。"
  printf '{"systemMessage":"%s"}\n' "$msg"
fi

exit 0
