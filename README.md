# cc-marketplace

個人用 Claude Code plugin marketplace (`cc-tools`)。1 marketplace / multi plugin 構成。

## プラグイン

### Utility plugins

- version-check (0.7.0) — Claude Code のバージョン追跡。hooks でバージョンをキャプチャし、更新検知・changelog 表示・要約保持。`/version-check:skip` で通知を既読にできる
- plugin-update (0.3.0) — SessionStart 時にプラグインの更新を検知・通知。全プラグイン最新でもステータスを表示

### dotclaude plugin

- dotclaude (0.10.0) — 対象プロジェクトの `.claude/` を参考リポジトリと原則に基づいて診断・合成・相互レビューする。`/dotclaude:doctor` でプロジェクトを診断し 4 モード (差分アップデート / エッセンス保持再構成 / リセット再生成 / レポートのみ) から選んで実行。`/dotclaude:cross-review` で registry 内の owned リポジトリ同士を相互比較し改善提案を出す。`/dotclaude:registry` で参考リポジトリを管理 (`${CLAUDE_PLUGIN_DATA}` に保持、plugin update でも永続)。抽出対象は実装パイプラインだけでなくドキュメント・調査・メタ作業など広く

### session-closing plugin

- session-closing (0.4.0) — セッション終盤の作業を束ねる plugin。2 skill を提供
    - `retrospective` — セッションで得た学びを rule / skill / CLAUDE.md に codify し、1 コミットにまとめる。やり残しと次アクション提案も併せて提示
    - `handover` — context 逼迫時や明示要求時に次セッションへの引き継ぎ資料を生成。Task 一覧 / 決定事項 / 現在地 / 再開手順 / 再開 prompt を含む `HANDOVER-{slug}.md` を project root に書き出す (commit しない)

### impl-spec plugin

- impl-spec (0.2.1) — 実装のための仕様策定 plugin。2 skill + 1 agent を提供
    - `requirements` — コードベース調査 + ユーザーへのインタビューで「何を作るか」を要件レベルで明確化し、要件定義書を出力する
    - `design` — 要件定義書を入力に、既存コードとプロジェクト方針に基づいて設計の選択肢をインタビューで確定させ、設計書を出力す��。コントラクトと統合点を書き、内部実装は実装者に委ねる粒度原則を持つ
    - `spec-reviewer` (agent) — requirements / design の出力前に自動起動し、未確定項目・曖昧表現・内部整合性・網羅性等を構造的にチェックする

### Authoring / tooling plugins

- markdownlint (0.3.1) — Write/Edit 後に markdownlint-cli2 を実行し、`.md` ファイルの lint エラーを Claude にフィードバックする
- mkdocs-setup (0.1.0) — mkdocs-material を使ったドキュメントサイトの初期セットアップ手順とテンプレートを提供する skill
- security-guards (0.1.1) — credentials 保護系の hook を束ねる plugin。Write/Edit で `.netrc` への書き込み、Read で `.netrc` の読み取りをブロック
- dotclaude-writer (0.2.0) — `.claude/` protected directory への書き込みワークアラウンド。staging 経由のスクリプトで create/edit/rm を提供。main session と `claude -p` で動作（subagent は skill 不可視のため非対応）

## インストールとアップデート

### 初回インストール

```bash
# 1. marketplace を追加
claude plugins marketplace add https://github.com/ryosukee/cc-marketplace.git

# 2. plugin をインストール (必要なもののみ)
claude plugins install version-check@cc-tools
claude plugins install plugin-update@cc-tools
claude plugins install dotclaude@cc-tools
claude plugins install session-closing@cc-tools
claude plugins install markdownlint@cc-tools
claude plugins install mkdocs-setup@cc-tools
claude plugins install security-guards@cc-tools
claude plugins install dotclaude-writer@cc-tools
claude plugins install impl-spec@cc-tools

# 3. CLI のセットアップ（初回のみ）
mkdir -p ~/.claude/bin
ln -s ~/.claude/plugins/marketplaces/cc-tools/bin/cc-tools ~/.claude/bin/cc-tools

# 4. rules の symlink (このリポジトリの rules/ を ~/.claude/rules/ に繋ぐ)
ghq get github.com/ryosukee/cc-marketplace   # 未取得の場合
ln -s ~/ghq_root/github.com/ryosukee/cc-marketplace/rules ~/.claude/rules/cc-marketplace
```

