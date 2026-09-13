# diffo

対応コーディングエージェント: `Claude Code + Codex`

Diffo のレビュー通知を作業中のセッションで受け、各スレッドへの返信を支援する plugin。
Claude Code では追跡可能な background task、Codex では追跡可能な poller または
`codex queue` を使う。いずれもレビュー開始と監視の起動は明示的に行う。
レビュー本文の読み方と返信の手順は `skills/ref-diffo/SKILL.md` に定める。

## 必要なものと導入

- Node.js と `npx`。Diffo CLI は `npx -y @diffohq/diffo` で実行する。
- Codex の `queue` で通知後に同じ thread を再開する場合は、`codex queue` と
  `codex app-server daemon` が使える Codex CLI、Bash、`git`、`shasum`、`awk` が必要。
  `codex queue --help` で対応状況を確認できる。
- Markdown プレビューの見た目を変更する場合は、`diffo-patch` が使う `npm`、`perl`、`cmp` も必要。

Claude Code では、このリポジトリを marketplace に追加して `diffo@agent-plugins-marketplace` をインストールする。
Codex ではリポジトリルートで `codex plugin marketplace add .` を実行し、
`codex plugin add diffo@agent-plugins-marketplace` でインストールする。
両方とも plugin を導入するだけでは監視は始まらない。レビュー対象のリポジトリで
`npx -y @diffohq/diffo --no-open` を実行し、skill の手順で poller を起動する。
別の setup skill はない。

Codex の queue 方式では、インストールした plugin の
`bin/diffo-codex-poll` を絶対パスで呼び、親 thread の `CODEX_THREAD_ID` を渡す。
このスクリプトは PATH に自動登録されない。利用する agent は、読み込んだ
`skills/ref-diffo/SKILL.md` のパスから plugin root を特定する。

## 未導入・異常終了時

依存コマンドがない場合、poller は標準エラーに不足項目を出して終了し、レビュー通知を queue しない。
Codex の queue が一時的に失敗した場合は、同じ通知を 5 秒間隔で再送する。
Diffo のレビューと指摘は保持されるため、依存を直した後に poller を再起動できる。
plugin がなくても Diffo CLI の手動 `poll` と `reply` は使用できる。

## 更新・削除と状態

更新後は各コーディングエージェントで plugin を更新し、新しいセッションで使う。
削除するときは各エージェントから plugin をアンインストールする。
Codex poller の排他 lock は `${XDG_STATE_HOME:-$HOME/.local/state}/diffo-codex-poll/` に置き、
正常終了時に削除する。レビューとスレッドのデータは Diffo 側が保持する。
`diffo-patch` は npx の Diffo パッケージを直接変更するため、Diffo 更新後は再適用する。
