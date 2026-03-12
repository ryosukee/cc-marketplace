# CLAUDE.md

## プロジェクト概要

個人用 Claude Code plugin marketplace。1 marketplace / multi plugin 構成。
utility 系 plugin（session, version-check）と、将来的に workflow 系 plugin を提供する。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Plugin 定義 | plugin.json, marketplace.json |
| Hooks 実装 | Bash (POSIX 互換推奨) |
| データフォーマット | JSON |
| JSON 操作 | jq |

## ディレクトリ構成

```
claude-marketplace/
├── CLAUDE.md
├── README.md
├── .claude-plugin/
│   └── marketplace.json          # marketplace カタログ
├── plugins/
│   └── {plugin-name}/
│       ├── .claude-plugin/
│       │   └── plugin.json       # plugin マニフェスト
│       ├── hooks/
│       │   └── hooks.json        # hooks 定義
│       ├── scripts/              # hooks スクリプト、API スクリプト
│       │   ├── hooks/            # hooks 実装
│       │   └── api/              # skills 向け公開 I/F
│       ├── internal/             # 永続化された状態（外部参照禁止）
│       │   └── {resource}/
│       │       ├── dependency.md # 依存情報
│       │       └── {data}        # 実データ
│       ├── skills/               # consumer skills
│       │   └── {skill-name}/
│       │       └── SKILL.md
│       └── agents/               # consumer agents（あれば）
└── docs/
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

## 設計原則

1. **Plugin 自己完結** — 各 plugin は `${CLAUDE_PLUGIN_ROOT}` 内で完結する。グローバルを汚染しない
2. **Internal 隔離** — internal/ のデータは skills から直接参照せず、api スクリプト経由でアクセスする
3. **Dependency 追跡** — internal リソースの依存関係を明示的に管理する
