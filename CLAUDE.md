# CLAUDE.md

## プロジェクト概要

個人用 Claude Code plugin marketplace。1 marketplace / multi plugin 構成。
utility 系 plugin (version-check, plugin-update)、
dotclaude plugin (doctor/cross-review/registry)、
session-closing plugin (retrospective / handover)、
impl-spec plugin (requirements / design)、
authoring / tooling 系 plugin (markdownlint, mkdocs-setup, security-guards) を提供する。
加えて user global rules を repo 直下の `rules/` で管理し、
symlink で `~/.claude/rules/cc-marketplace` に配置する。

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
├── .markdownlint.jsonc           # repo lint 設定
├── .claude-plugin/
│   └── marketplace.json          # marketplace カタログ
├── bin/
│   └── cc-tools                  # CLI 本体
├── docs/                         # repo 管理設計
│   └── architecture.md
├── rules/                        # user global rules (symlink で配布)
│   ├── author-defaults/
│   └── markdown/
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
        ├── config/               # plugin 同梱 default config（あれば）
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

`scripts/api/` は CLI (`cc-tools`) や他 plugin から呼ばれる外部公開用スクリプトの配置先。
skill 内部でのみ使うスクリプトは `skills/{skill-name}/scripts/` に配置すればよく、`scripts/api/` に置く必要はない。

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
| version-check | Claude Code のバージョン追跡・更新検知 |
| dotclaude | doctor/cross-review/registry |
| plugin-update | SessionStart 時にプラグイン更新を検知・通知 |
| session-closing | セッション終盤の作業を束ねる plugin。振り返り・学び codify (retrospective) と次セッションへの引き継ぎ資料生成 (handover) |
| markdownlint | Write/Edit 後に markdownlint-cli2 を実行 |
| mkdocs-setup | MkDocs セットアップ手順 + テンプレート |
| security-guards | .netrc 等の credentials 保護 hook |
| cc-transcript | 現在セッションの直近やり取りを jq で整形して vim で開く |
| dotclaude-writer | .claude/ protected directory への書き込みワークアラウンド。staging 経由で create/edit/rm を提供 |
| impl-spec | 実装のための仕様策定。要件定義書 (requirements) と設計書 (design) の 2 skill + spec-reviewer agent |

## Plugin 更新手順

plugin の内容 (skills/agents/hooks/scripts) を変更したら、
必ず以下を一連で実行する:

1. plugin.json の `version` を bump する
2. README.md の該当 plugin セクション (バージョン番号、機能説明) を更新する
3. CLAUDE.md の Plugin 一覧を更新する (構成変更がある場合)
4. `git commit` + `git push`
5. `claude plugin marketplace update cc-tools`
6. `claude plugin update {plugin}@cc-tools`

手元の plugin cache は update するまで古いバージョンのまま。
bump + push だけで終わらせない。

## 設計原則

1. **Plugin 自己完結** — 各 plugin は `${CLAUDE_PLUGIN_ROOT}` 内で完結する。グローバルを汚染しない
2. **Internal 隔離** — internal/ のデータは skills から直接参照せず、api スクリプト経由でアクセスする
3. **Dependency 追跡** — internal リソースの依存関係を明示的に管理する
4. **CLI は plugin の外** — CLI は marketplace ルートの `bin/` に置き、plugin システムとは別ライフサイクルで管理する
5. **Plugin は skills/agents/hooks で完結するものに限る**
    — plugin loader は plugin 内の `rules/` を読まない。
    rules は plugin ではなく repo 直下の `rules/` で管理し、
    `~/.claude/rules/cc-marketplace` への dir symlink で配布する。
    設計の詳細は [docs/architecture.md](docs/architecture.md) を参照
