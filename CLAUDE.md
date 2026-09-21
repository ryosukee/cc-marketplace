# CLAUDE.md

## プロジェクト概要

個人用 plugin marketplace。Claude Code 向けを中心に、一部の plugin を Codex にも提供する。
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
│   ├── rules/                    # プロジェクト固有ルール (設計原則、規約)
│   └── skills/                   # このプロジェクトでだけ使う skill
├── .agents/
│   └── plugins/
│       └── marketplace.json      # Codex の marketplace カタログ
├── .claude-plugin/
│   └── marketplace.json          # Claude Code の marketplace カタログ
├── docs/
│   └── cross-client-architecture.md # Marketplace plugin の両対応設計
├── rules/                        # user global rules (symlink で配布)
│   ├── {rule}.md                 # 常時ロード。paths を持つものは条件ロード
│   └── {rule}/references/        # 詳細規範。paths 除外で常時ロードから外す
└── plugins/
    └── {plugin-name}/
        ├── .claude-plugin/
        │   └── plugin.json       # Claude Code の plugin マニフェスト
        ├── .codex-plugin/
        │   └── plugin.json       # Codex 対応時の plugin マニフェスト
        ├── hooks/
        │   └── hooks.json        # hooks 定義
        ├── monitors/
        │   └── monitors.json     # plugin monitor 定義（あれば）
        ├── scripts/
        │   ├── hooks/            # hooks 実装
        │   ├── lib/              # source 用の共通ヘルパ（あれば）
        │   └── *.sh              # skill/hook が invoke するエントリスクリプト（あれば）
        ├── internal/             # 永続化された状態。deprecated で version-check だけが使っている
        │   └── {resource}/
        ├── evals/                # skill の発動測定（あれば）。`evals/run.sh {plugin}` で回す
        ├── skills/               # consumer skills
        │   └── {skill-name}/scripts/  # その skill 専用スクリプト（あれば）
        ├── claude-skills/        # Claude Code 専用の skill（あれば）
        ├── codex-skills/         # Codex 専用の skill（あれば）
        ├── references/           # 両者が参照する資料（あれば）
        ├── config/               # plugin 同梱 default config（あれば）
        ├── agents/               # Claude Code consumer agents（あれば）
        └── agent-resources/      # agent 内部専用資料（skills として公開しない）
```

## 設計原則・コーディング規約

`.claude/rules/` に配置。このプロジェクトで作業する際に Claude が自動で読み込む。

- `.claude/rules/plugin-design.md`: 共通の plugin 設計原則と CodingAgent 固有規範への入口
- `.claude/rules/coding.md`: Bash 規約、命名規則、スクリプト設計
- `.claude/rules/plugin-release.md`: plugin 更新手順
- `.claude/rules/plugin-list-authoring.md`: README.md の plugin 一覧の書き方
- `.claude/rules/user-global-rules.md`: 配布用 user global rule の運用 (symlink、フラット構成、入口と詳細規範の階層)

Claude Code と Codex の対応 CodingAgent、共有方式、requirements に関する設計判断は、
`docs/cross-client-architecture.md` を正の所在とする。plugin を実装するときは、
`.claude/rules/plugin-design.md` の必須事項に従う。

## Plugin 一覧

plugin の一覧と各 plugin の目的は [README.md の「プラグイン」](./README.md#プラグイン) にある。
