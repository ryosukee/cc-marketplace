# CLAUDE.md

## プロジェクト概要

個人用 Claude Code plugin marketplace。1 marketplace / multi plugin 構成。
utility 系 (version-check, plugin-update, cache-keepalive, cc-transcript)、
dotclaude 系 (doctor/cross-review/registry)、
session 系 (start/debrief/retrospective/handover/end)、
impl-spec 系 (requirements/design/test-plan)、
authoring/tooling 系 (markdownlint, mkdocs-setup, security-guards, dotclaude-writer) を提供する。
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
├── .claude/
│   ├── settings.local.json
│   └── rules/                    # プロジェクト固有ルール (設計原則、規約)
├── .claude-plugin/
│   └── marketplace.json          # marketplace カタログ
├── bin/
│   └── cc-tools                  # CLI 本体
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

## 設計原則・コーディング規約

`.claude/rules/` に配置。このプロジェクトで作業する際に Claude が自動で読み込む。

- `.claude/rules/plugin-design.md` — plugin 設計原則 (自己完結、kernel パターン、hook 宣言等)
- `.claude/rules/coding.md` — Bash 規約、命名規則、API スクリプト設計
- `.claude/rules/plugin-release.md` — plugin 更新手順

## Plugin 一覧

| plugin | version | カテゴリ | 概要 |
| --- | --- | --- | --- |
| version-check | 0.8.0 | utility | Claude Code のバージョン追跡・更新検知 |
| plugin-update | 0.4.0 | utility | SessionStart 時にプラグイン更新を検知・通知 |
| cache-keepalive | 0.7.3 | utility | prompt cache keepalive の自動発火 |
| cc-transcript | 0.7.0 | utility | セッションの直近やり取りを jq 整形して vim で開く |
| dotclaude | 0.14.0 | dotclaude | doctor/cross-review/registry |
| session | 2.1.0 | session | start/debrief/retrospective/handover/end + handover-reviewer agent |
| impl-spec | 0.5.4 | impl-spec | requirements/design/test-plan + spec-reviewer agent |
| markdownlint | 0.3.2 | authoring | Write/Edit 後に markdownlint-cli2 を実行 |
| mkdocs-setup | 0.2.0 | authoring | MkDocs セットアップ手順 + テンプレート |
| security-guards | 0.2.0 | tooling | .netrc 等の credentials 保護 hook |
| dotclaude-writer | 0.3.1 | tooling | .claude/ protected directory への書き込みワークアラウンド |

