#!/bin/bash
set -euo pipefail

mkdir -p .claude/rules
printf '# コーディング規約\n\n- 変数は "$VAR" でクォート\n- 関数名は snake_case\n' > .claude/rules/coding.md
printf '# 命名規約\n' > .claude/rules/naming.md
