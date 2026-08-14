#!/bin/bash
set -euo pipefail

mkdir -p .claude/rules
printf '# 命名規約\n\n- kebab-case を使う\n' > .claude/rules/naming.md
