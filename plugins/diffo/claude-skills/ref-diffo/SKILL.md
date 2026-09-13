---
name: ref-diffo
description: diffo でレビューを受ける作業の前に必ず読む。`diffo poll` で指摘を受け取る、スレッドへ返信する、指摘を資料へ反映する、のどれかを始める時点が発動点で、返信を書き終えてからでは遅い。返信先の取り違え、指定文言の言い換え、ターミナルへの重複報告を止める。markdown プレビューの見た目を変えるユーザースタイルシートの所在も持つ。
user-invocable: false
---

# Claude Code で Diffo レビューを受ける

Claude Code の追跡可能なバックグラウンドタスクで Diffo の通知を受け取る。
返信前に[共通手順](../../references/review-protocol.md)を読む。

## poll を監視する

レビュー対象の repo で、Bash tool の `run_in_background: true` を使い、次の loop を起動する。
`diffo poll` は作業ディレクトリから対象レビューを特定する。`--port` は指定しない。

```bash
while :; do
  out=$(npx -y @diffohq/diffo poll 2>&1) || {
    printf '%s\n' "$out"
    printf '%s\n' '[poll が非ゼロで終了。loop を抜けた]'
    break
  }
  case "$out" in
    *'"status":"timeout"'*) continue ;;
    *)
      compact=$(printf '%s' "$out" | node "${CLAUDE_PLUGIN_ROOT}/bin/diffo-compact-payload.mjs" 2>/dev/null) || compact="$out"
      printf '%s\n' "$compact"
      break
      ;;
  esac
done
```

`timeout` のときだけ poll を再実行する。指摘が届いたとき、または poll が失敗したときは
出力を保持して終了する。`threads` 通知だけを短縮し、`finish`、`cleared`、
解析できない通知は元の payload を出す。開始元のセッションで完了通知を受け取るため、
`nohup`、shell の `&`、`disown` では起動しない。

payload の全 `threadIds` への返信後に、新しい追跡可能なバックグラウンドタスクを起動する。
スレッドの解決はレビュアーが行う。
