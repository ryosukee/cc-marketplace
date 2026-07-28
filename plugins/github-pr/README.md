# github-pr

GitHub の Pull Request を作成・更新する。

## 動作

既存 PR の有無で分岐する。無ければ作成フロー、あれば更新フローへ進む。
差分の規模でショート版とロング版のテンプレートを選び、本文・タイトルを生成する。
ロング版では PR の差分に行指定コメントを付ける。

`gh` CLI を優先し、利用できない場合は MCP ツールへフォールバックする。

## skill

| skill | 概要 |
| --- | --- |
| create | PR の作成・更新。テンプレート選定から行指定コメントまで |

## references

skill が必要に応じて Read する。

| ファイル | 概要 |
| --- | --- |
| `generate-body.md` | 規模判定・テンプレート選択・タイトル生成・本文生成 |
| `update-pr.md` | 既存 PR の更新フロー |
| `post-line-comments.md` | 行指定コメントの付け方 |
| `short/template.md` `short/rules.md` | ショート版のテンプレートと規則 |
| `long/template.md` `long/rules.md` | ロング版のテンプレートと規則 |
| `shared/formatting-rules.md` | PR 参照の書き方など共通の記法 |
| `shared/external-citation.md` | 外部ソースの引用 |

## 前提

`gh` CLI が認証済みであること。未認証なら `gh auth login` を促す。

MCP フォールバックは `mcp__github__create_pull_request` を使う。
GitHub の MCP サーバーを設定していない環境では、このフォールバックは動作しない。
