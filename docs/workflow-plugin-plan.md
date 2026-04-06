# workflow plugin リニューアル計画

## 背景

### チーム開発ワークフローの変遷

プロジェクトの成熟度に応じて 3 段階のワークフローを使い分けている。

1. TeamAgent 素振り: ルールやスキルを用意せず TeamAgent を process モードで使う。プロジェクト初期向け
2. rule-based agent パイプライン: rules を整備し、それをもとに agents を定義。impl-plan skill で計画、team-implement skill でパイプライン実行。feedmarks で実践中
3. 汎用 workflow runner: rule/skill を完全整備した上で、kanban-agent-orchestrator で実行。検証段階

### 旧体制の問題

ホームディレクトリ (`~/.claude/`) に「domain x operation マトリックス」ベースのスキルが 19 個ある。

- code-plan, code-plan-review, code-implement, code-review, code-review-sparring
- code-investigate, code-doc-review
- system-doc-plan, system-doc-plan-review, system-doc-implement, system-doc-review
- test-plan, test-implement
- team-code, team-system-doc (orchestrator)
- audit-team-dev-workflow
- shared/ (plan-process.md, implement-process.md, review-process.md)

これらはグローバル skill として定義されており、プロジェクト固有の rules/agents と連携しない。実際にはもうほとんど使っておらず、feedmarks 方式 (approach 2) に移行している。

### feedmarks 方式の構造

feedmarks (`~/ghq_root/github.com/life-ops-kit/feedmarks`) で実践している 3 層構造:

```
.claude/
├── rules/          # Tier 1: 設計原則 (プロジェクト固有)
│   ├── go-architecture.md
│   ├── go-tests.md
│   ├── react-architecture.md
│   ├── frontend.md
│   ├── playwright-tests.md
│   ├── rule-authoring.md
│   └── claudemd-authoring.md
├── agents/         # Tier 2: 役割定義 (8 割汎用)
│   ├── impl.md
│   ├── test-plan.md
│   ├── test-impl.md
│   ├── code-review.md
│   ├── test-review.md
│   ├── exec-test.md
│   └── meta-review.md
└── skills/         # Tier 3: オーケストレーション (ほぼ完全に汎用)
    ├── impl-plan/SKILL.md
    └── team-implement/SKILL.md
```

情報フロー: rules が設計原則を定義 → agents が rules を読んで専門作業 → skills が agents をパイプラインで制御

レビュー agent は read-only (Write/Edit 権限なし) で diff-back ループを回す。exec-test の失敗は impl に戻してリトライ (最大 2 回)。code-review/test-review の diff-back は最大 3 回。

### このプラグインで解決すること

新規プロジェクトで approach 2 の構造をすぐに立ち上げたい。approach 1 (素の TeamAgent) をスキップして、最初から構造化されたパイプラインで開発できるようにする。

## 決定事項

### テンプレートの置き場所

cc-marketplace の `plugins/workflow/` に plugin として実装する。既存のプレースホルダーを拡張する形。

### 旧体制のスキル群

全削除する。対象:

グローバル skill (`~/.claude/skills/`):
- code-plan, code-plan-review, code-implement, code-review, code-review-sparring
- code-investigate, code-doc-review
- system-doc-plan, system-doc-plan-review, system-doc-implement, system-doc-review
- test-plan, test-implement
- team-code, team-system-doc
- audit-team-dev-workflow
- shared/ (plan-process.md, implement-process.md, review-process.md)

削除しないもの:
- audit-permissions (チーム開発と無関係)
- review-markdown-docs (チーム開発と無関係)
- mkdocs-setup (チーム開発と無関係)

`~/CLAUDE.md` のグローバルスキルフレームワーク表も削除する。

### セットアップ skill の対話レベル

対話的にカスタマイズする。tech stack、テスト方針、アーキテクチャパターン等を質問し、初期 rules もある程度埋めた状態で生成する。

## プラン

### Phase 1: テンプレート抽出 (完了)

feedmarks の agents/ と skills/ から汎用テンプレートを作成した。

当初は `examples/feedmarks/` にファイルをコピーする予定だったが、取りやめた。代わりに registry.json で GitHub 上の参照リポジトリ (例: `life-ops-kit/feedmarks`) へのリンクを管理する方式に変更。sync skill がリンク先から最新の構成を取得する。

作成したテンプレートファイル:

- agents (7 個): impl, test-plan, test-impl, code-review, test-review, exec-test, meta-review
- skills (2 個): impl-plan, team-implement
- meta-rules (2 個): rule-authoring, claudemd-authoring
- CLAUDE.md.template

各テンプレートには「意図」セクションがあり、その agent/skill が何のために存在するかを説明している。固有部分は `{{placeholder}}` で汎用化済み。

### Phase 2: セットアップ skill と sync skill の作成 (完了)

#### setup skill

`/workflow:setup` で発動する対話的セットアップ skill。当初は新規プロジェクト専用の想定だったが、既存プロジェクトの差分補完にも対応する設計に変更した。

プロジェクトの状態を 3 段階で判定する:

- 新規 (agents/skills なし): tech stack を質問し、テンプレートをフル展開
- 部分的 (一部の agents/skills が存在): 既存ファイルから tech stack を推論し、不足分を diff として提示
- 完備 (全テンプレートに対応するファイルが存在): テンプレートとの差分をチェック

部分的/完備の場合、tech stack は既存ファイルから推論する。全項目を質問し直すことはしない。diff の各項目は個別に承認/スキップできる。既存のカスタマイズは保持される。

参照リポジトリへのアクセスは ghq でローカルにあればそこから、なければ GitHub API でフォールバックする。agents/ と skills/ がないリポジトリはスキップし、理由を表示する。

#### sync skill

`/workflow:sync` で発動。プロジェクト → テンプレート方向の同期を行う。

registry.json に登録されたリポジトリから最新の `.claude/` 構成を取得し、テンプレートへの改善を検出する。逆方向 (テンプレートの改善をリポジトリに提案) にも対応する。

#### registry.json

参照リポジトリのカタログ。各エントリに `role` フィールドがある。

- `primary`: テンプレートの原型となったリポジトリ
- `reference`: 参考として参照するリポジトリ

取得できないリポジトリや workflow 構造 (agents/ + skills/) を持たないリポジトリはスキップされ、理由が表示される。

### Phase 3: 旧体制の削除 (完了)

1. `~/.claude/skills/` から対象の 17 スキルディレクトリを削除
2. `~/CLAUDE.md` からグローバルスキルフレームワーク表を削除
3. marketplace.json の workflow plugin description を更新

### Phase 4: 動作検証 (未着手)

新規プロジェクト (または既存プロジェクトの別ブランチ) で `/workflow:setup` を実行し、生成された構成で impl-plan → team-implement が動くことを確認する。

## TODO

- Phase 4 の動作検証を実施する
- registry 管理 skill (`/workflow:registry`) の作成。現在 `plugins/workflow/skills/registry/` のディレクトリは存在するが中身は空。リポジトリの追加/削除/一覧を skill から操作できるようにする

## スコープ外 (YAGNI)

- approach 3 (kanban-agent-orchestrator) への移行支援
- system-doc 系の agent/skill テンプレート (code 系のみ)
- CI/CD 連携
- 複数言語混在プロジェクトへの対応 (1 プロジェクト 1 言語前提)

## 参考リソース

- feedmarks: `~/ghq_root/github.com/life-ops-kit/feedmarks/.claude/`
- kanban-agent-orchestrator: `~/ghq_root/github.com/ryosukee/kanban-agent-orchestrator/`
- 旧スキル群: `~/.claude/skills/` (削除済み)
