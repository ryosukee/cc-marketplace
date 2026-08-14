#!/bin/bash
set -euo pipefail

mkdir -p docs .claude/rules
printf '# スタイルガイド\n\n- 見出しは名詞句にする\n' > docs/style-guide.md
