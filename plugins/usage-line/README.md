# usage-line

コンテキスト残量とレート制限残量を 1 行で出す。

```text
ctx 30% | 5h 87% 残17m→13:50 | 週 19% 残5h 27m→7/27 19:00 | 今日 6/25pp
```

`/context` や `/usage` は出力が長い。モバイルから確認するときや、
作業の合間に余力だけ見たいときの代わりになる。

## 要セットアップ

この plugin は**データを自分では集めない**。statusline が書き出した JSON を読む。

理由: コンテキスト使用率とレート制限は statusline の stdin JSON にしか来ない。
hook の stdin JSON には含まれず、plugin は statusLine を宣言できないため、
plugin 単独では取得経路がない。

### 1. statusline から JSON を書き出す

`~/.claude/settings.json` の `statusLine` が指すスクリプトに、以下を追加する。
`$input` は Claude Code から stdin で受け取った JSON。

```bash
STATUS_DIR="${CLAUDE_USAGE_LINE_DIR:-/tmp/claude-status}"
mkdir -p "$STATUS_DIR"
session_id=$(jq -r '.session_id // ""' <<< "$input")
if [ -n "$session_id" ]; then
  TMPFILE="$STATUS_DIR/$session_id.json.tmp.$$"
  jq '{
    contextWindowPercent: .context_window.used_percentage,
    sessionUsagePercent:  .rate_limits.five_hour.used_percentage,
    weeklyUsagePercent:   .rate_limits.seven_day.used_percentage
  }' <<< "$input" > "$TMPFILE" && mv "$TMPFILE" "$STATUS_DIR/$session_id.json"
fi
```

読み取り中の不整合を避けるため、tmp ファイル経由で atomic に置き換える。

### 2. 任意フィールド

以下があれば表示に使う。無ければ `?` になる。

| フィールド | 内容 |
| --- | --- |
| `sessionReset` / `sessionRemaining` | 5 時間枠のリセット時刻と残り時間 |
| `weeklyReset` / `weeklyRemaining` | 週枠のリセット日時と残り時間 |
| `todayUsed` / `weeklyPerDay` | 今日の消費 pp と 1 日あたり予算 pp |

### 3. 置き場を変える場合

既定は `/tmp/claude-status`。変えるなら `settings.json` の `env` に
`CLAUDE_USAGE_LINE_DIR` を絶対パスで置く。書き出し側と読み出し側の両方に効く。

## 制約

- **Remote Control のセッションでのみ動く**。クラウドセッションには statusline が無い
- **値の鮮度は statusline の実行に依存する**。ターミナルを触っていない間は更新されない。
  2 分を超えた値には「N 分前の値」が付く
- **session_id が取れないと動かない**。`CLAUDE_CODE_SESSION_ID` を使う。
  未設定のときは最新ファイルへフォールバックしない。別セッションの残量を自分のものとして
  出すほうが、出さないより悪いため

## skill

| skill | 概要 |
| --- | --- |
| usage-line | 残量を 1 行で出す |

## scripts

plugin 内部スクリプト。skill が呼ぶ。外部公開 I/F ではない。

| スクリプト | 概要 | Exit codes |
| --- | --- | --- |
| `scripts/render-usage-line.sh` | JSON を読んで 1 行に整形 | 0=成功 / 1=該当なし / 2=前提条件エラー |
