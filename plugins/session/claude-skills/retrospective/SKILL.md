---
name: retrospective
user-invocable: true
description: >-
  セッションの学びを振り返り、rules/skills/agents/CLAUDE.md の更新を検討する。
  承認された内容だけを反映する。「振り返り」「学びを明文化」「codify」で発動。
---

# retrospective

`${CLAUDE_PLUGIN_ROOT}/references/retrospective.md` を Read し、記載された手順に従う。
そこから指定される `draft-tasks.md` も `${CLAUDE_PLUGIN_ROOT}/references/` から読む。

候補が 1〜2 件なら一件ずつテキストで対話する。3 件以上なら
`html-communication` skill で一枚にまとめ、一項目を一設問として独立させる。
`retrospective.md` を読めない場合は、振り返りを完了したと報告しない。
