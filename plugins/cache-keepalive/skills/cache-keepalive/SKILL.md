---
name: cache-keepalive
description: >-
  prompt cache (extended cache, TTL 1h) の keepalive loop を管理する。
  45分間隔で軽量プロンプトを発火し cache miss による input トークン急騰を防ぐ。
  "cache-keepalive" "キャッシュキープアライブ" "keep cache alive" 等で発動。
user-invocable: true
allowed-tools: CronCreate, CronList, CronDelete
argument-hint: "[on|off|status]"
---

# cache-keepalive

prompt cache (extended cache, TTL 1h) が expire する前に keepalive プロンプトを自動発火し、キャッシュを維持する。

## 引数

| 値 | 動作 |
| --- | --- |
| (なし) / `on` | keepalive loop を開始 |
| `off` | keepalive loop を停止 |
| `status` / `state` | 現在の状態を表示 |

## 実行手順

### 1. 引数の判定

`<command-args>` を確認する。

- `off` → 停止フローへ
- `status` / `state` → 状態表示フローへ
- それ以外 (空 / `on`) → 開始フローへ

### 2. 開始フロー (`on`)

1. CronList を呼び、prompt に `[cache-keepalive]` を含むジョブが既にあるか確認する
2. **既にある場合**: 「cache-keepalive は既に有効です (ID: {id}, 45分間隔)」と報告して終了
3. **ない場合**: CronCreate を呼ぶ:
   - cron: `*/45 * * * *`
   - prompt: `[cache-keepalive] キャッシュキープアライブです。何も作業はせずに OK とだけ返答してください。`
   - recurring: true
4. 「cache-keepalive を有効にしました (ID: {id}, 45分間隔)。7日後に自動失効します。」と報告

### 3. 停止フロー (`off`)

1. CronList を呼び、prompt に `[cache-keepalive]` を含むジョブを探す
2. **ある場合**: CronDelete(id) で削除し、「cache-keepalive を停止しました (ID: {id})」と報告
3. **ない場合**: 「現在有効な cache-keepalive はありません」と報告

### 4. 状態表示フロー (`status`)

1. CronList を呼び、prompt に `[cache-keepalive]` を含むジョブを探す
2. **ある場合**: 「cache-keepalive: 有効 (ID: {id}, 45分間隔)」と報告
3. **ない場合**: 「cache-keepalive: 無効」と報告

## keepalive 発火時の応答

keepalive プロンプトが発火した場合、`OK` とだけ返答する。それ以外の作業は一切しない。
