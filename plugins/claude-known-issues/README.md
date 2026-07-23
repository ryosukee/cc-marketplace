# claude-known-issues

Claude Code の既知バグ・制約と、それに対するワークアラウンドの台帳。
更新を検知したら agent が changelog と台帳を突合し、修正が入っていれば解除手順を提示する。

## 構成

| 要素 | 役割 |
| --- | --- |
| SessionStart hook | セッション開始時に更新を検知し、未突合なら agent 起動を促す (systemMessage + additionalContext)。判定ロジックは持たない |
| known-issues-reviewer agent | 台帳と changelog を突合して判定する。read-only |
| review skill | agent の起動と、判定結果の台帳・状態への反映。`full`（全件再突合）と `status`（状態表示）モードあり |
| entry skill | 台帳への追記手順とエントリの型 |

判定はすべて agent の意味判断で行い、キーワードの文字列一致には頼らない
（公式 changelog は issue 番号をほとんど使わないため、番号での突合は機能しない）。
agent は 2 段階で動き、公式 changelog に関係しそうな記述が無ければ精査に進まず終了するため、
通常の消費は小さい。

## データの置き場

| データ | 場所 |
| --- | --- |
| 台帳（実体） | `${CLAUDE_PLUGIN_DATA}/known-issues.yml` |
| 突合の状態 | `${CLAUDE_PLUGIN_DATA}/state.json` |
| 台帳のテンプレート | `config/known-issues.template.yml`（plugin 同梱） |

`${CLAUDE_PLUGIN_DATA}` は plugin 更新をまたいで残る永続ディレクトリで、
実体は `~/.claude/plugins/data/claude-known-issues-cc-tools/`。
台帳が無ければテンプレートから初期化される。

`/plugin uninstall` は既定でこのディレクトリも削除する。台帳を残したい場合は `--keep-data` を付ける。

## 依存

- `jq`: 状態ファイルの読み書きに必要。無い場合 hook は黙って終了する
- `gh` CLI: changelog の取得に必要。無い場合 agent は判定せずエラーとして報告する

## 状態の遷移

検知と完了を分けて記録する。agent が起動されなかった場合や失敗した場合に取りこぼさないため。

1. hook が更新を検知 → `pending_version` に記録して通知
2. Claude が agent を起動 → 判定
3. review skill が結果を反映 → `reviewed_version` を進めて `pending_version` を消す
4. `pending_version` が残ったまま次のセッションが始まったら再通知する
