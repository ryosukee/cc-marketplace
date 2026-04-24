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

## 目的

prompt cache の extended cache (TTL 1h) が expire すると全 context が cache miss し、
input トークンが急騰する。
expire 前に軽量プロンプトを発火して TTL を延長することでこれを防ぐ。

## 仕組み

ScheduleWakeup のワンタイムタイマーを使う。

- 「最終活動から 55 分後」(cache 切れ 5 分前) に発火することを目標とする
- 発火時に JSONL の mtime で最終活動時刻を確認し、keepalive が必要か判断する
- 判断後、次回タイマーを再登録することでループを形成する
- 固定間隔 cron ではないので、アクティブ時に無駄な発火がない

最終活動からの経過秒数を `elapsed` とすると:

- `elapsed >= 3300` (55 分以上アイドル) → keepalive 発火。次回タイマーは 3300 秒後
- `elapsed < 3300` (まだ余裕あり) → keepalive 不要。次回タイマーは `(3300 - elapsed)` 秒後
    - つまり「最終活動から 55 分」の時点を狙って再スケジュールする

## JSONL パスの特定

セッション JSONL の mtime を最終活動時刻の代理指標として使う。

```bash
find ~/.claude -name "*.jsonl" -path "*$CLAUDE_SESSION_ID*" 2>/dev/null | head -1
```

## 経過秒数の算出 (macOS)

```bash
T=$(stat -f %m {JSONL_PATH}); N=$(date +%s); echo $((N - T))
```

## サブコマンド

`<command-args>` で分岐する。

### on (引数なし / `on`)

1. CronList で `[cache-keepalive]` を含むジョブを探す
2. 既にある → 「cache-keepalive は既に有効です (ID: {id})」で終了
3. JSONL パスを特定する (見つからなければエラー報告して終了)
4. 経過秒数を算出し、`delay = max(60, 3300 - elapsed)` を計算する
5. ScheduleWakeup を呼ぶ (詳細は「ScheduleWakeup パラメータ」参照)
6. 「cache-keepalive を有効にしました (ID: {id})」と報告

### off

1. CronList で `[cache-keepalive]` を含むジョブを探す
2. ある → CronDelete(id) し「cache-keepalive を停止しました (ID: {id})」と報告
3. ない → 「現在有効な cache-keepalive はありません」と報告

### status / state / list

1. CronList で `[cache-keepalive]` を含むジョブを探す
2. ある → 「cache-keepalive: 有効 (ID: {id})」と報告
3. ない → 「cache-keepalive: 無効」と報告

## ScheduleWakeup パラメータ

`{JSONL_PATH}` は特定した実際のパスに置換する。

- delaySeconds: 算出した delay
- reason: `cache keepalive ({delay}s 後にチェック)`
- prompt (以下の文字列をそのまま使う):

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
