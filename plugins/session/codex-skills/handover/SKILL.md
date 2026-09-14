---
name: handover
user-invocable: true
description: 引き継ぎ draft を確定し、次セッション用の資料を検証して todo に移す。「引き継ぎ」「handover」で使う。
---

# 引き継ぎ資料を確定する

この SKILL.md の所在から二階層上の plugin root を特定する。
`references/handover.md` を読み、記載された手順に従う。
そこから指定される資料も plugin root の `references/` から読む。
検査には plugin root の `scripts/check-handover.mjs` を使う。

意味レビューでは利用可能な子 agent を一つ起動し、編集を禁止して、
対象ファイルの絶対パス、機械検査 JSON、参照資料の所在、
`references/handover-review.md` の絶対パスを渡す。
子 agent が利用できなければ `handover.md` に従って省略を報告する。
次回の開始方法は `start` skill と案内する。
`handover.md` を読めない場合は、handover を確定・移動しない。
