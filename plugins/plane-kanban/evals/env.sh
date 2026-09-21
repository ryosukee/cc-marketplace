#!/bin/bash
set -euo pipefail

# plane-kanban の eval を回すための環境を整えて、渡されたコマンドを実行する。
# evals/run.sh が「plugin に evals/env.sh があればそれ経由で claude plugin eval を呼ぶ」規約で使う。
#
# 子セッションの Bash は sandbox の中で動き、外部への通信は遮断される。plane-kanban の
# スクリプトは curl で Plane の API を呼び、security で Keychain の API key を読むので、
# 両方を tests/fake-curl の偽物に解決させる。PATH は claude plugin eval を起動したシェルのものが
# 子セッションへ引き継がれ、その PATH に入っている plugin 配下のディレクトリは読み取りを許可される。
#
# eval のディレクトリ (evals/) は子セッションから読めないので、偽物をこの下に置いてはいけない。

PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

export PATH="$PLUGIN_ROOT/tests/fake-curl:$PATH"

exec "$@"
