# dotclaude

対象プロジェクトの `.claude/` を参考リポジトリと原則に基づいて診断・合成・相互レビューする。

## skill

| skill | 概要 |
| --- | --- |
| doctor | プロジェクトのワークフロー構成を診断し、参考リポジトリと原則に基づいて新規セットアップ・差分補完・再構成を対話的に実行 |
| registry | 参考リポジトリの登録・一覧・削除。doctor が参照するリポジトリリストを管理 |
| cross-review | registry に登録された参考リポジトリを相互に比較し、owned なリポジトリに対する改善提案を出す |

## agent

| agent | 概要 |
| --- | --- |
| dotclaude-claude-scanner | 複数の `.claude/` を走査し、役割クラスタマップまたは分類レポートを返す read-only agent |
| dotclaude-cluster-merger | 1 つの役割クラスタを受け取り、差分分類・合成版ドラフト・配置先提案を返す read-only agent |
| dotclaude-repo-profiler | 1 つの repo の README / CLAUDE.md / `.claude/` を読み、description 案・tech stack ヒント等を返す read-only agent |

## 設計ポイント

- 参考リポジトリの registry は `${CLAUDE_PLUGIN_DATA}/registry.json` で管理。plugin update でも永続
- 暗黙エントリとして `$HOME/.claude` を常に対象に含める
- 固定テンプレートではなく参考リポジトリから動的に合成する
