# cc-marketplace

個人用 CodingAgent plugin marketplace (`cc-tools`)。1 marketplace / multi plugin 構成。

cc-marketplace の plugin を Claude Code と Codex の両方で利用できる構成を、段階的に導入している。
共通化する対象、対応 CodingAgent の分類、requirements と共有方式は、
[両対応 plugin の設計方針](./docs/cross-client-architecture.md)を参照。

## プラグイン

### Utility

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| version-check | Claude Code only | Claude Code のバージョン追跡。hooks でバージョンをキャプチャし、更新検知・changelog 表示 |
| plugin-update | Claude Code only | SessionStart 時にプラグインの更新を検知・通知 |
| cache-keepalive | Claude Code only | prompt cache (extended cache, TTL 1h) の expire 前に keepalive を自動発火 |
| cc-transcript | Claude Code only | 現在セッションの直近やり取りを jq で整形して vim で開く |
| usage-line | Claude Code only | コンテキスト残量・レート制限残量を 1 行で出す。statusline からの JSON 書き出しが前提（plugin README 参照） |

### dotclaude

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| dotclaude | Claude Code only | `.claude/` を参考リポジトリと原則に基づいて診断・合成・相互レビュー。doctor / cross-review / registry の 3 skill |

### session

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| [session](./plugins/session/README.md) | Claude Code + Codex | セッション開始・棚卸し・振り返り・引き継ぎを管理する |

### impl-spec

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| impl-spec | Claude Code only | 実装のための仕様策定。requirements / design / test-plan の 3 skill + spec-reviewer agent |

### GitHub

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| github-pr | Claude Code only | Pull Request の作成・更新と `@claude` 宛レビューコメントへの対応。規模でテンプレートを選び、本文・タイトル・行指定コメントを生成。レビューの 2 系統 (セルフレビューは `approve` ラベル / 他人レビューは approve) と open・マージの条件を定める。`gh` CLI が必要 |

### Authoring / tooling

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| markdownlint | Claude Code only | Write/Edit 後に markdownlint-cli2 を実行し lint エラーをフィードバック |
| mkdocs-setup | Claude Code only | mkdocs-material のセットアップ手順とテンプレート |
| security-guards | Claude Code only | credentials 保護。.netrc への Write/Edit/Read をブロック |
| [diffo](./plugins/diffo/README.md) | Claude Code + Codex | Diffo 公式 skill と併用し、レビュー通知の受信と返信を補助する |

### Communication

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| ja-writing-ambiguity | Claude Code only | 日本語の曖昧さ 3 分類 8 型を止める参照知識 skill `ref-ja-writing-ambiguity` の 1 skill。指すものが文の中で決まらない（造語と汎用語 / 指示語だけの接続 / 主題の欠如 / 曖昧な動詞）、主語と述語が実物と対応しない（非生物主語 / 比喩 / 名詞構文）、修飾が積み上がって係り受けが決まらない（連体修飾の積み上げ）。一部は `rules/japanese-text-writing/references/core.md` にもあり、どちらが引かれるかを測るために重複させている中間状態 |
| [claude-user-communication](./plugins/claude-user-communication/README.md) | Claude Code + Codex | HTML ページによる報告・確認と回答記録。生成・検査スクリプトと提示前レビューの判定基準を共有する |

### meta

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| claude-known-issues | Claude Code only | Claude Code の既知バグ・制約の一覧 (未解決と解除済みを別ファイル。一覧は空で作られ、`config/` の 2 本はエントリの書き方の例)。更新検知 → agent が公式 CHANGELOG.md と突合、全件突合は各エントリの再現手順を実行。`jq` / `gh` が必要 |

## rules

plugin とは別に、user global rule を repo 直下の `rules/` で管理している。
`~/.claude/rules/cc-marketplace` への dir symlink で配布する。

plugin は rule を配布できない。plugin が持てるのは skills / agents / hooks /
MCP servers / LSP servers / monitors だけで、plugin 内の `rules/` は loader が読まない。
symlink が唯一の配布経路になる。

### symlink は配布元ごとに 1 段ネストさせる

`~/.claude/rules/` 直下に個々の rule ファイルを張らず、
`~/.claude/rules/{配布元}/` というディレクトリを 1 段挟んで、その中に repo の `rules/` を丸ごと向ける。
Claude Code はネストしたディレクトリも読むので、階層を挟んでも rule は効く。

```text
~/.claude/rules/
├── cc-marketplace -> ~/ghq_root/github.com/ryosukee/cc-marketplace/rules
└── {別の配布元}    -> ...
```

