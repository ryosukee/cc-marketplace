# cc-marketplace

個人用 Claude Code plugin marketplace (`cc-tools`)。1 marketplace / multi plugin 構成。

## プラグイン

### Utility plugins

- session (0.3.0) — tmux pane ID を使った Claude Code セッション追跡。hooks でセッション開始/終了を検知し、pane ↔ session ID の紐付けを管理
- version-check (0.7.0) — Claude Code のバージョン追跡。hooks でバージョンをキャプチャし、更新検知・changelog 表示・要約保持。`/version-check:skip` で通知を既読にできる
- plugin-update (0.3.0) — SessionStart 時にプラグインの更新を検知・通知。全プラグイン最新でもステータスを表示
- gitdiff (0.1.0) — diffview.nvim を使った diff レビュー。`/gitdiff` で直前の編集差分を tmux ウィンドウに表示

### dotclaude plugin

- dotclaude (0.10.0) — 対象プロジェクトの `.claude/` を参考リポジトリと原則に基づいて診断・合成・相互レビューする。`/dotclaude:doctor` でプロジェクトを診断し 4 モード (差分アップデート / エッセンス保持再構成 / リセット再生成 / レポートのみ) から選んで実行。`/dotclaude:cross-review` で registry 内の owned リポジトリ同士を相互比較し改善提案を出す。`/dotclaude:registry` で参考リポジトリを管理 (`${CLAUDE_PLUGIN_DATA}` に保持、plugin update でも永続)。抽出対象は実装パイプラインだけでなくドキュメント・調査・メタ作業など広く

### Authoring / tooling plugins

- markdownlint (0.1.0) — Write/Edit 後に markdownlint-cli2 を実行し、`.md` ファイルの lint エラーを Claude にフィードバックする
- mkdocs-setup (0.1.0) — mkdocs-material を使ったドキュメントサイトの初期セットアップ手順とテンプレートを提供する skill
- security-guards (0.1.1) — credentials 保護系の hook を束ねる plugin。Write/Edit で `.netrc` への書き込み、Read で `.netrc` の読み取りをブロック

## インストールとアップデート

### 初回インストール

```bash
# 1. marketplace を追加
claude plugins marketplace add https://github.com/ryosukee/cc-marketplace.git

# 2. plugin をインストール (必要なもののみ)
claude plugins install session@cc-tools
claude plugins install version-check@cc-tools
claude plugins install plugin-update@cc-tools
claude plugins install gitdiff@cc-tools
claude plugins install dotclaude@cc-tools
claude plugins install session-retrospective@cc-tools
claude plugins install markdownlint@cc-tools
claude plugins install mkdocs-setup@cc-tools
claude plugins install security-guards@cc-tools

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
cc-tools session get-by-pane [PANE_ID]   pane のセッション情報を取得
cc-tools session list                    アクティブセッション一覧
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
│       └── plugins/                        ← session, version-check, plugin-update,
│                                              gitdiff, dotclaude, session-retrospective,
│                                              markdownlint, mkdocs-setup, security-guards
└── cache/
    └── cc-tools/
        ├── session/0.3.0/                  ← バージョン別 CLAUDE_PLUGIN_ROOT
        │   └── ...
        ├── version-check/0.7.0/
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
    ├── session/                        # hooks + skills + internal/sessions
    ├── version-check/                  # hooks + skills + internal (version, changelogs)
    ├── plugin-update/                  # hooks (SessionStart)
    ├── gitdiff/                        # skill (/gitdiff)
    ├── dotclaude/                      # skills (doctor, cross-review, registry)
    ├── session-retrospective/          # skill (セッション末尾振り返り)
    ├── markdownlint/                   # hook (Write/Edit 後 lint) + config/ 同梱 default
    ├── mkdocs-setup/                   # skill (MkDocs セットアップ手順 + templates)
    └── security-guards/                # hooks (.netrc の Write/Edit/Read をブロック)
```

各 plugin の内部構造は基本的に `.claude-plugin/plugin.json` + `hooks/hooks.json` + `scripts/{hooks,api,lib}/` + `skills/` + `internal/`。詳細は各 plugin ディレクトリを参照。

## TODO

- [ ] session plugin
    - [ ] skills: session 情報を活用する skill（あれば）
    - [ ] pane 終了時のクリーンアップ（tmux hook 等で pane 死亡検知 → mapping 削除）
    - [ ] fork-to-pane skill（セッションを fork して別 pane で開く）
    - 参考: [docs/claude-session-internals.md](docs/claude-session-internals.md) — セッション内部構造・rewind・fork の調査
- [x] 既存グローバル skills の plugin 移行
    - [x] チーム開発ワークフロー系 17 skill を dotclaude plugin に移行・削除
    - [x] settings.json の hooks の移行 (plugin-update として plugin 化)
- [ ] dependency 管理の設計（internal 側 vs skill 側）
