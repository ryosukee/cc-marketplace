#!/bin/bash
set -euo pipefail

mkdir -p rules .claude/rules
printf '# Markdown 整形規約\n\n- 見出しのレベルを飛ばさなさい\n' > rules/markdown-formatting.md
printf '# コーディング規約\n' > .claude/rules/coding.md
