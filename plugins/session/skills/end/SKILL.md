---
name: end
description: >-
  セッション終了のオーケストレーター。
  debrief → retrospective → handover を順に実行する。
  "セッション終了"、"session end"、"今日はここまで"、
  "セッション閉じて" 等で発動。
---

# end

debrief → retrospective → handover を順に実行するオーケストレーター。
全工程を確認なしで連続実行する。

## フロー

### 1. debrief の実行

`/session:debrief` を呼び出す。

棚卸し結果が draft に書き込まれ、ユーザーに報告される。
警告への対応が必要な場合はここで解決する。

### 2. retrospective の実行

`/session:retrospective` を呼び出す。

学びが rules/skills/CLAUDE.md に codify される。

### 3. handover の実行

`/session:handover` を呼び出す。

draft が確定され、todo/ に移動される。
handover-reviewer agent が妥当性を検証する。

### 4. 完了報告

全工程の完了後、以下を報告する。
各 skill が既に報告した情報は繰り返さず、全体のサマリに絞る。

- 実行した工程の一覧
- retrospective の codify 結果
- handover のファイルパス (handover ステップ 7 で報告済みなら省略)
- 次セッションの開始方法 (`/session:start`)
