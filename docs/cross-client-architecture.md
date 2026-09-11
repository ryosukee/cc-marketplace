# Claude Code / Codex 共通化方針

cc-marketplace は、複数の作業リポジトリで再利用する AI エージェント拡張を管理する。
対象は skills、名前付き agents、hooks、それらが呼び出すスクリプト、既定設定、
requirements と setup 手順である。

ユーザー環境へ置く設定ファイル、CLI の導入一覧、symlink は dotfiles で管理する。
業務知識、ビルドコマンド、ディレクトリ固有の執筆規約は各作業リポジトリで管理する。

## 対応ホストの分類

各 plugin は README に次のいずれかを明記する。

| 分類 | 意味 |
| --- | --- |
| shared | Claude Code と Codex の両方で動作を検証する |
| Claude Code only | Claude Code 固有の API、状態、イベントに依存する |
| Codex only | Codex 固有の API、設定、イベントに依存する |

両ホストで似た処理を提供する場合は、判定ロジックを共通のスクリプトに置き、
イベント入力と結果の返し方だけを host adapter に分ける。

## Instructions と path rules

作業リポジトリの共通知識は `CLAUDE.md` に置く。Codex はユーザー設定の
`project_doc_fallback_filenames = ["CLAUDE.md"]` で同じファイルを読む。
Codex 専用の追加指示が無ければ `AGENTS.md` は作らない。

Claude Code の `.claude/rules/*.md` と `paths` はそのまま正とする。Codex では
Codex 専用の path-rules plugin が同じ rule を解釈し、対象ファイルに一致した
指示だけをセッションへ渡す。

## Skills

複数リポジトリで使う skill は plugin で配布する。作業リポジトリだけで使う
skill は作業リポジトリに置く。

名前付き agent の内部処理だけに使う文書を `skills/` に置かない。`skills/` に
置くと、親 agent が直接選択できる機能として一覧に出るためである。

## Plugin agents

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
Claude Code は `agents/*.md` を plugin から直接読み込む。Codex plugin は現時点で
名前付き agent を直接登録できないため、setup が `codex-agents/*.toml` を Codex の
agent 設定へ登録する。setup 自体は明示的に実行し、未実行時は登録を促す。

plugin 外にある `op-review` と `meta-improvement` の共通化は保留する。

## Hooks

host 固有のイベント名、入力 JSON、応答 JSON は adapter に閉じ込める。
判定処理を共有できても、片方の host で未検証なら shared と表示しない。

現在の整理は次のとおり。

- Claude Code only: `claude-known-issues`、`plugin-update`、`version-check`
- Codex only: path rules hook
- shared 化候補: `markdownlint`、`security-guards`

plugin 外で設定されている hook は直ちに移動しない。shared 版を作るときに、
同じ処理を行う既存 hook を置き換えるか確認する。

## Requirements と setup

外部 CLI、バイナリ、環境変数、追加設定が必要な plugin は README に次を記載する。

1. 対応ホスト
2. 必要なものと確認方法
3. setup skill の有無と実行方法
4. 未 setup 時の挙動
5. 更新・再 setup・削除方法
6. runtime state の保存先

当面は独自の requirements manifest を設けない。plugin の説明には短い要約を置き、
完全な手順は README を正とする。

setup が必要な plugin は、可能なら setup skill を同梱する。未 setup の状態で
hook や skill が動いた場合は、環境を勝手に変更せず setup skill を案内する。

## 導入順序

1. 共通 skill だけを持つ plugin で Codex からの読み込みを検証する
2. Codex 専用の path-rules plugin を実装する
3. `markdownlint`、`security-guards` の順に hook を共通化する
4. plugin agents に Codex adapter を追加する

既存の Claude Code 環境を一括移行せず、plugin 単位で対応ホストと検証結果を更新する。
