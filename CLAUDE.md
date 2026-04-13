# CLAUDE.md

## プロジェクト概要

個人用 Claude Code plugin marketplace。1 marketplace / multi plugin 構成。
utility 系 plugin (session, version-check, gitdiff, plugin-update)、
dotclaude plugin (doctor/cross-review/registry)、
session-retrospective plugin を提供する。

## 技術スタック

| レイヤー | 技術 |
| --------- | ------ |
| Plugin 定義 | plugin.json, marketplace.json |
| Hooks 実装 | Bash (POSIX 互換推奨) |
| データフォーマット | JSON |
| JSON 操作 | jq |

## ディレクトリ構成

```text
cc-marketplace/
├── CLAUDE.md
├── README.md
├── .claude-plugin/
│   └── marketplace.json          # marketplace カタログ
├── bin/
│   └── cc-tools                  # CLI 本体
└── plugins/
    └── {plugin-name}/
        ├── .claude-plugin/
        │   └── plugin.json       # plugin マニフェスト
        ├── hooks/
        │   └── hooks.json        # hooks 定義
        ├── scripts/
        │   ├── hooks/            # hooks 実装
        │   ├── api/              # skills・CLI 向け公開 I/F
        │   │   └── README.md     # API 定義ドキュメント
        │   └── lib/              # 共通ライブラリ（あれば）
        ├── internal/             # 永続化された状態（外部参照禁止）
        │   └── {resource}/
        ├── skills/               # consumer skills
        └── agents/               # consumer agents（あれば）
```

## コーディング規約

### Bash スクリプト

- `set -euo pipefail` を冒頭に書く
- ShellCheck 準拠を推奨
- 変数は `"$VAR"` でクォート
- 関数名: `snake_case`
- ファイル名: `kebab-case.sh`
- API スクリプト: `{verb}-{noun}.sh`（例: `get-current-session-id.sh`）

### Plugin 内部の kernel パターン

hooks で状態を永続化する plugin は以下の構造を使う:

1. hooks が `${CLAUDE_PLUGIN_ROOT}/internal/{resource}/` にデータを記録
2. skills は `${CLAUDE_PLUGIN_ROOT}/scripts/api/` のスクリプト経由でデータにアクセス
3. internal/ を直接参照しない

### API スクリプト設計

- 出力は JSON 推奨（stdout）
- エラーメッセージは stderr
- Exit codes: 0=成功, 1=該当なし, 2=前提条件エラー
- 引数はコマンドライン引数で受ける
- I/O 定義は各 plugin の `scripts/api/README.md` に記載する

### CLI (`bin/cc-tools`)

- marketplace 単位の CLI コマンド。`cc-tools <plugin> <command> [args...]` の形式
- `installed_plugins.json` から plugin のキャッシュパスを解決し、`scripts/api/` に delegate
- CLI ソースは repo ルートの `bin/` に配置
- 配布方法: marketplace clone からの symlink
  (`~/.claude/bin/cc-tools` →
  `~/.claude/plugins/marketplaces/cc-tools/bin/cc-tools`)
  `marketplace update` で git pull されるため CLI も自動追従
- コマンド → API スクリプトのマッピングは CLI 内の case 文でハードコード

## Plugin 一覧

| plugin | 概要 |
| --- | --- |
| session | tmux pane ID を使った Claude Code セッション追跡 |
| version-check | Claude Code のバージョン追跡・更新検知 |
| gitdiff | diffview.nvim を使った diff レビュー |
| dotclaude | doctor/cross-review/registry |
| plugin-update | SessionStart 時にプラグイン更新を検知・通知 |
| session-retrospective | セッション末尾の振り返り・学び昇格 |

## 設計原則

1. **Plugin 自己完結** — 各 plugin は `${CLAUDE_PLUGIN_ROOT}` 内で完結する。グローバルを汚染しない
2. **Internal 隔離** — internal/ のデータは skills から直接参照せず、api スクリプト経由でアクセスする
3. **Dependency 追跡** — internal リソースの依存関係を明示的に管理する
4. **CLI は plugin の外** — CLI は marketplace ルートの `bin/` に置き、plugin システムとは別ライフサイクルで管理する
5. **Plugin は skills/agents/hooks で完結するものに限る**
    — plugin から rules は自動発動しない。
    rules が絡むものは dotfiles (`~/.claude/rules/`) で管理する
