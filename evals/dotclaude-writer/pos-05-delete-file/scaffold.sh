#!/bin/bash
set -euo pipefail

mkdir -p .claude/rules
printf '# 旧スタイル規約 (廃止予定)\n' > .claude/rules/deprecated-style.md
