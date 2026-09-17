# cc-marketplace

個人用 CodingAgent plugin marketplace (`cc-tools`)。1 marketplace / multi plugin 構成。

cc-marketplace の plugin を Claude Code と Codex の両方で利用できる構成を、段階的に導入している。
共通化する対象、対応 CodingAgent の分類、requirements と共有方式は、
[両対応 plugin の設計方針](./docs/cross-client-architecture.md)を参照。

## プラグイン

### Utility

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| version-check | Claude Code only | Claude Code の更新を見逃さないための plugin。版の変化をセッション開始時に知らせ、changelog で変更内容を確かめる |
| plugin-update | Claude Code only | インストール済みの plugin を最新に保つための plugin。marketplace に新しい版があればセッション開始時に知らせる |
| cache-keepalive | Claude Code only | アイドル中に prompt cache が切れないようにするための plugin。期限が切れる前に keepalive を自動で発火する |
| cc-transcript | Claude Code only | 画面から流れた会話を読み返すための plugin。直近のやり取りを折りたたみ付きの markdown にして vim で開く |
| usage-line | Claude Code only | コンテキストとレート制限の残りを手早く確かめるための plugin。statusline が書き出した値を 1 行にまとめる |

### dotclaude

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| dotclaude | Claude Code only | プロジェクトの `.claude/` 構成を、参考リポジトリと原則に照らして整えるための plugin。診断・合成・相互レビューを行う |

### session

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| [session](./plugins/session/README.md) | Claude Code + Codex | 作業を次のセッションへ途切れずに引き継ぐための plugin。開始・棚卸し・振り返り・引き継ぎの運用を、Claude Code と Codex で同じ資料を使って定める |

### impl-spec

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| impl-spec | Claude Code only | 実装に入る前に仕様の曖昧さをなくすための plugin。要件定義・設計・テスト計画の文書を、ユーザーへのインタビューとレビューを通して作る |

### GitHub

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| github-pr | Claude Code only | GitHub の PR を同じ型で作り、レビューに対応するための plugin。本文の型、`@claude` 宛の指摘への対応、open とマージの条件を定める |

### Authoring / tooling

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| markdownlint | Claude Code only | Claude が書く Markdown を lint の規約に保つための plugin。編集のたびに lint を実行し、結果を Claude に返す |
| mkdocs-setup | Claude Code only | MkDocs Material のドキュメントサイトを共通の設定で立ち上げるための plugin。設定とテンプレートを提供する |
| security-guards | Claude Code only | Claude が credentials を読み書きしないようにするための plugin。`.netrc` などへのアクセスを hook で止める |
| [diffo](./plugins/diffo/README.md) | Claude Code + Codex | Diffo でのレビューを、会話を止めずに受けるための plugin。Diffo 公式 skill を補い、通知の受け取り方と返信の規範、画面の表示の調整を定める |

### Communication

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| ja-writing-ambiguity | Claude Code only | 日本語の文章で読み手が意味を決められなくなる書き方を防ぐための plugin。書く前に読む参照知識として、止める型を定める |
| [claude-user-communication](./plugins/claude-user-communication/README.md) | Claude Code + Codex | 入り組んだ報告・比較・確認を、ターミナルではなく HTML ページでユーザーに示すための plugin。ページの作り方・提示前のレビュー・回答の記録の運用を、Claude Code と Codex で共有して定める |

### kanban

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| [plane-kanban](./plugins/plane-kanban/README.md) | Claude Code + Codex | Plane（kanban）を利用して、repo 単位で todo とタスクを kanban 管理するための plugin。Plane をどう使うかのプロトコルと運用規約も同時に定める |

### meta

| plugin | 対応 CodingAgent | 概要 |
| --- | --- | --- |
| claude-known-issues | Claude Code only | Claude Code の既知バグへのワークアラウンドを、不要になったら外せるように管理するための plugin。更新のたびに一覧を changelog と突き合わせ、解除できるものを見つける |

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
| claude-md-authoring | `CLAUDE.md` | CLAUDE.md の書き方。役割とサイズ・書くもの / 書かないもの・ほかの文書との重複・更新の時期 |

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
claude plugins install plane-kanban@cc-tools          # 要セットアップ (plugin README 参照)

# rules の symlink
ln -s ~/ghq_root/github.com/ryosukee/cc-marketplace/rules ~/.claude/rules/cc-marketplace
```

### Codex

このリポジトリのルートで marketplace を登録し、必要な plugin をインストールする。
現在 Codex に対応する plugin は `diffo`、`session`、`claude-user-communication`、`plane-kanban`。

```bash
codex plugin marketplace add .
codex plugin add diffo@cc-tools
codex plugin add session@cc-tools
codex plugin add claude-user-communication@cc-tools  # 要環境変数 (plugin README 参照)
codex plugin add plane-kanban@cc-tools               # 要セットアップ (plugin README 参照)
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
