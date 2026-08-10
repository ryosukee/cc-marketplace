#!/bin/bash
set -euo pipefail

# claude plugin eval を repo root 固定・規定オプション付きで実行する。
# discovery root は target 無指定時に cwd で決まり (2026-08-10 実測)、cwd がずれると
# ケースの plugins 参照 (../../../plugins/...) が root 外と判定されて全ケース load 失敗になる。
# そのため cwd に依存せず、このスクリプトの位置から repo root を解決して固定する。
#
# 規定オプション (evals/README.md の規定の実体):
#   --no-publish   HTML レポートを claude.ai へ artifact 発行しない (削除手段が無いため)
#   --scaffold     各ケースの scaffold.sh (fixture 生成) を実行する
#   --allow-tools  子セッションに Bash/Write/Edit を許可する (ツール枯渇による発動率の底上げ防止)
#
# 追加の引数はそのまま claude plugin eval へ渡す (--case, --runs, --json 等)。

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

exec env CLAUDE_CODE_WALNUT_SPIRE=1 claude plugin eval \
  --ablation none \
  --no-publish \
  --scaffold \
  --allow-tools Bash Write Edit \
  "$@"