`~/.claude/bin` に PATH が通っていない場合は追加する。

```bash
# 4. 動作確認
cc-tools doctor
cc-tools help
```

### アップデート

```bash
# marketplace を更新（git pull）
claude plugins marketplace update cc-tools

# plugin を再インストール（新バージョンの cache を作成）
claude plugins install version-check@cc-tools
```

CLI は marketplace clone 内のファイルへの symlink なので、`marketplace update` だけで自動追従する。再設定は不要。

#### 状態データの引き継ぎ

plugin の状態データ（バージョン記録、changelog 要約など）は cache 内のバージョン付きディレクトリに保存される。plugin バージョンが上がると新しい cache ディレクトリが作られるため、そのままでは旧バージョンのデータが引き継がれない。

この問題は各 plugin 内の resolve スクリプト（`scripts/lib/resolve-*.sh`）が解決する。API や hooks の初回実行時に旧キャッシュを自動探索し、データを新しい cache にコピーする。ユーザー側での手動マイグレーションは不要で、通常の update 手順だけでデータも引き継がれる。

## CLI (`cc-tools`)

marketplace 単位の CLI コマンド。plugin の API スクリプトを外部から呼び出すフロントエンド。

### 設計方針

- `cc-tools <plugin> <command> [args...]` の形式
- `installed_plugins.json` から plugin のキャッシュパスを解決し、`scripts/api/` に delegate
- `CLAUDE_PLUGIN_ROOT` を設定した上で API スクリプトを実行する
- CLI 自体は marketplace ルートの `bin/` に配置し、marketplace clone からの symlink で提供

### コマンド一覧

```
cc-tools version-check get               現在のバージョンを取得
cc-tools version-check check             更新有無をチェック
cc-tools version-check summaries [LIMIT] 保存済み changelog 要約の一覧
cc-tools version-check summary <VERSION> 指定バージョンの changelog 要約を表示
cc-tools doctor                          ヘルスチェック
cc-tools help                            コマンド一覧
```

### ローカルディレクトリ構造

marketplace install 後のローカルの状態:

```
~/.claude/plugins/
├── installed_plugins.json                  # インストール済み plugin レジストリ
├── known_marketplaces.json
├── marketplaces/
│   └── cc-tools/                           ← repo の clone (git pull で更新)
│       ├── bin/
│       │   └── cc-tools                    ← CLI 本体
│       └── plugins/                        ← version-check, plugin-update,
│                                              dotclaude, session-closing,
│                                              markdownlint, mkdocs-setup, security-guards,
│                                              dotclaude-writer
└── cache/
    └── cc-tools/
        ├── version-check/0.7.0/            ← バージョン別 CLAUDE_PLUGIN_ROOT
        │   └── internal/                   ← 状態データ (version, changelogs)
        └── ...                             (各 plugin ごと)

~/.claude/bin/
└── cc-tools → ../plugins/marketplaces/cc-tools/bin/cc-tools   ← symlink

~/.claude/rules/
└── cc-marketplace → ~/ghq_root/github.com/ryosukee/cc-marketplace/rules   ← symlink
```

cache はバージョンごとにディレクトリが作られる。状態データの引き継ぎについては「アップデート」セクションを参照。

## Rules 配布

user global rules (`~/.claude/rules/` 配下の `.md`) は plugin loader の対象外なので、plugin としては扱わず repo 直下の `rules/` ディレクトリで管理し、symlink で `~/.claude/rules/cc-marketplace` に配置する。1 本の dir symlink で subdir 配下まで再帰 load される。

