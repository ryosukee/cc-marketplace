---
name: start
user-invocable: true
description: >-
  セッション開始。前回の引き継ぎ資料を読み込み、コンテキストを復元し、
  今回の作業を提案する。「続きから」「今日の作業」「session start」「セッション開始」で発動。
---

# start

`${CLAUDE_PLUGIN_ROOT}/references/start.md` を Read し、記載された手順に従う。
そこから指定される資料も `${CLAUDE_PLUGIN_ROOT}/references/` から読む。
`start.md` を読めない場合は、そのことを報告し、引き継ぎ資料を移動しない。
