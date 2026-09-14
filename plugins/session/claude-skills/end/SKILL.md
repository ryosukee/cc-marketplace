---
name: end
user-invocable: true
description: >-
  セッション終了時に debrief → retrospective → handover を順に実行する。
  「セッション終了」「session end」「今日はここまで」で発動。
---

# end

`${CLAUDE_PLUGIN_ROOT}/references/end.md` を Read し、記載された手順に従う。
各工程は `/session:debrief`、`/session:retrospective`、`/session:handover`
の順に呼び出す。次回の開始方法は `/session:start` と案内する。
`end.md` を読めない場合は、セッション終了を完了したと報告しない。
