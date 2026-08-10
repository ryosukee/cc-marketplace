#!/bin/bash
set -euo pipefail

mkdir -p .claude/rules
printf '# コーディング規約\n\n- 変数は "$VAR" でクォート\n' > .claude/rules/coding.md
