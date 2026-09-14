# CLAUDE.md

## プロジェクト概要

個人用 plugin marketplace。Claude Code 向けを中心に、一部の plugin を Codex にも提供する。
utility 系 (version-check, plugin-update, cache-keepalive, cc-transcript, usage-line)、
dotclaude 系 (doctor/cross-review/registry)、
session 系 (start/debrief/retrospective/handover/end)、
impl-spec 系 (requirements/design/test-plan)、github 系 (github-pr)、
authoring/tooling 系 (markdownlint, mkdocs-setup, security-guards, ja-writing-ambiguity)、
communication 系 (claude-user-communication)、meta 系 (claude-known-issues) を提供する。
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
        ├── scripts/
        │   ├── hooks/            # hooks 実装
        │   ├── lib/              # source 用の共通ヘルパ（あれば）
        │   └── *.sh              # skill/hook が invoke するエントリスクリプト（あれば）
        ├── internal/             # 永続化された状態（外部参照禁止）
        │   └── {resource}/
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
- `.claude/rules/user-global-rules.md`: 配布用 user global rule の運用 (symlink、フラット構成、入口と詳細規範の階層)

Claude Code と Codex の対応 CodingAgent、共有方式、requirements に関する設計判断は、
`docs/cross-client-architecture.md` を正の所在とする。plugin を実装するときは、
`.claude/rules/plugin-design.md` の必須事項に従う。

## Plugin 一覧

| plugin | カテゴリ | 概要 |
| --- | --- | --- |
| version-check | utility | Claude Code のバージョン追跡・更新検知 |
| plugin-update | utility | SessionStart 時にプラグイン更新を検知・通知 |
| cache-keepalive | utility | prompt cache keepalive の自動発火 |
| cc-transcript | utility | セッションの直近やり取りを jq 整形して vim で開く |
| dotclaude | dotclaude | doctor/cross-review/registry |
| session | session | Claude Code と Codex の start/debrief/retrospective/handover/end、共通の機械検査・意味レビュー |
| impl-spec | impl-spec | requirements/design/test-plan + spec-reviewer agent |
| markdownlint | authoring | Write/Edit 後に markdownlint-cli2 を実行 |
| mkdocs-setup | authoring | MkDocs セットアップ手順 + テンプレート |
| security-guards | tooling | .netrc 等の credentials 保護 hook |
| ja-writing-ambiguity | authoring | 参照知識 skill `ref-ja-writing-ambiguity` 1 本。日本語の曖昧さ 3 分類 8 型を止める。`core.md` と一部を重複させ、どちらが引かれるかを測る中間状態 |
| claude-user-communication | communication | Claude Code と Codex で共有する HTML 報告・確認 skill。生成・検査・回答記録のスクリプトと提示前レビューの判定資料を共有する。必要な環境変数は plugin README を参照 |
| claude-known-issues | meta | Claude Code の既知バグ一覧 (未解決と解除済みを別ファイル。一覧は空で作られ、config/ の 2 本は書き方の例) + 更新検知・全件突合の時期を通知する SessionStart hook + 差分・全件の突合 agent |
| usage-line | utility | コンテキスト残量・レート制限残量を 1 行で出す。要セットアップ (plugin README) |
| github-pr | github | PR の作成・更新 (create skill) + `@claude` 宛レビュー対応 (address-review skill) + レビューの 2 系統 (セルフレビューは `approve` ラベル / 他人レビューは approve) と open・マージの条件。要 `gh` CLI |
| diffo | authoring | Diffo 公式 skill を補う。Claude Code と Codex で別の参照知識 skill `ref-diffo` を読み、共通の返信規範を参照する。導入条件は plugin README を参照 |
