# cc-marketplace

個人用 Claude Code plugin marketplace (`cc-tools`)。1 marketplace / multi plugin 構成。

## プラグイン

### Utility

| plugin | version | 概要 |
| --- | --- | --- |
| version-check | 0.10.0 | Claude Code のバージョン追跡。hooks でバージョンをキャプチャし、更新検知・changelog 表示 |
| plugin-update | 0.4.0 | SessionStart 時にプラグインの更新を検知・通知 |
| cache-keepalive | 0.7.3 | prompt cache (extended cache, TTL 1h) の expire 前に keepalive を自動発火 |
| cc-transcript | 0.7.0 | 現在セッションの直近やり取りを jq で整形して vim で開く |
| usage-line | 0.1.1 | コンテキスト残量・レート制限残量を 1 行で出す。statusline からの JSON 書き出しが前提（plugin README 参照） |

### dotclaude

| plugin | version | 概要 |
| --- | --- | --- |
| dotclaude | 0.14.1 | `.claude/` を参考リポジトリと原則に基づいて診断・合成・相互レビュー。doctor / cross-review / registry の 3 skill |

### session

| plugin | version | 概要 |
| --- | --- | --- |
| session | 2.12.2 | セッションのライフサイクル管理。start (コンテキスト復元) / debrief (棚卸し) / retrospective (学びの codify) / handover (引き継ぎ資料 + 機械検査 9 種) / end (オーケストレーター) + handover-reviewer agent |

### impl-spec

| plugin | version | 概要 |
| --- | --- | --- |
| impl-spec | 0.5.5 | 実装のための仕様策定。requirements / design / test-plan の 3 skill + spec-reviewer agent |

### GitHub

| plugin | version | 概要 |
| --- | --- | --- |
| github-pr | 0.4.10 | Pull Request の作成・更新と `@claude` 宛レビューコメントへの対応。規模でテンプレートを選び、本文・タイトル・行指定コメントを生成。レビューの 2 系統 (セルフレビューは `approve` ラベル / 他人レビューは approve) と open・マージの条件を定める。`gh` CLI が必要 |

### Authoring / tooling

| plugin | version | 概要 |
| --- | --- | --- |
| markdownlint | 0.3.2 | Write/Edit 後に markdownlint-cli2 を実行し lint エラーをフィードバック |
| mkdocs-setup | 0.2.1 | mkdocs-material のセットアップ手順とテンプレート |
| security-guards | 0.2.0 | credentials 保護。.netrc への Write/Edit/Read をブロック |

### Communication

| plugin | version | 概要 |
| --- | --- | --- |
| claude-user-communication | 0.34.0 | ユーザーへの確認・提示。HTML ページ提示 (claude-html-communication) の 1 skill。雛形は 1 / 2 / 3 pane のレスポンシブ 5 段 (3 pane は 1340 / 1700 / 2100px。広い段では表と図だけを伸ばし、地の文は行長の上限で止める) と、本文の範囲・現在地の追従、設問のグループ化を持つ。図は Tailwind で組める (生成時に CLI を回し、図の中だけに適用)。生成ページの機械検査スクリプト (html-validate / linkinator / 雛形固有検査 16 種の 3 層) と、提示前レビューの page-reviewer agent を同梱。完了したページは削除せず、index は直近 10 件を出して残りを archive.html へ辿らせる (build-archive.mjs が生成)。環境変数 `CLAUDE_HTML_COMMUNICATION_DIR` / `CLAUDE_HTML_COMMUNICATION_BASE_URL` が必要（plugin README 参照） |

### meta

| plugin | version | 概要 |
| --- | --- | --- |
| claude-known-issues | 0.3.2 | Claude Code の既知バグ・制約の一覧 (8 項目、未解決と解除済みを別ファイル)。更新検知 → agent が公式 CHANGELOG.md と突合、全件突合は各エントリの再現手順を実行。`jq` / `gh` が必要 |

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
| decision-record | 常時 | 複数セッションの調査・設計で確定事項の台帳を持つ |
| subagent-delegation | 常時 | subagent の起動は原則許可。判断基準はコンテキストの節約 |
| background-task | 常時 | バックグラウンド起動は `run_in_background` を使う |
| propose-before-implement | 常時 | 設計判断を含む作業は案の提示で止め、承認を得てから実装する |
| skill-invocation | 常時 | 発動条件に一致する skill は、記憶で代替せず Skill ツールで発動する |
| bash-state-mutation-isolation | 常時 | 状態変更と復旧を 1 つのシェルコマンドに連結しない |
| markdown-formatting | `**/*.md` | Markdown の記法・書式。該当ファイルを読んだときだけ載る |
| rule-authoring | `.claude/rules/**` `rules/**` | rule ファイルの冒頭とロード方式の使い分け |
| notes-authoring | `notes/**` | 確定事項の台帳として運用する `notes/` を書く最中の規範。冒頭の目的・生存期間・対象タスク、確定事項と作業メモの 2 節、重複回避、消す手順 |
| claude-doc-authoring | `.claude/rules/**` `rules/**` `.claude/skills/**` `plugins/*/skills/**` `.claude/agents/*` `plugins/*/agents/*` `CLAUDE.md` | Claude 向け文書に共通の書き方。種別の選び方・命名・frontmatter・指示項目・参照・why・改訂 |
| skill-authoring | `.claude/skills/**` `plugins/*/skills/**` | SKILL.md の書き方。2 種別の判定・frontmatter と description・スクリプト化・文体 |
| agent-authoring | `.claude/agents/*` `plugins/*/agents/*` | agent 定義の書き方。ファイル形式・frontmatter・冒頭に書く 6 つの責務・入出力 |
| claude-md-authoring | `CLAUDE.md` | CLAUDE.md の書き方。役割とサイズ・書くもの / 書かないもの・rule との重複・更新の時期 |

`paths` を持つ rule は、一致するファイルを Claude が読んだときだけロードされる。
持たない rule はセッション開始時に無条件でロードされる。

## インストール

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

# rules の symlink
ln -s ~/ghq_root/github.com/ryosukee/cc-marketplace/rules ~/.claude/rules/cc-marketplace
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
