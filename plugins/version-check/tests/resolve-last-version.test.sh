#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$script_dir/../scripts/lib/resolve-last-version.sh"

test_root="$(mktemp -d)"
trap 'rm -r -- "$test_root"' EXIT
export VERSION_CHECK_CACHE_ROOT="$test_root/cache"
export CLAUDE_PLUGIN_ROOT="$VERSION_CHECK_CACHE_ROOT/agent-plugins-marketplace/version-check/0.10.3"

old_file="$VERSION_CHECK_CACHE_ROOT/cc-tools/version-check/0.10.0/internal/version/last-version"
current_file="$CLAUDE_PLUGIN_ROOT/internal/version/last-version"
mkdir -p "$(dirname "$old_file")"
printf 'old-id\n' > "$old_file"
resolve_last_version
test "$LAST_VERSION" = old-id
test "$(< "$current_file")" = old-id

rm -- "$current_file"
new_file="$VERSION_CHECK_CACHE_ROOT/agent-plugins-marketplace/version-check/0.10.2/internal/version/last-version"
mkdir -p "$(dirname "$new_file")"
printf 'new-id\n' > "$new_file"
resolve_last_version
test "$LAST_VERSION" = new-id
test "$(< "$current_file")" = new-id

printf 'current\n' > "$current_file"
resolve_last_version
test "$LAST_VERSION" = current

printf '%s\n' 'resolve-last-version: 3 cases passed'
