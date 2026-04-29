---
name: cache-keepalive
description: >-
  prompt cache (extended cache, TTL 1h) の keepalive を管理する。
  Monitor でバックグラウンド監視し、アイドル時のみ keepalive を発火する。
  "cache-keepalive" "キャッシュキープアライブ" "keep cache alive" 等で発動。
user-invocable: true
allowed-tools: Monitor, Bash
argument-hint: "[on|off|status|list]"
---

# cache-keepalive

## 目的

prompt cache の extended cache (TTL 1h) が expire すると全 context が cache miss し、
input トークンが急騰する。
expire 前に軽量プロンプトを発火して TTL を延長することでこれを防ぐ。

## 仕組み

Monitor (persistent) でバックグラウンドスクリプトを動かす。

スクリプトはセッション JSONL の mtime を監視し、
最終活動から 3000 秒 (50 分) 以上経過した時だけ stdout に 1 行出力する。
Monitor はこの行を Claude への通知として配信し、Claude が OK と応答することで cache が refresh される。

- スクリプトの stat 実行は bash プロセスなので JSONL mtime を更新しない
- JSONL mtime は Claude の API コール (ユーザー操作 or keepalive 応答) でのみ更新される
- アクティブ時はスクリプトが sleep するだけで、会話ターンは一切発生しない

## セッション JSONL

このセッションの JSONL パス:

!`find ~/.claude/projects -name "${CLAUDE_SESSION_ID}.jsonl" 2>/dev/null | head -1`

## サブコマンド

`<command-args>` で分岐する。

### on (引数なし / `on`)

1. Bash で Monitor プロセスを探す: `pgrep -f '[c]ache-keepalive'`
2. PID が見つかる → 「cache-keepalive は既に有効です」で終了
3. セッション JSONL セクションのパスが空なら、エラー報告して終了
4. Monitor を起動する (詳細は「Monitor パラメータ」参照)
5. 「cache-keepalive を有効にしました」と報告

### off

1. Bash で Monitor プロセスを探す: `pgrep -f '[c]ache-keepalive'`
2. PID が見つかる → `kill` で停止し「cache-keepalive を停止しました」と報告
3. 見つからない → 「現在有効な cache-keepalive はありません」と報告

### status / state / list

1. Bash で Monitor プロセスを探す: `pgrep -f '[c]ache-keepalive'`
2. PID が見つかる → 「cache-keepalive: 有効」と報告
3. 見つからない → 「cache-keepalive: 無効」と報告

## Monitor パラメータ

セッション JSONL セクションで解決済みのパスを `{JSONL}` として埋め込む。

- description: `cache-keepalive monitor`
- persistent: `true`
- timeout_ms: `300000` (persistent=true なので無視される)
- command:

```bash
while true; do
  T=$(stat -f %m "{JSONL}" 2>/dev/null) || { sleep 60; continue; }
  N=$(date +%s)
  E=$((N - T))
  if [ "$E" -ge 3000 ]; then
    echo "[cache-keepalive] キャッシュキープアライブです。OK とだけ返答してください。"
    sleep 3000
  else
    sleep $((3000 - E))
  fi
done
```

スクリプトの動き:

- JSONL の mtime から経過秒数を算出
- 3000 秒以上経過 → 1 行出力 (Claude への keepalive 通知)、その後 3000 秒 sleep
- 3000 秒未満 → `(3000 - elapsed)` 秒 sleep して再チェック
- stat 失敗時は 60 秒待って retry

## keepalive 通知への応答

Monitor から `[cache-keepalive]` タグ付きの通知が届いた場合、
OK とだけ返答する。それ以外の作業は一切しない。
