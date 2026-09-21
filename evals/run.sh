#!/bin/bash
set -euo pipefail

# claude plugin eval を、対象の plugin と規定オプションを固定して実行する。
#
# 使い方: evals/run.sh <plugin 名> [claude plugin eval の追加引数]
#   例: evals/run.sh github-pr --case rule-01-check-existing-pr --runs 1
#
# ケースは plugin の下 (plugins/<plugin>/evals/**/case.yaml) に置く。これは claude plugin eval が
# ケースを探す既定の場所で、結果も plugins/<plugin>/evals/results/ に出る。
#
# 規定オプション:
#   --ablation none  plugin 無しの対照を取らない (発動測定は with-only grader で見る)
#   --no-publish     HTML レポートを claude.ai へ artifact 発行しない (削除手段が無いため)
#   --scaffold       各ケースの scaffold.sh (fixture 生成) を実行する
#   --allow-tools    子セッションに Bash/Write/Edit を許可する (ツール枯渇による発動率の底上げ防止)
#
# plugin 固有の環境 (stub を PATH に入れる等) は plugins/<plugin>/evals/env.sh が持つ。
# 実行可能な env.sh があれば、それに claude plugin eval を渡して実行する。無ければ直接実行する。
# この規約により、この共通の runner は個々の plugin を知らないままでいられる。
#
# 結果の保持は最新 1 件のみ:
#   全ケース実行の結果は plugins/<plugin>/evals/results/latest/ に置き、
#   timestamp 付きの生出力ディレクトリは latest への反映後に削除する。
#   --case の部分実行は latest を更新しない (latest は常に全ケース実行の結果)。

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ $# -lt 1 ]; then
  echo "使い方: evals/run.sh <plugin 名> [claude plugin eval の追加引数]" >&2
  exit 2
fi

PLUGIN="$1"
shift

PLUGIN_DIR="$REPO_ROOT/plugins/$PLUGIN"
if [ ! -d "$PLUGIN_DIR/evals" ]; then
  echo "evals/run.sh: $PLUGIN_DIR/evals が無い" >&2
  exit 2
fi

RESULTS_DIR="$PLUGIN_DIR/evals/results"
PARTIAL=0
for arg in "$@"; do
  [ "$arg" = "--case" ] && PARTIAL=1
done

# 今回の実行が出した結果ディレクトリだけを latest へ反映するための基準時刻。
# 前の実行が途中で落ちて timestamp のディレクトリが残っていても、それを拾わない
mkdir -p "$RESULTS_DIR"
MARKER="$(mktemp "$RESULTS_DIR/.run-marker.XXXXXX")"

CMD=(env CLAUDE_CODE_WALNUT_SPIRE=1 claude plugin eval "$PLUGIN_DIR"
  --ablation none
  --no-publish
  --scaffold
  --allow-tools Bash Write Edit
  "$@")

ENV_WRAPPER="$PLUGIN_DIR/evals/env.sh"
status=0
if [ -x "$ENV_WRAPPER" ]; then
  "$ENV_WRAPPER" "${CMD[@]}" || status=$?
else
  "${CMD[@]}" || status=$?
fi

# 結果の反映と片付けは、eval が 0 以外で終わっても行う。
# --threshold の既定は 1.0 で、1 ケースでも点数が下回ると exit 1 になるため
# 最新の timestamp ディレクトリを latest へ反映し、生出力は削除する
NEWEST="$(find "$RESULTS_DIR" -mindepth 1 -maxdepth 1 -type d -name '20*' -newer "$MARKER" | sort | tail -1)"
rm -f "$MARKER"
if [ -z "$NEWEST" ]; then
  echo "evals/run.sh: 今回の実行の結果ディレクトリが無いので latest は更新しない" >&2
  exit "$status"
fi
if [ "$PARTIAL" -eq 1 ]; then
  echo "partial run (--case): $RESULTS_DIR/latest は更新しない ($NEWEST は削除)" >&2
else
  mkdir -p "$RESULTS_DIR/latest"
  cp "$NEWEST"/aggregate-result.json "$NEWEST"/report.html "$RESULTS_DIR/latest/" 2>/dev/null || \
    cp "$NEWEST"/aggregate-result.json "$RESULTS_DIR/latest/"
  echo "$RESULTS_DIR/latest を更新 (source: $NEWEST)" >&2
fi
find "$RESULTS_DIR" -mindepth 1 -maxdepth 1 -type d -name '20*' -exec rm -rf {} +

exit "$status"
