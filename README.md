# claude-marketplace

個人用 Claude Code plugin marketplace。1 marketplace / multi plugin 構成。

## 構成予定

### Utility plugins（ほぼ自分用の便利ツール系）

- **session plugin** — tmux pane ID を使った Claude Code セッション追跡。hooks でセッション開始/終了を検知し、pane ↔ session ID の紐付けを管理
- **version-check plugin** — Claude Code のバージョン追跡。hooks でバージョンをキャプチャし、更新検知・changelog 表示

### Workflow plugins（エンジニアリング系、plugin として分離する可能性）

- 開発ワークフロー系 skill 群（code-plan, code-implement, code-review 等）
- plugin として分離するかは検討中

## 設計方針

### Plugin 内部の kernel パターン

hooks で状態を永続化する plugin は、内部で kernel パターンを適用する:

```
my-plugin/
  hooks/       → イベントキャプチャ（${CLAUDE_PLUGIN_ROOT}/internal/ に記録）
  internal/    → 永続化された状態（plugin 外部から直接参照しない）
    {resource}/
      dependency.md  → このリソースの依存情報
      {data files}   → 実データ
  scripts/api/ → skills がデータにアクセスする公開 I/F
  skills/      → api 経由でデータを利用する consumer
```

- hooks → 永続化 → I/F 経由アクセスの構造で、internal の直接参照を避ける
- internal はリソース単位でディレクトリ化し、dependency 情報を管理
- dependency を internal 側に書くか skill 側に書いて aggregate するかは要検討

### 経緯

[claude-skill-kernels](https://github.com/ryosukee/claude-skill-kernels) で kernel パターンを独立パッケージとして検討したが、Claude Code の plugin エコシステムでほぼカバーできることが判明。kernel パターンは plugin 内部の設計として活用する方針に転換した。

## TODO

- [ ] marketplace の初期セットアップ（marketplace.json, plugin.json）
- [ ] session plugin の設計・実装
  - [ ] hooks: SessionStart/SessionEnd で pane ↔ session ID を記録
  - [ ] internal: pane ごとの状態管理
  - [ ] api: get-current-session-id, list-active-sessions
  - [ ] skills: session 情報を活用する skill（あれば）
- [ ] version-check plugin の設計・実装
  - [ ] hooks: SessionStart でバージョンをキャプチャ
  - [ ] internal: バージョン履歴、更新フラグ
  - [ ] api: get-version, check-update
  - [ ] skills: changelog-check
- [ ] 既存グローバル skills/hooks の plugin 移行計画
  - [ ] ~/.claude/skills/ のどれを plugin 化するか棚卸し
  - [ ] ~/.claude/rules/ 内の workflow 系ルールの扱い検討（plugin から rules は配置できない制約）
  - [ ] settings.json の hooks の移行
- [ ] dependency 管理の設計（internal 側 vs skill 側）
- [ ] workflow plugin を分離するかの判断

## ディレクトリ構造（予定）

```
claude-marketplace/
├── README.md
├── CLAUDE.md
├── marketplace.json
├── plugins/
│   ├── session/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   ├── hooks/
│   │   │   └── hooks.json
│   │   ├── scripts/
│   │   ├── internal/
│   │   └── skills/
│   └── version-check/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── hooks/
│       │   └── hooks.json
│       ├── scripts/
│       ├── internal/
│       └── skills/
└── docs/
```

## ライセンス

MIT
