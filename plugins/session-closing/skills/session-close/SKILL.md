---
name: session-close
description: >-
  セッション終了のオーケストレーター。
  retrospective (学びの codify) → handover (状態引き継ぎ) を順に実行する。
  "セッション終了"、"session close"、"session end"、
  "今日はここまで"、"セッション閉じて"
  等で発動。
---

# session-close

retrospective と handover を順に実行するオーケストレーター。
セッション終了時にこれを呼べば、学びの codify から引き継ぎ資料の生成まで一括で行える。

## 手順

### 1. retrospective の実行

`/session-closing:retrospective` を呼び出す。

retrospective が完了すると:

- 学びが rules/skills/CLAUDE.md に codify され、1 commit にまとまる
- やり残し・次アクション提案・TODO/ideas がユーザーに提示される

### 2. handover の実行

retrospective 完了後、`/session-closing:handover` を呼び出す。

handover は独立してセッション状態を棚卸しし、HANDOVER-{slug}.md を生成する。
retrospective の出力に依存しない。

### 3. 完了報告

両 skill の完了後、以下を報告する:

- retrospective の codify commit の要約
- handover のファイル名と再開用の prompt

## 注意事項

- retrospective が完了してから handover を開始する。順序を守る
- retrospective でユーザーが全項目を skip した場合でも handover は実行する
- ユーザーが途中で handover 不要と判断した場合は retrospective のみで終了してよい
