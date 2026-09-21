#!/bin/bash
set -euo pipefail

# github-pr の eval を回すための環境を整えて、渡されたコマンドを実行する。
# evals/run.sh が「plugin に evals/env.sh があればそれ経由で claude plugin eval を呼ぶ」規約で使う。
#
# github-pr の skill は gh で GitHub の API を呼ぶ。eval では本物の GitHub へ 1 度も接続しないので、
# tests/fake-gh の偽物へ解決させる。偽物は本物の gh へ渡す経路を持たない。
# PATH は claude plugin eval を起動したシェルのものが子セッションへ引き継がれ、
# その PATH に入っている plugin 配下のディレクトリは読み取りを許可される。
#
# eval のディレクトリ (evals/) は子セッションから読めないので、偽物をこの下に置いてはいけない。

PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

export PATH="$PLUGIN_ROOT/tests/fake-gh:$PATH"

exec "$@"
