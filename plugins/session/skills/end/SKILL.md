---
name: end
description: >-
  セッション終了のオーケストレーター。
  debrief → retrospective → handover を順に実行する。
  "セッション終了"、"session end"、"今日はここまで"、
  "セッション閉じて" 等で発動。
---

# end

debrief、retrospective、handover を順に実行するオーケストレーター。
各工程の間にユーザー確認を入れ、スキップ可能にする。

## フロー

### 1. debrief の実行

`/session:debrief` を呼び出す。

棚卸し結果が draft に書き込まれ、ユーザーに報告される。
警告への対応が必要な場合はここで解決する。

### 2. retrospective への確認

debrief 完了後、ユーザーに確認する:

- retrospective (学びの codify) に進むか
- スキップして handover に進むか

### 3. retrospective の実行

ユーザーが承認した場合、`/session:retrospective` を呼び出す。

学びが rules/skills/CLAUDE.md に codify され、1 commit にまとまる。

### 4. handover への確認

retrospective 完了後 (またはスキップ後)、ユーザーに確認する:

- handover (引き継ぎ資料の確定) に進むか
- スキップするか (セッション自体は終わるが引き継ぎ資料を残さない)

### 5. handover の実行

ユーザーが承認した場合、`/session:handover` を呼び出す。

draft が確定され、todo/ に移動される。
handover-reviewer agent が妥当性を検証する。

### 6. 完了報告

全工程の完了後、以下を報告する。
各 skill が既に報告した情報は繰り返さず、全体のサマリに絞る。

- 実行した工程の一覧 (スキップした工程があればその旨も)
- retrospective の codify commit (実行した場合)
- handover のファイルパス (実行した場合、handover ステップ 7 で報告済みなら省略)
- 次セッションの開始方法 (`/session:start`)
