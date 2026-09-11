# CLAUDE.md

## プロジェクト概要

個人用 Claude Code plugin marketplace。1 marketplace / multi plugin 構成。
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
├── .claude-plugin/
│   └── marketplace.json          # marketplace カタログ
├── docs/
│   └── cross-client-architecture.md # Claude Code / Codex 共通化方針
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
        ├── agent-src/            # host 別 agent 定義の生成元（あれば）
        ├── agents/               # Claude Code consumer agents（生成物）
        ├── codex-agents/         # Codex 用 agent adapter（あれば）
        └── agent-resources/      # agent 内部専用資料（skills として公開しない）
```

## 設計原則・コーディング規約

`.claude/rules/` に配置。このプロジェクトで作業する際に Claude が自動で読み込む。

- `.claude/rules/plugin-design.md`: plugin 設計原則 (自己完結、kernel パターン、hook 宣言等)
- `.claude/rules/coding.md`: Bash 規約、命名規則、スクリプト設計
- `.claude/rules/plugin-release.md`: plugin 更新手順
- `.claude/rules/user-global-rules.md`: 配布用 user global rule の運用 (symlink、フラット構成、入口と詳細規範の階層)

Claude Code / Codex の対応ホスト、adapter、requirements の設計判断は
`docs/cross-client-architecture.md` を正とする。plugin 実装時の必須事項は
`.claude/rules/plugin-design.md` に従う。

## Plugin 一覧

| plugin | version | カテゴリ | 概要 |
| --- | --- | --- | --- |
| version-check | 0.10.0 | utility | Claude Code のバージョン追跡・更新検知 |
| plugin-update | 0.4.0 | utility | SessionStart 時にプラグイン更新を検知・通知 |
| cache-keepalive | 0.7.3 | utility | prompt cache keepalive の自動発火 |
| cc-transcript | 0.7.0 | utility | セッションの直近やり取りを jq 整形して vim で開く |
| dotclaude | 0.14.1 | dotclaude | doctor/cross-review/registry |
| session | 2.13.2 | session | start/debrief/retrospective/handover/end + handover の機械検査 + handover-reviewer agent |
| impl-spec | 0.5.5 | impl-spec | requirements/design/test-plan + spec-reviewer agent |
| markdownlint | 0.3.2 | authoring | Write/Edit 後に markdownlint-cli2 を実行 |
| mkdocs-setup | 0.2.1 | authoring | MkDocs セットアップ手順 + テンプレート |
| security-guards | 0.2.0 | tooling | .netrc 等の credentials 保護 hook |
| ja-writing-ambiguity | 0.1.1 | authoring | 参照知識 skill `ref-ja-writing-ambiguity` 1 本。日本語の曖昧さ 3 分類 8 型を止める。`core.md` と一部を重複させ、どちらが引かれるかを測る中間状態 |
| claude-user-communication | 0.43.1 | communication | HTML ページ提示 (claude-html-communication) + 生成ページの機械検査 + 提示前レビューの agent 2 本 (sentence-reviewer は文脈を持たずに文の意味と造語を見る。page-reviewer は一次情報との突合と構成)。本文は生成元 JSON (配信ディレクトリの src/) に書き、閲覧用 HTML は assemble-page.mjs だけが生成する (読み取り専用)。レビュー agent には JSON と図の markup ファイルだけを渡す。回答は record-answer.mjs が JSON に記録し、ページ・index・archive を揃える。雛形は 1 / 2 / 3 pane のレスポンシブ (3 pane は 1340 / 1700 / 2100px) + 現在地の追従 + 設問のグループ化。番号 (説明 / 設問 / 表 / 図 / 脚注 / 補足) は組み立てが付ける。完了ページは削除せず archive.html へ送る。連番は発番と占有を 1 操作で取り、既存ページを黙って上書きしない。図は Tailwind 可 (図の中だけ)。要環境変数 (plugin README) |
| claude-known-issues | 0.4.6 | meta | Claude Code の既知バグ一覧 (未解決と解除済みを別ファイル。一覧は空で作られ、config/ の 2 本は書き方の例) + 更新検知・全件突合の時期を通知する SessionStart hook + 差分・全件の突合 agent |
| usage-line | 0.1.1 | utility | コンテキスト残量・レート制限残量を 1 行で出す。要セットアップ (plugin README) |
| github-pr | 0.4.11 | github | PR の作成・更新 (create skill) + `@claude` 宛レビュー対応 (address-review skill) + レビューの 2 系統 (セルフレビューは `approve` ラベル / 他人レビューは approve) と open・マージの条件。要 `gh` CLI |
| diffo | 0.1.0 | authoring | 参照知識 skill `ref-diffo` 1 本。diffo でレビューを受けるときの返信先の取り方 (payload 本文の `id:` 行から取る)、指定文言をそのまま当てること、ターミナルへの重複報告の抑止。`assets/` に markdown プレビューを GitHub 風にするユーザースタイルシート (Stylus 等へ読み込ませる。diffo 側に CSS を差し替える口が無いため) |