```bash
ln -s ~/ghq_root/github.com/ryosukee/cc-marketplace/rules ~/.claude/rules/cc-marketplace
```

編集は `~/.claude/rules/cc-marketplace/...` を開けば symlink 経由で repo 実体が更新される。`git push` で共有、他端末は `git pull` で追従。plugin marketplace update とは独立した経路。

設計の背景と他の設計原則 (plugin 責務ポリシー、hook 宣言方式、命名規則) は [docs/architecture.md](docs/architecture.md) を参照。

## 設計方針

### Plugin 内部の kernel パターン

hooks で状態を永続化する plugin は、内部で kernel パターンを適用する:

```
my-plugin/
  hooks/        → イベントキャプチャ（${CLAUDE_PLUGIN_ROOT}/internal/ に記録）
  internal/     → 永続化された状態（plugin 外部から直接参照しない）
  scripts/api/  → skills や CLI がデータにアクセスする公開 I/F
  scripts/lib/  → plugin 内共通ライブラリ（マイグレーション等）
  skills/       → api 経由でデータを利用する consumer
```

- hooks → 永続化 → API 経由アクセスの構造で、internal の直接参照を避ける
- API スクリプトの I/O 定義は各 plugin の `scripts/api/README.md` に記載

### 状態データとバージョンアップ

`internal/` は cache 内のバージョン付きディレクトリに存在する（例: `cache/cc-tools/version-check/0.4.0/internal/`）。plugin バージョンが上がると新しい cache ディレクトリが作られるため、旧バージョンの状態データは取り残される。

plugin システム側にはマイグレーションの仕組みがないため、状態を持つ plugin は `scripts/lib/` に resolve スクリプトを実装して対処する。API スクリプトや hooks が resolve を呼び出し、初回アクセス時に旧バージョンの `internal/` を探索・コピーする lazy migration 方式。

### 経緯

[claude-skill-kernels](https://github.com/ryosukee/claude-skill-kernels) で kernel パターンを独立パッケージとして検討したが、Claude Code の plugin エコシステムでほぼカバーできることが判明。kernel パターンは plugin 内部の設計として活用する方針に転換した。

## リポジトリのディレクトリ構成

```
cc-marketplace/
├── CLAUDE.md
├── README.md
├── .markdownlint.jsonc                 # repo lint 設定
├── .claude-plugin/
│   └── marketplace.json
├── bin/
│   └── cc-tools                        # CLI 本体
├── docs/                               # repo 管理設計 (architecture.md 等)
├── rules/                              # user global rules (symlink 配布)
│   ├── author-defaults/
│   │   ├── ask-with-choices.md
│   │   └── background-task.md
│   └── markdown/
│       ├── authoring.md
│       └── anti-ai-authoring.md
└── plugins/
    ├── version-check/                  # hooks + skills + internal (version, changelogs)
    ├── plugin-update/                  # hooks (SessionStart)
    ├── dotclaude/                      # skills (doctor, cross-review, registry)
    ├── session-closing/                # skills (retrospective / handover)
    ├── markdownlint/                   # hook (Write/Edit 後 lint) + config/ 同梱 default
    ├── mkdocs-setup/                   # skill (MkDocs セットアップ手順 + templates)
    ├── dotclaude-writer/                # skill (.claude/ protected dir への書き込みワークアラウンド)
    ├── impl-spec/                      # skills (requirements / design)
    └── security-guards/                # hooks (.netrc の Write/Edit/Read をブロック)
```

各 plugin の内部構造は基本的に `.claude-plugin/plugin.json` + `hooks/hooks.json` + `scripts/{hooks,api,lib}/` + `skills/` + `internal/`。詳細は各 plugin ディレクトリを参照。

## TODO

- [x] 既存グローバル skills の plugin 移行
    - [x] チーム開発ワークフロー系 17 skill を dotclaude plugin に移行・削除
    - [x] settings.json の hooks の移行 (plugin-update として plugin 化)
- [ ] dependency 管理の設計（internal 側 vs skill 側）
