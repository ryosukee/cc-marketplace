# marujirou-cc-marketplace

個人用 Claude Code plugin marketplace (`mj-tools`)。1 marketplace / multi plugin 構成。

## プラグイン

### Utility plugins

- **session** (0.2.0) — tmux pane ID を使った Claude Code セッション追跡。hooks でセッション開始/終了を検知し、pane ↔ session ID の紐付けを管理
- **version-check** (0.2.0) — Claude Code のバージョン追跡。hooks でバージョンをキャプチャし、更新検知・changelog 表示
- **workflow** (0.1.0) — エンジニアリングワークフロー skill 群（未実装）

## セットアップ

### 1. marketplace の追加と plugin のインストール

```bash
# marketplace を追加
claude plugins marketplace add https://github.com/ryosukee/marujirou-cc-marketplace.git

# plugin をインストール
claude plugins install session@mj-tools
claude plugins install version-check@mj-tools
claude plugins install workflow@mj-tools
```

### 2. CLI のセットアップ

marketplace を追加すると repo が `~/.claude/plugins/marketplaces/mj-tools/` に clone される。
CLI はこの clone 内の `bin/mj-tools` から symlink を張って使う。

```bash
mkdir -p ~/.claude/bin
ln -s ~/.claude/plugins/marketplaces/mj-tools/bin/mj-tools ~/.claude/bin/mj-tools
```

`~/.claude/bin` に PATH が通っていない場合は追加する。

CLI の更新は `marketplace update` で自動反映される（clone 内の git pull で追従）。

```bash
claude plugins marketplace update mj-tools
```

### 3. 動作確認

```bash
mj-tools doctor    # ヘルスチェック
mj-tools help      # コマンド一覧
```

## CLI (`mj-tools`)

marketplace 単位の CLI コマンド。plugin の API スクリプトを外部から呼び出すフロントエンド。

### 設計方針

- `mj-tools <plugin> <command> [args...]` の形式
- `installed_plugins.json` から plugin のキャッシュパスを解決し、`scripts/api/` に delegate
- `CLAUDE_PLUGIN_ROOT` を設定した上で API スクリプトを実行する
- CLI 自体は marketplace ルートの `bin/` に配置し、marketplace clone からの symlink で提供

### コマンド一覧

```
mj-tools session get-by-pane [PANE_ID]   pane のセッション情報を取得
mj-tools session list                    アクティブセッション一覧
mj-tools version-check get               現在のバージョンを取得
mj-tools version-check check             更新有無をチェック
mj-tools doctor                          ヘルスチェック
mj-tools help                            コマンド一覧
```

### ローカルディレクトリ構造

marketplace install 後のローカルの状態:

```
~/.claude/plugins/
├── marketplaces/
│   └── mj-tools/                       ← repo の clone (git pull で更新)
│       ├── bin/
│       │   └── mj-tools                ← CLI 本体
│       └── plugins/
│           ├── session/
│           ├── version-check/
│           └── workflow/
└── cache/
    └── mj-tools/
        ├── session/0.2.0/              ← plugin ファイルのコピー
        ├── version-check/0.2.0/
        └── workflow/0.1.0/

~/.claude/bin/
└── mj-tools → ../plugins/marketplaces/mj-tools/bin/mj-tools   ← symlink
```

## 設計方針

### Plugin 内部の kernel パターン

hooks で状態を永続化する plugin は、内部で kernel パターンを適用する:

```
my-plugin/
  hooks/       → イベントキャプチャ（${CLAUDE_PLUGIN_ROOT}/internal/ に記録）
  internal/    → 永続化された状態（plugin 外部から直接参照しない）
  scripts/api/ → skills や CLI がデータにアクセスする公開 I/F
  skills/      → api 経由でデータを利用する consumer
```

- hooks → 永続化 → API 経由アクセスの構造で、internal の直接参照を避ける
- API スクリプトの I/O 定義は各 plugin の `scripts/api/README.md` に記載

### 経緯

[claude-skill-kernels](https://github.com/ryosukee/claude-skill-kernels) で kernel パターンを独立パッケージとして検討したが、Claude Code の plugin エコシステムでほぼカバーできることが判明。kernel パターンは plugin 内部の設計として活用する方針に転換した。

## リポジトリのディレクトリ構成

```
marujirou-cc-marketplace/
├── CLAUDE.md
├── README.md
├── .claude-plugin/
│   └── marketplace.json
├── bin/
│   └── mj-tools                        # CLI 本体
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
    │   │   ├── api/get-version.sh, check-update.sh
    │   │   └── lib/resolve-last-version.sh
    │   ├── internal/version/
    │   └── skills/check/
    └── workflow/
        ├── .claude-plugin/plugin.json
        └── skills/
```

## TODO

- [x] marketplace の初期セットアップ
- [ ] session plugin
    - [x] hooks: SessionStart/SessionEnd で pane ↔ session ID を記録
    - [x] internal: pane ごとの状態管理
    - [x] api: get-session-by-pane, list-sessions
    - [ ] skills: session 情報を活用する skill（あれば）
    - [ ] pane 終了時のクリーンアップ（tmux hook 等で pane 死亡検知 → mapping 削除）
- [x] version-check plugin
- [x] CLI (`mj-tools`)
    - [x] サブコマンド体系（`<plugin> <command>` 形式）
    - [x] `installed_plugins.json` からの plugin パス解決
    - [x] doctor コマンド
    - [x] marketplace clone からの symlink 配布
- [ ] 既存グローバル skills/hooks の plugin 移行計画
    - [ ] ~/.claude/skills/ のどれを plugin 化するか棚卸し
    - [ ] settings.json の hooks の移行
- [ ] dependency 管理の設計（internal 側 vs skill 側）
- [ ] workflow plugin を分離するかの判断

## ライセンス

MIT
