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
| dotclaude | 0.14.0 | `.claude/` を参考リポジトリと原則に基づいて診断・合成・相互レビュー。doctor / cross-review / registry の 3 skill |

### session

| plugin | version | 概要 |
| --- | --- | --- |
| session | 2.4.0 | セッションのライフサイクル管理。start (コンテキスト復元) / debrief (棚卸し) / retrospective (学びの codify) / handover (引き継ぎ資料) / end (オーケストレーター) + handover-reviewer agent |

### impl-spec

| plugin | version | 概要 |
| --- | --- | --- |
| impl-spec | 0.5.4 | 実装のための仕様策定。requirements / design / test-plan の 3 skill + spec-reviewer agent |

### GitHub

| plugin | version | 概要 |
| --- | --- | --- |
| github-pr | 0.2.0 | Pull Request の作成・更新。規模でテンプレートを選び、本文・タイトル・行指定コメントを生成。`gh` CLI が必要 |

### Authoring / tooling

| plugin | version | 概要 |
| --- | --- | --- |
| markdownlint | 0.3.2 | Write/Edit 後に markdownlint-cli2 を実行し lint エラーをフィードバック |
| mkdocs-setup | 0.2.0 | mkdocs-material のセットアップ手順とテンプレート |
| security-guards | 0.2.0 | credentials 保護。.netrc への Write/Edit/Read をブロック |
| dotclaude-writer | 0.4.1 | `.claude/` protected directory への書き込みワークアラウンド |
| japanese-text-writing | 0.1.5 | 日本語テキストの執筆規範。共通原則 + 種類別（参照・判断・論文・解説・読み物）の規範 skill |

### Communication

| plugin | version | 概要 |
| --- | --- | --- |
| claude-user-communication | 0.7.2 | ユーザーへの確認・提示。HTML ページ提示 (claude-html-communication) + 選択肢形式の確認の 2 skill。環境変数 `CLAUDE_HTML_COMMUNICATION_DIR` / `CLAUDE_HTML_COMMUNICATION_BASE_URL` が必要（plugin README 参照） |

### meta

| plugin | version | 概要 |
| --- | --- | --- |
| claude-known-issues | 0.2.0 | Claude Code の既知バグ・制約の台帳。更新検知 → agent が changelog と突合 → 解除手順を提示。`jq` / `gh` が必要 |

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

ディレクトリ名が配布元になるので、次の 3 つが同時に得られる。

- どの rule がどの repo 由来かがパスだけで分かる。配布元が増えても混ざらない
- repo 側で rule を追加・削除すると自動で反映される。ファイル単位の symlink だと張り直しが要る
- 配布をやめるときは symlink 1 本を消せば丸ごと外れる。個別に張ると消し残りが出る

| rule | 適用 | 概要 |
| --- | --- | --- |
| japanese-text-writing | 常時 | 日本語テキストの執筆要点。正典は同名の skill |
| user-communication-format | 常時 | 報告・質問の形式をフリーテキスト / HTML から選ぶ |
| primary-sources-first | 常時 | 仕様を述べる前に手元の一次情報を当たる |
| decision-record | 常時 | 複数セッションの調査・設計で確定事項の台帳を持つ |
| subagent-delegation | 常時 | subagent の起動は原則許可。判断基準はコンテキストの節約 |
| background-task | 常時 | バックグラウンド起動は `run_in_background` を使う |
| markdown-formatting | `**/*.md` | Markdown の記法・書式。該当ファイルを読んだときだけ載る |

`paths` を持つ rule は、一致するファイルを Claude が読んだときだけロードされる。
持たない rule はセッション開始時に無条件でロードされる。

> [!IMPORTANT]
> rule はセッション開始時に一度だけ読まれる。
> セッション中に追加・変更した rule は、そのセッションでは効かない。
> commit した直後に「効いている」と扱わず、次のセッションで確認する。

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
claude plugins install dotclaude-writer@cc-tools
claude plugins install japanese-text-writing@cc-tools
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
