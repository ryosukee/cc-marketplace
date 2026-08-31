# CLAUDE.md

## プロジェクト概要

個人用 Claude Code plugin marketplace。1 marketplace / multi plugin 構成。
utility 系 (version-check, plugin-update, cache-keepalive, cc-transcript, usage-line)、
dotclaude 系 (doctor/cross-review/registry)、
session 系 (start/debrief/retrospective/handover/end)、
impl-spec 系 (requirements/design/test-plan)、github 系 (github-pr)、
authoring/tooling 系 (markdownlint, mkdocs-setup, security-guards)、
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
├── .claude-plugin/
│   └── marketplace.json          # marketplace カタログ
├── rules/                        # user global rules (symlink で配布)
│   ├── {rule}.md                 # 常時ロード。paths を持つものは条件ロード
│   └── {rule}/references/        # 詳細規範。paths 除外で常時ロードから外す
└── plugins/
    └── {plugin-name}/
        ├── .claude-plugin/
        │   └── plugin.json       # plugin マニフェスト
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
        ├── config/               # plugin 同梱 default config（あれば）
        └── agents/               # consumer agents（あれば）
```

## 設計原則・コーディング規約

`.claude/rules/` に配置。このプロジェクトで作業する際に Claude が自動で読み込む。

- `.claude/rules/plugin-design.md`: plugin 設計原則 (自己完結、kernel パターン、hook 宣言等)
- `.claude/rules/coding.md`: Bash 規約、命名規則、スクリプト設計
- `.claude/rules/plugin-release.md`: plugin 更新手順
- `.claude/rules/user-global-rules.md`: 配布用 user global rule の運用 (symlink、フラット構成、入口と詳細規範の階層)

## Plugin 一覧

| plugin | version | カテゴリ | 概要 |
| --- | --- | --- | --- |
| version-check | 0.10.0 | utility | Claude Code のバージョン追跡・更新検知 |
| plugin-update | 0.4.0 | utility | SessionStart 時にプラグイン更新を検知・通知 |
| cache-keepalive | 0.7.3 | utility | prompt cache keepalive の自動発火 |
| cc-transcript | 0.7.0 | utility | セッションの直近やり取りを jq 整形して vim で開く |
| dotclaude | 0.14.1 | dotclaude | doctor/cross-review/registry |
| session | 2.12.3 | session | start/debrief/retrospective/handover/end + handover の機械検査 9 種 + handover-reviewer agent |
| impl-spec | 0.5.5 | impl-spec | requirements/design/test-plan + spec-reviewer agent |
| markdownlint | 0.3.2 | authoring | Write/Edit 後に markdownlint-cli2 を実行 |
| mkdocs-setup | 0.2.1 | authoring | MkDocs セットアップ手順 + テンプレート |
| security-guards | 0.2.0 | tooling | .netrc 等の credentials 保護 hook |
| claude-user-communication | 0.38.0 | communication | HTML ページ提示 (claude-html-communication) + 生成ページの機械検査 18 種 + 提示前レビューの page-reviewer agent。雛形は 1 / 2 / 3 pane のレスポンシブ 5 段 (3 pane は 1340 / 1700 / 2100px) + 現在地の追従 + 設問のグループ化。完了ページは削除せず archive.html へ送る。セクション番号は見出しの外に出す。図は Tailwind 可 (図の中だけ)。要環境変数 (plugin README) |
| claude-known-issues | 0.4.0 | meta | Claude Code の既知バグ一覧 (8 項目、未解決と解除済みを別ファイル。一覧は空で作られ、config/ の 2 本は書き方の例) + 更新検知・全件突合の時期を通知する SessionStart hook + 差分・全件の突合 agent |
| usage-line | 0.1.1 | utility | コンテキスト残量・レート制限残量を 1 行で出す。要セットアップ (plugin README) |
| github-pr | 0.4.10 | github | PR の作成・更新 (create skill) + `@claude` 宛レビュー対応 (address-review skill) + レビューの 2 系統 (セルフレビューは `approve` ラベル / 他人レビューは approve) と open・マージの条件。要 `gh` CLI |

