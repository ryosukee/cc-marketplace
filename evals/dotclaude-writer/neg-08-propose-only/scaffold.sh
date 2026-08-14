#!/bin/bash
set -euo pipefail

mkdir -p .claude/rules
printf '# コーディング規約\n' > .claude/rules/coding.md
printf '# 命名規約\n' > .claude/rules/naming.md
