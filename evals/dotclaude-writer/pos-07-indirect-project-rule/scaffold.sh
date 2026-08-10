#!/bin/bash
set -euo pipefail

mkdir -p .claude/rules
printf '# CLAUDE.md\n\nプロジェクト固有のルールは .claude/rules/ 配下に置く。\n' > CLAUDE.md
printf '# コミット規約\n\n- 1 コミット 1 目的\n' > .claude/rules/commit.md
