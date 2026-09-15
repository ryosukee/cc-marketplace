# Plugin 設計原則

Claude Code と Codex に共通する plugin 設計原則を定める。

Claude Code と Codex の両対応を設計するときは、
[両対応の設計方針](../../docs/cross-client-architecture.md)を読む。

## Claude Code 固有の規範

Claude Code 対応の plugin を扱うときは
[Claude Code 用の規範](./plugin-design/references/claude-code.md)を読む。

## README に導入・運用情報を記載する

README に記載する情報と requirements の管理方法は、次のとおり。

- 対応 CodingAgent
    - `Claude Code + Codex`、`Claude Code only`、`Codex only` のいずれか
    - `Claude Code + Codex` と分類するならば、両方で動作を検証する
- requirements 情報
    - その plugin が依存する外部 CLI、バイナリ、環境変数、追加設定
    - 依存の確認方法、setup の方法、未 setup 時の挙動
    - hook や skill は、実行時に未 setup を検出してもユーザーの環境を自動変更せず、
      README に記載した setup 手順を案内する
    - 当面は独自の requirements manifest を作らない
- 更新方法と削除方法
- state を保存する場合は、その保存先

## 名前付き agent の定義・実装方法

名前付き agent を使う機能の両対応方式は
[共通化方針](../../docs/cross-client-architecture.md#名前付き-agent-を使う機能の両対応) に記載する。
名前付き agent 定義そのものを両方へ配布する方式は未決定。

名前付き agent からのみ実行させる処理は、`skills/` に置かない。
`skills/` に置くと、親 agent の skill 一覧に公開される。
親 agent から直接実行できるため、独立コンテキストや agent 固有の権限制限を迂回できてしまう。

## Plugin 自己完結

plugin は skills / hooks / agents で自己完結する。rule の存在を暗黙前提にしない。
前提となる振る舞いは SKILL.md や hook のドキュメント内に組み込む。
rule は plugin の外で管理し、plugin 内の `rules/` がインストール先で
自動適用されることを前提にしない。

- rule は user global で、install したユーザー全員が同じ rule を持つとは限らない
- rule に依存する plugin は、rule を変更したときに skill の挙動が予期せず変わる
- rule と plugin で source of truth が分散する

## 単機能 plugin

- 1 つの目的に対して 1 plugin
- 関連する skills / hooks は同一 plugin 内で束ねる (internal state を共有できる)
- domain が異なるなら分ける

## Internal 隔離 (kernel パターン) — deprecated

新しい plugin でこのパターンを採らない。適用しているのは version-check だけで、
そのまま残す。state の置き場は
[両対応の設計方針](../../docs/cross-client-architecture.md#環境変数と-state-の置き場)に従う。

`internal/` は plugin の実体の下にあり、plugin の実体は版ごとのディレクトリに入る。
更新すると前の版の `internal/` は参照されなくなるため、更新をまたいで残す state を置けない。

以下はそのパターンの記述で、version-check を読むときの参照として残す。

状態を永続化する plugin は `internal/` に state を置き、その state に触れるスクリプトを
plugin 内に閉じ込める。他 plugin や外部から `internal/` を参照させない。

スクリプトは役割で配置を分ける。「外部公開 API」層は作らない。
plugin の外から呼ばれる消費者 (外部 CLI・他 plugin) は存在しないため、
`scripts/api/` のような公開 I/F の名前付けはしない。

```text
my-plugin/
├── internal/            # 永続化された状態。plugin の外から参照しない
├── scripts/
│   ├── hooks/           # hook 定義から起動する実装
│   ├── lib/             # source 用の共通ヘルパ (状態解決・移行など)
│   └── *.sh             # skill / hook が invoke する plugin 内エントリスクリプト
└── skills/{skill}/
    └── scripts/         # その skill だけが使うスクリプト
```

- skill / hook は `scripts/` 配下のスクリプト経由で state に触れ、
  `internal/` のファイル形式を SKILL.md (markdown) に直書きしない
- 複数 skill / hook が共有するスクリプトは `scripts/`、
  単一 skill 専用は `skills/{skill}/scripts/` に置く

## 宣言した設定は発火させるまで未検証

hook などの宣言ファイルは、書いた時点では一度も実行されない。
書き終えた状態を「動く」と扱わず、実際に発火させるか、同じ入力を手で再現して
確認するまで完了としない。

- 宣言ファイルの `command` に変数を書いた場合、その文字列が実行前に置換されるか、
  スクリプトの環境変数として渡るかを実際に確認する。hook で確認した結果を
  monitor など別の宣言に流用しない。
- すぐに発火できない宣言 (再起動が要る等) は、渡るはずの変数を手で与えて
  スクリプト単体を実行する
