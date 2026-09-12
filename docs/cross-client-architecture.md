# Claude Code と Codex の共通化方針

cc-marketplace は、複数の作業リポジトリで使う Claude Code と Codex の拡張機能を管理する。
次のものを管理対象とする。

- skill
- 名前付き agent
- hook
- skill、名前付き agent、hook が呼び出すスクリプト
- 既定設定
- requirements と setup 手順

ユーザー環境に配置する設定ファイル、導入する CLI の一覧、symlink は dotfiles で管理する。
業務知識、ビルドコマンド、ディレクトリ固有の執筆規約は各作業リポジトリで管理する。

## 対応ホストの分類

各 plugin は、README に対応ホストとして次のいずれかを明記する。

| 分類 | 意味 |
| --- | --- |
| Claude Code + Codex | Claude Code と Codex の両方で動作することを検証する |
| Claude Code only | Claude Code 固有の API、状態、イベントに依存する |
| Codex only | Codex 固有の API、設定、イベントに依存する |

両ホストで似た処理を提供する場合は、判定ロジックを共通のスクリプトに置き、
イベントの入力形式と結果の出力形式だけをホスト別の adapter に分ける。

## CLAUDE.md と path rules を両ホストで共有する

Claude Code と Codex に共通する作業リポジトリの指示は、`CLAUDE.md` に置く。
Codex はユーザー設定の`project_doc_fallback_filenames = ["CLAUDE.md"]`で同じファイルを読む。
Codex 専用の追加指示が無ければ `AGENTS.md` は作らない。

Claude Code の `.claude/rules/*.md` と `paths` を、path rules の正の所在とする。
Codex が同じ rule を読むためのスクリプトと hook は、ユーザー環境の設定として dotfiles で管理する。
cc-marketplace には重複する rule 読み込み plugin を置かない。

## Skill を利用範囲に応じて配置する

複数のリポジトリで使う skill は plugin で配布する。
特定の作業リポジトリだけで使う skill は、その作業リポジトリに置く。
ユーザー共通の skill は `.claude/skills` を原本とし、`.agents/skills` から symlink する。
この symlink の作成は dotfiles のセットアップで扱う。

名前付き agent の内部処理だけに使う文書は、`skills/` に置かない。
`skills/` に置くと、親 agent が直接選択できる機能として一覧に表示されるためである。

## 名前付き agent のホスト別定義を生成する

名前付き agent は、共通の定義原本からホスト別の定義を生成する。

```text
plugin/
├── agent-src/
│   └── example.md          # 共通の定義原本
├── agents/
│   └── example.md          # Claude Code が読み込む agent
├── codex-agents/
│   └── example.toml        # Codex 用 adapter
└── agent-resources/
    └── ...                 # agent 内部だけで使う資料
```

`agents/` と `codex-agents/` は `agent-src/` から生成し、直接編集しない。
Claude Code は `agents/*.md` を plugin から直接読み込む。
Codex plugin は、現時点では名前付き agent を直接登録できない。
そのため、setup 処理で`codex-agents/*.toml`を Codex の agent 設定へ登録する。
setup は明示的に実行する。
setup が未実行であれば、adapter を登録する setup の実行をユーザーに促す。

plugin 外で定義している名前付き agent のうち、`op-review` と `meta-improvement` の共通化は保留する。

## Hook の共通処理とホスト別 adapter を分離する

ホスト固有のイベント名、入力 JSON、応答 JSON は adapter に閉じ込める。
判定処理を共有できても、いずれかのホストで動作を検証していなければ、
`Claude Code + Codex` と表示しない。

各 plugin の対応方針は次のとおり。

- `Claude Code only`: `claude-known-issues`、`plugin-update`、`version-check`
- `Claude Code + Codex` 化候補: `markdownlint`、`security-guards`

plugin 外で設定されている hook は現時点では移動しない。`Claude Code + Codex` 版を作るときに、
同じ処理を行う既存 hook を置き換えるか確認する。

## Requirements と setup の情報を README に記載する

外部 CLI、バイナリ、環境変数、追加設定を必要とする plugin は、README に次を記載する。

1. 対応ホスト
2. 必要なものと確認方法
3. setup skill の有無と実行方法
4. 未 setup 時の挙動
5. 更新・再 setup・削除方法
6. runtime state の保存先

当面は独自の requirements manifest を設けない。plugin の説明には requirements の要約を記載する。
requirements と setup の詳細は、README を正の所在とする。

setup が必要な plugin には、可能であれば setup skill を同梱する。
未 setup の状態で hook や skill が動いた場合は、環境を自動で変更せずに setup skill を案内する。

## 導入順序

1. Claude Code と Codex で共用する skill だけを持つ plugin で、Codex からの読み込みを検証する
2. dotfiles 管理の Codex hook で Claude Code の rule を読み込む
3. `markdownlint`、`security-guards` の順に hook を共通化する
4. plugin が配布する名前付き agent に Codex adapter を追加する

既存の Claude Code 環境は一括で移行しない。plugin 単位で対応ホストと検証結果を更新する。
