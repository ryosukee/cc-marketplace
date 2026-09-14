---
name: handover
user-invocable: true
description: >-
  次セッションへの引き継ぎ資料を確定する。draft の最終化、
  タスク分類、検証、todo/ への移動を行う。「引き継ぎ」「handover」で発動。
---

# handover

`${CLAUDE_PLUGIN_ROOT}/references/handover.md` を Read し、記載された手順に従う。
そこから指定される資料も `${CLAUDE_PLUGIN_ROOT}/references/` から読む。
検査には `${CLAUDE_PLUGIN_ROOT}/scripts/check-handover.mjs` を使う。

意味レビューでは同梱の `handover-reviewer` agent を一つ起動し、対象ファイルの
絶対パス、機械検査 JSON、参照資料の所在を渡す。この agent は
`${CLAUDE_PLUGIN_ROOT}/references/handover-review.md` を読む。
次回の開始方法は `/session:start` と案内する。
`handover.md` を読めない場合は、handover を確定・移動しない。
