# claude-known-issues

Claude Code の既知バグ・制約と、それに対するワークアラウンドの一覧。
Claude Code の更新を検知したら changelog と突合し、たまに全エントリの再現手順を実行して、
解除できるワークアラウンドを見つける。

## 構成

| 要素 | 役割 |
| --- | --- |
| SessionStart hook | 版の変化と、全件突合の時期（導入直後 / 180 日超過）を検知して通知する。判定はしない |
| entry skill | 一覧への追記手順とエントリの型（8 項目） |
| review skill | agent の起動と、結果の一覧・state への反映 |
| known-issues-reviewer agent | 差分（changelog との突合）と全件（`how_to_verify` の実行）の判定 |

## データの置き場

| データ | 場所 |
| --- | --- |
| 未解決の一覧 | `${CLAUDE_PLUGIN_DATA}/known-issues.yml` |
| 解除済みの一覧 | `${CLAUDE_PLUGIN_DATA}/known-issues.resolved.yml` |
| 突合の状態 | `${CLAUDE_PLUGIN_DATA}/state.json` |
| 一覧のテンプレート | `config/known-issues.template.yml`（plugin 同梱） |

`${CLAUDE_PLUGIN_DATA}` は plugin 更新をまたいで残る永続ディレクトリで、
実体は `~/.claude/plugins/data/claude-known-issues-cc-tools/`。
エントリに status は無く、どちらのファイルにあるかが状態。
`/plugin uninstall` は既定でこのディレクトリも削除する。残したい場合は `--keep-data` を付ける。

0.2.x 以前の一覧（12 項目、status あり）から更新した場合は、エントリを手で 8 項目へ直し、
resolved を別ファイルへ移す（0.3.0 で 1 度行った）。

## 依存

- `jq`: state の読み書き。無い場合 hook は黙って終了する
- `gh` CLI: 公式 CHANGELOG.md の取得。無い場合 agent は判定せずエラーとして報告する

## 状態の遷移

1. hook が更新を検知 → `pending_version` に記録して通知
2. Claude が agent を起動 → 判定
3. review skill が結果を反映 → `reviewed_version` を進めて `pending_version` を消す
4. `pending_version` が残ったまま次のセッションが始まったら再通知する

全件突合は `last_full_review_at` で別に追う。null（導入直後）または 180 日超過で hook が通知する。
