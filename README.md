# cc-marketplace

個人用 Claude Code plugin marketplace (`cc-tools`)。1 marketplace / multi plugin 構成。

## プラグイン

### Utility plugins

- **session** (0.2.0) — tmux pane ID を使った Claude Code セッション追跡。hooks でセッション開始/終了を検知し、pane ↔ session ID の紐付けを管理
- **version-check** (0.4.0) — Claude Code のバージョン追跡。hooks でバージョンをキャプチャし、更新検知・changelog 表示・要約保持


## インストールとアップデート

### 初回インストール

```bash
# 1. marketplace を追加
claude plugins marketplace add https://github.com/ryosukee/cc-marketplace.git

# 2. plugin をインストール
claude plugins install session@cc-tools
claude plugins install version-check@cc-tools
# 3. CLI のセットアップ（初回のみ）
mkdir -p ~/.claude/bin
ln -s ~/.claude/plugins/marketplaces/cc-tools/bin/cc-tools ~/.claude/bin/cc-tools
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
│       └── plugins/
│           ├── session/
│           ├── version-check/
│           └── workflow/
└── cache/
    └── cc-tools/
        ├── session/
        │   └── 0.2.0/                      ← CLAUDE_PLUGIN_ROOT
        │       ├── scripts/
        │       ├── hooks/
        │       ├── skills/
        │       └── internal/sessions/      ← 状態データ (hooks が書き込み)
        ├── version-check/
        │   └── 0.4.0/
        │       ├── scripts/
        │       ├── hooks/
        │       ├── skills/
        │       └── internal/
        │           ├── version/               ← バージョン記録
        │           └── changelogs/            ← changelog 要約
        └── workflow/
            └── 0.1.0/

~/.claude/bin/
└── cc-tools → ../plugins/marketplaces/cc-tools/bin/cc-tools   ← symlink
```

cache はバージョンごとにディレクトリが作られる。状態データの引き継ぎについては「アップデート」セクションを参照。

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
├── .claude-plugin/
│   └── marketplace.json
├── bin/
│   └── cc-tools                        # CLI 本体
└── plugins/
    ├── session/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── scripts/
    │   │   ├── hooks/session-start.sh, session-end.sh
    │   │   └── api/get-session-by-pane.sh, list-sessions.sh
    │   ├── internal/sessions/
    │   └── skills/status/
    ├── version-check/
    │   ├── .claude-plugin/plugin.json
    │   ├── hooks/hooks.json
    │   ├── scripts/
    │   │   ├── hooks/session-start.sh
    │   │   ├── api/get-version.sh, check-update.sh,
    │   │   │       save-changelog-summary.sh,
    │   │   │       list-changelog-summaries.sh,
    │   │   │       get-changelog-summary.sh
    │   │   └── lib/resolve-last-version.sh,
    │   │           resolve-changelogs.sh
    │   ├── internal/
    │   │   ├── version/
    │   │   └── changelogs/
    │   └── skills/check/
    │       ├── SKILL.md
    │       └── references/         # skill から呼ぶラッパースクリプト群
```

## TODO

- [x] marketplace の初期セットアップ
- [ ] session plugin
    - [x] hooks: SessionStart/SessionEnd で pane ↔ session ID を記録
    - [x] internal: pane ごとの状態管理
    - [x] api: get-session-by-pane, list-sessions
    - [ ] skills: session 情報を活用する skill（あれば）
    - [ ] pane 終了時のクリーンアップ（tmux hook 等で pane 死亡検知 → mapping 削除）
    - [ ] fork-to-pane skill（セッションを fork して別 pane で開く）
    - 参考: [docs/claude-session-internals.md](docs/claude-session-internals.md) — セッション内部構造・rewind・fork の調査
- [ ] version-check plugin
    - [x] hooks: SessionStart でバージョン変更検知・systemMessage 通知
    - [x] internal: last-version の記録
    - [x] api: get-version, check-update
    - [x] skills: changelog 取得・要約表示
    - [x] lib: 旧キャッシュからの last-version マイグレーション
    - [x] changelog 要約の永続化（バージョン別保存・閲覧）
- [x] CLI (`cc-tools`)
    - [x] サブコマンド体系（`<plugin> <command>` 形式）
    - [x] `installed_plugins.json` からの plugin パス解決
    - [x] doctor コマンド
    - [x] marketplace clone からの symlink 配布
- [ ] 既存グローバル skills/hooks の plugin 移行計画
    - [ ] ~/.claude/skills/ のどれを plugin 化するか棚卸し
    - [ ] settings.json の hooks の移行
- [ ] dependency 管理の設計（internal 側 vs skill 側）

## ライセンス

MIT
