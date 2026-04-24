---
name: cache-keepalive
description: >-
  prompt cache (extended cache, TTL 1h) の keepalive タイマーを管理する。
  最終活動時刻を元に cache 切れ 5 分前を狙って keepalive を発火する。
  "cache-keepalive" "キャッシュキープアライブ" "keep cache alive" 等で発動。
user-invocable: true
allowed-tools: ScheduleWakeup, CronList, CronDelete, Bash
argument-hint: "[on|off|status|list]"
---

# cache-keepalive

prompt cache (extended cache, TTL 1h) が expire する前に keepalive を発火し、キャッシュを維持する。
最終活動時刻から逆算し、cache 切れ 5 分前を狙う動的タイマー方式。

固定間隔 cron ではなく ScheduleWakeup のワンタイムタイマーを使い、
発火のたびに JSONL の mtime を元に次回タイマーを再計算する。
アクティブ時は発火しない。

## 定数

- TTL: 3600 秒 (1 時間)
- マージン: 300 秒 (5 分)
- TARGET: 3300 秒 (55 分。TTL - マージン)

## 引数

| 値 | 動作 |
| --- | --- |
| (なし) / `on` | keepalive タイマーを開始 |
| `off` | タイマーを停止 |
| `status` / `state` / `list` | 現在の状態を表示 |

## 実行手順

### 1. 引数の判定

`<command-args>` を確認する。

- `off` → 停止フローへ
- `status` / `state` / `list` → 状態表示フローへ
- それ以外 (空 / `on`) → 開始フローへ

### 2. 開始フロー (on)

1. CronList を呼び、prompt に `[cache-keepalive]` を含むジョブが既にあるか確認する
2. 既にある場合: 「cache-keepalive は既に有効です (ID: {id})」と報告して終了
3. JSONL パスを特定し、初回タイマーを登録する (後述の「タイマー登録手順」を実行)
4. 「cache-keepalive を有効にしました (ID: {id})」と報告

### 3. 停止フロー (off)

1. CronList を呼び、prompt に `[cache-keepalive]` を含むジョブを探す
2. ある場合: CronDelete(id) で削除し、「cache-keepalive を停止しました (ID: {id})」と報告
3. ない場合: 「現在有効な cache-keepalive はありません」と報告

### 4. 状態表示フロー (status)

1. CronList を呼び、prompt に `[cache-keepalive]` を含むジョブを探す
2. ある場合: 「cache-keepalive: 有効 (ID: {id})」と報告
3. ない場合: 「cache-keepalive: 無効」と報告

## タイマー登録手順

開始フローと keepalive 発火時の両方で使う共通手順。

### JSONL パスの特定

Bash で以下を実行してセッション JSONL のパスを取得する:

```bash
find ~/.claude -name "*.jsonl" -path "*$CLAUDE_SESSION_ID*" 2>/dev/null | head -1
```

パスが見つからない場合はエラー報告して終了。

### 経過秒数の算出

```bash
T=$(stat -f %m {JSONL_PATH}); N=$(date +%s); echo $((N - T))
```

結果を `elapsed` とする。

### 遅延の計算

```
delay = max(60, 3300 - elapsed)
```

- elapsed が小さい (直近に活動あり) → delay が大きい (次のチェックは遠い)
- elapsed が大きい (長時間アイドル) → delay が小さい (すぐチェック)
- elapsed >= 3300 → delay = 60 (最小値。次の発火で keepalive する)

### ScheduleWakeup の呼び出し

以下のパラメータで ScheduleWakeup を呼ぶ。
`{JSONL_PATH}` は特定した実際のパスに置換すること:

- delaySeconds: 算出した delay
- reason: `cache keepalive ({delay}s 後にチェック)`
- prompt:

```
[cache-keepalive] keepalive timer.
1. Bash: T=$(stat -f %m {JSONL_PATH}); N=$(date +%s); E=$((N-T)); echo $E
2. E >= 3300 → OK と返答し、ScheduleWakeup(delaySeconds=3300, reason="cache keepalive fired", prompt=<このプロンプト全文>)
3. E < 3300 → 返答せず、ScheduleWakeup(delaySeconds=max(60,3300-E), reason="cache keepalive reschedule", prompt=<このプロンプト全文>)
```

## keepalive 発火時の応答

`[cache-keepalive]` タグ付きプロンプトが発火した場合、
プロンプト内の指示に従う。keepalive 対象なら OK とだけ返答する。
それ以外の作業は一切しない。
