# workflow plugin リニューアル計画

## 背景

### チーム開発ワークフローの変遷

プロジェクトの成熟度に応じて 3 段階のワークフローを使い分けている。

1. TeamAgent 素振り: ルールやスキルを用意せず TeamAgent を process モードで使う。プロジェクト初期向け
2. rule-based agent パイプライン: rules を整備し、それをもとに agents を定義。impl-plan skill で計画、team-implement skill でパイプライン実行。feedmarks で実践中
3. 汎用 workflow runner: rule/skill を完全整備した上で、kanban-agent-orchestrator で実行。検証段階

### 旧体制の問題

ホームディレクトリ (`~/.claude/`) に「domain x operation マトリックス」ベースのスキルが 19 個あった。グローバル skill として定義されており、プロジェクト固有の rules/agents と連携しなかった。実際にはほとんど使っておらず、feedmarks 方式 (approach 2) に移行している。

### feedmarks 方式の構造

feedmarks (`~/ghq_root/github.com/life-ops-kit/feedmarks`) で実践している 3 層構造。

```
.claude/
├── rules/          # Tier 1: 設計原則 (プロジェクト固有)
├── agents/         # Tier 2: 役割定義 (8 割汎用)
└── skills/         # Tier 3: オーケストレーション (ほぼ完全に汎用)
```

情報フロー: rules が設計原則を定義、agents が rules を読んで専門作業、skills が agents をパイプラインで制御。レビュー agent は read-only で diff-back ループを回す。

### このプラグインで解決すること

新規プロジェクトで approach 2 の構造をすぐに立ち上げたい。既存プロジェクトでも参照リポジトリの構造に寄せた `.claude/` を生成・更新できるようにする。

## 設計の変遷

初期版はテンプレート (`{{build_command}}` 等のプレースホルダー入り) を plugin repo の `templates/` に置き、setup/sync skill がそれを展開する設計だった。v0.3.0 でこの方式を全面的に廃止した。

廃止理由。

- テンプレートが plugin repo のリリースサイクルに密結合していた
- sync の write-back に plugin の commit/push/再インストールが必要で運用が重い
- プレースホルダー置換は新規 tech stack や非定型な参照リポジトリ構造に追従できない

代わりに、参照リポジトリのカタログをユーザーローカルに置き、skill が原則 + 参照リポジトリの実例を読んでファイルを都度合成する方式に変更した。

## 現在のアーキテクチャ (v0.3.0)

### コンポーネント

| 要素 | 配置 | 役割 |
|---|---|---|
| doctor skill | `plugins/workflow/skills/doctor/` | プロジェクト診断と `.claude/` 合成 |
| registry skill | `plugins/workflow/skills/registry/` | 参照リポジトリのカタログ管理 |
| registry.json | `${CLAUDE_PLUGIN_DATA}/registry.json` | 参照リポジトリ一覧。ユーザーローカル、plugin update で消えない |

テンプレートディレクトリ (`templates/`) は削除済み。`hooks/` も `scripts/api/` もない。skill が `${CLAUDE_PLUGIN_DATA}/registry.json` を直接読み書きする。

### registry の初期状態

registry.json は空で出荷する。hook で事前投入もしない。doctor 初回起動時に registry が空または欠落していたら、registry skill での登録を促すフォールバックメッセージを出して終了する。

### 参照リポジトリの取得

ghq でローカルクローンがあればそこから読む。なければ GitHub API でフォールバックする。`.claude/agents/` と `.claude/skills/` のどちらも持たないリポジトリは理由を表示してスキップする。

### 自己除外

現在のプロジェクトの git remote が registry のいずれかのエントリと一致する場合、そのエントリは fetch 対象から除外する。自分自身を参照して合成する事故を防ぐ。

## doctor skill の 4 モード

`/workflow:doctor` は診断後にユーザーに 4 つのモードを提示する。

1. 差分アップデート: 既存構造を尊重し、不足分の追加と既存ファイルの部分修正にとどめる
2. エッセンス保持再構成: 参照リポジトリの構造に大きく寄せた再構成を行う。既存の価値あるエッセンスは救出する
3. リセット & 再生成: 既存の workflow ファイルを削除して一から生成する
4. レポートのみ: 差分レポートを出すだけで変更は加えない

## doctor skill が保持する原則

ファイルの合成は plugin 同梱のテンプレートではなく、skill 内に書いた原則 + 参照リポジトリの実例を Claude が読んで都度生成する。skill が抱える原則は以下。

### 抽象的な役割カテゴリ

具体名ではなくカテゴリで保持する。

- 実装担当
- テスト計画担当
- テスト実装担当
- コードレビュー担当
- テストレビュー担当
- テスト実行担当
- メタレビュー担当

参照リポジトリの実装ファイル名 (例: `impl.md`, `test-plan.md`) はカテゴリへのマッピングで解釈する。

### パイプライン原則

- レビュー系 agent は read-only (Write/Edit 権限なし)
- 並列書き込みを禁止する
- オーケストレーターはコードを書かない
- リトライ上限を設ける (exec-test → impl は最大 2 回、code-review/test-review の diff-back は最大 3 回)

### 著述原則

- rule authoring: rules ファイルの書き方
- CLAUDE.md authoring: プロジェクト CLAUDE.md の書き方
- agent/skill authoring: agent と skill の書き方

## registry skill

`/workflow:registry` で発動する。リポジトリの追加、一覧、削除を行う。データは `${CLAUDE_PLUGIN_DATA}/registry.json` に保存する。

## TODO

### Phase 4: 動作検証 (未着手)

新規プロジェクトと既存プロジェクトの両方で `/workflow:doctor` を実行し、4 モードがそれぞれ意図通りに動くことを確認する。生成された構成で impl-plan 相当のフロー → team-implement 相当のフローが回ることを確認する。自己除外と registry 空時のフォールバックも検証する。

## スコープ外 (YAGNI)

- approach 3 (kanban-agent-orchestrator) への移行支援
- system-doc 系の agent/skill (code 系のみ)
- CI/CD 連携
- 複数言語混在プロジェクトへの対応 (1 プロジェクト 1 言語前提)

## 参考リソース

- feedmarks: `~/ghq_root/github.com/life-ops-kit/feedmarks/.claude/`
- kanban-agent-orchestrator: `~/ghq_root/github.com/ryosukee/kanban-agent-orchestrator/`