| rule | 適用 | 概要 |
| --- | --- | --- |
| japanese-text-writing | 常時 | 出力のタイプ判定と数行返答の最小規範。詳細規範（共通原則・分類別 5・ユーザーへの確認）は `rules/japanese-text-writing/references/` |
| primary-sources-first | 常時 | 仕様を述べる前に手元の一次情報を当たる |
| decision-record | 常時 | セッションを跨ぐ議題で decision-record を持つ |
| subagent-delegation | 常時 | subagent の起動は原則許可。判断基準はコンテキストの節約 |
| background-task | 常時 | バックグラウンド起動は `run_in_background` を使う |
| propose-before-implement | 常時 | 設計判断を含む作業は案の提示で止め、承認を得てから実装する |
| skill-invocation | 常時 | 発動条件に一致する skill は、記憶で代替せず Skill ツールで発動する |
| bash-state-mutation-isolation | 常時 | 状態変更と復旧を 1 つのシェルコマンドに連結しない |
| markdown-formatting | `**/*.md` | Markdown の記法・書式。該当ファイルを読んだときだけ載る |
| rule-authoring | `.claude/rules/**` `rules/**` | rule ファイルの冒頭とロード方式の使い分け |
| notes-authoring | `notes/**` | decision-record として運用する `notes/` を書く最中の規範。冒頭の目的・生存期間・対象議題、ファイルの構成（artifacts・確定事項・未解決課題・作業メモ）、確定項目の書き方、参照と出典、重複回避、消す手順 |
| claude-doc-authoring | `.claude/rules/**` `rules/**` `.claude/skills/**` `plugins/*/skills/**` `plugins/*/claude-skills/**` `plugins/*/codex-skills/**` `.claude/agents/*` `plugins/*/agents/*` `CLAUDE.md` | Claude 向け文書に共通の書き方。種別の選び方・命名・frontmatter・指示項目・参照・why・改訂 |
| skill-authoring | `.claude/skills/**` `plugins/*/skills/**` `plugins/*/claude-skills/**` `plugins/*/codex-skills/**` | SKILL.md の書き方。2 種別の判定・frontmatter と description・スクリプト化・文体 |
| agent-authoring | `.claude/agents/*` `plugins/*/agents/*` | agent 定義の書き方。ファイル形式・frontmatter・冒頭に書く 6 つの責務・入出力 |
| claude-md-authoring | `CLAUDE.md` | CLAUDE.md の書き方。役割とサイズ・書くもの / 書かないもの・rule との重複・更新の時期 |

`paths` を持つ rule は、一致するファイルを Claude が読んだときだけロードされる。
持たない rule はセッション開始時に無条件でロードされる。

## インストール

### Claude Code

```bash
# marketplace を追加
claude plugins marketplace add https://github.com/ryosukee/cc-marketplace.git

# plugin をインストール (必要なもののみ)
claude plugins install version-check@cc-tools
claude plugins install plugin-update@cc-tools
claude plugins install cache-keepalive@cc-tools
claude plugins install cc-transcript@cc-tools
claude plugins install dotclaude@cc-tools
claude plugins install session@cc-tools
claude plugins install impl-spec@cc-tools
claude plugins install markdownlint@cc-tools
claude plugins install mkdocs-setup@cc-tools
claude plugins install security-guards@cc-tools
claude plugins install claude-user-communication@cc-tools  # 要環境変数 (plugin README 参照)
claude plugins install claude-known-issues@cc-tools
claude plugins install usage-line@cc-tools                 # 要セットアップ (plugin README 参照)
claude plugins install github-pr@cc-tools
claude plugins install ja-writing-ambiguity@cc-tools
claude plugins install diffo@cc-tools

# rules の symlink
ln -s ~/ghq_root/github.com/ryosukee/cc-marketplace/rules ~/.claude/rules/cc-marketplace
```

### Codex

このリポジトリのルートで marketplace を登録し、必要な plugin をインストールする。
現在 Codex に対応する plugin は `diffo`、`session`、`claude-user-communication`。

```bash
codex plugin marketplace add .
codex plugin add diffo@cc-tools
codex plugin add session@cc-tools
codex plugin add claude-user-communication@cc-tools  # 要環境変数 (plugin README 参照)
```

## アップデート

```bash
# marketplace を更新 (git pull)
claude plugins marketplace update cc-tools

# plugin を新バージョンへ切り替える (restart で反映)
claude plugins update session@cc-tools
```

`install` は使えない。インストール済みの plugin に対しては何もせず終了する。
新バージョンの cache ディレクトリは作られるが、`installed_plugins.json` の `installPath` が
旧バージョンのままになり、セッションは旧版を読み続ける。

状態データ (version-check のバージョン記録など) は各 plugin の resolve スクリプトが旧キャッシュから自動引き継ぎするため、手動マイグレーション不要。
