# github-pr

GitHub の Pull Request を作成・更新し、`@claude` 宛のレビューコメントに対応する。

## 動作

create: 既存 PR の有無で分岐する。無ければ作成フロー、あれば更新フローへ進む。
差分の規模でショート版とロング版のテンプレートを選び、本文・タイトルを生成する。
ロング版では PR の差分に行指定コメントを付ける。
`gh` CLI を優先し、利用できない場合は MCP ツールへフォールバックする。

address-review: PR に付いた `@claude` 宛のコメントを収集し、分類・グルーピングした上で
原則として 1 コメント 1 コミットで修正・push・返信する。
同じ行・隣接する行への指摘で、別々に直すと差分が衝突するものだけを同じコミットにまとめる。
対象は、本体コメントに `@claude` があるレビューのインラインコメント全部、
自身に `@claude` があるインラインコメント、`@claude` を含む conversation comment。
対応済みコメントは rocket リアクションでマークし、再実行時に除外する。

## skill

| skill | 概要 |
| --- | --- |
| create | PR の作成・更新。テンプレート選定から行指定コメントまで |
| address-review | `@claude` 宛レビューコメントへの対応。収集・分類から修正・返信・対応済みマークまで |

## references

create skill が必要に応じて `skills/create/references/` 配下の文書を Read する。
address-review も同じ配下の `shared/formatting-rules.md` と `shared/review-flows.md` を参照する。

| ファイル | 概要 |
| --- | --- |
| `generate-body.md` | 規模判定・テンプレート選択・タイトル生成・本文生成 |
| `update-pr.md` | 既存 PR の更新フロー |
| `post-line-comments.md` | 行指定コメントの付け方 |
| `short/template.md` `short/rules.md` | ショート版のテンプレートと規則 |
| `long/template.md` `long/rules.md` | ロング版のテンプレートと規則 |
| `shared/formatting-rules.md` | PR 参照の書き方など共通の記法 |
| `shared/external-citation.md` | 外部ソースの引用 |
| `shared/review-flows.md` | セルフレビューと他人レビューの流れ、マージの条件 |

## 前提

`gh` CLI が認証済みであること。未認証なら `gh auth login` を促す。

MCP フォールバックは `mcp__github__create_pull_request` を使う。
GitHub の MCP サーバーを設定していない環境では、このフォールバックは動作しない。
