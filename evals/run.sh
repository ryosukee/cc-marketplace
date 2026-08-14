#!/bin/bash
set -euo pipefail

# claude plugin eval を repo root 固定・規定オプション付きで実行する。
# discovery root は target 無指定時に cwd で決まり、cwd がずれると
# ケースの plugins 参照 (../../../plugins/...) が root 外と判定されて全ケース load 失敗になる。
# そのため cwd に依存せず、このスクリプトの位置から repo root を解決して固定する。
#
# 規定オプション (evals/README.md の規定の実体):
#   --no-publish   HTML レポートを claude.ai へ artifact 発行しない (削除手段が無いため)
#   --scaffold     各ケースの scaffold.sh (fixture 生成) を実行する
#   --allow-tools  子セッションに Bash/Write/Edit を許可する (ツール枯渇による発動率の底上げ防止)
#
# 追加の引数はそのまま claude plugin eval へ渡す (--case, --runs, --json 等)。
#
# 結果の保持は最新 1 件のみ:
#   全ケース実行の結果は evals/results/latest/ (git 管理、ケースとペアでコミット) に置き、
#   timestamp 付きの生出力ディレクトリは latest への反映後に削除する。
#   --case の部分実行は latest を更新しない (latest は常に全ケース実行の結果)。

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

RESULTS_DIR="evals/results"
PARTIAL=0
for arg in "$@"; do
  [ "$arg" = "--case" ] && PARTIAL=1
done

env CLAUDE_CODE_WALNUT_SPIRE=1 claude plugin eval \
  --ablation none \
  --no-publish \
  --scaffold \
  --allow-tools Bash Write Edit \
  "$@"

# 最新の timestamp ディレクトリを latest へ反映し、生出力は削除する
NEWEST="$(find "$RESULTS_DIR" -mindepth 1 -maxdepth 1 -type d -name '20*' | sort | tail -1)"
if [ -z "$NEWEST" ]; then
  exit 0
fi
if [ "$PARTIAL" -eq 1 ]; then
  echo "partial run (--case): evals/results/latest は更新しない ($NEWEST は削除)" >&2
else
  mkdir -p "$RESULTS_DIR/latest"
  cp "$NEWEST"/aggregate-result.json "$NEWEST"/report.html "$RESULTS_DIR/latest/" 2>/dev/null || \
    cp "$NEWEST"/aggregate-result.json "$RESULTS_DIR/latest/"
  echo "evals/results/latest を更新 (source: $NEWEST)" >&2
fi
find "$RESULTS_DIR" -mindepth 1 -maxdepth 1 -type d -name '20*' -exec rm -rf {} +
